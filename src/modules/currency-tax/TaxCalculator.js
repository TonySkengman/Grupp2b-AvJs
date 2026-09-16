import { TaxError, ValidationError } from "./errors.js";

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

        if (rate === undefined) {
            throw new TaxError(
                `Momskategorin "${taxCategory}" stöds inte`
            );
        }

        return rate;
    }

    // Räknar ut pris inklusive moms
    calculateGross(amount, taxCategory) {
        if (typeof amount !== "number" || !Number.isFinite(amount)) {
            throw new ValidationError(
                "Beloppet måste vara ett giltigt nummer"
            );
        }

        if (amount < 0) {
            throw new ValidationError(
                "Beloppet får inte vara negativt"
            );
        }

        const taxRate = this.getRate(taxCategory);

        return amount * (1 + taxRate);
    }
}