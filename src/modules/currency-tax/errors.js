// Gemensam basklass för alla fel i valuta- och momsmodulen
export class CurrencyModuleError extends Error {
    constructor(message) {
        super(message);
        this.name = "CurrencyModuleError";
    }
}

export class ValidationError extends CurrencyModuleError {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}

export class TaxError extends CurrencyModuleError {
    constructor(message) {
        super(message);
        this.name = "TaxError";
    }
}

export class ExchangeRateError extends CurrencyModuleError {
    constructor(message) {
        super(message);
        this.name = "ExchangeRateError";
    }
}