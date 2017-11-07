


let { HoribaPenta60 } = require('./horiba-penta-60');

let machine = new HoribaPenta60();

machine.on('log', (...args)=> {
  console.log(...args);
});

machine.on('error', (error)=> {
  console.log(error);
});

machine.on('parse-error', (error)=> {
  console.log(error);
});

machine.on('data',(transmission)=>{
  // console.log('transmission:', transmission);
})

machine.initiate('COM4')

