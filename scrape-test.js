const puppeteer = require("puppeteer");


// this function will be executed in the browser context
// it should creates an alert after some time interval
const codeToBeEvaluated = async () => {
  let index_2 = 0;

  // a promise that resolves after ms*1000 seconds
  async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  // await within function's while loop
  async function whileWrapper() {
    while (index_2 < 10) {
      await sleep(1000);
      alert("hello " + index_2); // LINE A: does NOT execute at all
      index_2++;
    }
  }

  await whileWrapper();
};

async function main(url) {
  const browser = await puppeteer.launch({
    // headless: false,
    devtools: true,
    // args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto(url);

  await page.evaluate(codeToBeEvaluated);

  browser.close();
}

main("https://www.google.com/search?q=hello");
