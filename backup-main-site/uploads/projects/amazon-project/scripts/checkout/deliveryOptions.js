import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

export const deliveryOptions = [
  {
    id: '1',
    deliveryDays: 7,
    priceCents: 0
  },
  {
    id: '2',
    deliveryDays: 3,
    priceCents: 499
  },
  {
    id: '3',
    deliveryDays: 1,
    priceCents: 999
  }
];

export function getDeliveryOption(deliveryOptionId) {
  return deliveryOptions.find(option => option.id === deliveryOptionId);
}

export function calculateDeliveryDate(deliveryOptionOrDays) {
  let deliveryDate = dayjs();
  let remainingDays = typeof deliveryOptionOrDays === 'object' 
    ? deliveryOptionOrDays.deliveryDays 
    : deliveryOptionOrDays;
  
  while (remainingDays > 0) {
    deliveryDate = deliveryDate.add(1, 'day');
    
    // Only count weekdays (Monday-Friday) towards delivery days
    if (deliveryDate.day() !== 0 && deliveryDate.day() !== 6) {
      remainingDays--;
    }
  }
  
  return deliveryDate;
}

function isWeekend(date) {
  const dayOfWeek = date.format('dddd');
  return dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
} 