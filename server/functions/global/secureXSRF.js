const {cryptoControl} = require('./tokenController');

module.exports = function (client, db, options){
    return async function secureXSRF(req, res, next){
        let is_path_auth = req.path.match('\/auth');
        let valid_token;
        let received_token;
        let received_date;
        let exp_date;
        const crypt = new cryptoControl(1000, 64, 16, req.path);

        if(is_path_auth){
            if( req.header('Xsrf-Token') === null || req.header('Xsrf-Token') === undefined || req.header('Xsrf-Token') === '' || req.header('Xsrf-Token').length  !== 326){
                console.log(`Token not set in header: ${req.ip}`);
                return res.sendStatus(401);
            }
            try{
                [received_token, received_date] = crypt.decrypt(req.header('Xsrf-Token'), true);
            }
            catch(e){
                console.log(`Error while decrypting for: ${req.ip}\nError: ${e}`);
                return res.sendStatus(401);
            }
            finally{
                if( crypt.isAuthTokenValid(received_token) === false || crypt.isDateValid(received_date, true) === false ){
                    console.log(`Invalid token or date by: ${req.ip}`);
                }
                return next();
            }
        } 
        try{
            await client.connect();
            valid_token = await db.collection('auth').find({"user._id": req.header('U_id'), "user._ip": req.ip}).toArray();
            if(valid_token.length > 0){
                exp_date = new Date(valid_token[0].token._updated_at.setMinutes(valid_token[0].token._updated_at.getMinutes() + 2));
                exp_date = new Date(exp_date.setSeconds( exp_date.getSeconds() + 10 ));
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
            else if( req.header('Xsrf-Token') === null || req.header('Xsrf-Token') === undefined || req.header('Xsrf-Token') === ''){
                console.log(`Token not set in header: ${req.ip}`);
                return res.sendStatus(401);
            }

            try{
                [received_token, received_date] = crypt.decrypt(req.header('Xsrf-Token'), false);
            }
            catch(e){
                console.log(`Error while decrypting!\nIP: ${req.ip}\nError: ${e}`);
                res.sendStatus(401);
            }
            finally{
                if( crypt.isDateValid(received_date, false) === false ){
                    console.log(`Invalid date in Token by: ${req.ip}`);
                    return res.sendStatus(401);
                }
                if( received_token != valid_token[0].token._token){
                    console.log(`Invalid Xsrf-Token by: ${req.ip}`);
                    return res.sendStatus(401);
                } 
                
                next();
            }
        }
    }
}