
var EventEmitter = require('events');
var SerialPort = require('serialport');

const ACK_BUFFER = new Buffer([6]);
const ENQ = 5;
const STX = 2;
const ETX = 3;
const LF = 10;
const CR = 13;
const EOT = 4;

class HoribaPenta60Reader extends EventEmitter {

  constructor() {
    super();
    this.port = null;
  }

  initiate(portString) {
    Object.assign(this, { portString });

    this.transmission = [];
    this.statement = null;

    this.port = new SerialPort(portString, {
      baudRate: 38400,
      autoOpen: false
    });

    this.port.on('open', _ => this.__handleOpen());

    this.port.on('error', err => this.__handleError(err));

    this.port.open(err => {
      if (err) {
        this.__handleError(err, 'Error opening port:');
      }
    });

    this.port.on('data', data => this.__handleData(data));
  }

  __log(...data) {
    data.unshift('HoribaPenta60>');
    this.emit('log', ...data);
  }

  __error(err) {
    this.emit('error', err);
  }

  __parseError(err){
    this.emit('parse-error', err);
  }

  __handleOpen() {
    this.__log('opened on', this.portString);
    this.emit('open');
  }

  __handleError(err, prefix = 'error:') {
    this.__log(prefix, err.message);
    this.__error(err);
  }

  __handleData(data) {
    let str = data.toString('ascii');

    if (str.length === 0) return;

    if (str.charCodeAt(0) === ENQ) {
      this.port.write(ACK_BUFFER);

    } else if (str.charCodeAt(0) === EOT) {
      // console.log('this.transmission', this.transmission);
      this.emit('data', this.transmission);
      this.__log('transmission: \n', this.summarizeTransmission(this.transmission));
      this.transmission = [];

    } else {
      for (let char of str.split('')) {
        // console.log(char, char.charCodeAt(0));

        if (char.charCodeAt(0) === STX) {
          this.statement = {
            hasStarted: false,
            hasEnded: false,
            dataMessage: '',
            checksum: ''
          }
          this.statement.hasStarted = true;

        } else if (char.charCodeAt(0) === ETX) {
          if (!this.statement.hasStarted) {
            this.__parseError("this.statement ended before it was started.");
            return;
          }
          this.statement.hasEnded = true;

        } else if (char.charCodeAt(0) === LF) {
          if (!this.statement.hasStarted) {
            this.__parseError("LF before this.statement was started.");
            return;
          }
          if (!this.statement.hasEnded) {
            this.__parseError("LF before this.statement was ended.");
            return;
          }
          this.transmission.push(this.statement);
          this.port.write(ACK_BUFFER);

        } else {
          if (!this.statement.hasStarted) {
            this.__parseError(`Unkown character received before this.statement was started, ${char}, ${char.charCodeAt()}`);
            return;
          }
          if (char.charCodeAt(0) !== CR) {
            if (!this.statement.hasEnded) {
              this.statement.dataMessage += char;
            } else {
              this.statement.checksum += char;
            }
          }
        }
      }

    }
  }

  summarizeTransmission(transmission) {
    let text = '';
    for (let statement of transmission) {
      let dataMessage = statement.dataMessage;
      if (dataMessage.length > 0) {
        dataMessage = dataMessage.substr(1, dataMessage.length);
      }
      text += dataMessage + '\n';
    }
    return text;
  }



}

exports.HoribaPenta60Reader = HoribaPenta60Reader;