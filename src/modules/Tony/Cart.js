import { InvalidCartError } from "./errors.js";

/**
 * Håller varukorgens rader så som Kampanjmotorn behöver se dem - inget
 * om React eller hur korgen visas. Kan bara summera (getSubtotal) och
 * filtrera på kategori (getItemsInCategory, används av BUY_X_PAY_Y).
 */
export default class Cart {
  constructor(items) {
    // Skyddar mot två fall på en gång: items är inte en lista alls,
    // eller är en tom lista.
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

  // Case-sensitive med flit - db.json och appliesToCategory måste stavas likadant
  getItemsInCategory(category) {
    return this.items.filter((item) => item.category === category);
  }
}