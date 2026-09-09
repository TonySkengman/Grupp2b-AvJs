import TaxCalculator from './TaxCalculator.js';
import CurrencyConverter from './CurrencyConverter.js';

export default class CurrencyTaxService {

    // Beskriver för React vilket formulärfält modulen behöver
    static descriptor = {
        name: 'Valuta och moms',
        fields: [
            {
                name: 'currency',
                label: 'Välj valuta',
                type: 'select',
                required: true,
                options: ['SEK', 'EUR', 'USD']
            }
        ]
    };

    constructor() {
        // Denna klassen använder de andra två klasserna
        this.taxCalculator = new TaxCalculator();
        this.currencyConverter = new CurrencyConverter();
    }

    // Kör hela flödet: moms -> valuta -> totalsumma -> formattering
    async run(values, context) {
        const targetCurrency = values?.currency;
        const lines = context?.lines;

        // Kontrollerar att en målvaluta har valts
        if (typeof targetCurrency !== 'string' || targetCurrency.trim() === '') {
            throw new Error('Du måste välja en valuta');
        }

        // Kontrollerar att kundvagnen finns
        if (!Array.isArray(lines)) {
            throw new Error('Kundvagnen har ett ogiltigt format');
        }

        // Stoppar beräkningen om kundvagnen är tom
        if (lines.length === 0) {
            throw new Error('Kundvagnen är tom');
        }

        let total = 0;

        for (const line of lines) {

            // Kontrollerar priset på raden
            if (
                typeof line.unitPrice !== 'number' ||
                !Number.isFinite(line.unitPrice) ||
                line.unitPrice < 0
            ) {
                throw new Error('En produkt har ett ogiltigt pris');
            }

            // Kontrollerar antal produkter
            if (
                !Number.isInteger(line.quantity) ||
                line.quantity <= 0
            ) {
                throw new Error('En produkt har ett ogiltigt antal');
            }

            // Kontrollerar att raden har valuta
            if (typeof line.currency !== 'string') {
                throw new Error('En produkt har ogiltig valuta');
            }

            // Kontrollerar att raden har momskategori
            if (typeof line.taxCategory !== 'string') {
                throw new Error('En produkt har ogiltig momskategori');
            }

            // Räknar ut radens pris före moms
            const netAmount = line.unitPrice * line.quantity;

            // Lägger på rätt moms utifrå momskategorin
            const grossAmount = this.taxCalculator.calculateGross(
                netAmount,
                line.taxCategory
            );

            // Kopplar ihop beloppet med dess valuta
            const money = {
                amount: grossAmount,
                currency: line.currency
            };  

            // Konverterar radens pris till användarens valda valuta
            const convertedMoney = await this.currencyConverter.convert(
                money,
                targetCurrency
            );

            // Alla rader är nu i samma valuta och kan summeras ihop
            total += convertedMoney.amount;
        }

            // Avrundar slutresultatet till två decimaler
            const amount = Math.round((total + Number.EPSILON) * 100) / 100;

            // Formaterar slutpriset enligt svenska standarden
            const formattedPrice = new Intl.NumberFormat('sv-SE', {
                style: 'currency',
                currency: targetCurrency
            }).format(amount);

            return {
                amount,
                currency: targetCurrency,
                formattedPrice
            };
    }
}