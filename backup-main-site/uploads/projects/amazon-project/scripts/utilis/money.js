export const moneyUtils = {
  formatCurrency(priceCents) {
    const sign = priceCents < 0 ? -1 : 1;
    const absoluteValue = Math.abs(priceCents);
    const roundedValue = Math.round(absoluteValue);
    return ((sign * roundedValue) / 100).toFixed(2);
  }
};

export default moneyUtils;