import { test } from "node:test";
import assert from "node:assert/strict";

import CurrencyModule from "../index.js";
import { ValidationError } from "../errors.js";

function createMockResponse(data) {
    return {
        ok: true,
        status: 200,
        async json() {
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

test("räknar ut totalsumma inklusive moms i SEK", async () => {
    global.fetch = async () =>
        createMockResponse(validRates());

    const module = new CurrencyModule();

    const result = await module.run(
        { currency: "SEK" },
        {
            cartLines: [
                {
                    name: "Laptop",
                    unitPrice: 100,
                    quantity: 1,
                    currency: "SEK",
                    taxCategory: "standard"
                }
            ]
        }
    );

    assert.equal(result.amount, 125);
    assert.equal(result.currency, "SEK");
    assert.ok(result.formattedPrice.includes("125,00"));
    assert.ok(result.formattedPrice.includes("kr"));
});

test("räknar ut totalsumma med flera olika momssatser", async () => {
    global.fetch = async () =>
        createMockResponse(validRates());

    const module = new CurrencyModule();

    const result = await module.run(
        { currency: "SEK" },
        {
            cartLines: [
                {
                    name: "Standardvara",
                    unitPrice: 100,
                    quantity: 1,
                    currency: "SEK",
                    taxCategory: "standard"
                },
                {
                    name: "Mat",
                    unitPrice: 100,
                    quantity: 1,
                    currency: "SEK",
                    taxCategory: "food"
                },
                {
                    name: "Bok",
                    unitPrice: 100,
                    quantity: 1,
                    currency: "SEK",
                    taxCategory: "books"
                }
            ]
        }
    );

    assert.equal(result.amount, 343);
    assert.equal(result.currency, "SEK");
});

test("konverterar totalsumman till EUR", async () => {
    global.fetch = async () =>
        createMockResponse(validRates());

    const module = new CurrencyModule();

    const result = await module.run(
        { currency: "EUR" },
        {
            cartLines: [
                {
                    name: "Bok",
                    unitPrice: 100,
                    quantity: 1,
                    currency: "SEK",
                    taxCategory: "books"
                }
            ]
        }
    );

    assert.equal(result.amount, 9.43);
    assert.equal(result.currency, "EUR");
});

test("konverterar totalsumman till USD", async () => {
    global.fetch = async () =>
        createMockResponse(validRates());

    const module = new CurrencyModule();

    const result = await module.run(
        { currency: "USD" },
        {
            cartLines: [
                {
                    name: "Standardvara",
                    unitPrice: 100,
                    quantity: 2,
                    currency: "SEK",
                    taxCategory: "standard"
                }
            ]
        }
    );

    assert.equal(result.amount, 26);
    assert.equal(result.currency, "USD");
});

test("saknad valuta kastar ValidationError", async () => {
    const module = new CurrencyModule();

    await assert.rejects(
        () =>
            module.run(
                { currency: "" },
                {
                    cartLines: [
                        {
                            name: "Laptop",
                            unitPrice: 100,
                            quantity: 1,
                            currency: "SEK",
                            taxCategory: "standard"
                        }
                    ]
                }
            ),
        ValidationError
    );
});

test("ogiltigt cartLines-format kastar ValidationError", async () => {
    const module = new CurrencyModule();

    await assert.rejects(
        () =>
            module.run(
                { currency: "SEK" },
                { cartLines: null }
            ),
        ValidationError
    );
});

test("tom varukorg kastar ValidationError", async () => {
    const module = new CurrencyModule();

    await assert.rejects(
        () =>
            module.run(
                { currency: "SEK" },
                { cartLines: [] }
            ),
        ValidationError
    );
});

test("ogiltigt pris kastar ValidationError", async () => {
    const module = new CurrencyModule();

    await assert.rejects(
        () =>
            module.run(
                { currency: "SEK" },
                {
                    cartLines: [
                        {
                            name: "Laptop",
                            unitPrice: -100,
                            quantity: 1,
                            currency: "SEK",
                            taxCategory: "standard"
                        }
                    ]
                }
            ),
        ValidationError
    );
});

test("ogiltigt antal kastar ValidationError", async () => {
    const module = new CurrencyModule();

    await assert.rejects(
        () =>
            module.run(
                { currency: "SEK" },
                {
                    cartLines: [
                        {
                            name: "Laptop",
                            unitPrice: 100,
                            quantity: 0,
                            currency: "SEK",
                            taxCategory: "standard"
                        }
                    ]
                }
            ),
        ValidationError
    );
});

test("saknad produktvaluta kastar ValidationError", async () => {
    const module = new CurrencyModule();

    await assert.rejects(
        () =>
            module.run(
                { currency: "SEK" },
                {
                    cartLines: [
                        {
                            name: "Laptop",
                            unitPrice: 100,
                            quantity: 1,
                            currency: "",
                            taxCategory: "standard"
                        }
                    ]
                }
            ),
        ValidationError
    );
});

test("saknad momskategori kastar ValidationError", async () => {
    const module = new CurrencyModule();

    await assert.rejects(
        () =>
            module.run(
                { currency: "SEK" },
                {
                    cartLines: [
                        {
                            name: "Laptop",
                            unitPrice: 100,
                            quantity: 1,
                            currency: "SEK",
                            taxCategory: ""
                        }
                    ]
                }
            ),
        ValidationError
    );
});

test("felmeddelande innehåller produktnamn vid ogiltigt pris", async () => {
    const module = new CurrencyModule();

    await assert.rejects(
        () =>
            module.run(
                { currency: "SEK" },
                {
                    cartLines: [
                        {
                            name: "Laptop",
                            unitPrice: -100,
                            quantity: 1,
                            currency: "SEK",
                            taxCategory: "standard"
                        }
                    ]
                }
            ),
        error =>
            error instanceof ValidationError &&
            error.message.includes("Laptop")
    );
});