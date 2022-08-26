const request = require("request");

function makePostRequest(input) {
  request.post(
    "https://imi-bot-middleware.herokuapp.com/api/v1/socket/sendMessage",
    {
      json: true,
      body: input,
      headers: {
        "content-type": "application/json",
        imi_bot_middleware_token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiVGhpcyBpcyBJTUkgQk9UIG1pZGRsZXdhcmUiLCJpYXQiOjE1Njc4ODc5MTAsImV4cCI6NDE1OTg4NzkxMH0.dYbMaf8HYMD5K532p7DpHN0cmru-JKMjst-WS9zi7u8",
      },
    },
    function (err, res, body) {
      if (!err && res.statusCode === 200) {
        console.log("done");
      }
    }
  );
}

 module.exports = { makePostRequest };