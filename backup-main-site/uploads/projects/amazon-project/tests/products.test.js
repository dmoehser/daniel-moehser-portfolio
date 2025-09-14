import { products } from '../data/products.js';

describe('products.js', () => {
  test('products array should not be empty', () => {
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
  });

  test('each product should have required fields', () => {
    products.forEach(product => {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('priceCents');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('rating');
      expect(product.rating).toHaveProperty('stars');
      expect(product.rating).toHaveProperty('count');
      expect(product).toHaveProperty('keywords');
      expect(Array.isArray(product.keywords)).toBe(true);
    });
  });

  test('all product ids should be unique', () => {
    const ids = products.map(p => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('all prices should be positive numbers', () => {
    products.forEach(product => {
      expect(typeof product.priceCents).toBe('number');
      expect(product.priceCents).toBeGreaterThan(0);
    });
  });

  test('there should be at least one kitchen product', () => {
    const kitchenProducts = products.filter(product => product.keywords.includes('kitchen'));
    expect(kitchenProducts.length).toBeGreaterThan(0);
  });
}); 
