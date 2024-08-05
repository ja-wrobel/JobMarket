const {cryptoControl} = require('./tokenController');

module.exports = function (client, db, options){
    return async function secureXSRF(req, res, next){
        let error = false;
        let is_path_auth = req.path.match('\/auth');
        let valid_token;
        let received_token;
        let exp_date;
        const new_date = new Date();
        const crypt = new cryptoControl(1000, 64, 16);
        // Handle authorization request
        if(is_path_auth){
            if( req.header('Xsrf-Token') === null || req.header('Xsrf-Token') === undefined || req.header('Xsrf-Token') === '' || req.header('Xsrf-Token').length  !== 358){
                console.log(`Token not set in header: ${req.ip}`);
                error = true;
            }

            try{
                received_token = crypt.isAuthTokenValid( req.header('Xsrf-Token') );
            }
            catch(e){
                console.log(`Error while decrypting for: ${req.ip}\nError: ${e}`);
                error = true;
            }
            finally{
                if(error) return res.sendStatus(401);
                if( received_token === false ){
                    console.log(`Invalid token or date by: ${req.ip}`);
                    return res.sendStatus(401);
                }
                return next();
            }
        } 
        // Find user in DB (casual request)
        try{
            await client.connect();
            valid_token = await db.collection('auth').find({"user._id": req.header('U_id'), "user._ip": req.ip}).toArray();
            if(valid_token.length > 0){
                exp_date = new Date(valid_token[0].token._updated_at.setSeconds(valid_token[0].token._updated_at.getSeconds() + 25));
            }
            received_token = crypt.decrypt( req.header('Xsrf-Token') ).toString();
        }
        catch(e){
            console.log(`XSRF Error: \n${e}`);
            error = true;
        }
        finally{
            if(error) return res.sendStatus(401);

            if(valid_token.length === 0){
                console.log(`User not found: ${req.ip}`);
                return res.sendStatus(401);
            }
            else if( exp_date.getTime() < new_date.getTime() ){
                console.log(`Token expired: ${req.ip}`);
                return res.sendStatus(401);
            }
            else if( req.header('Xsrf-Token') === null || req.header('Xsrf-Token') === undefined || req.header('Xsrf-Token') === ''){
                console.log(`Token not set in header: ${req.ip}`);
                return res.sendStatus(401);
            }
        }
        // When headers are ok, user exists and token didn't expire - compare tokens

        if( received_token != valid_token[0].token._token){
            console.log(`Invalid Xsrf-Token by: ${req.ip}`);
            return res.sendStatus(401);
        }  
        next();
    }
}