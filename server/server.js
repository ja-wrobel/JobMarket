// NPM packages imports
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const router = express.Router();
const path = require('path');
const helmet = require('helmet');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { RateLimiterMemory } = require('rate-limiter-flexible');
//

// ENV variables
const env_var = {
    db_uri: process.env.URI_DATABASE,
    port: process.env.PORT || 8080,
    this_url: process.env.URL || "http://localhost",
    client_url: process.env.CLIENT_URL
}
//

// MONGO setup
const client = new MongoClient(env_var.db_uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const db = client.db("offerData");
//

// RateLimiter setup (anti DDOS)
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
//

// CORS setup
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Access-Control-Request-Methods, Content-Type, Xsrf-Token, U_id');
    next();
}
//

// Middleware
const secureXSRF = require("./Middleware/auth/secureXSRF.js");

app.use(cors(corsOptions));
app.use(setCorsHeaders);
app.use(helmet());
app.use(rateLimiterMiddleware);
app.use(secureXSRF(client, db));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);
//

// RUN SERVER
const server = app.listen(env_var.port, async ()=>{
    console.log(`Server is running at ${env_var.this_url}:${env_var.port}`);
    console.log(new Date());
})
server.maxHeadersCount = 0; // Websocket vulnerability workaround. Could be repaired by puppeteer update as well, 
                            // but in new puppeteer version xpath is not supported, so I would need to rewrite scraping.
//

// ROUTES

/* AUTHORIZE */
const {tokenControl} = require("./Controllers/authMiddleware/tokenController.js");

router.get('/auth', async (req, res) => {
    let error = false;
    const user = new tokenControl( req, res, db.collection('auth') );
    try{
        await client.connect();
        const data = await user.findUser();

        if( data.length > 0 ){
            user.updateUser(data[0].user._id, data[0].token._token);
            user.setClientId(data[0].user._id);
            user.setCreatedAt( new Date( data[0].date ) );
            return user;
        }
        user.insertUser();
    }catch(e){
        console.log(e);
        error = true;
    }finally{
        if(error) return res.status(404).end();

        user.token = user.encrypt(user.token);

        return res.status(200).send( user.getUser() );
    }
})

/* ------------- GET ENTRIES FROM DATABASE ---------------- */
router.get('/', async (req, res)=>{
    let entries;
    let error = false;
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
        error = true;
    }
    finally{
        if(error) return res.status(404).end();
        try{
            entries = await db.collection('langsCount').find({}).toArray();
            entries.sort((a,b) => a.value - b.value);
            entries.reverse();
        }catch(e){
            console.log(e);
            error = true;
        }
        finally{
            if(error) return res.status(404).end();
            return res.status(200).send(entries);
        }
    }
})

router.get(`/specs/:key`, async (req,res)=>{ // Searches for techs with specified specialisation
    let entries;
    let error = false;
    try{
        await client.connect();
        entries = await db.collection(req.params.key).find({}).toArray();
        entries.sort((a,b) => a.value - b.value);
        entries.reverse();
    }catch(e){
        console.log(e);
        error = true;
    }finally{
        if(error) return res.status(404).end();
        return res.status(200).send(entries);
    }
});



/* -------------- GET LAST UPDATE TIME OF ENTRIES ----------------*/
router.get('/upd_time/', async(req, res)=>{
    let error = false;
    let updateTimeData;
    try{
        await client.connect();
        updateTimeData = await db.collection('lastUpdateTime').find().toArray();

    }catch(e){
        console.log(e);
        error = true;
    }finally{
        if(error) return res.status(404).end();
        res.status(200).send(updateTimeData);
    }
});



/* ---------SEARCH FOR NEW ENTRIES USING PYTHON SCRIPT -------------------*/
const searchForOffers = require("./Handlers/search_for_off/searchForOffers.js");
const isReqBodyOk = require('./Handlers/search_for_off/isReqBodyOk.js');

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
const scrapeWikipedia = require("./Handlers/more_info/scrapeWikipedia.js");
const isReqParamOk = require("./Handlers/more_info/isReqParamOk.js"); 

router.get('/more_info/:key', async(req, res)=>{ 

    const isParamOk = await isReqParamOk(req, client);
    if( !isParamOk ) return res.status(404).end();

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





