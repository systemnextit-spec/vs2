import React, { memo, useMemo } from 'react';
import { ShoppingCart, Heart, User, LogOut, ChevronDown, Truck, UserCircle, Menu, Phone, Mail } from 'lucide-react';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';
import type { HeaderSearchProps } from './headerTypes';
import { DesktopSearchBar } from './HeaderSearchBar';
import type { User as UserType, WebsiteConfig } from '../../../types';

interface DesktopHeaderBarProps {
  resolvedHeaderLogo: string | null;
  logoKey: string;
  onHomeClick?: () => void;
  searchProps: HeaderSearchProps;
  wishlistBadgeCount: number;
  cartBadgeCount: number;
  onWishlistOpen: () => void;
  onCartOpen: () => void;
  user?: UserType | null;
  onLoginClick?: () => void;
  onProfileClick?: () => void;
  onTrackOrder?: () => void;
  onLogoutClick?: () => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onMenuClose: () => void;
  menuRef: React.RefObject<HTMLDivElement>;
  categoriesList?: string[];
  onCategoriesClick?: () => void;
  onCategorySelect?: (category: string) => void;
  categoryMenuRef: React.RefObject<HTMLDivElement>;
  isCategoryMenuOpen: boolean;
  onCategoryMenuOpen: (open: boolean) => void;
  onProductsClick?: () => void;
  websiteConfig?: WebsiteConfig;
}

// Style 6: Vibrant Orange Gradient - Figma design with pill-shaped search & utility bar
const HeaderStyle6Desktop = memo<DesktopHeaderBarProps>(({
  resolvedHeaderLogo, logoKey, onHomeClick, searchProps,
  wishlistBadgeCount, cartBadgeCount, onWishlistOpen, onCartOpen,
  user, onLoginClick, onProfileClick, onTrackOrder, onLogoutClick,
  isMenuOpen, onMenuToggle, onMenuClose, menuRef,
  categoriesList, onCategoriesClick, onCategorySelect,
  categoryMenuRef, isCategoryMenuOpen, onCategoryMenuOpen,
  onProductsClick, websiteConfig
}) => {
  const menuItems = useMemo(() => [
    { icon: <UserCircle size={16} />, label: 'My Profile', action: onProfileClick },
    { icon: <Truck size={16} />, label: 'My Orders', action: onTrackOrder },
    { icon: <LogOut size={16} />, label: 'Logout', action: onLogoutClick, danger: true }
  ], [onProfileClick, onTrackOrder, onLogoutClick]);
  const handleMenuClick = (action?: () => void) => { onMenuClose(); action?.(); };

  return (
    <header className="hidden md:block sticky top-0 z-50">
      {/* Top utility bar */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white/80 text-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[100px] py-1.5 flex items-center justify-between">
          {/* <div className="flex items-center gap-4">
            {websiteConfig?.phones?.[0] && <span className="flex items-center gap-1"><Phone size={12} /> {websiteConfig.phones[0]}</span>}
            {websiteConfig?.emails?.[0] && <span className="flex items-center gap-1"><Mail size={12} /> {websiteConfig.emails[0]}</span>}
          </div> */}
          {/* <div className="flex items-center gap-4">
            <button type="button" onClick={onTrackOrder} className="hover:text-white transition-colors flex items-center gap-1"><Truck size={12} /> Track Order</button>
            <button type="button" onClick={user ? onProfileClick : onLoginClick} className="hover:text-white transition-colors">{user ? 'My Account' : 'Login / Register'}</button>
          </div> */}
        </div>
      </div>

      {/* Main header bar with orange gradient */}
      <div className="bg-gradient-to-r from-[#FF6A00] to-[#FF9F1C] shadow-lg">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[100px] py-4 flex items-center justify-between gap-4 lg:gap-6">
          {/* Logo */}
          <button type="button" className="flex items-center flex-shrink-0 group" onClick={onHomeClick}>
            {resolvedHeaderLogo ? (
              <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-10 md:h-12 object-contain brightness-0 invert transition-all duration-300 group-hover:scale-105" />
            ) : (
              <h2 className="text-2xl md:text-[36px] font-bold font-['Poppins'] text-white tracking-tight leading-none">{websiteConfig?.websiteName || 'My Store'}</h2>
            )}
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl">
            <DesktopSearchBar {...searchProps} />
          </div>

          {/* Right utility icons in pill container */}
          <div className="bg-white/95 backdrop-blur-sm rounded-full h-[52px] px-5 flex items-center gap-5 shadow-md">
            <button type="button" className="relative text-gray-800 hover:text-orange-600 transition-colors" onClick={onWishlistOpen} aria-label="Wishlist">
              <Heart size={22} strokeWidth={1.8} />
              {wishlistBadgeCount > 0 && <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistBadgeCount}</span>}
            </button>
            <button type="button" className="relative text-gray-800 hover:text-orange-600 transition-colors" onClick={onCartOpen} aria-label="Cart">
              <ShoppingCart size={22} strokeWidth={1.8} />
              {cartBadgeCount > 0 && <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartBadgeCount}</span>}
            </button>
            <div className="relative" ref={menuRef}>
              <button type="button" className="text-gray-800 hover:text-orange-600 transition-colors flex items-center gap-1.5" onClick={user ? onMenuToggle : onLoginClick} aria-label="Account">
                <User size={22} strokeWidth={1.8} />
                {user && <ChevronDown size={14} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />}
              </button>
              {user && isMenuOpen && (
                <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-transparent rounded-t-2xl">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                  </div>
                  {menuItems.map(({ icon, label, action, danger }) => (
                    <button key={label} type="button" onClick={() => handleMenuClick(action)} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}`}>{icon} {label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[100px] flex gap-1 py-1.5 text-sm font-medium text-gray-600 items-center">
          <button type="button" onClick={onHomeClick} className="px-4 py-2.5 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-all">Home</button>
          {websiteConfig?.showMobileHeaderCategory && (
            <div ref={categoryMenuRef} className="relative" onMouseEnter={() => onCategoryMenuOpen(true)} onMouseLeave={() => onCategoryMenuOpen(false)}>
              <button type="button" onClick={onCategoriesClick} className="px-4 py-2.5 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center gap-1.5">Categories <ChevronDown size={14} className={`transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} /></button>
              {isCategoryMenuOpen && categoriesList?.length ? (
                <div className="absolute left-0 top-full mt-0 w-60 rounded-2xl border border-gray-100 bg-white py-2 shadow-2xl z-[100]">
                  {categoriesList.map(cat => <button key={cat} type="button" onClick={() => { onCategorySelect?.(cat); onCategoryMenuOpen(false); }} className="block w-full px-4 py-3 text-left text-sm hover:bg-orange-50 hover:text-orange-600 transition-all">{cat}</button>)}
                </div>
              ) : null}
            </div>
          )}
          <button type="button" onClick={onProductsClick} className="px-4 py-2.5 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-all">Products</button>
          <button type="button" onClick={onTrackOrder} className="px-4 py-2.5 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-all flex items-center gap-2"><Truck size={15} strokeWidth={1.8} /> Track Order</button>
        </div>
      </nav>
    </header>
  );
});

export default HeaderStyle6Desktop;
