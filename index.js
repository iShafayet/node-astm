var SerialPort = require('serialport');
var port = new SerialPort('COM4', {
  baudRate: 38400,
  autoOpen: false
});

const ACK_BUFFER = new Buffer([6]);
const ENQ = 5;
// const ETB = new Buffer([23]);
// const NAK = new Buffer([21]);
const STX = 2;
const ETX = 3;
const LF = 10;
const CR = 13;
const EOT = 4;

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

let transmission = []
let statement = null
port.on('data', function (data) {
  // console.log('Raw Data:', data);

  let str = data.toString('ascii');

  if (str.length === 0) return;

  if (str.charCodeAt(0) === ENQ) {
    statement = {
      hasStarted: false,
      hasEnded: false,
      // lastChar: '',
      dataMessage: '',
      checksum: ''
    }
    port.write(ACK_BUFFER);

  } else if (str.charCodeAt(0) === EOT) {
    console.log('transmission', transmission);
    transmission = [];

  } else {
    for (char in str.split('')){
      console.log(char, char.charCodeAt(0));
      
      if (char.charCodeAt(0) === STX){
        statement.hasStarted = true;

      } else if (char.charCodeAt(0) === ETX){
        if (!statement.hasStarted){
          throw new Error("Statement ended before it was started.");
        }
        statement.hasEnded = true;

      } else if (char.charCodeAt(0) === LF){
        if (!statement.hasStarted){
          throw new Error("LF before statement was started.");
        }
        if (!statement.hasEnded){
          throw new Error("LF before statement was ended.");
        }
        transmission.push(statement);
        port.write(ACK_BUFFER);

      } else {
        if (!statement.hasStarted){
          throw new Error(`Unkown character received before statement was started, ${char}, ${char.charCodeAt()}`);
        }
        if (!statement.hasEnded){
          statement.dataMessage += char;       
        } else {
          statement.checksum += char;
        }

      }
    }
    
  }

});

