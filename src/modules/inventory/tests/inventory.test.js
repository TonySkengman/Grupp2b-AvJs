import test from "node:test";
import assert from "node:assert/strict";

import StockItem from "../StockItem.js";
import StockMovement from "../StockMovement.js";
import InventoryService from "../InventoryService.js";

import {
  InvalidStockMovementError
} from "../errors/InventoryError.js";


test("delivery ökar lagersaldot", () => {
  const movement = new StockMovement({
    productId: "1",
    type: "delivery",
    quantity: 10
  });

  assert.equal(
    movement.getQuantityChange(),
    10
  );
});


test("sale minskar lagersaldot", () => {
  const movement = new StockMovement({
    productId: "1",
    type: "sale",
    quantity: 3
  });

  assert.equal(
    movement.getQuantityChange(),
    -3
  );
});


test("adjustment kan minska lagersaldot", () => {
  const movement = new StockMovement({
    productId: "1",
    type: "adjustment",
    quantity: -2
  });

  assert.equal(
    movement.getQuantityChange(),
    -2
  );
});


test("fel lagertyp kastar eget fel", () => {
  assert.throws(
    () => {
      new StockMovement({
        productId: "1",
        type: "fel",
        quantity: 5
      });
    },
    InvalidStockMovementError
  );
});


test("InventoryService räknar rätt lagersaldo", () => {
  const service = new InventoryService();

  service.movements = [
    new StockMovement({
      productId: "1",
      type: "delivery",
      quantity: 10
    }),
    new StockMovement({
      productId: "1",
      type: "sale",
      quantity: 3
    }),
    new StockMovement({
      productId: "1",
      type: "adjustment",
      quantity: -2
    })
  ];

  const stock = service.calculateStock("1");

  assert.equal(stock, 5);
});


test("bara rätt produkts lagerhändelser räknas", () => {
  const service = new InventoryService();

  service.movements = [
    new StockMovement({
      productId: "1",
      type: "delivery",
      quantity: 10
    }),
    new StockMovement({
      productId: "2",
      type: "delivery",
      quantity: 20
    }),
    new StockMovement({
      productId: "1",
      type: "sale",
      quantity: 2
    })
  ];

  assert.equal(
    service.calculateStock("1"),
    8
  );
});


test("StockItem varnar vid låg lagernivå", () => {
  const item = new StockItem({
    productId: "1",
    name: "Laptop",
    reorderPoint: 5,
    salesRate: 0
  });

  assert.equal(
    item.isLowStock(5),
    true
  );
});


test("StockItem varnar inte när lagret är över beställningspunkten", () => {
  const item = new StockItem({
    productId: "1",
    name: "Laptop",
    reorderPoint: 5,
    salesRate: 0
  });

  assert.equal(
    item.isLowStock(10),
    false
  );
});


test("försäljningstakt kan höja beställningspunkten", () => {
  const item = new StockItem({
    productId: "1",
    name: "Laptop",
    reorderPoint: 3,
    salesRate: 2
  });

  assert.equal(
    item.getEffectiveReorderPoint(7),
    14
  );
});