module.exports = function (client, db, options){
    return async function secureXSRF(req, res, next){
        let is_path_auth = req.path.match('\/auth');
        let valid_token;
        let exp_date;
        if(is_path_auth){
            return next();
        } 

        try{
            await client.connect();
            valid_token = await db.collection('auth').find({"user._id": req.header('U_id'), "user._ip": req.ip}).toArray();
            if(valid_token.length > 0){
                exp_date = new Date(valid_token[0].token._updated_at.setMinutes(valid_token[0].token._updated_at.getMinutes() + 11));
            }
        }
        catch(e){
            console.log(`XSRF Error: \n${e}`);
            return res.sendStatus(500);
        }
        finally{

            if(valid_token.length === 0){
                console.log(`User not found: ${req.ip}`);
                return res.sendStatus(401);
            }
            else if( exp_date.getTime() < new Date().getTime() ){
                console.log(`Token expired: ${req.ip}`);
                return res.sendStatus(401);
            }

            if(req.header('Xsrf-Token') === valid_token[0].token._token){
                next();
            } 
            else{
                console.log(`Invalid Xsrf-Token by: ${req.ip}`);
                return res.sendStatus(401);
            }

        }
    }
}