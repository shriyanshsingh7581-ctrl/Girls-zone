import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, ExternalLink, ShieldCheck, Sparkles, Truck, FileText } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onSelectCategory: (catName: string) => void;
  onTrackOrderClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onTrackOrderClick }) => {
  const { categories, storeConfig } = useStore();
  const visibleCategories = categories.filter((c) => c.visible);
  const waClean = storeConfig.whatsappNumber.replace(/\D/g, '') || '918329783642';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${storeConfig.storeName} ${storeConfig.storeAddress}`
  )}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1E1116] text-[#FFFDFB] mt-16 pb-20 md:pb-0">
      {/* Luxury Trust Strip */}
      <div className="border-b border-[#FFFDFB]/10">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-serif-luxury font-semibold text-[#FFFDFB]">
                100% Curated Luxury & Authentic
              </h3>
              <p className="text-xs text-[#FFFDFB]/70 mt-0.5">
                Handpicked cosmetics, skin care, waterproof anti-tarnish jewellery, and signature fragrances.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Truck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-serif-luxury font-semibold text-[#FFFDFB]">
                Live Flipkart-Style Order Tracking
              </h3>
              <p className="text-xs text-[#FFFDFB]/70 mt-0.5">
                Real-time stage updates from Order Placed and Packed to Out for Delivery & Delivered.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-serif-luxury font-semibold text-[#FFFDFB]">
                Ambernath Flagship Boutique
              </h3>
              <p className="text-xs text-[#FFFDFB]/70 mt-0.5">
                Shop online for doorstep delivery or pick up directly from our Palegaon, Ambernath store.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer (Strictly NO Admin Links) */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Column 1: Brand & Story */}
        <div className="space-y-3">
          <h2 className="text-2xl font-serif-luxury font-semibold text-[#FFFDFB]">
            {storeConfig.storeName || 'Girlz Zone'}
          </h2>
          <p className="text-xs text-[#FFFDFB]/70 leading-relaxed">
            {storeConfig.footerTagline ||
              'Your premier destination in Ambernath for luxury cosmetics, beauty essentials, skin care, hair accessories, 18K anti-tarnish jewellery, and fine perfumes.'}
          </p>
        </div>

        {/* Column 2: Official Store Categories */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
            Collections
          </h3>
          <ul className="space-y-2 text-xs text-[#FFFDFB]/80">
            {visibleCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Customer Care */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
            Customer Care
          </h3>
          <ul className="space-y-2 text-xs text-[#FFFDFB]/80">
            <li>
              <button
                type="button"
                onClick={onTrackOrderClick}
                className="hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Track Your Order Live
              </button>
            </li>
            <li>
              <a
                href={`https://wa.me/${waClean}?text=${encodeURIComponent(
                  storeConfig.whatsappGeneralInquiryMessage ||
                    'Hello Girlz Zone! I need assistance with an order.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#D4AF37] transition-colors"
              >
                WhatsApp Order & Support
              </a>
            </li>
            <li className="text-[#FFFDFB]/60">
              Free Delivery on Orders Above ₹{storeConfig.freeDeliveryThreshold}
            </li>
            <li className="text-[#FFFDFB]/60">
              Razorpay UPI, Cards, COD & Store Pickup
            </li>
          </ul>
        </div>

        {/* Column 4: Legal & Policies (Razorpay Compliance) */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Legal & Policies</span>
          </h3>
          <ul className="space-y-2 text-xs text-[#FFFDFB]/80">
            <li>
              <Link
                to="/contact-us"
                onClick={scrollToTop}
                className="hover:text-[#D4AF37] transition-colors inline-block"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/terms-and-conditions"
                onClick={scrollToTop}
                className="hover:text-[#D4AF37] transition-colors inline-block"
              >
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link
                to="/privacy-policy"
                onClick={scrollToTop}
                className="hover:text-[#D4AF37] transition-colors inline-block"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                to="/refund-policy"
                onClick={scrollToTop}
                className="hover:text-[#D4AF37] transition-colors inline-block"
              >
                Refund & Cancellation Policy
              </Link>
            </li>
            <li>
              <Link
                to="/shipping-policy"
                onClick={scrollToTop}
                className="hover:text-[#D4AF37] transition-colors inline-block"
              >
                Shipping & Delivery Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 5: Store Address & WhatsApp */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
            Visit Our Store
          </h3>
          <div className="text-xs text-[#FFFDFB]/80 space-y-2">
            <p className="flex items-start gap-2 leading-relaxed">
              <MapPin className="w-4 h-4 text-[#C89D7C] shrink-0 mt-0.5" />
              <span>{storeConfig.storeAddress}</span>
            </p>
            <p className="flex items-center gap-2 font-mono-num">
              <Phone className="w-4 h-4 text-[#C89D7C] shrink-0" />
              <span>+91 8329783642</span>
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${waClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C89D7C] text-[#1E1116] text-xs font-semibold hover:bg-[#b88b69] transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Us</span>
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#FFFDFB]/20 text-[#FFFDFB] text-xs font-medium hover:bg-[#FFFDFB]/10 transition-colors"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Policy Bar */}
      <div className="border-t border-[#FFFDFB]/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-3 text-[11px] text-[#FFFDFB]/55">
          <p>© {new Date().getFullYear()} Girlz Zone, Ambernath. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[#FFFDFB]/70">
            <Link to="/contact-us" onClick={scrollToTop} className="hover:text-[#D4AF37] transition-colors">
              Contact Us
            </Link>
            <span>•</span>
            <Link to="/terms-and-conditions" onClick={scrollToTop} className="hover:text-[#D4AF37] transition-colors">
              Terms & Conditions
            </Link>
            <span>•</span>
            <Link to="/privacy-policy" onClick={scrollToTop} className="hover:text-[#D4AF37] transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/refund-policy" onClick={scrollToTop} className="hover:text-[#D4AF37] transition-colors">
              Refund Policy
            </Link>
            <span>•</span>
            <Link to="/shipping-policy" onClick={scrollToTop} className="hover:text-[#D4AF37] transition-colors">
              Shipping Policy
            </Link>
          </div>
          <p>Shop no.3, Opp. Concept Arena, Near Smart Bazaar, Palegaon, Ambernath - 421501</p>
        </div>
      </div>
    </footer>
  );
};
