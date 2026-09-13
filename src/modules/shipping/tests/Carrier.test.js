import Parcel from '../Parcel.js';
import Carrier from '../Carrier.js';
import { WeightBasedPricing } from '../PricingStrategies.js';
import { makeItem } from './testHelpers.js';

async function runTests() {

    try {
        const config = { id: 'postnord', name: 'PostNord', basePrice: 50, pricePerKg: 10, zones: { SE: 1, EU: 1.5 } };
        const carrier = new Carrier(config, new WeightBasedPricing());
        const parcel = new Parcel([makeItem({ weightKg: 2, dimensionsCm: { width: 1, height: 1, depth: 1 } })]);

        console.log('Carrier id:', carrier.id);
        console.log('Carrier name:', carrier.name);
        console.log('Carrier offert (förväntat price 70):', carrier.quote(parcel, 'SE'));

    } catch (error) {
        console.error('Test misslyckades (Carrier grundfall):', error.message);
    }

    try {
        new Carrier({}, new WeightBasedPricing());
    } catch (error) {
        console.log('Feltest ogiltig transportörskonfiguration:', error.message);
    }

    try {
        const config = { id: 'postnord', name: 'PostNord', basePrice: 50, pricePerKg: 10, zones: { SE: 1 } };
        new Carrier(config, {});
    } catch (error) {
        console.log('Feltest ogiltig prisstrategi:', error.message);
    }

    try {
        const config = { id: 'postnord', name: 'PostNord', basePrice: 50, pricePerKg: 10, zones: { SE: 1 } };
        const carrier = new Carrier(config, new WeightBasedPricing());
        const parcel = new Parcel([makeItem()]);
        carrier.quote(parcel, 'WORLD');
    } catch (error) {
        console.log('Feltest okänd zon:', error.message);
    }
}

await runTests();