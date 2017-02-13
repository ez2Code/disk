var mysql = require('mysql');
var config = require('../config/config');
var pool = mysql.createPool(config.dataSource);

var execute=function(sql,params,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,params,function(qerr,vals,fields){
                //释放连接
                conn.release();
                //事件驱动回调
                callback(qerr,vals,fields);
            });
        }
    });
};

module.exports.execute = execute;