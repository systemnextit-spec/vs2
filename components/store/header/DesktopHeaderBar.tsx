import React, { memo, useMemo } from 'react';
import { ShoppingCart, Heart, User, LogOut, ChevronDown, Truck, UserCircle, Menu, Phone, Mail } from 'lucide-react';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';
import type { HeaderSearchProps } from './headerTypes';
import { DesktopSearchBar } from './HeaderSearchBar';
import type { User as UserType, WebsiteConfig } from '../../../types';
import HeaderStyle6Desktop from './HeaderStyle6';


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
  ImageSearchClick: () => void;
}

const Badge = memo<{ count: number }>(({ count }) => 
  count > 0 ? <span className="absolute -to p-2 -right-2 bg-theme-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{count}</span> : null
);

// Style 1: Default - Clean Modern with glassmorphism
const HeaderStyle1 = memo<DesktopHeaderBarProps>(({
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
    <header className="hidden md:block bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-3 sm:gap-4 lg:gap-6">
        <button type="button" className="flex items-center flex-shrink-0 group" onClick={onHomeClick}>
          {resolvedHeaderLogo ? <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Logo'} width={192} height={48} className="h-10 md:h-12 object-contain transition-all duration-300 group-hover:scale-105" /> : <h2 className="text-2xl font-black tracking-tight text-theme-primary">{websiteConfig?.websiteName || 'My Store'}</h2>}
        </button>
        <DesktopSearchBar {...searchProps} />
        <div className="flex items-center gap-2 text-gray-600">
          {[{ icon: <Heart size={20} strokeWidth={1.8} />, label: 'Wishlist', badge: wishlistBadgeCount, onClick: onWishlistOpen }, { icon: <ShoppingCart size={20} strokeWidth={1.8} />, label: 'Cart', badge: cartBadgeCount, onClick: onCartOpen }].map(({ icon, label, badge, onClick }) => (
            <button key={label} type="button" className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl hover:bg-gray-50/80 hover:text-theme-primary transition-all group" onClick={onClick}>
              <div className="relative">{icon}<Badge count={badge} /></div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-theme-primary">{label}</span>
            </button>
          ))}
          <div className="relative" ref={menuRef}>
            <button type="button" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-gray-50/80 hover:text-theme-primary transition-all group" onClick={user ? onMenuToggle : onLoginClick}>
              <div className="bg-gradient-to-br from-theme-primary/10 to-theme-primary/5 p-2.5 rounded-full"><User size={17} strokeWidth={1.8} className="text-theme-primary" /></div>
              <span className="text-sm font-medium text-gray-700">{user ? <>{user.name.split(' ')[0]} <ChevronDown size={14} className="inline ml-0.5" /></> : 'Login'}</span>
            </button>
            {user && isMenuOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-56 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100/80 py-2 z-50">
                <div className="px-4 py-3.5 border-b border-gray-100/80 bg-gradient-to-r from-theme-primary/5 to-transparent rounded-t-2xl">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                </div>
                {menuItems.map(({ icon, label, action, danger }) => (
                  <button key={label} type="button" onClick={() => handleMenuClick(action)} className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-all ${danger ? 'text-red-600 hover:bg-red-50/80' : 'text-gray-700 hover:bg-gray-50/80 hover:text-theme-primary'}`}>{icon} {label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <nav className="border-t border-gray-100/60">
        <div className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 py-1.5 text-sm font-medium text-gray-600 items-center">
          <button type="button" onClick={onHomeClick} className="px-4 py-2.5 rounded-xl hover:bg-white/80 hover:text-theme-primary hover:shadow-sm transition-all">Home</button>
          {websiteConfig?.showMobileHeaderCategory && (
            <div ref={categoryMenuRef} className="relative" onMouseEnter={() => onCategoryMenuOpen(true)} onMouseLeave={() => onCategoryMenuOpen(false)}>
              <button type="button" onClick={onCategoriesClick} className="px-4 py-2.5 rounded-xl hover:bg-white/80 hover:text-theme-primary hover:shadow-sm transition-all flex items-center gap-1.5">Categories <ChevronDown size={14} className={`transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} /></button>
              {isCategoryMenuOpen && categoriesList?.length ? (
                <div className="absolute left-0 top-full mt-0 w-60 rounded-2xl border border-gray-100/80 bg-white/95 backdrop-blur-lg py-2 shadow-2xl z-100">
                  {categoriesList.map(cat => <button key={cat} type="button" onClick={() => { onCategorySelect?.(cat); onCategoryMenuOpen(false); }} className="block w-full px-4 py-3 text-left text-sm hover:bg-gray-50/80 hover:text-theme-primary transition-all">{cat}</button>)}
                </div>
              ) : null}
            </div>
          )}
          <button type="button" onClick={onProductsClick} className="px-4 py-2.5 rounded-xl hover:bg-white/80 hover:text-theme-primary hover:shadow-sm transition-all">Products</button>
          <button type="button" onClick={onTrackOrder} className="px-4 py-2.5 rounded-xl hover:bg-white/80 hover:text-theme-primary hover:shadow-sm transition-all flex items-center gap-2"><Truck size={15} strokeWidth={1.8} /> Track Order</button>
        </div>
      </nav>
    </header>
  );
});

// Style 2: Compact - Single row minimal header
const HeaderStyle2 = memo<DesktopHeaderBarProps>(({
  resolvedHeaderLogo, logoKey, onHomeClick, searchProps,
  wishlistBadgeCount, cartBadgeCount, onWishlistOpen, onCartOpen,
  user, onLoginClick, onProfileClick, onTrackOrder, onLogoutClick,
  isMenuOpen, onMenuToggle, onMenuClose, menuRef, websiteConfig
}) => {
  const menuItems = useMemo(() => [
    { icon: <UserCircle size={16} />, label: 'My Profile', action: onProfileClick },
    { icon: <Truck size={16} />, label: 'My Orders', action: onTrackOrder },
    { icon: <LogOut size={16} />, label: 'Logout', action: onLogoutClick, danger: true }
  ], [onProfileClick, onTrackOrder, onLogoutClick]);
  const handleMenuClick = (action?: () => void) => { onMenuClose(); action?.(); };

  return (
    <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-3 flex items-center gap-8">
        <button type="button" className="flex-shrink-0" onClick={onHomeClick}>
          {resolvedHeaderLogo ? <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-9 object-contain" /> : <h2 className="text-xl font-bold text-gray-900">{websiteConfig?.websiteName || 'Store'}</h2>}
        </button>
        <nav className="flex items-center gap-1">
          <button type="button" onClick={onHomeClick} className="px-3 py-2 text-sm text-gray-600 hover:text-theme-primary transition-colors">Home</button>
          <button type="button" className="px-3 py-2 text-sm text-gray-600 hover:text-theme-primary transition-colors">Shop</button>
          <button type="button" className="px-3 py-2 text-sm text-gray-600 hover:text-theme-primary transition-colors">Categories</button>
        </nav>
        <div className="flex-1"><DesktopSearchBar {...searchProps} /></div>
        <div className="flex items-center gap-3">
          <button type="button" className="relative p-2 text-gray-600 hover:text-theme-primary" onClick={onWishlistOpen}>
            <Heart size={22} strokeWidth={1.5} />
            {wishlistBadgeCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistBadgeCount}</span>}
          </button>
          <button type="button" className="relative p-2 text-gray-600 hover:text-theme-primary" onClick={onCartOpen}>
            <ShoppingCart size={22} strokeWidth={1.5} />
            {cartBadgeCount > 0 && <span className="absolute -top-1 -right-1 bg-theme-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartBadgeCount}</span>}
          </button>
          <div className="relative" ref={menuRef}>
            <button type="button" className="p-2 text-gray-600 hover:text-theme-primary" onClick={user ? onMenuToggle : onLoginClick}>
              <User size={22} strokeWidth={1.5} />
              
              {/* px-4 py-2.5 rounded-xl hover:bg-white/80 hover:text-theme-primary hover:shadow-sm transition-all flex items-center gap-1.5 */}

            </button>
            {user && isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100"><p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p></div>
                {menuItems.map(({ icon, label, action, danger }) => (
                  <button key={label} type="button" onClick={() => handleMenuClick(action)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}>{icon} {label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

// Style 3: Gradient - Colorful header with gradient
const HeaderStyle3 = memo<DesktopHeaderBarProps>(({
  resolvedHeaderLogo, logoKey, onHomeClick, searchProps,
  wishlistBadgeCount, cartBadgeCount, onWishlistOpen, onCartOpen,
  user, onLoginClick, onProfileClick, onTrackOrder, onLogoutClick,
  isMenuOpen, onMenuToggle, onMenuClose, menuRef,
  categoriesList, onCategoriesClick, onCategorySelect,
  categoryMenuRef, isCategoryMenuOpen, onCategoryMenuOpen, websiteConfig
}) => {
  const menuItems = useMemo(() => [
    { icon: <UserCircle size={16} />, label: 'My Profile', action: onProfileClick },
    { icon: <Truck size={16} />, label: 'My Orders', action: onTrackOrder },
    { icon: <LogOut size={16} />, label: 'Logout', action: onLogoutClick, danger: true }
  ], [onProfileClick, onTrackOrder, onLogoutClick]);
  const handleMenuClick = (action?: () => void) => { onMenuClose(); action?.(); };

  return (
    <header className="hidden md:block sticky top-0 z-50">
      <div className="bg-gradient-theme-via shadow-lg">
        <div className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3 sm:gap-4 lg:gap-6">
          <button type="button" className="flex items-center flex-shrink-0" onClick={onHomeClick}>
            {resolvedHeaderLogo ? <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-10 object-contain brightness-0 invert" /> : <h2 className="text-2xl font-bold text-white">{websiteConfig?.websiteName || 'Store'}</h2>}
          </button>
          <div className="flex-1 max-w-2xl"><DesktopSearchBar {...searchProps} /></div>
          <div className="flex items-center gap-2">
            <button type="button" className="relative p-2.5 rounded-lg text-white/90 hover:bg-white/10 transition-all" onClick={onWishlistOpen}>
              <Heart size={22} strokeWidth={1.8} />
              {wishlistBadgeCount > 0 && <span className="absolute top-1 right-1 bg-white text-theme-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistBadgeCount}</span>}
            </button>
            <button type="button" className="relative p-2.5 rounded-lg text-white/90 hover:bg-white/10 transition-all" onClick={onCartOpen}>
              <ShoppingCart size={22} strokeWidth={1.8} />
              {cartBadgeCount > 0 && <span className="absolute top-1 right-1 bg-white text-theme-primary text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartBadgeCount}</span>}
            </button>
            <div className="relative" ref={menuRef}>
              <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 transition-all" onClick={user ? onMenuToggle : onLoginClick}>
                <User size={20} strokeWidth={1.8} />
                <span className="text-sm font-medium">{user ? user.name.split(' ')[0] : 'Login'}</span>
              </button>
              {user && isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border py-2 z-50">
                  <div className="px-4 py-3 border-b"><p className="text-sm font-semibold truncate">{user.name}</p></div>
                  {menuItems.map(({ icon, label, action, danger }) => (
                    <button key={label} type="button" onClick={() => handleMenuClick(action)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}>{icon} {label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 py-2 text-sm font-medium text-gray-600">
          <button type="button" onClick={onHomeClick} className="px-4 py-2 rounded-lg hover:bg-theme-primary/10 hover:text-theme-primary transition-all">Home</button>
          {websiteConfig?.showMobileHeaderCategory && (
            <div ref={categoryMenuRef} className="relative" onMouseEnter={() => onCategoryMenuOpen(true)} onMouseLeave={() => onCategoryMenuOpen(false)}>
              <button type="button" onClick={onCategoriesClick} className="px-4 py-2 rounded-lg hover:bg-theme-primary/10 hover:text-theme-primary transition-all flex items-center gap-1">Categories <ChevronDown size={14} /></button>
              {isCategoryMenuOpen && categoriesList?.length ? (
                <div className="absolute left-0 top-full mt-0 w-56 rounded-xl bg-white py-2 shadow-xl border z-50">
                  {categoriesList.map(cat => <button key={cat} type="button" onClick={() => { onCategorySelect?.(cat); onCategoryMenuOpen(false); }} className="block w-full px-4 py-2.5 text-left text-sm hover:bg-theme-primary/10 hover:text-theme-primary">{cat}</button>)}
                </div>
              ) : null}
            </div>
          )}
          <button type="button" className="px-4 py-2 rounded-lg hover:bg-theme-primary/10 hover:text-theme-primary transition-all">Products</button>
          <button type="button" onClick={onTrackOrder} className="px-4 py-2 rounded-lg hover:bg-theme-primary/10 hover:text-theme-primary transition-all flex items-center gap-1.5"><Truck size={15} /> Track</button>
        </div>
      </nav>
    </header>
  );
});

// Style 4: E-commerce Pro - With top bar and categories mega menu
const HeaderStyle4 = memo<DesktopHeaderBarProps>(({
  resolvedHeaderLogo, logoKey, onHomeClick, searchProps,
  wishlistBadgeCount, cartBadgeCount, onWishlistOpen, onCartOpen,
  user, onLoginClick, onProfileClick, onTrackOrder, onLogoutClick,
  isMenuOpen, onMenuToggle, onMenuClose, menuRef,
  categoriesList, onCategorySelect,
  categoryMenuRef, isCategoryMenuOpen, onCategoryMenuOpen, websiteConfig
}) => {
  const menuItems = useMemo(() => [
    { icon: <UserCircle size={16} />, label: 'My Profile', action: onProfileClick },
    { icon: <Truck size={16} />, label: 'My Orders', action: onTrackOrder },
    { icon: <LogOut size={16} />, label: 'Logout', action: onLogoutClick, danger: true }
  ], [onProfileClick, onTrackOrder, onLogoutClick]);
  const handleMenuClick = (action?: () => void) => { onMenuClose(); action?.(); };

  return (
    <header className="hidden md:block sticky top-0 z-50">
      <div className="bg-gray-900 text-white/80 text-xs">
        <div className="max-w-[1408px] mx-auto px-3 sm:px-4 lg:px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {websiteConfig?.phones?.[0] && <span className="flex items-center gap-1"><Phone size={12} /> {websiteConfig.phones[0]}</span>}
            {websiteConfig?.emails?.[0] && <span className="flex items-center gap-1"><Mail size={12} /> {websiteConfig.emails[0]}</span>}
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={onTrackOrder} className="hover:text-white transition-colors flex items-center gap-1"><Truck size={12} /> Track Order</button>
            <button type="button" onClick={user ? onProfileClick : onLoginClick} className="hover:text-white transition-colors">{user ? 'My Account' : 'Login / Register'}</button>
          </div>
        </div>
      </div>
      <div className="bg-white shadow-sm">
        <div className="max-w-[1408px] mx-auto px-3 sm:px-4 lg:px-6 py-3 flex items-center gap-8">
          <button type="button" className="flex-shrink-0" onClick={onHomeClick}>
            {resolvedHeaderLogo ? <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-10 object-contain" /> : <h2 className="text-xl font-bold text-theme-primary">{websiteConfig?.websiteName || 'Store'}</h2>}
          </button>
          <div ref={categoryMenuRef} className="relative" onMouseEnter={() => onCategoryMenuOpen(true)} onMouseLeave={() => onCategoryMenuOpen(false)}>
            <button type="button" className="flex items-center gap-2 px-4 py-2.5 bg-theme-primary text-white rounded-lg font-medium text-sm hover:bg-theme-primary/90 transition-all">
              <Menu size={18} /> All Categories <ChevronDown size={14} />
            </button>
            {isCategoryMenuOpen && categoriesList?.length ? (
              <div className="absolute left-0 top-full mt-0 w-64 rounded-xl bg-white py-2 shadow-2xl border z-50">
                {categoriesList.map(cat => <button key={cat} type="button" onClick={() => { onCategorySelect?.(cat); onCategoryMenuOpen(false); }} className="block w-full px-4 py-3 text-left text-sm hover:bg-theme-primary/10 hover:text-theme-primary transition-all">{cat}</button>)}
              </div>
            ) : null}
          </div>
          <div className="flex-1"><DesktopSearchBar {...searchProps} /></div>
          <div className="flex items-center gap-4">
            <button type="button" className="flex flex-col items-center text-gray-600 hover:text-theme-primary transition-colors" onClick={onWishlistOpen}>
              <div className="relative"><Heart size={22} />{wishlistBadgeCount > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistBadgeCount}</span>}</div>
              <span className="text-[10px] mt-0.5">Wishlist</span>
            </button>
            <button type="button" className="flex flex-col items-center text-gray-600 hover:text-theme-primary transition-colors" onClick={onCartOpen}>
              <div className="relative"><ShoppingCart size={22} />{cartBadgeCount > 0 && <span className="absolute -top-1 -right-1 bg-theme-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartBadgeCount}</span>}</div>
              <span className="text-[10px] mt-0.5">Cart</span>
            </button>
            <div className="relative" ref={menuRef}>
              <button type="button" className="flex flex-col items-center text-gray-600 hover:text-theme-primary transition-colors" onClick={user ? onMenuToggle : onLoginClick}>
                <User size={22} /><span className="text-[10px] mt-0.5">{user ? 'Account' : 'Login'}</span>
              </button>
              {user && isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border py-2 z-50">
                  <div className="px-4 py-3 border-b"><p className="text-sm font-semibold truncate">{user.name}</p></div>
                  {menuItems.map(({ icon, label, action, danger }) => (
                    <button key={label} type="button" onClick={() => handleMenuClick(action)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'}`}>{icon} {label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

// Style 5: Dark Mode - Sleek dark theme header
const HeaderStyle5 = memo<DesktopHeaderBarProps>(({
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
    <header className="hidden md:block bg-gray-900 sticky top-0 z-50 shadow-xl">
      <div className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3 sm:gap-4 lg:gap-6">
        <button type="button" className="flex items-center flex-shrink-0" onClick={onHomeClick}>
          {resolvedHeaderLogo ? <img key={logoKey} src={normalizeImageUrl(resolvedHeaderLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-10 object-contain brightness-0 invert" /> : <h2 className="text-2xl font-bold text-white">{websiteConfig?.websiteName || 'Store'}</h2>}
        </button>
        <nav className="flex items-center gap-1 text-sm font-medium">
          <button type="button" onClick={onHomeClick} className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all">Home</button>
          {websiteConfig?.showMobileHeaderCategory && (
            <div ref={categoryMenuRef} className="relative" onMouseEnter={() => onCategoryMenuOpen(true)} onMouseLeave={() => onCategoryMenuOpen(false)}>
              <button type="button" onClick={onCategoriesClick} className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all flex items-center gap-1">Categories <ChevronDown size={14} /></button>
              {isCategoryMenuOpen && categoriesList?.length ? (
                <div className="absolute left-0 top-full mt-0 w-56 rounded-xl bg-gray-800 py-2 shadow-xl border border-gray-700 z-50">
                  {categoriesList.map(cat => <button key={cat} type="button" onClick={() => { onCategorySelect?.(cat); onCategoryMenuOpen(false); }} className="block w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-gray-700">{cat}</button>)}
                </div>
              ) : null}
            </div>
          )}
          <button type="button" onClick={onProductsClick} className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all">Products</button>
          <button type="button" onClick={onTrackOrder} className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all flex items-center gap-1.5"><Truck size={15} /> Track</button>
        </nav>
        <div className="flex-1 max-w-xl"><DesktopSearchBar {...searchProps} /></div>
        <div className="flex items-center gap-2">
          <button type="button" className="relative p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all" onClick={onWishlistOpen}>
            <Heart size={22} strokeWidth={1.8} />
            {wishlistBadgeCount > 0 && <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{wishlistBadgeCount}</span>}
          </button>
          <button type="button" className="relative p-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all" onClick={onCartOpen}>
            <ShoppingCart size={22} strokeWidth={1.8} />
            {cartBadgeCount > 0 && <span className="absolute top-1 right-1 bg-cyan-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{cartBadgeCount}</span>}
          </button>
          <div className="relative" ref={menuRef}>
            <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800 transition-all" onClick={user ? onMenuToggle : onLoginClick}>
              <User size={20} strokeWidth={1.8} />
              <span className="text-sm font-medium">{user ? user.name.split(' ')[0] : 'Login'}</span>
            </button>
            {user && isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-gray-800 rounded-xl shadow-xl border border-gray-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-700"><p className="text-sm font-semibold text-white truncate">{user.name}</p></div>
                {menuItems.map(({ icon, label, action, danger }) => (
                  <button key={label} type="button" onClick={() => handleMenuClick(action)} className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 ${danger ? 'text-red-400 hover:bg-red-900/30' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}>{icon} {label}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

export const DesktopHeaderBar = memo<DesktopHeaderBarProps>((props) => {
  const style = props.websiteConfig?.headerStyle || 'style1';
  
  switch (style) {
    case 'style2':
      return <HeaderStyle2 {...props} />;
    case 'style3':
      return <HeaderStyle3 {...props} />;
    case 'style4':
      return <HeaderStyle4 {...props} />;
    case 'style5':
      return <HeaderStyle5 {...props} />;
    case 'style6':
      return <HeaderStyle6Desktop {...props} />;
    case 'style1':
    default:
      return <HeaderStyle1 {...props} />;
  }
});