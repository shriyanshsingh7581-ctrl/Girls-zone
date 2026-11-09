import React, { useState } from 'react';
import { X, ShoppingBag, Heart, MessageCircle, ShieldCheck, MapPin } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { handleImageFallback, resolveImageUrl } from '../utils/images';
import { buildProductInquiryWhatsAppUrl } from '../utils/commerce';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart, setIsCartOpen, wishlist, toggleWishlist, storeConfig } = useStore();
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const images =
    product.images && product.images.length > 0
      ? product.images.map((url) => resolveImageUrl(url, product.category))
      : [resolveImageUrl(undefined, product.category)];

  const activeVariant =
    selectedVariant || (product.variants && product.variants.length > 0 ? product.variants[0] : '');

  const isWishlisted = wishlist.includes(product.id);

  const waUrl = buildProductInquiryWhatsAppUrl(product, activeVariant || undefined, storeConfig);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      className="fixed inset-0 z-50 bg-[#1E1116]/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
    >
      <div
        className="bg-[#FFFDFB] w-full md:max-w-4xl rounded-t-3xl md:rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#1E1116]/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sheet Grab Handle */}
        <div className="md:hidden w-10 h-1.5 bg-[#1E1116]/20 rounded-full mx-auto mt-3" />

        <div className="p-5 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#FDF6F6] hover:bg-[#1E1116] text-[#1E1116] hover:text-[#FFFDFB] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left: Sticky Product Gallery */}
          <div className="space-y-3">
            <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#FDF6F6] border border-[#1E1116]/8">
              <img
                src={images[selectedImageIdx] || images[0]}
                alt={product.name}
                onError={(e) => handleImageFallback(e, product.category)}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                      idx === selectedImageIdx ? 'border-[#C89D7C]' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} view ${idx + 1}`}
                      onError={(e) => handleImageFallback(e, product.category)}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-[#1E1116]/60">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span>{product.inStock ? `In Stock (${product.stockQuantity} available)` : 'Out of Stock'}</span>
                {product.badges && product.badges.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#C89D7C] font-semibold">{product.badges.join(' / ')}</span>
                  </>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif-luxury font-semibold text-[#1E1116]">
                {product.name}
              </h2>

              <div className="flex items-baseline gap-3 font-mono-num">
                <span className="text-2xl font-bold text-[#1E1116]">₹{product.price}</span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-sm text-[#1E1116]/45 line-through">₹{product.mrp}</span>
                    <span className="text-xs font-semibold text-[#C89D7C]">
                      Save {product.discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Variants / Shades / Sizes Selector */}
              {product.variants && product.variants.length > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-[#1E1116] mb-2">
                    Select Shade / Variant: <span className="text-[#C89D7C]">{activeVariant}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          activeVariant === variant
                            ? 'bg-[#1E1116] text-[#FFFDFB] border-[#1E1116]'
                            : 'bg-[#FDF6F6] text-[#1E1116] border-[#1E1116]/15 hover:border-[#C89D7C]'
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Stepper */}
              <div className="pt-2 flex items-center gap-4">
                <span className="text-xs font-semibold text-[#1E1116]">Quantity</span>
                <div className="inline-flex items-center border border-[#1E1116]/15 rounded-lg bg-[#FDF6F6]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[#1E1116] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-mono-num font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 flex items-center justify-center text-sm font-bold text-[#1E1116] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {product.description && (
                <div className="pt-3 border-t border-[#1E1116]/10">
                  <h3 className="text-xs font-semibold text-[#1E1116] mb-1">Product Details</h3>
                  <p className="text-xs sm:text-sm text-[#1E1116]/75 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-[#1E1116]/10 space-y-1.5 text-xs text-[#1E1116]/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C89D7C] shrink-0" />
                  <span>100% Authentic Guaranteed by Girlz Zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C89D7C] shrink-0" />
                  <span>Available for Home Delivery & Store Pickup at Palegaon, Ambernath</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 mt-6 border-t border-[#1E1116]/10 space-y-2.5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={() => {
                    addToCart(product, quantity, activeVariant || undefined);
                    onClose();
                    setIsCartOpen(true);
                  }}
                  className={`flex-1 py-3 px-5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    product.inStock
                      ? 'bg-[#1E1116] text-[#FFFDFB] hover:bg-[#C89D7C] hover:text-[#1E1116]'
                      : 'bg-[#1E1116]/15 text-[#1E1116]/40 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{product.inStock ? 'Add to Shopping Bag' : 'Currently Out of Stock'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Toggle Wishlist"
                  className="w-11 h-11 rounded-xl border border-[#1E1116]/15 flex items-center justify-center text-[#1E1116] hover:bg-[#FDF6F6] transition-colors cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted ? 'fill-[#C89D7C] text-[#C89D7C]' : 'text-[#1E1116]'
                    }`}
                  />
                </button>
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-[#C89D7C]/50 bg-[#FDF6F6] hover:bg-[#C89D7C]/15 text-[#1E1116] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#C89D7C]" />
                <span>Ask or Order Directly on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
