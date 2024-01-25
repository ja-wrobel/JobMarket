const py = require('python-shell');

async function searchForOffers(position, response, req_ip, db){
    let wasItUpdated= false; // Flag validates whether given position was already updated (in case something on client-side went wrong)
    try{
        if(position === undefined){
            return response.status(404).end();
        }else{
          let position_wannabe = position;
          if(position === 'all'){
            position_wannabe = 'backend';
          }
          await fetch(`http://localhost:8080/upd_time/${position_wannabe}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            mode: 'cors',
          })
          .then(resp => {
            return resp.json();
          })
          .then(data => {
            if(data.date !== undefined){
              wasItUpdated = true;
              return response.status(404).end();
            }
          })
        }
    }catch(e){
      console.log(e);
      return response.status(404).end(e);
    };
    let options = {
        mode: 'text',
        pythonPath: 'C:/Python39/python.exe',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: 'D://Work/NodeJS/JobMarket/Python/',
        args: [position] //sys.argv[1]
    };
    try{
      await db.connect();
      const find_ip = await db.db("offerData").collection('searchCount').find({"meta._ip": req_ip}).toArray();
      let search_count_status = find_ip[0].meta.search_count;
      if(search_count_status >= 4){
        console.log(`This client ${req_ip} sent too many requests...`);
        return await response.status(429).end("Too Many Requests");
      }
      if(wasItUpdated === false){
        try{
          search_count_status += 1;
          const add_to_count = db.db("offerData").collection('searchCount').updateMany({"meta._ip": req_ip},{"$set": {"meta.search_count": search_count_status}});
          return await add_to_count;
        }catch(e){
          console.log(e);
        }finally{
          await py.PythonShell.run('webscraper.py', options).then(messages=>{
              console.log(messages.toString());
          });
        }
      }else{
        console.log(`This position (${position}) was already updated`);
        return await response.status(404).end("This position was already updated");
      }
    }catch(e){
      console.log(e);
      return response.status(404).end(e);
    }finally{
      return response.status(200).end();
    };   
}

module.exports = searchForOffers;