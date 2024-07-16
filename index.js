const express = require("express");
const { scrape } = require("./scrape");
const serverless = require("serverless-http");
var cors = require("cors");
const { makePostRequest } = require("./ajax");
const app = express();
const { engine } = require("express-handlebars");
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const port = process.env.port || process.env.PORT || 3003;

const allowedOrigins = [
  "https://staging.webexbotbuilder.com",
  "https://preprod.webexbotbuilder.com",
  "https://webexbotbuilder.com",
  "https://cdpn.io",
  "http://localhost:4201",
];

app.use(function (req, res, next) {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get("/health", (req, res) => {
  // Render a Handlebars template
  res.send("health check good");
});

app.post("/faq/v1/extractByUrl/Hierarchy", async (req, res) => {
  const url = req.query.url || req.body.url;
  const access_token = req.body.access_token;
  try {
    if (url) {
      let data = await scrape(url, (detail) => {});
      res.json(data.answerObj.map((e) => ({ ...e, category: url })));
    } else {
      throw "no url";
    }
  } catch (e) {
    console.log("----ERROR--------");
    console.log(e);
    res.send(`
      pls append url like this: ?url=https://www.banking.barclaysus.com/faq.html
      OR checkout below urls:
      <ul>
        <li> <a target="_blank" href="/?url=https://experience.imiconnect.io/faqs/">/?url=https://experience.imiconnect.io/faqs/</a> </li>
        <li> <a target="_blank" href="/?url=https://www.banking.barclaysus.com/faq.html">/?url=https://www.banking.barclaysus.com/faq.html</a> </li>
        <li> <a target="_blank" href="/?url=https://www.passportindia.gov.in/AppOnlineProject/online/faqServicesAvailable">/?url=https://www.passportindia.gov.in/AppOnlineProject/online/faqServicesAvailable</a> </li>
        <li> <a target="_blank" href="/?url=https://www.japan.travel/en/plan/faq/">/?url=https://www.japan.travel/en/plan/faq/</a> </li>
        <li> <a target="_blank" href="/?url=https://www.wtm.com/atm/ar-ae/help/faqs.html">/?url=https://www.wtm.com/atm/ar-ae/help/faqs.html</a> </li>
        <li> <a target="_blank" href="/?url=https://jedge.tv/en/faqs-2/">/?url=https://jedge.tv/en/faqs-2/</a> </li>
        <li> <a target="_blank" href="/?url=https://telfordbasics.com/pages/faq">/?url=https://telfordbasics.com/pages/faq</a> </li>
      </ul>
    `);
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
