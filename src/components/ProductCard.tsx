import React from 'react';
import { Heart, Plus } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { addToCart, wishlist, toggleWishlist, setIsCartOpen } = useStore();
  const isWishlisted = wishlist.includes(product.id);
  const coverImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : '/src/assets/images/hero_luxury_cosmetics_1794222186679.jpg';

  const primaryBadge =
    !product.inStock
      ? 'Sold Out'
      : product.discountPercent > 0
      ? `${product.discountPercent}% OFF`
      : product.badges && product.badges.length > 0
      ? product.badges[0]
      : null;

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
            referrerPolicy="no-referrer"
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
            onClick={() => {
              addToCart(product, 1);
              setIsCartOpen(true);
            }}
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
