
async function correctLinks(data, title){
    data.first_p = await data.first_p.replaceAll(`href="/wiki`, `target="_blank" href="https://en.wikipedia.org/wiki`);
    data.second_p = await data.second_p.replaceAll(`href="/wiki`, `target="_blank" href="https://en.wikipedia.org/wiki`);
    data.table = await data.table.replaceAll(`href="/wiki`, `target="_blank" href="https://en.wikipedia.org/wiki`);
  
    data.first_p = await data.first_p.replaceAll(`href="#`, `target="_blank" href="https://en.wikipedia.org/wiki/${title}#`);
    data.second_p = await data.second_p.replaceAll(`href="#`, `target="_blank" href="https://en.wikipedia.org/wiki/${title}#`);
    data.table = await data.table.replaceAll(`href="#`, `target="_blank" href="https://en.wikipedia.org/wiki/${title}#`);
    
    return await data;
}
module.exports = correctLinks;