# Amazon Clone - E-Commerce Web Application

A fully functional Amazon clone built with vanilla JavaScript, HTML5, and CSS3. Features a complete e-commerce experience with shopping cart, checkout process, order management, and responsive design.

## GitHub Repository

View source code: [https://github.com/dmoehser/javascript-amazon-project](https://github.com/dmoehser/javascript-amazon-project)

## Features

- **Product Catalog**: Browse and search through a variety of products
- **Shopping Cart**: Add, remove, and update items in your cart
- **Checkout Process**: Complete order placement with delivery options
- **Order Management**: View order history and track shipments
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Search Functionality**: Find products quickly with the search bar
- **Dynamic Pricing**: Real-time price calculations and updates
- **Interactive UI**: Smooth animations and user-friendly interface

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Advanced styling with Flexbox and Grid
- **JavaScript (ES6+)**: Modern JavaScript with modules
- **Responsive Design**: Mobile-first approach
- **Local Storage**: Persistent cart and user data
- **JSON**: Product data management

## Project Structure

```
amazon-project/
├── amazon.html              # Main product page
├── checkout.html            # Checkout process
├── orders.html              # Order history
├── order-details.html       # Individual order details
├── tracking.html            # Order tracking
├── scripts/
│   ├── amazon.js           # Main product page logic
│   ├── checkout.js         # Checkout functionality
│   ├── orders.js           # Order management
│   ├── tracking.js         # Order tracking
│   └── utils/              # Utility functions
├── styles/
│   ├── shared/             # Shared CSS components
│   └── pages/              # Page-specific styles
├── data/
│   ├── products.js         # Product data and classes
│   └── cart.js             # Shopping cart logic
├── images/                 # Product images and icons
└── tests/                  # Jest test files
```

## Key Features Implemented

### Shopping Cart System
- Add/remove products from cart
- Update quantities dynamically
- Persistent cart using localStorage
- Real-time price calculations

### Product Management
- Product catalog with categories
- Search and filter functionality
- Product details and images
- Dynamic product rendering

### Checkout Process
- Delivery options selection
- Payment summary
- Order confirmation
- Form validation

### Order Tracking
- Order history display
- Order status tracking
- Delivery date estimation
- Order details view

## What I Learned

- **Advanced JavaScript**: ES6+ modules, classes, and modern syntax
- **DOM Manipulation**: Dynamic content creation and updates
- **Event Handling**: Complex user interactions and form management
- **Local Storage**: Data persistence without backend
- **Responsive Design**: Mobile-first CSS development
- **Code Organization**: Modular JavaScript architecture
- **Testing**: Jest unit testing implementation
- **E-commerce Logic**: Shopping cart and checkout flow

## Why I Built This

I wanted to create a comprehensive e-commerce application to demonstrate my frontend development skills. This project showcases my ability to build complex, interactive web applications using vanilla JavaScript without relying on frameworks.

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for CORS compliance)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/dmoehser/javascript-amazon-project.git
   cd javascript-amazon-project
   ```

2. Start a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000/amazon.html
   ```

## Usage

1. **Browse Products**: Scroll through the product catalog
2. **Search**: Use the search bar to find specific items
3. **Add to Cart**: Click "Add to Cart" on any product
4. **View Cart**: Click the cart icon to see your items
5. **Checkout**: Proceed through the checkout process
6. **Track Orders**: View your order history and tracking

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Inspired by Amazon's user interface and functionality
- Built as part of a comprehensive JavaScript learning journey
- Special thanks to the JavaScript community for best practices and patterns

---

**Created with ❤️ by [danielmoehser.dev](https://danielmoehser.dev)**