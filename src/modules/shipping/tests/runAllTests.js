// Kör samtliga testfiler i mappen i tur och ordning.
// Varje fil skriver ut sina egna resultat och felmeddelanden.

console.log('--- Parcel ---');
await import('./Parcel.Test.js');

console.log('\n--- PricingStrategies ---');
await import('./PricingStrategies.Test.js');

console.log('\n--- Carrier ---');
await import('./Carrier.test.js');

console.log('\n--- ShippingQuoteService ---');
await import('./ShippingQuoteService.test.js');

console.log('\n--- ShippingModule (index.js) ---');
await import('./ShippingModule.test.js');
