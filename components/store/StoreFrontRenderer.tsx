/**
 * StoreFrontRenderer
 * 
 * This component renders the store front dynamically based on the saved layout
 * from the Page Builder. It fetches the store_layout from the backend and
 * renders sections in the order they were saved.
 */

import React, { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react';
import { HeroSection } from './HeroSection';
import { CategoriesSection } from './CategoriesSection';
import { 
  SectionSkeleton, 
  FlashSalesSkeleton,
  ShowcaseSkeleton,
  BrandSkeleton,
  ProductGridSkeleton,
} from './skeletons';
import type { Product, WebsiteConfig } from '../../types';
import { noCacheFetchOptions } from '../../utils/fetchHelpers';
import { onDataRefresh } from '../../services/DataService';

// Lazy loaded sections
const FlashSalesSection = lazy(() => import('./FlashSalesSection').then(m => ({ default: m.FlashSalesSection })));
const ProductGridSection = lazy(() => import('./ProductGridSection').then(m => ({ default: m.ProductGridSection })));
const ShowcaseSection = lazy(() => import('./ShowcaseSection').then(m => ({ default: m.ShowcaseSection })));
const BrandSection = lazy(() => import('./BrandSection').then(m => ({ default: m.BrandSection })));
const TagsSection = lazy(() => import('./TagsSection').then(m => ({ default: m.TagsSection })));
const LazySection = lazy(() => import('./LazySection').then(m => ({ default: m.LazySection })));
const StoreFooter = lazy(() => import('./StoreFooter').then(m => ({ default: m.StoreFooter })));

// Types
interface PlacedSection {
  id: string;
  type: string;
  name: string;
  visible: boolean;
  settings: Record<string, any>;
  blocks: any[];
}

interface StoreLayoutData {
  sections: PlacedSection[];
  publishedAt?: string;
  updatedAt?: string;
  version?: number;
}

interface ProductVariant {
  [key: string]: any;
}

interface SectionSettings {
  [key: string]: any;
}

interface AddToCartParams {
  product: Product;
  quantity: number;
  variant: ProductVariant;
}

interface FlashSaleProduct extends Product {
  flashSale?: boolean;
  flashSaleStartDate?: string;
  flashSaleEndDate?: string;
}

interface ConfigData {
  enabled: boolean;
  productDisplayOrder: number[];
}

interface StoreFrontRendererProps {
  tenantId: string;
  products: Product[];
  categories?: any[];
  subCategories?: any[];
  childCategories?: any[];
  brands?: any[];
  tags?: any[];
  websiteConfig?: WebsiteConfig;
  logo?: string | null;
  onProductClick: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number, variant: any) => void;
  onCategoryClick?: (categorySlug: string) => void;
  onBrandClick?: (brandSlug: string) => void;
  onOpenChat?: () => void;
}

// Helper to compute flash sales countdown
const useFlashSaleCountdown = () => {
  const [countdown, setCountdown] = useState<{ label: string; value: string; }[]>([
    { label: 'Hours', value: '23' },
    { label: 'Minutes', value: '59' },
    { label: 'Seconds', value: '59' }
  ]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let hours = parseInt(prev[0].value);
        let minutes = parseInt(prev[1].value);
        let seconds = parseInt(prev[2].value);
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return [
          { label: 'Hours', value: String(hours).padStart(2, '0') },
          { label: 'Minutes', value: String(minutes).padStart(2, '0') },
          { label: 'Seconds', value: String(seconds).padStart(2, '0') }
        ];
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  return countdown;
};

export const StoreFrontRenderer: React.FC<StoreFrontRendererProps> = ({
  tenantId,
  products,
  categories = [],
  subCategories = [],
  childCategories = [],
  brands = [],
  tags = [],
  websiteConfig,
  logo,
  onProductClick,
  onBuyNow,
  onQuickView,
  onAddToCart,
  onCategoryClick,
  onBrandClick,
  onOpenChat,
}) => {
  const [layout, setLayout] = useState<StoreLayoutData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeStudioEnabled, setStoreStudioEnabled] = useState(false);
  const [productDisplayOrder, setProductDisplayOrder] = useState<number[]>([]);

  const flashSaleCountdown = useFlashSaleCountdown();

  // Memoized fallback handlers to prevent re-renders
  const noopHandler = useCallback(() => {}, []);
  const handleBuyNowFallback = useCallback((p: Product) => onBuyNow?.(p), [onBuyNow]);
  const handleQuickViewFallback = useCallback((p: Product) => onQuickView?.(p), [onQuickView]);
  const handleAddToCartFallback = useCallback((p: Product) => onAddToCart?.(p, 1, {}), [onAddToCart]);
  const handleBrandClickFallback = useCallback((brand: any) => onBrandClick?.(`brand:${brand.slug || brand.name}`), [onBrandClick]);

  // Apply product display order if store studio is enabled
  const orderedProducts = useMemo(() => {
    if (!storeStudioEnabled || !productDisplayOrder || productDisplayOrder.length === 0) {
      return products;
    }

    // Create a map for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]));
    
    // Build ordered array based on saved order
    const ordered = productDisplayOrder
      .map(id => productMap.get(id))
      .filter((p): p is Product => p !== undefined);
    
    // Add any products not in the saved order at the end
    const unorderedProducts = products.filter(
      p => !productDisplayOrder.includes(p.id)
    );
    
    return [...ordered, ...unorderedProducts];
  }, [products, productDisplayOrder, storeStudioEnabled]);

  // Compute product lists using ordered products
  const { flashSalesProducts, bestSaleProducts, popularProducts, newArrivalProducts, activeProducts } = useMemo(() => {
    const now = new Date();
    const active = orderedProducts.filter(p => p.status === 'Active' || !p.status);
    
    // Flash Sale: products with flashSale flag OR tagged "Flash Sale"
    const flash = active.filter(p => {
      const hasFlashTag = (p as any).tags?.includes('Flash Sale');
      if ((p as any).flashSale) {
        const start = (p as any).flashSaleStartDate ? new Date((p as any).flashSaleStartDate) : null;
        const end = (p as any).flashSaleEndDate ? new Date((p as any).flashSaleEndDate) : null;
        if (start && now < start) return false;
        if (end && now > end) return false;
        return true;
      }
      return hasFlashTag;
    });

    // Best Sale: top sold products
    const bestSale = active
      .filter(p => (p.totalSold || 0) > 0)
      .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
      .slice(0, 12);

    // Most Popular: tagged "Most Popular" OR high rating
    const popular = active
      .filter(p => (p as any).tags?.includes('Most Popular') || (p.rating || 0) >= 4)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 12);

    // New Arrival: tagged "New Arrival"
    const newArrival = active
      .filter(p => (p as any).tags?.includes('New Arrival'))
      .slice(0, 12);

    return { 
      flashSalesProducts: flash, 
      bestSaleProducts: bestSale, 
      popularProducts: popular,
      newArrivalProducts: newArrival,
      activeProducts: active 
    };
  }, [orderedProducts]);

  // Shared function to fetch and update store studio config and layout
  const fetchAndUpdateConfigAndLayout = useCallback(async () => {
    if (!tenantId) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      // Fetch both store studio config and layout in parallel
      const [configResponse, layoutResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tenant-data/${tenantId}/store_studio_config`, noCacheFetchOptions),
        fetch(`${API_BASE_URL}/api/tenant-data/${tenantId}/store_layout`, noCacheFetchOptions)
      ]);

      // Check if store studio is enabled
      if (configResponse.ok) {
        const configResult = await configResponse.json();
        const isEnabled = configResult.data?.enabled || false;
        const displayOrder = configResult.data?.productDisplayOrder || [];
        
        setStoreStudioEnabled(isEnabled);
        setProductDisplayOrder(displayOrder);
        
        // Only use custom layout if store studio is enabled
        if (isEnabled && layoutResponse.ok) {
          const layoutResult = await layoutResponse.json();
          if (layoutResult.data?.sections?.length > 0) {
            setLayout(layoutResult.data);
          } else {
            setLayout(null);
          }
        } else {
          setLayout(null);
        }
      }
    } catch (e) {
      console.warn('[StoreFrontRenderer] Error fetching config/layout:', e);
      setError('Failed to load configuration');
    }
  }, [tenantId]);

  // Fetch store studio config and layout from backend on mount
  useEffect(() => {
    const initLayoutAndConfig = async () => {
      if (!tenantId) {
        setIsLoading(false);
        return;
      }

      await fetchAndUpdateConfigAndLayout();
      setIsLoading(false);
    };

    initLayoutAndConfig();
  }, [tenantId, fetchAndUpdateConfigAndLayout]);

  // Listen for real-time updates to store_studio_config and store_layout
  useEffect(() => {
    if (!tenantId) return;

    const unsubscribe = onDataRefresh((key, updatedTenantId, fromSocket) => {
      // Only respond to updates for this tenant
      if (updatedTenantId !== tenantId) return;
      
      // Refetch config and layout when store studio settings change
      if (key === 'store_studio_config' || key === 'store_layout') {
        console.log('[StoreFrontRenderer] Detected update to', key, '- refetching...');
        fetchAndUpdateConfigAndLayout();
      }
    });

    return () => unsubscribe();
  }, [tenantId, fetchAndUpdateConfigAndLayout]);

  // Get products filtered by tag
  const getTagProducts = useCallback((tagName: string) => {
    return activeProducts.filter(p => 
      Array.isArray(p.tags) && p.tags.some((pt: any) => 
        (typeof pt === 'string' ? pt : pt?.name)?.toLowerCase() === tagName.toLowerCase()
      )
    );
  }, [activeProducts]);

  // Render a section based on its type
  const renderSection = useCallback((section: PlacedSection, idx: number) => {
    if (!section.visible) return null;

    const { type, settings, id } = section;
    const key = `${id}-${idx}`;

    switch (type) {
      case 'announcement-bar':
        if (!settings?.text) return null;
        return (
          <div 
            key={key}
            className="w-full py-2 text-center text-sm"
            style={{ 
              backgroundColor: settings.backgroundColor || '#1a1a2e', 
              color: settings.textColor || '#ffffff' 
            }}
          >
            {settings.text}
          </div>
        );

      case 'hero':
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-2 sm:px-6 lg:px-8 pt-2 sm:pt-3">
            <HeroSection 
              carouselItems={websiteConfig?.carouselItems} 
              websiteConfig={websiteConfig}
            />
          </section>
        );

      case 'categories':
        if (categories.length === 0) return null;
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 pt-0">
            <CategoriesSection
              style={settings?.style || websiteConfig?.categorySectionStyle || 'style6'}
              categories={categories}
              onCategoryClick={onCategoryClick || noopHandler}
            />
          </section>
        );

      case 'flash-sale':
        if (flashSalesProducts.length === 0) return null;
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<FlashSalesSkeleton />}>
              <FlashSalesSection
                products={flashSalesProducts}
                showCounter={settings?.showCountdown !== false}
                countdown={flashSaleCountdown}
                onProductClick={onProductClick}
                onBuyNow={handleBuyNowFallback}
                onQuickView={handleQuickViewFallback}
                onAddToCart={handleAddToCartFallback}
                productCardStyle={websiteConfig?.productCardStyle}
              />
            </Suspense>
          </section>
        );

      case 'product-grid':
        const gridProducts = settings?.filterType === 'best-sale' ? bestSaleProducts
          : settings?.filterType === 'popular' ? popularProducts
          : settings?.filterType === 'new-arrival' ? newArrivalProducts
          : activeProducts;
        if (gridProducts.length === 0) return null;
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<ProductGridSkeleton count={settings?.productsToShow || 12} />}>
              <LazySection fallback={<ProductGridSkeleton count={settings?.productsToShow || 12} />} rootMargin="0px 0px 300px" minHeight="400px">
                <ProductGridSection
                  title={settings?.heading || 'Products'}
                  products={gridProducts}
                  accentColor="blue"
                  keyPrefix={`grid-${id}`}
                  maxProducts={settings?.productsToShow || 12}
                  reverseOrder={false}
                  onProductClick={onProductClick}
                  onBuyNow={handleBuyNowFallback}
                  onQuickView={handleQuickViewFallback}
                  onAddToCart={handleAddToCartFallback}
                  productCardStyle={websiteConfig?.productCardStyle}
                  productSectionStyle={websiteConfig?.productSectionStyle}
                  showSoldCount={websiteConfig?.showProductSoldCount}
                />
              </LazySection>
            </Suspense>
          </section>
        );

      case 'brands':
        if (brands.length === 0) return null;
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<BrandSkeleton />}>
              <LazySection fallback={<BrandSkeleton />} rootMargin="0px 0px 300px" minHeight="200px">
                <BrandSection
                  brands={brands}
                  onBrandClick={onBrandClick ? handleBrandClickFallback : undefined}
                  style={settings?.style || websiteConfig?.brandSectionStyle}
                />
              </LazySection>
            </Suspense>
          </section>
        );

      case 'testimonials':
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-6">{settings?.heading || 'What Our Customers Say'}</h2>
              <p className="text-gray-600">Customer testimonials will be displayed here</p>
            </div>
          </section>
        );

      case 'newsletter':
        return (
          <section 
            key={key} 
            className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-12"
            style={{ backgroundColor: settings?.backgroundColor || '#f8f9fa' }}
          >
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-2">{settings?.heading || 'Subscribe to our newsletter'}</h2>
              <p className="text-gray-600 mb-4">{settings?.subheading || 'Get the latest updates and offers.'}</p>
              <form className="flex gap-2 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button 
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {settings?.buttonText || 'Subscribe'}
                </button>
              </form>
            </div>
          </section>
        );

      case 'rich-text':
        return (
          <section 
            key={key} 
            className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
            style={{ backgroundColor: settings?.backgroundColor || 'transparent' }}
          >
            <div 
              className="prose max-w-none"
              style={{ 
                maxWidth: settings?.maxWidth || '800px', 
                margin: '0 auto',
                textAlign: settings?.textAlign || 'center' 
              }}
              dangerouslySetInnerHTML={{ __html: settings?.content || 'Add your content here...' }}
            />
          </section>
        );

      case 'image-with-text':
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className={`flex flex-col ${settings?.imagePosition === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}>
              <div className="flex-1">
                {settings?.imageUrl ? (
                  <img src={settings.imageUrl} alt={settings?.heading || ''} className="rounded-lg w-full" />
                ) : (
                  <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
                    <span className="text-gray-400">Image placeholder</span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-4">{settings?.heading || 'Section Title'}</h2>
                <p className="text-gray-600 mb-4">{settings?.text || 'Add your content here...'}</p>
                {settings?.buttonText && (
                  <a 
                    href={settings?.buttonLink || '#'} 
                    className="inline-block px-3 sm:px-4 lg:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    {settings.buttonText}
                  </a>
                )}
              </div>
            </div>
          </section>
        );

      case 'tags-products':
        const tagProducts = settings?.tagName ? getTagProducts(settings.tagName) : [];
        if (tagProducts.length === 0) return null;
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<ProductGridSkeleton count={settings?.productsToShow || 8} />}>
              <LazySection fallback={<ProductGridSkeleton count={settings?.productsToShow || 8} />} rootMargin="0px 0px 300px" minHeight="400px">
                <ProductGridSection
                  title={settings?.title || `#${settings?.tagName}`}
                  products={tagProducts}
                  accentColor="purple"
                  keyPrefix={`tag-${settings?.tagName}`}
                  maxProducts={settings?.productsToShow || 8}
                  reverseOrder={false}
                  onProductClick={onProductClick}
                  onBuyNow={handleBuyNowFallback}
                  onQuickView={handleQuickViewFallback}
                  onAddToCart={handleAddToCartFallback}
                  productCardStyle={websiteConfig?.productCardStyle}
                  productSectionStyle={websiteConfig?.productSectionStyle}
                  showSoldCount={websiteConfig?.showProductSoldCount}
                />
              </LazySection>
            </Suspense>
          </section>
        );

      case 'image-banner':
        return (
          <section key={key} className="w-full">
            {settings?.imageUrl ? (
              <div className="relative" style={{ minHeight: settings?.height === 'large' ? '500px' : settings?.height === 'small' ? '200px' : '350px' }}>
                <img 
                  src={settings.imageUrl} 
                  alt={settings?.heading || 'Banner'} 
                  className="w-full h-full object-cover absolute inset-0"
                />
                {(settings?.heading || settings?.subheading || settings?.buttonText) && (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4"
                    style={{ backgroundColor: `rgba(0,0,0,${(settings?.overlayOpacity || 30) / 100})` }}
                  >
                    {settings?.heading && <h2 className="text-3xl md:text-5xl font-bold mb-4">{settings.heading}</h2>}
                    {settings?.subheading && <p className="text-lg md:text-xl mb-6 max-w-2xl">{settings.subheading}</p>}
                    {settings?.buttonText && (
                      <a href={settings?.buttonLink || '#'} className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition">
                        {settings.buttonText}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-200 py-20 text-center">
                <p className="text-gray-400">Image banner - Add an image URL</p>
              </div>
            )}
          </section>
        );

      case 'video':
        const getYoutubeId = (url: string) => {
          const match = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
          return match ? match[1] : null;
        };
        const youtubeId = settings?.videoUrl ? getYoutubeId(settings.videoUrl) : null;
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {settings?.heading && <h2 className="text-2xl font-bold text-center mb-6">{settings.heading}</h2>}
            <div className="relative" style={{ paddingBottom: settings?.aspectRatio === '4:3' ? '75%' : '56.25%' }}>
              {youtubeId ? (
                <iframe
                  className="absolute inset-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=${settings?.autoplay ? 1 : 0}&mute=${settings?.muted ? 1 : 0}&loop=${settings?.loop ? 1 : 0}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : settings?.videoUrl ? (
                <video
                  className="absolute inset-0 w-full h-full rounded-lg object-cover"
                  src={settings.videoUrl}
                  autoPlay={settings?.autoplay}
                  muted={settings?.muted}
                  loop={settings?.loop}
                  controls
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Video - Add a video URL</p>
                </div>
              )}
            </div>
          </section>
        );

      case 'map':
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {settings?.heading && <h2 className="text-2xl font-bold text-center mb-6">{settings.heading}</h2>}
            {settings?.address ? (
              <div className="rounded-lg overflow-hidden" style={{ height: settings?.mapHeight || 400 }}>
                <iframe
                  className="w-full h-full border-0"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(settings.address)}`}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="bg-gray-200 rounded-lg flex items-center justify-center" style={{ height: settings?.mapHeight || 400 }}>
                <p className="text-gray-400">Map - Add an address</p>
              </div>
            )}
          </section>
        );

      case 'slideshow':
        const slides = settings?.slides || [];
        return (
          <section key={key} className="w-full relative overflow-hidden" style={{ minHeight: '400px' }}>
            {slides.length > 0 ? (
              <div className="relative h-full">
                {slides.map((slide: any, idx: number) => (
                  <div key={idx} className={`${idx === 0 ? 'block' : 'hidden'}`}>
                    <img src={slide.imageUrl} alt={slide.heading || `Slide ${idx + 1}`} className="w-full h-96 object-cover" />
                    {(slide.heading || slide.subheading) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-black/30">
                        {slide.heading && <h2 className="text-3xl font-bold mb-2">{slide.heading}</h2>}
                        {slide.subheading && <p className="text-lg">{slide.subheading}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-200 h-96 flex items-center justify-center">
                <p className="text-gray-400">Slideshow - Add slides</p>
              </div>
            )}
          </section>
        );

      case 'multicolumn':
        const columnContent = settings?.columnContent || [];
        const numColumns = settings?.columns || 3;
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {settings?.heading && <h2 className="text-2xl font-bold text-center mb-8">{settings.heading}</h2>}
            <div className={`grid grid-cols-1 md:grid-cols-${numColumns} gap-6`}>
              {columnContent.length > 0 ? columnContent.map((col: any, idx: number) => (
                <div key={idx} className="text-center p-4">
                  {col.imageUrl && <img src={col.imageUrl} alt={col.heading || ''} className="w-16 h-16 mx-auto mb-4 object-cover rounded-full" />}
                  {col.heading && <h3 className="font-semibold mb-2">{col.heading}</h3>}
                  {col.text && <p className="text-gray-600 text-sm">{col.text}</p>}
                </div>
              )) : (
                Array.from({ length: numColumns }).map((_, idx) => (
                  <div key={idx} className="bg-gray-100 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
                    <p className="text-gray-400">Column {idx + 1}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        );

      case 'collapsible-content':
        const faqItems = settings?.items || [];
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {settings?.heading && <h2 className="text-2xl font-bold text-center mb-8">{settings.heading}</h2>}
            <div className="max-w-3xl mx-auto space-y-3">
              {faqItems.length > 0 ? faqItems.map((item: any, idx: number) => (
                <details key={idx} className="border border-gray-200 rounded-lg" open={settings?.openFirst && idx === 0}>
                  <summary className="p-4 cursor-pointer font-medium hover:bg-gray-50">{item.question || `Question ${idx + 1}`}</summary>
                  <div className="p-4 pt-0 text-gray-600">{item.answer || 'Answer...'}</div>
                </details>
              )) : (
                <div className="bg-gray-100 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
                  <p className="text-gray-400">Add FAQ items</p>
                </div>
              )}
            </div>
          </section>
        );

      case 'contact-form':
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="max-w-2xl mx-auto text-center">
              {settings?.heading && <h2 className="text-2xl font-bold mb-2">{settings.heading}</h2>}
              {settings?.subheading && <p className="text-gray-600 mb-8">{settings.subheading}</p>}
              <form className="space-y-4 text-left">
                <input type="text" placeholder="Your Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                <input type="email" placeholder="Your Email" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                <textarea placeholder="Your Message" rows={4} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                <button type="submit" className="w-full px-3 sm:px-4 lg:px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                  Send Message
                </button>
              </form>
            </div>
          </section>
        );

      case 'custom-html':
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {settings?.html ? (
              <div dangerouslySetInnerHTML={{ __html: settings.html }} />
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
                <p className="text-gray-400">Custom HTML - Add HTML code</p>
              </div>
            )}
          </section>
        );

      case 'header':
        // Header is typically handled by StoreHeader component, skip here
        return null;

      case 'footer':
        return (
          <Suspense key={key} fallback={<SectionSkeleton />}>
            <StoreFooter websiteConfig={websiteConfig} logo={logo} onOpenChat={onOpenChat} />
          </Suspense>
        );

      default:
        // Unknown section type - render placeholder
        return (
          <section key={key} className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gray-100 rounded-lg p-4 sm:p-6 lg:p-8 text-center">
              <p className="text-gray-500">Section: {section.name || type}</p>
            </div>
          </section>
        );
    }
  }, [
    websiteConfig, categories, brands, tags,
    flashSalesProducts, bestSaleProducts, popularProducts, newArrivalProducts, activeProducts,
    flashSaleCountdown, getTagProducts,
    onProductClick, onBuyNow, onQuickView, onAddToCart, onCategoryClick, onBrandClick, onOpenChat,
    logo
  ]);

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <SectionSkeleton />
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    );
  }

  // If no custom layout or error, return null (let parent component handle default rendering)
  if (!layout?.sections?.length) {
    return null;
  }

  // Render the custom layout
  return (
    <div className="space-y-3">
      {layout.sections.map((section, idx) => renderSection(section, idx))}
    </div>
  );
};

export default StoreFrontRenderer;
