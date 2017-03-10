var express = require('express');
var router = express.Router();
var fs = require("fs");
var dao = require('../dao/dao');
var config = require('../config/config');

router.get('/',function(req,res){
    var filepath = './views/share.html';
    var file = fs.createReadStream(filepath);
    res.writeHead(200);
    file.pipe(res);
});

router.post('/initShare',function(req,res){
    var code = req.body.code;
    dao.indexCode({'code':code},function(result){
        if (result=='-1') {
            res.json({'success':false,'msg':'internal error,please try again'});
        }else if(result=='1'){
            res.json({'success':false,'message':'not exists!'});
        }else{
            var filepath = config.path+'/disk/' + result.share_user+'/data'+result.path;
            fs.stat(filepath, function(err, stats){
                if(err){
                    res.json({'success':false,'message':'internal error,please try again'});
                }else{
                    var route = filepath.substr(0,filepath.lastIndexOf('/'));
                    var path = filepath.substr(filepath.lastIndexOf('/'));
                    //记录下分享的根目录
                    req.session.route = route;
                    req.session.top = path;
                    var data = {'success':true,'sharer':result.share_user,'path':path,'name':path.substr(1)};
                    if(stats.isFile()){
                        data.isFile = true;
                    }else{
                        data.isFile = false;
                    }
                    res.json(data);
                }
            });
        }
    });
});

router.post('/',function(req,res){
    var req_path = req.body.path;
    //请求路径为''时，表示后退
    if(req_path==''){
        req_path = req.session.lastReq;
        req_path = req_path.substr(0,req_path.lastIndexOf('/'));
    }
    //记录本次请求的路径，以便后退
    req.session.lastReq=req_path;
    var filepath = req.session.route+req_path;
    fs.exists(filepath, function(exists){
        if(exists){
            fs.stat(filepath, function(err, stats){
                if(err){
                    res.json({'success':false,'msg':'internal error'});
                }else{
                    if(req_path==''){
                        var data = {'success':true,'isRoot':true};
                        if(stats.isFile()){
                            data.files = [{'path':req.session.top,'name':req.session.top.substr(1),'isFile':true}];
                        }else{
                            data.files = [{'path':req.session.top,'name':req.session.top.substr(1),'isFile':false}];
                        }
                        res.json(data);
                    }else{
                        if(stats.isFile()){
                            res.json({'success':false,'msg':'not a dir!'});
                        }else{
                            fs.readdir(filepath, function(err, files){
                                var data = {};
                                data.files = [];
                                files.forEach(function(item) {
                                    var tmpPath = filepath + '/' + item;
                                    var st = fs.statSync(tmpPath);
                                    if(st.isFile()){
                                        data.files.push({'path':req_path+'/'+item,'name':item,'isFile':true});
                                    }else{
                                        data.files.push({'path':req_path+'/'+item,'name':item,'isFile':false});
                                    }
                                });
                                //非分享的根目录时，显示后退按钮
                                if(filepath != req.session.route){
                                    data.isRoot = false;
                                }else{
                                    data.isRoot = true;
                                }
                                data.success = true;
                                res.json(data);
                            });
                        }
                    }
                }
            });
        }else{
            res.json({'success':false,'msg':'not found'});
        }
    });
});

router.get('/downShare/*',function(req,res){
    var req_path = req.path;
    var filepath = req.session.route + req_path.substr(10);
    fs.exists(filepath, function(exists){
        if(exists){
            fs.stat(filepath, function(err, stats){
                if(err){
                    res.writeHead(500, {'conntent-Type' : 'text/html;charset=utf8'});
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

module.exports = router;
