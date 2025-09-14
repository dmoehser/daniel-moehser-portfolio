import { orders } from '../data/orders.js';
import { products } from '../data/products.js';
import { deliveryOptions } from './deliveryOptions.js';
import { updateCartQuantity } from '../data/cart.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

/**
 * Gets URL parameters for orderId, productId, and from
 */
function getURLParameters() {
  const url = new URL(window.location.href);
  const orderId = url.searchParams.get('orderId');
  const productId = url.searchParams.get('productId');
  const from = url.searchParams.get('from');
  
  return { orderId, productId, from };
}

/**
 * Validates that required URL parameters are present
 */
function validateURLParameters(orderId, productId) {
  if (!orderId || !productId) {
    console.error('Missing required URL parameters: orderId and productId');
    return false;
  }
  return true;
}

/**
 * Finds the specific order and product item
 */
function findOrderAndProduct(orderId, productId) {
  // Find the order
  const order = orders.find(o => o.orderId === orderId);
  if (!order) {
    console.error('Order not found:', orderId);
    return null;
  }
  
  // Find the specific product item in the order
  const orderItem = order.items.find(item => item.productId === productId);
  if (!orderItem) {
    console.error('Product not found in order:', productId);
    return null;
  }
  
  // Find the product details
  const product = products.find(p => p.id === productId);
  if (!product) {
    console.error('Product details not found:', productId);
    return null;
  }
  
  // Find the delivery option
  const deliveryOption = deliveryOptions.find(d => d.id === orderItem.deliveryOptionId);
  if (!deliveryOption) {
    console.error('Delivery option not found:', orderItem.deliveryOptionId);
    return null;
  }
  
  return { order, orderItem, product, deliveryOption };
}

/**
 * Calculates delivery date based on delivery option
 */
function calculateDeliveryDate(deliveryOption) {
  return dayjs().add(deliveryOption.deliveryDays, 'day').format('dddd, MMMM D');
}

/**
 * Calculates delivery progress percentage
 */
function calculateDeliveryProgress(order, deliveryOption) {
  const orderTime = dayjs(order.date);
  const currentTime = dayjs();
  const deliveryTime = orderTime.add(deliveryOption.deliveryDays, 'day');
  
  // Calculate percentage: ((currentTime - orderTime) / (deliveryTime - orderTime)) * 100
  const totalDeliveryTime = deliveryTime.diff(orderTime, 'millisecond');
  const elapsedTime = currentTime.diff(orderTime, 'millisecond');
  
  const progressPercentage = (elapsedTime / totalDeliveryTime) * 100;
  
  // Ensure percentage is between 0 and 100
  return Math.max(0, Math.min(100, progressPercentage));
}

/**
 * Determines current tracking status based on progress percentage
 */
function getTrackingStatus(progressPercentage) {
  if (progressPercentage < 50) {
    return 'Preparing';
  } else if (progressPercentage < 100) {
    return 'Shipped';
  } else {
    return 'Delivered';
  }
}

/**
 * Renders the tracking page with order and product information
 */
function renderTrackingPage(orderData, from) {
  const { order, orderItem, product, deliveryOption } = orderData;
  
  const deliveryDate = calculateDeliveryDate(deliveryOption);
  const progressPercentage = calculateDeliveryProgress(order, deliveryOption);
  const trackingStatus = getTrackingStatus(progressPercentage);
  
  const trackingContainer = document.querySelector('.order-tracking');
  if (!trackingContainer) {
    console.error('Tracking container not found');
    return;
  }
  
  // Generate back links based on where user came from
  let backLinksHTML = `
    <a class="back-to-orders-link link-primary" href="orders.html">
      View all orders
    </a>
  `;
  
  // Show order details link with different text based on where user came from
  if (from === 'order-details') {
    backLinksHTML += `
      <a class="back-to-order-details-link link-primary" href="order-details.html?orderId=${order.orderId}">
        Back to order details
      </a>
    `;
  } else {
    // User came from orders.html or directly to tracking
    backLinksHTML += `
      <a class="back-to-order-details-link link-primary" href="order-details.html?orderId=${order.orderId}">
        View order details
      </a>
    `;
  }
  
  // Update the page content
  trackingContainer.innerHTML = `
    <div class="back-links">
      ${backLinksHTML}
    </div>

    <div class="delivery-date">
      Arriving on ${deliveryDate}
    </div>

    <div class="product-info">
      ${product.name}
    </div>

    <div class="product-info">
      Quantity: ${orderItem.quantity}
    </div>

    <img class="product-image" src="${product.image}" loading="lazy" alt="${product.name}">

    <div class="progress-labels-container">
      <div class="progress-label ${trackingStatus === 'Preparing' ? 'current-status' : ''}">
        Preparing
      </div>
      <div class="progress-label ${trackingStatus === 'Shipped' ? 'current-status' : ''}">
        Shipped
      </div>
      <div class="progress-label ${trackingStatus === 'Delivered' ? 'current-status' : ''}">
        Delivered
      </div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${getProgressBarWidth(progressPercentage)}%"></div>
    </div>
  `;
}

/**
 * Calculates progress bar width based on progress percentage
 */
function getProgressBarWidth(progressPercentage) {
  return progressPercentage;
}

/**
 * Shows error message if parameters are invalid
 */
function showErrorMessage() {
  const main = document.querySelector('.main');
  if (main) {
    main.innerHTML = `
      <div class="error-message">
        <h2>Invalid Tracking Information</h2>
        <p>The order or product could not be found.</p>
        <a href="orders.html" class="button-primary">Back to Orders</a>
      </div>
    `;
  }
}

/**
 * Main function to initialize the tracking page
 */
async function loadTrackingPage() {
  try {
    // Get URL parameters
    const { orderId, productId, from } = getURLParameters();
    
    // Validate parameters
    if (!validateURLParameters(orderId, productId)) {
      showErrorMessage();
      return;
    }
    
    // Load products if not already loaded
    if (products.length === 0) {
      const { loadProductsFetch } = await import('../data/products.js');
      await loadProductsFetch();
    }
    
    // Find order and product data
    const orderData = findOrderAndProduct(orderId, productId);
    if (!orderData) {
      showErrorMessage();
      return;
    }
    
    // Render the tracking page
    renderTrackingPage(orderData, from);
    
  } catch (error) {
    console.error('Error loading tracking page:', error);
    showErrorMessage();
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
loadTrackingPage();
setupSearchBar();

// Update cart quantity after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  updateCartQuantity();
}); 