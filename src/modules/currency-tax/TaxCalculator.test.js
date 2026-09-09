import TaxCalculator from './TaxCalculator.js';

const taxCalculator = new TaxCalculator();

console.log('Standard 25%:', taxCalculator.calculateGross(100, 'standard'));
console.log('Food 12%:', taxCalculator.calculateGross(100, 'food'));
console.log('Books 6%:', taxCalculator.calculateGross(100, 'books'));

try {
    console.log(taxCalculator.calculateGross(100, 'cars'));
} catch (error) {
    console.log('Feltest kategori:', error.message);
}

try {
    console.log(taxCalculator.calculateGross(-100, 'standard'));
} catch (error) {
    console.log('Feltest negativt belopp:', error.message);
}

try {
    console.log(taxCalculator.calculateGross('100', 'standard'));
} catch (error) {
    console.log('Feltest fel datatyp:', error.message);
}