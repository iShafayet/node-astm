var SerialPort = require('serialport');
var port = new SerialPort('COM2', {
  baudRate: 38400,
  autoOpen: false
});

const ACK = new Buffer([6]);
const ENQ = new Buffer([5]);
const ETB = new Buffer([23]);
const ETX = new Buffer([3]);
const LF = new Buffer([10]);
const CR = new Buffer([13]);
const NAK = new Buffer([21]);
const STX = new Buffer([2]);
const EOT = new Buffer([4]);

port.open(err => {
  if (err) {
    console.log('Error opening port: ', err.message);
  }
});

port.on('error', err => {
  console.log('Error:', err);
});

port.on('open', _ => {
  console.log("PORT", "opened")
});

let logString = '';

// Switches the port into "flowing mode"
port.on('data', function (data) {
  console.log('Raw Data:', data);

  if (Buffer.compare(data, ENQ) === 0) {
    port.write(ACK);
    console.log('Acknowledged')
  } else if (Buffer.compare(data, EOT) === 0) {
    console.log('done (eot)')
  } else {
    let str = data.toString('ascii');
    console.log(str);
    logString += str;
    // port.write(ACK);
  }

});

