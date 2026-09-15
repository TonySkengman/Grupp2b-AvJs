import ShippingModule from '../index.js';
import { mockFetch, carrierConfigs } from './testHelpers.js';

async function runTests() {

    try {
        console.log('Descriptor namn:', ShippingModule.descriptor.name);
        console.log('Descriptor zoner:', ShippingModule.descriptor.fields[0].options);

        mockFetch(carrierConfigs);
        const shippingModule = new ShippingModule();
        const cartLines = [
            { name: 'Bok', weightKg: 0.5, dimensionsCm: { width: 15, height: 20, depth: 3 }, quantity: 2 }
        ];

        const quotes = await shippingModule.run({ destinationZone: 'SE' }, { cartLines });
        console.log('run() offerter (DHL 52, PostNord 60):', quotes);

    } catch (error) {
        console.error('Test misslyckades (ShippingModule grundfall):', error.message);
    }

    try {
        const shippingModule = new ShippingModule();
        await shippingModule.run({}, { cartLines: [{ name: 'x', weightKg: 1, dimensionsCm: { width: 1, height: 1, depth: 1 }, quantity: 1 }] });
    } catch (error) {
        console.log('Feltest destinationZone saknas:', error.message);
    }

    try {
        const shippingModule = new ShippingModule();
        await shippingModule.run({ destinationZone: 'SE' }, { cartLines: [] });
    } catch (error) {
        console.log('Feltest tom varukorg:', error.message);
    }

    try {
        const shippingModule = new ShippingModule();
        await shippingModule.run({ destinationZone: 'SE' }, {});
    } catch (error) {
        console.log('Feltest cartLines saknas i context:', error.message);
    }
}

await runTests();