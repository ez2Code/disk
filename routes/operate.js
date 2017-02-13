var express = require('express');
var router = express.Router();
var fs = require("fs");
var multiparty = require('multiparty');
var dao = require('../dao/dao');
var config = require('../config/config');

router.get('/download/*',function(req,res){
    var req_path = req.path;
    if(req.session.user){
        var filepath = config.path+'/share/data/'+req.session.user+'/data' + req_path.substr(9);
    }else{
        res.redirect('/account/login');
        return;
    }

    fs.exists(filepath, function(exists){
        if(exists){
            fs.stat(filepath, function(err, stats){
                if(err){
                    res.writeHead(500, {'Content-Type' : 'text/html;charset=utf8'});
                    res.end('<div styel="color:black;font-size:22px;">server error</div>');
                }else{
                    if(stats.isFile()){
                        res.download(filepath);
                    }else{
                        res.writeHead(403, {'Content-Type' : 'text/html;charset=utf8'});
                        res.end("not a file!");
                    }
                }
            });
        }else{
            res.writeHead(404, {'Content-Type' : 'text/html;charset=utf8'});
            res.end('<div styel="color:black;font-size:22px;">404 not found</div>');
        }
    });
});

router.post('/upload',function(req,res,next){
    var form = new multiparty.Form({uploadDir: config.path+'/share/tmp/'});

    form.parse(req, function(err, fields, files) {
        var filesTmp = JSON.stringify(files,null,2);
        if(err){
            console.log('parse error: ' + err);
            res.json({'success':false,'msg':err});
        } else {
            var inputFile = files.resource[0];
            var uploadedPath = inputFile.path;
            //重命名为真实文件名
            var path = config.path+'/share/data/' + req.session.user+'/data'+req.session.lastReq;
            fs.rename(uploadedPath, path+'/'+inputFile.originalFilename, function(err) {
                if(err){
                    console.log('rename error: ' + err);
                }
            });
            res.json({'success':true});
        }
    });
});
router.post('/delete',function(req,res){
    var req_path = req.body.path;
    var filepath = config.path+'/share/data/' + req.session.user+'/data';
    var exec = require('child_process').exec;

    //linux下删除
    exec('rm -rf '+ filepath + req_path, function(err){
        if(err){
            console.error('fail to delete:'+err);
            res.json({"success":false});
        }else{
            res.json({"success":true});
        }
    });
});

router.get('/createDir',function(req,res){
    var path = config.path+'/share/data/' + req.session.user+'/data'+req.session.lastReq;
    var targetDir = path+'/'+req.query.targetDir;
    fs.exists(targetDir,function(exist){
        if(!exist){
            fs.mkdir(targetDir,function(err){
                if(err){
                    res.json({'success':false,'message':err.message});
                }else{
                    res.json({'success':true});
                }
            });
        }else{
            res.json({'success':false,'message':'dir exists!'});
        }
    });
});

router.post('/generateShare',function(req,res){
    var targetFile = req.body.path;
    var user_id = req.session.user;
    var data = {'user_id':user_id,'path':targetFile};
    dao.generateShare(data,function(result){
        if(result=='-1'){
            res.json({'success':false,'msg':'internal error,please try again'});
        }else{
            res.json({'success':true,'code':result});
        }
    })
});


module.exports = router;
