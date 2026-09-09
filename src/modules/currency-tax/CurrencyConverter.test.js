import CurrencyConverter from './CurrencyConverter.js';

const converter = new CurrencyConverter();

async function runTests() {
    try {
        const sekToEur = await converter.convert(
            { amount: 100, currency: 'SEK' },
            'EUR'
        );

        console.log('100 SEK till EUR:', sekToEur);

        const sekToUsd = await converter.convert(
            { amount: 100, currency: 'SEK' },
            'USD'
        );

        console.log('100 SEK till USD:', sekToUsd);

        const eurToUsd = await converter.convert(
            { amount: 100, currency: 'EUR' },
            'USD'
        );

        console.log('100 EUR till USD:', eurToUsd);

        // Kontrollerar att cachen används
        console.log('Cache skapad:', converter.rates instanceof Map);

    } catch (error) {
        console.error('Test misslyckades:', error.message);
    }

    try {
        await converter.convert(
            { amount: 100, currency: 'ABC' },
            'EUR'
        );
    } catch (error) {
        console.log('Feltest källvaluta:', error.message);
    }

    try {
        await converter.convert(
            { amount: 100, currency: 'SEK' },
            'ABC'
        );
    } catch (error) {
        console.log('Feltest målvaluta:', error.message);
    }

    try {
        await converter.convert(
            { amount: -100, currency: 'SEK' },
            'EUR'
        );
    } catch (error) {
        console.log('Feltest negativt belopp:', error.message);
    }
}

runTests();