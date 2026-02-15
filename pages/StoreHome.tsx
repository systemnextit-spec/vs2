
import React, { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import type { Product, User, WebsiteConfig, Order, ProductVariantSelection } from '../types';
import { noCacheFetchOptions } from '../utils/fetchHelpers';
import { onDataRefresh } from '../services/DataService';

// Custom hook with all business logic
import { useStoreHome, formatSegment } from '../hooks/useStoreHome';

// Critical above-the-fold components - loaded EAGERLY (minimal set for first paint)
import { StoreHeader } from '../components/StoreHeader';
import { HeroSection } from '../components/store/HeroSection';
import { CategoriesSection } from '../components/store/CategoriesSection';

// Skeletons - section-specific inline placeholders for accurate loading states
import { 
  SectionSkeleton, 
  FooterSkeleton, 
  StoreHomeSkeleton,
  FlashSalesSkeleton,
  ShowcaseSkeleton,
  BrandSkeleton,
  ProductGridSkeleton,
  SearchResultsSkeleton
} from '../components/store/skeletons';

// Near-fold components - lazy loaded but eagerly prefetched
const FlashSalesSection = lazy(() => import('../components/store/FlashSalesSection').then(m => ({ default: m.FlashSalesSection })));
const ProductGridSection = lazy(() => import('../components/store/ProductGridSection').then(m => ({ default: m.ProductGridSection })));
const ShowcaseSection = lazy(() => import('../components/store/ShowcaseSection').then(m => ({ default: m.ShowcaseSection })));
const BrandSection = lazy(() => import('../components/store/BrandSection').then(m => ({ default: m.BrandSection })));
const LazySection = lazy(() => import('../components/store/LazySection').then(m => ({ default: m.LazySection })));

// Below-the-fold - lazy loaded
const StorePopup = lazy(() => import('../components/StorePopup').then(m => ({ default: m.StorePopup })));
const StoreFooter = lazy(() => import('../components/store/StoreFooter').then(m => ({ default: m.StoreFooter })));
const ProductQuickViewModal = lazy(() => import('../components/store/ProductQuickViewModal').then(m => ({ default: m.ProductQuickViewModal })));
const TrackOrderModal = lazy(() => import('../components/store/TrackOrderModal').then(m => ({ default: m.TrackOrderModal })));
const StoreCategoryProducts = lazy(() => import('../components/StoreCategoryProducts'));
const SearchResultsSection = lazy(() => import('../components/store/SearchResultsSection').then(m => ({ default: m.SearchResultsSection })));
// Dynamic storefront renderer for Page Builder layouts
const StoreFrontRenderer = lazy(() => import('../components/store/StoreFrontRenderer').then(m => ({ default: m.StoreFrontRenderer })));

interface StoreHomeProps {
  products?: Product[];
  orders?: Order[];
  tenantId?: string;
  onProductClick: (p: Product) => void;
  onQuickCheckout?: (p: Product, quantity: number, variant: ProductVariantSelection) => void;
  wishlistCount: number;
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
  cart?: number[];
  onToggleCart?: (id: number) => void;
  onCheckoutFromCart?: (productId: number) => void;
  onAddToCart?: (product: Product, quantity: number, variant: ProductVariantSelection) => void;
  user?: User | null;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onProfileClick?: () => void;
  logo?: string | null;
  websiteConfig?: WebsiteConfig;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onImageSearchClick?: () => void;
  onOpenChat?: () => void;
  categories?: any[];
  subCategories?: any[];
  childCategories?: any[];
  brands?: any[];
  tags?: any[];
  initialCategoryFilter?: string | null;
  onCategoryFilterChange?: (categorySlug: string | null) => void;
  onMobileMenuOpenRef?: (openFn: () => void) => void;
}

const StoreHome: React.FC<StoreHomeProps> = ({ 
  products,
  orders,
  tenantId,
  onProductClick, 
  onQuickCheckout,
  wishlistCount, 
  wishlist, 
  onToggleWishlist,
  cart,
  onToggleCart,
  onCheckoutFromCart,
  onAddToCart,
  user,
  onLoginClick,
  onLogoutClick,
  onProfileClick,
  logo,
  websiteConfig,
  categories = [],
  subCategories,
  childCategories,
  brands,
  tags,
  searchValue,
  onSearchChange,
  onImageSearchClick,
  onOpenChat,
  initialCategoryFilter,
  onCategoryFilterChange,
  onMobileMenuOpenRef
}) => {
  // Display skeleton only if products is undefined (still loading)
  // If products is an empty array, the store has no products yet - show the page anyway
  if (products === undefined) {
    return <StoreHomeSkeleton />;
  }
  // All state and logic from custom hook
  const {
    isTrackOrderOpen,
    setIsTrackOrderOpen,
    quickViewProduct,
    setQuickViewProduct,
    sortOption,
    setSortOption,
    activePopup,
    showScrollToTop,
    selectedCategoryView,
    flashTimeLeft,
    searchTerm,
    hasSearchQuery,
    showFlashSaleCounter,
    categoriesSectionRef,
    productsSectionRef,
    categoryScrollRef,
    displayCategories,
    displayProducts,
    activeProducts,
    flashSalesProducts,
    bestSaleProducts,
    popularProducts,
    sortedProducts,
    updateSearchTerm,
    scrollToTop,
    handleClosePopup,
    handlePopupNavigate,
    handleCategoryClick,
    handleClearCategoryFilter,
    handleCategoriesNav,
    handleProductsNav,
  } = useStoreHome({
    products,
    tenantId,
    categories,
    websiteConfig,
    initialCategoryFilter,
    onCategoryFilterChange,
    searchValue,
    onSearchChange
  });


  // === CUSTOM LAYOUT STATE ===
  const [useCustomLayout, setUseCustomLayout] = useState(false);
  const [customLayoutLoading, setCustomLayoutLoading] = useState(true);

  // Shared function to check and update custom layout state
  const checkAndUpdateCustomLayout = useCallback(async (logPrefix = '') => {
    if (!tenantId) return;
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      // Check both store studio config and layout in parallel
      const [configRes, layoutRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tenant-data/${tenantId}/store_studio_config`, noCacheFetchOptions),
        fetch(`${API_BASE_URL}/api/tenant-data/${tenantId}/store_layout`, noCacheFetchOptions)
      ]);
      
      // Only use custom layout if store studio is enabled AND layout exists
      if (configRes.ok && layoutRes.ok) {
        const [configResult, layoutResult] = await Promise.all([
          configRes.json(),
          layoutRes.json()
        ]);
        
        const isStoreStudioEnabled = configResult.data?.enabled || false;
        const hasCustomLayout = layoutResult.data?.sections?.length > 0;
        
        if (isStoreStudioEnabled && hasCustomLayout) {
          setUseCustomLayout(true);
          console.log(`[StoreHome]${logPrefix} Using custom layout from Store Studio`);
        } else {
          setUseCustomLayout(false);
          if (!isStoreStudioEnabled) {
            console.log(`[StoreHome]${logPrefix} Store Studio is disabled, using default layout`);
          } else {
            console.log(`[StoreHome]${logPrefix} No custom layout, using default`);
          }
        }
      }
    } catch (e) {
      console.log(`[StoreHome]${logPrefix} Error checking layout, using default:`, e);
    }
  }, [tenantId]);

  // Check if tenant has store studio enabled and a custom layout saved
  useEffect(() => {
    const initCustomLayout = async () => {
      if (!tenantId) {
        setCustomLayoutLoading(false);
        return;
      }
      await checkAndUpdateCustomLayout();
      setCustomLayoutLoading(false);
    };
    initCustomLayout();
  }, [tenantId, checkAndUpdateCustomLayout]);

  // Listen for real-time updates to store_studio_config
  useEffect(() => {
    if (!tenantId) return;

    const unsubscribe = onDataRefresh((key, updatedTenantId, fromSocket) => {
      // Only respond to updates for this tenant
      if (updatedTenantId !== tenantId) return;
      
      // Refetch when store studio settings or layout changes
      if (key === 'store_studio_config' || key === 'store_layout') {
        console.log('[StoreHome] Detected update to', key, '- refetching...');
        checkAndUpdateCustomLayout(' (live update)');
      }
    });

    return () => unsubscribe();
  }, [tenantId, checkAndUpdateCustomLayout]);

  // === HANDLERS ===
  const selectInstantVariant = useCallback((product: Product): ProductVariantSelection => ({
    color: product.variantDefaults?.color || product.colors?.[0] || 'Default',
    size: product.variantDefaults?.size || product.sizes?.[0] || 'Standard'
  }), []);

  const handleBuyNow = useCallback((product: Product) => {
    if (onQuickCheckout) {
      onQuickCheckout(product, 1, selectInstantVariant(product));
    } else {
      onProductClick(product);
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [onQuickCheckout, onProductClick, selectInstantVariant]);

  const handleAddProductToCartFromCard = useCallback((product: Product) => {
    if (onAddToCart) {
      onAddToCart(product, 1, selectInstantVariant(product));
    } else {
      onProductClick(product);
    }
  }, [onAddToCart, onProductClick, selectInstantVariant]);

  const handleQuickViewOrder = useCallback((product: Product, quantity: number, variant: ProductVariantSelection) => {
    if (onQuickCheckout) {
      onQuickCheckout(product, quantity, variant);
    } else {
      onProductClick(product);
    }
    setQuickViewProduct(null);
  }, [onQuickCheckout, onProductClick, setQuickViewProduct]);

  const flashSaleCountdown = [
    { label: 'Hours', value: formatSegment(flashTimeLeft.hours) },
    { label: 'Mins', value: formatSegment(flashTimeLeft.minutes) },
    { label: 'Sec', value: formatSegment(flashTimeLeft.seconds) }
  ];

  // === CATEGORY VIEW ===
  if (selectedCategoryView) {
    return (
      <Suspense fallback={<SectionSkeleton />}>
        <StoreCategoryProducts
          products={displayProducts}
          categories={categories}
          subCategories={subCategories}
          childCategories={childCategories}
          brands={brands}
          tags={tags}
          selectedCategory={selectedCategoryView}
          onCategoryChange={(category) => category ? handleCategoryClick(category) : handleClearCategoryFilter()}
          onBack={handleClearCategoryFilter}
          onHome={handleClearCategoryFilter}
          onProductClick={onProductClick}
          onBuyNow={handleBuyNow}
          onQuickView={setQuickViewProduct}
          onAddToCart={handleAddProductToCartFromCard}
          websiteConfig={websiteConfig}
          logo={logo}
          user={user}
          wishlistCount={wishlistCount}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
          cart={cart}
          onToggleCart={onToggleCart}
          onCheckoutFromCart={onCheckoutFromCart}
          onLoginClick={onLoginClick}
          onLogoutClick={onLogoutClick}
          onProfileClick={onProfileClick}
          onOpenChat={onOpenChat}
          onImageSearchClick={onImageSearchClick}
          orders={orders}
        />
      </Suspense>
    );
  }

  // === MAIN RENDER ===
  return (
    <div className="min-h-screen font-sans text-slate-900" style={{ background: 'linear-gradient(to bottom, #f0f4f8, #e8ecf1)' }}>
      <StoreHeader 
        onTrackOrder={() => setIsTrackOrderOpen(true)} 
        productCatalog={activeProducts}
        wishlistCount={wishlistCount}
        wishlist={wishlist}
        onToggleWishlist={onToggleWishlist}
        cart={cart}
        onToggleCart={onToggleCart}
        onCheckoutFromCart={onCheckoutFromCart}
        user={user}
        onLoginClick={onLoginClick}
        onLogoutClick={onLogoutClick}
        onProfileClick={onProfileClick}
        logo={logo}
        websiteConfig={websiteConfig}
        searchValue={searchTerm}
        onSearchChange={updateSearchTerm}
        onCategoriesClick={handleCategoriesNav}
        onProductsClick={handleProductsNav}
        categoriesList={categories.map((cat) => cat.name)}
        onCategorySelect={handleCategoryClick}
        onProductClick={onProductClick}
        categories={categories}
        subCategories={subCategories}
        childCategories={childCategories}
        brands={brands}
        tags={tags}
        onMobileMenuOpenRef={onMobileMenuOpenRef}
        tenantId={tenantId}
      />
      
      {/* Track Order Modal */}
      {isTrackOrderOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full" /></div>}>
          <TrackOrderModal onClose={() => setIsTrackOrderOpen(false)} orders={orders} />
        </Suspense>
      )}
     
      {/* Quick View Modal */}
      {quickViewProduct && (
        <Suspense fallback={null}>
          <ProductQuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
            onCompleteOrder={handleQuickViewOrder}
            onViewDetails={(product) => {
              setQuickViewProduct(null);
              onProductClick(product);
            }}
          />
        </Suspense>
      )}
      
      {/* Conditional: Custom Layout vs Default Layout */}
      {customLayoutLoading ? (
        // Show loading skeleton while checking Store Studio status
        <StoreHomeSkeleton />
      ) : useCustomLayout ? (
        <Suspense fallback={<StoreHomeSkeleton />}>
          <StoreFrontRenderer
            tenantId={tenantId || ""}
            products={products}
            categories={categories}
            subCategories={subCategories}
            childCategories={childCategories}
            brands={brands}
            tags={tags}
            websiteConfig={websiteConfig}
            logo={logo}
            onProductClick={onProductClick}
            onBuyNow={handleBuyNow}
            onQuickView={setQuickViewProduct}
            onAddToCart={handleAddProductToCartFromCard}
            onCategoryClick={handleCategoryClick}
            onBrandClick={(slug) => handleCategoryClick(slug)}
            onOpenChat={onOpenChat}
          />
        </Suspense>
      ) : (
        <>
      {/* Hero Section */}
      <section className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 pt-3">
      <HeroSection carouselItems={websiteConfig?.carouselItems} websiteConfig={websiteConfig} />
      </section>

      {/* Categories Section */}
      {displayCategories.length > 0 && (
        <section ref={categoriesSectionRef} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 pt-0">
          <CategoriesSection
            style={(websiteConfig?.categorySectionStyle as any) || 'style6'}
            categories={displayCategories}
            onCategoryClick={handleCategoryClick}
            categoryScrollRef={categoryScrollRef as React.RefObject<HTMLDivElement>}
          />
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3 pb-3" style={{ minHeight: '680px', contain: 'layout' }}>
        {hasSearchQuery ? (
          <Suspense fallback={<SearchResultsSkeleton />}>
            <SearchResultsSection
              searchTerm={searchTerm.trim()}
              products={sortedProducts}
              sortOption={sortOption}
              onSortChange={setSortOption}
              onClearSearch={() => {
                updateSearchTerm('');
                setSortOption('relevance');
              }}
              onProductClick={onProductClick}
              onBuyNow={handleBuyNow}
              onQuickView={setQuickViewProduct}
              onAddToCart={handleAddProductToCartFromCard}
              productCardStyle={websiteConfig?.productCardStyle}
            />
          </Suspense>
        ) : (
          <>
            {/* Flash Deals */}
            {flashSalesProducts.length > 0 && (
              <Suspense fallback={<FlashSalesSkeleton />}>
                <FlashSalesSection
                  products={flashSalesProducts}
                  showCounter={showFlashSaleCounter}
                  countdown={flashSaleCountdown}
                  onProductClick={onProductClick}
                  onBuyNow={handleBuyNow}
                  onQuickView={setQuickViewProduct}
                  onAddToCart={handleAddProductToCartFromCard}
                  productCardStyle={websiteConfig?.productCardStyle}
                  sectionRef={productsSectionRef as React.RefObject<HTMLElement>}
                />
              </Suspense>
            )}

            {/* Showcase Section */}
            {bestSaleProducts.length > 0 && websiteConfig?.showcaseSectionStyle && websiteConfig.showcaseSectionStyle !== 'none' && (
              <Suspense fallback={<ShowcaseSkeleton />}>
                <LazySection fallback={<ShowcaseSkeleton />} rootMargin="0px 0px 300px" minHeight="400px">
                  <ShowcaseSection
                    products={bestSaleProducts.slice(0, 12)}
                    onProductClick={onProductClick}
                    onBuyNow={handleBuyNow}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={handleAddProductToCartFromCard}
                    productCardStyle={websiteConfig?.productCardStyle}
                    style={websiteConfig?.showcaseSectionStyle}
                  />
                </LazySection>
              </Suspense>
            )}

            {/* Brand Section */}
            {brands && brands.length > 0 && websiteConfig?.brandSectionStyle && websiteConfig.brandSectionStyle !== 'none' && (
              <Suspense fallback={<BrandSkeleton />}>
                <LazySection fallback={<BrandSkeleton />} rootMargin="0px 0px 300px" minHeight="200px">
                  <BrandSection
                    brands={brands}
                    onBrandClick={(brand) => handleCategoryClick(`brand:${brand.slug || brand.name}`)}
                    style={websiteConfig?.brandSectionStyle}
                  />
                </LazySection>
              </Suspense>
            )}

            {/* Best Sale Products */}
            {bestSaleProducts.length > 0 && (
              <Suspense fallback={<ProductGridSkeleton count={10} />}>
                <LazySection fallback={<ProductGridSkeleton count={10} />} rootMargin="0px 0px 300px" minHeight="400px">
                  <ProductGridSection
                    title="Best Sale Products"
                    products={bestSaleProducts}
                    accentColor="green"
                    keyPrefix="best"
                    maxProducts={10}
                    reverseOrder={true}
                    onProductClick={onProductClick}
                    onBuyNow={handleBuyNow}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={handleAddProductToCartFromCard}
                    productCardStyle={websiteConfig?.productCardStyle}
                    productSectionStyle={websiteConfig?.productSectionStyle}
                  />
                </LazySection>
              </Suspense>
            )}

            {/* Popular Products */}
            {popularProducts.length > 0 && (
              <Suspense fallback={<ProductGridSkeleton count={10} />}>
                <LazySection fallback={<ProductGridSkeleton count={10} />} rootMargin="0px 0px 300px" minHeight="400px">
                  <ProductGridSection
                    title="Popular products"
                    products={popularProducts}
                    accentColor="purple"
                    keyPrefix="pop"
                    maxProducts={10}
                    reverseOrder={false}
                    onProductClick={onProductClick}
                    onBuyNow={handleBuyNow}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={handleAddProductToCartFromCard}
                    productCardStyle={websiteConfig?.productCardStyle}
                    productSectionStyle={websiteConfig?.productSectionStyle}
                  />
                </LazySection>
              </Suspense>
            )}

            {/* All Products */}
            {activeProducts.length > 0 && (
              <Suspense fallback={<ProductGridSkeleton count={10} />}>
                <LazySection fallback={<ProductGridSkeleton count={10} />} rootMargin="0px 0px 300px" minHeight="500px">
                  <ProductGridSection
                    title="Our Products"
                    products={activeProducts}
                    accentColor="blue"
                    keyPrefix="all"
                    maxProducts={50}
                    reverseOrder={false}
                    onProductClick={onProductClick}
                    onBuyNow={handleBuyNow}
                    onQuickView={setQuickViewProduct}
                    onAddToCart={handleAddProductToCartFromCard}
                    productCardStyle={websiteConfig?.productCardStyle}
                    productSectionStyle={websiteConfig?.productSectionStyle}
                  />
                </LazySection>
              </Suspense>
            )}

            {/* Tag-based Product Sections */}
            {tags?.filter(t => !t.status || t.status === 'Active' || t.status?.toLowerCase() === 'active').map((tag, idx) => {
              const tagProducts = activeProducts.filter(p => 
                Array.isArray(p.tags) && p.tags.some((pt: any) => (typeof pt === 'string' ? pt : pt?.name)?.toLowerCase() === tag.name?.toLowerCase())
              );
              if (!tagProducts.length) return null;
              const colors = ['purple', 'orange', 'blue', 'green', 'purple'] as const;
              return (
                <Suspense key={tag.id || tag.name} fallback={<ProductGridSkeleton count={10} />}>
                  <LazySection fallback={<ProductGridSkeleton count={10} />} rootMargin="0px 0px 300px" minHeight="400px">
                    <ProductGridSection
                      title={`#${tag.name}`}
                      products={tagProducts}
                      accentColor={colors[idx % colors.length] as 'purple' | 'orange' | 'blue' | 'green'}
                      keyPrefix={`tag-${tag.name}`}
                      maxProducts={10}
                      reverseOrder={false}
                      onProductClick={onProductClick}
                      onBuyNow={handleBuyNow}
                      onQuickView={setQuickViewProduct}
                      onAddToCart={handleAddProductToCartFromCard}
                      productCardStyle={websiteConfig?.productCardStyle}
                      productSectionStyle={websiteConfig?.productSectionStyle}
                    />
                  </LazySection>
                </Suspense>
              );
            })}
          </>
        )}
      </main>

      {/* Footer */}
      <Suspense fallback={<FooterSkeleton />}>
        <StoreFooter websiteConfig={websiteConfig} logo={logo} onOpenChat={onOpenChat} />
      </Suspense>
      
        </>
      )}
      {/* Popup */}
      {activePopup && (
        <Suspense fallback={null}>
          <StorePopup
            popup={activePopup}
            onClose={handleClosePopup}
            onNavigate={handlePopupNavigate}
          />
        </Suspense>
      )}

      {/* Scroll to Top Button */}
      <button
        className={`fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-purple-500 backdrop-blur-md border border-white/30 text-white rounded-full p-3 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
          showScrollToTop ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
};

export default StoreHome;
