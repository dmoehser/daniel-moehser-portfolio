import { orders } from '../data/orders.js';
import { products } from '../data/products.js';
import { deliveryOptions } from './deliveryOptions.js';
import { updateCartQuantity } from '../data/cart.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

/**
 * Gets URL parameter for orderId
 */
function getURLParameter() {
  const url = new URL(window.location.href);
  const orderId = url.searchParams.get('orderId');
  return orderId;
}

/**
 * Validates that required URL parameter is present
 */
function validateURLParameter(orderId) {
  if (!orderId) {
    console.error('Missing required URL parameter: orderId');
    return false;
  }
  return true;
}

/**
 * Finds the specific order
 */
function findOrder(orderId) {
  const order = orders.find(o => o.orderId === orderId);
  if (!order) {
    console.error('Order not found:', orderId);
    return null;
  }
  return order;
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
 * Formats cents to currency string
 */
function formatCurrency(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Generates HTML for order items
 */
function generateOrderItemsHTML(order) {
  let itemsHTML = '';
  
  order.items.forEach(item => {
    const product = products.find(p => p.id === item.productId);
    const deliveryOption = deliveryOptions.find(d => d.id === item.deliveryOptionId);
    
    if (!product) return;
    
    const itemTotal = product.priceCents * item.quantity;
    const deliveryDate = dayjs().add(deliveryOption.deliveryDays, 'day').format('dddd, MMMM D');
    
    // Generate delivery option name based on delivery days
    let deliveryOptionName;
    if (deliveryOption.deliveryDays === 1) {
      deliveryOptionName = 'Next-day delivery';
    } else if (deliveryOption.deliveryDays === 3) {
      deliveryOptionName = '3-day delivery';
    } else if (deliveryOption.deliveryDays === 7) {
      deliveryOptionName = 'Free delivery';
    } else {
      deliveryOptionName = `${deliveryOption.deliveryDays}-day delivery`;
    }
    
    itemsHTML += `
      <div class="order-item">
        <div class="item-image-container">
          <img src="${product.image}" loading="lazy" alt="${product.name}">
        </div>
        
        <div class="item-details">
          <div class="item-name">${product.name}</div>
          <div class="item-price">${formatCurrency(product.priceCents)} each</div>
          <div class="item-quantity">Quantity: ${item.quantity}</div>
          <div class="item-delivery">Arriving: ${deliveryDate}</div>
          <div class="item-delivery-option">${deliveryOptionName}</div>
          <div class="item-actions">
            <a href="tracking.html?orderId=${order.orderId}&productId=${product.id}&from=order-details" class="track-link">
              Track package
            </a>
          </div>
        </div>
        
        <div class="item-total">
          ${formatCurrency(itemTotal)}
        </div>
      </div>
    `;
  });
  
  return itemsHTML;
}

/**
 * Renders the order details page
 */
function renderOrderDetails(order) {
  const orderDate = dayjs(order.date).format('dddd, MMMM D, YYYY');
  const orderTotals = calculateOrderTotal(order);
  
  const orderDetailsContainer = document.querySelector('.order-details');
  if (!orderDetailsContainer) {
    console.error('Order details container not found');
    return;
  }
  
  orderDetailsContainer.innerHTML = `
    <a class="back-to-orders-link link-primary" href="orders.html">
      ← Back to orders
    </a>

    <div class="order-header">
      <h1 class="order-title">Order Details</h1>
      <div class="order-info">
        <div class="order-date">
          <span class="label">Order placed:</span>
          <span>${orderDate}</span>
        </div>
        <div class="order-id">
          <span class="label">Order ID:</span>
          <span>${order.orderId}</span>
        </div>
      </div>
    </div>

    <div class="order-content">
      <div class="order-items-section">
        <h2>Items Ordered</h2>
        <div class="order-items">
          ${generateOrderItemsHTML(order)}
        </div>
      </div>

      <div class="order-summary-section">
        <h2>Order Summary</h2>
        <div class="order-summary">
          <div class="summary-row">
            <span class="label">Items Subtotal:</span>
            <span>${formatCurrency(orderTotals.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span class="label">Shipping & Handling:</span>
            <span>${formatCurrency(orderTotals.shippingCost)}</span>
          </div>
          <div class="summary-row">
            <span class="label">Tax:</span>
            <span>${formatCurrency(orderTotals.tax)}</span>
          </div>
          <div class="summary-row total">
            <span class="label">Order Total:</span>
            <span>${formatCurrency(orderTotals.total)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Shows error message if order is not found
 */
function showErrorMessage() {
  const main = document.querySelector('.main');
  if (main) {
    main.innerHTML = `
      <div class="error-message">
        <h2>Order Not Found</h2>
        <p>The order you're looking for could not be found.</p>
        <a href="orders.html" class="button-primary">Back to Orders</a>
      </div>
    `;
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

/**
 * Main function to initialize the order details page
 */
async function loadOrderDetailsPage() {
  try {
    // Get URL parameter
    const orderId = getURLParameter();
    
    // Validate parameter
    if (!validateURLParameter(orderId)) {
      showErrorMessage();
      return;
    }
    
    // Load products if not already loaded
    if (products.length === 0) {
      const { loadProductsFetch } = await import('../data/products.js');
      await loadProductsFetch();
    }
    
    // Find order
    const order = findOrder(orderId);
    if (!order) {
      showErrorMessage();
      return;
    }
    
    // Render the order details page
    renderOrderDetails(order);
    
  } catch (error) {
    console.error('Error loading order details page:', error);
    showErrorMessage();
  }
}

// Initialize the page
loadOrderDetailsPage();
setupSearchBar();

// Update cart quantity after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  updateCartQuantity();
}); 