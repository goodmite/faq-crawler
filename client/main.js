let isInitDone = false;
let socket;
function initAllEvents() {
    socket.on("test", (data) => {
      console.log(data);  
       document.querySelector("#send").textContent = "send";
      document.querySelector("#status").innerHTML = JSON.stringify(data, null, 3);
    });
}
function initializeSocketConnection(socketData) {
  if (!isInitDone) {
    // const url "https://rtm" + environment.backend_root.replace("https://", ".");
    const url = 'https://imi-bot-middleware.herokuapp.com';
    // const url = 'http://localhost:3000';
    socket = io(url, { query: `data=${JSON.stringify(socketData)}` });
    socket.on("connect", () => {
      console.log("Client has connected to the server!");
      if (!isInitDone) {
        initAllEvents();
        isInitDone = true;
      }
    });
  }
}
let configData = {
  connectionConfig: {
    namespace: "BOT",
    enterprise_id: 50001,
    socket_key: "50001",
  },
  imi_bot_middleware_token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjoiVGhpcyBpcyBJTUkgQk9UIG1pZGRsZXdhcmUiLCJpYXQiOjE1Njc4ODc5MTAsImV4cCI6NDE1OTg4NzkxMH0.dYbMaf8HYMD5K532p7DpHN0cmru-JKMjst-WS9zi7u8",
};
debugger;
initializeSocketConnection(configData);


// function to make get req to http://localhost:3000
function httpGetAsync(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}


// click listener for button
document.querySelector("#send").addEventListener("click", () => {
  document.querySelector("#send").textContent = "Sending...";
  httpGetAsync(
    `http://localhost:3000/?url=${document.querySelector("#url").value}`,
    function (data) {
      
      console.log(data);
    }
  );
}
);
