import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  CartItem,
  Category,
  Coupon,
  CustomerUser,
  DeliveryAddress,
  DeliveryMode,
  HeroBanner,
  Order,
  OrderStatus,
  PaymentMode,
  Product,
  StoreConfig,
} from '../types';
import {
  DEFAULT_CATEGORY_NAMES,
  OFFICIAL_STORE_ADDRESS,
  OFFICIAL_WHATSAPP_NUMBER,
  appendTrackingStage,
  calculateDiscountPercent,
  generateOrderNumber,
  normalizePhone,
} from '../utils/commerce';
import {
  auth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  db,
  firebaseSignOut,
  getOnce,
  onValue,
  ref,
  remove,
  set,
  signInWithEmailAndPassword,
  update,
} from '../lib/firebase';
import {
  BUNDLED_IMAGES,
  CATEGORY_FALLBACK_IMAGES,
  resolveImageUrl,
} from '../utils/images';

const DEFAULT_HERO_BANNERS: HeroBanner[] = [
  {
    id: 'banner_cosmetics',
    title: 'Velvet Rose & Luminous Skin Rituals',
    subtitle:
      'Curated luxury cosmetics, hydrating serums, and signature beauty essentials at Girlz Zone, Ambernath.',
    offerBadge: 'NEW PRESTIGE COLLECTION',
    ctaText: 'Explore Cosmetics',
    ctaCategory: 'Cosmetic Products',
    image: BUNDLED_IMAGES.cosmetics,
    order: 1,
    active: true,
  },
  {
    id: 'banner_jewellery',
    title: '18K Gold-Tone Anti-Tarnish Fine Jewellery',
    subtitle:
      'Waterproof, sweat-resistant everyday necklaces, sculpted hoops, and rings crafted for timeless radiance.',
    offerBadge: 'ANTI-TARNISH EDITION',
    ctaText: 'Shop Jewellery',
    ctaCategory: 'Anti Tarnish Jewellery',
    image: BUNDLED_IMAGES.jewellery,
    order: 2,
    active: true,
  },
  {
    id: 'banner_fragrance',
    title: 'Signature Eau De Parfum & Luxe Mists',
    subtitle:
      'Long-lasting floral, amber, and oud compositions curated for unforgettable elegance.',
    offerBadge: 'LUXURY FRAGRANCES',
    ctaText: 'Discover Perfumes',
    ctaCategory: 'Deo And Perfume',
    image: BUNDLED_IMAGES.fragrance,
    order: 3,
    active: true,
  },
];

const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: 'Girlz Zone',
  storeAddress: OFFICIAL_STORE_ADDRESS,
  whatsappNumber: OFFICIAL_WHATSAPP_NUMBER,
  announcementText:
    'Welcome to Girlz Zone Ambernath · 100% Authentic Cosmetics, Skincare & Anti-Tarnish Jewellery · Free Delivery on Orders Above ₹999 · WhatsApp Support: +91 8329783642',
  flashSaleActive: false,
  flashSaleTitle: 'Festive Glow Privilege — Limited Edition Luxury Picks',
  deliveryCharge: 50,
  freeDeliveryThreshold: 999,
  adminId: 'admin@girlzzone.com',
  adminEmail: 'admin@girlzzone.com',
  adminPassword: 'GirlzZone@123',

  // Active Storefront Template & Theme Customization
  activeTemplate: 'prestige',
  themePreset: 'rosegold_pearl',
  themeBgPrimary: '#FFFDFB',
  themeBgSecondary: '#FDF6F6',
  themeTextPrimary: '#1E1116',
  themeAccentPrimary: '#C89D7C',
  themeAccentSecondary: '#D4AF37',

  // Full Message & Copy Control Center
  welcomeBannerActive: false,
  welcomeBannerText:
    'Special Boutique Privilege: Visit Girlz Zone at Palegaon, Ambernath or order online for express doorstep delivery!',
  catalogSectionKicker: 'Girlz Zone Flagship Catalog',
  catalogSectionTitle: 'Curated Luxury Collections',
  emptyCatalogTitle: 'New Collection Launching Soon — Stay Tuned!',
  emptyCatalogSubtitle:
    'We are curating our latest arrivals across Cosmetics, Beauty Products, Skin Care, Hair Care, Hair Accessories, Anti Tarnish Jewellery, and Fine Perfumes.',
  boutiqueSectionKicker: 'Ambernath Flagship Experience',
  boutiqueSectionTitle: 'Visit Girlz Zone at Palegaon, Ambernath',
  boutiqueSectionSubtitle:
    'Experience our luxury range in person or order online with instant WhatsApp invoice confirmation and live Flipkart-style order tracking right to your doorstep.',
  footerTagline:
    'Your premier destination in Ambernath for luxury cosmetics, beauty essentials, skin care, hair accessories, 18K anti-tarnish jewellery, and fine perfumes.',
  orderConfirmationMessage:
    'Your order has been registered in real time. You can send the formatted invoice to Girlz Zone on WhatsApp or track your live delivery status below.',
  whatsappGeneralInquiryMessage:
    'Hello Girlz Zone! Please notify me about your new collection launch.',
  whatsappProductInquiryTemplate:
    'Hello Girlz Zone! I would like to inquire about *{productName}* (₹{price}) in {category}.',
  whatsappOrderInvoiceHeader:
    'Hello *Girlz Zone*! I have placed a new order on your website.',
  whatsappOrderInvoiceFooter: 'Please confirm my order. Thank you!',
  whatsappTrackingUpdateIntro:
    'Hello *{customerName}*, here is the live update for your *Girlz Zone* order *{orderId}*:',
  whatsappTrackingUpdateOutro: 'Thank you for shopping with Girlz Zone, Ambernath!',
};

const CATEGORY_COVER_IMAGES: Record<string, string> = CATEGORY_FALLBACK_IMAGES;

const INITIAL_DEFAULT_CATEGORIES: Category[] = DEFAULT_CATEGORY_NAMES.map((name, idx) => {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id: `cat_${idx + 1}_${slug}`,
    name,
    slug,
    image: CATEGORY_COVER_IMAGES[name] || DEFAULT_HERO_BANNERS[0].image,
    order: idx + 1,
    visible: true,
    createdAt: 1700000000000 + idx,
  };
});

function simpleHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return `gzh_${(hash >>> 0).toString(16)}`;
}

interface StoreContextType {
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: CustomerUser[];
  banners: HeroBanner[];
  coupons: Coupon[];
  storeConfig: StoreConfig;
  loading: boolean;

  // Cart & Wishlist
  cart: CartItem[];
  wishlist: string[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number, selectedVariant?: string) => void;
  updateCartQuantity: (productId: string, selectedVariant: string | undefined, quantity: number) => void;
  removeFromCart: (productId: string, selectedVariant?: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;

  // Promo Code Quick Selection from Storefront
  selectedPromoCode: string;
  setSelectedPromoCode: (code: string) => void;

  // Customer Auth (Email/Phone + Password, Google Login, and Passwordless Quick Login)
  currentCustomer: CustomerUser | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  registerCustomer: (params: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    address: DeliveryAddress;
  }) => Promise<CustomerUser>;
  loginCustomer: (identifier: string, password: string) => Promise<CustomerUser>;
  loginWithGoogle: () => Promise<CustomerUser>;
  loginWithoutPassword: (params: {
    phone: string;
    fullName?: string;
    address?: DeliveryAddress;
  }) => Promise<CustomerUser>;
  logoutCustomer: () => Promise<void>;
  updateCustomerProfile: (updated: { fullName: string; phone: string; address: DeliveryAddress }) => Promise<void>;

  // Order Placement & Tracking
  placeOrder: (params: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: DeliveryAddress;
    deliveryMode: DeliveryMode;
    paymentMode: PaymentMode;
    couponCode?: string;
    subtotal: number;
    discountAmount: number;
    deliveryCharge: number;
    totalAmount: number;
  }) => Promise<Order>;

  // Admin Operations
  isAdminAuthenticated: boolean;
  loginAdmin: (idOrEmail: string, password: string) => boolean;
  loginAdminWithGoogle: () => Promise<boolean>;
  logoutAdmin: () => void;
  saveProduct: (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'discountPercent'>, existingId?: string) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleProductStock: (product: Product) => Promise<void>;
  toggleProductBestseller: (product: Product) => Promise<void>;
  updateOrderStatus: (params: {
    order: Order;
    newStatus: OrderStatus;
    courierName?: string;
    trackingId?: string;
    expectedDeliveryDate?: string;
    trackingNote?: string;
    cancelReason?: string;
  }) => Promise<void>;
  saveCategory: (catData: { name: string; image: string; visible: boolean; order: number }, existingId?: string) => Promise<Category>;
  deleteCategory: (categoryId: string) => Promise<void>;
  reorderCategory: (categoryId: string, direction: 'UP' | 'DOWN') => Promise<void>;
  restoreDefaultCategories: () => Promise<void>;
  saveBanner: (bannerData: Omit<HeroBanner, 'id'>, existingId?: string) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;
  saveCoupon: (couponData: Omit<Coupon, 'id'>, existingId?: string) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  updateStoreConfig: (newConfig: Partial<StoreConfig>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_DEFAULT_CATEGORIES);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerUser[]>([]);
  const [banners, setBanners] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gz_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState('');

  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('gz_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('gz_admin_auth') === 'true';
  });

  // Sync Cart & Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gz_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage error
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('gz_wishlist', JSON.stringify(wishlist));
    } catch {
      // Ignore storage error
    }
  }, [wishlist]);

  // Apply Global Storefront Color Theme to CSS Custom Properties
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--gz-bg', storeConfig.themeBgPrimary || '#FFFDFB');
    root.style.setProperty('--gz-surface', storeConfig.themeBgSecondary || '#FDF6F6');
    root.style.setProperty('--gz-text', storeConfig.themeTextPrimary || '#1E1116');
    root.style.setProperty('--gz-accent', storeConfig.themeAccentPrimary || '#C89D7C');
    root.style.setProperty('--gz-gold', storeConfig.themeAccentSecondary || '#D4AF37');
  }, [
    storeConfig.themeBgPrimary,
    storeConfig.themeBgSecondary,
    storeConfig.themeTextPrimary,
    storeConfig.themeAccentPrimary,
    storeConfig.themeAccentSecondary,
  ]);

  // Real-time Firebase Subscriptions (Strict 0 Products / 0 Orders / ₹0 Revenue rule)
  useEffect(() => {
    let categoriesInitialized = false;
    let bannersInitialized = false;
    let configInitialized = false;

    const unsubCategories = onValue(ref(db, 'categories'), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = (Object.values(data) as Category[])
          .map((cat) => ({
            ...cat,
            image: resolveImageUrl(cat.image, cat.name),
          }))
          .sort((a, b) => a.order - b.order);
        setCategories(list);
      } else if (!categoriesInitialized) {
        categoriesInitialized = true;
        // Initialize ONLY the 7 official categories if empty
        const initialCats: Category[] = DEFAULT_CATEGORY_NAMES.map((name, idx) => {
          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          return {
            id: `cat_${idx + 1}_${slug}`,
            name,
            slug,
            image: CATEGORY_COVER_IMAGES[name] || DEFAULT_HERO_BANNERS[0].image,
            order: idx + 1,
            visible: true,
            createdAt: Date.now(),
          };
        });
        setCategories(initialCats);
        for (const cat of initialCats) {
          await set(ref(db, `categories/${cat.id}`), cat);
        }
      }
      setLoading(false);
    });

    const unsubProducts = onValue(ref(db, 'products'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = (Object.values(data) as any[])
          .map((prod): Product => {
            const rawImages: string[] = Array.isArray(prod.images)
              ? prod.images
              : typeof prod.image === 'string' && prod.image.trim()
              ? [prod.image]
              : [];
            const resolvedImages =
              rawImages.length > 0
                ? rawImages.map((img) => resolveImageUrl(img, prod.category))
                : [resolveImageUrl(undefined, prod.category)];
            return {
              ...prod,
              images: resolvedImages,
            };
          })
          .sort((a, b) => b.createdAt - a.createdAt);
        setProducts(list);
      } else {
        // STRICT ZERO DEMO DATA: 0 products initially
        setProducts([]);
      }
    });

    const unsubOrders = onValue(ref(db, 'orders'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = (Object.values(data) as Order[])
          .map((ord) => ({
            ...ord,
            items: (ord.items || []).map((item) => ({
              ...item,
              image: resolveImageUrl(item.image, item.category),
            })),
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
        setOrders(list);
      } else {
        // STRICT ZERO DEMO DATA: 0 orders initially
        setOrders([]);
      }
    });

    const unsubUsers = onValue(ref(db, 'users'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = (Object.values(data) as CustomerUser[]).sort((a, b) => b.createdAt - a.createdAt);
        setCustomers(list);
        // Keep currentCustomer in sync if logged in
        setCurrentCustomer((prev) => {
          if (!prev) return null;
          const updated = data[prev.uid];
          if (updated) {
            localStorage.setItem('gz_customer', JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
      } else {
        setCustomers([]);
      }
    });

    const unsubBanners = onValue(ref(db, 'banners'), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = (Object.values(data) as HeroBanner[])
          .map((b) => ({
            ...b,
            image: resolveImageUrl(b.image, b.ctaCategory),
          }))
          .sort((a, b) => a.order - b.order);
        setBanners(list);
      } else if (!bannersInitialized) {
        bannersInitialized = true;
        setBanners(DEFAULT_HERO_BANNERS);
        for (const b of DEFAULT_HERO_BANNERS) {
          await set(ref(db, `banners/${b.id}`), b);
        }
      }
    });

    const unsubCoupons = onValue(ref(db, 'coupons'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.values(data) as Coupon[];
        setCoupons(list);
      } else {
        setCoupons([]);
      }
    });

    const unsubConfig = onValue(ref(db, 'storeConfig/main'), async (snapshot) => {
      if (snapshot.exists()) {
        setStoreConfig({ ...DEFAULT_STORE_CONFIG, ...snapshot.val() });
      } else if (!configInitialized) {
        configInitialized = true;
        await set(ref(db, 'storeConfig/main'), DEFAULT_STORE_CONFIG);
      }
    });

    return () => {
      unsubCategories();
      unsubProducts();
      unsubOrders();
      unsubUsers();
      unsubBanners();
      unsubCoupons();
      unsubConfig();
    };
  }, []);

  // Cart Actions
  const addToCart = (product: Product, quantity = 1, selectedVariant?: string) => {
    const variant = selectedVariant || (product.variants?.length > 0 ? product.variants[0] : undefined);
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.selectedVariant === variant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          mrp: product.mrp,
          image: resolveImageUrl(product.images?.[0], product.category),
          quantity,
          selectedVariant: variant,
        },
      ];
    });
  };

  const updateCartQuantity = (productId: string, selectedVariant: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariant);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId && item.selectedVariant === selectedVariant
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, selectedVariant?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.selectedVariant === selectedVariant)
      )
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Customer Authentication (Dual Login: Email + Password OR 10-Digit Phone + Password)
  const registerCustomer = async (params: {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    address: DeliveryAddress;
  }): Promise<CustomerUser> => {
    const cleanPhone = normalizePhone(params.phone);
    const cleanEmail = params.email.trim().toLowerCase();

    if (cleanPhone.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    // Check if phone already registered in /phoneLookup/{phone}
    const existingPhoneLookup = await getOnce(ref(db, `phoneLookup/${cleanPhone}`));
    if (existingPhoneLookup.exists()) {
      throw new Error('This 10-digit mobile number is already registered. Please log in instead.');
    }

    let uid = `usr_${cleanPhone}_${Date.now()}`;
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
      uid = cred.user.uid;
    } catch {
      // Fallback to direct database user creation if email/password provider is not enabled in console
    }

    const now = Date.now();
    const userRecord: CustomerUser = {
      uid,
      fullName: params.fullName.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      passwordHash: simpleHash(params.password),
      address: params.address,
      createdAt: now,
      updatedAt: now,
    };

    await set(ref(db, `users/${uid}`), userRecord);
    await set(ref(db, `phoneLookup/${cleanPhone}`), {
      phone: cleanPhone,
      email: cleanEmail,
      uid,
    });

    setCurrentCustomer(userRecord);
    localStorage.setItem('gz_customer', JSON.stringify(userRecord));
    return userRecord;
  };

  const loginCustomer = async (identifier: string, password: string): Promise<CustomerUser> => {
    const raw = identifier.trim();
    let targetEmail = raw.toLowerCase();
    let resolvedUid: string | undefined;

    // Check if identifier is a 10-digit phone number
    const maybePhone = normalizePhone(raw);
    if (/^\d{10}$/.test(maybePhone) && !raw.includes('@')) {
      const lookupSnap = await getOnce(ref(db, `phoneLookup/${maybePhone}`));
      if (!lookupSnap.exists()) {
        throw new Error('No account found with this 10-digit mobile number. Please sign up first.');
      }
      const lookupData = lookupSnap.val();
      targetEmail = lookupData.email;
      resolvedUid = lookupData.uid;
    }

    // Try Firebase Auth signInWithEmailAndPassword first
    try {
      const cred = await signInWithEmailAndPassword(auth, targetEmail, password);
      resolvedUid = cred.user.uid;
    } catch {
      // Verify against stored /users collection passwordHash
    }

    const expectedHash = simpleHash(password);
    let matchedUser: CustomerUser | null = null;

    if (resolvedUid) {
      const userSnap = await getOnce(ref(db, `users/${resolvedUid}`));
      if (userSnap.exists()) {
        const candidate = userSnap.val() as CustomerUser;
        if (!candidate.passwordHash || candidate.passwordHash === expectedHash) {
          matchedUser = candidate;
        }
      }
    }

    if (!matchedUser) {
      const found = customers.find(
        (u) =>
          (u.email.toLowerCase() === targetEmail || u.phone === maybePhone) &&
          (!u.passwordHash || u.passwordHash === expectedHash)
      );
      if (found) {
        matchedUser = found;
      }
    }

    if (!matchedUser) {
      throw new Error('Invalid credentials. Please check your Email / 10-Digit Mobile Number and Password.');
    }

    setCurrentCustomer(matchedUser);
    localStorage.setItem('gz_customer', JSON.stringify(matchedUser));
    return matchedUser;
  };

  // 1-Click Gmail / Google Sign-In
  const loginWithGoogle = async (): Promise<CustomerUser> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const gUser = cred.user;
    const cleanEmail = (gUser.email || `${gUser.uid}@gmail.com`).trim().toLowerCase().slice(0, 180);
    const cleanName = (
      gUser.displayName ||
      cleanEmail.split('@')[0] ||
      'Girlz Zone Customer'
    )
      .trim()
      .slice(0, 120);
    const cleanPhone = normalizePhone(gUser.phoneNumber || '').slice(0, 10);
    const safeUid = gUser.uid.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);

    // Check if user record already exists by UID or email
    const existingSnap = await getOnce(ref(db, `users/${safeUid}`));
    if (existingSnap.exists()) {
      const existingData = existingSnap.val() as CustomerUser;
      setCurrentCustomer(existingData);
      localStorage.setItem('gz_customer', JSON.stringify(existingData));
      return existingData;
    }

    const existingByEmail = customers.find(
      (c) => c.email && c.email.toLowerCase() === cleanEmail
    );
    if (existingByEmail) {
      setCurrentCustomer(existingByEmail);
      localStorage.setItem('gz_customer', JSON.stringify(existingByEmail));
      return existingByEmail;
    }

    const now = Date.now();
    const newRecord: CustomerUser = {
      uid: safeUid,
      fullName: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      address: {
        houseFlatNo: '',
        buildingStreet: '',
        areaLocality: '',
        landmark: '',
        city: 'Ambernath',
        state: 'Maharashtra',
        pincode: '421501',
      },
      createdAt: now,
      updatedAt: now,
    };

    await set(ref(db, `users/${safeUid}`), newRecord);
    if (cleanPhone.length === 10) {
      await set(ref(db, `phoneLookup/${cleanPhone}`), {
        phone: cleanPhone,
        email: cleanEmail,
        uid: safeUid,
      });
    }

    setCurrentCustomer(newRecord);
    localStorage.setItem('gz_customer', JSON.stringify(newRecord));
    return newRecord;
  };

  // Instant Passwordless Login (Without ID / Password — 10-Digit Mobile + Name)
  const loginWithoutPassword = async (params: {
    phone: string;
    fullName?: string;
    address?: DeliveryAddress;
  }): Promise<CustomerUser> => {
    const cleanPhone = normalizePhone(params.phone);
    if (cleanPhone.length !== 10) {
      throw new Error('Please enter a valid 10-Digit Mobile Number.');
    }

    // 1. Check if customer already exists in /phoneLookup or customers list
    const lookupSnap = await getOnce(ref(db, `phoneLookup/${cleanPhone}`));
    if (lookupSnap.exists()) {
      const lookup = lookupSnap.val();
      if (lookup?.uid) {
        const userSnap = await getOnce(ref(db, `users/${lookup.uid}`));
        if (userSnap.exists()) {
          const existingUser = userSnap.val() as CustomerUser;
          const updatedName = params.fullName?.trim() || existingUser.fullName;
          const updatedUser: CustomerUser = {
            ...existingUser,
            fullName: updatedName,
            address: params.address || existingUser.address,
            updatedAt: Date.now(),
          };
          await set(ref(db, `users/${existingUser.uid}`), updatedUser);
          setCurrentCustomer(updatedUser);
          localStorage.setItem('gz_customer', JSON.stringify(updatedUser));
          return updatedUser;
        }
      }
    }

    const foundInMemory = customers.find((u) => u.phone === cleanPhone);
    if (foundInMemory) {
      const updatedUser: CustomerUser = {
        ...foundInMemory,
        fullName: params.fullName?.trim() || foundInMemory.fullName,
        address: params.address || foundInMemory.address,
        updatedAt: Date.now(),
      };
      await set(ref(db, `users/${foundInMemory.uid}`), updatedUser);
      setCurrentCustomer(updatedUser);
      localStorage.setItem('gz_customer', JSON.stringify(updatedUser));
      return updatedUser;
    }

    // 2. Check if customer placed a past order with this phone number to auto-fill their details
    const pastOrder = orders.find((o) => o.customerPhone === cleanPhone);
    const now = Date.now();
    const uid = `usr_quick_${cleanPhone}`;
    const finalName = (
      params.fullName?.trim() ||
      pastOrder?.customerName ||
      `Customer ${cleanPhone.slice(-4)}`
    ).slice(0, 120);
    const finalEmail = (
      pastOrder?.customerEmail || `${cleanPhone}@girlzzone.customer`
    )
      .toLowerCase()
      .slice(0, 180);
    const finalAddress: DeliveryAddress = params.address ||
      pastOrder?.deliveryAddress || {
        houseFlatNo: '',
        buildingStreet: '',
        areaLocality: '',
        landmark: '',
        city: 'Ambernath',
        state: 'Maharashtra',
        pincode: '421501',
      };

    const quickUser: CustomerUser = {
      uid,
      fullName: finalName,
      phone: cleanPhone,
      email: finalEmail,
      address: finalAddress,
      createdAt: now,
      updatedAt: now,
    };

    await set(ref(db, `users/${uid}`), quickUser);
    await set(ref(db, `phoneLookup/${cleanPhone}`), {
      phone: cleanPhone,
      email: finalEmail,
      uid,
    });

    setCurrentCustomer(quickUser);
    localStorage.setItem('gz_customer', JSON.stringify(quickUser));
    return quickUser;
  };

  const logoutCustomer = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore
    }
    setCurrentCustomer(null);
    localStorage.removeItem('gz_customer');
  };

  const updateCustomerProfile = async (updated: {
    fullName: string;
    phone: string;
    address: DeliveryAddress;
  }) => {
    if (!currentCustomer) return;
    const cleanPhone = normalizePhone(updated.phone);
    const updatedUser: CustomerUser = {
      ...currentCustomer,
      fullName: updated.fullName.trim(),
      phone: cleanPhone,
      address: updated.address,
      updatedAt: Date.now(),
    };
    await set(ref(db, `users/${currentCustomer.uid}`), updatedUser);
    await set(ref(db, `phoneLookup/${cleanPhone}`), {
      phone: cleanPhone,
      email: currentCustomer.email,
      uid: currentCustomer.uid,
    });
    setCurrentCustomer(updatedUser);
    localStorage.setItem('gz_customer', JSON.stringify(updatedUser));
  };

  // Order Placement
  const placeOrder = async (params: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: DeliveryAddress;
    deliveryMode: DeliveryMode;
    paymentMode: PaymentMode;
    couponCode?: string;
    subtotal: number;
    discountAmount: number;
    deliveryCharge: number;
    totalAmount: number;
  }): Promise<Order> => {
    const now = Date.now();
    const maxExistingSeq = orders.reduce((max, o) => {
      const m = (o.orderNumber || '').match(/GZ-(\d+)/i);
      const parsed = m ? parseInt(m[1], 10) - 10000 : 0;
      return Math.max(max, Number.isFinite(parsed) ? parsed : 0);
    }, orders.length);
    const orderNumber = generateOrderNumber(maxExistingSeq);
    const orderId = `ord_${now}_${orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`;
    const cleanPhone = normalizePhone(params.customerPhone);

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: currentCustomer?.uid || `guest_${cleanPhone}`,
      customerName: params.customerName.trim().slice(0, 140),
      customerPhone: cleanPhone.slice(0, 15),
      customerEmail: params.customerEmail.trim().slice(0, 180),
      deliveryAddress: params.deliveryAddress,
      deliveryMode: params.deliveryMode,
      paymentMode: params.paymentMode,
      items: [...cart],
      subtotal: Math.max(0, Number(params.subtotal) || 0),
      discountAmount: Math.max(0, Number(params.discountAmount) || 0),
      couponCode: params.couponCode || '',
      deliveryCharge: Math.max(0, Number(params.deliveryCharge) || 0),
      totalAmount: Math.max(0, Number(params.totalAmount) || 0),
      status: 'Order Placed',
      courierName: '',
      trackingId: '',
      expectedDeliveryDate: '',
      trackingNote: 'Order received by Girlz Zone',
      cancelReason: '',
      trackingHistory: [
        {
          status: 'Order Placed',
          timestamp: now,
          note: 'Order received by Girlz Zone',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    await set(ref(db, `orders/${orderId}`), newOrder);

    // Decrement stock quantities for ordered items
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        const nextQty = Math.max(0, (prod.stockQuantity || 0) - item.quantity);
        await update(ref(db, `products/${prod.id}`), {
          stockQuantity: nextQty,
          inStock: nextQty > 0,
          updatedAt: now,
        });
      }
    }

    clearCart();
    return newOrder;
  };

  // Admin Operations
  const loginAdmin = (idOrEmail: string, password: string): boolean => {
    const cleanInput = (idOrEmail || '').trim().toLowerCase();
    const expectedPass = storeConfig.adminPassword || 'GirlzZone@123';
    const validIds = [
      (storeConfig.adminId || 'admin@girlzzone.com').toLowerCase(),
      (storeConfig.adminEmail || 'admin@girlzzone.com').toLowerCase(),
      'admin@girlzzone.com',
      'admin',
    ];
    if (
      validIds.includes(cleanInput) &&
      (password === expectedPass || password.trim() === expectedPass)
    ) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('gz_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const loginAdminWithGoogle = async (): Promise<boolean> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    if (cred.user) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('gz_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('gz_admin_auth');
  };

  const saveProduct = async (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'discountPercent'>,
    existingId?: string
  ) => {
    const now = Date.now();
    const id = existingId || `prod_${now}`;
    const existing = products.find((p) => p.id === existingId);
    const safePrice = Math.max(0, Number(productData.price) || 0);
    const safeMrp = Math.max(safePrice, Number(productData.mrp) || safePrice);
    const discountPercent = calculateDiscountPercent(safePrice, safeMrp);
    const safeCategory = (productData.category || 'Cosmetic Products').trim().slice(0, 115);
    const safeName = (productData.name || 'Luxury Product').trim().slice(0, 190);
    const safeImages = (productData.images || [])
      .map((img) => resolveImageUrl(img, safeCategory))
      .filter(Boolean)
      .slice(0, 6);

    const record: Product = {
      ...productData,
      id,
      name: safeName,
      category: safeCategory,
      price: safePrice,
      mrp: safeMrp,
      images: safeImages.length > 0 ? safeImages : [resolveImageUrl(undefined, safeCategory)],
      discountPercent,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    // Optimistic local state update for instant catalog & storefront reflection
    setProducts((prev) => {
      const without = prev.filter((p) => p.id !== id);
      return [record, ...without].sort((a, b) => b.createdAt - a.createdAt);
    });

    await set(ref(db, `products/${id}`), record);
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    await remove(ref(db, `products/${productId}`));
  };

  const toggleProductStock = async (product: Product) => {
    const nextInStock = !product.inStock;
    await update(ref(db, `products/${product.id}`), {
      inStock: nextInStock,
      stockQuantity: nextInStock ? Math.max(1, product.stockQuantity) : 0,
      updatedAt: Date.now(),
    });
  };

  const toggleProductBestseller = async (product: Product) => {
    const nextBestseller = !product.bestseller;
    const nextBadges = nextBestseller
      ? Array.from(new Set([...(product.badges || []), 'Bestseller' as const]))
      : (product.badges || []).filter((b) => b !== 'Bestseller');
    await update(ref(db, `products/${product.id}`), {
      bestseller: nextBestseller,
      badges: nextBadges,
      updatedAt: Date.now(),
    });
  };

  const updateOrderStatus = async (params: {
    order: Order;
    newStatus: OrderStatus;
    courierName?: string;
    trackingId?: string;
    expectedDeliveryDate?: string;
    trackingNote?: string;
    cancelReason?: string;
  }) => {
    const {
      order,
      newStatus,
      courierName,
      trackingId,
      expectedDeliveryDate,
      trackingNote,
      cancelReason,
    } = params;
    const now = Date.now();
    const nextHistory = appendTrackingStage({
      currentHistory: order.trackingHistory || [],
      newStatus,
      timestamp: now,
      note: newStatus === 'Cancelled' ? cancelReason || trackingNote : trackingNote,
      courierName: courierName !== undefined ? courierName : order.courierName,
      trackingId: trackingId !== undefined ? trackingId : order.trackingId,
    });

    const updatedOrder: Order = {
      ...order,
      status: newStatus,
      courierName: courierName !== undefined ? courierName : order.courierName,
      trackingId: trackingId !== undefined ? trackingId : order.trackingId,
      expectedDeliveryDate:
        expectedDeliveryDate !== undefined ? expectedDeliveryDate : order.expectedDeliveryDate,
      trackingNote: trackingNote !== undefined ? trackingNote : order.trackingNote,
      cancelReason: cancelReason !== undefined ? cancelReason : order.cancelReason,
      trackingHistory: nextHistory,
      updatedAt: now,
    };

    await set(ref(db, `orders/${order.id}`), updatedOrder);
  };

  const saveCategory = async (
    catData: { name: string; image: string; visible: boolean; order: number },
    existingId?: string
  ): Promise<Category> => {
    const now = Date.now();
    const cleanName = catData.name.trim();
    const rawSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = (rawSlug || 'category').slice(0, 48);
    const id = existingId || `cat_${now}_${slug}`;
    const existing = categories.find((c) => c.id === existingId);

    const record: Category = {
      id,
      name: cleanName,
      slug,
      image: resolveImageUrl(catData.image, cleanName),
      order: catData.order,
      visible: catData.visible,
      createdAt: existing?.createdAt || now,
    };

    // Optimistic local state update for instant UI responsiveness
    setCategories((prev) => {
      const without = prev.filter((c) => c.id !== id);
      return [...without, record].sort((a, b) => a.order - b.order);
    });

    await set(ref(db, `categories/${id}`), record);

    // If renaming an existing category, sync any products & banners referencing the old name
    if (existing && existing.name !== cleanName) {
      for (const prod of products) {
        if (prod.category === existing.name) {
          await update(ref(db, `products/${prod.id}`), {
            category: cleanName,
            updatedAt: now,
          });
        }
      }
      for (const banner of banners) {
        if (banner.ctaCategory === existing.name) {
          await update(ref(db, `banners/${banner.id}`), {
            ctaCategory: cleanName,
          });
        }
      }
    }

    return record;
  };

  const deleteCategory = async (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    await remove(ref(db, `categories/${categoryId}`));
  };

  const reorderCategory = async (categoryId: string, direction: 'UP' | 'DOWN') => {
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === categoryId);
    if (idx === -1) return;
    const swapIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const current = sorted[idx];
    const target = sorted[swapIdx];
    const currentOrder = idx + 1;
    const targetOrder = swapIdx + 1;

    const updatedCurrent: Category = { ...current, order: targetOrder };
    const updatedTarget: Category = { ...target, order: currentOrder };

    await set(ref(db, `categories/${updatedCurrent.id}`), updatedCurrent);
    await set(ref(db, `categories/${updatedTarget.id}`), updatedTarget);
  };

  const restoreDefaultCategories = async () => {
    const existingNames = new Set(categories.map((c) => c.name.toLowerCase()));
    let nextOrder = categories.length + 1;
    for (let i = 0; i < DEFAULT_CATEGORY_NAMES.length; i++) {
      const name = DEFAULT_CATEGORY_NAMES[i];
      if (!existingNames.has(name.toLowerCase())) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const id = `cat_${i + 1}_${slug}`;
        const cat: Category = {
          id,
          name,
          slug,
          image: CATEGORY_COVER_IMAGES[name] || DEFAULT_HERO_BANNERS[0].image,
          order: nextOrder++,
          visible: true,
          createdAt: Date.now(),
        };
        await set(ref(db, `categories/${cat.id}`), cat);
      }
    }
  };

  const saveBanner = async (bannerData: Omit<HeroBanner, 'id'>, existingId?: string) => {
    const id = existingId || `banner_${Date.now()}`;
    await set(ref(db, `banners/${id}`), { ...bannerData, id });
  };

  const deleteBanner = async (bannerId: string) => {
    await remove(ref(db, `banners/${bannerId}`));
  };

  const saveCoupon = async (couponData: Omit<Coupon, 'id'>, existingId?: string) => {
    const id = existingId || `cpn_${Date.now()}`;
    await set(ref(db, `coupons/${id}`), {
      ...couponData,
      code: couponData.code.trim().toUpperCase(),
      id,
    });
  };

  const deleteCoupon = async (couponId: string) => {
    await remove(ref(db, `coupons/${couponId}`));
  };

  const updateStoreConfig = async (newConfig: Partial<StoreConfig>) => {
    const merged: StoreConfig = { ...storeConfig, ...newConfig };
    setStoreConfig(merged);
    await set(ref(db, 'storeConfig/main'), merged);
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        products,
        orders,
        customers,
        banners,
        coupons,
        storeConfig,
        loading,
        cart,
        wishlist,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        selectedPromoCode,
        setSelectedPromoCode,
        currentCustomer,
        isAuthModalOpen,
        setIsAuthModalOpen,
        registerCustomer,
        loginCustomer,
        loginWithGoogle,
        loginWithoutPassword,
        logoutCustomer,
        updateCustomerProfile,
        placeOrder,
        isAdminAuthenticated,
        loginAdmin,
        loginAdminWithGoogle,
        logoutAdmin,
        saveProduct,
        deleteProduct,
        toggleProductStock,
        toggleProductBestseller,
        updateOrderStatus,
        saveCategory,
        deleteCategory,
        reorderCategory,
        restoreDefaultCategories,
        saveBanner,
        deleteBanner,
        saveCoupon,
        deleteCoupon,
        updateStoreConfig,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}
