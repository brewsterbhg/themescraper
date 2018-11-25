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
        puppeteer
            .launch()
            .then(browser => {
                return browser.newPage();
            })
            .then(page => {
                return urls.map(url => {
                    page.goto(url).then(() => {
                        return page.content();
                    }).catch(err => {
                        console.log(err);
                    });
                });
            })
            .then(html => {
                console.log(html);
            })
            .catch(err => {
                console.log(err);
            });
    }).catch(err => {
        console.log(err);
    });