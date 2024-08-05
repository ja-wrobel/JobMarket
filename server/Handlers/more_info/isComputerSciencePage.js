
async function isComputerSciencePage(page, response) {
    let error = false;
    // Add keywords that indicate the page is related to computer science
    const computerScienceKeywords = ["Programming","programming", "Framework","framework", "Database","database", "Software","software", "Development","development"];
    let content;
    try{
        const infoTable = await page.$x('/html/body/div[2]/div/div[3]/main/div[3]/div[3]');
        content = await page.evaluate(el => el.innerText, infoTable[0]);
    }catch(e){
        console.error(`Error processing ${tech}: ${e}`);
        error = true;
    }
    if(error) return false;

    let keyword_count = 0;
    for(const keyword of computerScienceKeywords){
        const bool = await content.includes(keyword);
        if(bool){
            keyword_count++;
        }
    }
    if(keyword_count >= 4){
        return true;
    }
    const h2Related = async (page)=>{
        const relatedH2Elements = ["Computing", "Brands", "may refer", "Software"];
        for(const key of relatedH2Elements){
            const itIs = await page.includes(key);
            if(itIs){
                console.log(key);
                return true;
            }
        }
        return false;
    }
    // if this try is triggered, then this page is either not computer related or wikipedia navigated us to page where you choose which article you wanna read (or keyword count isn't very efficient)
    try{
        const body_on_search = await page.$x('/html/body/div[2]/div/div[3]/main/div[3]');
        const many_articles_content = await page.evaluate(el => el.innerText, body_on_search[0]);
        const anyArticleRelated = await h2Related(many_articles_content);

        if(!anyArticleRelated){ return false; }

        for(const keyword of computerScienceKeywords){
            const linkRelated = await many_articles_content.includes(keyword);
            if(linkRelated){
                const [a] = await page.$x(`//a[contains(., '${keyword}')]`);
                console.log(keyword);
                let new_article_loaded;
                try{
                    await a.click();
                    new_article_loaded = await page.waitForXPath('/html/body/div[2]/div/div[3]/main/div[1]/div/div[1]/nav/div[1]/div/ul/li[1]/a/span');
                }catch(e){
                    console.error(`Error processing ${tech}: ${e}`);
                    error = true;
                }
                finally{
                    if(error) return false;
                    if(new_article_loaded) return true;
                    else{return false;}
                }
            }
        }
        return false;
    }catch(e) {
        console.error(`Error processing ${tech}: ${e}`);
        error = true;
    }
    if(error) return false;
}
module.exports = isComputerSciencePage;