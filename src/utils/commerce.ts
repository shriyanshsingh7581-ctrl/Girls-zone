import {
  CartItem,
  Coupon,
  DeliveryAddress,
  DeliveryMode,
  FLIPKART_ORDER_STAGES,
  Order,
  OrderStatus,
  Product,
  StoreConfig,
  StoreTemplateId,
  ThemePresetId,
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

export interface StoreTemplateMeta {
  id: StoreTemplateId;
  name: string;
  subtitle: string;
  badge: string;
  desktopFeatures: string;
  mobileFeatures: string;
}

export const STORE_TEMPLATES: StoreTemplateMeta[] = [
  {
    id: 'prestige',
    name: '1. Prestige Editorial Classic',
    subtitle: 'Full-bleed cinematic hero carousel, portrait 4:5 cards & classic boutique story.',
    badge: 'Flagship Luxury',
    desktopFeatures: 'Wide Hero Slider + 7-Category Strip + 4-Col Portrait Grid',
    mobileFeatures: 'Instagram Circular Category Bubbles + Swipe Hero + 2-Col Compact Grid',
  },
  {
    id: 'nykaa_luxe',
    name: '2. Luxe Beauty Bento & Magazine',
    subtitle: 'Asymmetric split-screen magazine hero, visual category cards & full-width bag CTAs.',
    badge: 'Modern Beauty App',
    desktopFeatures: 'Split Editorial Hero + Visual Bento Category Tiles + Full-Button Cards',
    mobileFeatures: 'Interactive Pill Scroller + Magazine Hero Card + 1-Tap Full Bar Add Button',
  },
  {
    id: 'parisian_atelier',
    name: '3. Parisian Haute Atelier',
    subtitle: 'Architectural square gallery frames, centered serif typography & museum lookbook.',
    badge: 'Minimalist Couture',
    desktopFeatures: 'Dual-Frame Lookbook Hero + Square 1:1 Gallery Grid + Centered Editorial',
    mobileFeatures: 'Clean Minimalist Tabs + Framed Lookbook Card + Square Centered Grid',
  },
  {
    id: 'royal_bridal',
    name: '4. Royal Jewellery & Bridal Boutique',
    subtitle: 'Ornate arched portrait frames, champagne gold borders & royal medallion categories.',
    badge: 'Bridal & Jewellery',
    desktopFeatures: 'Arched Royal Showcase Hero + Medallion Categories + Gold-Framed Cards',
    mobileFeatures: 'Arched Category Medallions + Royal Dome Hero + Ornate 2-Col Grid',
  },
];

export interface ThemePresetMeta {
  id: Exclude<ThemePresetId, 'custom'>;
  name: string;
  description: string;
  bgPrimary: string;
  bgSecondary: string;
  textPrimary: string;
  accentPrimary: string;
  accentSecondary: string;
}

export const THEME_PRESETS: ThemePresetMeta[] = [
  {
    id: 'rosegold_pearl',
    name: 'Rose Gold & Soft Pearl (Default)',
    description: 'Warm pearl canvas, blush surfaces, deep velvet text & rose gold accents',
    bgPrimary: '#FFFDFB',
    bgSecondary: '#FDF6F6',
    textPrimary: '#1E1116',
    accentPrimary: '#C89D7C',
    accentSecondary: '#D4AF37',
  },
  {
    id: 'velvet_noir',
    name: 'Champagne Ivory & Espresso Luxe',
    description: 'Alabaster ivory canvas, warm sand cards, rich espresso ink & champagne gold',
    bgPrimary: '#FAF7F2',
    bgSecondary: '#F2ECE1',
    textPrimary: '#181311',
    accentPrimary: '#B8860B',
    accentSecondary: '#D4AF37',
  },
  {
    id: 'emerald_palace',
    name: 'Emerald Royal & Mint Silk',
    description: 'Ivory mint canvas, soft sage surfaces, deep forest emerald & antique gold',
    bgPrimary: '#FBFDFC',
    bgSecondary: '#F1F7F4',
    textPrimary: '#0E231B',
    accentPrimary: '#1B6B4C',
    accentSecondary: '#C59B27',
  },
  {
    id: 'ruby_bridal',
    name: 'Bridal Crimson & Rose Petal',
    description: 'Soft rosewater canvas, petal blush cards, royal burgundy ink & bridal gold',
    bgPrimary: '#FFFBFB',
    bgSecondary: '#FCEFEF',
    textPrimary: '#2B0C13',
    accentPrimary: '#A92643',
    accentSecondary: '#D4AF37',
  },
  {
    id: 'lavender_silk',
    name: 'Lavender Silk & Plum Couture',
    description: 'Cool pearl lilac canvas, lavender mist cards, deep plum text & rose amethyst',
    bgPrimary: '#FDFCFE',
    bgSecondary: '#F6F2FA',
    textPrimary: '#1D1226',
    accentPrimary: '#8E5EA2',
    accentSecondary: '#C89D7C',
  },
  {
    id: 'mocha_atelier',
    name: 'Parisian Mocha & Cashmere',
    description: 'Cashmere cream canvas, latte stone cards, dark cocoa typography & bronze',
    bgPrimary: '#FDFBF9',
    bgSecondary: '#F5EFEA',
    textPrimary: '#231915',
    accentPrimary: '#9C6B4E',
    accentSecondary: '#C99E5A',
  },
];

/**
 * Interpolates `{key}` placeholders in an admin-configured message template.
 */
export function formatMessageTemplate(
  template: string,
  variables: Record<string, string | number | undefined>
): string {
  if (!template) return '';
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => {
    const val = variables[key];
    return val !== undefined && val !== null ? String(val) : '';
  });
}

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
 * Builds a WhatsApp URL for customer product inquiry using the Admin's customizable template.
 */
export function buildProductInquiryWhatsAppUrl(
  product: Product,
  selectedVariant: string | undefined,
  storeConfig?: Partial<StoreConfig>
): string {
  const cleanNumber =
    (storeConfig?.whatsappNumber || OFFICIAL_WHATSAPP_NUMBER).replace(/\D/g, '') ||
    OFFICIAL_WHATSAPP_NUMBER;
  const defaultTemplate =
    'Hello {storeName}! I would like to inquire about *{productName}* (₹{price}){variantText}.';
  const rawTemplate = storeConfig?.whatsappProductInquiryTemplate || defaultTemplate;
  const message = formatMessageTemplate(rawTemplate, {
    storeName: storeConfig?.storeName || 'Girlz Zone',
    productName: product.name,
    price: product.price,
    category: product.category,
    variant: selectedVariant || '',
    variantText: selectedVariant ? ` - Variant: ${selectedVariant}` : '',
  });
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a WhatsApp URL for customer order invoice or admin status notification.
 */
export function buildOrderInvoiceWhatsAppUrl(
  order: Order,
  storeWhatsapp = OFFICIAL_WHATSAPP_NUMBER,
  customHeader?: string,
  customFooter?: string
): string {
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

  const headerLine = formatMessageTemplate(customHeader || '*NEW ORDER — GIRLZ ZONE*', {
    orderId: order.orderNumber,
    customerName: order.customerName,
    total: order.totalAmount,
  });

  const footerLine = customFooter
    ? formatMessageTemplate(customFooter, {
        orderId: order.orderNumber,
        customerName: order.customerName,
        total: order.totalAmount,
      })
    : '';

  const paymentStatusLine =
    order.paymentStatus === 'PAID'
      ? `Payment Status: *PAID ONLINE ✅*${
          order.razorpayPaymentId ? ` (Razorpay ID: ${order.razorpayPaymentId})` : ''
        }`
      : `Payment Status: *${order.paymentStatus || 'Pay on Delivery / Pending'}*`;

  const message = [
    headerLine,
    `Order ID: *${order.orderNumber}*`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.customerPhone}`,
    `Delivery Mode: ${order.deliveryMode}`,
    `Payment Mode: ${order.paymentMode}`,
    paymentStatusLine,
    ``,
    `*Ordered Items:*`,
    itemLines,
    ``,
    `Subtotal: ₹${order.subtotal}`,
    order.discountAmount > 0 ? `Discount (${order.couponCode}): -₹${order.discountAmount}` : '',
    `Delivery: ${order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}`,
    `*Total Amount: ₹${order.totalAmount}*`,
    ``,
    `*Delivery Address:*`,
    addressText,
    footerLine ? `\n${footerLine}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function buildAdminTrackingWhatsAppUrl(
  order: Order,
  customIntro?: string,
  customOutro?: string
): string {
  const customerPhoneClean = normalizePhone(order.customerPhone);
  const waTarget = customerPhoneClean.length === 10 ? `91${customerPhoneClean}` : customerPhoneClean;

  const introLine = formatMessageTemplate(
    customIntro ||
      'Hello *{customerName}*, here is the latest update for your *Girlz Zone* order *{orderId}*:',
    {
      customerName: order.customerName,
      orderId: order.orderNumber,
      status: order.status,
      total: order.totalAmount,
      courier: order.courierName || '',
      trackingId: order.trackingId || '',
    }
  );

  const outroLine = formatMessageTemplate(
    customOutro || 'Thank you for shopping with Girlz Zone, Ambernath!',
    {
      customerName: order.customerName,
      orderId: order.orderNumber,
      status: order.status,
      total: order.totalAmount,
    }
  );

  const paymentSummary =
    order.paymentStatus === 'PAID'
      ? `PAID ONLINE${order.razorpayPaymentId ? ` · ${order.razorpayPaymentId}` : ''}`
      : order.paymentMode;

  const lines = [
    introLine,
    ``,
    `Current Status: *${order.status}*`,
    order.trackingNote ? `Update Note: ${order.trackingNote}` : '',
    order.courierName ? `Courier Partner: ${order.courierName}` : '',
    order.trackingId ? `Tracking ID / AWB: *${order.trackingId}*` : '',
    order.expectedDeliveryDate ? `Expected Delivery: ${order.expectedDeliveryDate}` : '',
    `Order Total: ₹${order.totalAmount} (${paymentSummary})`,
    ``,
    outroLine,
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${waTarget}?text=${encodeURIComponent(lines)}`;
}
