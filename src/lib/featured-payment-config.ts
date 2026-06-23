/** Manual payment instructions — replace with gateway config later. */

export function getFeaturedPaymentConfig() {
  return {
    jazzCashNumber: process.env.FEATURED_JAZZCASH_NUMBER ?? "03XXXXXXXXX",
    easypaisaNumber: process.env.FEATURED_EASYPAISA_NUMBER ?? "03XXXXXXXXX",
    currency: "PKR",
  };
}

export function formatPlanAmount(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}
