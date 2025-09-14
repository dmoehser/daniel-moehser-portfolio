import { formatCurrency } from "../scripts/utilis/money.js";

if (formatCurrency(2000.4) === '20.00') {
  console.log('passed');
} else {
  console.log('failed');
}