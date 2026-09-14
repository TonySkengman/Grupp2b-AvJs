import test from "node:test";
import assert from "node:assert/strict";

import StockItem from "../StockItem.js";
import StockMovement from "../StockMovement.js";
import InventoryService from "../InventoryService.js";
import InventoryModule from "../index.js";

import {
  InventoryApiError,
  InvalidStockMovementError,
  StockItemNotFoundError
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


test("noll är inte en giltig lagerhändelse", () => {
  assert.throws(
    () => new StockMovement({
      productId: "1",
      type: "sale",
      quantity: 0
    }),
    InvalidStockMovementError
  );
});


test("negativ inleverans avvisas i stället för att vändas till positiv", () => {
  assert.throws(
    () => new StockMovement({
      productId: "1",
      type: "delivery",
      quantity: -3
    }),
    InvalidStockMovementError
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


test("InventoryService beräknar försäljningstakt från aktuella sales", () => {
  const service = new InventoryService();

  service.movements = [
    new StockMovement({
      productId: "1",
      type: "sale",
      quantity: 14,
      timestamp: new Date().toISOString()
    })
  ];

  assert.equal(
    service.getSalesRate("1", 7),
    2
  );
});


test("modulen sparar inte en lagerhändelse för en okänd produkt", async () => {
  const originalFetch = globalThis.fetch;
  let postCount = 0;

  globalThis.fetch = async (url, options = {}) => {
    if (url === "/api/inventory" && !options.method) {
      return { ok: true, json: async () => [] };
    }

    if (options.method === "POST") {
      postCount += 1;
    }

    throw new Error(`Oväntat API-anrop: ${url}`);
  };

  try {
    const module = new InventoryModule();

    await assert.rejects(
      module.run(
        {
          productId: "saknas",
          type: "delivery",
          quantity: "1"
        },
        { products: [] }
      ),
      StockItemNotFoundError
    );

    assert.equal(postCount, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("publika modulen kan konstrueras utan argument och skapa rapport", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url) => ({
    ok: true,
    json: async () => url === "/api/inventory"
      ? []
      : [{ id: "1", name: "Laptop", reorderPoint: 3 }]
  });

  try {
    const module = new InventoryModule();
    const resultPromise = module.run({}, {});

    assert.ok(InventoryModule.descriptor);
    assert.ok(resultPromise instanceof Promise);
    assert.deepEqual(
      await resultPromise,
      [{
        productId: "1",
        name: "Laptop",
        stock: 0,
        reorderPoint: 3,
        lowStock: true
      }]
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});


test("API-fel från lagerendpointen får rätt feltyp", async () => {
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async () => ({
    ok: false,
    status: 500
  });

  try {
    const module = new InventoryModule();

    await assert.rejects(
      module.run({}, {}),
      InventoryApiError
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
