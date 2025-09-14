import { cart } from './cart-class.js';

describe('Cart', () => {
  beforeEach(() => {
   // We empty the shopping cart before each test
    cart.cartItems = [];
    cart.saveCart();
  });

  it('should add items to cartItems', () => {
    cart.addToCart('test1', 2);
    expect(cart.cartItems.length).toBe(1);
    expect(cart.cartItems[0].productId).toBe('test1');
    expect(cart.cartItems[0].quantity).toBe(2);
  });

  it('should increase quantity if same product is added', () => {
    cart.addToCart('test1', 2);
    cart.addToCart('test1', 3);
    expect(cart.cartItems.length).toBe(1);
    expect(cart.cartItems[0].quantity).toBe(5);
  });

  it('should remove items from cartItems', () => {
    cart.addToCart('test1', 2);
    cart.addToCart('test2', 1);
    cart.removeFromCart('test1');
    expect(cart.cartItems.length).toBe(1);
    expect(cart.cartItems[0].productId).toBe('test2');
  });

  it('should clear cartItems', () => {
    cart.addToCart('test1', 2);
    cart.addToCart('test2', 1);
    cart.cartItems = [];
    expect(cart.cartItems.length).toBe(0);
  });
}); 
