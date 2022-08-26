const { scrape } = require("./scrape");

// create immediate async function
(async () => {
    let data = await scrape(
      "https://experience.imiconnect.io/faqs/",
      true
    );
    console.log(data);
    }
)();
