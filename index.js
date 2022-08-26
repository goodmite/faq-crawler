const express = require("express");
const {scrape} = require("./scrape");
var cors = require("cors");
const {makePostRequest} = require("./ajax");



const app = express();
const port = process.env.port || process.env.PORT || 3000;

// disable cors for all requests to the server in express
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const socketBody = {
    "consumer": {
        "namespace": "BOT",
        "enterprise_id": "50001"
    },
    "event": "test",
    "payload": null
}



app.get("/", async (req, res) => {
  
  console.log(req.query.url);
  let data =  await scrape(req.query.url, (detail) => {
    // call imi middleware function api
    console.log('ajaxcb', detail);
    socketBody.payload = detail;
    makePostRequest(socketBody);
  });

  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ...data }, null, 3));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

