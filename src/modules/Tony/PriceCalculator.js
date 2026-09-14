/**
 * Äger stapelordningen (i vilken ordning kampanjer kombineras) och
 * summerar ihop resultatet till en prisspecifikation. Vet inget om HUR
 * en enskild kampanjtyp räknar ut sitt belopp - bara Discount.calculate()s jobb.
 */
export default class PriceCalculator {
  calculate(cart, discounts) {
    let remainingAmount = cart.getSubtotal();
    const appliedDiscounts = [];

    // Fast ordning: 1) köp-X-betala-Y  2) kronrabatt  3) procent (sist,
    // så procenten räknas på det som redan blivit billigare, inte hela
    // ursprungspriset).
    for (const type of ["BUY_X_PAY_Y", "THRESHOLD", "PERCENTAGE"]) {
      for (const discount of discounts) {
        if (discount.campaign.type !== type) continue;

        const amount = discount.calculate(cart, remainingAmount);
        // amount blir 0 om kampanjen inte gällde den här korgen (t.ex.
        // korgen når inte upp till en THRESHOLD) - ska då inte synas i resultatet
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

// Bygger läsbar text, t.ex. "20% rabatt (kod SOMMAR20)", istället för
// att UI:t skulle behöva gissa ihop det själv från rå data.
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

// Avrundar till ören - undviker fula flyttalsfel (0.1 + 0.2 = 0.30000000000000004)
function round(amount) {
  return Math.round(amount * 100) / 100;
}