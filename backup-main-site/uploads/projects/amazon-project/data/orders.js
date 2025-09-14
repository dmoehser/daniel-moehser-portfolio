// Load orders from localStorage or create test orders if none exist
let orders = JSON.parse(localStorage.getItem('orders')) || [];

// Create test orders if no orders exist
if (orders.length === 0) {
  const testOrders = [
    {
      orderId: '1704067200000',
      items: [
        {
          productId: 'e43638ce-6aa0-4b85-b27f-e1d07ebcfc6f',
          quantity: 1,
          deliveryOptionId: '1'
        }
      ],
      total: 1090,
      date: '2024-01-01T10:00:00.000Z' // 10 Tage alt
    },
    {
      orderId: '1704153600000',
      items: [
        {
          productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d',
          quantity: 2,
          deliveryOptionId: '2'
        }
      ],
      total: 1798,
      date: '2024-01-02T14:30:00.000Z' // 9 Tage alt
    },
    {
      orderId: '1704240000000',
      items: [
        {
          productId: '3fdfe8d6-9a15-4b9b-9f2a-4f82a4280e33',
          quantity: 1,
          deliveryOptionId: '1'
        }
      ],
      total: 990,
      date: '2024-01-03T09:15:00.000Z' // 8 Tage alt
    },
    {
      orderId: '1704326400000',
      items: [
        {
          productId: 'e43638ce-6aa0-4b85-b27f-e1d07ebcfc6f',
          quantity: 3,
          deliveryOptionId: '3'
        }
      ],
      total: 3270,
      date: '2024-01-04T16:45:00.000Z' // 7 Tage alt
    },
    {
      orderId: '1704412800000',
      items: [
        {
          productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d',
          quantity: 1,
          deliveryOptionId: '1'
        }
      ],
      total: 899,
      date: '2024-01-05T11:20:00.000Z' // 6 Tage alt
    },
    {
      orderId: '1704499200000',
      items: [
        {
          productId: '3fdfe8d6-9a15-4b9b-9f2a-4f82a4280e33',
          quantity: 2,
          deliveryOptionId: '2'
        }
      ],
      total: 1980,
      date: '2024-01-06T13:10:00.000Z' // 5 Tage alt
    },
    {
      orderId: '1704585600000',
      items: [
        {
          productId: 'e43638ce-6aa0-4b85-b27f-e1d07ebcfc6f',
          quantity: 1,
          deliveryOptionId: '1'
        }
      ],
      total: 1090,
      date: '2024-01-07T08:30:00.000Z' // 4 Tage alt
    },
    {
      orderId: '1704672000000',
      items: [
        {
          productId: '15b6fc6f-327a-4ec4-896f-486349e85a3d',
          quantity: 1,
          deliveryOptionId: '2'
        }
      ],
      total: 899,
      date: '2024-01-08T15:45:00.000Z' // 3 Tage alt
    },
    {
      orderId: '1704758400000',
      items: [
        {
          productId: '3fdfe8d6-9a15-4b9b-9f2a-4f82a4280e33',
          quantity: 1,
          deliveryOptionId: '3'
        }
      ],
      total: 990,
      date: '2024-01-09T12:00:00.000Z' // 2 Tage alt
    },
    {
      orderId: '1704844800000',
      items: [
        {
          productId: 'e43638ce-6aa0-4b85-b27f-e1d07ebcfc6f',
          quantity: 2,
          deliveryOptionId: '1'
        }
      ],
      total: 2180,
      date: '2024-01-10T10:30:00.000Z' // 1 Tag alt
    }
  ];
  
  orders = testOrders;
  localStorage.setItem('orders', JSON.stringify(orders));
}

export { orders };

export function addOrder(order) {
  orders.unshift(order);
  saveToStorage();
}

function saveToStorage() {
  localStorage.setItem('orders', JSON.stringify(orders));
} 