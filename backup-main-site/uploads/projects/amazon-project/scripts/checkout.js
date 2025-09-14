import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { Car } from '../data/car.js';
import { RaceCar } from '../data/car.js';
import { cart } from '../data/cart-class.js';
import { deliveryOptions } from '../scripts/deliveryOptions.js';
import moneyUtils from './utilis/money.js';
import { renderPaymantSummary } from './checkout/paymantSummary.js';
import { loadProductsFetch } from '../data/products.js';
import { loadCartFetch } from '../data/cart.js';
import { renderOrder, updateCheckoutTotals, updateCartQuantity } from './checkout/orderSummary.js';
import { addOrder } from '../data/orders.js';

async function loadPage() {
  console.log('load page');
  
  try {
    await Promise.all([
      loadProductsFetch(),
      loadCartFetch()
    ]);
    
    renderOrder();
    renderPaymantSummary();
    updateCheckoutTotals();
    updateCartQuantity();
    setupPlaceOrderButton();
  } catch (error) {
    console.error('Error loading checkout data:', error);
  }
}
/**
 * Sets up the event listener for the place order button to handle order submission,
 * send cart data to backend, and clear cart on successful order placement
 */
function setupPlaceOrderButton() {
  const placeOrderButton = document.querySelector('.js-place-order-button');
  
  if (placeOrderButton) {
    placeOrderButton.addEventListener('click', async () => {
      try {
        // Format cart data for backend
        const cartData = {
          cart: cart.cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            deliveryOptionId: item.deliveryOptionId
          }))
        };

        console.log('Sending order to backend:', cartData);

        const response = await fetch('https://supersimplebackend.dev/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cartData)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Order placed successfully:', result);
        
        // Save order to local storage
        addOrder({
          orderId: result.orderId || Date.now().toString(),
          items: cart.cartItems,
          total: cart.cartItems.reduce((sum, item) => {
            if (!item.product) return sum;
            return sum + item.product.priceCents * item.quantity;
          }, 0),
          date: new Date().toISOString()
        });
        
        // Clear cart after successful order
        cart.cartItems = [];
        cart.saveCart();
        
        // Redirect to orders page
        window.location.href = 'orders.html';
        
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order. Please try again.');
      }
    });
  }
}

loadPage();

/*
Promise.all([
  loadProductsFetch(),
  new Promise((resolve) => loadCart(resolve))
]).then(() => {
  renderOrder();
  renderPaymantSummary(); 
  updateCheckoutTotals();
  updateCartQuantity();
})
*/

/*
loadProducts(() => {
  renderOrder();
  renderPaymantSummary();
  updateCheckoutTotals();
  updateCartQuantity();
});
*/
