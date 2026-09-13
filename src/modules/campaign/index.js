import Cart from "./Cart.js";
import Discount from "./Discount.js";
import PriceCalculator from "./PriceCalculator.js";
import { InvalidCartError, UnknownCampaignCodeError } from "./errors.js";


export default class CampaignModule {
  static descriptor = {
    name: "Kampanjmotor",
    methodsAndInputs: [
      {
        method: "run",
        input: [
          "values.cart - lista med { productId, name, unitPrice, quantity, category }",
          "values.campaignCode - (valfri) kampanjkod",
        ],
        output: "prisspecifikation: { subtotal, discounts, total }",
      },
    ],
    // Rikare descriptor (VG): fältet har validering (regex) utöver
    // minimikontraktet, och visas bara när det faktiskt är relevant
    // (korgen innehåller något). GenericForm läser båda delarna.
    fields: [
      {
        name: "campaignCode",
        label: "Kampanjkod",
        type: "text",
        required: false,
        pattern: "^[A-ZÅÄÖ0-9]{3,20}$",
        patternHint: "3–20 versaler eller siffror",
        helpText: "Ange en kampanjkod om du har en, t.ex. SOMMAR20.",
        visibleWhen: { field: "cart", notEmpty: true },
      },
    ],
  };

  constructor() {
    // Motiverat instans-tillstånd: vi sparar kampanjerna här så att vi
    // inte behöver hämta om dem från API:t varje gång kunden ändrar
    // varukorgen under samma session.
    this.cachedCampaigns = null;
    this.history = [];
  }

  async run(values) {
    if (!values || !values.cart) {
      throw new InvalidCartError("ingen varukorg skickades in");
    }

    const cart = new Cart(values.cart);
    const allCampaigns = await this.getActiveCampaigns();

    const applicableCampaigns = [];
    const codes = values.campaignCodes ?? [];

    for (const rawCode of codes) {
      const code = rawCode.trim().toUpperCase();
      const match = allCampaigns.find((c) => c.code === code);
      if (!match) {
        throw new UnknownCampaignCodeError(code);
      }
      applicableCampaigns.push(match);
    }

    const discounts = applicableCampaigns.map((c) => new Discount(c));
    const result = new PriceCalculator().calculate(cart, discounts);

    this.history.push({ at: Date.now(), total: result.total });
    return result;
  }

  async getActiveCampaigns() {
    if (this.cachedCampaigns) {
      return this.cachedCampaigns;
    }
    const response = await fetch("/api/campaigns");
    if (!response.ok) {
      throw new Error("Kunde inte hämta kampanjer just nu.");
    }
    const data = await response.json();
    this.cachedCampaigns = data.filter((c) => c.active);
    return this.cachedCampaigns;
  }
}
