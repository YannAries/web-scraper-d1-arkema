const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const ObjectsToCsv = require('objects-to-csv');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'shell',
            args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        await page.goto('https://www.fff.fr/competition/engagement/407655-d1-arkema/phase/1/classement.html', { waitUntil: 'networkidle2', timeout: 0 });
        /*         await page.goto('https://www.fff.fr/competition/engagement/394572-d1-arkema/phase/1/classement.html', { waitUntil: 'networkidle2', timeout: 0 });
         */
        const d1ArkemaTable = await page.$$eval("table > tbody > tr", rows => {
            return rows.map(row => {
                const cells = Array.from(row.cells).map(cell => cell.innerText);
                return {
                    team: cells[2],
                    points: cells[3],
                    played: cells[4],
                    win: cells[5],
                    draw: cells[6],
                    lost: cells[7],
                    goalFor: cells[9],
                    goalAgainst: cells[10],
                    penaltyKick: cells[11],
                    goalDiff: cells[12],
                };
            });
        });

        // Debug
        /* console.log(d1ArkemaTable); */

        // Ensure the directory exists
        const screenshotDir = './dist/assets/image';
        const screenshotPath = path.join(screenshotDir, 'screenshot.png');
        ensureDirSync(screenshotDir);

        await page.screenshot({ path: screenshotPath, fullPage: true });

        const csv = new ObjectsToCsv(d1ArkemaTable);
        await csv.toDisk('./dist/assets/d1ArkemaData.csv', { bom: true });


        console.log('Data extraction and saving completed successfully.');
    } catch (err) {
        console.error(`Failed to capture screenshot & data: ${err}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();

function ensureDirSync(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}
