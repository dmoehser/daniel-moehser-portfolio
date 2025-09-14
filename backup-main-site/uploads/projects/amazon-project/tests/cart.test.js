import { jest } from '@jest/globals';

// Mock document
global.document = {
  querySelector: jest.fn()
};

const localStorageMock = {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

let cart, addToCart, removeFromCart, updateDeliveryOption;

beforeAll(async () => {
  const cartModule = await import('../data/cart.js');
  cart = cartModule.cart;
  addToCart = cartModule.addToCart;
  removeFromCart = cartModule.removeFromCart;
  updateDeliveryOption = cartModule.updateDeliveryOption;
});

describe('addToCart', () => {
  beforeEach(() => {
    cart.length = 0;
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.clear.mockClear();
    document.querySelector.mockClear();
  });

  test('saves the shopping cart in localStorage', () => {
    const productId = 'test-product-id';
    const quantity = 2;

    addToCart(productId, quantity);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([
        {
          productId: productId,
          quantity: quantity,
          deliveryOptionId: '1'
        }
      ])
    );
  });

  test('increases the quantity if the product is already in the shopping cart', () => {
    const productId = 'test-product-id';
    
    // Add first product
    addToCart(productId, 2);
    
    // Add the same product a second time
    addToCart(productId, 3);

    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      'cart',
      JSON.stringify([
        {
          productId: productId,
          quantity: 5, // 2 + 3
          deliveryOptionId: '1'
        }
      ])
    );
  });
});

describe('removeFromCart', () => {
  beforeEach(() => {
    cart.length = 0;
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.clear.mockClear();
    document.querySelector.mockClear();
  });

  test('should remove a product that exists in the cart', () => {
    const productId = 'test-product-id';
    
    // Add product to cart first
    addToCart(productId, 2);
    
    // Clear the mock to start fresh for our test
    localStorage.setItem.mockClear();
    
    // Remove the product
    removeFromCart(productId);

    // Check if localStorage.setItem was called once
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    
    // Check if the cart is empty
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([])
    );
  });

  test('should do nothing when removing a product that is not in the cart', () => {
    const existingProductId = 'existing-product';
    const nonExistingProductId = 'non-existing-product';
    
    // Add one product to cart
    addToCart(existingProductId, 2);
    
    // Clear the mock to start fresh for our test
    localStorage.setItem.mockClear();
    
    // Try to remove a product that doesn't exist
    removeFromCart(nonExistingProductId);

    // Check if localStorage.setItem was called once (to save the unchanged cart)
    expect(localStorage.setItem).toHaveBeenCalledTimes(1);
    
    // Check if the cart still contains the original product
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'cart',
      JSON.stringify([
        {
          productId: existingProductId,
          quantity: 2,
          deliveryOptionId: '1'
        }
      ])
    );
  });
});

describe('updateDeliveryOption', () => {
  beforeEach(() => {
    cart.length = 0;
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.clear.mockClear();
  });

  test('should update the delivery option of a product in the cart', () => {
    // Arrange: Add a product to the cart
    const productId = 'test-product-id';
    const quantity = 2;
    addToCart(productId, quantity);

    // Act: Update the delivery option
    updateDeliveryOption(productId, '3');

    // Assert: Check if the cart looks correct
    expect(cart.length).toBe(1);
    expect(cart[0]).toEqual({
      productId: productId,
      quantity: quantity,
      deliveryOptionId: '3'
    });

    // Assert: Check if localStorage.setItem was called once with the correct values
    expect(localStorage.setItem).toHaveBeenCalledTimes(2); // 1x addToCart, 1x updateDeliveryOption
    expect(localStorage.setItem).toHaveBeenLastCalledWith(
      'cart',
      JSON.stringify([
        {
          productId: productId,
          quantity: quantity,
          deliveryOptionId: '3'
        }
      ])
    );
  });

  test('should do nothing if product is not in the cart', () => {
    // Arrange: Add a different product
    addToCart('existing-product', 1);
    localStorage.setItem.mockClear(); // Nur updateDeliveryOption zählt

    // Act: Try to update delivery option for a non-existing product
    updateDeliveryOption('not-in-cart', '2');

    // Assert: Cart remains unchanged
    expect(cart.length).toBe(1);
    expect(cart[0].productId).toBe('existing-product');
    expect(cart[0].deliveryOptionId).toBe('1');
    // Assert: setItem was not called
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test('should do nothing if deliveryOptionId does not exist', () => {
    // Arrange: Add a product to the cart
    const productId = 'test-product-id';
    addToCart(productId, 1);
    localStorage.setItem.mockClear(); // Only updateDeliveryOption counts

    // Act: Try to update with an invalid deliveryOptionId
    updateDeliveryOption(productId, '999');

    // Assert: Cart remains unchanged
    expect(cart.length).toBe(1);
    expect(cart[0].productId).toBe(productId);
    expect(cart[0].deliveryOptionId).toBe('1');
    // Assert: setItem was not called
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
}); 
