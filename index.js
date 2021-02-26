const { chromium } = require("playwright");
require("dotenv").config();
var sendMessage = require("./sendMessage");
var Links = require('./links.js');
const readline = require('readline');

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const handleStockAvailability = async (
    link,
    stockFound,
    page
  ) => {
    if (!stockFound) {
      console.log(`Still no stock for ${link.name}`);
      return;
    }
    console.log(`🚨 ${" "}There might be a ${link.name} in stock at ${link.url}`);
    await sendMessage(link);
  };

function askQuestion(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}

(async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    let first = true
    while (true) {
        for(item of Links) {
            await page.goto(item.url);

            if (first) {
                const question = await askQuestion('are you ready?')
                first = false
            }

            if (item.type === 'FNAC') {
                const addToCartButton = await page.$('[class="f-buyBox-availabilityStatus-unavailable"]');
                await handleStockAvailability(item, !addToCartButton, page);
              }
        }
        sleep(1000)
    }
    await browser.close();
})();