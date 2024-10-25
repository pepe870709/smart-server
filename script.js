//const script2 = require('./script2.js')
//import {largeNumber} from './script2.js';

//const a = largeNumber;
const {largeNumber} = await import('./script2.js');
const b = 100;

console.log(largeNumber + b);