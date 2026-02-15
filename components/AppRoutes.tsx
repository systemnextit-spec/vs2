/**
 * AppRoutes.tsx - All view rendering logic extracted from App.tsx
 */
import React, { Suspense, lazy } from 'react';
import type {
  Product, Order, ThemeConfig, WebsiteConfig, DeliveryConfig,
  ProductVariantSelection, LandingPage, FacebookPixelConfig, CourierConfig,
  Category, SubCategory, ChildCategory, Brand, Tag, User, ChatMessage, PaymentMethod
} from '../types';
import type { ViewState } from '../hooks/useNavigation';
import { SuperAdminDashboardSkeleton, StorePageSkeleton, ProductDetailSkeleton, RegistrationPageSkeleton } from './SkeletonLoaders';
import { ensureVariantSelection } from '../utils/appHelpers';

// Lazy load pages - loaded on demand when view changes
const StoreHome = lazy(() => import('../pages/StoreHome'));
const StoreProductDetail = lazy(() => import('../pages/StoreProductDetail'));
const StoreCheckout = lazy(() => import('../pages/StoreCheckout'));
const StoreOrderSuccess = lazy(() => import('../pages/StoreOrderSuccess'));
const StoreProfile = lazy(() => import('../pages/StoreProfile'));
const LandingPagePreview = lazy(() => import('../pages/LandingPagePreview'));
const PublicOfferPage = lazy(() => import('../pages/PublicOfferPage'));
const SuperAdminDashboard = lazy(() => import('../pages/SuperAdminDashboard'));
const AdminLogin = lazy(() => import('../pages/AdminLogin'));
const AdminAppWithAuth = lazy(() => import('../pages/AdminAppWithAuth'));
const MobileBottomNav = lazy(() => import('./store/MobileBottomNav').then(m => ({ default: m.MobileBottomNav })));
const StoreChatModal = lazy(() => import('./store/StoreChatModal').then(m => ({ default: m.StoreChatModal })));

// TenantRegistration - Completely isolated lazy load
// This component is ONLY loaded when user navigates to /register URL
// It will NOT be loaded for shop/subdomain/main domain visits
const TenantRegistration = lazy(() => 
  import(/* webpackChunkName: "tenant-registration" */ '../pages/TenantRegistration')
);

interface AppRoutesProps {
  currentView: string;
  isSuperAdminSubdomain: boolean;
  
  // Data
  products: Product[];
  orders: Order[];
  logo: string | null;
  themeConfig: ThemeConfig | null;
  websiteConfig: WebsiteConfig | undefined;
  deliveryConfig: DeliveryConfig[];
  paymentMethods: PaymentMethod[];
  courierConfig: CourierConfig;
  facebookPixelConfig: FacebookPixelConfig;
  categories: Category[];
  subCategories: SubCategory[];
  childCategories: ChildCategory[];
  brands: Brand[];
  tags: Tag[];
  chatMessages: ChatMessage[];
  
  // User & Auth
  user: User | null;
  wishlist: number[];
  cartItems: any[];
  
  // Selected items
  selectedProduct: Product | null;
  selectedLandingPage: LandingPage | null;
  selectedVariant: ProductVariantSelection | null;
  checkoutQuantity: number;
  
  // Search
  storeSearchQuery: string;
  urlCategoryFilter: string | null;
  
  // Tenant
  activeTenantId: string;
  headerTenants: any[];
  isTenantSwitching: boolean;
  isTenantSeeding: boolean;
  deletingTenantId: string | null;
  
  // Chat state
  isChatOpen: boolean;
  isAdminChatOpen: boolean;
  hasUnreadChat: boolean;
  canAccessAdminChat: boolean;
  
  // Handlers
  onProductClick: (product: Product) => void;
  onQuickCheckout: (product: Product, quantity: number, variant?: ProductVariantSelection) => void;
  onToggleWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  onLogin: (email: string, password: string) => Promise<any>;
  onRegister: (newUser: User) => Promise<boolean>;
  onGoogleLogin: () => Promise<any>;
  onLogout: () => void;
  onUpdateProfile: (updatedUser: User) => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onBulkDeleteProducts: (ids: number[]) => void;
  onBulkUpdateProducts: (ids: number[], updates: Partial<Product>) => void;
  onBulkFlashSale: (ids: number[], action: 'add' | 'remove') => void;
  onUpdateLogo: (logo: string | null) => void;
  onUpdateTheme: (config: ThemeConfig) => Promise<void>;
  onUpdateWebsiteConfig: (config: WebsiteConfig) => Promise<void>;
  onUpdateDeliveryConfig: (configs: DeliveryConfig[]) => void;
  onUpdatePaymentMethods: (methods: PaymentMethod[]) => void;
  onUpdateCourierConfig: (config: CourierConfig) => void;
  onPlaceOrder: (formData: any) => Promise<void>;
  onLandingOrderSubmit: (payload: any) => Promise<void>;
  onCloseLandingPreview: () => void;
  onTenantChange: (tenantId: string) => void;
  onCreateTenant: (payload: any, options?: { activate?: boolean }) => Promise<any>;
  onDeleteTenant: (tenantId: string) => Promise<void>;
  onRefreshTenants: () => Promise<any>;
  onSearchChange: (query: string) => void;
  onCategoryFilterChange: (category: string | null) => void;
  onMobileMenuOpenRef: (fn: () => void) => void;
  
  // Cart handlers
  onToggleCart: (product: Product, quantity: number, variant?: ProductVariantSelection) => void;
  onCheckoutFromCart: (productId: number) => void;
  onAddToCart: (product: Product, quantity: number, variant?: ProductVariantSelection, options?: { silent?: boolean }) => void;
  
  // Chat handlers
  onOpenChat: () => void;
  onCloseChat: () => void;
  onOpenAdminChat: () => void;
  onCloseAdminChat: () => void;
  onCustomerSendChat: (message: string) => void;
  onAdminSendChat: (message: string) => void;
  onEditChatMessage: (messageId: string, newText: string) => void;
  onDeleteChatMessage: (messageId: string) => void;
  
  // View setters
  setCurrentView: (view: ViewState) => void;
  setUser: (user: User | null) => void;
  setIsLoginOpen: (open: boolean) => void;
  
  // Landing pages
  landingPages: LandingPage[];
  onCreateLandingPage: (page: any) => void;
  onUpsertLandingPage: (page: any) => void;
  onToggleLandingPublish: (pageId: string, status: string) => void;

  // Order management
  onAddOrder?: (order: Order) => void;

  // Login modal
  isLoginOpen: boolean;
}

// Login Modal component (lazy loaded separately)
const LoginModal = lazy(() => import('./store/LoginModal').then(m => ({ default: m.LoginModal })));

export const AppRoutes: React.FC<AppRoutesProps> = (props) => {
  const {
    currentView,
    isSuperAdminSubdomain,
    products,
    orders,
    logo,
    themeConfig,
    websiteConfig,
    deliveryConfig,
    paymentMethods,
    courierConfig,
    facebookPixelConfig,
    categories,
    subCategories,
    childCategories,
    brands,
    tags,
    chatMessages,
    user,
    wishlist,
    cartItems,
    selectedProduct,
    selectedLandingPage,
    selectedVariant,
    checkoutQuantity,
    storeSearchQuery,
    urlCategoryFilter,
    activeTenantId,
    headerTenants,
    isTenantSwitching,
    isTenantSeeding,
    deletingTenantId,
    isChatOpen,
    isAdminChatOpen,
    hasUnreadChat,
    canAccessAdminChat,
    onProductClick,
    onQuickCheckout,
    onToggleWishlist,
    isInWishlist,
    onLogin,
    onRegister,
    onGoogleLogin,
    onLogout,
    onUpdateProfile,
    onUpdateOrder,
    onAddProduct,
    onUpdateProduct,
    onDeleteProduct,
    onBulkDeleteProducts,
    onBulkUpdateProducts,
    onBulkFlashSale,
    onUpdateLogo,
    onUpdateTheme,
    onUpdateWebsiteConfig,
    onUpdateDeliveryConfig,
    onUpdatePaymentMethods,
    onUpdateCourierConfig,
    onPlaceOrder,
    onLandingOrderSubmit,
    onCloseLandingPreview,
    onTenantChange,
    onCreateTenant,
    onDeleteTenant,
    onRefreshTenants,
    onSearchChange,
    onCategoryFilterChange,
    onMobileMenuOpenRef,
    onToggleCart,
    onCheckoutFromCart,
    onAddToCart,
    onOpenChat,
    onCloseChat,
    onOpenAdminChat,
    onCloseAdminChat,
    onCustomerSendChat,
    onAdminSendChat,
    onEditChatMessage,
    onDeleteChatMessage,
    setCurrentView,
    setUser,
    setIsLoginOpen,
    isLoginOpen,
    landingPages,
    onCreateLandingPage,
    onUpsertLandingPage,
    onToggleLandingPublish,
    onAddOrder,
  } = props;

  const mobileMenuOpenFnRef = React.useRef<(() => void) | null>(null);
  
  React.useEffect(() => {
    if (onMobileMenuOpenRef) {
      onMobileMenuOpenRef(() => mobileMenuOpenFnRef.current?.());
    }
  }, [onMobileMenuOpenRef]);

  return (
    <>
      {isLoginOpen && (
        <Suspense fallback={null}>
          <LoginModal
            onClose={() => setIsLoginOpen(false)}
            onLogin={onLogin}
            onRegister={onRegister}
            onGoogleLogin={onGoogleLogin}
          />
        </Suspense>
      )}

      {currentView === 'register' ? (
        <Suspense fallback={<RegistrationPageSkeleton />}>
          <TenantRegistration />
        </Suspense>
      ) : currentView === 'admin-login' ? (
        <Suspense fallback={null}>
          <AdminLogin
            onLoginSuccess={(loggedUser) => {
              setUser(loggedUser);
              if (loggedUser.role === 'super_admin' && isSuperAdminSubdomain) {
                setCurrentView('super-admin');
              } else {
                setCurrentView('admin');
              }
            }}
          />
        </Suspense>
      ) : currentView === 'super-admin' ? (
        <Suspense fallback={<SuperAdminDashboardSkeleton />}>
          <SuperAdminDashboard />
        </Suspense>
      ) : currentView === 'admin' ? (
        <Suspense fallback={null}>
          <AdminAppWithAuth
            activeTenantId={activeTenantId}
            tenants={headerTenants}
            orders={orders}
            products={products}
            logo={logo}
            themeConfig={themeConfig}
            websiteConfig={websiteConfig}
            deliveryConfig={deliveryConfig}
            paymentMethods={paymentMethods}
            courierConfig={courierConfig}
            facebookPixelConfig={facebookPixelConfig}
            chatMessages={chatMessages}
            parentUser={user}
            onLogout={onLogout}
            onUpdateOrder={onUpdateOrder}
            onAddProduct={onAddProduct}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            onBulkDeleteProducts={onBulkDeleteProducts}
            onBulkUpdateProducts={onBulkUpdateProducts}
            onBulkFlashSale={onBulkFlashSale}
            onUpdateLogo={onUpdateLogo}
            onUpdateTheme={onUpdateTheme}
            onUpdateWebsiteConfig={onUpdateWebsiteConfig}
            onUpdateDeliveryConfig={onUpdateDeliveryConfig}
            onUpdatePaymentMethods={onUpdatePaymentMethods}
            onUpdateCourierConfig={onUpdateCourierConfig}
            onUpdateProfile={onUpdateProfile}
            onTenantChange={onTenantChange}
            onCreateTenant={onCreateTenant}
            onDeleteTenant={onDeleteTenant}
            onRefreshTenants={onRefreshTenants}
            isTenantSwitching={isTenantSwitching}
            onSwitchToStore={() => setCurrentView('store')}
            onOpenAdminChat={onOpenAdminChat}
            hasUnreadChat={hasUnreadChat}
            landingPages={landingPages}
            onCreateLandingPage={onCreateLandingPage}
            onUpsertLandingPage={onUpsertLandingPage}
            onToggleLandingPublish={onToggleLandingPublish}
            onAddOrder={onAddOrder}
          />
        </Suspense>
      ) : (
        <>
          {currentView === 'store' && (
            <Suspense fallback={<StorePageSkeleton />}>
              <>
                <StoreHome
                  products={products}
                  orders={orders}
                  tenantId={activeTenantId}
                  onProductClick={onProductClick}
                  onQuickCheckout={onQuickCheckout}
                  wishlistCount={wishlist.length}
                  wishlist={wishlist}
                  onToggleWishlist={(id) => onToggleWishlist(id)}
                  user={user}
                  onLoginClick={() => setIsLoginOpen(true)}
                  onLogoutClick={onLogout}
                  onProfileClick={() => setCurrentView('profile')}
                  logo={logo}
                  websiteConfig={websiteConfig}
                  searchValue={storeSearchQuery}
                  onSearchChange={onSearchChange}
                  onOpenChat={onOpenChat}
                  cart={cartItems}
                  onToggleCart={(id: number) => {
                    const product = products.find(p => p.id === id);
                    if (product) onToggleCart(product, 1);
                  }}
                  onCheckoutFromCart={onCheckoutFromCart}
                  onAddToCart={onAddToCart}
                  categories={categories}
                  subCategories={subCategories}
                  childCategories={childCategories}
                  brands={brands}
                  tags={tags}
                  initialCategoryFilter={urlCategoryFilter}
                  onCategoryFilterChange={onCategoryFilterChange}
                  onMobileMenuOpenRef={(fn) => { mobileMenuOpenFnRef.current = fn; }}
                />
                <MobileBottomNav
                  onHomeClick={() => { setCurrentView('store'); window.scrollTo(0, 0); }}
                  onCartClick={() => {}}
                  onAccountClick={() => user ? setCurrentView('profile') : setIsLoginOpen(true)}
                  onMenuClick={() => mobileMenuOpenFnRef.current?.()}
                  cartCount={cartItems.length}
                  websiteConfig={websiteConfig}
                  onChatClick={onOpenChat}
                  user={user}
                  onLogoutClick={onLogout}
                />
              </>
            </Suspense>
          )}

          {currentView === 'detail' && selectedProduct && (
            <Suspense fallback={<ProductDetailSkeleton />}>
              <StoreProductDetail
                product={selectedProduct}
                orders={orders}
                tenantId={activeTenantId}
                onBack={() => setCurrentView('store')}
                onProductClick={onProductClick}
                wishlistCount={wishlist.length}
                isWishlisted={isInWishlist(selectedProduct.id)}
                onToggleWishlist={() => onToggleWishlist(selectedProduct.id)}
                onCheckout={onQuickCheckout}
                user={user}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogoutClick={onLogout}
                onProfileClick={() => setCurrentView('profile')}
                logo={logo}
                websiteConfig={websiteConfig}
                searchValue={storeSearchQuery}
                onSearchChange={onSearchChange}
                onOpenChat={onOpenChat}
                cart={cartItems}
                onToggleCart={(id: number) => {
                  const product = products.find(p => p.id === id);
                  if (product) onToggleCart(product, 1);
                }}
                onCheckoutFromCart={onCheckoutFromCart}
                onAddToCart={(product, quantity, variant) => onAddToCart(product, quantity, variant, { silent: true })}
                productCatalog={products}
                categories={categories}
                onCategoryClick={onCategoryFilterChange}
              />
            </Suspense>
          )}

          {currentView === 'checkout' && selectedProduct && (
            <Suspense fallback={null}>
              <StoreCheckout
                product={selectedProduct}
                quantity={checkoutQuantity}
                variant={selectedVariant || ensureVariantSelection(selectedProduct)}
                onBack={() => setCurrentView('detail')}
                onConfirmOrder={onPlaceOrder}
                user={user}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogoutClick={onLogout}
                onProfileClick={() => setCurrentView('profile')}
                logo={logo}
                websiteConfig={websiteConfig}
                deliveryConfigs={deliveryConfig}
                paymentMethods={paymentMethods}
                searchValue={storeSearchQuery}
                onSearchChange={onSearchChange}
                onOpenChat={onOpenChat}
                cart={cartItems}
                onToggleCart={(id: number) => {
                  const product = products.find(p => p.id === id);
                  if (product) onToggleCart(product, 1);
                }}
                onCheckoutFromCart={onCheckoutFromCart}
                productCatalog={products}
                orders={orders}
              />
            </Suspense>
          )}

          {currentView === 'success' && (
            <Suspense fallback={null}>
              <StoreOrderSuccess
                onHome={() => setCurrentView('store')}
                user={user}
                onLoginClick={() => setIsLoginOpen(true)}
                onLogoutClick={onLogout}
                onProfileClick={() => setCurrentView('profile')}
                logo={logo}
                websiteConfig={websiteConfig}
                searchValue={storeSearchQuery}
                onSearchChange={onSearchChange}
                onOpenChat={onOpenChat}
                cart={cartItems}
                onToggleCart={(id: number) => {
                  const product = products.find(p => p.id === id);
                  if (product) onToggleCart(product, 1);
                }}
                onCheckoutFromCart={onCheckoutFromCart}
                productCatalog={products}
                orders={orders}
              />
            </Suspense>
          )}

          {currentView === 'profile' && user && (
            <Suspense fallback={null}>
              <>
                <StoreProfile
                  user={user}
                  onUpdateProfile={onUpdateProfile}
                  orders={orders}
                  onHome={() => setCurrentView('store')}
                  onLoginClick={() => setIsLoginOpen(true)}
                  onLogoutClick={onLogout}
                  logo={logo}
                  websiteConfig={websiteConfig}
                  searchValue={storeSearchQuery}
                  onSearchChange={onSearchChange}
                  onOpenChat={onOpenChat}
                  cart={cartItems}
                  onToggleCart={(id: number) => {
                    const product = products.find(p => p.id === id);
                    if (product) onToggleCart(product, 1);
                  }}
                  onCheckoutFromCart={onCheckoutFromCart}
                  productCatalog={products}
                />
                <MobileBottomNav
                  onHomeClick={() => { setCurrentView('store'); window.scrollTo(0, 0); }}
                  onCartClick={() => {}}
                  onAccountClick={() => {}}
                  onMenuClick={() => mobileMenuOpenFnRef.current?.()}
                  cartCount={cartItems.length}
                  websiteConfig={websiteConfig}
                  onChatClick={onOpenChat}
                  user={user}
                  onLogoutClick={onLogout}
                  activeTab="account"
                />
              </>
            </Suspense>
          )}

          {currentView === 'landing_preview' && selectedLandingPage && (
            <Suspense fallback={null}>
              <LandingPagePreview
                page={selectedLandingPage}
                product={selectedLandingPage.productId ? products.find(p => p.id === selectedLandingPage.productId) : undefined}
                onBack={onCloseLandingPreview}
                onSubmitLandingOrder={onLandingOrderSubmit}
              />
            </Suspense>
          )}

          {currentView === 'offer_preview' && (
            <Suspense fallback={null}>
              <PublicOfferPage websiteConfig={websiteConfig} />
            </Suspense>
          )}
          {themeConfig && (
            <StoreChatModal
              isOpen={isChatOpen}
              onClose={onCloseChat}
              websiteConfig={websiteConfig}
              themeConfig={themeConfig}
              user={user}
              messages={chatMessages}
              onSendMessage={onCustomerSendChat}
              context="customer"
              onEditMessage={onEditChatMessage}
              onDeleteMessage={onDeleteChatMessage}
            />
          )}
        </>
      )}

      {canAccessAdminChat && (
        <StoreChatModal
          isOpen={Boolean(isAdminChatOpen && currentView.startsWith('admin'))}
          onClose={onCloseAdminChat}
          websiteConfig={websiteConfig}
          themeConfig={themeConfig ?? undefined}
          user={user}
          messages={chatMessages}
          onSendMessage={onAdminSendChat}
          context="admin"
          onEditMessage={onEditChatMessage}
          onDeleteMessage={onDeleteChatMessage}
          canDeleteAll
        />
      )}
    </>
  );
};

export default AppRoutes;
