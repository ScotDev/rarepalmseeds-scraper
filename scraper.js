const puppeteer = require('puppeteer');
const rootURL = "https://www.rarepalmseeds.com/index.php?route=product/search&search=";
const fullURL = "https://www.rarepalmseeds.com/index.php?route=product/search&search=phoenix";
let queryTerm = "phoenix";


const run = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setRequestInterception(true);

    // Blocks images and CSS load to improve response time
    page.on('request', (req) => {
        if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
            req.abort();
        }
        else {
            req.continue();
        }
    });

    // await page.goto(`rootURL${queryTerm}`);
    await page.goto(fullURL);

    const scrapedData = await page.evaluate(() => {
        let items = document.querySelector("div.product-grid > div");
        let details = Array.from(items.children)

        let product = details.map(details => {
            let name = document.querySelector("div.product-grid > div > div.name > a").innerText;
            let nameParts = name.split("\n", 2);
            let commonName = nameParts[1];
            let latinName = nameParts[0]
            let fullName = `${commonName} - ${latinName}`;


            let price = document.querySelector("div.product-grid > div > div.price").innerText;
            let priceParts = price.split("\n", 1).toString();
            let priceParts2 = priceParts.split(" ", 3);
            let numericalPrice = parseFloat(priceParts2[2]);

            let stock = document.querySelector("div.product-grid > div > div.price > span.price-stock").innerText;
            return {
                fullName, commonName, latinName, priceParts, stock, numericalPrice
            };
        });
        return product;

    });



    console.log(scrapedData);
    await page.close();
    await browser.close();
}

run();