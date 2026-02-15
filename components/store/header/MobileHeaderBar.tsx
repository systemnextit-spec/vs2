import React from 'react';
import { ShoppingCart, Heart, User, Search, Menu, ChevronDown, Grid } from 'lucide-react';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';
import type { WebsiteConfig } from '../../../types';

interface MobileHeaderBarProps {
  resolvedHeaderLogo: string | null;
  logoKey: string;
  onHomeClick?: () => void;
  wishlistBadgeCount: number;
  cartBadgeCount: number;
  onWishlistOpen: () => void;
  onCartOpen: () => void;
  onAccountClick?: () => void;
  onMenuOpen: () => void;
  onSearchOpen: () => void;
  websiteConfig?: WebsiteConfig;
}

// Style 1: Default - Clean modern with frosted glass effect
const MobileHeaderStyle1: React.FC<MobileHeaderBarProps> = ({
  resolvedHeaderLogo, logoKey, onHomeClick, wishlistBadgeCount, cartBadgeCount,
  onWishlistOpen, onCartOpen, onAccountClick, onMenuOpen, onSearchOpen, websiteConfig
}) => (
  <header className="md:hidden bg-white/95 backdrop-blur-md px-3 py-2.5 border-b border-gray-100/60 mobile-header-refined to p-0 z-50">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button type="button" className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50/80 active:scale-95 transition-all duration-200" onClick={onMenuOpen} aria-label="Open menu">
          <Menu size={21} strokeWidth={1.8} />
        </button>
        <button type="button" className="flex items-center group" onClick={onHomeClick}>
          {resolvedHeaderLogo ? (
            <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Store logo'} width={120} height={32} className="h-8 max-w-[120px] object-contain transition-all duration-300 group-active:scale-95" />
          ) : (
            <h1 className="text-lg font-black tracking-tight text-theme-primary">{websiteConfig?.websiteName || 'My Store'}</h1>
          )}
        </button>
      </div>
      <div className="flex items-center gap-0.5">
        <button type="button" className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50/80 active:scale-95 transition-all duration-200" onClick={onSearchOpen} aria-label="Search"><Search size={20} strokeWidth={1.8} /></button>
        <button type="button" className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50/80 active:scale-95 transition-all duration-200" onClick={onWishlistOpen} aria-label="Wishlist">
          <Heart size={20} strokeWidth={1.8} />
          {wishlistBadgeCount > 0 && <span className="absolute top-1 right-1 bg-theme-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">{wishlistBadgeCount > 9 ? '9+' : wishlistBadgeCount}</span>}
        </button>
        <button type="button" className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50/80 active:scale-95 transition-all duration-200" onClick={onCartOpen} aria-label="Cart">
          <ShoppingCart size={20} strokeWidth={1.8} />
          {cartBadgeCount > 0 && <span className="absolute top-1 right-1 bg-theme-primary text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm">{cartBadgeCount > 9 ? '9+' : cartBadgeCount}</span>}
        </button>
        <button type="button" className="relative w-10 h-10 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50/80 active:scale-95 transition-all duration-200" onClick={onAccountClick} aria-label="Account"><User size={20} strokeWidth={1.8} /></button>
      </div>
    </div>
  </header>
);

// Style 2: Compact - Minimal with centered logo
const MobileHeaderStyle2: React.FC<MobileHeaderBarProps> = ({
  resolvedHeaderLogo, logoKey, onHomeClick, wishlistBadgeCount, cartBadgeCount,
  onWishlistOpen, onCartOpen, onMenuOpen, onSearchOpen, websiteConfig
}) => (
  <header className="md:hidden bg-white px-3 py-2 border-b border-gray-200 to p-0 z-50">
    <div className="flex items-center justify-between">
      <button type="button" className="w-9 h-9 flex items-center justify-center text-gray-700" onClick={onMenuOpen} aria-label="Menu"><Menu size={22} strokeWidth={2} /></button>
      <button type="button" className="flex items-center justify-center flex-1 mx-4" onClick={onHomeClick}>
        {resolvedHeaderLogo ? (
          <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-7 object-contain" />
        ) : (
          <h1 className="text-lg font-bold text-gray-900">{websiteConfig?.websiteName || 'Store'}</h1>
        )}
      </button>
      <div className="flex items-center gap-1">
        <button type="button" className="w-9 h-9 flex items-center justify-center text-gray-700" onClick={onSearchOpen}><Search size={20} strokeWidth={2} /></button>
        <button type="button" className="relative w-9 h-9 flex items-center justify-center text-gray-700" onClick={onCartOpen}>
          <ShoppingCart size={20} strokeWidth={2} />
          {cartBadgeCount > 0 && <span className="absolute -to p-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartBadgeCount}</span>}
        </button>
      </div>
    </div>
  </header>
);

// Style 3: Gradient - Colorful gradient background
const MobileHeaderStyle3: React.FC<MobileHeaderBarProps> = ({
  resolvedHeaderLogo, logoKey, onHomeClick, wishlistBadgeCount, cartBadgeCount,
  onWishlistOpen, onCartOpen, onAccountClick, onMenuOpen, onSearchOpen, websiteConfig
}) => (
  <header className="md:hidden bg-gradient-theme-via px-3 py-2.5 to p-0 z-50 shadow-lg">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button type="button" className="w-10 h-10 flex items-center justify-center rounded-xl text-white/90 hover:bg-white/10 active:scale-95 transition-all" onClick={onMenuOpen}><Menu size={22} strokeWidth={2} /></button>
        <button type="button" className="flex items-center group" onClick={onHomeClick}>
          {resolvedHeaderLogo ? (
            <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-8 max-w-[100px] object-contain brightness-0 invert" />
          ) : (
            <h1 className="text-lg font-bold text-white">{websiteConfig?.websiteName || 'Store'}</h1>
          )}
        </button>
      </div>
      <div className="flex items-center gap-0.5">
        <button type="button" className="w-10 h-10 flex items-center justify-center rounded-xl text-white/90 hover:bg-white/10 active:scale-95 transition-all" onClick={onSearchOpen}><Search size={20} strokeWidth={2} /></button>
        <button type="button" className="relative w-10 h-10 flex items-center justify-center rounded-xl text-white/90 hover:bg-white/10 active:scale-95 transition-all" onClick={onWishlistOpen}>
          <Heart size={20} strokeWidth={2} />
          {wishlistBadgeCount > 0 && <span className="absolute top-1 right-1 bg-white text-theme-primary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistBadgeCount}</span>}
        </button>
        <button type="button" className="relative w-10 h-10 flex items-center justify-center rounded-xl text-white/90 hover:bg-white/10 active:scale-95 transition-all" onClick={onCartOpen}>
          <ShoppingCart size={20} strokeWidth={2} />
          {cartBadgeCount > 0 && <span className="absolute top-1 right-1 bg-white text-theme-primary text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartBadgeCount}</span>}
        </button>
        <button type="button" className="w-10 h-10 flex items-center justify-center rounded-xl text-white/90 hover:bg-white/10 active:scale-95 transition-all" onClick={onAccountClick}><User size={20} strokeWidth={2} /></button>
      </div>
    </div>
  </header>
);

// Style 4: E-commerce Pro - With integrated search bar
const MobileHeaderStyle4: React.FC<MobileHeaderBarProps> = ({
  resolvedHeaderLogo, logoKey, onHomeClick, cartBadgeCount,
  onCartOpen, onMenuOpen, onSearchOpen, websiteConfig
}) => (
  <header className="md:hidden bg-white border-b border-gray-200 to p-0 z-50">
    <div className="px-3 py-2 flex items-center gap-3">
      <button type="button" className="flex items-center gap-1.5 group" onClick={onHomeClick}>
        {resolvedHeaderLogo ? (
          <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-7 object-contain" />
        ) : (
          <h1 className="text-base font-bold text-theme-primary">{websiteConfig?.websiteName || 'Store'}</h1>
        )}
      </button>
      <button type="button" className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full text-gray-400 text-sm" onClick={onSearchOpen}>
        <Search size={16} />
        <span>Search products...</span>
      </button>
      <button type="button" className="relative w-10 h-10 flex items-center justify-center text-gray-700" onClick={onCartOpen}>
        <ShoppingCart size={22} strokeWidth={1.8} />
        {cartBadgeCount > 0 && <span className="absolute to p-0.5 right-0.5 bg-theme-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">{cartBadgeCount}</span>}
      </button>
    </div>
    <div className="px-3 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button type="button" className="flex items-center gap-1 px-3 py-1.5 bg-theme-primary/10 text-theme-primary rounded-full text-xs font-medium whitespace-nowrap" onClick={onMenuOpen}>
        <Grid size={14} />Categories
      </button>
      <a href="/products?sort=newest" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">New Arrivals</a>
      <a href="/products?sort=bestsellers" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">Best Sellers</a>
      <a href="/products?tag=sale" className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium whitespace-nowrap hover:bg-gray-200 transition-colors">Sale</a>
    </div>
  </header>
);

// Style 5: Dark Mode - Sleek dark theme
const MobileHeaderStyle5: React.FC<MobileHeaderBarProps> = ({
  resolvedHeaderLogo, logoKey, onHomeClick, wishlistBadgeCount, cartBadgeCount,
  onWishlistOpen, onCartOpen, onAccountClick, onMenuOpen, onSearchOpen, websiteConfig
}) => (
  <header className="md:hidden bg-gray-900 px-3 py-2.5 to p-0 z-50 shadow-lg">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button type="button" className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-300 hover:bg-gray-800 active:scale-95 transition-all" onClick={onMenuOpen}><Menu size={21} strokeWidth={1.8} /></button>
        <button type="button" className="flex items-center group" onClick={onHomeClick}>
          {resolvedHeaderLogo ? (
            <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-7 max-w-[100px] object-contain brightness-0 invert" />
          ) : (
            <h1 className="text-lg font-bold text-white">{websiteConfig?.websiteName || 'Store'}</h1>
          )}
        </button>
      </div>
      <div className="flex items-center gap-0.5">
        <button type="button" className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-300 hover:bg-gray-800 active:scale-95 transition-all" onClick={onSearchOpen}><Search size={20} strokeWidth={1.8} /></button>
        <button type="button" className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-300 hover:bg-gray-800 active:scale-95 transition-all" onClick={onWishlistOpen}>
          <Heart size={20} strokeWidth={1.8} />
          {wishlistBadgeCount > 0 && <span className="absolute top-1 right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistBadgeCount}</span>}
        </button>
        <button type="button" className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-300 hover:bg-gray-800 active:scale-95 transition-all" onClick={onCartOpen}>
          <ShoppingCart size={20} strokeWidth={1.8} />
          {cartBadgeCount > 0 && <span className="absolute top-1 right-1 bg-cyan-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartBadgeCount}</span>}
        </button>
        <button type="button" className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-300 hover:bg-gray-800 active:scale-95 transition-all" onClick={onAccountClick}><User size={20} strokeWidth={1.8} /></button>
      </div>
    </div>
  </header>
);

export const MobileHeaderBar: React.FC<MobileHeaderBarProps> = (props) => {
  const style = props.websiteConfig?.mobileHeaderStyle || 'style1';
  
  switch (style) {
    case 'style2':
      return <MobileHeaderStyle2 {...props} />;
    case 'style3':
      return <MobileHeaderStyle3 {...props} />;
    case 'style4':
      return <MobileHeaderStyle4 {...props} />;
    case 'style5':
      return <MobileHeaderStyle5 {...props} />;
    case 'style1':
    default:
      return <MobileHeaderStyle1 {...props} />;
  }
};