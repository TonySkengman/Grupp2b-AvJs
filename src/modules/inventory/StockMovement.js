import { InvalidStockMovementError } from "./errors/InventoryError.js";

export default class StockMovement {
  static VALID_TYPES = ["delivery", "sale", "adjustment"];

  constructor({
    productId,
    type,
    quantity,
    timestamp = new Date().toISOString()
  }) {
    if (!productId) {
      throw new InvalidStockMovementError(
        "Produkt-id saknas."
      );
    }

    if (!StockMovement.VALID_TYPES.includes(type)) {
      throw new InvalidStockMovementError(
        `Ogiltig lagertyp: ${type}.`
      );
    }

    if (!Number.isFinite(quantity)) {
      throw new InvalidStockMovementError(
        "Antalet måste vara ett giltigt nummer."
      );
    }

    if (quantity === 0) {
      throw new InvalidStockMovementError(
        "Antalet måste vara större än 0."
      );
    }

    // Adjustment får vara negativ eftersom den kan korrigera saldot nedåt.
    if (type !== "adjustment" && quantity < 0) {
      throw new InvalidStockMovementError(
        "Antalet för inleverans och försäljning måste vara positivt."
      );
    }

    this.productId = String(productId);
    this.type = type;
    this.quantity = quantity;
    this.timestamp = timestamp;
  }

  getQuantityChange() {
    switch (this.type) {
      case "delivery":
        return Math.abs(this.quantity);

      case "sale":
        return -Math.abs(this.quantity);

      case "adjustment":
        return this.quantity;

      default:
        throw new InvalidStockMovementError(
          `Kan inte beräkna lagersaldo för typen ${this.type}.`
        );
    }
  }
}
