var imageNr = 0; // Serial number of current image
var finished = new Array(); // References to img objects which have finished downloading
var paused = false;

// get Ipaddress
let hiddenIpAddress = document.getElementById("myHiddenIp").value;
console.log(hiddenIpAddress);

function createImageLayer() {
  var img = new Image();
  img.style.position = "absolute";
  img.style.zIndex = -1;
  img.onload = imageOnload;
  img.onclick = imageOnclick;
  // img.src = "http://192.168.43.16:9000/?action=snapshot&n=" + (++imageNr);
  // img.src = `http://${hiddenIpAddress}:9000/?action=snapshot&n=` + (++imageNr);
  // img.src = `https://b0036e0a7898.ngrok.io/?action=snapshot&n=` + (++imageNr);
  img.src = `https://b0036e0a7898.ngrok.io/?action=snapshot&n=` + (++imageNr);
  var webcam = document.getElementById("webcam");
  webcam.insertBefore(img, webcam.firstChild);
}

// Two layers are always present (except at the very beginning), to avoid flicker
function imageOnload() {
  this.style.zIndex = imageNr; // Image finished, bring to front!
  while (1 < finished.length) {
    var del = finished.shift(); // Delete old image(s) from document
    del.parentNode.removeChild(del);
  }
  finished.push(this);
  if (!paused) createImageLayer();
}

function imageOnclick() { // Clicking on the image will pause the stream
  paused = !paused;
  if (!paused) createImageLayer();
}

var socket = io(); //load socket.io-client and connect to the host that serves the page

// window.addEventListener("load", function(){ //when page loads
  
//   var lightbox = document.getElementById("light"); 
//   lightbox.addEventListener("change", function() { //add event listener for when checkbox changes
//     socket.emit("light", Number(this.checked)); //send button status to server (as 1 or 0)
//   });
// });

// socket.on('light', function (data) { //get button status from client
//   document.getElementById("light").checked = data; //change checkbox according to push button on Raspberry Pi
//   socket.emit("light", data); //send push button status to back to server
// });

