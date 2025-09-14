import { cart } from '../../../../data/cart-class.js';

export class DeleteModel {
  removeFromCart(productId) {
    const index = cart.findIndex(item => item.productId === productId);
    if (index !== -1) {
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      return true;
    }
    return false;
  }
} 