/**
 * Demo script to test the calculateTax function
 * Runs various test cases and displays results to console
 */

const calculateTax = require('./calculateTax');

console.log('Price with 20% tax:', calculateTax(100, 0.2));
console.log('Price with 10% tax:', calculateTax(100, 0.1));
console.log('Price with 0% tax:', calculateTax(100, 0));
