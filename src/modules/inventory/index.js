import InventoryService from "./InventoryService.js";
import {
  InventoryError,
  InventoryApiError,
  StockItemNotFoundError
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
    // Servicen sparar modulens state mellan anrop.
    this.service = new InventoryService();
  }

  async run(values = {}, context = {}) {
    await this.service.fetchMovements();

    // Om produkter redan finns i context behöver vi inte hämta dem igen.
    const products = Array.isArray(context.products)
      ? context.products
      : await this.fetchProducts();

    const hasMovement =
      values.productId !== undefined ||
      values.type !== undefined ||
      values.quantity !== undefined;

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

      const productExists = products.some(
        product => String(product.id) === String(values.productId)
      );

      if (!productExists) {
        throw new StockItemNotFoundError(
          `Produkten med id ${values.productId} kunde inte hittas.`
        );
      }

      await this.service.saveMovement({
        productId: values.productId,
        type: values.type,
        quantity
      });
    }

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
