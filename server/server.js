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
//
//
const secureXSRF = require("./functions/global/secureXSRF.js");

app.use(cors(corsOptions));
app.use(setCorsHeaders);
app.use(helmet());
app.use(rateLimiterMiddleware);
//app.use(secureXSRF());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);
/*
async function waitForToken(req, res, next){
    await secureXSRF(req, res, client, db, router);
    next();
}
app.use(waitForToken);
*/
app.listen(env_var.port, async ()=>{
    console.log(`Server is running at ${env_var.this_url}:${env_var.port}`);
    console.log(new Date());
})


/* ------------- GET ENTRIES FROM DATABASE ---------------- */

router.get('/auth/*', async (req, res) => {
    try{
        await client.connect();
        let get_token = await db.collection('auth').find({"_ip": req.ip}).toArray();
        if(get_token.length === 0){
            //console.log('inserted');
            return db.collection('auth').insertOne({"_ip": req.ip});
        }
    }catch(e){
        console.log(e);
        return res.sendStatus(500);
    }finally{
        res.setHeader('X-Xsrf-Token', 'correct');
        return res.status(200).send({token: 'correct'});
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

    const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) => // >>
    s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h)); // ID for not updated records <<

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





