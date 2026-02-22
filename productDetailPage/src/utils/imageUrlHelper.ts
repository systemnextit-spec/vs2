/**
 * Normalizes image URLs to use current domain or production domain
 * Simplified version for productDetailPage
 */

const PRODUCTION_URL = 'https://allinbangla.com';

const stripWrappingQuotes = (value: string): string => {
  const v = value.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1).trim();
  }
  return v;
};

const normalizeDataUrl = (value: string): string => {
  const v = stripWrappingQuotes(value);
  if (!v.toLowerCase().startsWith('data:')) return v;
  
  const match = v.match(/^data:([^,]*),(.*)$/s);
  if (!match) return v;

  const meta = match[1];
  const data = match[2];
  if (/;base64/i.test(meta)) {
    return `data:${meta},${data.replace(/\s+/g, '')}`;
  }
  return v;
};

export interface NormalizeImageUrlOptions {
  disableCDN?: boolean;
}

export const normalizeImageUrl = (url: string | undefined | null, options?: NormalizeImageUrlOptions): string => {
  if (!url) return '';

  const cleaned = stripWrappingQuotes(url);
  if (!cleaned) return '';

  // Data URIs and blob URLs should not be rewritten
  if (cleaned.toLowerCase().startsWith('data:')) return normalizeDataUrl(cleaned);
  if (cleaned.toLowerCase().startsWith('blob:')) return cleaned;

  // CDN URLs
  if (cleaned.includes('cdn.allinbangla.com') || 
      cleaned.includes('images.allinbangla.com') || 
      cleaned.includes('static.allinbangla.com')) {
    return cleaned;
  }

  // Already has domain
  if (cleaned.includes('allinbangla.com')) {
    return cleaned;
  }
  
  // Upload paths
  if (cleaned.startsWith('/uploads')) {
    return `${PRODUCTION_URL}${cleaned}`;
  }
  
  if (cleaned.startsWith('uploads/')) {
    return `${PRODUCTION_URL}/${cleaned}`;
  }
  
  // Replace localhost with production
  if (cleaned.includes('localhost') || cleaned.includes('127.0.0.1')) {
    return cleaned.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, PRODUCTION_URL);
  }
  
  // Already absolute URL
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    return cleaned;
  }
  
  return cleaned;
};

/**
 * Normalizes an array of image URLs
 */
export const normalizeImageUrls = (urls: (string | undefined | null)[] | undefined): string[] => {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.map(url => normalizeImageUrl(url)).filter(Boolean);
};
