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
} from '../types';
import { uploadMultipleImagesToCloudinary, uploadImageToCloudinary } from '../lib/cloudinary';
import {
  buildAdminTrackingWhatsAppUrl,
  calculateDiscountPercent,
  formatDeliveryAddress,
} from '../utils/commerce';

type AdminTab =
  | 'dashboard'
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
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'PERCENT' | 'FLAT'>('PERCENT');
  const [couponValue, setCouponValue] = useState('10');
  const [couponMinOrder, setCouponMinOrder] = useState('499');
  const [couponDesc, setCouponDesc] = useState('');

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
    setIsProductFormOpen(true);
  };

  const handleCloudinaryProductUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setUploadProgress(1);
      const uploadedUrls = await uploadMultipleImagesToCloudinary(files, (pct) =>
        setUploadProgress(pct)
      );
      setProdImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      console.error('Upload error:', err);
    } finally {
      setTimeout(() => setUploadProgress(null), 600);
    }
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = Number(prodPrice) || 0;
    const numMrp = Number(prodMrp) || numPrice;
    const numStock = Number(prodStockQty) || 0;

    const finalImages =
      prodImages.length > 0
        ? prodImages
        : prodImageUrlInput.trim()
        ? [prodImageUrlInput.trim()]
        : ['/src/assets/images/hero_luxury_cosmetics_1794222186679.jpg'];

    const parsedVariants = prodVariants
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

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
                id: 'orders',
                label: `2. Orders & Tracking (${orders.length})`,
                icon: Package,
              },
              {
                id: 'products',
                label: `3. Product Catalog (${products.length})`,
                icon: ShoppingBag,
              },
              {
                id: 'categories',
                label: `4. Categories (${categories.length})`,
                icon: Layers,
              },
              { id: 'banners', label: '5. Banners & Flash Sale', icon: ImageIcon },
              { id: 'coupons', label: `6. Promo Coupons (${coupons.length})`, icon: Tag },
              {
                id: 'settings',
                label: `7. Customers & Settings`,
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('products');
              openAddProductModal();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#C89D7C] text-[#1E1116] text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
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
              {activeTab === 'orders' && 'Flipkart Order & Live Tracking Controller'}
              {activeTab === 'products' && 'Product Catalog Manager (Cloudinary Sync)'}
              {activeTab === 'categories' && 'Store Category Manager'}
              {activeTab === 'banners' && 'Hero Banners, Announcement Bar & Flash Sale'}
              {activeTab === 'coupons' && 'Coupons & Promo Codes Manager'}
              {activeTab === 'settings' && 'Registered Customers & Store Settings'}
            </h2>
            <p className="text-xs text-[#1E1116]/60">
              Synced globally in real time with Firebase database.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('products');
                openAddProductModal();
              }}
              className="px-4 py-2.5 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Product</span>
            </button>
          </div>
        </div>

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
                    No orders placed yet. Incoming orders will appear here live.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3 rounded-xl bg-[#FDF6F6] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-mono-num font-bold text-[#1E1116]">
                            {ord.orderNumber} · {ord.customerName}
                          </p>
                          <p className="text-[11px] text-[#1E1116]/60">
                            {ord.items.length} items · ₹{ord.totalAmount}
                          </p>
                        </div>
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
                          className="px-3 py-1.5 rounded-lg bg-[#1E1116] text-[#FFFDFB] font-semibold cursor-pointer"
                        >
                          {ord.status}
                        </button>
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
                      src={prod.images?.[0]}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
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
                            href={buildAdminTrackingWhatsAppUrl(ord)}
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

        {/* MODULE 4: CATEGORY MANAGER */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!catName.trim()) return;
                await saveCategory(
                  {
                    name: catName.trim(),
                    image: catImage,
                    order: Number(catOrder) || categories.length + 1,
                    visible: catVisible,
                  },
                  editingCatId
                );
                setEditingCatId(undefined);
                setCatName('');
                setCatImage('');
                setCatOrder(String(categories.length + 1));
              }}
              className="p-5 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-3 h-fit"
            >
              <h3 className="text-base font-serif-luxury font-bold text-[#1E1116]">
                {editingCatId ? 'Edit Category' : 'Add Store Category'}
              </h3>

              <div>
                <label className="block text-xs font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Cosmetic Products"
                  className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Category Cover Image (Cloudinary or URL)
                </label>
                <input
                  type="text"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg mb-2"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload via Cloudinary</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setCatUploadProgress(5);
                      const url = await uploadImageToCloudinary(f, (p) =>
                        setCatUploadProgress(p)
                      );
                      setCatImage(url);
                      setTimeout(() => setCatUploadProgress(null), 500);
                    }}
                  />
                </label>
                {catUploadProgress !== null && (
                  <p className="text-[11px] font-mono-num text-emerald-700 mt-1">
                    Uploading: {catUploadProgress}%
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">Display Order</label>
                  <input
                    type="number"
                    value={catOrder}
                    onChange={(e) => setCatOrder(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catVisible}
                      onChange={(e) => setCatVisible(e.target.checked)}
                    />
                    <span>Visible on Store</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold cursor-pointer"
              >
                {editingCatId ? 'Update Category' : 'Save Category'}
              </button>
            </form>

            <div className="lg:col-span-2 space-y-2.5">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/10 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full object-cover bg-[#FDF6F6]"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#1E1116]">{cat.name}</p>
                      <p className="text-[11px] text-[#1E1116]/60 font-mono-num">
                        Order #{cat.order} · {cat.visible ? 'Visible' : 'Hidden'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                      className="p-2 rounded-lg border border-[#1E1116]/15 text-xs cursor-pointer"
                    >
                      {cat.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
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
                      className="p-2 rounded-lg border border-[#1E1116]/15 text-xs cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id)}
                      aria-label={`Delete ${cat.name}`}
                      className="p-2 rounded-lg border border-red-200 text-red-600 text-xs cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
                      if (!f) return;
                      setBannerUploadProgress(10);
                      const url = await uploadImageToCloudinary(f, (p) =>
                        setBannerUploadProgress(p)
                      );
                      setBannerImage(url);
                      setTimeout(() => setBannerUploadProgress(null), 500);
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

        {/* MODULE 6: COUPONS & PROMO CODES MANAGER */}
        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!couponCode.trim()) return;
                await saveCoupon({
                  code: couponCode.trim().toUpperCase(),
                  type: couponType,
                  value: Number(couponValue) || 10,
                  minOrderAmount: Number(couponMinOrder) || 0,
                  active: true,
                  description:
                    couponDesc.trim() ||
                    `${couponType === 'PERCENT' ? `${couponValue}% OFF` : `₹${couponValue} OFF`} on orders above ₹${couponMinOrder}`,
                });
                setCouponCode('');
                setCouponDesc('');
              }}
              className="p-5 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-3 h-fit"
            >
              <h3 className="text-base font-serif-luxury font-bold">Create Promo Code</h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GIRLZ10"
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
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Discount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Minimum Order Value (₹)
                </label>
                <input
                  type="number"
                  value={couponMinOrder}
                  onChange={(e) => setCouponMinOrder(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono-num bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold cursor-pointer"
              >
                Create Coupon Code
              </button>
            </form>

            <div className="lg:col-span-2 space-y-3">
              {coupons.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#FDF6F6] text-center text-xs text-[#1E1116]/60">
                  No active promo coupons yet. Create one on the left to offer discounts at checkout.
                </div>
              ) : (
                coupons.map((cpn) => (
                  <div
                    key={cpn.id}
                    className="p-4 rounded-xl bg-[#FFFDFB] border border-[#1E1116]/10 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="font-mono-num text-sm font-bold text-[#1E1116] bg-[#FDF6F6] px-2.5 py-1 rounded border border-[#C89D7C]/40">
                        {cpn.code}
                      </span>
                      <p className="text-xs text-[#1E1116]/70 mt-1.5">
                        {cpn.type === 'PERCENT' ? `${cpn.value}% OFF` : `Flat ₹${cpn.value} OFF`} · Min Order: ₹{cpn.minOrderAmount}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => saveCoupon({ ...cpn, active: !cpn.active }, cpn.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          cpn.active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {cpn.active ? 'Active' : 'Disabled'}
                      </button>
                      <button
                        type="button"
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

      {/* Mobile Fixed 5-Tab Bottom Navigation Bar for Admin (< 768px) */}
      <nav
        aria-label="Mobile admin navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1E1116] text-[#FFFDFB] grid grid-cols-5 items-center h-14 px-1 border-t border-[#FFFDFB]/10"
      >
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'orders', label: 'Orders', icon: Package },
          { id: 'products', label: 'Products', icon: ShoppingBag },
          { id: 'banners', label: 'Content', icon: ImageIcon },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as AdminTab)}
              className={`flex flex-col items-center justify-center min-h-[44px] ${
                active ? 'text-[#D4AF37] font-semibold' : 'text-[#FFFDFB]/65'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5">{t.label}</span>
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
                  <label className="block text-xs font-semibold mb-1">Category *</label>
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

              {/* Cloudinary Direct Image Upload + URL Paste */}
              <div className="p-3.5 rounded-xl bg-[#FDF6F6] border border-[#C89D7C]/30 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#1E1116]">
                    Product Photos (Cloudinary Direct Upload or Image URL)
                  </span>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#C89D7C]" />
                    <span>Upload Photos (Camera / Gallery)</span>
                    <input
                      type="file"
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
                      Uploading to Cloudinary (dxeuzdwkz): {uploadProgress}%
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={prodImageUrlInput}
                    onChange={(e) => setProdImageUrlInput(e.target.value)}
                    placeholder="Or paste an image URL here..."
                    className="flex-1 px-3 py-1.5 text-xs bg-[#FFFDFB] border border-[#1E1116]/15 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (prodImageUrlInput.trim()) {
                        setProdImages((prev) => [...prev, prodImageUrlInput.trim()]);
                        setProdImageUrlInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#C89D7C] text-[#1E1116] text-xs font-semibold cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {prodImages.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pt-1">
                    {prodImages.map((url, idx) => (
                      <div key={idx} className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={url}
                          alt={`Upload ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setProdImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
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
                  className="px-6 py-2.5 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs font-semibold transition-colors cursor-pointer"
                >
                  {editingProductId ? 'Save Product Changes' : 'Publish Product Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
