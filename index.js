const express = require("express");
const {scrape} = require("./scrape");
const serverless = require("serverless-http");
var cors = require("cors");
const {makePostRequest} = require("./ajax");
const app = express();
const {engine}  = require('express-handlebars');
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

const port = process.env.port || process.env.PORT || 3000;

// disable cors for all requests to the server in express
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();// this is dummy
});

const socketBody = {
    "consumer": {
        "namespace": "BOT",
        "enterprise_id": "50001"
    },
    "event": "test",
    "payload": null
}

app.get('/api/test', (req, res) => {
  // Render a Handlebars template
  res.render('home', { title: 'Express with Handlebars. this is test' });
});

app.get("/", async (req, res) => {
  
  console.log(req.query.url);
  try{
    let data =  await scrape("https://www.wikihow.com/Fix-Neck-Pain", (detail) => {
    // call imi middleware function api
    console.log('ajaxcb', detail);
    // socketBody.payload = detail;
    // makePostRequest(socketBody);
  });


  res.render('home', { qa: data.answerObj });
  }catch(e){
    console.log("----ERROR--------");
    console.log(e)
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

  // res.setHeader("Content-Type", "application/json");
  // res.end(JSON.stringify({ ...data }, null, 3));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
