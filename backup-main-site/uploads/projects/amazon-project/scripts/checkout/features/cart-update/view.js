export class UpdateView {
  constructor() {
    this.updateLinks = document.querySelectorAll('.js-update-link');
    this.saveLinks = document.querySelectorAll('.js-save-link');
  }

  showUpdateMode(productId) {
    const updateLink = document.querySelector(`.js-update-link[data-product-id="${productId}"]`);
    const saveLink = document.querySelector(`.js-save-link[data-product-id="${productId}"]`);
    const container = updateLink.closest('.product-quantity');
    const quantityLabel = container.querySelector('.quantity-label');
    const quantitySelector = container.querySelector(`.js-quantity-selector-${productId}`);

    // Hide update link and quantity label, show save link and selector
    updateLink.style.display = 'none';
    saveLink.style.display = 'inline';
    quantityLabel.parentElement.style.display = 'none';
    quantitySelector.style.display = 'inline-block';
    quantitySelector.value = quantityLabel.textContent;
    quantitySelector.focus();
    quantitySelector.select();
  }

  showDisplayMode(productId, newQuantity) {
    const saveLink = document.querySelector(`.js-save-link[data-product-id="${productId}"]`);
    const updateLink = document.querySelector(`.js-update-link[data-product-id="${productId}"]`);
    const container = saveLink.closest('.product-quantity');
    const quantityLabel = container.querySelector('.quantity-label');
    const quantitySelector = container.querySelector(`.js-quantity-selector-${productId}`);

    // Update display
    quantityLabel.textContent = newQuantity;
    
    // Show/hide elements
    saveLink.style.display = 'none';
    updateLink.style.display = 'inline';
    quantitySelector.style.display = 'none';
    quantityLabel.parentElement.style.display = 'inline';
  }

  getQuantityInput(productId) {
    const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);
    return parseInt(quantitySelector.value);
  }
} 