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
};

const CATEGORY_COVER_IMAGES: Record<string, string> = CATEGORY_FALLBACK_IMAGES;

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

  // Customer Auth
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
  saveCategory: (catData: { name: string; image: string; visible: boolean; order: number }, existingId?: string) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  saveBanner: (bannerData: Omit<HeroBanner, 'id'>, existingId?: string) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;
  saveCoupon: (couponData: Omit<Coupon, 'id'>, existingId?: string) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  updateStoreConfig: (newConfig: Partial<StoreConfig>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
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
    const orderNumber = generateOrderNumber(orders.length);
    const orderId = `ord_${now}_${orderNumber.replace(/[^a-zA-Z0-9]/g, '')}`;
    const cleanPhone = normalizePhone(params.customerPhone);

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: currentCustomer?.uid || `guest_${cleanPhone}`,
      customerName: params.customerName.trim(),
      customerPhone: cleanPhone,
      customerEmail: params.customerEmail.trim(),
      deliveryAddress: params.deliveryAddress,
      deliveryMode: params.deliveryMode,
      paymentMode: params.paymentMode,
      items: [...cart],
      subtotal: params.subtotal,
      discountAmount: params.discountAmount,
      couponCode: params.couponCode || '',
      deliveryCharge: params.deliveryCharge,
      totalAmount: params.totalAmount,
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
    const cleanInput = idOrEmail.trim().toLowerCase();
    const validIds = [
      storeConfig.adminId.toLowerCase(),
      storeConfig.adminEmail.toLowerCase(),
      'admin@girlzzone.com',
      'admin',
    ];
    if (validIds.includes(cleanInput) && password === storeConfig.adminPassword) {
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
    const discountPercent = calculateDiscountPercent(productData.price, productData.mrp);

    const record: Product = {
      ...productData,
      id,
      discountPercent,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };
    await set(ref(db, `products/${id}`), record);
  };

  const deleteProduct = async (productId: string) => {
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
  ) => {
    const now = Date.now();
    const slug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const id = existingId || `cat_${now}_${slug}`;
    const existing = categories.find((c) => c.id === existingId);

    const record: Category = {
      id,
      name: catData.name.trim(),
      slug,
      image: catData.image || DEFAULT_HERO_BANNERS[0].image,
      order: catData.order,
      visible: catData.visible,
      createdAt: existing?.createdAt || now,
    };
    await set(ref(db, `categories/${id}`), record);
  };

  const deleteCategory = async (categoryId: string) => {
    await remove(ref(db, `categories/${categoryId}`));
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
        currentCustomer,
        isAuthModalOpen,
        setIsAuthModalOpen,
        registerCustomer,
        loginCustomer,
        logoutCustomer,
        updateCustomerProfile,
        placeOrder,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        saveProduct,
        deleteProduct,
        toggleProductStock,
        toggleProductBestseller,
        updateOrderStatus,
        saveCategory,
        deleteCategory,
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
