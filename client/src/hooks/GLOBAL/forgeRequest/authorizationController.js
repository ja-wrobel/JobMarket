import cryptoControl from "./cryptoController";

/**
 * Creates, encodes, decodes, modifies, stores and tracks if XSRF_TOKEN is expired. 
 * - Tokens expire every 10 minutes
 */
class authorizationControl extends cryptoControl{
    /**
     * @extends cryptoControl
     * @param {string} user_id OID created for user by server
     * @param {string} token XSRF-Token
     * @param {Date} expiration_date of token  + 10 minutes by default
     * @param {Date} user_created_at user date in mongo
     * @param {string} path Request path, each path will generate a bit different and unique token
     * @param {boolean} isTokenActive  `false` by default, set to `true` if token is active
     * @method merge()
     * @method constructFromLocalData()
     * @method setLocalData()
     * @method clearLocalData()
     * @method getUserExpirationDate()
     * @method isValid() checks if `localStorage` and `this` is set properly in order to make a request
     * @static @method waitForAuthorization()
     */
    constructor(user_id = '', token = '', expiration_date = new Date(0), user_created_at = new Date(0), path = '', isTokenActive = false){
        super(1000, 64, 16, path);
        this.user_id = user_id;
        this.token = token; 
        this.expiration_date = new Date(expiration_date.setMinutes( expiration_date.getMinutes() + 2 ) );
        this.user_created_at = new Date(user_created_at);
        this.path = path;
        this.isTokenActive = isTokenActive;
    }
    
    /**
     * Copies properties of `user` authorizationControl to `this`, 
     * also it finds out whether the token is active or not
     * @param {authorizationControl} user  
     */
    merge(user){
        this.user_id = user.getID();
        this.token = user.getToken();
        this.expiration_date = user.getExpirationDate();
        this.user_created_at = user.getUserCreatedAt();
        this.path = user.getPath();
        this.setRoute(user.getPath());
        this.isTokenActive = user.getIsTokenActive();
    }
    constructFromLocalData(){
        this.user_id = localStorage.getItem('user_id');
        this.token = localStorage.getItem('token');
        this.expiration_date = new Date(localStorage.getItem('expire_at'));
        this.user_created_at = new Date(localStorage.getItem('user_created_at'));
        this.getIsTokenActive();
    }
    clearLocalData(){
        this.user_id = '';
        this.token = '';
        localStorage.removeItem('user_id');
        localStorage.removeItem('token');
        localStorage.removeItem('expire_at');
        localStorage.removeItem('user_created_at');
    }

    // setters
    setID(id){
        this.user_id = id;
    }
    setToken(token){
        this.token = token;
    }
    /** Sets to `date` + 10 minutes @param {Date} date */
    setExpirationDate(date){
        this.expiration_date = new Date(date.setMinutes( date.getMinutes() + 2 ) );
    }
    /** @param {Date} date  */
    setUserCreatedAt(date){
        this.user_created_at = new Date(date);
    }
    setPath(path){
        this.path = path;
        this.ROUTE = path;
    }
    setIsTokenActive(bool){
        this.isTokenActive = bool;
    }
    /**
     * Sets items - [ `user_id`, `token`, `expire_at`, `user_created_at` ] in localStorage
     */
    setLocalData(){
        localStorage.setItem('user_id', this.user_id);
        localStorage.setItem('token', this.token);
        localStorage.setItem('expire_at', this.expiration_date);
        localStorage.setItem('user_created_at', this.user_created_at);
    }

    // getters
    getID(){
        return this.user_id;
    }
    getToken(){
        return this.token;
    }
    getExpirationDate(){
        return this.expiration_date;
    }
    getUserCreatedAt(){
        return this.user_created_at;
    }
    getUserExpirationDate(){
        const date = new Date(this.user_created_at);
        return new Date(date.setMinutes( date.getMinutes() + 61));    // mongo will delete user after this date
    }
    getPath(){
        return this.path;
    }
    /**
     * Apart of standard GET method, it compares if `expiration_date` in ms is smaller than `new Date()`
     * - if so - it removes `token` and `expire_at` from local storage and sets this to `false`
     * - and checks if user still exists in db, if not - clears localStorage from dependant items
     * @returns {Promise<boolean>} `false` === token already expired
     */
    getIsTokenActive(){
        const date_now = new Date();

        if( this.expiration_date.getTime() > date_now.getTime() && this.getUserExpirationDate().getTime() > date_now.getTime()){ // done by method bcs it's cleaner and setMinutes() is weird
            this.isTokenActive = true;  
        }
        else this.isTokenActive = false;
        
        if(this.getUserExpirationDate().getTime() <= date_now.getTime()) this.clearLocalData();

        return this.isTokenActive;
    }
    isValid(){
        if( this.user_id === '' ||
            this.token === '' ||
            this.path === '' ||
            this.isTokenActive === false ||
            localStorage.getItem('expire_at') === null ||
            localStorage.getItem('user_created_at') === null ) { return false; }
        else { return true; };
    }

    /**
     * Waits with next step of request until user is authorized thanks to recursion
     * @param {authorizationControl} user 
     * @param {string} route 
     * @param {number} recurse_count default = 0. Incremented with each recursion, if it goes up to 50 - returns user immediately even if undefined
     * @returns {authorizationControl} Returns user in promise when auth data is in localStorage
     */
    static async waitForAuthorization(user, route, recurse_count = 0){
        return await new Promise( (resolve)=>{
            setTimeout( ()=>{
                if(localStorage.getItem('auth_in_progress') === 'true' && recurse_count < 50){
                    resolve();
                }
                else{
                    user.constructFromLocalData();
                    user.setPath(route);
                    resolve(user);
                }
            }, 100);
        }).then( (resolved_val) => { 
            return resolved_val === undefined ? this.waitForAuthorization(user, route, recurse_count + 1) : resolved_val; 
        });
        
    }
}

export {authorizationControl, cryptoControl};