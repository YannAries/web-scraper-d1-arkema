const UserAgent = require('user-agents');
const axios = require('axios');
const url = 'https://www.fff.fr/competition/engagement/394572-d1-arkema/phase/1/classement.html';
const cheerio = require('cheerio');
const ObjectsToCsv = require('objects-to-csv-delimited');
const d1ArkemaTable = [];

const puppeteer = require('puppeteer-extra'); // Enable stealth plugin with all evasions
puppeteer.use(require('puppeteer-extra-plugin-stealth')())

    ; (async () => {
        try {
            const userAgent = new UserAgent();
            console.log(userAgent.toString());
            console.log(JSON.stringify(userAgent.data, null, 2)); // Generate a random new agent

            const browser = await puppeteer.launch({ // Launch the browser in headless mode and set up a page
                args: ['--no-sandbox'],
                headless: true
            });
            const page = await browser.newPage();
            const testUrl = (url); // Navigate to the page that will perform the tests
            await page.goto(testUrl);
            
            const res = await axios(url);
            console.log('Loading tables');
            console.log(res.status); // Set the response status
            const html = await res.data;
            const $ = cheerio.load(html);
            const allTableRows = $("table > tbody > tr");
            allTableRows.each((_index, element) => {
                const tds = $(element).find('td');
                const team = $(tds[2]).text();
                const points = $(tds[3]).text();
                const played = $(tds[4]).text();
                const win = $(tds[5]).text();
                const draw = $(tds[6]).text();
                const lost = $(tds[7]).text();
                const goalFor = $(tds[9]).text();
                const goalAgainst = $(tds[10]).text();
                const penaltyKick = $(tds[11]).text();
                const goalDiff = $(tds[12]).text();
                d1ArkemaTable.push({
                    'team': team,
                    'points': points,
                    'played': played,
                    'win': win,
                    'draw': draw,
                    'lost': lost,
                    'goalFor': goalFor,
                    'goalAgainst': goalAgainst,
                    'penaltyKick': penaltyKick,
                    'goalDiff': goalDiff
                });
            });
            const screenshotPath = '/tmp/headless-test-result.png'; // Save a screenshot of the results
            await page.screenshot({ path: screenshotPath });
            console.log('Have a look at the screenshot:', screenshotPath);
            console.log('Saving data to CSV file');
            const csv = new ObjectsToCsv(d1ArkemaTable);
            await csv.toDisk('./d1ArkemaData.csv');
            console.log('Data saved to CSV file');
            await browser.close();
        } catch (err) {
            console.log('Something is wrong!');
            console.log(err);
        }
    })();