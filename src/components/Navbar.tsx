import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Package,
  Home,
  LayoutGrid,
  X,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';

import { handleImageFallback, resolveImageUrl } from '../utils/images';

interface NavbarProps {
  activeView: 'home' | 'categories' | 'track' | 'wishlist';
  setActiveView: (view: 'home' | 'categories' | 'track' | 'wishlist') => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectProduct: (p: Product) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSelectProduct,
}) => {
  const {
    categories,
    products,
    cart,
    wishlist,
    storeConfig,
    setIsCartOpen,
    currentCustomer,
    setIsAuthModalOpen,
  } = useStore();

  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const visibleCategories = categories.filter((c) => c.visible);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const searchResults =
    searchQuery.trim().length > 0
      ? products
          .filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 6)
      : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Desktop Top Scrolling Announcement Marquee Bar */}
      {storeConfig.announcementText && (
        <div className="hidden md:block bg-[#1E1116] text-[#FFFDFB] text-xs py-2 overflow-hidden border-b border-[#C89D7C]/20">
          <div className="animate-marquee whitespace-nowrap">
            <span className="mx-8 tracking-wide">{storeConfig.announcementText}</span>
            <span className="mx-8 tracking-wide">{storeConfig.announcementText}</span>
            <span className="mx-8 tracking-wide">{storeConfig.announcementText}</span>
          </div>
        </div>
      )}

      {/* Desktop Mega-Header (>= 768px) */}
      <header className="hidden md:block sticky top-0 z-40 bg-[#FFFDFB]/95 backdrop-blur-md border-b border-[#1E1116]/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveView('home');
              setSelectedCategory('ALL');
            }}
            className="text-3xl font-serif-luxury font-semibold tracking-tight text-[#1E1116] whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            {storeConfig.storeName || 'Girlz Zone'}
          </button>

          {/* Zone 2: Concise Single-Line Navigation Links */}
          <nav className="flex items-center gap-6 text-sm font-medium text-[#1E1116]/80">
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                setSelectedCategory('ALL');
              }}
              className={`hover:text-[#1E1116] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeView === 'home' && selectedCategory === 'ALL'
                  ? 'border-[#C89D7C] text-[#1E1116] font-semibold'
                  : 'border-transparent'
              }`}
            >
              All Collections
            </button>
            <button
              type="button"
              onClick={() => setActiveView('categories')}
              className={`hover:text-[#1E1116] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeView === 'categories'
                  ? 'border-[#C89D7C] text-[#1E1116] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Shop Categories ({visibleCategories.length})
            </button>
            {visibleCategories.slice(0, 2).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveView('home');
                  setSelectedCategory(cat.name);
                }}
                className={`hover:text-[#1E1116] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                  activeView === 'home' && selectedCategory === cat.name
                    ? 'border-[#C89D7C] text-[#1E1116] font-semibold'
                    : 'border-transparent'
                }`}
              >
                {cat.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setActiveView('track')}
              className={`hover:text-[#1E1116] transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeView === 'track'
                  ? 'border-[#C89D7C] text-[#1E1116] font-semibold'
                  : 'border-transparent'
              }`}
            >
              Track Order
            </button>
          </nav>

          {/* Zone 3: Search & Primary Utility Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <div ref={searchRef} className="relative w-64">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#1E1116]/50 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setShowSearchDropdown(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  placeholder="Search cosmetics, jewellery..."
                  aria-label="Search products"
                  className="w-full pl-9 pr-8 py-2 text-xs bg-[#FDF6F6] border border-[#C89D7C]/30 rounded-lg text-[#1E1116] placeholder-[#1E1116]/45 focus:outline-none focus:border-[#C89D7C]"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2.5 text-[#1E1116]/50 hover:text-[#1E1116]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Live Search Dropdown Preview */}
              {showSearchDropdown && searchQuery.trim().length > 0 && (
                <div className="absolute right-0 mt-2 w-80 bg-[#FFFDFB] border border-[#1E1116]/10 rounded-xl shadow-xl overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <div className="divide-y divide-[#1E1116]/5">
                      {searchResults.map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => {
                            onSelectProduct(prod);
                            setShowSearchDropdown(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-[#FDF6F6] transition-colors text-left"
                        >
                          <img
                            src={resolveImageUrl(prod.images?.[0], prod.category)}
                            alt={prod.name}
                            onError={(e) => handleImageFallback(e, prod.category)}
                            className="w-11 h-11 rounded-lg object-cover bg-[#FDF6F6] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#1E1116] truncate">{prod.name}</p>
                            <p className="text-[11px] text-[#1E1116]/60 truncate">{prod.category}</p>
                          </div>
                          <span className="text-xs font-mono-num font-semibold text-[#1E1116]">
                            ₹{prod.price}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-[#1E1116]/60">
                      No matching products found for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              aria-label={currentCustomer ? `Account: ${currentCustomer.fullName}` : 'Login or Register'}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#1E1116] hover:bg-[#FDF6F6] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <User className="w-4 h-4 text-[#C89D7C]" />
              <span>{currentCustomer ? currentCustomer.fullName.split(' ')[0] : 'Login / Account'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('wishlist')}
              aria-label="Wishlist"
              className="relative p-2 text-[#1E1116] hover:bg-[#FDF6F6] rounded-lg transition-colors cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 ${
                  wishlist.length > 0 ? 'fill-[#C89D7C] text-[#C89D7C]' : 'text-[#1E1116]'
                }`}
              />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C89D7C] text-white text-[10px] font-mono-num font-semibold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping bag with ${cartCount} items`}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1E1116] text-[#FFFDFB] hover:bg-[#1E1116]/90 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#C89D7C]" />
              <span>Bag</span>
              <span className="font-mono-num bg-[#C89D7C] text-[#1E1116] font-bold px-1.5 py-0.5 rounded text-[11px]">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop Secondary Dynamic Category Ribbon with Thumbnails */}
        <div className="bg-[#FDF6F6]/70 border-t border-[#1E1116]/5">
          <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-5 overflow-x-auto no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => {
                setActiveView('home');
                setSelectedCategory('ALL');
              }}
              className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
                selectedCategory === 'ALL' && activeView === 'home'
                  ? 'text-[#1E1116] font-semibold underline underline-offset-4 decoration-[#C89D7C]'
                  : 'text-[#1E1116]/70 hover:text-[#1E1116]'
              }`}
            >
              All Categories ({visibleCategories.length})
            </button>
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategory === cat.name && activeView === 'home';
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveView('home');
                    setSelectedCategory(cat.name);
                  }}
                  className={`inline-flex items-center gap-2 whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
                    isSelected
                      ? 'text-[#1E1116] font-semibold underline underline-offset-4 decoration-[#C89D7C]'
                      : 'text-[#1E1116]/75 hover:text-[#1E1116]'
                  }`}
                >
                  <img
                    src={resolveImageUrl(cat.image, cat.name)}
                    alt={cat.name}
                    onError={(e) => handleImageFallback(e, cat.name)}
                    className="w-5 h-5 rounded-full object-cover border border-[#C89D7C]/40 shrink-0"
                  />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Native App Top Header (< 768px) — Strictly within 15% sticky viewport budget */}
      <header className="md:hidden sticky top-0 z-40 bg-[#FFFDFB]/95 backdrop-blur-md border-b border-[#1E1116]/10 px-3.5 py-2">
        <div className="flex items-center justify-between gap-2.5 h-11">
          <button
            type="button"
            onClick={() => {
              setActiveView('home');
              setSelectedCategory('ALL');
            }}
            className="text-xl font-serif-luxury font-bold text-[#1E1116] whitespace-nowrap shrink-0"
          >
            {storeConfig.storeName || 'Girlz Zone'}
          </button>

          <div className="relative flex-1 min-w-0">
            <Search className="w-3.5 h-3.5 text-[#1E1116]/45 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeView !== 'home') setActiveView('home');
              }}
              placeholder="Search Girlz Zone..."
              aria-label="Search Girlz Zone"
              className="w-full pl-8 pr-6 py-1.5 text-xs bg-[#FDF6F6] border border-[#C89D7C]/30 rounded-full text-[#1E1116] placeholder-[#1E1116]/45 focus:outline-none focus:border-[#C89D7C]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear mobile search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1E1116]/50"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setActiveView('wishlist')}
            aria-label="Mobile Wishlist"
            className="relative min-w-[40px] min-h-[40px] flex items-center justify-center text-[#1E1116]"
          >
            <Heart
              className={`w-5 h-5 ${
                wishlist.length > 0 ? 'fill-[#C89D7C] text-[#C89D7C]' : 'text-[#1E1116]'
              }`}
            />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C89D7C] text-white text-[9px] font-mono-num font-bold flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            aria-label="Mobile Cart"
            className="relative min-w-[40px] min-h-[40px] flex items-center justify-center text-[#1E1116]"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#1E1116] text-[#FFFDFB] text-[9px] font-mono-num font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Fixed Native 5-Tab Bottom Navigation Bar (< 768px) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDFB]/95 backdrop-blur-md border-t border-[#1E1116]/10 grid grid-cols-5 items-center h-14 px-1"
      >
        <button
          type="button"
          onClick={() => {
            setActiveView('home');
            setSelectedCategory('ALL');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeView === 'home' ? 'text-[#C89D7C] font-semibold' : 'text-[#1E1116]/65'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Home</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('categories')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeView === 'categories' ? 'text-[#C89D7C] font-semibold' : 'text-[#1E1116]/65'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Categories</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView('track')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeView === 'track' ? 'text-[#C89D7C] font-semibold' : 'text-[#1E1116]/65'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Track Order</span>
        </button>

        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            currentCustomer ? 'text-[#C89D7C] font-semibold' : 'text-[#1E1116]/65'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap truncate max-w-[64px]">
            {currentCustomer ? currentCustomer.fullName.split(' ')[0] : 'Account'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center min-h-[44px] text-[#1E1116]/65"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 whitespace-nowrap">Cart</span>
          {cartCount > 0 && (
            <span className="absolute top-1 right-4 min-w-[15px] h-[15px] px-1 rounded-full bg-[#C89D7C] text-white text-[9px] font-mono-num font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </nav>
    </>
  );
};
