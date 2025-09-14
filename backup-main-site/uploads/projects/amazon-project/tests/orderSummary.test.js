// Simple test for loadProducts
import { loadProductsFetch, products } from '../data/products.js';

describe('loadProducts', () => {
  
  beforeAll(async () => {
    await loadProductsFetch();
    console.log('Products loaded!');
  });

  it('should load products from API', () => {
    expect(products.length).toBeGreaterThan(0);
  });

  it('should have products with correct structure', () => {
    const firstProduct = products[0];
    expect(firstProduct.id).toBeDefined();
    expect(firstProduct.name).toBeDefined();
    expect(firstProduct.priceCents).toBeDefined();
  });
}); 
