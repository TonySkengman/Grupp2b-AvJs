import { UnknownCampaignTypeError } from "./errors.js";

/**
 * Räknar ut rabatten för EN kampanj i taget. Vet inget om i vilken
 * ordning flera kampanjer ska köras eller hur de ska summeras ihop -
 * det äger PriceCalculator (komposition: PriceCalculator "har" flera
 * Discount-objekt, den "är" ingen Discount själv).
 *
 * Designval: en klass med if/else per typ istället för tre subklasser
 * som ärver en gemensam bas - all logik syns i en fil, lättare att
 * följa. Nackdel: filen växer om fler kampanjtyper tillkommer.
 */
export default class Discount {
  constructor(campaign) {
    this.campaign = campaign;
  }

  // currentTotal = beloppet som är KVAR efter ev. tidigare kampanjer i stapelordningen
  calculate(cart, currentTotal) {
    const type = this.campaign.type;

    if (type === "PERCENTAGE") {
      return currentTotal * (this.campaign.value / 100);
    }

    if (type === "THRESHOLD") {
      // Kollar mot ordinarie totalpris (inte currentTotal) - tröskeln
      // ska gälla hela köpet, oavsett vad andra kampanjer redan dragit av.
      if (cart.getSubtotal() < this.campaign.threshold) return 0;
      return this.campaign.discountAmount;
    }

    if (type === "BUY_X_PAY_Y") {
      const itemsInCategory = cart.getItemsInCategory(this.campaign.appliesToCategory);
      let totalQuantity = 0;
      for (const item of itemsInCategory) {
        totalQuantity += item.quantity;
      }

      // Antal kompletta grupper om x enheter, varje grupp ger (x - y) gratis
      const groupCount = Math.floor(totalQuantity / this.campaign.x);
      const freeItemCount = groupCount * (this.campaign.x - this.campaign.y);
      if (freeItemCount === 0) return 0;

      // De billigaste enheterna i kategorin blir gratis
      const prices = itemsInCategory.map((item) => item.unitPrice);
      const cheapestPrice = Math.min(...prices);
      return freeItemCount * cheapestPrice;
    }

    // Okänd typ i datan - hellre ett tydligt fel än att tyst ignorera kampanjen
    throw new UnknownCampaignTypeError(type);
  }
}