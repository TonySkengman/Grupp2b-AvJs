import { InventoryError } from "./errors/InventoryError.js";

export default class StockItem {
  constructor({
    productId,
    name = "",
    reorderPoint = 0,
    salesRate = 0
  }) {
    if (!productId) {
      throw new InventoryError("Produkt-id saknas.");
    }

    if (!Number.isFinite(reorderPoint) || reorderPoint < 0) {
      throw new InventoryError(
        "Beställningspunkten måste vara 0 eller högre."
      );
    }

    if (!Number.isFinite(salesRate) || salesRate < 0) {
      throw new InventoryError(
        "Försäljningstakten måste vara 0 eller högre."
      );
    }

    this.productId = String(productId);
    this.name = name;
    this.reorderPoint = reorderPoint;
    this.salesRate = salesRate;
  }

  // Räknar fram en rekommenderad beställningspunkt utifrån försäljningstakten.
  getCalculatedReorderPoint(daysToCover = 7) {
    if (!Number.isFinite(daysToCover) || daysToCover <= 0) {
      throw new InventoryError(
        "Antalet dagar måste vara större än 0."
      );
    }

    return Math.ceil(this.salesRate * daysToCover);
  }

  // Använder den högsta nivån så vi inte varnar för sent.
  getEffectiveReorderPoint(daysToCover = 7) {
    const calculatedPoint = this.getCalculatedReorderPoint(daysToCover);

    return Math.max(this.reorderPoint, calculatedPoint);
  }

  isLowStock(currentStock, daysToCover = 7) {
    if (!Number.isFinite(currentStock)) {
      throw new InventoryError(
        "Aktuellt lagersaldo måste vara ett giltigt nummer."
      );
    }

    return currentStock <= this.getEffectiveReorderPoint(daysToCover);
  }
}