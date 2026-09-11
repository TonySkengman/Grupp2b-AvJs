import Parcel from '../Parcel.js';
import { WeightBasedPricing, ZoneBasedPricing, VolumetricPricing } from '../PricingStrategies.js';
import { makeItem } from './testHelpers.js';

async function runTests() {

    try {
        const config = { basePrice: 50, pricePerKg: 10, volumetricDivisor: 5000 };
        const smallParcel = new Parcel([makeItem({ weightKg: 3, dimensionsCm: { width: 1, height: 1, depth: 1 } })]);
        const bulkyParcel = new Parcel([makeItem({ weightKg: 1, dimensionsCm: { width: 50, height: 50, depth: 50 } })]);

        console.log('WeightBasedPricing (förväntat 110):', new WeightBasedPricing().calculate(smallParcel, config, 2));
        console.log('ZoneBasedPricing (förväntat 130):', new ZoneBasedPricing().calculate(smallParcel, config, 2));
        console.log('VolumetricPricing (förväntat 300):', new VolumetricPricing().calculate(bulkyParcel, config, 1));

    } catch (error) {
        console.error('Test misslyckades (PricingStrategies):', error.message);
    }
}

await runTests();