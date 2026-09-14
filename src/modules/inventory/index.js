import InventoryService from "./InventoryService.js";
import {
  InventoryError,
  InventoryApiError
} from "./errors/InventoryError.js";

// Publika ingången till lagermodulen.
// React behöver bara känna till descriptor och run().
export default class InventoryModule {
  static descriptor = {
    name: "Lagermodul",

    methodsAndInputs: [
      {
        method: "run",
        input: [
          "values.productId - produkt-id",
          "values.type - delivery, sale eller adjustment",
          "values.quantity - antal"
        ],
        output: "saldorapport med varningar"
      }
    ],

    fields: [
      {
        name: "productId",
        label: "Produkt-id",
        type: "number",
        required: true,
        min: 1
      },
      {
        name: "type",
        label: "Lagerhändelse",
        type: "select",
        required: true,
        options: [
          { value: "delivery", label: "Inleverans" },
          { value: "sale", label: "Försäljning" },
          { value: "adjustment", label: "Justering" }
        ]
      },
      {
        name: "quantity",
        label: "Antal",
        type: "number",
        required: true
      }
    ]
  };

  constructor() {
    // Servicen innehåller modulens state:
    // lagerhändelser och senaste rapport.
    this.service = new InventoryService();
  }

  async run(values = {}, context = {}) {
    await this.service.fetchMovements();

    const hasMovement =
      values.productId !== undefined ||
      values.type !== undefined ||
      values.quantity !== undefined;

    // Om vi får en lagerhändelse sparar vi den först.
    // Utan värden skapar vi bara en aktuell rapport.
    if (hasMovement) {
      if (
        !values.productId ||
        !values.type ||
        values.quantity === ""
      ) {
        throw new InventoryError(
          "Produkt-id, lagertyp och antal måste anges."
        );
      }

      const quantity = Number(values.quantity);

      if (!Number.isFinite(quantity)) {
        throw new InventoryError(
          "Antalet måste vara ett giltigt nummer."
        );
      }

      await this.service.saveMovement({
        productId: values.productId,
        type: values.type,
        quantity
      });
    }

    const products = Array.isArray(context.products)
      ? context.products
      : await this.fetchProducts();

    return this.service.createReport(products);
  }

  async fetchProducts() {
    try {
      const response = await fetch("/api/products");

      if (!response.ok) {
        throw new InventoryApiError(
          "Kunde inte hämta produkter."
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof InventoryApiError) {
        throw error;
      }

      throw new InventoryApiError(
        "Det gick inte att hämta produktdata."
      );
    }
  }
}