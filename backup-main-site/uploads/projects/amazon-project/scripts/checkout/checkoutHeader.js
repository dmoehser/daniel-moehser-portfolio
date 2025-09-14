import { cart } from '../../data/cart-class.js';

// Render the checkout header with the current cart quantity
export function renderCheckoutHeader() {
  const totalItems = cart.calculateCartQuantity();
  const itemText = totalItems === 1 ? 'item' : 'items';
  const headerSection = document.querySelector('.checkout-header-middle-section');
  if (headerSection) {
    headerSection.innerHTML = `Checkout (<a class="return-to-home-link js-cart-quantity" href="amazon.html">${totalItems} ${itemText}</a>)`;
  }
}