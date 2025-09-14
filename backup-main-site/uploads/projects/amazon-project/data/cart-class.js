import { products } from "./products.js";
import { deliveryOptions } from "../scripts/deliveryOptions.js";

class Cart {
  constructor() {
    this.cartItems = JSON.parse(localStorage.getItem('cart')) || [];
  }

  calculateCartQuantity() {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  updateCartQuantity() {
    const cartQuantityElement = document.querySelector('.js-cart-quantity');
    if (cartQuantityElement) { 
      const cartQuantity = this.calculateCartQuantity();
      cartQuantityElement.innerHTML = cartQuantity === 0 ? '' : cartQuantity;
    }
  }

  addToCart(productId, quantity, deliveryOptionId = '1') {
    let matchingItem = this.cartItems.find(item => item.productId === productId);
    const product = products.find(product => product.id === productId);

    if (matchingItem) {
      matchingItem.quantity += quantity;
    } else {
      this.cartItems.push({
        productId,
        quantity: quantity,
        deliveryOptionId: deliveryOptionId,
        product: product
      });
    }
    this.saveCart();
  }

  removeFromCart(productId) {
    this.cartItems = this.cartItems.filter(item => item.productId !== productId);
    this.saveCart();
  }

  updateDeliveryOption(productId, deliveryOptionId) {
    const cartItem = this.cartItems.find(item => item.productId === productId);
    if (!cartItem) return;
    const validDeliveryOption = deliveryOptions.find(option => option.id === deliveryOptionId);
    if (!validDeliveryOption) return;
    cartItem.deliveryOptionId = deliveryOptionId;
    delete cartItem.deliveryOptionsId;
    this.saveCart();
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.updateCartQuantity();
  }
}

export const cart = new Cart();