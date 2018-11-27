const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const startUrl = 'https://moz.com/top500';

axios(startUrl)
    .then(response => {
        const $ = cheerio.load(response.data);
        let urls = [];
        $('.url').each((i, el) => {
            urls.push(`https://${$(el).children().first().text().trim()}`);
        });

        (async () => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            for (let i = 0; i < urls.length; i++) {
                await page.goto(urls[i], { waitUntil: 'load' });
                console.log(page);
            }

            await browser.close();
        })();
    }).catch(err => {
        console.log(err);
    });