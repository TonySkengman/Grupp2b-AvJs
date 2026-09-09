import { InvalidCartError } from "./errors.js";

export default class Cart {
  constructor(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new InvalidCartError("måste vara en lista med minst en produkt");
    }
    this.items = items;
  }

  getSubtotal() {
    let sum = 0;
    for (const item of this.items) {
      sum += item.unitPrice * item.quantity;
    }
    return sum;
  }

  getItemsInCategory(category) {
    return this.items.filter((item) => item.category === category);
  }
}
