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
        console.log(req.ip);
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
//
//
app.use(cors(corsOptions));
app.use(helmet());
app.use(rateLimiterMiddleware);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

app.listen(env_var.port, async ()=>{
  console.log(`Server is running at ${env_var.this_url}:${env_var.port}`);
  console.log(new Date());
})


/* ------------- GET ENTRIES FROM DATABASE ---------------- */



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
  }
  finally{
    try{
      let display = await db.collection('langsCount').find({}).toArray();
      display.sort((a,b) => a.value - b.value);
      display.reverse();
      res.status(200).send(display);
    }catch(e){console.log(e);}
  }
})

router.get(`/specs/:key`, async (req,res)=>{ // Searches for techs with specified specialisation
  try{
    try{
      await client.connect();
      let entries = await db.collection(req.params.key).find({}).toArray();
      entries.sort((a,b) => a.value - b.value);
      entries.reverse();
      res.status(200).send(entries);
    }catch(e){
      console.log(e);
    }
  }catch(e){
    console.log(e);
  }
});



/* -------------- SET LAST UPDATE TIME OF ENTRIES ----------------*/


router.get('/upd_time/:key', async(req, res)=>{
  let updateTimeData;
  try{
    try{
      await client.connect();

      const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) => // >>
      s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h)); // ID for not updated records <<

      updateTimeData = await db.collection('lastUpdateTime').find({type: req.params.key}).toArray();
      if(updateTimeData.length < 1){
        updateTimeData = {
          _id: ObjectId(),
          type: req.params.key
        };
        res.send(updateTimeData);
      }else{
        res.send(updateTimeData[(updateTimeData.length-1)]);
      }
    }catch(e){
      console.log(e);
    }
  }catch(e){
    console.log(e);
  }
});

router.get('/set_upd_time/:key', async (req, res)=>{
  let updateTimeData;
  let date = new Date();
  try{
    await client.connect();
    updateTimeData = await db.collection('lastUpdateTime').find({type: req.params.key}).toArray();
    let query = db.collection('lastUpdateTime').insertOne({"date": date, "_id": updateTimeData.length+1, "type": req.params.key});
    console.log(query);
    return query;
  }catch(e){
    console.log(e);
  }
  finally{
    res.status(200).send(date);
  }
})



/* ---------SEARCH FOR NEW ENTRIES USING PYTHON SCRIPT -------------------*/

const searchForOffers = require("./functions/search_for_off/searchForOffers.js");

router.post('/search_for_off', express.json(), async (req, res)=>{
  rateLimiter.consume(req.ip, 30)
    .then(async ()=>{
      console.log('Searching for new offers in progress(...) for ip: '+req.ip);
      await searchForOffers(req.body.specs, res, req.ip, client);
    })
    .catch(()=>{
      res.status(429).send('Too Many Requests');
    });
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





