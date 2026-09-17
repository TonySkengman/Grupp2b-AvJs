import TaxCalculator from "./TaxCalculator.js";
import CurrencyConverter from "./CurrencyConverter.js";
import { ValidationError } from "./errors.js";

export default class CurrencyModule {
    // Beskriver för React vilket formulärfält modulen behöver
    static descriptor = {
        name: "Valuta och moms",
        fields: [
            {
                name: "currency",
                label: "Välj valuta",
                type: "select",
                required: true,
                options: [
                    { value: "SEK", label: "SEK" },
                    { value: "EUR", label: "EUR" },
                    { value: "USD", label: "USD" }
                ]
            }
        ]
    };

    constructor() {
        // Komposition: huvudmodulen skapar och använder de två interna klasserna
        this.taxCalculator = new TaxCalculator();
        this.currencyConverter = new CurrencyConverter();
    }

    async run(values, context) {
        const targetCurrency = values?.currency;
        const includeTax = values?.includeTax !== false;
        const cartLines = context?.cartLines;

        if (
            typeof targetCurrency !== "string" ||
            targetCurrency.trim() === ""
        ) {
            throw new ValidationError(
                "Du måste välja en valuta"
            );
        }

        if (!Array.isArray(cartLines)) {
            throw new ValidationError(
                "Varukorgen har ett ogiltigt format"
            );
        }

        if (cartLines.length === 0) {
            throw new ValidationError(
                "Varukorgen är tom"
            );
        }

        let total = 0;

        for (const line of cartLines) {
            if (
                typeof line.unitPrice !== "number" ||
                !Number.isFinite(line.unitPrice) ||
                line.unitPrice < 0
            ) {
                throw new ValidationError(
                    `Produkten "${line.name ?? "Okänd produkt"}" har ett ogiltigt pris`
                );
            }

            if (
                !Number.isInteger(line.quantity) ||
                line.quantity <= 0
            ) {
                throw new ValidationError(
                    `Produkten "${line.name ?? "Okänd produkt"}" har ett ogiltigt antal`
                );
            }

            if (
                typeof line.currency !== "string" ||
                line.currency.trim() === ""
            ) {
                throw new ValidationError(
                    `Produkten "${line.name ?? "Okänd produkt"}" saknar giltig valuta`
                );
            }

            if (
                typeof line.taxCategory !== "string" ||
                line.taxCategory.trim() === ""
            ) {
                throw new ValidationError(
                    `Produkten "${line.name ?? "Okänd produkt"}" saknar giltig momskategori`
                );
            }

            // Räknar ut radens nettobelopp genom pris gånger antal
            const netAmount =
                line.unitPrice * line.quantity;

            const amountToConvert = includeTax
                ? this.taxCalculator.calculateGross(
                    netAmount,
                    line.taxCategory
                )
                : netAmount;

            const money = {
                amount: amountToConvert,
                currency: line.currency
            };

            const convertedMoney =
                await this.currencyConverter.convert(
                    money,
                    targetCurrency
                );

            total += convertedMoney.amount;
        }

        const amount =
            Math.round(
                (total + Number.EPSILON) * 100
            ) / 100;

        const formattedPrice =
            new Intl.NumberFormat("sv-SE", {
                style: "currency",
                currency: targetCurrency
            }).format(amount);

        return {
            amount,
            currency: targetCurrency,
            formattedPrice
        };
    }
}