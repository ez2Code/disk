var chars = ['0','1','2','3','4','5','6','7','8','9','a','A','b','B','c','C','d','D','e','E','f','F','g','G',
    'h','H','i','I','j','J','k','K','l','L','m','M','n','N','o','O','p','P','q','Q','r','R','s','S','t','T','u','U','v','V','w','W','x','X','y','Y','z','Z'];
var max=62;
var convert = function(num,target){
    if(target>62){
        return new Error('the target is out of range!');
    }
    var tmp = 0;
    var result='';
    while (num>0){
        tmp = num%target;
        result = chars[tmp]+result;
        num = parseInt(num/target);
    }
    return result;
}
var convertToMax = function(num){
    return this.convert(num,max);
}

module.exports.convertToMax = convertToMax;
module.exports.convert = convert;