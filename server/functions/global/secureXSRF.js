module.exports = function (options){
    return function secureXSRF(req, res, next){
        let is_path_auth = req.path.match('\/auth.*')
        if(req.header('Xsrf-Token') === 'correct' || is_path_auth){
            //console.log('correct');
            next();
        } 
        else{
            res.sendStatus(500);
        }
    }
}