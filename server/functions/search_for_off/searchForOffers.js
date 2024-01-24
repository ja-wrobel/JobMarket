const py = require('python-shell');

async function searchForOffers(position, response){
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
            if(data[0].date !== undefined){
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
      if(wasItUpdated === false){
        await py.PythonShell.run('webscraper.py', options).then(messages=>{
            console.log(messages.toString());
        });
      }else{
        console.log(`Something went wrong on client side, because this position (${position}) was already updated...`);
        return;
      }
    }catch(e){
      console.log(e);
      return response.status(404).end(e);
    }finally{
      return response.status(200).end();
    };   
}

module.exports = searchForOffers;