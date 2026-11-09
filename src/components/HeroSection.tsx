import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeroSectionProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
  onExploreClick: (categoryName?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedCategory,
  onSelectCategory,
  onExploreClick,
}) => {
  const { categories, banners, storeConfig } = useStore();
  const activeBanners = banners.filter((b) => b.active);
  const visibleCategories = categories.filter((c) => c.visible);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const safeIndex = activeBanners.length > 0 ? currentSlide % activeBanners.length : 0;
  const activeBanner = activeBanners[safeIndex];

  return (
    <section className="w-full">
      {/* Mobile Instagram-Style Horizontal Swipeable Circular Category Bubbles */}
      <div className="md:hidden bg-[#FFFDFB] pt-3 pb-2 px-3 border-b border-[#1E1116]/5">
        <div className="flex items-start gap-3.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => onSelectCategory('ALL')}
            className="flex flex-col items-center shrink-0 w-16 group"
          >
            <div
              className={`w-14 h-14 rounded-full p-0.5 transition-transform ${
                selectedCategory === 'ALL'
                  ? 'bg-gradient-to-tr from-[#C89D7C] to-[#D4AF37] scale-105'
                  : 'bg-[#1E1116]/15'
              }`}
            >
              <div className="w-full h-full rounded-full bg-[#FDF6F6] flex items-center justify-center text-[#1E1116] font-serif-luxury font-bold text-xs">
                ALL
              </div>
            </div>
            <span
              className={`text-[10px] mt-1.5 text-center leading-tight line-clamp-2 ${
                selectedCategory === 'ALL' ? 'font-bold text-[#1E1116]' : 'text-[#1E1116]/75'
              }`}
            >
              All Luxe
            </span>
          </button>

          {visibleCategories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.name)}
                className="flex flex-col items-center shrink-0 w-16 group"
              >
                <div
                  className={`w-14 h-14 rounded-full p-0.5 transition-transform ${
                    isSelected
                      ? 'bg-gradient-to-tr from-[#C89D7C] to-[#D4AF37] scale-105'
                      : 'bg-[#C89D7C]/30'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover bg-[#FDF6F6]"
                  />
                </div>
                <span
                  className={`text-[10px] mt-1.5 text-center leading-tight line-clamp-2 ${
                    isSelected ? 'font-bold text-[#1E1116]' : 'text-[#1E1116]/75'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero Banner Carousel */}
      {activeBanner && (
        <div className="relative max-w-7xl mx-auto md:px-6 md:pt-6">
          <div className="relative overflow-hidden md:rounded-2xl bg-[#1E1116] min-h-[300px] sm:min-h-[380px] md:min-h-[460px] flex items-end md:items-center">
            <img
              src={activeBanner.image}
              alt={activeBanner.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-85 transition-opacity duration-500"
            />
            {/* Measured Contrast Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E1116]/90 via-[#1E1116]/50 to-transparent md:bg-gradient-to-r md:from-[#1E1116]/85 md:via-[#1E1116]/45 md:to-transparent" />

            <div className="relative z-10 w-full md:max-w-2xl p-6 sm:p-10 md:p-14 text-[#FFFDFB]">
              {activeBanner.offerBadge && (
                <p className="text-xs tracking-[0.2em] text-[#D4AF37] font-semibold mb-2">
                  {activeBanner.offerBadge}
                </p>
              )}
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-serif-luxury font-semibold leading-[1.12] text-[#FFFDFB] mb-3"
                style={{ textWrap: 'balance' }}
              >
                {activeBanner.title}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[#FFFDFB]/85 max-w-xl mb-6 leading-relaxed">
                {activeBanner.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onExploreClick(activeBanner.ctaCategory)}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#C89D7C] hover:bg-[#b88b69] text-[#1E1116] font-semibold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{activeBanner.ctaText || 'Explore Collection'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carousel Controls */}
            {activeBanners.length > 1 && (
              <>
                <div className="hidden md:flex items-center gap-2 absolute bottom-6 right-8 z-20">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentSlide(
                        (prev) => (prev - 1 + activeBanners.length) % activeBanners.length
                      )
                    }
                    aria-label="Previous slide"
                    className="w-10 h-10 rounded-full bg-[#FFFDFB]/15 hover:bg-[#FFFDFB]/30 backdrop-blur-sm text-[#FFFDFB] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)}
                    aria-label="Next slide"
                    className="w-10 h-10 rounded-full bg-[#FFFDFB]/15 hover:bg-[#FFFDFB]/30 backdrop-blur-sm text-[#FFFDFB] flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Slide Indicator Dots */}
                <div className="absolute bottom-3 left-6 md:bottom-6 md:left-14 flex items-center gap-2 z-20">
                  {activeBanners.map((b, idx) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === safeIndex ? 'w-7 bg-[#D4AF37]' : 'w-2 bg-[#FFFDFB]/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Optional Flash Sale Highlight Banner (Toggleable from Admin) */}
      {storeConfig.flashSaleActive && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-4">
          <div className="bg-[#FDF6F6] border border-[#C89D7C]/35 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C89D7C] shrink-0" />
              <p className="text-xs sm:text-sm font-semibold text-[#1E1116]">
                {storeConfig.flashSaleTitle}
              </p>
            </div>
            <span className="text-xs text-[#1E1116]/70">
              Limited-time privilege at Girlz Zone Ambernath
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
