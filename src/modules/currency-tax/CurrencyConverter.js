// Ansvarar för valutakurser och valutakonvertering
// Hämtar kurser från /api/rates och cachar dem mellan anrop

import {
    ExchangeRateError,
    ValidationError
} from "./errors.js";

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

        let response;

        try {
            response = await fetch("/api/rates");
        } catch {
            throw new ExchangeRateError(
                "Kunde inte ansluta till tjänsten för valutakurser"
            );
        }

        if (!response.ok) {
            throw new ExchangeRateError(
                `Kunde inte hämta valutakurser. Servern svarade med status ${response.status}`
            );
        }

        let data;

        try {
            // Gör om API-svaret från JSON till JavaScript-data
            data = await response.json();
        } catch {
            throw new ExchangeRateError(
                "Valutakurserna kunde inte läsas från serverns svar"
            );
        }

        // Kontrollerar att API:t returnerar en lista
        if (!Array.isArray(data)) {
            throw new ExchangeRateError(
                "Valutakurserna från servern har ogiltigt format"
            );
        }

        // Map för att lagra valutakod tillsammans med valutakurs
        const rates = new Map();

        for (const item of data) {
            if (
                typeof item.currency !== "string" ||
                typeof item.rateFromSEK !== "number" ||
                !Number.isFinite(item.rateFromSEK) ||
                item.rateFromSEK <= 0
            ) {
                throw new ExchangeRateError(
                    "Servern returnerade en ogiltig valutakurs"
                );
            }

            if (rates.has(item.currency)) {
                throw new ExchangeRateError(
                    `Valutan "${item.currency}" förekommer flera gånger i valutakurserna`
                );
            }

            rates.set(item.currency, item.rateFromSEK);
        }

        const requiredCurrencies = ["SEK", "EUR", "USD"];

        // Arrow-funktion som används av find() för att hitta en valuta som saknas
        const missingCurrency = requiredCurrencies.find(
            currency => !rates.has(currency)
        );

        if (missingCurrency !== undefined) {
            throw new ExchangeRateError(
                `Valutakurs saknas för ${missingCurrency}`
            );
        }

        // SEK är basvalutan och ska alltid ha kursen 1
        if (rates.get("SEK") !== 1) {
            throw new ExchangeRateError(
                "SEK måste ha valutakursen 1 eftersom SEK är basvalutan"
            );
        }

        this.rates = rates;

        return this.rates;
    }

    async convert(money, targetCurrency) {
        if (
            money === null ||
            typeof money !== "object" ||
            typeof money.amount !== "number" ||
            !Number.isFinite(money.amount)
        ) {
            throw new ValidationError(
                "Beloppet som ska konverteras måste vara ett giltigt nummer"
            );
        }

        if (money.amount < 0) {
            throw new ValidationError(
                "Beloppet som ska konverteras får inte vara negativt"
            );
        }

        if (
            typeof money.currency !== "string" ||
            money.currency.trim() === ""
        ) {
            throw new ValidationError(
                "Källvaluta saknas eller är ogiltig"
            );
        }

        if (
            typeof targetCurrency !== "string" ||
            targetCurrency.trim() === ""
        ) {
            throw new ValidationError(
                "Målvaluta saknas eller är ogiltig"
            );
        }

        const rates = await this.getRates();

        const sourceRate = rates.get(money.currency);
        const targetRate = rates.get(targetCurrency);

        if (sourceRate === undefined) {
            throw new ExchangeRateError(
                `Valutakurs saknas för källvalutan ${money.currency}`
            );
        }

        if (targetRate === undefined) {
            throw new ExchangeRateError(
                `Valutakurs saknas för målvalutan ${targetCurrency}`
            );
        }

        const amountInSEK = money.amount / sourceRate;
        const convertedAmount = amountInSEK * targetRate;

        return {
            amount: convertedAmount,
            currency: targetCurrency
        };
    }
}