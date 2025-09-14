import { cart } from '../../../../data/cart-class.js';

export class UpdateModel {
  getCurrentQuantity(productId) {
    const cartItem = cart.find(item => item.productId === productId);
    return cartItem ? cartItem.quantity : 0;
  }

  updateQuantity(productId, newQuantity) {
    // Validate the input
    if (isNaN(newQuantity) || newQuantity < 1 || newQuantity === '') {
      newQuantity = this.getCurrentQuantity(productId);
    } else if (newQuantity > 999) {
      newQuantity = 999;
    }

    // Update cart data
    cart.forEach((item) => {
      if (item.productId === productId) {
        item.quantity = newQuantity;
      }
    });

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    return newQuantity;
  }
} 