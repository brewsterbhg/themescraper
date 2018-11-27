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
            results.push(pageData);
        }

        await browser.close();
        console.log(results);
    } catch (err) {
        console.log("Puppeteer Error occurred!");
    }
}).catch(err => {
    console.log(err);
});

scrape = async (page) => {
    try {
        return await page.evaluate(async () => {
            const ignoreTags = ["style", "script"];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
            const styleList = [];

            while ((node = walker.nextNode()) !== null) {
                const parent = node.parentNode.tagName;

                if (ignoreTags.includes(parent)) {
                    continue;
                }
                
                const styles = getComputedStyle(node);

                if (!styles) {
                    continue;
                }

                styleList.push(styles);
            }
            console.log(styleList);
            return styleList;
        });        
    } catch (err) {
        return new Error(`Error occurred scraping page data: ${err}`);
    }
}

parseBody = body => {
    console.log(body);
}

pageLogToConsole = msg => {
    console.log(msg.text());
}