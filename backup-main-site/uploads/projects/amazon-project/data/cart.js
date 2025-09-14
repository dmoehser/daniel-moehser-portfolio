import { products } from "./products.js";
import { deliveryOptions } from "../scripts/deliveryOptions.js";

// Load cart from localStorage or initialize as empty array
export let cart = JSON.parse(localStorage.getItem('cart')) || [];

export function calculateCartQuantity() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function updateCartQuantity() {
  const cartQuantityElement = document.querySelector('.cart-quantity');
  if (cartQuantityElement) { 
    const cartQuantity = calculateCartQuantity();
    cartQuantityElement.innerHTML = cartQuantity === 0 ? '' : cartQuantity;
  }
}

export function addToCart(productId, quantity, deliveryOptionId = '1') {
  let matchingItem;

  cart.forEach((item) => {
    if (productId === item.productId) {
      matchingItem = item;
    }
  });

  const product = products.find(product => product.id === productId);

  if (matchingItem) {
    matchingItem.quantity += quantity;
  } else {
    cart.push({
      productId,
      quantity: quantity,
      deliveryOptionId: deliveryOptionId,
      product: product
    });
  }

  saveCart();
}

export function removeFromCart(productId) {
  const newCart = cart.filter(item => item.productId !== productId);
  cart.length = 0;
  cart.push(...newCart);
  saveCart();
}

export function updateDeliveryOption(productId, deliveryOptionId) {
  const cartItem = cart.find(item => item.productId === productId);
  if (!cartItem) {
    return;
  }
  const validDeliveryOption = deliveryOptions.find(option => option.id === deliveryOptionId);
  if (!validDeliveryOption) {
    return;
  }
  cartItem.deliveryOptionId = deliveryOptionId;
  delete cartItem.deliveryOptionsId;
  saveCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartQuantity();
}

export function loadCart(fun) {
  const xhr = new XMLHttpRequest();

  xhr.addEventListener('load', () => {
    console.log(xhr.response);
    fun();
  });

  xhr.open('GET', 'https://supersimplebackend.dev/cart');
  xhr.send();
}

export async function loadCartFetch() {
  try {
    const response = await fetch('https://supersimplebackend.dev/cart');
    const responseText = await response.text();
    console.log(responseText);
    return responseText;
  } catch (error) {
    console.error('Error loading cart:', error);
    throw error;
  }
}