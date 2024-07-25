module.exports = function (client, db, options){
    return async function secureXSRF(req, res, next){
        let is_path_auth = req.path.match('\/auth');
        let valid_token;
        if(is_path_auth){
            return next();
        } 

        try{
            await client.connect();
            valid_token = await db.collection('AUTH').find({"user._id": req.header('U_id'), "user._ip": req.ip}).toArray();
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

            if(req.header('Xsrf-Token') === valid_token[0].user._token){
                next();
            } 
            else{
                console.log(`Invalid Xsrf-Token by: ${req.ip}`);
                return res.sendStatus(401);
            }

        }
    }
}