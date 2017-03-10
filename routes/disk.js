var express = require('express');
var router = express.Router();
var fs = require("fs");
var config = require('../config/config');

/* GET home page. */
router.post('/', function(req, res, next) {
    var req_path = req.body.path;
    if(req_path==''){
        req_path = req.session.lastReq;
        req_path = req_path.substr(0,req_path.lastIndexOf('/'));
    }
    if(req_path=='.'){
        req_path = req.session.lastReq;
    }
    if(req.session.user){
        req.session.lastReq=req_path;
    }else{
        res.redirect('/login');
        return;
    }
    if(req_path=='/'){
        req_path='';
    }
    var filepath = config.path+"/disk/" + req.session.user +'/data'+ req_path;
    fs.exists(filepath, function(exists){
        if(exists){
            fs.stat(filepath, function(err, stats){
                if(err){
                    res.json({'success':false,'msg':'internal error'});
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
                            if(filepath!=config.path+'/disk/'+req.session.user+'/data'){
                                data.isRoot = false;
                            }else{
                                data.isRoot = true;
                            }
                            data.success = true;
                            res.json(data);
                        });
                    }
                }
            });
        }else{
            res.json({'success':false,'msg':'not found'});
        }
    });
});
module.exports = router;
