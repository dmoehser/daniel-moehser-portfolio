import { orders } from '../data/orders.js';
import { products } from '../data/products.js';
import { deliveryOptions } from './deliveryOptions.js';
import { addToCart, updateCartQuantity } from '../data/cart.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

/**
 * Renders all orders in the orders grid
 */
function renderOrders() {
  const ordersGrid = document.querySelector('.orders-grid');
  
  if (!ordersGrid) {
    console.error('Orders grid not found');
    return;
  }

  // Clear existing content
  ordersGrid.innerHTML = '';

  if (orders.length === 0) {
    renderEmptyState(ordersGrid);
    return;
  }

  orders.forEach(order => {
    const orderHTML = generateOrderHTML(order);
    ordersGrid.innerHTML += orderHTML;
  });
  
  // Set up event listeners for interactive buttons
  setupBuyAgainButtons();
}

/**
 * Renders empty state when no orders exist
 */
function renderEmptyState(container) {
  container.innerHTML = `
    <div class="empty-orders">
      <h2>No orders yet</h2>
      <p>Start shopping to see your orders here!</p>
      <a href="amazon.html" class="button-primary">Start Shopping</a>
    </div>
  `;
}

/**
 * Calculates the total cost for an order including subtotal, shipping, and tax
 */
function calculateOrderTotal(order) {
  // Calculate subtotal from order items
  const subtotal = calculateSubtotal(order.items);
  
  // Calculate shipping costs (unique delivery options only)
  const totalShippingCost = calculateShippingCost(order.items);
  
  // Calculate final total with tax
  const totalBeforeTax = (subtotal / 100) + (totalShippingCost / 100);
  const tax = totalBeforeTax * 0.1; // 10% tax
  const finalTotal = (totalBeforeTax + tax) * 100; // Convert back to cents
  
  return {
    subtotal,
    shippingCost: totalShippingCost,
    tax: tax * 100, // Convert to cents
    total: finalTotal
  };
}

/**
 * Calculates subtotal from order items
 */
function calculateSubtotal(items) {
  return items.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      console.warn('Product not found for item:', item);
      return sum;
    }
    return sum + (product.priceCents * item.quantity);
  }, 0);
}

/**
 * Calculates shipping costs for order items (unique delivery options only)
 */
function calculateShippingCost(items) {
  const uniqueDeliveryOptions = new Set();
  let totalShippingCost = 0;
  
  items.forEach(item => {
    const deliveryOption = deliveryOptions.find(d => d.id === item.deliveryOptionId);
    if (deliveryOption && !uniqueDeliveryOptions.has(item.deliveryOptionId)) {
      uniqueDeliveryOptions.add(item.deliveryOptionId);
      totalShippingCost += deliveryOption.priceCents;
    }
  });
  
  return totalShippingCost;
}

/**
 * Generates HTML for a single order
 */
function generateOrderHTML(order) {
  const orderDate = dayjs(order.date).format('MMMM D');
  const orderTotals = calculateOrderTotal(order);
  const orderTotal = formatCurrency(orderTotals.total);
  
  const productsHTML = generateProductsHTML(order);
  
  return `
    <div class="order-container">
      <div class="order-header">
        <div class="order-header-left-section">
          <div class="order-date">
            <div class="order-header-label">Order Placed:</div>
            <div>${orderDate}</div>
          </div>
          <div class="order-total">
            <div class="order-header-label">Total:</div>
            <div>${orderTotal}</div>
          </div>
        </div>

        <div class="order-header-right-section">
          <div class="order-id-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.orderId}</div>
          </div>
          <div class="order-details-link-header">
            <a href="order-details.html?orderId=${order.orderId}" class="order-details-link">
              View order details
            </a>
          </div>
        </div>
      </div>

      <div class="order-details-grid">
        ${productsHTML}
      </div>
    </div>
  `;
}

/**
 * Generates HTML for all products in an order
 */
function generateProductsHTML(order) {
  let productsHTML = '';
  
  order.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    const deliveryOption = deliveryOptions.find(d => d.id === item.deliveryOptionId);
    
    if (!product) return;
    
    const deliveryDate = dayjs().add(deliveryOption.deliveryDays, 'day').format('MMMM D');
    
    productsHTML += `
      <div class="product-image-container">
        <img src="${product.image}" loading="lazy" alt="${product.name}">
      </div>

      <div class="product-details">
        <div class="product-name">
          ${product.name}
        </div>
        <div class="product-delivery-date">
          Arriving on: ${deliveryDate}
        </div>
        <div class="product-quantity">
          Quantity: ${item.quantity}
        </div>
        <button class="buy-again-button button-primary" data-product-id="${product.id}" data-quantity="${item.quantity}">
          <div class="button-content">
            <img class="buy-again-icon" src="images/icons/buy-again.png">
            <span class="buy-again-message">Buy it again</span>
          </div>
          <div class="loading-bar"></div>
        </button>
      </div>

      <div class="product-actions">
        <a href="tracking.html?orderId=${order.orderId}&productId=${product.id}">
          <button class="track-package-button button-secondary">
            Track package
          </button>
        </a>
      </div>
    `;
  });
  
  return productsHTML;
}

/**
 * Formats cents to currency string
 */
function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Sets up event listeners for "Buy it again" buttons
 */
function setupBuyAgainButtons() {
  document.querySelectorAll('.buy-again-button').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const quantity = parseInt(button.dataset.quantity);
      
      if (productId && quantity) {
        addToCart(productId, quantity);
        
        // Show feedback to user
        const originalText = button.querySelector('.buy-again-message').textContent;
        button.querySelector('.buy-again-message').textContent = 'Added to cart';
        button.disabled = true;
        
        // Start loading bar animation
        const loadingBar = button.querySelector('.loading-bar');
        
        if (!loadingBar) {
          return;
        }
        
        loadingBar.style.width = '0%';
        
        // Animate loading bar over 2 seconds
        const startTime = Date.now();
        const duration = 2000; // 2 seconds
        
        function animateLoadingBar() {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const width = progress * 100;
          
          loadingBar.style.width = width + '%';
          
          if (progress < 1) {
            requestAnimationFrame(animateLoadingBar);
          } else {
            // Animation complete - reset button
            button.querySelector('.buy-again-message').textContent = originalText;
            button.disabled = false;
            loadingBar.style.width = '0%';
          }
        }
        
        // Start the animation
        requestAnimationFrame(animateLoadingBar);
      }
    });
  });
}

/**
 * Loads products and renders orders page
 */
async function loadOrdersPage() {
  try {
    // Load products if not already loaded
    if (products.length === 0) {
      const { loadProductsFetch } = await import('../data/products.js');
      await loadProductsFetch();
    }
    
    renderOrders();
  } catch (error) {
    console.error('Error loading orders page:', error);
  }
}

/**
 * Sets up the search bar functionality
 */
function setupSearchBar() {
  const searchButton = document.querySelector('.search-button');
  const searchInput = document.querySelector('.search-bar');
  
  if (!searchButton || !searchInput) {
    console.error('Search elements not found');
    return;
  }
  
  // Handle search button click
  searchButton.addEventListener('click', () => {
    performSearch();
  });
  
  // Handle Enter key press in search input
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  });
}

/**
 * Performs the search and navigates to amazon.html with search parameter
 */
function performSearch() {
  const searchInput = document.querySelector('.search-bar');
  const searchQuery = searchInput.value.trim();
  
  if (searchQuery) {
    // Navigate to amazon.html with search parameter
    const searchURL = `amazon.html?search=${encodeURIComponent(searchQuery)}`;
    window.location.href = searchURL;
  }
}

// Initialize the page
loadOrdersPage();
setupSearchBar();

// Update cart quantity after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  updateCartQuantity();
}); 