import StockItem from "./StockItem.js";
import StockMovement from "./StockMovement.js";

import {
  InventoryApiError,
  StockItemNotFoundError
} from "./errors/InventoryError.js";

export default class InventoryService {
  constructor() {
    // sparar lagerhändelserna så vi slipper hämta om allt hela tiden
    this.movements = [];

    // sparar senaste rapporten vi gjort
    this.lastReport = null;
  }

  async fetchMovements() {
    try {
      const response = await fetch("/api/inventory");

      if (!response.ok) {
        throw new InventoryApiError(
          "Kunde inte hämta lagerhändelser."
        );
      }

      const data = await response.json();

      // gör om datan från api till StockMovement objekt
      this.movements = data.map(
        movement => new StockMovement(movement)
      );

      return this.movements;
    } catch (error) {
      if (error instanceof InventoryApiError) {
        throw error;
      }

      throw new InventoryApiError(
        "Det gick inte att hämta lagerdata."
      );
    }
  }

  async saveMovement(movementData) {
    // kollar först så lagerhändelsen är giltig
    const movement = new StockMovement(movementData);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId: movement.productId,
          type: movement.type,
          quantity: movement.quantity,
          timestamp: movement.timestamp
        })
      });

      if (!response.ok) {
        throw new InventoryApiError(
          "Kunde inte spara lagerhändelsen."
        );
      }

      const savedMovement = await response.json();

      const stockMovement =
        new StockMovement(savedMovement);

      // lägger även in den i listan vi redan har sparad
      this.movements.push(stockMovement);

      return stockMovement;
    } catch (error) {
      if (error instanceof InventoryApiError) {
        throw error;
      }

      throw new InventoryApiError(
        "Det gick inte att spara lagerhändelsen."
      );
    }
  }

  getMovementsForProduct(productId) {
    // hämtar bara händelser för produkten vi vill kolla
    return this.movements.filter(
      movement =>
        movement.productId === String(productId)
    );
  }

  calculateStock(productId) {
    const productMovements =
      this.getMovementsForProduct(productId);

    // räknar ihop alla lagerhändelser till ett saldo
    return productMovements.reduce(
      (total, movement) =>
        total + movement.getQuantityChange(),
      0
    );
  }

  getSalesRate(productId, days = 7) {
    if (!Number.isFinite(days) || days <= 0) {
      return 0;
    }

    const now = Date.now();

    const startTime =
      now - days * 24 * 60 * 60 * 1000;

    // tar bara försäljningar inom perioden vi kollar på
    const sales = this.getMovementsForProduct(
      productId
    ).filter(movement => {
      const movementTime =
        new Date(movement.timestamp).getTime();

      return (
        movement.type === "sale" &&
        movementTime >= startTime
      );
    });

    const soldQuantity = sales.reduce(
      (total, movement) =>
        total + Math.abs(movement.quantity),
      0
    );

    // snitt hur mycket som säljs per dag
    return soldQuantity / days;
  }

  createStockItem(product) {
    if (!product) {
      throw new StockItemNotFoundError(
        "Produkten kunde inte hittas."
      );
    }

    const salesRate = this.getSalesRate(
      product.id
    );

    // bygger ett StockItem med produktens lagerregler
    return new StockItem({
      productId: product.id,
      name: product.name,
      reorderPoint: product.reorderPoint ?? 0,
      salesRate
    });
  }

  createReport(products) {
    if (!Array.isArray(products)) {
      throw new InventoryApiError(
        "Produktlistan är inte giltig."
      );
    }

    const report = products.map(product => {
      const stockItem =
        this.createStockItem(product);

      const currentStock =
        this.calculateStock(product.id);

      const reorderPoint =
        stockItem.getEffectiveReorderPoint();

      return {
        productId: product.id,
        name: product.name,
        stock: currentStock,
        reorderPoint,
        lowStock:
          stockItem.isLowStock(currentStock)
      };
    });

    // sparar rapporten så vi kan använda den igen senare
    this.lastReport = report;

    return report;
  }

  getLastReport() {
    return this.lastReport;
  }
}