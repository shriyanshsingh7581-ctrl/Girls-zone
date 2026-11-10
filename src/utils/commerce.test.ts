import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_CATEGORY_NAMES,
  STORE_TEMPLATES,
  THEME_PRESETS,
  appendTrackingStage,
  buildAdminTrackingWhatsAppUrl,
  buildOrderInvoiceWhatsAppUrl,
  calculateDiscountPercent,
  calculateOrderTotals,
  formatDeliveryAddress,
  formatMessageTemplate,
  generateOrderNumber,
  isValidTenDigitPhone,
  normalizePhone,
} from './commerce';
import { Coupon, Order } from '../types';
import { convertRupeesToPaise, RAZORPAY_LIVE_KEY_ID } from '../lib/razorpay';

test('DEFAULT_CATEGORY_NAMES contains strictly the 7 official categories', () => {
  assert.equal(DEFAULT_CATEGORY_NAMES.length, 7);
  assert.deepEqual(DEFAULT_CATEGORY_NAMES, [
    'Cosmetic Products',
    'Beauty Products',
    'Skin Care',
    'Hair Care',
    'Hair Accessories',
    'Anti Tarnish Jewellery',
    'Deo And Perfume',
  ]);
});

test('STORE_TEMPLATES defines 4 distinct templates and THEME_PRESETS defines 6 palettes', () => {
  assert.equal(STORE_TEMPLATES.length, 4);
  assert.deepEqual(
    STORE_TEMPLATES.map((t) => t.id),
    ['prestige', 'nykaa_luxe', 'parisian_atelier', 'royal_bridal']
  );
  assert.equal(THEME_PRESETS.length, 6);
});

test('formatMessageTemplate interpolates dynamic order and customer placeholders', () => {
  const formatted = formatMessageTemplate(
    'Namaste {customerName}, your order {orderId} is now {status}!',
    {
      customerName: 'Priya',
      orderId: 'GZ-10005',
      status: 'Shipped',
    }
  );
  assert.equal(formatted, 'Namaste Priya, your order GZ-10005 is now Shipped!');
});

test('calculateDiscountPercent computes accurate percentage off', () => {
  assert.equal(calculateDiscountPercent(499, 999), 50);
  assert.equal(calculateDiscountPercent(750, 1000), 25);
  assert.equal(calculateDiscountPercent(1000, 1000), 0);
  assert.equal(calculateDiscountPercent(1200, 1000), 0);
});

test('normalizePhone and isValidTenDigitPhone handle Indian phone formats', () => {
  assert.equal(normalizePhone('+91 83297 83642'), '8329783642');
  assert.equal(normalizePhone('09876543210'), '9876543210');
  assert.equal(isValidTenDigitPhone('8329783642'), true);
  assert.equal(isValidTenDigitPhone('12345'), false);
});

test('calculateOrderTotals computes subtotal, coupon discount, and free delivery threshold', () => {
  const items = [
    {
      productId: 'p1',
      name: 'Rose Gold Elixir Serum',
      category: 'Skin Care',
      price: 600,
      mrp: 800,
      image: '/img.jpg',
      quantity: 2,
    },
  ];

  const percentCoupon: Coupon = {
    id: 'c1',
    code: 'LUXE10',
    type: 'PERCENT',
    value: 10,
    minOrderAmount: 1000,
    active: true,
    description: '10% off above ₹1000',
  };

  const result = calculateOrderTotals({
    items,
    coupon: percentCoupon,
    deliveryMode: 'Home Delivery',
    baseDeliveryCharge: 60,
    freeDeliveryThreshold: 999,
  });

  assert.equal(result.subtotal, 1200);
  assert.equal(result.discountAmount, 120);
  assert.equal(result.deliveryCharge, 0);
  assert.equal(result.totalAmount, 1080);
  assert.equal(result.couponApplied, true);
});

test('appendTrackingStage maintains chronological Flipkart tracking steps without duplicates', () => {
  const initial = [
    {
      status: 'Order Placed' as const,
      timestamp: 1000,
      note: 'Order received by Girlz Zone',
    },
  ];

  const afterConfirm = appendTrackingStage({
    currentHistory: initial,
    newStatus: 'Order Confirmed',
    timestamp: 2000,
  });
  assert.equal(afterConfirm.length, 2);
  assert.equal(afterConfirm[1].status, 'Order Confirmed');

  const afterShipped = appendTrackingStage({
    currentHistory: afterConfirm,
    newStatus: 'Shipped',
    timestamp: 3000,
    courierName: 'Delhivery',
    trackingId: 'DLV998877',
  });
  assert.equal(afterShipped.length, 3);
  assert.equal(afterShipped[2].courierName, 'Delhivery');
  assert.equal(afterShipped[2].trackingId, 'DLV998877');
});

test('formatDeliveryAddress and WhatsApp invoice/tracking links format accurately including Razorpay payment ID', () => {
  assert.equal(RAZORPAY_LIVE_KEY_ID, 'rzp_live_ThTjqAzOXvwuwl');
  assert.equal(convertRupeesToPaise(499), 49900);
  assert.equal(convertRupeesToPaise(0), 100);

  const addr = {
    houseFlatNo: 'Flat 402',
    buildingStreet: 'Pearl Residency',
    areaLocality: 'Palegaon',
    landmark: 'Smart Bazaar',
    city: 'Ambernath',
    state: 'Maharashtra',
    pincode: '421501',
  };
  const formatted = formatDeliveryAddress(addr);
  assert.ok(formatted.includes('Flat 402'));
  assert.ok(formatted.includes('421501'));

  const order: Order = {
    id: 'ord_1',
    orderNumber: generateOrderNumber(0),
    customerId: 'u_1',
    customerName: 'Aarohi Sharma',
    customerPhone: '9876543210',
    customerEmail: 'aarohi@example.com',
    deliveryAddress: addr,
    deliveryMode: 'Home Delivery',
    paymentMode: 'Razorpay Online (UPI / Cards / NetBanking)',
    paymentStatus: 'PAID',
    razorpayPaymentId: 'pay_RzpLiveTest99',
    items: [
      {
        productId: 'p1',
        name: 'Velvet Matte Lipstick',
        category: 'Cosmetic Products',
        price: 499,
        mrp: 699,
        image: '/img.jpg',
        quantity: 1,
      },
    ],
    subtotal: 499,
    discountAmount: 0,
    couponCode: '',
    deliveryCharge: 50,
    totalAmount: 549,
    status: 'Shipped',
    courierName: 'BlueDart',
    trackingId: 'BD12345',
    expectedDeliveryDate: '2026-11-12',
    trackingNote: 'Dispatched from Ambernath hub',
    cancelReason: '',
    trackingHistory: [],
    createdAt: 1000,
    updatedAt: 2000,
  };

  const invoiceUrl = buildOrderInvoiceWhatsAppUrl(
    order,
    '918329783642',
    'VIP ORDER {orderId}',
    'Thank you {customerName}!'
  );
  assert.ok(invoiceUrl.startsWith('https://wa.me/918329783642?text='));
  assert.ok(decodeURIComponent(invoiceUrl).includes('VIP ORDER GZ-10001'));
  assert.ok(decodeURIComponent(invoiceUrl).includes('PAID ONLINE'));
  assert.ok(decodeURIComponent(invoiceUrl).includes('pay_RzpLiveTest99'));
  assert.ok(decodeURIComponent(invoiceUrl).includes('Thank you Aarohi Sharma!'));

  const trackingUrl = buildAdminTrackingWhatsAppUrl(
    order,
    'Hi {customerName}, update for {orderId}:',
    'Warm regards, Girlz Zone'
  );
  assert.ok(trackingUrl.startsWith('https://wa.me/919876543210?text='));
  assert.ok(decodeURIComponent(trackingUrl).includes('BD12345'));
  assert.ok(decodeURIComponent(trackingUrl).includes('pay_RzpLiveTest99'));
  assert.ok(decodeURIComponent(trackingUrl).includes('Warm regards, Girlz Zone'));
});
