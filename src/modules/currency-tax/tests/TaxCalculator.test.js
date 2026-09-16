import { test } from "node:test";
import assert from "node:assert/strict";

import TaxCalculator from "../TaxCalculator.js";
import { TaxError, ValidationError } from "../errors.js";

// Kör med:
// node --test src/modules/currency-tax/tests/TaxCalculator.test.js

test("standardmoms 25 % räknas ut korrekt", () => {
    const calculator = new TaxCalculator();

    const result = calculator.calculateGross(100, "standard");

    assert.equal(result, 125);
});

test("matmoms 12 % räknas ut korrekt", () => {
    const calculator = new TaxCalculator();

    const result = calculator.calculateGross(100, "food");

    assert.ok(Math.abs(result - 112) < 0.0000001);
});

test("bokmoms 6 % räknas ut korrekt", () => {
    const calculator = new TaxCalculator();

    const result = calculator.calculateGross(100, "books");

    assert.equal(result, 106);
});

test("okänd momskategori kastar TaxError", () => {
    const calculator = new TaxCalculator();

    assert.throws(
        () => calculator.calculateGross(100, "cars"),
        TaxError
    );
});

test("negativt belopp kastar ValidationError", () => {
    const calculator = new TaxCalculator();

    assert.throws(
        () => calculator.calculateGross(-100, "standard"),
        ValidationError
    );
});

test("ogiltigt belopp kastar ValidationError", () => {
    const calculator = new TaxCalculator();

    assert.throws(
        () => calculator.calculateGross("100", "standard"),
        ValidationError
    );
});

test("TaxError har begripligt felmeddelande", () => {
    const calculator = new TaxCalculator();

    assert.throws(
        () => calculator.calculateGross(100, "cars"),
        error =>
            error instanceof TaxError &&
            error.message === 'Momskategorin "cars" stöds inte'
    );
});