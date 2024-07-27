import crypto from 'crypto';
// TODO: change approach of storing those keys, they need to be secret and secure
class cryptoControl{
    #KEY_LENGTH = Number(import.meta.env.VITE_KEY_LENGTH);
    #ALGORITHM = import.meta.env.VITE_ALGORITHM;
    #RT = import.meta.env.VITE_ROUTE.split(';');

    #RT_DATE_SALTS = import.meta.env.VITE_ROUTE_DEPENDENT_TOKEN_DATE_SALTS.split(',');
    #AUTH_DATE_SALT = import.meta.env.VITE_AUTH_TOKEN_DATE_SALT;

    #RT_KEYS = import.meta.env.VITE_ROUTE_DEPENDENT_TOKEN_KEYS.split(';');
    #AUTH_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;
    #SERVER_KEY = import.meta.env.VITE_AUTH_SERVER_KEY;

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
    
    encrypt(data, isAuthRT, isEncryptedByServer = false){
        if( !isEncryptedByServer && !isAuthRT ){
            const new_date = new Date().getTime() + this.#getRTDateSalt();
            data = data.concat( new_date.toString() );
        }
        if( !isEncryptedByServer && isAuthRT ){
            const new_date = new Date().getTime() + Number(this.#AUTH_DATE_SALT);
            data = data.concat( new_date.toString() );
        }
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const salt = crypto.randomBytes(this.SALT_LENGTH);
        const key = crypto.pbkdf2Sync( this.#getEncryptionKey(isEncryptedByServer, isAuthRT), salt, Number(this.ITERATIONS), Number(this.#KEY_LENGTH), 'sha512' );
    
        const cipher = crypto.createCipheriv(this.#ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
        const tag = cipher.getAuthTag();
    
        return Buffer.concat([salt, iv, tag, encrypted]).toString('hex');
    }

    decrypt(encryptedData, isEncryptedByServer = true){
        const data = Buffer.from(encryptedData, 'hex');
        const salt = data.subarray(0, this.SALT_LENGTH);
        const iv = data.subarray(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
        const tag = data.subarray(this.SALT_LENGTH + this.IV_LENGTH, this.SALT_LENGTH + this.IV_LENGTH + 16);
        const text = data.subarray(this.SALT_LENGTH + this.IV_LENGTH + 16);

        const key = crypto.pbkdf2Sync(this.#getEncryptionKey(isEncryptedByServer), salt, this.ITERATIONS, Number(this.#KEY_LENGTH), 'sha512');

        const decipher = crypto.createDecipheriv(this.#ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
    
        const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);

        return decrypted;
    }

    setRoute(path){
        this.ROUTE = path;
    }
}

export default cryptoControl;
