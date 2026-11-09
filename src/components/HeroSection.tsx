import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Crown, Gem } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { handleImageFallback } from '../utils/images';

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
  const template = storeConfig.activeTemplate || 'prestige';

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
  const secondaryBanner =
    activeBanners.length > 1 ? activeBanners[(safeIndex + 1) % activeBanners.length] : activeBanner;

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % activeBanners.length);

  return (
    <section className="w-full" data-testid={`hero-template-${template}`}>
      {/* ===================================================================
          MOBILE CATEGORY NAVIGATION BAR (< 768px) — ADAPTED PER TEMPLATE
         =================================================================== */}
      {template === 'nykaa_luxe' ? (
        /* Template 2 Mobile: Visual Bento Category Cards */
        <div className="md:hidden bg-[#FFFDFB] pt-3 pb-2.5 px-3 border-b border-[#1E1116]/10">
          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => onSelectCategory('ALL')}
              className={`relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border text-left p-2 flex items-end transition-transform ${
                selectedCategory === 'ALL'
                  ? 'border-[#C89D7C] ring-2 ring-[#C89D7C]/40 bg-[#1E1116] text-[#FFFDFB]'
                  : 'border-[#1E1116]/15 bg-[#FDF6F6] text-[#1E1116]'
              }`}
            >
              <div>
                <p className="text-[9px] uppercase tracking-widest opacity-70">All</p>
                <p className="text-xs font-serif-luxury font-bold leading-tight">Luxe</p>
              </div>
            </button>
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className={`relative w-28 h-16 rounded-xl overflow-hidden shrink-0 border text-left transition-transform ${
                    isSelected ? 'border-[#C89D7C] ring-2 ring-[#C89D7C]/50 scale-[1.02]' : 'border-[#1E1116]/10'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    onError={(e) => handleImageFallback(e, cat.name)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E1116]/90 via-[#1E1116]/40 to-transparent" />
                  <span className="relative z-10 block p-2 pt-6 text-[10px] font-semibold text-[#FFFDFB] leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : template === 'parisian_atelier' ? (
        /* Template 3 Mobile: Minimalist Haute Atelier Numbered Tabs */
        <div className="md:hidden bg-[#FFFDFB] py-2.5 px-3 border-b border-[#1E1116]/15">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => onSelectCategory('ALL')}
              className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.15em] border transition-colors shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-[#1E1116] text-[#FFFDFB] border-[#1E1116] font-semibold'
                  : 'bg-[#FFFDFB] text-[#1E1116] border-[#1E1116]/20'
              }`}
            >
              00 · All Collections
            </button>
            {visibleCategories.map((cat, idx) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.name)}
                  className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.12em] border transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-[#1E1116] text-[#FFFDFB] border-[#1E1116] font-semibold'
                      : 'bg-[#FFFDFB] text-[#1E1116] border-[#1E1116]/20'
                  }`}
                >
                  0{idx + 1} · {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      ) : template === 'royal_bridal' ? (
        /* Template 4 Mobile: Royal Arched Medallion Categories */
        <div className="md:hidden bg-[#FFFDFB] pt-3 pb-2.5 px-3 border-b border-[#C89D7C]/30">
          <div className="flex items-start gap-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => onSelectCategory('ALL')}
              className="flex flex-col items-center shrink-0 w-16"
            >
              <div
                className={`w-14 h-16 rounded-t-full rounded-b-lg border-2 flex flex-col items-center justify-center transition-transform ${
                  selectedCategory === 'ALL'
                    ? 'border-[#D4AF37] bg-[#1E1116] text-[#FFFDFB] scale-105'
                    : 'border-[#C89D7C]/40 bg-[#FDF6F6] text-[#1E1116]'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-[#D4AF37] mb-0.5" />
                <span className="font-serif-luxury font-bold text-[10px]">ROYAL</span>
              </div>
              <span className="text-[10px] mt-1 font-semibold text-center leading-tight">
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
                  className="flex flex-col items-center shrink-0 w-16"
                >
                  <div
                    className={`w-14 h-16 rounded-t-full rounded-b-lg p-0.5 border-2 transition-transform overflow-hidden ${
                      isSelected ? 'border-[#D4AF37] scale-105 shadow-sm' : 'border-[#C89D7C]/40'
                    }`}
                  >
                    <img
                      src={cat.image}
                      alt={cat.name}
                      onError={(e) => handleImageFallback(e, cat.name)}
                      className="w-full h-full rounded-t-full rounded-b-md object-cover bg-[#FDF6F6]"
                    />
                  </div>
                  <span
                    className={`text-[10px] mt-1 text-center leading-tight line-clamp-2 ${
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
      ) : (
        /* Template 1 (Default Prestige) Mobile: Instagram-Style Circular Category Bubbles */
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
                      onError={(e) => handleImageFallback(e, cat.name)}
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
      )}

      {/* ===================================================================
          HERO SHOWCASE — 4 DISTINCT DESKTOP & MOBILE ARCHITECTURES
         =================================================================== */}
      {activeBanner && (
        <>
          {template === 'nykaa_luxe' ? (
            /* ---------------------------------------------------------------
               TEMPLATE 2: LUXE BEAUTY BENTO & MAGAZINE (SPLIT-SCREEN BENTO)
               --------------------------------------------------------------- */
            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 md:pt-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                {/* Left Column: High-Impact Magazine Editorial Card */}
                <div className="lg:col-span-5 bg-[#FDF6F6] border border-[#C89D7C]/35 rounded-2xl p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1E1116] text-[#FFFDFB] text-[10px] font-semibold tracking-[0.18em] uppercase">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>{activeBanner.offerBadge || 'LUXE BEAUTY EDIT'}</span>
                    </div>

                    <h1
                      className="text-2xl sm:text-4xl font-serif-luxury font-bold text-[#1E1116] leading-[1.12]"
                      style={{ textWrap: 'balance' }}
                    >
                      {activeBanner.title}
                    </h1>

                    <p className="text-xs sm:text-sm text-[#1E1116]/75 leading-relaxed">
                      {activeBanner.subtitle}
                    </p>
                  </div>

                  <div className="pt-6 space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onExploreClick(activeBanner.ctaCategory)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E1116] text-[#FFFDFB] hover:bg-[#C89D7C] hover:text-[#1E1116] font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                      >
                        <span>{activeBanner.ctaText || 'Explore Collection'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {activeBanners.length > 1 && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={prevSlide}
                            aria-label="Previous slide"
                            className="w-9 h-9 rounded-xl border border-[#1E1116]/15 flex items-center justify-center text-[#1E1116] hover:bg-[#FFFDFB] cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={nextSlide}
                            aria-label="Next slide"
                            className="w-9 h-9 rounded-xl border border-[#1E1116]/15 flex items-center justify-center text-[#1E1116] hover:bg-[#FFFDFB] cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Mini Category Pill Selector inside Bento */}
                    <div className="pt-4 border-t border-[#1E1116]/10 flex items-center justify-between text-[11px] text-[#1E1116]/70">
                      <span>Ambernath Flagship Store</span>
                      <span className="font-mono-num font-semibold text-[#C89D7C]">
                        Free Delivery ₹{storeConfig.freeDeliveryThreshold}+
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Main Visual Frame + Secondary Bento Tile */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-8 relative rounded-2xl overflow-hidden bg-[#1E1116] min-h-[260px] sm:min-h-[360px]">
                    <img
                      src={activeBanner.image}
                      alt={activeBanner.title}
                      onError={(e) => handleImageFallback(e, activeBanner.ctaCategory)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E1116]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[#FFFDFB]">
                      <span className="text-xs font-serif-luxury italic">
                        {activeBanner.ctaCategory}
                      </span>
                      <span className="text-[11px] font-mono-num px-2.5 py-0.5 rounded bg-[#1E1116]/75 text-[#D4AF37]">
                        0{safeIndex + 1} / 0{activeBanners.length}
                      </span>
                    </div>
                  </div>

                  {/* Secondary Side Bento Stack */}
                  <div className="sm:col-span-4 flex flex-col gap-4">
                    {secondaryBanner && (
                      <button
                        type="button"
                        onClick={() => onExploreClick(secondaryBanner.ctaCategory)}
                        className="relative flex-1 min-h-[160px] rounded-2xl overflow-hidden bg-[#1E1116] text-left group cursor-pointer"
                      >
                        <img
                          src={secondaryBanner.image}
                          alt={secondaryBanner.title}
                          onError={(e) => handleImageFallback(e, secondaryBanner.ctaCategory)}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1116]/90 via-[#1E1116]/30 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3 text-[#FFFDFB]">
                          <p className="text-[10px] text-[#D4AF37] uppercase tracking-wider">
                            Spotlight
                          </p>
                          <p className="text-xs font-serif-luxury font-semibold line-clamp-2 mt-0.5">
                            {secondaryBanner.ctaCategory}
                          </p>
                        </div>
                      </button>
                    )}

                    <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#C89D7C]/35 flex flex-col justify-between">
                      <Gem className="w-5 h-5 text-[#C89D7C]" />
                      <div className="mt-2">
                        <p className="text-xs font-serif-luxury font-bold text-[#1E1116]">
                          100% Authentic Beauty & 18K Anti-Tarnish
                        </p>
                        <p className="text-[11px] text-[#1E1116]/65 mt-0.5">
                          Curated daily at Girlz Zone, Palegaon.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : template === 'parisian_atelier' ? (
            /* ---------------------------------------------------------------
               TEMPLATE 3: PARISIAN HAUTE ATELIER (CENTERED EDITORIAL LOOKBOOK)
               --------------------------------------------------------------- */
            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-10">
              <div className="border border-[#1E1116]/20 bg-[#FFFDFB] p-5 sm:p-8 md:p-12">
                <div className="text-center max-w-3xl mx-auto space-y-3 pb-6 md:pb-8 border-b border-[#1E1116]/15">
                  <p className="text-[11px] tracking-[0.3em] uppercase text-[#C89D7C] font-semibold">
                    {activeBanner.offerBadge || 'MAISON GIRLZ ZONE · AMBERNATH'}
                  </p>
                  <h1
                    className="text-3xl sm:text-5xl font-serif-luxury font-normal tracking-tight text-[#1E1116] leading-[1.08]"
                    style={{ textWrap: 'balance' }}
                  >
                    {activeBanner.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#1E1116]/70 max-w-xl mx-auto leading-relaxed">
                    {activeBanner.subtitle}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => onExploreClick(activeBanner.ctaCategory)}
                      className="px-7 py-3 bg-[#1E1116] text-[#FFFDFB] text-xs uppercase tracking-[0.2em] font-semibold hover:bg-[#C89D7C] hover:text-[#1E1116] transition-colors cursor-pointer"
                    >
                      {activeBanner.ctaText || 'Discover Atelier'}
                    </button>
                    {activeBanners.length > 1 && (
                      <button
                        type="button"
                        onClick={nextSlide}
                        className="px-4 py-3 border border-[#1E1116]/25 text-xs uppercase tracking-[0.15em] text-[#1E1116] hover:bg-[#FDF6F6] cursor-pointer"
                      >
                        Next Look ({safeIndex + 1}/{activeBanners.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Dual Lookbook Visual Frames */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 md:pt-8">
                  <div className="relative aspect-[16/10] bg-[#FDF6F6] overflow-hidden border border-[#1E1116]/10">
                    <img
                      src={activeBanner.image}
                      alt={activeBanner.title}
                      onError={(e) => handleImageFallback(e, activeBanner.ctaCategory)}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#FFFDFB]/90 text-[#1E1116] text-[10px] uppercase tracking-[0.18em] font-semibold">
                      Look I · {activeBanner.ctaCategory}
                    </span>
                  </div>
                  {secondaryBanner && (
                    <div
                      onClick={() => onExploreClick(secondaryBanner.ctaCategory)}
                      className="hidden md:block relative aspect-[16/10] bg-[#FDF6F6] overflow-hidden border border-[#1E1116]/10 cursor-pointer group"
                    >
                      <img
                        src={secondaryBanner.image}
                        alt={secondaryBanner.title}
                        onError={(e) => handleImageFallback(e, secondaryBanner.ctaCategory)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#FFFDFB]/90 text-[#1E1116] text-[10px] uppercase tracking-[0.18em] font-semibold">
                        Look II · {secondaryBanner.ctaCategory}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : template === 'royal_bridal' ? (
            /* ---------------------------------------------------------------
               TEMPLATE 4: ROYAL JEWELLERY & BRIDAL BOUTIQUE (ARCHED PALACE)
               --------------------------------------------------------------- */
            <div className="max-w-7xl mx-auto px-4 md:px-6 pt-4 md:pt-6">
              <div className="rounded-3xl bg-[#FDF6F6] border-2 border-[#C89D7C]/45 p-5 sm:p-8 md:p-12 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left Royal Crest & Typography */}
                  <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#C89D7C]/50 bg-[#FFFDFB] text-xs font-semibold text-[#C89D7C]">
                      <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>{activeBanner.offerBadge || 'ROYAL BRIDAL & JEWELLERY BOUTIQUE'}</span>
                    </div>

                    <h1
                      className="text-3xl sm:text-4xl md:text-5xl font-serif-luxury font-bold text-[#1E1116] leading-[1.12]"
                      style={{ textWrap: 'balance' }}
                    >
                      {activeBanner.title}
                    </h1>

                    <p className="text-xs sm:text-sm md:text-base text-[#1E1116]/75 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                      {activeBanner.subtitle}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                      <button
                        type="button"
                        onClick={() => onExploreClick(activeBanner.ctaCategory)}
                        className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#1E1116] text-[#FFFDFB] hover:bg-[#C89D7C] hover:text-[#1E1116] text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-sm"
                      >
                        <span>{activeBanner.ctaText || 'Explore Royal Collection'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      {activeBanners.length > 1 && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={prevSlide}
                            aria-label="Previous slide"
                            className="w-10 h-10 rounded-full border border-[#C89D7C]/50 bg-[#FFFDFB] flex items-center justify-center text-[#1E1116] cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={nextSlide}
                            aria-label="Next slide"
                            className="w-10 h-10 rounded-full border border-[#C89D7C]/50 bg-[#FFFDFB] flex items-center justify-center text-[#1E1116] cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Grand Arched Window Frame */}
                  <div className="lg:col-span-5 flex justify-center">
                    <div className="relative w-full max-w-sm aspect-[4/5] rounded-t-full rounded-b-2xl p-2 border-2 border-[#D4AF37]/60 bg-[#FFFDFB] shadow-md">
                      <div className="w-full h-full rounded-t-full rounded-b-xl overflow-hidden bg-[#1E1116] relative">
                        <img
                          src={activeBanner.image}
                          alt={activeBanner.title}
                          onError={(e) => handleImageFallback(e, activeBanner.ctaCategory)}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1116]/70 via-transparent to-transparent" />
                        <div className="absolute bottom-3 inset-x-4 text-center text-[#FFFDFB]">
                          <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37]">
                            {activeBanner.ctaCategory}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ---------------------------------------------------------------
               TEMPLATE 1 (DEFAULT): PRESTIGE EDITORIAL CLASSIC
               --------------------------------------------------------------- */
            <div className="relative max-w-7xl mx-auto md:px-6 md:pt-6">
              <div className="relative overflow-hidden md:rounded-2xl bg-[#1E1116] min-h-[300px] sm:min-h-[380px] md:min-h-[460px] flex items-end md:items-center">
                <img
                  src={activeBanner.image}
                  alt={activeBanner.title}
                  onError={(e) => handleImageFallback(e, activeBanner.ctaCategory)}
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
                        onClick={prevSlide}
                        aria-label="Previous slide"
                        className="w-10 h-10 rounded-full bg-[#FFFDFB]/15 hover:bg-[#FFFDFB]/30 backdrop-blur-sm text-[#FFFDFB] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={nextSlide}
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
        </>
      )}

      {/* Optional Custom Welcome / Notice Strip (Toggleable from Admin Message Control) */}
      {storeConfig.welcomeBannerActive && storeConfig.welcomeBannerText && (
        <div className="max-w-7xl mx-auto px-4 md:px-6 mt-4">
          <div className="bg-[#FFFDFB] border border-[#C89D7C]/40 rounded-xl px-5 py-3 flex items-center justify-between gap-3 shadow-xs">
            <p className="text-xs sm:text-sm font-medium text-[#1E1116]">
              {storeConfig.welcomeBannerText}
            </p>
            <span className="text-[11px] font-semibold text-[#C89D7C] shrink-0">
              {storeConfig.storeName}
            </span>
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
              Limited-time privilege at {storeConfig.storeName}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
