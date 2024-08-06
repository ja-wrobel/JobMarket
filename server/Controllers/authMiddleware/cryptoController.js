const crypto = require('crypto');

class cryptoControl{
    #KEY_LENGTH = Number(process.env.KEY_LENGTH);
    #ALGORITHM = process.env.ALGORITHM;

    #AUTH_KEY = process.env.AUTH_TOKEN_KEY;
    #SERVER_KEY = process.env.AUTH_SERVER_KEY;
    /**
     * 
     * @param {number} iterations `1000` in client
     * @param {number} salt_len `64`
     * @param {number} iv_len `16`
     */
    constructor(iterations, salt_len, iv_len){
        this.ITERATIONS = Number(iterations);
        this.SALT_LENGTH = Number(salt_len);
        this.IV_LENGTH = Number(iv_len);
    }

    encrypt(data){
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const salt = crypto.randomBytes(this.SALT_LENGTH);
        const key = crypto.pbkdf2Sync( this.#SERVER_KEY, salt, Number(this.ITERATIONS), Number(this.#KEY_LENGTH), 'sha512');
    
        const cipher = crypto.createCipheriv(this.#ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const tag = cipher.getAuthTag();
    
        return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
    }

    /**
     * @param {string} encryptedData encrypted token
     * @param {boolean} isAuthRT has to be set as `true` when decrypting token is sent with `/auth` request, doesn't have to be defined with other requests
     * @returns {Buffer} decrypted token
     */
    decrypt(encryptedData, isAuthRT){
        let encryption_key = this.#SERVER_KEY;
        if(isAuthRT){
            encryption_key = this.#AUTH_KEY;
        }
        const data = Buffer.from(encryptedData, 'hex');
        const salt = data.subarray(0, this.SALT_LENGTH);
        const iv = data.subarray(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
        const tag = data.subarray(this.SALT_LENGTH + this.IV_LENGTH, this.SALT_LENGTH + this.IV_LENGTH + 16);
        const text = data.subarray(this.SALT_LENGTH + this.IV_LENGTH + 16);

        const key = crypto.pbkdf2Sync( encryption_key, salt, Number(this.ITERATIONS), Number(this.#KEY_LENGTH), 'sha512' );
        const decipher = crypto.createDecipheriv(this.#ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);

        return decrypted;
    }

    /**
     * Checks if date sent with `/auth` request token is younger than 3 seconds
     * @param {string} token token from `/auth` request
     * @returns {boolean} `true` === valid
     */
    isAuthTokenValid(token){
        const date = new Date().getTime();
        token = this.decrypt(token, true);
        token = Number( token.subarray( ( token.length - 13 ), token.length ) );
        if( date < token || date >= ( token + 3000) ) return false;
        else return true;
    }
}

module.exports = cryptoControl;