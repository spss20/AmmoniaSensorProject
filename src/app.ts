console.log("Hello World");

import b from 'bonescript';

const m = -0.243;
const yIntercept = 0.323;
// const Ro = 48;
const Ro = 85;

setTimeout(readValues , 1000);
init();

function readValues(){
    const value = b.analogRead("A0");
    // process.stdout.write("Pin A0"  + ": " + (value*100).toFixed(1) + '%, ' + (1.8*value).toFixed(3) + 'V   \r');
    setTimeout(readValues , 1000);
    
    // const Vrl = (1.8*value).toFixed(3);
    const Vrl = (1.8*value);

    const Rs = ((5.0/Vrl) - 1) * 10;

    // const Ro = Rs/3.6;
    const ratio = Rs/Ro;
    
    
    const PPM = Math.pow(10 , (Math.log10(ratio)-yIntercept)/m );
    
    console.log({Vrl , Rs , Ro , ratio , PPM});
}

function init(){
    console.log("Setting up socket server");
}

