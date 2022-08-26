const { scrape } = require("./scrape");

// create immediate async function
(async () => {
    let data = await scrape(
      "https://www.passportindia.gov.in/AppOnlineProject/online/faqServicesAvailable",
      true
    );
    console.log(data);
    }
)();
