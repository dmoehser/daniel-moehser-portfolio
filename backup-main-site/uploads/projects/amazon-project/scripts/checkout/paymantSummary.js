import { cart } from '../../data/cart-class.js';
import { deliveryOptions } from '../deliveryOptions.js';
import { moneyUtils } from '../../scripts/utilis/money.js';

export function renderPaymantSummary() {
  const totalItems = cart.calculateCartQuantity();
  const totalPrice = cart.cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    return sum + item.product.priceCents * item.quantity;
  }, 0);
  
  // Calculate shipping costs
  const uniqueProductIds = new Set();
  const shippingCost = cart.cartItems.reduce((sum, item) => {
    if (!item.product) return sum;
    if (uniqueProductIds.has(item.product.id)) {
      return sum;
    }
    uniqueProductIds.add(item.product.id);
    const deliveryOption = deliveryOptions.find(option => option.id === item.deliveryOptionId);
    return sum + (deliveryOption ? deliveryOption.priceCents : 0);
  }, 0);
  
  const totalBeforeTax = (totalPrice / 100) + (shippingCost / 100);
  const tax = totalBeforeTax * 0.1;
  const total = totalBeforeTax + tax;

  // Update items row
  const itemsRow = document.querySelector('.js-items-row');
  if (itemsRow) {
    itemsRow.innerHTML = `
      <div>Items (${totalItems}):</div>
      <div class="payment-summary-money">$${moneyUtils.formatCurrency(totalPrice)}</div>
    `;
  }

  // Update shipping cost
  const shippingElement = document.querySelector('.js-shipping-cost');
  if (shippingElement) {
    shippingElement.textContent = `$${moneyUtils.formatCurrency(shippingCost)}`;
  }

  // Update subtotal
  const subtotalElement = document.querySelector('.js-subtotal');
  if (subtotalElement) {
    subtotalElement.textContent = `$${moneyUtils.formatCurrency(totalBeforeTax * 100)}`;
  }

  // Update tax
  const taxElement = document.querySelector('.js-tax');
  if (taxElement) {
    taxElement.textContent = `$${moneyUtils.formatCurrency(tax * 100)}`;
  }

  // Update total
  const totalElement = document.querySelector('.js-total');
  if (totalElement) {
    totalElement.textContent = `$${moneyUtils.formatCurrency(total * 100)}`;
  }

  // Add place order button
  const paymentSummary = document.querySelector('.payment-summary');
  if (paymentSummary) {
    // Remove existing button if it exists
    const existingButton = paymentSummary.querySelector('.js-place-order-button');
    if (existingButton) {
      existingButton.remove();
    }
    
    // Add new button directly (without payment-summary-row wrapper)
    const buttonHTML = `
      <button class="js-place-order-button place-order-button button-primary">
        Place your order
      </button>
    `;
    paymentSummary.insertAdjacentHTML('beforeend', buttonHTML);
  }
}


 