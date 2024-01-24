const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const router = express.Router();
const path = require('path');
const { MongoClient, ServerApiVersion, Timestamp } = require('mongodb');
const uri = process.env.URI_DATABASE;
const port = process.env.PORT || 8080;
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});
const db = client.db("offerData");

app.use(cors({origin: true, credentials: true}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', router);

app.listen(port, async ()=>{
  console.log(`Server is running at http://localhost:${port}`);
})


/* ------------- GET ENTRIES FROM DATABASE ---------------- */



router.get('/', async (req, res)=>{
  res.header( "Access-Control-Allow-Origin", "*" ); // -->
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // -->
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept"); //it's weird but it did help <--
  try{
    try{
      await client.connect();
      let display = await db.collection('langsCount').find({}).toArray();
      display.sort((a,b) => a.value - b.value);
      display.reverse();
      res.status(200).send(display);
    }catch(e){
      console.log(e);
    }
  }catch(e){
    console.log(e);
  }
})

router.get(`/specs/:key`, async (req,res)=>{ // Searches for techs with specified specialisation
  res.header( "Access-Control-Allow-Origin", "*" );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
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
  let lastUpdateTime;
  let updateTimeData;
  try{
    try{
      await client.connect();

      const ObjectId = (m = Math, d = Date, h = 16, s = s => m.floor(s).toString(h)) => // >>
      s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h)); // ID for not updated records <<

      updateTimeData = await db.collection('lastUpdateTime').find({type: req.params.key}).toArray();
      if(updateTimeData.length < 1){
        updateTimeData.push({
          _id: ObjectId(),
          type: req.params.key
        });
        res.send(updateTimeData);
      }else{
        lastUpdateTime = await db.collection('lastUpdateTime').find({_id: updateTimeData.length, type: req.params.key}).toArray();
        res.send(lastUpdateTime);
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
  console.log('Searching for new offers in progress(...)');
  await searchForOffers(req.body.specs, res);
  console.log('Search is finished, user redirected!');
});



/* -----------------PUPPETEER - SCRAPE DATA FROM WIKIPEDIA----------------------- */

const scrapeWikipedia = require("./functions/more_info/scrapeWikipedia.js");

router.get('/more_info/:key', async(req, res)=>{
  await scrapeWikipedia(req.params.key, res);
});





