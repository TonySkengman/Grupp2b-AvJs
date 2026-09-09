export default class TaxCalculator {

    // Momssatser för de kategorier som US6 ska stödja
    static TAX_RATES = {
        standard: 0.25,
        food: 0.12,
        books: 0.06
    };
    // Hämtar rätt momssats utifrån produktens momskategori
    getRate(taxCategory) {
        const rate = TaxCalculator.TAX_RATES[taxCategory];

        // Stoppar okända momskategorier
        if (rate === undefined) {
            throw new Error(`Okänd momskategori: ${taxCategory}`);
        }

        return rate;
    }

    // Räknar ut pris inklusive moms
    calculateGross(amount, taxCategory) {

        // Kontrollerar att beloppet är ett giltigt nummer
        if (typeof amount !== 'number' || !Number.isFinite(amount)) {
            throw new Error (`Beloppet måste vara ett giltigt tal`);
        }

        // Negativa priser ska inte accepteras
        if (amount < 0) {
            throw new Error(`Beloppet får inte vara negativt`);
        }

        // Hämtar momssatsen för vald kategori
        const taxRate = this.getRate(taxCategory);

        // Lägger på moms och retunerar pris inklusive moms
        return amount * (1 + taxRate);
    }
}