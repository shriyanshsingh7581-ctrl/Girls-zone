import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Image as ImageIcon,
  Tag,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Phone,
  MessageCircle,
  Check,
  AlertTriangle,
  Search,
  Lock,
  ExternalLink,
  Eye,
  EyeOff,
  Palette,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import {
  Category,
  Coupon,
  FLIPKART_ORDER_STAGES,
  HeroBanner,
  Order,
  OrderStatus,
  Product,
  ProductBadge,
  StoreTemplateId,
} from '../types';
import { uploadMultipleImagesToCloudinary, uploadImageToCloudinary } from '../lib/cloudinary';
import {
  STORE_TEMPLATES,
  THEME_PRESETS,
  buildAdminTrackingWhatsAppUrl,
  calculateDiscountPercent,
  formatDeliveryAddress,
} from '../utils/commerce';
import {
  CATEGORY_IMAGE_PRESETS,
  getFallbackImageForCategory,
  handleImageFallback,
  resolveImageUrl,
} from '../utils/images';

type AdminTab =
  | 'dashboard'
  | 'themes_messages'
  | 'orders'
  | 'products'
  | 'categories'
  | 'banners'
  | 'coupons'
  | 'settings';

const AVAILABLE_BADGES: ProductBadge[] = [
  'Bestseller',
  'New Arrival',
  'Trending',
  'Anti-Tarnish',
];

const ALL_ORDER_STATUSES: OrderStatus[] = [
  'Order Placed',
  'Order Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export const AdminPage: React.FC = () => {
  const {
    categories,
    products,
    orders,
    customers,
    banners,
    coupons,
    storeConfig,
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
  } = useStore();

  // Admin Login Form State
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Active Module Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Product Form State
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('Cosmetic Products');
  const [prodPrice, setProdPrice] = useState('');
  const [prodMrp, setProdMrp] = useState('');
  const [prodInStock, setProdInStock] = useState(true);
  const [prodStockQty, setProdStockQty] = useState('10');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodImageUrlInput, setProdImageUrlInput] = useState('');
  const [prodBadges, setProdBadges] = useState<ProductBadge[]>([]);
  const [prodVariants, setProdVariants] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [prodUploadError, setProdUploadError] = useState('');
  const [prodUploadSuccess, setProdUploadSuccess] = useState('');
  const [prodSavedMsg, setProdSavedMsg] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Orders Filter & Tracking Form State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);
  const [editCourierName, setEditCourierName] = useState('');
  const [editTrackingId, setEditTrackingId] = useState('');
  const [editExpectedDate, setEditExpectedDate] = useState('');
  const [editTrackingNote, setEditTrackingNote] = useState('');
  const [editCancelReason, setEditCancelReason] = useState('');

  // Category Form State
  const [editingCatId, setEditingCatId] = useState<string | undefined>(undefined);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catOrder, setCatOrder] = useState('1');
  const [catVisible, setCatVisible] = useState(true);
  const [catUploadProgress, setCatUploadProgress] = useState<number | null>(null);
  const [catSavedMsg, setCatSavedMsg] = useState('');

  // Quick Inline Category Creator inside Add Product Modal
  const [isQuickCatOpen, setIsQuickCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');

  // Banner Form State
  const [editingBannerId, setEditingBannerId] = useState<string | undefined>(undefined);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerBadge, setBannerBadge] = useState('');
  const [bannerCtaText, setBannerCtaText] = useState('Shop Now');
  const [bannerCtaCategory, setBannerCtaCategory] = useState('Cosmetic Products');
  const [bannerImage, setBannerImage] = useState('');
  const [bannerOrder, setBannerOrder] = useState('1');
  const [bannerActive, setBannerActive] = useState(true);
  const [bannerUploadProgress, setBannerUploadProgress] = useState<number | null>(null);

  // Coupon Form State
  const [editingCouponId, setEditingCouponId] = useState<string | undefined>(undefined);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [couponValue, setCouponValue] = useState('10');
  const [couponMinOrder, setCouponMinOrder] = useState('0');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponSavedMsg, setCouponSavedMsg] = useState('');

  // Settings Form State
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const ok = loginAdmin(loginId, loginPassword);
    if (!ok) {
      setLoginError('Invalid Admin ID or Password. Default ID: admin@girlzzone.com');
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1E1116] text-[#FFFDFB] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#FFFDFB] text-[#1E1116] rounded-2xl p-8 shadow-2xl border border-[#C89D7C]/30 space-y-6">
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-xl bg-[#1E1116] text-[#D4AF37] mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <p className="text-[11px] font-semibold tracking-widest text-[#C89D7C] uppercase">
              Restricted Executive Portal
            </p>
            <h1 className="text-2xl font-serif-luxury font-bold text-[#1E1116]">
              Girlz Zone Admin Control
            </h1>
            <p className="text-xs text-[#1E1116]/60">
              Sign in with your Admin ID / Email and Password to manage products, orders, and live Flipkart tracking.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {loginError}
            </div>
          )}

          {/* 1-Click Google / Gmail Admin Login */}
          <button
            type="button"
            onClick={async () => {
              setLoginError('');
              try {
                await loginAdminWithGoogle();
              } catch {
                setLoginError('Google sign-in popup closed. You can also sign in below.');
              }
            }}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#FDF6F6] text-[#1E1116] border-2 border-[#1E1116]/15 hover:border-[#C89D7C] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
              />
            </svg>
            <span>Continue with Google / Gmail</span>
          </button>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1E1116] mb-1">
                Admin ID / Email
              </label>
              <input
                type="text"
                required
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="admin@girlzzone.com"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-xl focus:outline-none focus:border-[#C89D7C]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1116] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3.5 py-2.5 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-xl focus:outline-none focus:border-[#C89D7C]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              Sign In to Admin Panel
            </button>
          </form>

          <div className="pt-2 border-t border-[#1E1116]/10 text-center">
            <Link
              to="/"
              className="text-xs text-[#1E1116]/60 hover:text-[#1E1116] underline"
            >
              Return to Girlz Zone Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Real-time Analytics Metrics (Starts strictly at ₹0 / 0 Orders / 0 Products)
  const validRevenueOrders = orders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = validRevenueOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;
  const totalProductsCount = products.length;
  const lowOrOutOfStockProducts = products.filter(
    (p) => !p.inStock || (p.stockQuantity || 0) <= 3
  );

  // Open Product Add/Edit Modal
  const openAddProductModal = () => {
    setEditingProductId(undefined);
    setProdName('');
    setProdCategory(categories[0]?.name || 'Cosmetic Products');
    setProdPrice('');
    setProdMrp('');
    setProdInStock(true);
    setProdStockQty('15');
    setProdImages([]);
    setProdImageUrlInput('');
    setProdBadges([]);
    setProdVariants('');
    setProdDescription('');
    setProdUploadError('');
    setProdUploadSuccess('');
    setIsProductFormOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProductId(prod.id);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdPrice(String(prod.price));
    setProdMrp(String(prod.mrp));
    setProdInStock(prod.inStock);
    setProdStockQty(String(prod.stockQuantity));
    setProdImages(prod.images || []);
    setProdImageUrlInput('');
    setProdBadges(prod.badges || []);
    setProdVariants((prod.variants || []).join(', '));
    setProdDescription(prod.description || '');
    setProdUploadError('');
    setProdUploadSuccess('');
    setIsProductFormOpen(true);
  };

  const handleCloudinaryProductUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const selectedFiles = Array.from(fileList);
    // Reset input value immediately so selecting the same or another photo again always fires onChange
    e.target.value = '';

    setProdUploadError('');
    setProdUploadSuccess('');
    try {
      setUploadProgress(5);
      const uploadedUrls = await uploadMultipleImagesToCloudinary(selectedFiles, (pct) =>
        setUploadProgress(pct)
      );
      setProdImages((prev) => [...prev, ...uploadedUrls].slice(0, 6));
      setProdUploadSuccess(
        `${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'photo' : 'photos'} uploaded & ready!`
      );
    } catch (err: any) {
      setProdUploadError(
        err?.message || 'Could not process selected photo. Please try a JPG/PNG/WebP image.'
      );
    } finally {
      setTimeout(() => setUploadProgress(null), 350);
    }
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadProgress !== null) return;
    setProdUploadError('');

    if (!prodName.trim()) {
      setProdUploadError('Please enter a Product Name.');
      return;
    }

    const numPrice = Math.max(0, Number(prodPrice) || 0);
    const numMrp = Math.max(numPrice, Number(prodMrp) || numPrice);
    const numStock = Math.max(0, Number(prodStockQty) || 0);

    const combinedUrls = [
      ...prodImages,
      ...(prodImageUrlInput.trim() ? [prodImageUrlInput.trim()] : []),
    ]
      .map((u) => resolveImageUrl(u, prodCategory))
      .filter(Boolean)
      .slice(0, 6);

    const finalImages =
      combinedUrls.length > 0 ? combinedUrls : [resolveImageUrl(undefined, prodCategory)];

    const parsedVariants = prodVariants
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await saveProduct(
        {
          name: prodName.trim(),
          category: prodCategory,
          price: numPrice,
          mrp: numMrp,
          inStock: prodInStock && numStock > 0,
          stockQuantity: prodInStock ? Math.max(1, numStock) : 0,
          images: finalImages,
          badges: prodBadges,
          variants: parsedVariants,
          bestseller: prodBadges.includes('Bestseller'),
          description: prodDescription.trim(),
        },
        editingProductId
      );
      setIsProductFormOpen(false);
      setProdSavedMsg(
        editingProductId
          ? `Product "${prodName.trim()}" updated live on the website!`
          : `Product "${prodName.trim()}" published live with ${finalImages.length} photo(s)!`
      );
      setTimeout(() => setProdSavedMsg(''), 4000);
    } catch (err: any) {
      setProdUploadError(err?.message || 'Failed to save product. Please try again.');
    }
  };

  const filteredAdminOrders = orders.filter((ord) => {
    if (orderStatusFilter !== 'ALL' && ord.status !== orderStatusFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      return (
        ord.orderNumber.toLowerCase().includes(q) ||
        ord.customerName.toLowerCase().includes(q) ||
        ord.customerPhone.includes(q)
      );
    }
    return true;
  });

  const filteredAdminProducts = products.filter((p) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-[#1E1116] flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Desktop Executive Left Sidebar (>= 768px) */}
      <aside className="hidden md:flex md:w-64 bg-[#1E1116] text-[#FFFDFB] flex-col justify-between shrink-0 min-h-screen sticky top-0">
        <div className="p-6 space-y-6">
          <div className="border-b border-[#FFFDFB]/10 pb-4">
            <p className="text-[10px] tracking-[0.2em] text-[#D4AF37] uppercase font-semibold">
              Executive Suite
            </p>
            <h1 className="text-2xl font-serif-luxury font-bold text-[#FFFDFB] mt-0.5">
              Girlz Zone Admin
            </h1>
          </div>

          <nav className="space-y-1.5 text-xs font-medium">
            {[
              { id: 'dashboard', label: '1. Live Analytics', icon: LayoutDashboard },
              {
                id: 'themes_messages',
                label: '2. Themes, 4 Templates & Messages',
                icon: Palette,
              },
              {
                id: 'orders',
                label: `3. Orders & Tracking (${orders.length})`,
                icon: Package,
              },
              {
                id: 'products',
                label: `4. Product Catalog (${products.length})`,
                icon: ShoppingBag,
              },
              {
                id: 'categories',
                label: `5. Categories (${categories.length})`,
                icon: Layers,
              },
              { id: 'banners', label: '6. Banners & Flash Sale', icon: ImageIcon },
              { id: 'coupons', label: `7. Promo Coupons (${coupons.length})`, icon: Tag },
              {
                id: 'settings',
                label: `8. Customers & Settings`,
                icon: Settings,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#C89D7C] text-[#1E1116] font-semibold'
                      : 'text-[#FFFDFB]/75 hover:bg-[#FFFDFB]/10 hover:text-[#FFFDFB]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-[#FFFDFB]/10 space-y-2.5">
          <Link
            to="/"
            className="w-full py-2.5 px-3.5 rounded-xl bg-[#FFFDFB]/10 hover:bg-[#FFFDFB]/20 text-xs font-medium flex items-center justify-between text-[#FFFDFB]"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={logoutAdmin}
            className="w-full py-2.5 px-3.5 rounded-xl border border-red-400/30 text-red-300 hover:bg-red-500/10 text-xs font-medium flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Admin Session</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sticky Admin Top Header (< 768px) */}
      <header className="md:hidden sticky top-0 z-30 bg-[#1E1116] text-[#FFFDFB] px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-[#D4AF37] uppercase tracking-widest">Admin App</p>
          <h1 className="text-lg font-serif-luxury font-bold">Girlz Zone Control</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEditingCatId(undefined);
              setCatName('');
              setCatImage('');
              setCatOrder(String(categories.length + 1));
              setCatVisible(true);
              setActiveTab('categories');
            }}
            className="px-2.5 py-1.5 rounded-lg border border-[#C89D7C] text-[#D4AF37] text-[11px] font-semibold flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>+ Category</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('products');
              openAddProductModal();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-[#C89D7C] text-[#1E1116] text-[11px] font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Product</span>
          </button>
          <Link
            to="/"
            className="p-2 rounded-lg bg-[#FFFDFB]/10 text-[#FFFDFB] text-xs"
            aria-label="Storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Main Admin Workspace Content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto space-y-6">
        {/* Top Command Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1E1116]/10">
          <div>
            <h2 className="text-2xl font-serif-luxury font-bold text-[#1E1116]">
              {activeTab === 'dashboard' && 'Live Store Analytics & Overview'}
              {activeTab === 'themes_messages' &&
                'Website Color Themes, 4 Luxury Templates & Full Message Control'}
              {activeTab === 'orders' && 'Flipkart Order & Live Tracking Controller'}
              {activeTab === 'products' && 'Product Catalog Manager (Cloudinary Sync)'}
              {activeTab === 'categories' &&
                'Store Category Studio — Add, Reorder & Optimize Website Categories'}
              {activeTab === 'banners' && 'Hero Banners, Announcement Bar & Flash Sale'}
              {activeTab === 'coupons' && 'Coupons & Promo Codes Manager'}
              {activeTab === 'settings' && 'Registered Customers & Store Settings'}
            </h2>
            <p className="text-xs text-[#1E1116]/60">
              Synced globally in real time with Firebase database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="top-delivery-status-btn"
              onClick={() => setActiveTab('orders')}
              className="px-3 py-2.5 rounded-xl border border-[#1E1116]/20 bg-[#FFFDFB] hover:border-[#C89D7C] text-[#1E1116] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#C89D7C]" />
              <span>Delivery Status ({orders.length})</span>
            </button>
            <button
              type="button"
              data-testid="top-promo-code-btn"
              onClick={() => setActiveTab('coupons')}
              className="px-3 py-2.5 rounded-xl border border-[#1E1116]/20 bg-[#FFFDFB] hover:border-[#C89D7C] text-[#1E1116] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Tag className="w-4 h-4 text-[#C89D7C]" />
              <span>+ Promo Code ({coupons.length})</span>
            </button>
            <button
              type="button"
              data-testid="top-add-category-btn"
              onClick={() => {
                setEditingCatId(undefined);
                setCatName('');
                setCatImage('');
                setCatOrder(String(categories.length + 1));
                setCatVisible(true);
                setActiveTab('categories');
              }}
              className="px-3 py-2.5 rounded-xl border border-[#1E1116]/20 bg-[#FFFDFB] hover:border-[#C89D7C] hover:bg-[#FDF6F6] text-[#1E1116] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#C89D7C]" />
              <span>+ Add Category</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('themes_messages')}
              className="px-3 py-2.5 rounded-xl border border-[#C89D7C] bg-[#FDF6F6] hover:bg-[#C89D7C] text-[#1E1116] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Palette className="w-4 h-4 text-[#C89D7C]" />
              <span>4 Templates & Colors</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('products');
                openAddProductModal();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Product</span>
            </button>
          </div>
        </div>

        {/* MODULE: WEBSITE COLOR THEMES, 4 TEMPLATES & FULL MESSAGE STUDIO */}
        {activeTab === 'themes_messages' && (
          <div className="space-y-8">
            {settingsSavedMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{settingsSavedMsg}</span>
              </div>
            )}

            {/* SECTION 1: 4 PREMIUM STOREFRONT TEMPLATES (MOBILE + DESKTOP OPTIMIZED) */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/35 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#C89D7C]">
                    1-Click Storefront Design Switcher
                  </p>
                  <h3 className="text-xl font-serif-luxury font-bold text-[#1E1116]">
                    Choose From 4 Premium Templates (Mobile & Desktop Optimized)
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#1E1116] text-[#D4AF37] text-xs font-semibold">
                  Active:{' '}
                  {STORE_TEMPLATES.find((t) => t.id === (storeConfig.activeTemplate || 'prestige'))
                    ?.name || 'Prestige Editorial Classic'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {STORE_TEMPLATES.map((tpl) => {
                  const isCurrent = (storeConfig.activeTemplate || 'prestige') === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      data-testid={`template-card-${tpl.id}`}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-4 ${
                        isCurrent
                          ? 'bg-[#FFFDFB] border-[#1E1116] shadow-md'
                          : 'bg-[#FFFDFB]/80 border-[#1E1116]/12 hover:border-[#C89D7C]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-[#FDF6F6] border border-[#C89D7C]/40 text-[10px] font-bold uppercase tracking-wider text-[#C89D7C]">
                            {tpl.badge}
                          </span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                              <Check className="w-3.5 h-3.5" /> Active Live
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-serif-luxury font-bold text-[#1E1116]">
                          {tpl.name}
                        </h4>
                        <p className="text-xs text-[#1E1116]/70 leading-relaxed">
                          {tpl.subtitle}
                        </p>
                        <div className="pt-2 space-y-1 text-[11px] text-[#1E1116]/75 border-t border-[#1E1116]/8">
                          <p>
                            <strong>Mobile View:</strong> {tpl.mobileFeatures}
                          </p>
                          <p>
                            <strong>Desktop View:</strong> {tpl.desktopFeatures}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        data-testid={`activate-template-${tpl.id}`}
                        onClick={async () => {
                          await updateStoreConfig({ activeTemplate: tpl.id as StoreTemplateId });
                          setSettingsSavedMsg(`Template switched live to "${tpl.name}"!`);
                          setTimeout(() => setSettingsSavedMsg(''), 3000);
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116]'
                        }`}
                      >
                        {isCurrent ? '✓ Currently Active Template' : `Activate "${tpl.name}"`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: GLOBAL WEBSITE COLOR THEME STUDIO */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDFB] border border-[#1E1116]/12 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#C89D7C]">
                    Live Brand Palette Controller
                  </p>
                  <h3 className="text-xl font-serif-luxury font-bold text-[#1E1116]">
                    Full Website Color Theme Presets & Custom Color Pickers
                  </h3>
                </div>
                <button
                  type="button"
                  data-testid="reset-default-colors-btn"
                  onClick={async () => {
                    const def = THEME_PRESETS[0];
                    await updateStoreConfig({
                      themePreset: def.id,
                      themeBgPrimary: def.bgPrimary,
                      themeBgSecondary: def.bgSecondary,
                      themeTextPrimary: def.textPrimary,
                      themeAccentPrimary: def.accentPrimary,
                      themeAccentSecondary: def.accentSecondary,
                    });
                    setSettingsSavedMsg('Reset to default Rose Gold & Soft Pearl color theme!');
                    setTimeout(() => setSettingsSavedMsg(''), 3000);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#1E1116]/20 text-xs font-semibold hover:bg-[#FDF6F6] cursor-pointer"
                >
                  Reset Default Colors
                </button>
              </div>

              {/* 6 Curated Color Theme Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {THEME_PRESETS.map((preset) => {
                  const isSelected = storeConfig.themePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      data-testid={`theme-preset-${preset.id}`}
                      onClick={async () => {
                        await updateStoreConfig({
                          themePreset: preset.id,
                          themeBgPrimary: preset.bgPrimary,
                          themeBgSecondary: preset.bgSecondary,
                          themeTextPrimary: preset.textPrimary,
                          themeAccentPrimary: preset.accentPrimary,
                          themeAccentSecondary: preset.accentSecondary,
                        });
                        setSettingsSavedMsg(`Applied "${preset.name}" color theme across the website!`);
                        setTimeout(() => setSettingsSavedMsg(''), 3000);
                      }}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'border-[#1E1116] bg-[#FDF6F6] shadow-sm'
                          : 'border-[#1E1116]/12 bg-[#FFFDFB] hover:border-[#C89D7C]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1E1116]">{preset.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-700">Active</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#1E1116]/65">{preset.description}</p>
                      <div className="flex items-center gap-2 pt-1">
                        {[
                          preset.bgPrimary,
                          preset.bgSecondary,
                          preset.textPrimary,
                          preset.accentPrimary,
                          preset.accentSecondary,
                        ].map((hex, i) => (
                          <span
                            key={i}
                            className="w-6 h-6 rounded-full border border-black/15 shadow-2xs"
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 5 Custom Live Color Pickers */}
              <div className="pt-4 border-t border-[#1E1116]/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E1116]">
                  Custom Color Pickers (Fine-Tune Any Website Color)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {[
                    {
                      label: 'Main Page Background',
                      key: 'themeBgPrimary' as const,
                      val: storeConfig.themeBgPrimary || '#FFFDFB',
                    },
                    {
                      label: 'Card & Section Surface',
                      key: 'themeBgSecondary' as const,
                      val: storeConfig.themeBgSecondary || '#FDF6F6',
                    },
                    {
                      label: 'Primary Text & Buttons',
                      key: 'themeTextPrimary' as const,
                      val: storeConfig.themeTextPrimary || '#1E1116',
                    },
                    {
                      label: 'Primary Brand Accent',
                      key: 'themeAccentPrimary' as const,
                      val: storeConfig.themeAccentPrimary || '#C89D7C',
                    },
                    {
                      label: 'Secondary Gold Highlight',
                      key: 'themeAccentSecondary' as const,
                      val: storeConfig.themeAccentSecondary || '#D4AF37',
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="p-3 rounded-xl bg-[#FDF6F6] border border-[#1E1116]/10 space-y-1.5"
                    >
                      <label className="block text-[11px] font-semibold text-[#1E1116]">
                        {item.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={item.val}
                          onChange={(e) =>
                            updateStoreConfig({
                              themePreset: 'custom',
                              [item.key]: e.target.value,
                            })
                          }
                          className="w-9 h-9 rounded cursor-pointer border border-[#1E1116]/20 bg-transparent"
                        />
                        <input
                          type="text"
                          value={item.val}
                          onChange={(e) =>
                            updateStoreConfig({
                              themePreset: 'custom',
                              [item.key]: e.target.value,
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: FULL WEBSITE & WHATSAPP MESSAGE CONTROL CENTER */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateStoreConfig(storeConfig);
                setSettingsSavedMsg('All website & WhatsApp messages saved live!');
                setTimeout(() => setSettingsSavedMsg(''), 3000);
              }}
              className="p-5 sm:p-6 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/35 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[#C89D7C]">
                    Complete Copy & WhatsApp Automation Control
                  </p>
                  <h3 className="text-xl font-serif-luxury font-bold text-[#1E1116]">
                    Full Website & WhatsApp Message Control Center
                  </h3>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs font-semibold cursor-pointer"
                >
                  Save All Messages Live
                </button>
              </div>

              {/* 3A: Top Announcement, Welcome Notice & Flash Sale Messages */}
              <div className="p-4 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/10 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C89D7C]">
                  A. Top Announcement Bar, Welcome Banner & Flash Sale Messages
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold mb-1">
                      Top Scrolling Announcement Bar Message
                    </label>
                    <input
                      type="text"
                      value={storeConfig.announcementText}
                      onChange={(e) => updateStoreConfig({ announcementText: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold">
                        Custom Welcome / Store Notice Banner
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#C89D7C] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(storeConfig.welcomeBannerActive)}
                          onChange={(e) =>
                            updateStoreConfig({ welcomeBannerActive: e.target.checked })
                          }
                        />
                        <span>Show on Homepage</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={storeConfig.welcomeBannerText || ''}
                      onChange={(e) => updateStoreConfig({ welcomeBannerText: e.target.value })}
                      placeholder="Special notice or festival greeting..."
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold">Flash Sale Highlight Message</label>
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-[#C89D7C] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(storeConfig.flashSaleActive)}
                          onChange={(e) =>
                            updateStoreConfig({ flashSaleActive: e.target.checked })
                          }
                        />
                        <span>Show Flash Sale</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={storeConfig.flashSaleTitle}
                      onChange={(e) => updateStoreConfig({ flashSaleTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 3B: Storefront Headlines, Empty State & Boutique Section Messages */}
              <div className="p-4 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/10 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C89D7C]">
                  B. Storefront Section Headlines, Empty Catalog & Footer Messages
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Catalog Section Kicker (Small Top Label)
                    </label>
                    <input
                      type="text"
                      value={storeConfig.catalogSectionKicker || ''}
                      onChange={(e) =>
                        updateStoreConfig({ catalogSectionKicker: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Catalog Section Main Heading
                    </label>
                    <input
                      type="text"
                      value={storeConfig.catalogSectionTitle || ''}
                      onChange={(e) => updateStoreConfig({ catalogSectionTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Empty Catalog Launch Title (When 0 Products)
                    </label>
                    <input
                      type="text"
                      value={storeConfig.emptyCatalogTitle || ''}
                      onChange={(e) => updateStoreConfig({ emptyCatalogTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Empty Catalog Launch Subtitle
                    </label>
                    <input
                      type="text"
                      value={storeConfig.emptyCatalogSubtitle || ''}
                      onChange={(e) =>
                        updateStoreConfig({ emptyCatalogSubtitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Ambernath Boutique Section Title
                    </label>
                    <input
                      type="text"
                      value={storeConfig.boutiqueSectionTitle || ''}
                      onChange={(e) =>
                        updateStoreConfig({ boutiqueSectionTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Ambernath Boutique Section Description
                    </label>
                    <input
                      type="text"
                      value={storeConfig.boutiqueSectionSubtitle || ''}
                      onChange={(e) =>
                        updateStoreConfig({ boutiqueSectionSubtitle: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Footer Brand Description Tagline
                    </label>
                    <textarea
                      rows={2}
                      value={storeConfig.footerTagline || ''}
                      onChange={(e) => updateStoreConfig({ footerTagline: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Checkout Order Confirmation Popup Message
                    </label>
                    <textarea
                      rows={2}
                      value={storeConfig.orderConfirmationMessage || ''}
                      onChange={(e) =>
                        updateStoreConfig({ orderConfirmationMessage: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 3C: WhatsApp Automated Message Templates */}
              <div className="p-4 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/10 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C89D7C]">
                  C. WhatsApp Automated Message Templates (Orders, Inquiries & Live Tracking)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      General WhatsApp Inquiry Message
                    </label>
                    <input
                      type="text"
                      value={storeConfig.whatsappGeneralInquiryMessage || ''}
                      onChange={(e) =>
                        updateStoreConfig({ whatsappGeneralInquiryMessage: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Product Inquiry Template (Placeholders: {'{productName}'}, {'{price}'},{' '}
                      {'{category}'})
                    </label>
                    <input
                      type="text"
                      value={storeConfig.whatsappProductInquiryTemplate || ''}
                      onChange={(e) =>
                        updateStoreConfig({ whatsappProductInquiryTemplate: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      WhatsApp Order Invoice Header Line
                    </label>
                    <input
                      type="text"
                      value={storeConfig.whatsappOrderInvoiceHeader || ''}
                      onChange={(e) =>
                        updateStoreConfig({ whatsappOrderInvoiceHeader: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      WhatsApp Order Invoice Footer Closing Line
                    </label>
                    <input
                      type="text"
                      value={storeConfig.whatsappOrderInvoiceFooter || ''}
                      onChange={(e) =>
                        updateStoreConfig({ whatsappOrderInvoiceFooter: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Admin WhatsApp Tracking Update Intro ({'{customerName}'}, {'{orderId}'},{' '}
                      {'{status}'})
                    </label>
                    <input
                      type="text"
                      value={storeConfig.whatsappTrackingUpdateIntro || ''}
                      onChange={(e) =>
                        updateStoreConfig({ whatsappTrackingUpdateIntro: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Admin WhatsApp Tracking Update Outro Closing
                    </label>
                    <input
                      type="text"
                      value={storeConfig.whatsappTrackingUpdateOutro || ''}
                      onChange={(e) =>
                        updateStoreConfig({ whatsappTrackingUpdateOutro: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Save All Theme, Template & Message Settings
              </button>
            </form>
          </div>
        )}

        {/* MODULE 1: LIVE ANALYTICS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30">
                <p className="text-xs text-[#1E1116]/65">Total Revenue</p>
                <p
                  data-testid="admin-total-revenue"
                  className="text-2xl font-mono-num font-bold text-[#1E1116] mt-1"
                >
                  ₹{totalRevenue}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#1E1116]/10">
                <p className="text-xs text-[#1E1116]/65">Total Orders</p>
                <p
                  data-testid="admin-total-orders"
                  className="text-2xl font-mono-num font-bold text-[#1E1116] mt-1"
                >
                  {totalOrdersCount}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#1E1116]/10">
                <p className="text-xs text-[#1E1116]/65">Pending Orders</p>
                <p className="text-2xl font-mono-num font-bold text-amber-700 mt-1">
                  {pendingOrdersCount}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#1E1116]/10">
                <p className="text-xs text-[#1E1116]/65">Total Products</p>
                <p
                  data-testid="admin-total-products"
                  className="text-2xl font-mono-num font-bold text-[#1E1116] mt-1"
                >
                  {totalProductsCount}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#FDF6F6] border border-[#1E1116]/10">
                <p className="text-xs text-[#1E1116]/65">Registered Customers</p>
                <p className="text-2xl font-mono-num font-bold text-[#1E1116] mt-1">
                  {customers.length}
                </p>
              </div>
            </div>

            {/* Quick Navigation & Low Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#1E1116]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif-luxury font-bold text-[#1E1116]">
                    Recent Incoming Orders ({orders.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-[#C89D7C] hover:underline cursor-pointer"
                  >
                    Manage All Orders
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-[#1E1116]/60 py-6 text-center">
                    No orders placed yet. Incoming orders will appear here live with direct 1-click Delivery Status controls.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/25 space-y-2.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-mono-num font-bold text-[#1E1116]">
                              {ord.orderNumber} · {ord.customerName} (+91 {ord.customerPhone})
                            </p>
                            <p className="text-[11px] text-[#1E1116]/60">
                              {ord.items.length} items · ₹{ord.totalAmount} · {ord.deliveryMode}
                            </p>
                          </div>

                          {/* Direct Outside Delivery Status Dropdown */}
                          <select
                            aria-label={`Change delivery status for ${ord.orderNumber}`}
                            value={ord.status}
                            onChange={(e) =>
                              updateOrderStatus({
                                order: ord,
                                newStatus: e.target.value as OrderStatus,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold cursor-pointer"
                          >
                            {ALL_ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quick 1-Tap Delivery Status Progression Pills */}
                        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-[#1E1116]/8">
                          {ALL_ORDER_STATUSES.map((st) => {
                            const isCurrent = ord.status === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() =>
                                  updateOrderStatus({
                                    order: ord,
                                    newStatus: st,
                                  })
                                }
                                className={`px-2 py-1 rounded text-[10px] font-semibold cursor-pointer ${
                                  isCurrent
                                    ? st === 'Cancelled'
                                      ? 'bg-red-600 text-white'
                                      : 'bg-emerald-700 text-white'
                                    : 'bg-[#FFFDFB] text-[#1E1116]/75 border border-[#1E1116]/12 hover:border-[#C89D7C]'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderForEdit(ord);
                              setEditCourierName(ord.courierName || '');
                              setEditTrackingId(ord.trackingId || '');
                              setEditExpectedDate(ord.expectedDeliveryDate || '');
                              setEditTrackingNote(ord.trackingNote || '');
                              setActiveTab('orders');
                            }}
                            className="ml-auto text-[11px] font-semibold text-[#C89D7C] underline cursor-pointer"
                          >
                            Edit Courier / AWB
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#1E1116]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif-luxury font-bold text-[#1E1116]">
                    Low / Out-of-Stock Alerts ({lowOrOutOfStockProducts.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-semibold text-[#C89D7C] hover:underline cursor-pointer"
                  >
                    Open Catalog
                  </button>
                </div>

                {lowOrOutOfStockProducts.length === 0 ? (
                  <p className="text-xs text-[#1E1116]/60 py-6 text-center">
                    {products.length === 0
                      ? '0 products in catalog. Click "+ Add New Product" to upload your first product.'
                      : 'All products are well stocked.'}
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {lowOrOutOfStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <div>
                            <p className="font-semibold text-[#1E1116]">{p.name}</p>
                            <p className="text-[11px] text-[#1E1116]/60">
                              Stock Qty: {p.stockQuantity} · {p.inStock ? 'Low Stock' : 'Out of Stock'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleProductStock(p)}
                          className="px-2.5 py-1 rounded bg-[#1E1116] text-[#FFFDFB] text-[11px] font-semibold cursor-pointer"
                        >
                          Toggle Stock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODULE 2: PRODUCT CATALOG MANAGER */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            {prodSavedMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{prodSavedMsg}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#1E1116]/45 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or category..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-xl"
                />
              </div>
              <button
                type="button"
                onClick={openAddProductModal}
                className="px-4 py-2 rounded-xl bg-[#C89D7C] text-[#1E1116] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>

            {filteredAdminProducts.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/30 text-center space-y-3">
                <ShoppingBag className="w-8 h-8 text-[#C89D7C] mx-auto" />
                <h3 className="text-lg font-serif-luxury font-bold">No Products in Catalog Yet</h3>
                <p className="text-xs text-[#1E1116]/65 max-w-md mx-auto">
                  Upload your real Girlz Zone products with Cloudinary photos or image URLs, pricing, MRP, variants, and stock counts.
                </p>
                <button
                  type="button"
                  onClick={openAddProductModal}
                  className="px-4 py-2.5 rounded-xl bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold cursor-pointer"
                >
                  + Add First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAdminProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/10 flex gap-4 items-start"
                  >
                    <img
                      src={resolveImageUrl(prod.images?.[0], prod.category)}
                      alt={prod.name}
                      onError={(e) => handleImageFallback(e, prod.category)}
                      className="w-20 h-24 rounded-lg object-cover bg-[#FDF6F6] shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-[#C89D7C] font-semibold">{prod.category}</p>
                          <h4 className="text-sm font-bold text-[#1E1116] truncate">{prod.name}</h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditProductModal(prod)}
                            aria-label={`Edit ${prod.name}`}
                            className="p-1.5 rounded-lg hover:bg-[#FDF6F6] text-[#1E1116] cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteProduct(prod.id)}
                            aria-label={`Delete ${prod.name}`}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 font-mono-num text-xs">
                        <span className="font-bold text-[#1E1116]">₹{prod.price}</span>
                        <span className="text-[#1E1116]/45 line-through">₹{prod.mrp}</span>
                        {prod.discountPercent > 0 && (
                          <span className="text-emerald-700 font-semibold">
                            ({prod.discountPercent}% OFF)
                          </span>
                        )}
                      </div>

                      {/* 1-Tap Quick Toggles */}
                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleProductStock(prod)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                            prod.inStock
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {prod.inStock ? `In Stock (${prod.stockQuantity})` : 'Out of Stock'}
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleProductBestseller(prod)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                            prod.bestseller
                              ? 'bg-[#D4AF37]/20 text-[#1E1116] border border-[#D4AF37]'
                              : 'bg-[#FDF6F6] text-[#1E1116]/60 border border-[#1E1116]/10'
                          }`}
                        >
                          {prod.bestseller ? '★ Bestseller' : 'Mark Bestseller'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODULE 3: FLIPKART ORDER & LIVE TRACKING CONTROLLER */}
        {activeTab === 'orders' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-[#1E1116]/45 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Search by Order ID (GZ-10001), Customer Name, or Phone..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-xl"
                />
              </div>

              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-xl font-medium"
              >
                <option value="ALL">All Statuses ({orders.length})</option>
                {ALL_ORDER_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {filteredAdminOrders.length === 0 ? (
              <div className="p-12 rounded-2xl bg-[#FDF6F6] border border-[#1E1116]/10 text-center space-y-2">
                <Package className="w-8 h-8 text-[#C89D7C] mx-auto" />
                <h3 className="text-lg font-serif-luxury font-bold">No Orders Found</h3>
                <p className="text-xs text-[#1E1116]/60">
                  When customers place an order at checkout, it will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAdminOrders.map((ord) => {
                  const isEditingThis = selectedOrderForEdit?.id === ord.id;
                  return (
                    <div
                      key={ord.id}
                      className="p-5 rounded-2xl bg-[#FFFDFB] border border-[#1E1116]/12 space-y-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-[#1E1116]/10">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono-num text-base font-bold text-[#1E1116]">
                              {ord.orderNumber}
                            </span>
                            <span className="px-2.5 py-0.5 rounded bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#1E1116]/70 mt-1">
                            Customer: <strong>{ord.customerName}</strong> · Phone:{' '}
                            <span className="font-mono-num">+91 {ord.customerPhone}</span>
                            {ord.customerEmail ? ` · ${ord.customerEmail}` : ''}
                          </p>
                          <p className="text-xs text-[#1E1116]/65 mt-0.5">
                            {ord.deliveryMode}:{' '}
                            {ord.deliveryMode === 'Store Pickup - Girlz Zone Ambernath'
                              ? 'Store Pickup at Ambernath'
                              : formatDeliveryAddress(ord.deliveryAddress)}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <a
                            href={`tel:+91${ord.customerPhone}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1E1116]/15 text-xs font-semibold hover:bg-[#FDF6F6]"
                          >
                            <Phone className="w-3.5 h-3.5 text-[#C89D7C]" />
                            <span>Call</span>
                          </a>

                          <a
                            href={buildAdminTrackingWhatsAppUrl(
                              ord,
                              storeConfig.whatsappTrackingUpdateIntro,
                              storeConfig.whatsappTrackingUpdateOutro
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Send Tracking Update on WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      {/* Ordered Items Row */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {ord.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-2 p-2 rounded-lg bg-[#FDF6F6] text-xs"
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded object-cover"
                              />
                              <div>
                                <p className="font-semibold text-[#1E1116]">{item.name}</p>
                                <p className="text-[11px] text-[#1E1116]/65">
                                  Qty: {item.quantity} · ₹{item.price * item.quantity}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="text-right font-mono-num">
                          <p className="text-xs text-[#1E1116]/60">{ord.paymentMode}</p>
                          <p className="text-lg font-bold text-[#1E1116]">Total: ₹{ord.totalAmount}</p>
                        </div>
                      </div>

                      {/* 1-Click Flipkart Status Updater */}
                      <div className="pt-3 border-t border-[#1E1116]/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-[#1E1116]/70">
                            1-Click Flipkart Status Updater
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (isEditingThis) {
                                setSelectedOrderForEdit(null);
                              } else {
                                setSelectedOrderForEdit(ord);
                                setEditCourierName(ord.courierName || '');
                                setEditTrackingId(ord.trackingId || '');
                                setEditExpectedDate(ord.expectedDeliveryDate || '');
                                setEditTrackingNote(ord.trackingNote || '');
                                setEditCancelReason(ord.cancelReason || '');
                              }
                            }}
                            className="text-xs font-semibold text-[#C89D7C] underline cursor-pointer"
                          >
                            {isEditingThis ? 'Hide Courier / AWB Fields' : 'Edit Courier / AWB & Note'}
                          </button>
                        </div>

                        {isEditingThis && (
                          <div className="p-3.5 rounded-xl bg-[#FDF6F6] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            <input
                              type="text"
                              value={editCourierName}
                              onChange={(e) => setEditCourierName(e.target.value)}
                              placeholder="Courier Partner (e.g. Delhivery)"
                              className="px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                            />
                            <input
                              type="text"
                              value={editTrackingId}
                              onChange={(e) => setEditTrackingId(e.target.value)}
                              placeholder="Tracking ID / AWB Number"
                              className="px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                            />
                            <input
                              type="text"
                              value={editExpectedDate}
                              onChange={(e) => setEditExpectedDate(e.target.value)}
                              placeholder="Expected Delivery Date"
                              className="px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                            />
                            <input
                              type="text"
                              value={editTrackingNote}
                              onChange={(e) => setEditTrackingNote(e.target.value)}
                              placeholder="Custom Tracking Note / Reason"
                              className="px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                            />
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {ALL_ORDER_STATUSES.map((st) => {
                            const active = ord.status === st;
                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() =>
                                  updateOrderStatus({
                                    order: ord,
                                    newStatus: st,
                                    courierName: isEditingThis ? editCourierName : ord.courierName,
                                    trackingId: isEditingThis ? editTrackingId : ord.trackingId,
                                    expectedDeliveryDate: isEditingThis
                                      ? editExpectedDate
                                      : ord.expectedDeliveryDate,
                                    trackingNote: isEditingThis ? editTrackingNote : undefined,
                                    cancelReason:
                                      st === 'Cancelled' && isEditingThis
                                        ? editTrackingNote || editCancelReason
                                        : undefined,
                                  })
                                }
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                  active
                                    ? st === 'Cancelled'
                                      ? 'bg-red-600 text-white'
                                      : 'bg-emerald-700 text-white'
                                    : 'bg-[#FDF6F6] text-[#1E1116] border border-[#1E1116]/15 hover:border-[#C89D7C]'
                                }`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MODULE 4: CATEGORY STUDIO — ADD, PREVIEW, REORDER & MANAGE WEBSITE CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {catSavedMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{catSavedMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Add / Edit Category Form + Live Storefront Preview */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!catName.trim()) return;
                  const trimmedName = catName.trim();
                  await saveCategory(
                    {
                      name: trimmedName,
                      image: catImage.trim() || getFallbackImageForCategory(trimmedName),
                      order: Number(catOrder) || categories.length + 1,
                      visible: catVisible,
                    },
                    editingCatId
                  );
                  setCatSavedMsg(
                    editingCatId
                      ? `Category "${trimmedName}" updated live across the website!`
                      : `New category "${trimmedName}" added and published live on the website!`
                  );
                  setTimeout(() => setCatSavedMsg(''), 3500);
                  setEditingCatId(undefined);
                  setCatName('');
                  setCatImage('');
                  setCatOrder(String(categories.length + 2));
                  setCatVisible(true);
                }}
                className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/35 space-y-4 h-fit"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#C89D7C]">
                      Instant Website Sync
                    </p>
                    <h3 className="text-lg font-serif-luxury font-bold text-[#1E1116]">
                      {editingCatId ? 'Edit Website Category' : 'Add New Website Category'}
                    </h3>
                  </div>
                  {editingCatId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(undefined);
                        setCatName('');
                        setCatImage('');
                        setCatOrder(String(categories.length + 1));
                        setCatVisible(true);
                      }}
                      className="text-xs font-semibold text-[#1E1116]/60 hover:text-[#1E1116] underline cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-[#1E1116]">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    data-testid="category-name-input"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Bridal Jewellery, Nail Art, Gift Hampers..."
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-xl focus:outline-none focus:border-[#C89D7C]"
                  />
                </div>

                {/* Cover Image Upload + URL + 1-Tap Luxury Presets */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#1E1116]">
                    Category Cover Photo (Cloudinary Upload, URL, or 1-Tap Preset)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      placeholder="Paste image URL or leave blank for auto-luxury cover..."
                      className="flex-1 px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-xl"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs font-semibold cursor-pointer shrink-0 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          e.target.value = '';
                          if (!f) return;
                          try {
                            setCatUploadProgress(5);
                            const url = await uploadImageToCloudinary(f, (p) =>
                              setCatUploadProgress(p)
                            );
                            setCatImage(url);
                          } finally {
                            setTimeout(() => setCatUploadProgress(null), 400);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {catUploadProgress !== null && (
                    <p className="text-[11px] font-mono-num text-emerald-700">
                      Uploading category cover: {catUploadProgress}%
                    </p>
                  )}

                  {/* 1-Tap Luxury Cover Presets */}
                  <div className="pt-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#1E1116]/60 mb-1.5">
                      Or Pick a 1-Click Luxury Cover Preset:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {CATEGORY_IMAGE_PRESETS.map((preset) => {
                        const isSelected = catImage === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => setCatImage(preset.url)}
                            className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-[#1E1116] bg-[#FFFDFB] shadow-2xs'
                                : 'border-[#1E1116]/10 bg-[#FFFDFB]/60 hover:border-[#C89D7C]'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              className="w-full h-11 rounded-lg object-cover mb-1"
                            />
                            <span className="block text-[9px] font-semibold text-[#1E1116] truncate">
                              {preset.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Live Mobile & Desktop Storefront Preview */}
                <div className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/10 space-y-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#C89D7C]">
                    Live Website Preview (Mobile & Desktop)
                  </p>
                  <div className="flex items-center gap-4">
                    {/* Mobile Story Bubble Preview */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="w-14 h-14 rounded-full p-0.5 border-2 border-[#C89D7C] overflow-hidden bg-[#FDF6F6]">
                        <img
                          src={resolveImageUrl(catImage, catName || 'Cosmetic Products')}
                          alt={catName || 'Category preview'}
                          onError={(e) => handleImageFallback(e, catName || 'Cosmetic Products')}
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-[#1E1116] max-w-[76px] truncate">
                        {catName.trim() || 'New Category'}
                      </span>
                      <span className="text-[9px] text-[#1E1116]/50">Mobile App</span>
                    </div>

                    {/* Desktop Department Card Preview */}
                    <div className="flex-1 relative h-24 rounded-xl overflow-hidden border border-[#1E1116]/15 bg-[#1E1116]">
                      <img
                        src={resolveImageUrl(catImage, catName || 'Cosmetic Products')}
                        alt={catName || 'Desktop preview'}
                        onError={(e) => handleImageFallback(e, catName || 'Cosmetic Products')}
                        className="w-full h-full object-cover opacity-85"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1E1116]/90 via-[#1E1116]/30 to-transparent flex flex-col justify-end p-2.5">
                        <span className="text-[9px] font-semibold uppercase tracking-widest text-[#D4AF37]">
                          Desktop Card Preview
                        </span>
                        <p className="text-xs font-serif-luxury font-bold text-[#FFFDFB] truncate">
                          {catName.trim() || 'New Category Name'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Display Order #</label>
                    <input
                      type="number"
                      min="1"
                      value={catOrder}
                      onChange={(e) => setCatOrder(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-xl"
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={catVisible}
                        onChange={(e) => setCatVisible(e.target.checked)}
                      />
                      <span>Visible on Website</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  data-testid="save-category-submit-btn"
                  className="w-full py-3 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {editingCatId
                      ? 'Save Category Changes Live'
                      : 'Add & Publish Category to Website'}
                  </span>
                </button>
              </form>

              {/* Right Column: Live Website Categories List, Reordering & Product Counts */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                  <div>
                    <h3 className="text-base font-serif-luxury font-bold text-[#1E1116]">
                      Active Website Categories ({categories.length})
                    </h3>
                    <p className="text-xs text-[#1E1116]/60">
                      Every category added here automatically updates the Desktop Header, Mobile Category Bar, Department Showcase, and Product Filters.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await restoreDefaultCategories();
                      setCatSavedMsg('All 7 official Girlz Zone categories verified & restored!');
                      setTimeout(() => setCatSavedMsg(''), 3000);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-[#1E1116]/15 bg-[#FFFDFB] hover:border-[#C89D7C] text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#C89D7C]" />
                    <span>Restore 7 Default Categories</span>
                  </button>
                </div>

                {categories.map((cat, idx) => {
                  const catProdCount = products.filter(
                    (p) => p.category.toLowerCase() === cat.name.toLowerCase()
                  ).length;

                  return (
                    <div
                      key={cat.id}
                      data-testid={`admin-category-row-${cat.name}`}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFDFB] border border-[#1E1116]/10 hover:border-[#C89D7C]/50 transition-all flex flex-wrap sm:flex-nowrap items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={resolveImageUrl(cat.image, cat.name)}
                          alt={cat.name}
                          onError={(e) => handleImageFallback(e, cat.name)}
                          referrerPolicy="no-referrer"
                          className="w-13 h-13 rounded-2xl object-cover bg-[#FDF6F6] border border-[#C89D7C]/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-[#1E1116] truncate">{cat.name}</p>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                cat.visible
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {cat.visible ? 'Live on Website' : 'Hidden'}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#1E1116]/60 font-mono-num mt-0.5">
                            Order #{cat.order} · {catProdCount}{' '}
                            {catProdCount === 1 ? 'Product' : 'Products'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {/* Quick Add Product in this Category */}
                        <button
                          type="button"
                          onClick={() => {
                            openAddProductModal();
                            setProdCategory(cat.name);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#FDF6F6] hover:bg-[#C89D7C] text-[#1E1116] text-[11px] font-semibold border border-[#C89D7C]/30 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          + Add Product
                        </button>

                        {/* Move Up / Down Order Buttons */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => reorderCategory(cat.id, 'UP')}
                          aria-label={`Move ${cat.name} up`}
                          className="p-2 rounded-lg border border-[#1E1116]/15 disabled:opacity-30 hover:bg-[#FDF6F6] text-xs cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === categories.length - 1}
                          onClick={() => reorderCategory(cat.id, 'DOWN')}
                          aria-label={`Move ${cat.name} down`}
                          className="p-2 rounded-lg border border-[#1E1116]/15 disabled:opacity-30 hover:bg-[#FDF6F6] text-xs cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Visibility */}
                        <button
                          type="button"
                          onClick={() =>
                            saveCategory(
                              {
                                name: cat.name,
                                image: cat.image,
                                order: cat.order,
                                visible: !cat.visible,
                              },
                              cat.id
                            )
                          }
                          aria-label={`Toggle visibility for ${cat.name}`}
                          className="p-2 rounded-lg border border-[#1E1116]/15 hover:bg-[#FDF6F6] text-xs cursor-pointer"
                        >
                          {cat.visible ? (
                            <Eye className="w-4 h-4 text-emerald-700" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-[#1E1116]/40" />
                          )}
                        </button>

                        {/* Edit Category */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatId(cat.id);
                            setCatName(cat.name);
                            setCatImage(cat.image);
                            setCatOrder(String(cat.order));
                            setCatVisible(cat.visible);
                          }}
                          aria-label={`Edit ${cat.name}`}
                          className="p-2 rounded-lg border border-[#1E1116]/15 hover:bg-[#FDF6F6] text-xs cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete Category */}
                        <button
                          type="button"
                          onClick={() => deleteCategory(cat.id)}
                          aria-label={`Delete ${cat.name}`}
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* MODULE 5: HOMEPAGE BANNERS, ANNOUNCEMENT BAR & FLASH SALE CONTROL */}
        {activeTab === 'banners' && (
          <div className="space-y-6">
            {/* Announcement Bar & Flash Sale Live Controls */}
            <div className="p-5 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-4">
              <h3 className="text-base font-serif-luxury font-bold text-[#1E1116]">
                Announcement Marquee & Flash Sale Control
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Top Scrolling Announcement Bar Text
                  </label>
                  <input
                    type="text"
                    value={storeConfig.announcementText}
                    onChange={(e) => updateStoreConfig({ announcementText: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Flash Sale Banner Title
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={storeConfig.flashSaleTitle}
                      onChange={(e) => updateStoreConfig({ flashSaleTitle: e.target.value })}
                      className="flex-1 px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateStoreConfig({ flashSaleActive: !storeConfig.flashSaleActive })
                      }
                      className={`px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap ${
                        storeConfig.flashSaleActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#1E1116] text-[#FFFDFB]'
                      }`}
                    >
                      {storeConfig.flashSaleActive ? 'Flash Sale: ON' : 'Flash Sale: OFF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Slider Banners CRUD */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!bannerTitle.trim() || !bannerImage.trim()) return;
                  await saveBanner(
                    {
                      title: bannerTitle.trim(),
                      subtitle: bannerSubtitle.trim(),
                      offerBadge: bannerBadge.trim(),
                      ctaText: bannerCtaText.trim() || 'Shop Now',
                      ctaCategory: bannerCtaCategory,
                      image: bannerImage.trim(),
                      order: Number(bannerOrder) || banners.length + 1,
                      active: bannerActive,
                    },
                    editingBannerId
                  );
                  setEditingBannerId(undefined);
                  setBannerTitle('');
                  setBannerSubtitle('');
                  setBannerBadge('');
                  setBannerImage('');
                }}
                className="p-5 rounded-2xl bg-[#FDF6F6] border border-[#1E1116]/10 space-y-3 h-fit"
              >
                <h3 className="text-base font-serif-luxury font-bold">
                  {editingBannerId ? 'Edit Hero Banner' : 'Add Hero Slider Banner'}
                </h3>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Headline Title *"
                  className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                />
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Subtitle description"
                  className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                />
                <input
                  type="text"
                  value={bannerBadge}
                  onChange={(e) => setBannerBadge(e.target.value)}
                  placeholder="Offer Kicker (e.g. NEW COLLECTION)"
                  className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                />
                <select
                  value={bannerCtaCategory}
                  onChange={(e) => setBannerCtaCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      Target: {c.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  required
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="Banner Image URL *"
                  className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Banner via Cloudinary</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      e.target.value = '';
                      if (!f) return;
                      try {
                        setBannerUploadProgress(10);
                        const url = await uploadImageToCloudinary(f, (p) =>
                          setBannerUploadProgress(p)
                        );
                        setBannerImage(url);
                      } finally {
                        setTimeout(() => setBannerUploadProgress(null), 400);
                      }
                    }}
                  />
                </label>
                {bannerUploadProgress !== null && (
                  <p className="text-[11px] font-mono-num text-emerald-700">
                    Uploading: {bannerUploadProgress}%
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#C89D7C] text-[#1E1116] text-xs font-semibold cursor-pointer"
                >
                  Save Hero Banner
                </button>
              </form>

              <div className="lg:col-span-2 space-y-3">
                {banners.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/10 flex gap-4 items-center"
                  >
                    <img
                      src={b.image}
                      alt={b.title}
                      referrerPolicy="no-referrer"
                      className="w-28 h-16 rounded-lg object-cover bg-[#1E1116] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-[#C89D7C] uppercase">
                        {b.offerBadge}
                      </p>
                      <h4 className="text-sm font-bold text-[#1E1116] truncate">{b.title}</h4>
                      <p className="text-xs text-[#1E1116]/60 truncate">{b.subtitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBanner(b.id)}
                      aria-label={`Delete banner ${b.title}`}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODULE 6: COUPONS & PROMO CODES STUDIO */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            {couponSavedMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{couponSavedMsg}</span>
              </div>
            )}

            {/* 1-Click Ready Promo Code Templates */}
            <div className="p-5 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/35 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C89D7C]">
                  Instant Discount Publisher
                </p>
                <h3 className="text-base font-serif-luxury font-bold text-[#1E1116]">
                  1-Click Ready Promo Code Templates (Tap to Activate Live on Website)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    code: 'WELCOME10',
                    type: 'PERCENT' as const,
                    value: 10,
                    minOrderAmount: 0,
                    desc: '10% OFF on any order (No minimum order)',
                  },
                  {
                    code: 'GIRLZ20',
                    type: 'PERCENT' as const,
                    value: 20,
                    minOrderAmount: 499,
                    desc: '20% OFF on orders above ₹499',
                  },
                  {
                    code: 'FLAT50',
                    type: 'FLAT' as const,
                    value: 50,
                    minOrderAmount: 299,
                    desc: 'Flat ₹50 OFF on orders above ₹299',
                  },
                  {
                    code: 'BRIDAL100',
                    type: 'FLAT' as const,
                    value: 100,
                    minOrderAmount: 799,
                    desc: 'Flat ₹100 OFF on orders above ₹799',
                  },
                ].map((tpl) => {
                  const alreadyExists = coupons.some(
                    (c) => c.code.toUpperCase() === tpl.code && c.active
                  );
                  return (
                    <div
                      key={tpl.code}
                      className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/12 flex flex-col justify-between gap-2.5"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono-num text-xs font-bold px-2 py-0.5 rounded bg-[#FDF6F6] border border-[#C89D7C]/40 text-[#1E1116]">
                            {tpl.code}
                          </span>
                          <span className="text-xs font-bold text-emerald-700">
                            {tpl.type === 'PERCENT' ? `${tpl.value}% OFF` : `₹${tpl.value} OFF`}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#1E1116]/65 mt-1.5">{tpl.desc}</p>
                      </div>
                      <button
                        type="button"
                        data-testid={`quick-create-coupon-${tpl.code}`}
                        onClick={async () => {
                          const existing = coupons.find(
                            (c) => c.code.toUpperCase() === tpl.code
                          );
                          await saveCoupon(
                            {
                              code: tpl.code,
                              type: tpl.type,
                              value: tpl.value,
                              minOrderAmount: tpl.minOrderAmount,
                              active: true,
                              description: tpl.desc,
                            },
                            existing?.id
                          );
                          setCouponSavedMsg(
                            `Promo code "${tpl.code}" is now LIVE on the website & checkout!`
                          );
                          setTimeout(() => setCouponSavedMsg(''), 3500);
                        }}
                        className={`w-full py-2 rounded-lg text-xs font-semibold cursor-pointer ${
                          alreadyExists
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116]'
                        }`}
                      >
                        {alreadyExists ? '✓ Active on Website' : `+ Activate ${tpl.code}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!couponCode.trim()) return;
                  const cleanCode = couponCode.trim().toUpperCase();
                  const numVal = Number(couponValue) || 10;
                  const numMin = Math.max(0, Number(couponMinOrder) || 0);
                  await saveCoupon(
                    {
                      code: cleanCode,
                      type: couponType,
                      value: numVal,
                      minOrderAmount: numMin,
                      active: true,
                      description:
                        couponDesc.trim() ||
                        `${couponType === 'PERCENT' ? `${numVal}% OFF` : `Flat ₹${numVal} OFF`}${
                          numMin > 0 ? ` on orders above ₹${numMin}` : ' (No minimum order)'
                        }`,
                    },
                    editingCouponId
                  );
                  setCouponSavedMsg(
                    editingCouponId
                      ? `Promo code "${cleanCode}" updated live!`
                      : `Custom promo code "${cleanCode}" created & published live on website!`
                  );
                  setTimeout(() => setCouponSavedMsg(''), 3500);
                  setEditingCouponId(undefined);
                  setCouponCode('');
                  setCouponDesc('');
                  setCouponMinOrder('0');
                }}
                className="p-5 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-3.5 h-fit"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-serif-luxury font-bold">
                    {editingCouponId ? 'Edit Promo Code' : 'Create Custom Promo Code'}
                  </h3>
                  {editingCouponId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCouponId(undefined);
                        setCouponCode('');
                        setCouponDesc('');
                      }}
                      className="text-xs text-[#1E1116]/60 underline cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Promo Code Name *</label>
                  <input
                    type="text"
                    required
                    data-testid="admin-coupon-code-input"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GIRLZ10, FESTIVE50"
                    className="w-full px-3 py-2 text-xs font-mono-num uppercase bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Discount Type</label>
                    <select
                      value={couponType}
                      onChange={(e) => setCouponType(e.target.value as 'PERCENT' | 'FLAT')}
                      className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                    >
                      <option value="PERCENT">Percentage (% OFF)</option>
                      <option value="FLAT">Flat Discount (₹ OFF)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">
                      Discount Value ({couponType === 'PERCENT' ? '%' : '₹'}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      data-testid="admin-coupon-value-input"
                      value={couponValue}
                      onChange={(e) => setCouponValue(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Minimum Order Value (₹) — Put 0 for No Minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    data-testid="admin-coupon-min-input"
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Offer Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={couponDesc}
                    onChange={(e) => setCouponDesc(e.target.value)}
                    placeholder="e.g. Special Festival Discount"
                    className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  data-testid="admin-save-coupon-btn"
                  className="w-full py-2.5 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs font-semibold cursor-pointer"
                >
                  {editingCouponId ? 'Update Promo Code' : 'Publish Promo Code to Website'}
                </button>
              </form>

              <div className="lg:col-span-2 space-y-3">
                <h3 className="text-base font-serif-luxury font-bold text-[#1E1116]">
                  Active & Saved Promo Codes ({coupons.length})
                </h3>
                {coupons.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-[#FDF6F6] text-center text-xs text-[#1E1116]/60">
                    No promo coupons created yet. Click any 1-Click Template above or create a custom code on the left to offer discounts on the website.
                  </div>
                ) : (
                  coupons.map((cpn) => (
                    <div
                      key={cpn.id}
                      data-testid={`admin-coupon-row-${cpn.code}`}
                      className="p-4 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/10 flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num text-sm font-bold text-[#1E1116] bg-[#FDF6F6] px-2.5 py-1 rounded border border-[#C89D7C]/40">
                            {cpn.code}
                          </span>
                          <span className="text-xs font-bold text-emerald-700">
                            {cpn.type === 'PERCENT'
                              ? `${cpn.value}% OFF`
                              : `Flat ₹${cpn.value} OFF`}
                          </span>
                        </div>
                        <p className="text-xs text-[#1E1116]/70 mt-1.5">
                          {cpn.description} ·{' '}
                          {cpn.minOrderAmount > 0
                            ? `Min Order: ₹${cpn.minOrderAmount}`
                            : 'No Minimum Order'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveCoupon({ ...cpn, active: !cpn.active }, cpn.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                            cpn.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          {cpn.active ? 'Active on Website' : 'Disabled'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCouponId(cpn.id);
                            setCouponCode(cpn.code);
                            setCouponType(cpn.type);
                            setCouponValue(String(cpn.value));
                            setCouponMinOrder(String(cpn.minOrderAmount));
                            setCouponDesc(cpn.description || '');
                          }}
                          aria-label={`Edit coupon ${cpn.code}`}
                          className="p-2 border border-[#1E1116]/15 hover:bg-[#FDF6F6] rounded-lg cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete coupon ${cpn.code}`}
                          onClick={() => deleteCoupon(cpn.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODULE 7: REGISTERED CUSTOMERS & STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Store Settings & Admin Credentials */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await updateStoreConfig(storeConfig);
                setSettingsSavedMsg('Store settings & credentials saved globally!');
                setTimeout(() => setSettingsSavedMsg(''), 3000);
              }}
              className="p-6 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-3.5"
            >
              <h3 className="text-lg font-serif-luxury font-bold text-[#1E1116]">
                Store Details & Admin Credentials
              </h3>

              {settingsSavedMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>{settingsSavedMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">Store Brand Name</label>
                <input
                  type="text"
                  value={storeConfig.storeName}
                  onChange={(e) => updateStoreConfig({ storeName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Official Ambernath Store Address
                </label>
                <textarea
                  rows={2}
                  value={storeConfig.storeAddress}
                  onChange={(e) => updateStoreConfig({ storeAddress: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">WhatsApp No.</label>
                  <input
                    type="text"
                    value={storeConfig.whatsappNumber}
                    onChange={(e) => updateStoreConfig({ whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={storeConfig.deliveryCharge}
                    onChange={(e) =>
                      updateStoreConfig({ deliveryCharge: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Free Above (₹)</label>
                  <input
                    type="number"
                    value={storeConfig.freeDeliveryThreshold}
                    onChange={(e) =>
                      updateStoreConfig({ freeDeliveryThreshold: Number(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E1116]/10 grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold mb-1">Admin Login ID / Email</label>
                  <input
                    type="text"
                    value={storeConfig.adminEmail}
                    onChange={(e) =>
                      updateStoreConfig({
                        adminEmail: e.target.value,
                        adminId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Admin Password</label>
                  <input
                    type="text"
                    value={storeConfig.adminPassword}
                    onChange={(e) => updateStoreConfig({ adminPassword: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold cursor-pointer"
              >
                Save All Settings
              </button>
            </form>

            {/* Registered Customers Directory */}
            <div className="p-6 rounded-2xl bg-[#FFFDFB] border border-[#1E1116]/10 space-y-4">
              <h3 className="text-lg font-serif-luxury font-bold text-[#1E1116]">
                Registered Customers ({customers.length})
              </h3>
              {customers.length === 0 ? (
                <p className="text-xs text-[#1E1116]/60 py-8 text-center">
                  No customers registered yet. When customers sign up on the storefront, their contact and saved delivery addresses appear here.
                </p>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto">
                  {customers.map((c) => (
                    <div
                      key={c.uid}
                      className="p-3.5 rounded-xl bg-[#FDF6F6] border border-[#1E1116]/8 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#1E1116]">{c.fullName}</span>
                        <span className="font-mono-num text-[#1E1116]/75">+91 {c.phone}</span>
                      </div>
                      <p className="text-[#1E1116]/65">{c.email}</p>
                      {c.address && (
                        <p className="text-[11px] text-[#1E1116]/70 pt-1">
                          {formatDeliveryAddress(c.address)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Fixed 8-Tab Scrollable Bottom Navigation Bar for Admin (< 768px) */}
      <nav
        aria-label="Mobile admin navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1E1116] text-[#FFFDFB] flex items-center overflow-x-auto no-scrollbar h-14 px-2 gap-1 border-t border-[#FFFDFB]/10"
      >
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'themes_messages', label: 'Themes', icon: Palette },
          { id: 'orders', label: 'Orders', icon: Package },
          { id: 'products', label: 'Products', icon: ShoppingBag },
          { id: 'categories', label: 'Categories', icon: Layers },
          { id: 'banners', label: 'Banners', icon: ImageIcon },
          { id: 'coupons', label: 'Coupons', icon: Tag },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as AdminTab)}
              className={`flex flex-col items-center justify-center min-w-[60px] min-h-[44px] px-1.5 shrink-0 rounded-lg ${
                active ? 'text-[#D4AF37] font-semibold bg-[#FFFDFB]/10' : 'text-[#FFFDFB]/65'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] mt-0.5 whitespace-nowrap">{t.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Product Add/Edit Modal / Bottom Sheet */}
      {isProductFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={editingProductId ? 'Edit Product' : 'Add New Product'}
          className="fixed inset-0 z-50 bg-[#1E1116]/65 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
          onClick={() => setIsProductFormOpen(false)}
        >
          <div
            className="bg-[#FFFDFB] w-full md:max-w-2xl rounded-t-3xl md:rounded-2xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-[#1E1116]/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1E1116]/10">
              <h3 className="text-xl font-serif-luxury font-bold text-[#1E1116]">
                {editingProductId ? 'Edit Product' : 'Add New Product to Girlz Zone'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductFormOpen(false)}
                className="text-xs font-semibold text-[#1E1116]/60 hover:text-[#1E1116] cursor-pointer"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g. Velvet Rose Matte Lipstick"
                    className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold">Category *</label>
                    <button
                      type="button"
                      onClick={() => setIsQuickCatOpen((prev) => !prev)}
                      className="text-[11px] font-semibold text-[#C89D7C] hover:underline cursor-pointer"
                    >
                      {isQuickCatOpen ? 'Close' : '+ New Category'}
                    </button>
                  </div>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {isQuickCatOpen && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/40 flex gap-2">
                      <input
                        type="text"
                        value={quickCatName}
                        onChange={(e) => setQuickCatName(e.target.value)}
                        placeholder="New category name..."
                        className="flex-1 px-2.5 py-1.5 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!quickCatName.trim()) return;
                          const newName = quickCatName.trim();
                          await saveCategory({
                            name: newName,
                            image: getFallbackImageForCategory(newName),
                            order: categories.length + 1,
                            visible: true,
                          });
                          setProdCategory(newName);
                          setQuickCatName('');
                          setIsQuickCatOpen(false);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold cursor-pointer shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="499"
                    className="w-full px-3 py-2 text-xs font-mono-num bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Original MRP (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={prodMrp}
                    onChange={(e) => setProdMrp(e.target.value)}
                    placeholder="799"
                    className="w-full px-3 py-2 text-xs font-mono-num bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Auto % OFF</label>
                  <div className="px-3 py-2 text-xs font-mono-num font-bold bg-[#FDF6F6]/60 border border-[#1E1116]/10 rounded-lg text-emerald-700">
                    {calculateDiscountPercent(Number(prodPrice) || 0, Number(prodMrp) || 0)}% OFF
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={prodStockQty}
                    onChange={(e) => setProdStockQty(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono-num bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
              </div>

              {/* Cloudinary Direct Image Upload + URL Paste + 1-Tap Presets */}
              <div className="p-3.5 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="block text-xs font-semibold text-[#1E1116]">
                      Product Photos (Camera / Gallery Upload, Image URL, or Preset)
                    </span>
                    <span className="block text-[10px] text-[#1E1116]/60">
                      Auto-optimized for fast loading & Vercel deployment (up to 6 photos per product)
                    </span>
                  </div>
                  <label
                    data-testid="product-photo-upload-label"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs font-semibold cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#C89D7C]" />
                    <span>Upload Photos (Camera / Gallery)</span>
                    <input
                      type="file"
                      data-testid="product-photo-file-input"
                      accept="image/*"
                      multiple
                      onChange={handleCloudinaryProductUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="w-full h-2 bg-[#1E1116]/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#C89D7C] transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-mono-num text-[#1E1116]/70">
                      Optimizing & uploading photo: {uploadProgress}%
                    </p>
                  </div>
                )}

                {prodUploadError && (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                    {prodUploadError}
                  </p>
                )}

                {prodUploadSuccess && (
                  <p
                    data-testid="product-photo-upload-success"
                    className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{prodUploadSuccess}</span>
                  </p>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    data-testid="product-photo-url-input"
                    value={prodImageUrlInput}
                    onChange={(e) => setProdImageUrlInput(e.target.value)}
                    placeholder="Or paste an image URL / Google Drive link here..."
                    className="flex-1 px-3 py-1.5 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                  <button
                    type="button"
                    data-testid="product-photo-add-url-btn"
                    onClick={() => {
                      if (prodImageUrlInput.trim()) {
                        const resolved = resolveImageUrl(prodImageUrlInput.trim(), prodCategory);
                        setProdImages((prev) => [...prev, resolved].slice(0, 6));
                        setProdImageUrlInput('');
                        setProdUploadSuccess('Image URL added to product gallery!');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#C89D7C] text-[#1E1116] text-xs font-semibold cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {/* 1-Tap Quick Studio Cover Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] font-semibold text-[#1E1116]/60 mr-1">
                    Quick Studio Presets:
                  </span>
                  {CATEGORY_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setProdImages((prev) => [preset.url, ...prev.filter((u) => u !== preset.url)].slice(0, 6));
                        setProdUploadSuccess(`Added "${preset.label}" studio photo!`);
                      }}
                      className="px-2 py-1 rounded-md bg-[#FFFDFB] hover:bg-[#1E1116] text-[#1E1116] hover:text-[#FFFDFB] border border-[#1E1116]/15 text-[10px] font-semibold cursor-pointer transition-colors"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>

                {prodImages.length > 0 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto pt-1.5">
                    {prodImages.map((url, idx) => (
                      <div
                        key={idx}
                        data-testid={`uploaded-product-thumb-${idx}`}
                        className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 ${
                          idx === 0 ? 'border-[#C89D7C]' : 'border-[#1E1116]/15'
                        }`}
                      >
                        <img
                          src={resolveImageUrl(url, prodCategory)}
                          alt={`Upload ${idx + 1}`}
                          onError={(e) => handleImageFallback(e, prodCategory)}
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 ? (
                          <span className="absolute bottom-0 inset-x-0 bg-[#1E1116]/85 text-[#D4AF37] text-[8px] font-bold uppercase text-center py-0.5">
                            Main Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setProdImages((prev) => [
                                prev[idx],
                                ...prev.filter((_, i) => i !== idx),
                              ])
                            }
                            className="absolute bottom-0 inset-x-0 bg-[#1E1116]/75 hover:bg-[#C89D7C] text-white hover:text-[#1E1116] text-[8px] font-semibold text-center py-0.5 cursor-pointer"
                          >
                            Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          aria-label={`Remove photo ${idx + 1}`}
                          onClick={() =>
                            setProdImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Badges & Variants */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Product Badges</label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_BADGES.map((badge) => {
                      const active = prodBadges.includes(badge);
                      return (
                        <button
                          key={badge}
                          type="button"
                          onClick={() =>
                            setProdBadges((prev) =>
                              active ? prev.filter((b) => b !== badge) : [...prev, badge]
                            )
                          }
                          className={`px-2.5 py-1 rounded-md text-xs font-medium border cursor-pointer ${
                            active
                              ? 'bg-[#1E1116] text-[#FFFDFB] border-[#1E1116]'
                              : 'bg-[#FDF6F6] text-[#1E1116] border-[#1E1116]/15'
                          }`}
                        >
                          {badge}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Shades / Sizes / Variants (comma separated)
                  </label>
                  <input
                    type="text"
                    value={prodVariants}
                    onChange={(e) => setProdVariants(e.target.value)}
                    placeholder="e.g. Nude Rose, Crimson Velvet, 50ml"
                    className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  placeholder="Describe ingredients, finish, anti-tarnish warranty, or usage tips..."
                  className="w-full px-3 py-2 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prodInStock}
                    onChange={(e) => setProdInStock(e.target.checked)}
                  />
                  <span>Product is In Stock</span>
                </label>

                <button
                  type="submit"
                  disabled={uploadProgress !== null}
                  className={`px-6 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    uploadProgress !== null
                      ? 'bg-[#1E1116]/40 text-[#FFFDFB] cursor-wait'
                      : 'bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116]'
                  }`}
                >
                  {uploadProgress !== null
                    ? `Uploading Photo (${uploadProgress}%)...`
                    : editingProductId
                    ? 'Save Product Changes'
                    : 'Publish Product Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
