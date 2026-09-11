import Parcel from '../Parcel.js';
import ShippingQuoteService from '../ShippingQuoteService.js';
import { makeItem, mockFetch, carrierConfigs } from './testHelpers.js';

async function runTests() {

    try {
        mockFetch(carrierConfigs);
        const service = new ShippingQuoteService();
        const parcel = new Parcel([makeItem({ weightKg: 2, dimensionsCm: { width: 10, height: 10, depth: 10 } })]);

        const quotesSE = await service.getQuotes(parcel, 'SE');
        console.log('Offerter SE (Schenker ska saknas):', quotesSE);

        const quotesEU = await service.getQuotes(parcel, 'EU');
        console.log('Offerter EU (alla tre transportörer):', quotesEU);

    } catch (error) {
        console.error('Test misslyckades (ShippingQuoteService grundfall):', error.message);
    }

    try {
        mockFetch(carrierConfigs);
        const service = new ShippingQuoteService();
        await service.getQuotes(new Parcel([makeItem()]), undefined);
    } catch (error) {
        console.log('Feltest destination saknas:', error.message);
    }

    try {
        mockFetch([carrierConfigs[2]]); // bara Schenker, som saknar SE
        const service = new ShippingQuoteService();
        await service.getQuotes(new Parcel([makeItem()]), 'SE');
    } catch (error) {
        console.log('Feltest ingen transportör till zon:', error.message);
    }

    try {
        mockFetch(null, { networkError: true });
        const service = new ShippingQuoteService();
        await service.getQuotes(new Parcel([makeItem()]), 'SE');
    } catch (error) {
        console.log('Feltest nätverksfel:', error.message);
    }

    try {
        mockFetch(null, { ok: false });
        const service = new ShippingQuoteService();
        await service.getQuotes(new Parcel([makeItem()]), 'SE');
    } catch (error) {
        console.log('Feltest API-fel:', error.message);
    }

    try {
        mockFetch({});
        const service = new ShippingQuoteService();
        await service.getQuotes(new Parcel([makeItem()]), 'SE');
    } catch (error) {
        console.log('Feltest ogiltig transportörslista:', error.message);
    }

    try {
        mockFetch([{ id: 'x', name: 'produkt', pricingModel: 'Standard', zones: { SE: 1 } }]);
        const service = new ShippingQuoteService();
        await service.getQuotes(new Parcel([makeItem()]), 'SE');
    } catch (error) {
        console.log('Feltest okänd prismodell:', error.message);
    }

    try {
        mockFetch(carrierConfigs);
        const service = new ShippingQuoteService();
        await service.getQuotes(new Parcel([makeItem()]), 'SE');
        service.clearCache();
        await service.getQuotes(new Parcel([makeItem()]), 'SE');
        console.log('clearCache() körd utan fel');
    } catch (error) {
        console.error('Test misslyckades (clearCache):', error.message);
    }
}

await runTests();