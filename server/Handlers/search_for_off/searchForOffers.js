const py = require('python-shell');
const py_path = process.env.PYTHON_PATH;
const py_script = process.env.PYTHON_SCRIPT_PATH;
const position_types = ["backend", "frontend", "fullstack", "gamedev"];

async function searchForOffers(position, response, req_ip, db){
    let error = false;
    let resp = "";
    try{
        if(position === undefined){
            return response.status(404).end();
        }

        let position_wannabe = position;
        let get_upd_time = [];

        if(position === 'all'){

            for(const position_type of position_types){
                position_wannabe = position_type;
                let temporary_upd_time = await db.db('offerData').collection('lastUpdateTime').find({type: position_wannabe}).toArray();
                if(temporary_upd_time.length > 0) get_upd_time.push(temporary_upd_time);
            }

        }else{
            get_upd_time = await db.db('offerData').collection('lastUpdateTime').find({type: position_wannabe}).toArray();
        }

        if(get_upd_time.length > 0){
            wasItUpdated = true;
            console.log(`This position was already updated... (${position_wannabe})`);
            return response.status(404).end('Position already updated!');
        }
    }catch(e){
        console.log(e);
        error = true;
    };

    if(error) return response.status(404).end();

    let options = {
        mode: 'text',
        pythonPath: py_path,
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: py_script,
        args: [position] //sys.argv[1]
    };

    try{
        const find_ip = await db.db("offerData").collection('searchCount').find({"meta._ip": req_ip}).toArray();
        let search_count_status = find_ip[0].meta.search_count;
        if(search_count_status >= 4){
            console.log(`${req_ip} sent too many requests...`);
            return await response.status(429).end("Too Many Requests");
        }

        try{
            search_count_status += 1;
            const add_to_count = db.db("offerData").collection('searchCount').updateMany({"meta._ip": req_ip},{"$set": {"meta.search_count": search_count_status}});
            return await add_to_count;
        }catch(e){
            console.log(e);
            error = true;
        }finally{
            if(error) return response.status(404).end();
            
            let message_log;
            await py.PythonShell.run('webscraper.py', options).then(messages=>{
                message_log = messages;
            });
            if(message_log == '404') return response.status(404).end();

            for( const e of message_log ){
                resp += e;
            }
            resp = "[" + resp + "]";
            resp = JSON.parse(resp);
            console.log(resp);
        }
        
    }catch(e){
        console.log(e);
        error = true;
    }finally{
        if(error) return response.status(404).end();
        
        return response.status(200).send(resp);
    };   
}

module.exports = searchForOffers;