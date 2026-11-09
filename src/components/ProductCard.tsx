import React from 'react';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { handleImageFallback, resolveImageUrl } from '../utils/images';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, wishlist, toggleWishlist, setIsCartOpen, storeConfig } = useStore();
  const isWishlisted = wishlist.includes(product.id);
  const coverImage = resolveImageUrl(product.images?.[0], product.category);
  const template = storeConfig.activeTemplate || 'prestige';

  const primaryBadge = !product.inStock
    ? 'Sold Out'
    : product.discountPercent > 0
    ? `${product.discountPercent}% OFF`
    : product.badges && product.badges.length > 0
    ? product.badges[0]
    : null;

  const handleQuickAdd = () => {
    if (!product.inStock) return;
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  /* =====================================================================
     TEMPLATE 2: LUXE BEAUTY BENTO & MAGAZINE (FULL-WIDTH BOTTOM CTA BAR)
     ===================================================================== */
  if (template === 'nykaa_luxe') {
    return (
      <div className="group bg-[#FFFDFB] border border-[#1E1116]/12 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div>
          <div className="relative aspect-[4/5] w-full bg-[#FDF6F6] overflow-hidden">
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="w-full h-full block text-left cursor-pointer"
            >
              <img
                src={coverImage}
                alt={product.name}
                loading="lazy"
                onError={(e) => handleImageFallback(e, product.category)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </button>

            {primaryBadge && (
              <span
                className={`absolute top-2.5 left-2.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md ${
                  !product.inStock
                    ? 'bg-[#1E1116]/85 text-[#FFFDFB]'
                    : 'bg-[#1E1116] text-[#D4AF37]'
                }`}
              >
                {primaryBadge}
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              aria-label={`Wishlist ${product.name}`}
              className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[#FFFDFB]/90 flex items-center justify-center text-[#1E1116] cursor-pointer shadow-xs"
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? 'fill-[#C89D7C] text-[#C89D7C]' : 'text-[#1E1116]/75'
                }`}
              />
            </button>
          </div>

          <div className="p-3.5 space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-[#C89D7C] font-semibold truncate">
              {product.category}
            </p>
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="text-sm font-semibold text-[#1E1116] line-clamp-1 hover:text-[#C89D7C] text-left cursor-pointer"
            >
              {product.name}
            </button>
            <div className="pt-1 flex items-baseline gap-2 font-mono-num">
              <span className="text-base font-bold text-[#1E1116]">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-xs text-[#1E1116]/45 line-through">₹{product.mrp}</span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!product.inStock}
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to bag`}
          className={`w-full py-2.5 px-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 border-t transition-colors cursor-pointer ${
            product.inStock
              ? 'bg-[#1E1116] text-[#FFFDFB] hover:bg-[#C89D7C] hover:text-[#1E1116] border-[#1E1116]'
              : 'bg-[#FDF6F6] text-[#1E1116]/40 border-[#1E1116]/10 cursor-not-allowed'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{product.inStock ? 'Add to Bag' : 'Out of Stock'}</span>
        </button>
      </div>
    );
  }

  /* =====================================================================
     TEMPLATE 3: PARISIAN HAUTE ATELIER (1:1 SQUARE MINIMALIST GALLERY)
     ===================================================================== */
  if (template === 'parisian_atelier') {
    return (
      <div className="group bg-[#FFFDFB] border border-[#1E1116]/15 p-3 flex flex-col justify-between transition-all duration-200 hover:border-[#C89D7C]">
        <div>
          <div className="relative aspect-square w-full bg-[#FDF6F6] overflow-hidden border border-[#1E1116]/8">
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="w-full h-full block cursor-pointer"
            >
              <img
                src={coverImage}
                alt={product.name}
                loading="lazy"
                onError={(e) => handleImageFallback(e, product.category)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
            </button>

            {primaryBadge && (
              <span className="absolute top-2 left-2 text-[10px] uppercase tracking-[0.15em] font-semibold px-2 py-0.5 bg-[#FFFDFB]/95 text-[#1E1116] border border-[#1E1116]/15">
                {primaryBadge}
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              aria-label={`Wishlist ${product.name}`}
              className="absolute top-2 right-2 w-8 h-8 bg-[#FFFDFB]/90 flex items-center justify-center text-[#1E1116] cursor-pointer"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isWishlisted ? 'fill-[#C89D7C] text-[#C89D7C]' : 'text-[#1E1116]/75'
                }`}
              />
            </button>
          </div>

          <div className="pt-3.5 pb-2 text-center space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#1E1116]/55 truncate">
              {product.category}
            </p>
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="text-sm sm:text-base font-serif-luxury font-semibold text-[#1E1116] line-clamp-1 hover:text-[#C89D7C] cursor-pointer mx-auto block"
            >
              {product.name}
            </button>
            <div className="flex items-center justify-center gap-2 font-mono-num pt-0.5">
              <span className="text-sm font-bold text-[#1E1116]">₹{product.price}</span>
              {product.mrp > product.price && (
                <span className="text-xs text-[#1E1116]/45 line-through">₹{product.mrp}</span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!product.inStock}
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to bag`}
          className={`w-full py-2 text-[11px] uppercase tracking-[0.16em] font-semibold border transition-colors cursor-pointer ${
            product.inStock
              ? 'border-[#1E1116] text-[#1E1116] hover:bg-[#1E1116] hover:text-[#FFFDFB]'
              : 'border-[#1E1116]/15 text-[#1E1116]/35 cursor-not-allowed'
          }`}
        >
          {product.inStock ? '+ Add to Bag' : 'Sold Out'}
        </button>
      </div>
    );
  }

  /* =====================================================================
     TEMPLATE 4: ROYAL JEWELLERY & BRIDAL BOUTIQUE (ARCHED PALACE CARD)
     ===================================================================== */
  if (template === 'royal_bridal') {
    return (
      <div className="group bg-[#FFFDFB] border-2 border-[#C89D7C]/40 rounded-t-[2.25rem] rounded-b-2xl p-2.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div>
          <div className="relative aspect-[4/5] w-full rounded-t-[1.85rem] rounded-b-xl bg-[#FDF6F6] overflow-hidden border border-[#D4AF37]/40">
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="w-full h-full block cursor-pointer"
            >
              <img
                src={coverImage}
                alt={product.name}
                loading="lazy"
                onError={(e) => handleImageFallback(e, product.category)}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
              />
            </button>

            {primaryBadge && (
              <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#1E1116]/90 text-[#D4AF37] border border-[#D4AF37]/40">
                {primaryBadge}
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              }}
              aria-label={`Wishlist ${product.name}`}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FFFDFB]/90 border border-[#C89D7C]/40 flex items-center justify-center text-[#1E1116] cursor-pointer"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isWishlisted ? 'fill-[#C89D7C] text-[#C89D7C]' : 'text-[#1E1116]/75'
                }`}
              />
            </button>
          </div>

          <div className="pt-3 px-1 text-center space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-[#C89D7C] font-semibold truncate">
              {product.category}
            </p>
            <button
              type="button"
              onClick={() => onSelect(product)}
              className="text-sm sm:text-base font-serif-luxury font-bold text-[#1E1116] line-clamp-1 hover:text-[#C89D7C] cursor-pointer mx-auto block"
            >
              {product.name}
            </button>
          </div>
        </div>

        <div className="pt-2.5 px-1 flex items-center justify-between gap-2 border-t border-[#C89D7C]/20 mt-2">
          <div className="flex items-baseline gap-1.5 font-mono-num">
            <span className="text-sm sm:text-[15px] font-bold text-[#1E1116]">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-[#1E1116]/45 line-through">₹{product.mrp}</span>
            )}
          </div>

          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to bag`}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              product.inStock
                ? 'bg-[#1E1116] text-[#FFFDFB] hover:bg-[#C89D7C] hover:text-[#1E1116]'
                : 'bg-[#1E1116]/10 text-[#1E1116]/40 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{product.inStock ? 'Add' : 'Out'}</span>
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================================
     TEMPLATE 1 (DEFAULT): PRESTIGE EDITORIAL CLASSIC (4:5 PORTRAIT CARD)
     ===================================================================== */
  return (
    <div className="group bg-[#FFFDFB] border border-[#1E1116]/8 rounded-xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Product Image Container (4:5 aspect ratio) */}
      <div className="relative aspect-[4/5] w-full bg-[#FDF6F6] overflow-hidden">
        <button
          type="button"
          onClick={() => onSelect(product)}
          className="w-full h-full block text-left cursor-pointer"
        >
          <img
            src={coverImage}
            alt={product.name}
            loading="lazy"
            onError={(e) => handleImageFallback(e, product.category)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </button>

        {/* Single Subtle Top-Left Kicker Tag */}
        {primaryBadge && (
          <span
            className={`absolute top-2.5 left-2.5 text-[11px] font-semibold px-2 py-0.5 rounded ${
              !product.inStock
                ? 'bg-[#1E1116]/80 text-[#FFFDFB]'
                : 'bg-[#FFFDFB]/90 text-[#1E1116] backdrop-blur-sm'
            }`}
          >
            {primaryBadge}
          </span>
        )}

        {/* Wishlist Heart Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={`Wishlist ${product.name}`}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-[#FFFDFB]/85 backdrop-blur-sm flex items-center justify-center text-[#1E1116] hover:bg-[#FFFDFB] transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${
              isWishlisted ? 'fill-[#C89D7C] text-[#C89D7C]' : 'text-[#1E1116]/75'
            }`}
          />
        </button>
      </div>

      {/* Contiguous Product Metadata & 1-Tap Add Button */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2">
        <div>
          <p className="text-[11px] text-[#1E1116]/55 truncate">
            {product.category}
            {product.bestseller ? ' · Bestseller' : ''}
          </p>
          <button
            type="button"
            onClick={() => onSelect(product)}
            className="mt-0.5 text-sm sm:text-base font-semibold text-[#1E1116] line-clamp-1 hover:text-[#C89D7C] transition-colors text-left cursor-pointer"
          >
            {product.name}
          </button>
        </div>

        <div className="pt-1 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 font-mono-num">
            <span className="text-sm sm:text-[15px] font-bold text-[#1E1116]">
              ₹{product.price}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-[#1E1116]/45 line-through">₹{product.mrp}</span>
            )}
          </div>

          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to bag`}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              product.inStock
                ? 'bg-[#1E1116] text-[#FFFDFB] hover:bg-[#C89D7C] hover:text-[#1E1116]'
                : 'bg-[#1E1116]/10 text-[#1E1116]/40 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{product.inStock ? 'Add' : 'Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
