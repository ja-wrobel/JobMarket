const puppeteer = require('puppeteer');
const isComputerSciencePage = require("./isComputerSciencePage.js");
const correctLinks = require("./correctLinks.js");

async function scrapeWikipedia(tech, response) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    let content = {
        first_p: '',
        second_p: '',
        table: '',
        href: ''
    };
    console.log(tech);
    switch(tech){
        case "C#":
            tech = "C_Sharp_(programming_language)";
            break;
        case "Java":
            tech = "Java_(programming_language)";
            break;
        case "C":
            tech = "C_(programming_language)";
            break;
        case "Hibernate":
            tech = "Hibernate_(framework)";
    }
    try {
        await page.goto(`https://en.wikipedia.org/wiki/${tech}`);
        await page.waitForXPath('/html/body/div[2]/div/div[3]/main/div[1]/div/div[1]/nav/div[1]/div/ul/li[1]/a/span').
        then(async()=>{
            const title = await page.$eval('#firstHeading', el => el.textContent);
            const isCSPage = await isComputerSciencePage(page);
            // Check if the page is related to computer science
            if (isCSPage) {
                console.log(`Technology: ${tech}`);
                console.log(`Title: ${title}`);
    
                const firstParagraph = await page.$x('//p');
                const secondParagraph = await page.$x('/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]/p[3]');
                const table = await page.$x('/html/body/div[2]/div/div[3]/main/div[3]/div[3]/div[1]/table[1]');
    
                if(firstParagraph[0] !== undefined){
                    content.first_p = await page.evaluate(el => el.innerHTML, firstParagraph[0]);
                }
                if(secondParagraph[0] !== undefined){
                    content.second_p = await page.evaluate(el => el.innerHTML, secondParagraph[0]);
                }
                if(table[0] !== undefined){
                    content.table = await page.evaluate(el => el.innerHTML, table[0]);
                }
                content.href = page.url();
    
                content = await correctLinks(content, tech);
            } else {
                console.log(`Skipping ${tech} - Not related to computer science\n`);
            }
        });
    } catch (e) {
        console.error(`Error processing ${tech}: ${e}`);
        return await response.status(404).end();
    } finally {
        await browser.close();
        return await response.status(200).send(content);
    }
}

module.exports = scrapeWikipedia;