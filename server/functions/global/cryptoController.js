const crypto = require('crypto');

class cryptoControl{
    #KEY_LENGTH = Number(process.env.KEY_LENGTH);
    #ALGORITHM = process.env.ALGORITHM;
    #RT = process.env.ROUTE.split(';');

    #RT_DATE_SALTS = process.env.ROUTE_DEPENDENT_TOKEN_DATE_SALTS.split(',');
    #AUTH_DATE_SALT = process.env.AUTH_TOKEN_DATE_SALT;
    #DATE_SALT_LEN = Number(process.env.DATE_SALTS_LENGTH);

    #RT_KEYS = process.env.ROUTE_DEPENDENT_TOKEN_KEYS.split(';');
    #AUTH_KEY = process.env.AUTH_TOKEN_KEY;
    #SERVER_KEY = process.env.AUTH_SERVER_KEY;
    #AUTH_TOKEN = process.env.AUTH_TOKEN;

    constructor(iterations, salt_len, iv_len, route){
        this.ITERATIONS = Number(iterations);
        this.SALT_LENGTH = Number(salt_len);
        this.IV_LENGTH = Number(iv_len);
        this.ROUTE = route;
    }
    #getEncryptionKey(isEncryptedByServer, isAuthRT){
        if(isAuthRT) return this.#AUTH_KEY;
        if(isEncryptedByServer) return this.#SERVER_KEY;

        for(let i = 0; i < this.#RT.length; ++i){
            if( this.ROUTE === this.#RT[i] ){
                return this.#RT_KEYS[i];
            }
        }
        return this.#RT_KEYS[3];
    }
    #getRTDateSalt(){
        for(let i = 0; i < this.#RT.length; ++i){
            if( this.ROUTE === this.#RT[i] ){
                return Number(this.#RT_DATE_SALTS[i]);
            }
        }
        return Number(this.#RT_DATE_SALTS[3]);
    }

    encrypt(data, isEncryptedByServer = true){
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const salt = crypto.randomBytes(this.SALT_LENGTH);
        const key = crypto.pbkdf2Sync(this.#getEncryptionKey(isEncryptedByServer), salt, Number(this.ITERATIONS), Number(this.#KEY_LENGTH), 'sha512');
    
        const cipher = crypto.createCipheriv(this.#ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const tag = cipher.getAuthTag();
    
        return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
    }

    decrypt(encryptedData, isAuthRT, isEncryptedByServer = false){
        const data = Buffer.from(encryptedData, 'hex');
        const salt = data.subarray(0, this.SALT_LENGTH);
        const iv = data.subarray(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
        const tag = data.subarray(this.SALT_LENGTH + this.IV_LENGTH, this.SALT_LENGTH + this.IV_LENGTH + 16);
        const text = data.subarray(this.SALT_LENGTH + this.IV_LENGTH + 16);
    
        const key = crypto.pbkdf2Sync( this.#getEncryptionKey(isEncryptedByServer, isAuthRT), salt, Number(this.ITERATIONS), Number(this.#KEY_LENGTH), 'sha512' );
        const decipher = crypto.createDecipheriv(this.#ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
        if( !isEncryptedByServer ){
            const decrypted_date = decrypted.toString().substring( (decrypted.length - this.#DATE_SALT_LEN), decrypted.length );
            const decrypted_token = decrypted.toString().substring( 0, (decrypted.length - this.#DATE_SALT_LEN) );
            return [decrypted_token, Number(decrypted_date)];
        }
        return decrypted;
    }

    isDateValid(date, isAuthRT){
        const new_date = new Date().getTime();
        if(isAuthRT){
            const unsalted_date = Number(date) - Number(this.#AUTH_DATE_SALT);
            if( unsalted_date > new_date || (unsalted_date + 10000) < new_date ) return false;
            else return true;
        }
        const unsalted_date = Number(date) - this.#getRTDateSalt();
        if( unsalted_date > new_date || (unsalted_date + 10000) < new_date ) return false;
        else return true;
    }

    isAuthTokenValid(token){
        if( token == this.#AUTH_TOKEN ){
            return true;
        }
        else{
            return false;
        }
    }
}

module.exports = cryptoControl;