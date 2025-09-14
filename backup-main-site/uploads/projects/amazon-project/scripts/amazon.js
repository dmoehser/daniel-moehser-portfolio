import { addToCart, cart, updateCartQuantity } from '../data/cart.js';
import { Appliance, ClothingProduct, products, loadProductsFetch } from '../data/products.js';
import { moneyUtils } from './utilis/money.js';

// Initialize the page
loadProductsFetch().then(() => {
  renderProductsGrid();
  setupSearchBar();
}).catch((error) => {
  console.error('Error loading products:', error);
});

// Update cart quantity when page loads
updateCartQuantity();

function renderProductsGrid() {
  // Check if products are loaded
  if (!products || products.length === 0) {
    console.warn('No products available to render');
    return;
  }

  let productsHtml = '';

  products.forEach((product) => {
    productsHtml += generateProductHTML(product);
  });

  const productsGrid = document.querySelector('.js-products-grid');
  if (productsGrid) {
    productsGrid.innerHTML = productsHtml;
    setupAddToCartListeners();
  } else {
    console.error('Products grid element not found');
  }
}

function generateProductHTML(product) {
  const quantityOptions = generateQuantityOptions();
  const productLinks = generateProductLinks(product);
  
  return `
    <div class="product-container">
      <div class="product-image-container">
        <img class="product-image" src="${product.image}" loading="lazy" alt="${product.name}">
      </div>

      <div class="product-name limit-text-to-2-lines">
        ${product.name}
      </div>

      <div class="product-rating-container">
        <img class="product-rating-stars"
          src="images/ratings/rating-${product.rating.stars * 10}.png"
          alt="Rating: ${product.rating.stars} stars">
        <div class="product-rating-count link-primary">
          ${product.rating.count}
        </div>
      </div>

      <div class="product-price">
        $${moneyUtils.formatCurrency(product.priceCents)}
      </div>

      <div class="product-quantity-container">
        <select class="js-quantity-selector-${product.id}">
          ${quantityOptions}
        </select>
      </div>
      
      ${productLinks}
      
      <div class="product-spacer"></div>

      <div class="added-to-cart js-added-to-cart">
        <img src="images/icons/checkmark.png" alt="Checkmark">
        Added
      </div>

      <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${product.id}">
        Add to Cart
      </button>
    </div>
  `;
}

function generateQuantityOptions() {
  let options = '';
  for (let i = 1; i <= 10; i++) {
    options += `<option value="${i}">${i}</option>`;
  }
  return options;
}

function generateProductLinks(product) {
  if (product instanceof ClothingProduct) {
    return `<a href="${product.getSizeChartLink()}" target="_blank" class="size-chart-link">Size chart</a>`;
  } else if (product instanceof Appliance) {
    return `
      <a href="${product.instructionsLink}" target="_blank">Instructions</a>
      <a href="${product.warrantyLink}" target="_blank">Warranty</a>
    `;
  }
  return '';
}

function setupAddToCartListeners() {
  // Save the timeouts for each button
  const addedMessageTimeouts = new Map();

  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      handleAddToCart(button, addedMessageTimeouts);
    });
  });
}

function handleAddToCart(button, timeouts) {
  const { productId } = button.dataset;
  const quantitySelector = document.querySelector(
    `.js-quantity-selector-${productId}`
  );
  
  if (!quantitySelector) {
    console.error(`Quantity selector not found for product ${productId}`);
    return;
  }
  
  // Ensure quantity is read as a number
  const quantity = parseInt(quantitySelector.value, 10);
  
  if (isNaN(quantity) || quantity < 1) {
    console.error(`Invalid quantity: ${quantitySelector.value}`);
    return;
  }
  
  addToCart(productId, quantity);
  showAddedMessage(button, productId, timeouts);
}

function showAddedMessage(button, productId, timeouts) {
  const container = button.closest('.product-container');
  const addedMessage = container.querySelector('.js-added-to-cart');
  
  if (!addedMessage) {
    console.error('Added message element not found');
    return;
  }
  
  // Clear previous timeout for this button
  if (timeouts.has(productId)) {
    clearTimeout(timeouts.get(productId));
  }

  addedMessage.style.opacity = '1';

  // Save the new timeout
  const timeout = setTimeout(() => {
    addedMessage.style.opacity = '0';
  }, 2000);

  timeouts.set(productId, timeout);
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
  
  // Check for search parameter in URL and filter products
  checkURLSearchParameter();
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
 * Checks for search parameter in URL and filters products accordingly
 */
function checkURLSearchParameter() {
  const url = new URL(window.location.href);
  const searchQuery = url.searchParams.get('search');
  
  if (searchQuery) {
    // Set the search input value
    const searchInput = document.querySelector('.search-bar');
    if (searchInput) {
      searchInput.value = searchQuery;
    }
    
    // Filter and render products
    renderFilteredProducts(searchQuery);
  }
}

/**
 * Renders products filtered by search query
 */
function renderFilteredProducts(searchQuery) {
  if (!products || products.length === 0) {
    console.warn('No products available to filter');
    return;
  }
  
  // Filter products whose names OR keywords contain the search query
  const filteredProducts = products.filter(product => {
    const searchQueryLower = searchQuery.toLowerCase();
    const productNameLower = product.name.toLowerCase();
    
    // Check if search query is in product name
    const nameMatches = productNameLower.includes(searchQueryLower);
    
    // Check if search query is in any keyword
    const keywordMatches = product.keywords && product.keywords.some(keyword =>
      keyword.toLowerCase().includes(searchQueryLower)
    );
    
    return nameMatches || keywordMatches;
  });
  
  let productsHtml = '';
  
  if (filteredProducts.length === 0) {
    // Show "no results" message
    productsHtml = `
      <div class="no-results">
        <h2>No products found for "${searchQuery}"</h2>
        <p>Try searching for something else or browse our products.</p>
        <a href="amazon.html" class="button-primary">View All Products</a>
      </div>
    `;
  } else {
    // Generate HTML for filtered products
    filteredProducts.forEach((product) => {
      productsHtml += generateProductHTML(product);
    });
  }
  
  const productsGrid = document.querySelector('.js-products-grid');
  if (productsGrid) {
    productsGrid.innerHTML = productsHtml;
    setupAddToCartListeners();
  } else {
    console.error('Products grid element not found');
  }
}