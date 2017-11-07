



let { HoribaPentra60Reader } = require('./../horiba-pentra-60-reader');

let machine = new HoribaPentra60Reader();

machine.on('log', (...args) => {
  console.log(...args);
});

machine.on('error', (error) => {
  console.log(error);
});

machine.on('parse-error', (error) => {
  console.log(error);
});

machine.on('data', (transmission) => {
  // console.log('transmission:', transmission);
})

machine.initiate('COM4');
