import Cart from "./Cart.js";
import Discount from "./Discount.js";
import PriceCalculator from "./PriceCalculator.js";
import { InvalidCartError, UnknownCampaignCodeError } from "./errors.js";

/**
 * Modulens enda publika ingång, enligt gruppens modulkontrakt: default
 * export, statisk descriptor, no-arg-konstruktor, async run(values).
 */
export default class CampaignModule {
  static descriptor = {
    name: "Kampanjmotor",
    methodsAndInputs: [
      {
        method: "run",
        input: [
          "values.cart - lista med { productId, name, unitPrice, quantity, category }",
          "values.campaignCodes - (valfri) lista med kampanjkoder som ska kombineras",
        ],
        output: "prisspecifikation: { subtotal, discounts, total }",
      },
    ],
    // Rikare descriptor (VG): regex-validering + villkorligt fält,
    // läses av GenericForm för att bygga och validera formuläret.
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
    // Motiverat instans-tillstånd: cache slipper hämta om API:t i
    // onödan varje gång korgen ändras, history loggar beräkningar.
    this.cachedCampaigns = null;
    this.history = [];
  }

  async run(values) {
    // Första skyddslagret: values eller values.cart saknas helt
    if (!values || !values.cart) {
      throw new InvalidCartError("ingen varukorg skickades in");
    }

    // Andra skyddslagret: Cart validerar strukturen på varje rad
    const cart = new Cart(values.cart);
    const allCampaigns = await this.getActiveCampaigns();

    // Alla kampanjtyper kräver en giltig kod - inget aktiveras automatiskt
    const applicableCampaigns = [];
    const codes = values.campaignCodes ?? [];

    for (const rawCode of codes) {
      // Normaliserar även här, som ett skyddsnät oavsett vem som anropar run()
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

  // Extra asynkron metod utöver run() - cachar API-svaret mellan anrop
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