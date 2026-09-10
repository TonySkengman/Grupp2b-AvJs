import { UnknownCampaignTypeError } from "./errors.js";

export default class Discount {
  constructor(campaign) {
    this.campaign = campaign;
  }

  calculate(cart, currentTotal) {
    const type = this.campaign.type;

    if (type === "PERCENTAGE") {
      return currentTotal * (this.campaign.value / 100);
    }

    if (type === "THRESHOLD") {
      const appliesToThisCart = cart.getSubtotal() >= this.campaign.threshold;
      if (!appliesToThisCart) return 0;
      return this.campaign.discountAmount;
    }

    if (type === "BUY_X_PAY_Y") {
      const itemsInCategory = cart.getItemsInCategory(this.campaign.appliesToCategory);
      let totalQuantity = 0;
      for (const item of itemsInCategory) {
        totalQuantity += item.quantity;
      }

      const groupCount = Math.floor(totalQuantity / this.campaign.x);
      const freeItemCount = groupCount * (this.campaign.x - this.campaign.y);
      if (freeItemCount === 0) return 0;
      
      const prices = itemsInCategory.map((item) => item.unitPrice);
      const cheapestPrice = Math.min(...prices);
      return freeItemCount * cheapestPrice;
    }

    throw new UnknownCampaignTypeError(type);
  }
}
