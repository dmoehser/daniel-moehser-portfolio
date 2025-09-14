export class DeleteView {
  constructor() {
    this.deleteLinks = document.querySelectorAll('.js-delete-link');
  }

  removeCartItem(productId) {
    const cartItemContainer = document.querySelector(`.js-cart-item-${productId}`);
    if (cartItemContainer) {
      cartItemContainer.remove();
    }
  }
} 