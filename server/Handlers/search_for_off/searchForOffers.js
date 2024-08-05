const py = require('python-shell');
const py_path = process.env.PYTHON_PATH;
const py_script = process.env.PYTHON_SCRIPT_PATH;
const position_types = ["backend", "frontend", "fullstack", "gamedev"];

async function searchForOffers(position, response, req_ip, db){
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
        return response.status(404).end(e);
    };

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
            console.log(`This client ${req_ip} sent too many requests...`);
            return await response.status(429).end("Too Many Requests");
        }

        try{
            search_count_status += 1;
            const add_to_count = db.db("offerData").collection('searchCount').updateMany({"meta._ip": req_ip},{"$set": {"meta.search_count": search_count_status}});
            return await add_to_count;
        }catch(e){
            console.log(e);
            return response.status(500).end();
        }finally{
            await py.PythonShell.run('webscraper.py', options).then(messages=>{
                console.log(messages.toString());
            });
        }
        
    }catch(e){
        console.log(e);
        return response.status(404).end(e);
    }finally{
        return response.status(200).end();
    };   
}

module.exports = searchForOffers;