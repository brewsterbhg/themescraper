const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const startUrl = 'https://moz.com/top500';

axios(startUrl).then(async response => {
    const $ = cheerio.load(response.data);
    let urls = [];
    $('.url').each((i, el) => {
        if (i < 1) {
            urls.push(`https://${$(el).children().first().text().trim()}`);
        }
    });

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const results = [];

        page.on('console', pageLogToConsole);

        for (let i = 0; i < urls.length; i++) {
            await page.goto(urls[i], { waitUntil: 'load' });
            const pageData = await scrape(page);
            console.log(pageData)
            results.push(pageData);
        }

        await browser.close();
        //console.log(results);
    } catch (err) {
        console.log(`Puppeteer Error occurred: ${err}`);
    }
}).catch(err => {
    console.log(err);
});

scrape = async (page) => {
    try {
        return await page.evaluate(() => {
            const IGNORED_TAGS = ['HTML', 'HEAD', 'META', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'LINK', 'IFRAME', 'INPUT', 'OPTION'];
            const styleList = [];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
            
            while(walker.nextNode()) {
                if (IGNORED_TAGS.includes(walker.currentNode.nodeName))
                    continue;

                const styles = getComputedStyle(walker.currentNode);

                styleList.push({
                    [walker.currentNode.nodeName]: {
                        background: styles.getPropertyValue('background'),
                        backgroundColor: styles.getPropertyValue('background-color'),
                        color: styles.getPropertyValue('color')
                    }
                })
                //console.log(walker.currentNode.nodeName + ": " + styles.getPropertyValue('color'));
            }
            return styleList;
        });        
    } catch (err) {
        return new Error(`Error occurred scraping page data: ${err}`);
    }
}

pageLogToConsole = msg => {
    console.log(msg.text());
}