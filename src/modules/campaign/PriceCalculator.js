export default class PriceCalculator {
  calculate(cart, discounts) {
    let remainingAmount = cart.getSubtotal();
    const appliedDiscounts = [];

    for (const type of ["BUY_X_PAY_Y", "THRESHOLD", "PERCENTAGE"]) {
      for (const discount of discounts) {
        if (discount.campaign.type !== type) continue;

        const amount = discount.calculate(cart, remainingAmount);
        if (amount > 0) {
          remainingAmount -= amount;
          appliedDiscounts.push({
            code: discount.campaign.code ?? null,
            type,
            amount: round(amount),
            description: describeDiscount(discount.campaign),
          });
        }
      }
    }

    return {
      subtotal: cart.getSubtotal(),
      discounts: appliedDiscounts,
      total: round(remainingAmount),
    };
  }
}

function describeDiscount(campaign) {
  if (campaign.type === "PERCENTAGE") {
    return `${campaign.value}% rabatt (kod ${campaign.code})`;
  }
  if (campaign.type === "THRESHOLD") {
    return `${campaign.discountAmount} kr rabatt vid köp över ${campaign.threshold} kr (kod ${campaign.code})`;
  }
  if (campaign.type === "BUY_X_PAY_Y") {
    return `Köp ${campaign.x} betala för ${campaign.y}`;
  }
  return campaign.type;
}

function round(amount) {
  return Math.round(amount * 100) / 100;
}
