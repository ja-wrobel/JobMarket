
async function isReqParamOk(req, client){
    let error = false;
    let entry;
    try{
        await client.connect();
        entry = await client.db("offerData").collection('langsCount').find({"name": req.params.key}).toArray();
        await client.close();
    }
    catch(e){
        console.log(`Error while searching "langsCount" collection\n${e}`);
        error = true;
    }
    finally{
        if(error) return false;

        if(entry.length < 1) return false;

        return true;
    }
}

module.exports = isReqParamOk;