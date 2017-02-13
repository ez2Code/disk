var express = require('express');
var router = express.Router();
var md5 = require('md5');
var dao = require('../dao/dao');

/* login action. */
router.post('/login', function(req, res, next) {
    var user_id=req.body.user;
    var passwd=req.body.passwd;
    passwd = md5(passwd).substr(12);
    var data = {'user_id':user_id,'passwd':passwd};
    dao.validate(data,function(err){
        if (err) {
            if(err=='-1'){
                res.json({'success':false,'msg':'server error,please try again'});
            }else if(err=='1'){
                res.json({'success':false,'msg':'no such user or wrong passwd'});
            }
        }else{
            req.session.user=user_id;
            res.redirect('/');
        }
    });
});

router.get('/logout',function(req,res){
    req.session.path=null;
    req.session.user=null;
    res.redirect('/');
});

router.get('/signup',function(req,res){
    var file=fs.createReadStream('./views/signup.html');
    res.writeHead(200);
    file.pipe(res);
});

router.post('/signup',function(req,res){
    var user_id=req.body.user;
    var passwd=req.body.passwd;
    passwd = md5(passwd).substr(12);
    var data = {'user_id':user_id,'passwd':passwd};
    dao.register(data,function(err){
        if(err){
            res.json({'success':false,'msg':'the username has been used!'});
        }else{
            var targetDir = '/workspace/share/data/'+user_id;
            req.session.user=user_id;
            fs.mkdir(targetDir,function(err){
                if(err){
                    res.json({'success':false,'message':err.message});
                    return;
                }else{
                    fs.mkdir(targetDir+'/data',function(err){
                        if(err){
                            res.json({'success':false,'message':err.message});
                        }else{
                            res.redirect('/');
                        }
                    });
                }
            });
        }
    });
});

module.exports = router;
