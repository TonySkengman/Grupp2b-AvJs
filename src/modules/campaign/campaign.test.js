import { test } from "node:test";
import assert from "node:assert/strict";

import Cart from "./Cart.js";
import Discount from "./Discount.js";
import PriceCalculator from "./PriceCalculator.js";
import { InvalidCartError, UnknownCampaignCodeError, UnknownCampaignTypeError } from "./errors.js";

test("Cart räknar ut rätt subtotal", () => {
  const cart = new Cart([
    { productId: "1", unitPrice: 100, quantity: 2, category: "böcker" },
  ]);
  assert.equal(cart.getSubtotal(), 200);
});

test("Cart kastar InvalidCartError om varukorgen är tom", () => {
  assert.throws(() => new Cart([]), InvalidCartError);
});

test("PERCENTAGE-rabatt räknar ut rätt belopp", () => {
  const cart = new Cart([{ productId: "1", unitPrice: 100, quantity: 1, category: "diverse" }]);
  const discount = new Discount({ type: "PERCENTAGE", value: 20, code: "TJUGO" });
  assert.equal(discount.calculate(cart, 100), 20);
});

test("THRESHOLD ger ingen rabatt under gränsen", () => {
  const cart = new Cart([{ productId: "1", unitPrice: 100, quantity: 1, category: "diverse" }]);
  const discount = new Discount({ type: "THRESHOLD", threshold: 500, discountAmount: 100 });
  assert.equal(discount.calculate(cart, 100), 0);
});

test("BUY_X_PAY_Y ger rabatt på den billigaste varan i kategorin", () => {
  const cart = new Cart([
    { productId: "1", unitPrice: 100, quantity: 1, category: "böcker" },
    { productId: "2", unitPrice: 150, quantity: 1, category: "böcker" },
  ]);
  const discount = new Discount({ type: "BUY_X_PAY_Y", x: 2, y: 1, appliesToCategory: "böcker" });
  assert.equal(discount.calculate(cart), 100);
});

test("Discount kastar UnknownCampaignTypeError för okänd typ", () => {
  const cart = new Cart([{ productId: "1", unitPrice: 100, quantity: 1, category: "diverse" }]);
  const discount = new Discount({ type: "MYSTERY" });
  assert.throws(() => discount.calculate(cart, 100), UnknownCampaignTypeError);
});

test("PriceCalculator staplar rabatter i rätt ordning", () => {
  const cart = new Cart([{ productId: "1", unitPrice: 200, quantity: 1, category: "diverse" }]);
  const percentage = new Discount({ type: "PERCENTAGE", value: 10, code: "TIO" });
  const threshold = new Discount({ type: "THRESHOLD", threshold: 100, discountAmount: 50 });

  const result = new PriceCalculator().calculate(cart, [percentage, threshold]);

  // 200 - 50 (threshold) = 150, sen 10% av 150 = 15 -> 135 kvar
  assert.equal(result.total, 135);
});

test("UnknownCampaignCodeError innehåller koden i meddelandet", () => {
  const error = new UnknownCampaignCodeError("FINNS-EJ");
  assert.match(error.message, /FINNS-EJ/);
});