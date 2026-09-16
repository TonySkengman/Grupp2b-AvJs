import { test } from "node:test";
import assert from "node:assert/strict";

import CurrencyConverter from "../CurrencyConverter.js";
import {
    ExchangeRateError,
    ValidationError
} from "../errors.js";

function createMockResponse(data, options = {}) {
    const {
        ok = true,
        status = 200,
        jsonThrows = false
    } = options;

    return {
        ok,
        status,
        async json() {
            if (jsonThrows) {
                throw new Error("Ogiltig JSON");
            }

            return data;
        }
    };
}

function validRates() {
    return [
        { currency: "SEK", rateFromSEK: 1 },
        { currency: "EUR", rateFromSEK: 0.089 },
        { currency: "USD", rateFromSEK: 0.104 }
    ];
}

test("konverterar 100 SEK till EUR korrekt", async () => {
    global.fetch = async () =>
        createMockResponse(validRates());

    const converter = new CurrencyConverter();

    const result = await converter.convert(
        { amount: 100, currency: "SEK" },
        "EUR"
    );

    assert.equal(result.currency, "EUR");
    assert.ok(Math.abs(result.amount - 8.9) < 0.0000001);
});

test("konverterar 100 SEK till USD korrekt", async () => {
    global.fetch = async () =>
        createMockResponse(validRates());

    const converter = new CurrencyConverter();

    const result = await converter.convert(
        { amount: 100, currency: "SEK" },
        "USD"
    );

    assert.equal(result.currency, "USD");
    assert.ok(Math.abs(result.amount - 10.4) < 0.0000001);
});

test("konverterar EUR till USD via SEK korrekt", async () => {
    global.fetch = async () =>
        createMockResponse(validRates());

    const converter = new CurrencyConverter();

    const result = await converter.convert(
        { amount: 100, currency: "EUR" },
        "USD"
    );

    const expected = (100 / 0.089) * 0.104;

    assert.equal(result.currency, "USD");
    assert.ok(Math.abs(result.amount - expected) < 0.0000001);
});

test("negativt belopp kastar ValidationError", async () => {
    const converter = new CurrencyConverter();

    await assert.rejects(
        () =>
            converter.convert(
                { amount: -100, currency: "SEK" },
                "EUR"
            ),
        ValidationError
    );
});

test("ogiltigt belopp kastar ValidationError", async () => {
    const converter = new CurrencyConverter();

    await assert.rejects(
        () =>
            converter.convert(
                { amount: "100", currency: "SEK" },
                "EUR"
            ),
        ValidationError
    );
});

test("saknad källvaluta kastar ValidationError", async () => {
    const converter = new CurrencyConverter();

    await assert.rejects(
        () =>
            converter.convert(
                { amount: 100, currency: "" },
                "EUR"
            ),
        ValidationError
    );
});

test("saknad målvaluta kastar ValidationError", async () => {
    const converter = new CurrencyConverter();

    await assert.rejects(
        () =>
            converter.convert(
                { amount: 100, currency: "SEK" },
                ""
            ),
        ValidationError
    );
});

test("okänd källvaluta kastar ExchangeRateError", async () => {
    global.fetch = async () =>
        createMockResponse(validRates());

    const converter = new CurrencyConverter();

    await assert.rejects(
        () =>
            converter.convert(
                { amount: 100, currency: "GBP" },
                "EUR"
            ),
        ExchangeRateError
    );
});

test("okänd målvaluta kastar ExchangeRateError", async () => {
    global.fetch = async () =>
        createMockResponse(validRates());

    const converter = new CurrencyConverter();

    await assert.rejects(
        () =>
            converter.convert(
                { amount: 100, currency: "SEK" },
                "GBP"
            ),
        ExchangeRateError
    );
});

test("HTTP-fel kastar ExchangeRateError", async () => {
    global.fetch = async () =>
        createMockResponse([], {
            ok: false,
            status: 500
        });

    const converter = new CurrencyConverter();

    await assert.rejects(
        () => converter.getRates(),
        error =>
            error instanceof ExchangeRateError &&
            error.message.includes("500")
    );
});

test("nätverksfel kastar ExchangeRateError", async () => {
    global.fetch = async () => {
        throw new Error("Network error");
    };

    const converter = new CurrencyConverter();

    await assert.rejects(
        () => converter.getRates(),
        error =>
            error instanceof ExchangeRateError &&
            error.message ===
                "Kunde inte ansluta till tjänsten för valutakurser"
    );
});

test("ogiltig JSON kastar ExchangeRateError", async () => {
    global.fetch = async () =>
        createMockResponse(null, {
            jsonThrows: true
        });

    const converter = new CurrencyConverter();

    await assert.rejects(
        () => converter.getRates(),
        ExchangeRateError
    );
});

test("API-data måste vara en array", async () => {
    global.fetch = async () =>
        createMockResponse({
            currency: "SEK",
            rateFromSEK: 1
        });

    const converter = new CurrencyConverter();

    await assert.rejects(
        () => converter.getRates(),
        ExchangeRateError
    );
});

test("ogiltig valutakurs kastar ExchangeRateError", async () => {
    global.fetch = async () =>
        createMockResponse([
            { currency: "SEK", rateFromSEK: 1 },
            { currency: "EUR", rateFromSEK: -1 },
            { currency: "USD", rateFromSEK: 0.104 }
        ]);

    const converter = new CurrencyConverter();

    await assert.rejects(
        () => converter.getRates(),
        ExchangeRateError
    );
});

test("dubblett av valuta kastar ExchangeRateError", async () => {
    global.fetch = async () =>
        createMockResponse([
            { currency: "SEK", rateFromSEK: 1 },
            { currency: "EUR", rateFromSEK: 0.089 },
            { currency: "EUR", rateFromSEK: 0.09 },
            { currency: "USD", rateFromSEK: 0.104 }
        ]);

    const converter = new CurrencyConverter();

    await assert.rejects(
        () => converter.getRates(),
        ExchangeRateError
    );
});

test("saknad obligatorisk valuta kastar ExchangeRateError", async () => {
    global.fetch = async () =>
        createMockResponse([
            { currency: "SEK", rateFromSEK: 1 },
            { currency: "EUR", rateFromSEK: 0.089 }
        ]);

    const converter = new CurrencyConverter();

    await assert.rejects(
        () => converter.getRates(),
        error =>
            error instanceof ExchangeRateError &&
            error.message.includes("USD")
    );
});

test("SEK måste ha valutakursen 1", async () => {
    global.fetch = async () =>
        createMockResponse([
            { currency: "SEK", rateFromSEK: 0.95 },
            { currency: "EUR", rateFromSEK: 0.089 },
            { currency: "USD", rateFromSEK: 0.104 }
        ]);

    const converter = new CurrencyConverter();

    await assert.rejects(
        () => converter.getRates(),
        error =>
            error instanceof ExchangeRateError &&
            error.message.includes("SEK")
    );
});

test("valutakurser cachas så fetch bara anropas en gång", async () => {
    let fetchCalls = 0;

    global.fetch = async () => {
        fetchCalls++;

        return createMockResponse(validRates());
    };

    const converter = new CurrencyConverter();

    await converter.getRates();
    await converter.getRates();
    await converter.convert(
        { amount: 100, currency: "SEK" },
        "EUR"
    );

    assert.equal(fetchCalls, 1);
});