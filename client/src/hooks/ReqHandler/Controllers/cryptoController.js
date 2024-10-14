import crypto from 'crypto';

class cryptoControl{
    #KEY_LENGTH = Number(import.meta.env.VITE_KEY_LENGTH);
    #ALGORITHM = import.meta.env.VITE_ALGORITHM;

    #AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;
    #AUTH_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;
    /**
     * @param {number} iterations `1000` on server
     * @param {number} salt_len `64`
     * @param {number} iv_len `16`
     */
    constructor(iterations, salt_len, iv_len){
        this.ITERATIONS = Number(iterations);
        this.SALT_LENGTH = Number(salt_len);
        this.IV_LENGTH = Number(iv_len);
    }
    /**
     * @param {number|string} data date in milliseconds
     * @returns {string} 
     */
    encrypt(data, isAuth){
        if(isAuth){
            data = this.#AUTH_TOKEN.concat(data);
        }
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const salt = crypto.randomBytes(this.SALT_LENGTH);
        const key = crypto.pbkdf2Sync( this.#AUTH_KEY, salt, Number(this.ITERATIONS), Number(this.#KEY_LENGTH), 'sha512' );
    
        const cipher = crypto.createCipheriv(this.#ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const tag = cipher.getAuthTag();
        
        return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
    }

}

export default cryptoControl;
