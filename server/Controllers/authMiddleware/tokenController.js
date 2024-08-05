const cryptoControl = require('./cryptoController.js');

class tokenControl extends cryptoControl{
    client_id = tokenControl.generateObjectId(16,20);
    token = tokenControl.generateObjectId();
    new_date = new Date();
    created_at = new Date();
    isMarkedForUpdate = false;

    /**
     * @extends cryptoControl
     * @param {Request} req 
     * @param {Response} res 
     * @param {Db} db - `db.collection('${x}')` collection needs to be specified when constructed
     * @variables 
     * - `client_id` - String (Mongo $OID), generated automatically, if there is no `U_id` header in req. In case when `U_id` header is set, it will be assigned to `client_id` 
     * - `token` - String, token is generated automatically. Unlike `client_id`, it has to be changed manually when necessary.
     * - `new_date` - just a `new Date()`
     * - `created_at` - Date - `new Date()` by default
     * - `isMarkedForUpdate` - boolean - `false` by default, automatically set to `true` when `U_id` header is set in request.
     * @static 
     * @method `generateObjectId(number|number|Math|Date|function)`
     */
    constructor(req, res, db){
        super(1000, 64, 16);
        this.req = req;
        this.res = res;
        this.db = db;
        this.#setClientIdFromHeader();        
    }
    #setClientIdFromHeader(){
        if(this.req.header('U_id') !== undefined && this.req.header('U_id') !== ''){
            this.isMarkedForUpdate = true;
            this.client_id = this.req.header('U_id');
        }else{
            this.isMarkedForUpdate = false;
        }
    }

    /** @param {Date} created_at  */
    setUser(id, token, created_at){
        this.client_id = id;
        this.token = token;
        this.created_at = created_at;
    }
    getUser(){
        return {token: this.token.toString(), user_id: this.client_id, date: this.new_date, created_at: this.created_at};
    }
    /** 
     * Searches for document with filter:
     * - only `req.ip` when token is marked for update
     * - `client_id`, `req.ip` when token is NOT marked for update
     * @returns {Promise<[]>}  array of mongo find cursor in Promise
    */
    async findUser(){
        if(this.isMarkedForUpdate){
            return await this.db.find({"user._id": this.client_id, "user._ip": this.req.ip}).toArray();      
        }
        return await this.db.find({"user._ip": this.req.ip}).toArray();
    }
    /** 
     * Updates token and date of last update, both taken from class
     * @param {string} id corresponding to `req.ip`
     * @returns {Promise<mongodb.Document>} updateMany
    */
    async updateUser(id){
        return await this.db.updateOne( 
            {"user._id": id}, 
            {"$set": {"token._token": this.token, "token._updated_at": this.new_date}}
        );
    }
    /** 
     * Inserts user according to `this` 
     * @returns {Promise<mongodb.Document>}
    */
    async insertUser(){
        return await this.db.insertOne(
            {"date": this.new_date, 
                user:{
                    "_id": this.client_id, 
                    "_ip": this.req.ip,
                },
                token:{
                    "_token": this.token, 
                    "_updated_at": this.new_date
                }
            }
        );
    }

    // GET
    getClientId(){
        return this.client_id;
    }
    getToken(){
        return this.token;
    }
    getNewDate(){
        return this.new_date;
    }
    getCreatedAt(){
        return this.created_at;
    }
    getIsMarkedForUpdate(){
        return this.isMarkedForUpdate;
    }

    // SET
    /** Generates new client_id */
    setNewClientId(){
        this.client_id = tokenControl.generateObjectId(16,20);
    }
    setClientId(id){
        this.client_id = id;
    }
    setToken(token){
        this.token = token;
    }
    /** @param {Date} date  */
    setCreatedAt(date){
        this.created_at = date;
    }

    // STATIC
    /**
     * creates token - same format as _id in mongo
     * @param {number} h Integer between 2 and 18 sets type of number conversion and randomness
     * @param {number} length Integer sets length of id
     * - `length` will be always at least 1 char bigger - UP TO 7 chars bigger 
     * - dependant on `h` value
     * @returns {string} random string, for string similar to Mongo $OID set:
     * - `h` to `16`
     * - `length` to `20`
     */
    static generateObjectId = (h = 16, length = 50, m = Math, d = Date, s = s => m.floor(s).toString(h*2)) => 
        s(d.now() / 10000000) + ' '.repeat(length).replace(/./g, () => s(m.random() * h)); 
}

module.exports = {tokenControl, cryptoControl};