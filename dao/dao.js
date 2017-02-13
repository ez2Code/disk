var pool = require('./pool');
var convert = require('./convert');

var register = function(data,callback){
    var params = [data.user_id,data.passwd];
    var sql = 'insert into users(user_id,passwd) values(?,?)';
    pool.execute(sql,params,function(err,result){
        if (err) {
            callback('-1');
        }else{
            callback(null);
        }
    });
}

var validate = function(data,callback){
    var params = [data.user_id,data.passwd];
    var sql = 'select user_id from users where user_id=? and passwd=?';
    pool.execute(sql,params,function(err,rows,fields){
        if (err) {
            callback('-1');
        }else{
            if(rows.length>0){
                callback(null);
            }else{
                callback('1');
            }
        }
    });
}

var generateShare = function(data,callback){
    var params = [data.user_id,data.path];
    var sql = 'select code from share_record where share_user=? and file_path=?';
    pool.execute(sql,params,function(err,rows,fields){
        if(err){
            console.log(err);
            callback('-1');
        }else{
            if (rows.length>0) {
                callback(rows[0].code);
            }else{
                sql = 'insert into share_record(code,share_user,file_path) values(?,?,?)';
                var code = convert.convertToMax(new Date().getTime());
                params = [code,data.user_id,data.path];
                pool.execute(sql,params,function(err,result){
                    if(err){
                        console.log(err);
                        callback('-1');
                    }else{
                        callback(code);
                    }
                });
            }
        }
    });
}

var indexCode = function(data,callback){
    var params = [data.code];
    var sql = 'select * from share_record where code=?';
    pool.execute(sql,params,function(err,rows,fields){
        if(err){
            callback('-1');
        }else{
            if(rows.length>0){
                callback({'share_user':rows[0].share_user,'path':rows[0].file_path});
            }else{
                callback('1');
            }
        }
    });

}

module.exports.register = register;
module.exports.validate = validate;
module.exports.generateShare = generateShare;
module.exports.indexCode = indexCode;