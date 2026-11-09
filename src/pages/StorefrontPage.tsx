import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  SlidersHorizontal,
  Heart,
  MapPin,
  MessageCircle,
  ArrowUpRight,
  CheckCircle2,
  Crown,
  Tag,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { CartDrawer } from '../components/CartDrawer';
import { CustomerAuthModal } from '../components/CustomerAuthModal';
import { OrderTrackerView } from '../components/OrderTrackerView';
import { Footer } from '../components/Footer';
import { BUNDLED_IMAGES, handleImageFallback } from '../utils/images';

export const StorefrontPage: React.FC = () => {
  const {
    categories,
    products,
    wishlist,
    coupons,
    storeConfig,
    setSelectedPromoCode,
    setIsCartOpen,
  } = useStore();
  const template = storeConfig.activeTemplate || 'prestige';

  const [activeView, setActiveView] = useState<'home' | 'categories' | 'track' | 'wishlist'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'UNDER_499' | '500_999' | 'ABOVE_1000'>('ALL');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC'>('NEWEST');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.visible),
    [categories]
  );

  const activeCoupons = useMemo(
    () => coupons.filter((c) => c.active),
    [coupons]
  );

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
        if (inStockOnly && !p.inStock) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          if (!matchName && !matchCat && !matchDesc) return false;
        }
        if (priceFilter === 'UNDER_499' && p.price > 499) return false;
        if (priceFilter === '500_999' && (p.price < 500 || p.price > 999)) return false;
        if (priceFilter === 'ABOVE_1000' && p.price < 1000) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') return a.price - b.price;
        if (sortBy === 'PRICE_DESC') return b.price - a.price;
        return b.createdAt - a.createdAt;
      });
  }, [products, selectedCategory, inStockOnly, searchQuery, priceFilter, sortBy]);

  const wishlistedProducts = useMemo(
    () => products.filter((p) => wishlist.includes(p.id)),
    [products, wishlist]
  );

  const waClean = storeConfig.whatsappNumber.replace(/\D/g, '') || '918329783642';
  const generalWaMessage =
    storeConfig.whatsappGeneralInquiryMessage ||
    'Hello Girlz Zone! Please notify me about your new collection launch.';

  return (
    <div
      data-testid="storefront-root"
      data-template={template}
      className="gz-theme-scope min-h-screen flex flex-col bg-[#FFFDFB] text-[#1E1116] transition-colors duration-300"
    >
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
      />

      <main className="flex-1">
        {activeView === 'track' ? (
          <OrderTrackerView initialSearchOrderId={trackingOrderId} />
        ) : activeView === 'categories' ? (
          /* Dedicated Categories Explorer View */
          <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1E1116]/10 pb-4">
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#C89D7C] uppercase">
                  Curated Departments · {visibleCategories.length} Collections
                </p>
                <h1 className="text-3xl font-serif-luxury font-semibold text-[#1E1116] mt-1">
                  Shop By Category
                </h1>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL');
                  setActiveView('home');
                }}
                className="px-4 py-2 rounded-xl bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold hover:bg-[#C89D7C] hover:text-[#1E1116] transition-colors cursor-pointer"
              >
                View All Products ({products.length})
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {visibleCategories.map((cat) => {
                const count = products.filter((p) => p.category === cat.name).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.name);
                      setActiveView('home');
                    }}
                    className={`group relative aspect-[4/3] overflow-hidden bg-[#1E1116] text-left border border-[#1E1116]/10 cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md ${
                      template === 'royal_bridal'
                        ? 'rounded-t-[2.5rem] rounded-b-2xl border-2 border-[#C89D7C]/50'
                        : template === 'parisian_atelier'
                        ? 'rounded-none'
                        : 'rounded-2xl'
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      onError={(e) => handleImageFallback(e, cat.name)}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E1116]/90 via-[#1E1116]/35 to-transparent" />
                    <div className="absolute bottom-3.5 left-4 right-4 text-[#FFFDFB] flex items-end justify-between gap-2">
                      <div>
                        <p className="text-base sm:text-lg font-serif-luxury font-semibold leading-snug">
                          {cat.name}
                        </p>
                        <p className="text-[11px] text-[#D4AF37] font-mono-num mt-0.5">
                          {count} {count === 1 ? 'Product' : 'Products'}
                        </p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#D4AF37] shrink-0 opacity-80 group-hover:opacity-100" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : activeView === 'wishlist' ? (
          /* Wishlist View */
          <section className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold tracking-widest text-[#C89D7C] uppercase">
                  Saved Favorites
                </p>
                <h1 className="text-3xl font-serif-luxury font-semibold text-[#1E1116] mt-1">
                  Your Wishlist ({wishlistedProducts.length})
                </h1>
              </div>
              <button
                type="button"
                onClick={() => setActiveView('home')}
                className="px-4 py-2 rounded-lg border border-[#1E1116]/15 text-xs font-semibold hover:bg-[#FDF6F6] cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>

            {wishlistedProducts.length === 0 ? (
              <div className="bg-[#FDF6F6] border border-[#C89D7C]/30 rounded-2xl p-12 text-center space-y-3">
                <Heart className="w-9 h-9 text-[#C89D7C] mx-auto" />
                <h2 className="text-xl font-serif-luxury font-semibold text-[#1E1116]">
                  Your Wishlist is Empty
                </h2>
                <p className="text-xs text-[#1E1116]/65 max-w-sm mx-auto">
                  Tap the heart icon on any luxury cosmetic, skincare, or jewellery item to save it here for quick access.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {wishlistedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={(p) => setSelectedProduct(p)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Main Storefront Home */
          <>
            <HeroSection
              selectedCategory={selectedCategory}
              onSelectCategory={(catName) => setSelectedCategory(catName)}
              onExploreClick={(catName) => {
                if (catName) setSelectedCategory(catName);
                const el = document.getElementById('collection-catalog');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Desktop Visual Category Showcase Section — Adapts to All 4 Templates & Any Category Count */}
            <section
              data-testid="desktop-category-showcase"
              className="hidden md:block max-w-7xl mx-auto px-6 pt-8 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[#C89D7C]">
                    Shop by Department
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FDF6F6] border border-[#C89D7C]/35 text-[11px] font-mono-num font-semibold text-[#1E1116]">
                    {visibleCategories.length} Categories
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedCategory !== 'ALL' && (
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('ALL')}
                      className="text-xs font-semibold text-[#C89D7C] underline cursor-pointer"
                    >
                      Show All Categories
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveView('categories')}
                    className="text-xs font-semibold text-[#1E1116]/75 hover:text-[#1E1116] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Explore All Departments</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div
                className={`grid gap-3.5 ${
                  visibleCategories.length === 7
                    ? 'grid-cols-7'
                    : visibleCategories.length <= 4
                    ? 'grid-cols-4'
                    : visibleCategories.length <= 6
                    ? 'grid-cols-6'
                    : visibleCategories.length === 8
                    ? 'grid-cols-4'
                    : 'grid-cols-4 lg:grid-cols-5'
                }`}
              >
                {visibleCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(isSelected ? 'ALL' : cat.name);
                        const el = document.getElementById('collection-catalog');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`group relative overflow-hidden text-left transition-all cursor-pointer ${
                        template === 'royal_bridal'
                          ? `aspect-[4/5] rounded-t-full rounded-b-xl border-2 p-1 bg-[#FDF6F6] ${
                              isSelected ? 'border-[#D4AF37] shadow-md' : 'border-[#C89D7C]/35'
                            }`
                          : template === 'parisian_atelier'
                          ? `aspect-[4/3] rounded-none border ${
                              isSelected
                                ? 'border-[#1E1116] ring-2 ring-[#1E1116]/30'
                                : 'border-[#1E1116]/15'
                            }`
                          : `aspect-[4/3] rounded-xl border ${
                              isSelected
                                ? 'border-[#C89D7C] ring-2 ring-[#C89D7C]/40 shadow-sm'
                                : 'border-[#1E1116]/10 hover:border-[#C89D7C]/50'
                            }`
                      }`}
                    >
                      <div
                        className={`w-full h-full relative overflow-hidden ${
                          template === 'royal_bridal' ? 'rounded-t-full rounded-b-lg' : ''
                        }`}
                      >
                        <img
                          src={cat.image}
                          alt={cat.name}
                          onError={(e) => handleImageFallback(e, cat.name)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1116]/90 via-[#1E1116]/30 to-transparent" />
                        <div className="absolute bottom-2.5 inset-x-2 text-center text-[#FFFDFB]">
                          <p className="text-xs font-serif-luxury font-semibold leading-tight line-clamp-2">
                            {cat.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Live Active Promo Codes Strip (Shown automatically whenever Admin creates active coupons) */}
            {activeCoupons.length > 0 && (
              <section
                data-testid="storefront-promo-strip"
                className="max-w-7xl mx-auto px-4 md:px-6 pt-5"
              >
                <div className="p-4 rounded-2xl bg-[#FDF6F6] border border-[#C89D7C]/40 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#C89D7C] shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E1116]">
                      Special Store Promo Codes — Tap to Apply Discount:
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {activeCoupons.map((cpn) => (
                      <button
                        key={cpn.id}
                        type="button"
                        data-testid={`storefront-coupon-pill-${cpn.code}`}
                        onClick={() => {
                          setSelectedPromoCode(cpn.code);
                          setIsCartOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#FFFDFB] hover:bg-[#1E1116] text-[#1E1116] hover:text-[#FFFDFB] border border-[#C89D7C] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span className="font-mono-num font-bold text-[#C89D7C]">{cpn.code}</span>
                        <span>
                          {cpn.type === 'PERCENT'
                            ? `${cpn.value}% OFF`
                            : `Flat ₹${cpn.value} OFF`}
                        </span>
                        {cpn.minOrderAmount > 0 && (
                          <span className="text-[10px] opacity-75">
                            (Min ₹{cpn.minOrderAmount})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Main Catalog Section */}
            <section
              id="collection-catalog"
              className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 space-y-6"
            >
              {/* Catalog Header & Filter Bar */}
              <div
                className={`flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#1E1116]/10 ${
                  template === 'parisian_atelier' ? 'text-center lg:text-left' : ''
                }`}
              >
                <div>
                  <p className="text-xs font-semibold tracking-widest text-[#C89D7C] uppercase">
                    {storeConfig.catalogSectionKicker || 'Girlz Zone Flagship Catalog'}
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-serif-luxury font-semibold text-[#1E1116] mt-0.5">
                    {selectedCategory === 'ALL'
                      ? storeConfig.catalogSectionTitle || 'Curated Luxury Collections'
                      : selectedCategory}
                  </h2>
                </div>

                {/* Interactive Filter Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#1E1116]/70 mr-1">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#C89D7C]" />
                    <span className="font-medium">Filters:</span>
                  </div>

                  <select
                    aria-label="Filter by category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg text-[#1E1116] font-medium focus:outline-none focus:border-[#C89D7C]"
                  >
                    <option value="ALL">All Categories ({visibleCategories.length})</option>
                    {visibleCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Filter by price range"
                    value={priceFilter}
                    onChange={(e) => setPriceFilter(e.target.value as any)}
                    className="px-3 py-1.5 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg text-[#1E1116] font-medium focus:outline-none focus:border-[#C89D7C]"
                  >
                    <option value="ALL">All Prices</option>
                    <option value="UNDER_499">Under ₹499</option>
                    <option value="500_999">₹500 – ₹999</option>
                    <option value="ABOVE_1000">Above ₹1000</option>
                  </select>

                  <select
                    aria-label="Sort products"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 text-xs bg-[#FDF6F6] border border-[#1E1116]/15 rounded-lg text-[#1E1116] font-medium focus:outline-none focus:border-[#C89D7C]"
                  >
                    <option value="NEWEST">Sort: Newest First</option>
                    <option value="PRICE_ASC">Price: Low to High</option>
                    <option value="PRICE_DESC">Price: High to Low</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setInStockOnly((v) => !v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      inStockOnly
                        ? 'bg-[#1E1116] text-[#FFFDFB] border-[#1E1116]'
                        : 'bg-[#FDF6F6] text-[#1E1116] border-[#1E1116]/15'
                    }`}
                  >
                    In-Stock Only
                  </button>
                </div>
              </div>

              {/* Product Grid OR Luxury Empty State ("New Collection Launching Soon — Stay Tuned!") */}
              {products.length === 0 ? (
                <div
                  className={`bg-[#FDF6F6] p-8 sm:p-14 text-center space-y-5 ${
                    template === 'royal_bridal'
                      ? 'border-2 border-[#C89D7C]/50 rounded-3xl'
                      : template === 'parisian_atelier'
                      ? 'border border-[#1E1116]/20 rounded-none'
                      : 'border border-[#C89D7C]/35 rounded-2xl'
                  }`}
                >
                  <div className="w-14 h-14 rounded-full bg-[#FFFDFB] border border-[#C89D7C]/40 text-[#C89D7C] mx-auto flex items-center justify-center shadow-sm">
                    {template === 'royal_bridal' ? (
                      <Crown className="w-6 h-6 text-[#D4AF37]" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-2 max-w-xl mx-auto">
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#C89D7C] uppercase">
                      {storeConfig.storeName} · Palegaon, Ambernath
                    </p>
                    <h3 className="text-2xl sm:text-4xl font-serif-luxury font-semibold text-[#1E1116]">
                      {storeConfig.emptyCatalogTitle ||
                        'New Collection Launching Soon — Stay Tuned!'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#1E1116]/70 leading-relaxed">
                      {storeConfig.emptyCatalogSubtitle ||
                        'We are curating our latest arrivals across Cosmetics, Beauty Products, Skin Care, Hair Care, Hair Accessories, Anti Tarnish Jewellery, and Fine Perfumes.'}
                    </p>
                  </div>

                  {/* Category Preview Grid inside Empty State */}
                  <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 max-w-5xl mx-auto">
                    {visibleCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`p-3 border text-center transition-all cursor-pointer ${
                          template === 'royal_bridal'
                            ? 'rounded-t-full rounded-b-xl'
                            : template === 'parisian_atelier'
                            ? 'rounded-none'
                            : 'rounded-xl'
                        } ${
                          selectedCategory === cat.name
                            ? 'bg-[#1E1116] text-[#FFFDFB] border-[#1E1116]'
                            : 'bg-[#FFFDFB] text-[#1E1116] border-[#1E1116]/10 hover:border-[#C89D7C]'
                        }`}
                      >
                        <img
                          src={cat.image}
                          alt={cat.name}
                          onError={(e) => handleImageFallback(e, cat.name)}
                          className={`w-12 h-12 object-cover mx-auto mb-2 border border-[#C89D7C]/40 ${
                            template === 'parisian_atelier' ? 'rounded-none' : 'rounded-full'
                          }`}
                        />
                        <p className="text-[11px] font-semibold leading-tight line-clamp-2">
                          {cat.name}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                    <a
                      href={`https://wa.me/${waClean}?text=${encodeURIComponent(generalWaMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1E1116] hover:bg-[#C89D7C] text-[#FFFDFB] hover:text-[#1E1116] text-xs sm:text-sm font-semibold transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#C89D7C]" />
                      <span>Inquire on WhatsApp (+91 8329783642)</span>
                    </a>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="bg-[#FDF6F6] border border-[#1E1116]/10 rounded-2xl p-10 text-center space-y-3">
                  <h3 className="text-xl font-serif-luxury font-semibold text-[#1E1116]">
                    No Products Match Your Active Filters
                  </h3>
                  <p className="text-xs text-[#1E1116]/65">
                    Try resetting your category, price range, or search filter to view all available items.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setPriceFilter('ALL');
                      setInStockOnly(false);
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 rounded-lg bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProduct(p)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Flagship Boutique Editorial Section */}
            <section className="max-w-7xl mx-auto px-4 md:px-6 pt-14">
              <div
                className={`bg-[#FDF6F6] border border-[#C89D7C]/30 overflow-hidden grid grid-cols-1 lg:grid-cols-2 items-stretch ${
                  template === 'parisian_atelier'
                    ? 'rounded-none'
                    : template === 'royal_bridal'
                    ? 'rounded-3xl border-2 border-[#C89D7C]/45'
                    : 'rounded-2xl'
                }`}
              >
                <div className="p-6 sm:p-10 md:p-12 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#C89D7C] uppercase">
                      {storeConfig.boutiqueSectionKicker || 'Ambernath Flagship Experience'}
                    </p>
                    <h2
                      className="text-2xl sm:text-4xl font-serif-luxury font-semibold text-[#1E1116] leading-tight"
                      style={{ textWrap: 'balance' }}
                    >
                      {storeConfig.boutiqueSectionTitle ||
                        'Visit Girlz Zone at Palegaon, Ambernath'}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#1E1116]/75 leading-relaxed">
                      {storeConfig.boutiqueSectionSubtitle ||
                        'Experience our luxury range in person or order online with instant WhatsApp invoice confirmation and live Flipkart-style order tracking right to your doorstep.'}
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs text-[#1E1116]/80">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#C89D7C] shrink-0 mt-0.5" />
                      <span>{storeConfig.storeAddress}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#C89D7C] shrink-0" />
                      <span>Home Delivery & Free Store Pickup Available</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`https://wa.me/${waClean}?text=${encodeURIComponent(generalWaMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E1116] text-[#FFFDFB] text-xs font-semibold hover:bg-[#C89D7C] hover:text-[#1E1116] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat on WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveView('track')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#1E1116]/20 text-xs font-semibold text-[#1E1116] hover:bg-[#FFFDFB] transition-colors cursor-pointer"
                    >
                      <span>Track Your Order</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="min-h-[260px] lg:min-h-full bg-[#1E1116]">
                  <img
                    src={BUNDLED_IMAGES.boutique}
                    alt="Girlz Zone Ambernath Boutique"
                    onError={(e) => handleImageFallback(e, 'Beauty Products')}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer
        onSelectCategory={(catName) => {
          setSelectedCategory(catName);
          setActiveView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onTrackOrderClick={() => {
          setActiveView('track');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals & Drawers */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <CartDrawer
        onViewOrderTracking={(orderNum) => {
          setTrackingOrderId(orderNum);
          setActiveView('track');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
      <CustomerAuthModal
        onOpenMyOrders={() => {
          setTrackingOrderId(undefined);
          setActiveView('track');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};
