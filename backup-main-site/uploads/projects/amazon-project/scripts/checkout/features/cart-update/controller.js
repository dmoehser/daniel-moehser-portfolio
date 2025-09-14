import { UpdateModel } from './model.js';
import { UpdateView } from './view.js';
import { updateCartQuantity } from '../../../../data/cart.js';
import { renderPaymantSummary as updateCheckoutTotals } from '../../paymantSummary.js';
import { renderCheckoutHeader } from '../../checkoutHeader.js';

export class UpdateController {
  constructor() {
    this.model = new UpdateModel();
    this.view = new UpdateView();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Update link click handler
    this.view.updateLinks.forEach(link => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        this.view.showUpdateMode(productId);

        // Add key event listener for Enter key
        const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);
        quantitySelector.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            this.handleSave(productId);
          }
        });
      });
    });

    // Save link click handler
    this.view.saveLinks.forEach(link => {
      link.addEventListener('click', () => {
        const productId = link.dataset.productId;
        this.handleSave(productId);
      });
    });
  }

  handleSave(productId) {
    const newQuantity = this.view.getQuantityInput(productId);
    const validatedQuantity = this.model.updateQuantity(productId, newQuantity);
    this.view.showDisplayMode(productId, validatedQuantity);
    updateCheckoutTotals();
    updateCartQuantity();
    renderCheckoutHeader();
  }
} 