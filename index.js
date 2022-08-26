const express = require("express");
const {scrape} = require("./scrape");
const app = express();
const port = process.env.port || process.env.PORT || 3000;

app.get("/", async (req, res) => {
  console.clear();

  let data =  await scrape(req.query.url);
  // res.json(data);
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ ...data }, null, 3));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

