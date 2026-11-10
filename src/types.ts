export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export const FLIPKART_ORDER_STAGES: {
  status: Exclude<OrderStatus, 'Cancelled'>;
  title: string;
  defaultNote: string;
}[] = [
  {
    status: 'Order Placed',
    title: 'Order Placed',
    defaultNote: 'Order received by Girlz Zone',
  },
  {
    status: 'Order Confirmed',
    title: 'Order Confirmed',
    defaultNote: 'Order verified and confirmed by Girlz Zone team',
  },
  {
    status: 'Packed',
    title: 'Packed',
    defaultNote: 'Items packed & quality checked at Ambernath store',
  },
  {
    status: 'Shipped',
    title: 'Shipped',
    defaultNote: 'Handed over to courier partner',
  },
  {
    status: 'Out for Delivery',
    title: 'Out for Delivery',
    defaultNote: 'Out for delivery in your area',
  },
  {
    status: 'Delivered',
    title: 'Delivered',
    defaultNote: 'Delivered successfully',
  },
];

export type ProductBadge = 'Bestseller' | 'New Arrival' | 'Trending' | 'Anti-Tarnish';

export type StoreTemplateId =
  | 'prestige'
  | 'nykaa_luxe'
  | 'parisian_atelier'
  | 'royal_bridal';

export type ThemePresetId =
  | 'rosegold_pearl'
  | 'velvet_noir'
  | 'emerald_palace'
  | 'ruby_bridal'
  | 'lavender_silk'
  | 'mocha_atelier'
  | 'custom';

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  order: number;
  visible: boolean;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  discountPercent: number;
  inStock: boolean;
  stockQuantity: number;
  images: string[];
  badges: ProductBadge[];
  variants: string[];
  bestseller: boolean;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface DeliveryAddress {
  houseFlatNo: string;
  buildingStreet: string;
  areaLocality: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

export interface CustomerUser {
  uid: string;
  fullName: string;
  phone: string;
  email: string;
  passwordHash?: string;
  address: DeliveryAddress;
  createdAt: number;
  updatedAt: number;
}

export interface PhoneLookupRecord {
  phone: string;
  email: string;
  uid: string;
}

export interface CartItem {
  productId: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  selectedVariant?: string;
}

export interface TrackingStep {
  status: OrderStatus;
  timestamp: number;
  note: string;
  courierName?: string;
  trackingId?: string;
}

export type DeliveryMode = 'Home Delivery' | 'Store Pickup - Girlz Zone Ambernath';
export type PaymentMode =
  | 'Razorpay Online (UPI / Cards / NetBanking)'
  | 'UPI / Online via WhatsApp'
  | 'Cash on Delivery';

export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: DeliveryAddress;
  deliveryMode: DeliveryMode;
  paymentMode: PaymentMode;
  paymentStatus?: PaymentStatus;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  couponCode: string;
  deliveryCharge: number;
  totalAmount: number;
  status: OrderStatus;
  courierName: string;
  trackingId: string;
  expectedDeliveryDate: string;
  trackingNote: string;
  cancelReason: string;
  trackingHistory: TrackingStep[];
  createdAt: number;
  updatedAt: number;
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  offerBadge: string;
  ctaText: string;
  ctaCategory: string;
  image: string;
  order: number;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FLAT';
  value: number;
  minOrderAmount: number;
  active: boolean;
  description: string;
}

export interface StoreConfig {
  storeName: string;
  storeAddress: string;
  whatsappNumber: string;
  announcementText: string;
  flashSaleActive: boolean;
  flashSaleTitle: string;
  deliveryCharge: number;
  freeDeliveryThreshold: number;
  adminId: string;
  adminEmail: string;
  adminPassword: string;

  // Payment Methods Toggle
  razorpayEnabled?: boolean;
  codEnabled?: boolean;

  // 4 Storefront Templates & Global Color Theme Control
  activeTemplate: StoreTemplateId;
  themePreset: ThemePresetId;
  themeBgPrimary: string;
  themeBgSecondary: string;
  themeTextPrimary: string;
  themeAccentPrimary: string;
  themeAccentSecondary: string;

  // Full Storefront & WhatsApp Message Control
  welcomeBannerActive: boolean;
  welcomeBannerText: string;
  catalogSectionKicker: string;
  catalogSectionTitle: string;
  emptyCatalogTitle: string;
  emptyCatalogSubtitle: string;
  boutiqueSectionKicker: string;
  boutiqueSectionTitle: string;
  boutiqueSectionSubtitle: string;
  footerTagline: string;
  orderConfirmationMessage: string;
  whatsappGeneralInquiryMessage: string;
  whatsappProductInquiryTemplate: string;
  whatsappOrderInvoiceHeader: string;
  whatsappOrderInvoiceFooter: string;
  whatsappTrackingUpdateIntro: string;
  whatsappTrackingUpdateOutro: string;
}
