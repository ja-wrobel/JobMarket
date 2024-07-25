const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const router = express.Router();
const path = require('path');
const helmet = require('helmet');
const { MongoClient, ServerApiVersion, Timestamp } = require('mongodb');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const env_var = {
    db_uri: process.env.URI_DATABASE,
    port: process.env.PORT || 8080,
    this_url: process.env.URL || "http://localhost",
    client_url: process.env.CLIENT_URL
}
const client = new MongoClient(env_var.db_uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const db = client.db("offerData");
const rateLimiter = new RateLimiterMemory({
    points: 41,
    duration: 1.5
});
const longTermRateLimit = new RateLimiterMemory({
    points: 1700,
    duration: 90,
    blockDuration: 60*60
});

const rateLimiterMiddleware = (req, res, next) => {
    longTermRateLimit.consume(req.ip, 2)
    .then(()=>{
        rateLimiter.consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).send('Too Many Requests');
        });
    })
    .catch(()=>{
        console.log("Blocked ip by RateLimiter: "+req.ip);
        res.status(429).send('Way Too Many Requests, try again later...');
    });
};
whitelist = env_var.client_url;
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}
function setCorsHeaders(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://192.168.1.20:5173');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Access-Control-Request-Methods, Content-Type, XSRF-Token');
    next();
  }

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
const ObjectId = (h = 16, length = 50, m = Math, d = Date, s = s => m.floor(s).toString(h*2)) => 
    s(d.now() / 10000000) + ' '.repeat(length).replace(/./g, () => s(m.random() * h)); 
//
//
const secureXSRF = require("./functions/global/secureXSRF.js");

app.use(cors(corsOptions));
app.use(setCorsHeaders);
app.use(helmet());
app.use(rateLimiterMiddleware);
app.use(secureXSRF(client, db));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

app.listen(env_var.port, async ()=>{
    console.log(`Server is running at ${env_var.this_url}:${env_var.port}`);
    console.log(new Date());
    console.log(ObjectId(16, 20));
})


/* ------------- GET ENTRIES FROM DATABASE ---------------- */

router.get('/auth', async (req, res) => {
    let get_token;
    let new_token = ObjectId();
    let new_id = ObjectId(16, 20);
    const new_date = new Date();
    let created_at;
    try{
        await client.connect();

        if(req.header('U_id') !== undefined && req.header('U_id') !== ''){
            get_token = await db.collection('AUTH').find({"user._id": req.header('U_id'), "user._ip": req.ip}).toArray();
            if(get_token.length === 0){
                new_id = req.header('U_id');
                created_at = new_date;
                return await db.collection('AUTH').insertOne({"date": new_date, user:{"_id": req.header('U_id'), "_token": new_token, "_ip": req.ip}});
            }
        }
        else{
            get_token = await db.collection('AUTH').find({"user._ip": req.ip}).toArray();
            if(get_token.length > 0){
                const update_token = await db.collection('AUTH').updateMany(
                    {"user._id": get_token[0].user._id, "user._ip": req.ip},
                    {"$set": {"user._token": new_token}}
                );
                new_id = get_token[0].user._id;
                created_at = get_token[0].date;
                return update_token;
            }
        }
        
        if(get_token.length === 0){
            created_at = new_date;
            return await db.collection('AUTH').insertOne({"date": new_date, user:{"_id": new_id, "_token": new_token, "_ip": req.ip}});
        }
        new_token = get_token[0].user._token;
        new_id = get_token[0].user._id;
        created_at = get_token[0].date;
    }catch(e){
        console.log(e);
        return res.sendStatus(500);
    }finally{
        res.setHeader('X-Xsrf-Token', 'sent');
        return res.status(200).send({token: new_token, user_id: new_id, date: new_date, created_at: created_at});
    }
})


router.get('/', async (req, res)=>{
    try{
        await client.connect();
        let date = new Date();
        let find_ip = await db.collection('searchCount').find({"meta._ip": req.ip}).toArray();
        if(find_ip.length < 1){
            let push_ip = db.collection('searchCount').insertOne({"date": date, meta:{"_ip": req.ip, "search_count": 0}});
            return push_ip;
        }
    }catch(e){
        console.log(e);
        res.status(500).end();
    }
    finally{
        try{
            let display = await db.collection('langsCount').find({}).toArray();
            display.sort((a,b) => a.value - b.value);
            display.reverse();
            res.status(200).send(display);
        }catch(e){
            console.log(e);
            res.status(500).end();
        }
    }
})

router.get(`/specs/:key`, async (req,res)=>{ // Searches for techs with specified specialisation
    try{
        await client.connect();
        let entries = await db.collection(req.params.key).find({}).toArray();
        entries.sort((a,b) => a.value - b.value);
        entries.reverse();
        res.status(200).send(entries);
    }catch(e){
        console.log(e);
        res.status(500).end();
    }
});



/* -------------- SET LAST UPDATE TIME OF ENTRIES ----------------*/

router.get('/upd_time/', async(req, res)=>{
    let updateTimeData;
    try{
        await client.connect();
        updateTimeData = await db.collection('lastUpdateTime').find().toArray();

    }catch(e){
        console.log(e);
        res.status(500).end();
    }finally{
        res.status(200).send(updateTimeData);
    }
});



/* ---------SEARCH FOR NEW ENTRIES USING PYTHON SCRIPT -------------------*/

const searchForOffers = require("./functions/search_for_off/searchForOffers.js");
const isReqBodyOk = require('./functions/search_for_off/isReqBodyOk.js');

router.post('/search_for_off', async (req, res)=>{
    const isReqSafe = isReqBodyOk(req.body.specs);
    if(!isReqSafe){
        longTermRateLimit.blockDuration = 60*60*24;
        longTermRateLimit.consume(req.ip, 1800).then(()=>{res.status(500).end();}).catch(()=>{res.status(500).end();});
        longTermRateLimit.blockDuration = 60*60;
        return;
    }
    longTermRateLimit.consume(req.ip, 400)
    .then(()=>{
        rateLimiter.consume(req.ip, 30)
        .then(async ()=>{
            console.log('Searching for new offers in progress(...) for ip: '+req.ip);
            await searchForOffers(req.body.specs, res, req.ip, client);
        })
        .catch(()=>{
            res.status(429).end('Too Many Requests');
        });
    })
    .catch(()=>{
        res.status(429).end();
    })
});



/* -----------------PUPPETEER - SCRAPE DATA FROM WIKIPEDIA----------------------- */

const scrapeWikipedia = require("./functions/more_info/scrapeWikipedia.js");

router.get('/more_info/:key', async(req, res)=>{ 
    longTermRateLimit.consume(req.ip, 40)
    .then(()=>{
        rateLimiter.consume(req.ip, 20) 
        .then(async ()=>{
            await scrapeWikipedia(req.params.key, res);
        })
        .catch(()=>{
            res.status(429).send('Too Many Requests');
        });
    })
    .catch(()=>{
          console.log("Blocked ip by RateLimiter: "+req.ip);
          res.status(429).send('Way Too Many Requests, try again later...');
    });
});





