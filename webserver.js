// var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
// var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
//var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO
//var LED = new Gpio(26, 'out'); //use GPIO 15 as output (pin 10)
//var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled
const express = require('express'); 
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = 3000;
const path = require('path');
const { sendMail } = require('./reportSender');
const os = require( 'os' );
const networkInterfaces = os.networkInterfaces( );
const findIpLink = networkInterfaces['wlan0'][0]['address'] ;

//ngrok
// const { ensureConnection } = require('./ngrok');
let ngrokUrl;

const Gpio = require('onoff').Gpio;
const pir = new Gpio(18, 'in', 'both');
const led = new Gpio(26, 'out');
let mode = 0;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  console.log(ngrokUrl);
  res.render('home',{status:"Press Button To change Status of Led !!", myIpAddress: findIpLink});
});
app.post("/led/on", (req, res) => {
  led.writeSync(1, (err) => {
      if (err) throw err;
      console.log('Written True to pin '+ led);
      console.log(path.join(__dirname, 'public'));
      return res.render('home', {status: "Led is On", myIpAddress: findIpLink});
  });
});
app.post("/led/off", (req, res) => {
  led.writeSync(0, (err) => {
      if (err) throw err;
      console.log('Written False to pin '+ led);
      console.log(path.join(__dirname, 'public'));
      return res.render('home',{status: "Led is Off", myIpAddress: findIpLink});
  });
});

//get link ngrok
async function getNgrokUrl() {
  const axios = require('axios');
  const ping = 'http://127.0.0.1:4040/api/tunnels';
  let url = "";
  try {
      const response = await axios.get(ping);
      url = response.data.tunnels[0].public_url;
      if (url.startsWith("http://")) {
          url = "https://" + url.substr("http://".length);
      }
  }
  catch (ex) {
      return null;
  }
  try {
      await axios.get(url);
  }
  catch (ex) {
      if (ex && ex.response && ex.response.status == "402") {
          console.log("Killing expired tunnel...");
          stopProcess();
          await delay(2000);
          return null;
      }
  }
  url = "https://34bbd18b872b.ngrok.io/"
  // console.log(url);
  return url;
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
// ngrokUrl = getNgrokUrl();
// ngrokUrl = (async () => {
//   console.log(await getNgrokUrl());
//   return await getNgrokUrl();
// })();
// const asyncExample = async () => {
//   const result = await getNgrokUrl();
//   return result;
// }
// ;(async () => {
//   const url = await asyncExample()
//   console.log(url)
// })()
// control buzzer
pir.watch((err, value) => {
  if (value == 1) {
      console.log('Motion Detected!')
      led.writeSync(1);
      (async () => {
        // console.log(await getNgrokUrl());
        sendMail("INTRUDER WARNING!", `Somebody got into your house, you can watch from camera via this links:${await getNgrokUrl()}`);
        console.log(`email sent to: http://${await getNgrokUrl()}`);
     })()
      if (mode == 0) mode = 1;
      else mode = 0;
  } else {
      console.log('Motion Stopped');
  }
});
  

process.on('SIGINT', function () { //on ctrl+c
console.log("0 RESET");

  // Turn GPIO off
  // Unexport GPIO to free resources
  led.writeSync(0); 
  led.unexport(); 

  pir.unexport(); // Unexport Button GPIO to free resources
  process.exit(); //exit completely
});

server.listen(port,"0.0.0.0", function () {
  console.log(`Simple LED Control Server Started on Port: ${port}!`)
});

// server.listen(port,"0.0.0.0", async () => {
//   console.log(`Listening on port ${server.address().port}`);
//   await ensureConnection(url => {
//     console.log(`Listerning to ${url}`);
//   });
// });