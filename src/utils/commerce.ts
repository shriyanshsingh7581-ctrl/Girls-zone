import {
  CartItem,
  Coupon,
  DeliveryAddress,
  DeliveryMode,
  FLIPKART_ORDER_STAGES,
  Order,
  OrderStatus,
  TrackingStep,
} from '../types';

export const DEFAULT_CATEGORY_NAMES: string[] = [
  'Cosmetic Products',
  'Beauty Products',
  'Skin Care',
  'Hair Care',
  'Hair Accessories',
  'Anti Tarnish Jewellery',
  'Deo And Perfume',
];

export const OFFICIAL_WHATSAPP_NUMBER = '918329783642';
export const OFFICIAL_STORE_ADDRESS =
  'Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon, Ambernath - 421501, Maharashtra';

/**
 * Calculates integer discount percentage from selling price and original MRP.
 */
export function calculateDiscountPercent(price: number, mrp: number): number {
  if (!mrp || mrp <= 0 || price >= mrp || price < 0) {
    return 0;
  }
  return Math.round(((mrp - price) / mrp) * 100);
}

/**
 * Normalizes a 10-digit Indian phone number (strips spaces, +91, dashes).
 */
export function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits.slice(-10);
}

export function isValidTenDigitPhone(rawPhone: string): boolean {
  const cleaned = normalizePhone(rawPhone);
  return /^\d{10}$/.test(cleaned);
}

/**
 * Computes cart bill summary with coupon discount and delivery charge rules.
 */
export function calculateOrderTotals(params: {
  items: CartItem[];
  coupon?: Coupon | null;
  deliveryMode: DeliveryMode;
  baseDeliveryCharge: number;
  freeDeliveryThreshold: number;
}): {
  subtotal: number;
  mrpTotal: number;
  productSavings: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  couponApplied: boolean;
  couponError?: string;
} {
  const { items, coupon, deliveryMode, baseDeliveryCharge, freeDeliveryThreshold } = params;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const mrpTotal = items.reduce((acc, item) => acc + Math.max(item.mrp, item.price) * item.quantity, 0);
  const productSavings = Math.max(0, mrpTotal - subtotal);

  let discountAmount = 0;
  let couponApplied = false;
  let couponError: string | undefined;

  if (coupon) {
    if (!coupon.active) {
      couponError = 'This promo code is currently inactive.';
    } else if (subtotal < coupon.minOrderAmount) {
      couponError = `Minimum order of ₹${coupon.minOrderAmount} required for ${coupon.code}.`;
    } else {
      couponApplied = true;
      if (coupon.type === 'PERCENT') {
        discountAmount = Math.round((subtotal * coupon.value) / 100);
      } else {
        discountAmount = Math.min(subtotal, Math.round(coupon.value));
      }
    }
  }

  const afterDiscount = Math.max(0, subtotal - discountAmount);

  let deliveryCharge = 0;
  if (subtotal > 0 && deliveryMode === 'Home Delivery') {
    deliveryCharge = afterDiscount >= freeDeliveryThreshold ? 0 : baseDeliveryCharge;
  }

  const totalAmount = afterDiscount + deliveryCharge;

  return {
    subtotal,
    mrpTotal,
    productSavings,
    discountAmount,
    deliveryCharge,
    totalAmount,
    couponApplied,
    couponError,
  };
}

/**
 * Generates a deterministic or sequential Order Number like GZ-10001.
 */
export function generateOrderNumber(existingCount: number, seedSuffix?: number): string {
  const base = 10001 + Math.max(0, existingCount);
  if (seedSuffix !== undefined) {
    return `GZ-${base}-${seedSuffix}`;
  }
  return `GZ-${base}`;
}

/**
 * Formats a complete delivery address into a readable string.
 */
export function formatDeliveryAddress(addr: DeliveryAddress): string {
  const parts = [
    addr.houseFlatNo,
    addr.buildingStreet,
    addr.areaLocality,
    addr.landmark ? `Near ${addr.landmark}` : '',
    addr.city,
    addr.state,
  ]
    .map((s) => (s || '').trim())
    .filter(Boolean);

  const joined = parts.join(', ');
  const pin = (addr.pincode || '').trim();
  return pin ? `${joined} - ${pin}` : joined;
}

/**
 * Advances or updates an order's Flipkart-style tracking timeline.
 */
export function appendTrackingStage(params: {
  currentHistory: TrackingStep[];
  newStatus: OrderStatus;
  timestamp: number;
  note?: string;
  courierName?: string;
  trackingId?: string;
}): TrackingStep[] {
  const { currentHistory, newStatus, timestamp, note, courierName, trackingId } = params;
  const stageMeta = FLIPKART_ORDER_STAGES.find((s) => s.status === newStatus);
  const resolvedNote =
    note && note.trim().length > 0
      ? note.trim()
      : newStatus === 'Cancelled'
      ? 'Order was cancelled'
      : stageMeta?.defaultNote || `Status updated to ${newStatus}`;

  const nextStep: TrackingStep = {
    status: newStatus,
    timestamp,
    note: resolvedNote,
    ...(courierName ? { courierName } : {}),
    ...(trackingId ? { trackingId } : {}),
  };

  const filtered = currentHistory.filter((step) => step.status !== newStatus);
  return [...filtered, nextStep].sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Builds a WhatsApp URL for customer order invoice or admin status notification.
 */
export function buildOrderInvoiceWhatsAppUrl(order: Order, storeWhatsapp = OFFICIAL_WHATSAPP_NUMBER): string {
  const cleanNumber = storeWhatsapp.replace(/\D/g, '') || OFFICIAL_WHATSAPP_NUMBER;
  const itemLines = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.name}${item.selectedVariant ? ` (${item.selectedVariant})` : ''} x${item.quantity} — ₹${
          item.price * item.quantity
        }`
    )
    .join('\n');

  const addressText =
    order.deliveryMode === 'Store Pickup - Girlz Zone Ambernath'
      ? `Store Pickup at Girlz Zone, Ambernath`
      : formatDeliveryAddress(order.deliveryAddress);

  const message = [
    `*NEW ORDER — GIRLZ ZONE*`,
    `Order ID: *${order.orderNumber}*`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Delivery Mode: ${order.deliveryMode}`,
    `Payment Mode: ${order.paymentMode}`,
    ``,
    `*Ordered Items:*`,
    itemLines,
    ``,
    `Subtotal: ₹${order.subtotal}`,
    order.discountAmount > 0 ? `Discount (${order.couponCode}): -₹${order.discountAmount}` : '',
    `Delivery: ${order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}`,
    `*Total Payable: ₹${order.totalAmount}*`,
    ``,
    `*Delivery Address:*`,
    addressText,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function buildAdminTrackingWhatsAppUrl(order: Order): string {
  const customerPhoneClean = normalizePhone(order.customerPhone);
  const waTarget = customerPhoneClean.length === 10 ? `91${customerPhoneClean}` : customerPhoneClean;

  const lines = [
    `Hello *${order.customerName}*,`,
    `Here is the latest update for your *Girlz Zone* order *${order.orderNumber}*:`,
    ``,
    `Current Status: *${order.status}*`,
    order.trackingNote ? `Update Note: ${order.trackingNote}` : '',
    order.courierName ? `Courier Partner: ${order.courierName}` : '',
    order.trackingId ? `Tracking ID / AWB: *${order.trackingId}*` : '',
    order.expectedDeliveryDate ? `Expected Delivery: ${order.expectedDeliveryDate}` : '',
    `Order Total: ₹${order.totalAmount} (${order.paymentMode})`,
    ``,
    `Thank you for shopping with Girlz Zone, Ambernath!`,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${waTarget}?text=${encodeURIComponent(lines)}`;
}
