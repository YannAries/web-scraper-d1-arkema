const UserAgent = require('user-agents');
const axios = require('axios');
const cheerio = require('cheerio');
const ObjectsToCsv = require('objects-to-csv-delimited');
const d1ArkemaTable = [];

(async () => {
    try {
        const userAgent = new UserAgent();
        console.log(userAgent.toString());
        console.log(JSON.stringify(userAgent.data, null, 2)); // Generate a random new agent
        const res = await axios('https://www.fff.fr/competition/engagement/394572-d1-arkema/phase/1/classement.html');
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
        console.log('Saving data to CSV file');
        const csv = new ObjectsToCsv(d1ArkemaTable);
        await csv.toDisk('./d1ArkemaData.csv');
        console.log('Data saved to CSV file');
    } catch (err) {
        console.log('Something is wrong!');
        console.log(err);
    }
})();