var express = require('express');
var router = express.Router();
var fs = require("fs");

/* GET home page. */
router.get('/', function(req, res, next) {
  var filepath;
  if(req.session.user){
    filepath = './views/main.html';
  }else{
    filepath = './views/login.html';
  }
  var file = fs.createReadStream(filepath);
  res.writeHead(200);
  file.pipe(res);
});
module.exports = router;
