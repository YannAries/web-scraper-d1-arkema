const puppeteer = require('puppeteer');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 800 });

        // Go to the FFF webpage and set a timeout
        await page.goto('https://www.fff.fr/competition/engagement/394572-d1-arkema/phase/1/classement.html', { waitUntil: 'networkidle2', timeout: 0 });

        // Optimize the wait times here or add improvements in the page.$$eval commands
        const d1ArkemaTable = await page.$$eval("table > tbody > tr", rows => {
            return rows.map(row => {
                const cells = [...row.cells].map(cell => cell.innerText);
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

        // Screenshot of the FFF webpage
        await page.screenshot({ path: './dist/assets/image/screenshot.png', fullPage: true });

        // Export data collected as CSV
        const ObjectsToCsv = require('objects-to-csv');
        const csv = new ObjectsToCsv(d1ArkemaTable);
        await csv.toDisk('./dist/assets/d1ArkemaData.csv');

        console.log('Tout est parfait !');
    } catch (err) {
        console.error(`Failed to capture screenshot & data: ${err}`);
    } finally {
        // Close the browser at the end of the operation
        if (browser) {
            await browser.close();
        }
    }
})();