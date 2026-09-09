// Denna fil har tre ansvar:
// Hämta valutakurser från /api/rates
// Cacha dem
// Konvertera mellan SEK, EUR och USD

export default class CurrencyConverter {

    // Cache för valutakurser så API:t inte behöver anropas varje gång
    constructor() {
        this.rates = null;
    }

    // Hämtar valutakurser från API:t eller använder cachade kurser
    async getRates() {
        if (this.rates !== null) {
            return this.rates;
        }

        const response = await fetch('/api/rates');

        // Stoppar körningen om API-anropet misslyckas
        if (!response.ok) {
            throw new Error('Kunde inte hämta valutakurser');
        }

        const data = await response.json();

        // Kontrollerar att API:t returnerar en lista
        if (!Array.isArray(data)) {
            throw new Error('Ogiltigt format i valutakurser');
        }

        const rates = new Map();

        // Validerar och sparar varje valutakurs
        for (const item of data) {
            if (
                typeof item.currency !== 'string' ||
                typeof item.rateFromSEK !== 'number' ||
                !Number.isFinite(item.rateFromSEK) ||
                item.rateFromSEK <= 0
            ) {
                throw new Error('Ogiltig valutakurs från API:t');
            }

            // Förhindrar dubbla poster för samma valuta
            if (rates.has(item.currency)) {
                throw new Error(`Dubblett av valutan: ${item.currency}`);
            }

            rates.set(item.currency, item.rateFromSEK);
        }

        // Kontrollerar att alla valutor som US6 kräver finns
        for (const currency of ['SEK', 'EUR', 'USD']) {
            if (!rates.has(currency)) {
                throw new Error(`Valutakurs saknas för: ${currency}`);
            }
        }

        // SEK är basvalutan och ska alltid ha kursen 1
        if (rates.get('SEK') !== 1) {
            throw new Error('SEK måste ha valutakursen 1');
        }

        // Sparar endast validerade kurser i cachen
        this.rates = rates;

        return this.rates;
    }

    // Konverterar ett valutamärkt belopp till vald valuta
    async convert(money, targetCurrency) {
        if (
            money === null ||
            typeof money !== 'object' ||
            typeof money.amount !== 'number' ||
            !Number.isFinite(money.amount)
        ) {
            throw new Error('Beloppet måste vara ett giltigt nummer');
        }

        if (money.amount < 0) {
            throw new Error('Beloppet får inte vara negativt');
        }

        if (typeof money.currency !== 'string') {
            throw new Error('Beloppet måste ha en giltig valuta');
        }

        if (typeof targetCurrency !== 'string') {
            throw new Error('Målvalutan saknas eller är ogiltig');
        }

        const rates = await this.getRates();

        const sourceRate = rates.get(money.currency);
        const targetRate = rates.get(targetCurrency);

        // Stoppar okända valutor
        if (sourceRate === undefined) {
            throw new Error(`Okänd källvaluta: ${money.currency}`);
        }

        if (targetRate === undefined) {
            throw new Error(`Okänd målvaluta: ${targetCurrency}`);
        }

        // Räknar först om till SEK och sedan vidare till målvalutan
        const amountInSEK = money.amount / sourceRate;
        const convertedAmount = amountInSEK * targetRate;

        // Returnerar alltid beloppet tillsammans med dess valuta
        return {
            amount: convertedAmount,
            currency: targetCurrency
        };
    }
}