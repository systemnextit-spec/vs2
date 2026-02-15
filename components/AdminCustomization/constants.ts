import { ColorKey, FooterLinkField, WebsiteConfig } from './types';

// Status colors for badges - matching AdminOrders pattern
export const STATUS_COLORS = {
  Publish: 'text-emerald-600 bg-emerald-50 border border-emerald-200',
  Draft: 'text-amber-600 bg-amber-50 border border-amber-200',
  Trash: 'text-red-600 bg-red-50 border border-red-200',
  Active: 'text-blue-600 bg-blue-50 border border-blue-200',
  Inactive: 'text-gray-600 bg-gray-50 border border-gray-200',
};

export const DEFAULT_COLORS: Record<ColorKey, string> = {
  primary: '#22c55e',
  secondary: '#ec4899',
  tertiary: '#9333ea',
  font: '#0f172a',
  hover: '#f97316',
  surface: '#e2e8f0',
  adminBg: '#030407',
  adminInputBg: '#0f172a',
  adminBorder: '#ffffff',
  adminFocus: '#f87171'
};

export const DEFAULT_WEBSITE_CONFIG: WebsiteConfig = {
  websiteName: '',
  shortDescription: '',
  whatsappNumber: '',
  favicon: null,
  headerLogo: null,
  footerLogo: null,
  addresses: [],
  emails: [],
  phones: [],
  socialLinks: [],
  footerQuickLinks: [],
  footerUsefulLinks: [],
  showMobileHeaderCategory: true,
  showNewsSlider: true,
  headerSliderText: '',
  hideCopyright: false,
  hideCopyrightText: false,
  showPoweredBy: false,
  showFlashSaleCounter: true,
  brandingText: '',
  carouselItems: [],
  campaigns: [],
  popups: [],
  searchHints: '',
  orderLanguage: 'English',
  adminNoticeText: '',
  categorySectionStyle: 'style5'
};

// Demo images for style previews - webp format URLs for each theme section and style
export const THEME_DEMO_IMAGES: Record<string, Record<string, string>> = {
  headerStyle: {
    style1: 'https://hdnfltv.com/image/nitimages/header_-_1.webp',
    style2: 'https://hdnfltv.com/image/nitimages/header-2.webp',
    style3: 'https://hdnfltv.com/image/nitimages/header-3.webp',
    style4: 'https://hdnfltv.com/image/nitimages/header-4.webp',
    style5: 'https://hdnfltv.com/image/nitimages/header_-_5.webp',
  },
  mobileHeaderStyle: {
    style1: 'https://hdnfltv.com/image/nitimages/mobile_header_-_1_1768841563.webp',
    style2: 'https://hdnfltv.com/image/nitimages/mobile_header_2.webp',
    style3: 'https://hdnfltv.com/image/nitimages/mobile_header_3.webp',
    style4: 'https://hdnfltv.com/image/nitimages/mobile_header_4.webp',
    style5: 'https://hdnfltv.com/image/nitimages/mobile_header_5.webp',
  },
  showcaseSectionStyle: {
    style1: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80&fm=webp',
    style2: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80&fm=webp',
    style3: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80&fm=webp',
    style4: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&fm=webp',
    style5: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&fm=webp',
  },
  brandSectionStyle: {
    none: '',
    style1: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80&fm=webp',
    style2: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=1200&q=80&fm=webp',
    style3: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80&fm=webp',
    style4: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=1200&q=80&fm=webp',
    style5: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80&fm=webp',
  },
  categorySectionStyle: {
    none: '',
    style1: 'https://hdnfltv.com/image/nitimages/category_-_1.webp',
    style2: 'https://hdnfltv.com/image/nitimages/category-2.webp',
    style3: 'https://hdnfltv.com/image/nitimages/category_-_3.webp',
    style4: 'https://hdnfltv.com/image/nitimages/category_-_4.webp',
    style5: 'https://hdnfltv.com/image/nitimages/category-5.webp',
  },
  productSectionStyle: {
    style1: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80&fm=webp',
    style2: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&q=80&fm=webp',
    style3: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80&fm=webp',
    style4: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=80&fm=webp',
    style5: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&q=80&fm=webp',
  },
  productCardStyle: {
    style1: 'https://hdnfltv.com/image/nitimages/product_card_-_1.webp',
    style2: 'https://hdnfltv.com/image/nitimages/product_card_-_2.webp',
    style3: 'https://hdnfltv.com/image/nitimages/product_card_-_3.webp',
    style4: 'https://hdnfltv.com/image/nitimages/product_card_-_4.webp',
    style5: 'https://hdnfltv.com/image/nitimages/product_card_-_5.webp',
  },
  footerStyle: {
    style1: 'https://hdnfltv.com/image/nitimages/footer_-_1.webp',
    style2: 'https://hdnfltv.com/image/nitimages/footer_-_2.webp',
    style3: 'https://hdnfltv.com/image/nitimages/footer_-3.webp',
    style4: 'https://hdnfltv.com/image/nitimages/footer_-4_orginal.webp',
    style5: 'https://hdnfltv.com/image/nitimages/footer_5_1768901505.webp',
  },
  bottomNavStyle: {
    style1: 'https://hdnfltv.com/image/nitimages/bottomNav-1.webp',
    style2: 'https://hdnfltv.com/image/nitimages/bottomNav-2.webp',
    style3: 'https://hdnfltv.com/image/nitimages/bottomNav-3.webp',
    style4: 'https://hdnfltv.com/image/nitimages/bottomNav_4.webp',
    style5: 'https://hdnfltv.com/image/nitimages/bottomNav-5.webp',
  },
  // Ready Made Theme preview images
  readyThemes: {
    gadgets1: 'https://hdnfltv.com/image/nitimages/gadgets-theme-1.webp',
    gadgets2: 'https://hdnfltv.com/image/nitimages/gadgets-theme-2.webp',
    gadgets3: 'https://hdnfltv.com/image/nitimages/gadgets-theme-3.webp',
    gadgets4: 'https://hdnfltv.com/image/nitimages/gadgets-theme-4.webp',
    fashion1: 'https://hdnfltv.com/image/nitimages/fashion-theme-1.webp',
    fashion2: 'https://hdnfltv.com/image/nitimages/fashion-theme-2.webp',
    fashion3: 'https://hdnfltv.com/image/nitimages/fashion-theme-3.webp',
    fashion4: 'https://hdnfltv.com/image/nitimages/fashion-theme-4.webp',
    grocery1: 'https://hdnfltv.com/image/nitimages/grocery-theme-1.webp',
    grocery2: 'https://hdnfltv.com/image/nitimages/grocery-theme-2.webp',
    grocery3: 'https://hdnfltv.com/image/nitimages/grocery-theme-3.webp',
    grocery4: 'https://hdnfltv.com/image/nitimages/grocery-theme-4.webp',
    cosmetics1: 'https://hdnfltv.com/image/nitimages/cosmetics-theme-1.webp',
    cosmetics2: 'https://hdnfltv.com/image/nitimages/cosmetics-theme-2.webp',
    cosmetics3: 'https://hdnfltv.com/image/nitimages/cosmetics-theme-3.webp',
    cosmetics4: 'https://hdnfltv.com/image/nitimages/cosmetics-theme-4.webp',
    pharmacy1: 'https://hdnfltv.com/image/nitimages/pharmacy-theme-1.webp',
    pharmacy2: 'https://hdnfltv.com/image/nitimages/pharmacy-theme-2.webp',
    pharmacy3: 'https://hdnfltv.com/image/nitimages/pharmacy-theme-3.webp',
    pharmacy4: 'https://hdnfltv.com/image/nitimages/pharmacy-theme-4.webp',
  },
};

export const SOCIAL_PLATFORM_OPTIONS = [
  'Facebook',
  'Instagram',
  'YouTube',
  'Daraz',
  'Twitter',
  'LinkedIn'
];

export const COLOR_GUIDE_CONFIG: Array<{
  key: ColorKey;
  label: string;
  helper: string;
}> = [
  {
    key: 'primary',
    label: 'Primary Accent',
    helper: 'Sidebar active state, admin CTAs, storefront hero buttons'
  },
  {
    key: 'secondary',
    label: 'Secondary Accent',
    helper: 'Warning chips, checkout highlights, floating badges'
  },
  {
    key: 'tertiary',
    label: 'Depth Accent',
    helper: 'Charts, outlines, subtle gradients'
  },
  {
    key: 'font',
    label: 'Global Font Color',
    helper: 'Header links, footer text, storefront typography'
  }
];

export const FOOTER_LINK_SECTIONS: Array<{
  field: FooterLinkField;
  title: string;
  helper: string;
}> = [
  {
    field: 'footerQuickLinks',
    title: 'Footer Quick Links',
    helper: 'Shown in the Quick Links column of Footer 3'
  },
  {
    field: 'footerUsefulLinks',
    title: 'Footer Useful Links',
    helper: 'Shown in the Useful Links column of Footer 3'
  }
];

export const THEME_VIEW_SECTIONS = [
  { title: 'Header Section', key: 'headerStyle', count: 5 },
  { title: 'Mobile Header', key: 'mobileHeaderStyle', count: 5 },
  {
    title: 'Category Section',
    key: 'categorySectionStyle',
    count: 5,
    hasNone: true,
    hasMobile: true
  },
  { title: 'Product Card', key: 'productCardStyle', count: 5 },
  { title: 'Footer Section', key: 'footerStyle', count: 5 },
  { title: 'Bottom Nav', key: 'bottomNavStyle', count: 5 }
];

export const WEBSITE_INFO_TOGGLES = [
  { key: 'showMobileHeaderCategory', label: 'isShowMobileHeaderCategoryMenu' },
  { key: 'showNewsSlider', label: 'Is Show News Slider' },
  { key: 'hideCopyright', label: 'Hide Copyright Section' },
  { key: 'hideCopyrightText', label: 'Hide Copyright Text' },
  { key: 'showPoweredBy', label: 'Powered by SystemNext IT' }
];

export const LOGO_CONFIG = [
  { refKey: 'logo', configKey: 'logo', name: 'Primary Store Logo (Fallback)' },
  { refKey: 'headerLogo', configKey: 'headerLogo', name: 'Header Logo Override' },
  { refKey: 'footerLogo', configKey: 'footerLogo', name: 'Footer Logo Override' }
] as const;

/**
 * Normalizes a hex color string to proper format
 * Supports 3-digit and 6-digit hex codes
 */
export const normalizeHexColor = (value: string): string => {
  const sanitized = value.trim().replace(/[^0-9a-fA-F]/g, '');
  if (sanitized.length === 3) {
    return `#${sanitized
      .split('')
      .map((c) => `${c}${c}`)
      .join('')
      .toUpperCase()}`;
  }
  if (sanitized.length === 6) {
    return `#${sanitized.toUpperCase()}`;
  }
  return '';
};
