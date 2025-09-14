import { formatCurrency } from './money.js';

export function formatCurrencyWrapper(...args) {
  return formatCurrency(...args);
} 