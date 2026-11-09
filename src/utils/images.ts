import heroCosmeticsImg from '../assets/images/hero_luxury_cosmetics_1794222186679.jpg';
import heroJewelleryImg from '../assets/images/hero_antitarnish_jewellery_1794222187158.jpg';
import heroFragranceImg from '../assets/images/hero_signature_fragrance_1794222187995.jpg';
import editorialBoutiqueImg from '../assets/images/editorial_ambernath_boutique_1794222188927.jpg';

export const BUNDLED_IMAGES = {
  cosmetics: heroCosmeticsImg,
  jewellery: heroJewelleryImg,
  fragrance: heroFragranceImg,
  boutique: editorialBoutiqueImg,
};

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'Cosmetic Products': heroCosmeticsImg,
  'Beauty Products': editorialBoutiqueImg,
  'Skin Care': heroCosmeticsImg,
  'Hair Care': editorialBoutiqueImg,
  'Hair Accessories': heroJewelleryImg,
  'Anti Tarnish Jewellery': heroJewelleryImg,
  'Deo And Perfume': heroFragranceImg,
};

/**
 * Resolves any stored image URL so that:
 * 1. Legacy `/src/assets/images/...` paths stored in Firebase work on Vercel production builds (`dist/assets/...`).
 * 2. Insecure `http://res.cloudinary.com` links are upgraded to `https://`.
 * 3. Google Drive share URLs are converted to direct viewable URLs.
 * 4. Empty or invalid URLs fall back to the category's bundled luxury asset.
 */
export function resolveImageUrl(rawUrl?: string | null, category?: string): string {
  const fallback =
    (category && CATEGORY_FALLBACK_IMAGES[category]) || BUNDLED_IMAGES.cosmetics;

  if (!rawUrl || typeof rawUrl !== 'string') {
    return fallback;
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return fallback;
  }

  // Map any `/src/assets/images/...` reference to Vite's bundled asset URL for Vercel
  if (trimmed.includes('hero_luxury_cosmetics')) {
    return BUNDLED_IMAGES.cosmetics;
  }
  if (trimmed.includes('hero_antitarnish_jewellery')) {
    return BUNDLED_IMAGES.jewellery;
  }
  if (trimmed.includes('hero_signature_fragrance')) {
    return BUNDLED_IMAGES.fragrance;
  }
  if (trimmed.includes('editorial_ambernath_boutique')) {
    return BUNDLED_IMAGES.boutique;
  }
  if (trimmed.startsWith('/src/assets/')) {
    return fallback;
  }

  // Ensure HTTPS for Cloudinary URLs on Vercel
  if (trimmed.startsWith('http://res.cloudinary.com/')) {
    return trimmed.replace('http://', 'https://');
  }

  // Support Google Drive share links if pasted by admin
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  return trimmed;
}

/**
 * Fallback handler for `<img>` onError so broken icons never render on Vercel.
 */
export function handleImageFallback(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  category?: string
): void {
  const target = e.currentTarget;
  const fallback =
    (category && CATEGORY_FALLBACK_IMAGES[category]) || BUNDLED_IMAGES.cosmetics;
  if (target.src !== fallback && !target.dataset.fallbackApplied) {
    target.dataset.fallbackApplied = 'true';
    target.src = fallback;
  }
}
