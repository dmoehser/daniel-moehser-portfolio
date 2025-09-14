import { Product, ClothingProduct, Appliance } from './products.js';

describe('Product', () => {
  it('should create a product with correct properties', () => {
    const product = new Product({
      id: '1',
      image: 'img.jpg',
      name: 'Test Product',
      rating: { stars: 5, count: 10 },
      priceCents: 1000,
      keywords: ['test'],
      type: 'test'
    });
    expect(product.name).toBe('Test Product');
    expect(product.priceCents).toBe(1000);
  });
});

describe('ClothingProduct', () => {
  it('should create a clothing product with sizeChartLink', () => {
    const clothing = new ClothingProduct({
      id: '2',
      image: 'img.jpg',
      name: 'Shirt',
      rating: { stars: 4, count: 5 },
      priceCents: 2000,
      keywords: ['shirt'],
      type: 'clothing',
      sizeChartLink: 'size.png'
    });
    expect(clothing.name).toBe('Shirt');
    expect(clothing.sizeChartLink).toBe('size.png');
  });
});

describe('Appliance', () => {
  it('should create an appliance with instructions and warranty links', () => {
    const appliance = new Appliance({
      id: '3',
      image: 'img.jpg',
      name: 'Toaster',
      rating: { stars: 5, count: 100 },
      priceCents: 3000,
      keywords: ['toaster'],
      type: 'appliance',
      instructionsLink: 'instructions.png',
      warrantyLink: 'warranty.png'
    });    
    expect(appliance.name).toBe('Toaster');
    expect(appliance.instructionsLink).toBe('instructions.png');
    expect(appliance.warrantyLink).toBe('warranty.png');
  });
});