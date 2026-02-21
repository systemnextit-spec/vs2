import React, { memo, useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Search, User, Heart, ArrowRight, Menu } from 'lucide-react';
import type { Product, WebsiteConfig } from '../../types';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';

interface StoreFrontThemeProps {
  products: Product[];
  categories: any[];
  brands: any[];
  websiteConfig?: WebsiteConfig;
  logo?: string | null;
  onProductClick: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number, variant: any) => void;
  onCategoryClick?: (categorySlug: string) => void;
  onOpenChat?: () => void;
}

const ACCENT = '#4ea674';
const DARK = '#023337';
const LIGHT_GREEN = '#eaf8e7';

// Star rating component
const StarRating = memo(({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={14} className={i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
    ))}
  </div>
));
StarRating.displayName = 'StarRating';

// Product Card
const SFProductCard = memo(({ product, onClick, onAddToCart }: {
  product: Product;
  onClick: () => void;
  onAddToCart?: () => void;
}) => {
  const img = product.galleryImages?.[0] || product.image;
  const price = product.salePrice || product.price || 0;
  const originalPrice = product.price && product.salePrice && product.price > product.salePrice ? product.price : null;
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col" onClick={onClick}>
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {img ? (
          <img src={normalizeImageUrl(img)} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ShoppingCart size={48} />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{discount}% OFF</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-bold text-gray-900 text-base line-clamp-1" style={{ fontFamily: "'Lato', sans-serif" }}>{product.title}</h3>
        <p className="text-gray-500 text-sm line-clamp-2" style={{ fontFamily: "'Lato', sans-serif" }}>
          {product.description || product.description?.replace(/<[^>]*>/g, '').slice(0, 80) || ''}
        </p>
        <StarRating rating={product.rating || 4} />
        <div className="flex items-end gap-2 mt-auto">
          <span className="font-bold text-lg" style={{ color: ACCENT, fontFamily: "'Lato', sans-serif" }}>
            ৳{price}
          </span>
          {originalPrice && (
            <span className="text-gray-400 text-sm line-through">৳{originalPrice}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm" style={{ color: ACCENT, fontFamily: "'Lato', sans-serif" }}>View Details</span>
          <button
            onClick={(e) => { e.stopPropagation(); onAddToCart?.(); }}
            className="ml-auto px-4 py-2 rounded-full text-white text-sm font-bold transition-colors hover:opacity-90"
            style={{ backgroundColor: ACCENT }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
});
SFProductCard.displayName = 'SFProductCard';

// Section Header
const SectionHeader = memo(({ title, onViewAll }: { title: string; onViewAll?: () => void }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "'Lato', sans-serif" }}>{title}</h2>
    {onViewAll && (
      <button onClick={onViewAll} className="px-5 py-2 rounded-full border border-gray-900 text-gray-900 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors" style={{ fontFamily: "'Lato', sans-serif" }}>
        View All
      </button>
    )}
  </div>
));
SectionHeader.displayName = 'SectionHeader';

// Hero Banner Section
const HeroBanner = memo(({ websiteConfig, categories, onCategoryClick }: {
  websiteConfig?: WebsiteConfig;
  categories: any[];
  onCategoryClick?: (slug: string) => void;
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselItems = websiteConfig?.carouselItems || [];
  const currentItem = carouselItems[currentSlide] || null;

  useEffect(() => {
    if (carouselItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const heroImage = currentItem?.imageUrl || currentItem?.image || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80';

  return (
    <div className="relative">
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ backgroundColor: DARK }}>
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center min-h-[300px] md:min-h-[420px]">
          <div className="relative z-10 px-6 md:px-12 py-10 md:py-0 flex-1 max-w-xl">
            <h1 className="text-white text-3xl md:text-4xl lg:text-5xl leading-tight mb-6" style={{ fontFamily: "'Lato', sans-serif", textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
              {currentItem?.title || 'Discover the Latest Deals –'}{' '}
              <span className="font-bold italic">{currentItem?.subtitle || 'Up to 50% Off!'}</span>
            </h1>
            <a href="#" className="inline-flex items-center justify-center px-8 py-3 rounded-full font-bold text-base transition-colors hover:opacity-90" style={{ backgroundColor: LIGHT_GREEN, color: DARK }}>
              Shop Now
            </a>
          </div>
          <div className="flex-1 relative w-full md:w-auto">
            <img src={normalizeImageUrl(heroImage)} alt="Hero" className="w-full h-[250px] md:h-[420px] object-cover" loading="eager" />
          </div>
        </div>

        {carouselItems.length > 1 && (
          <>
            <button onClick={() => setCurrentSlide(p => (p - 1 + carouselItems.length) % carouselItems.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors">
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button onClick={() => setCurrentSlide(p => (p + 1) % carouselItems.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors">
              <ChevronRight size={24} className="text-white" />
            </button>
          </>
        )}

        {/* Dots */}
        {carouselItems.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {carouselItems.map((_: any, i: number) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentSlide ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
HeroBanner.displayName = 'HeroBanner';

// Promo Grid Section - 4 product cards in a grid
const PromoGrid = memo(({ products, onProductClick }: { products: Product[]; onProductClick: (p: Product) => void }) => {
  const promoProducts = products.slice(0, 4);
  if (promoProducts.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {promoProducts.map((p) => {
          const img = p.galleryImages?.[0] || p.image;
          return (
            <div key={p.id} className="relative rounded-xl overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer group h-[180px] md:h-[200px]"
              onClick={() => onProductClick(p)}>
              {img && <img src={normalizeImageUrl(img)} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-bold truncate" style={{ fontFamily: "'Lato', sans-serif" }}>{p.title}</p>
                {p.salePrice && <span className="text-white/90 text-xs font-bold">৳{p.salePrice}</span>}
              </div>
              <button className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-md transition-colors" style={{ backgroundColor: ACCENT }}>
                Shop Now
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
});
PromoGrid.displayName = 'PromoGrid';

// Featured Categories Section
const FeaturedCategories = memo(({ categories, onCategoryClick }: { categories: any[]; onCategoryClick?: (slug: string) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeCategories = categories.filter(c => c.status === 'Active' || !c.status).slice(0, 8);
  if (activeCategories.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
      <SectionHeader title="Start exploring now" />
      <div className="relative">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {activeCategories.map((cat: any) => {
            const img = cat.image || cat.icon;
            return (
              <button key={cat.id || cat.name} onClick={() => onCategoryClick?.(cat.slug || cat.name)}
                className="flex-shrink-0 w-[160px] md:w-[180px] flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group">
                <div className="w-full h-[120px] md:h-[140px] rounded-lg overflow-hidden bg-gray-50">
                  {img ? (
                    <img src={normalizeImageUrl(img)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingCart size={36} />
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900 text-center line-clamp-1" style={{ fontFamily: "'Lato', sans-serif" }}>{cat.name}</span>
              </button>
            );
          })}
        </div>
        {activeCategories.length > 5 && (
          <button onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
            className="absolute -right-2 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition z-10">
            <ChevronRight size={28} className="text-gray-700" />
          </button>
        )}
      </div>
    </section>
  );
});
FeaturedCategories.displayName = 'FeaturedCategories';

// Best Selling Products Section - mixed layout
const BestSellingSection = memo(({ products, onProductClick }: { products: Product[]; onProductClick: (p: Product) => void }) => {
  const best = products.slice(0, 5);
  if (best.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
      <SectionHeader title="Best selling product" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
        {best.map((p, i) => {
          const img = p.galleryImages?.[0] || p.image;
          const isLarge = i === best.length - 1;
          return (
            <div key={p.id} onClick={() => onProductClick(p)}
              className={`relative rounded-xl overflow-hidden cursor-pointer group ${isLarge ? 'md:col-span-1 md:row-span-2' : ''}`}>
              {img ? (
                <img src={normalizeImageUrl(img)} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center"><ShoppingCart size={36} className="text-gray-300" /></div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex items-end justify-between">
                <span className="text-white font-bold text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>৳{p.salePrice || p.price || 0}</span>
                <button className="px-3 py-1.5 bg-white rounded-full text-xs font-medium text-gray-900 hover:bg-gray-100 transition-colors shadow-sm">
                  Visit store
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
});
BestSellingSection.displayName = 'BestSellingSection';

// Customer Reviews Section
const CustomerReviews = memo(() => {
  const reviews = [
    { name: 'Happy Customer', text: '"Fast delivery and fantastic quality! The customer support team was quick to resolve my query. Earned a loyal customer."' },
    { name: 'Satisfied Buyer', text: '"Amazing products at great prices. I\'ve been shopping here for months and the quality is always consistent."' },
    { name: 'Loyal Shopper', text: '"Best online shopping experience! Easy returns, quick delivery, and awesome product selection."' },
    { name: 'Regular Customer', text: '"Outstanding service! Every order has been perfect. The deals section is my favorite."' },
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: ACCENT, fontFamily: "'Lato', sans-serif" }}>Our Happy Customers</h2>
        <p className="text-gray-600 max-w-xl mx-auto text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
          Don't just take our word for it – see how our products and services have delighted customers across the globe.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: ACCENT }}>
                {r.name[0]}
              </div>
              <span className="font-bold text-lg" style={{ color: DARK, fontFamily: "'Lato', sans-serif" }}>{r.name}</span>
              <div className="ml-auto flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif" }}>{r.text}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <button className="px-8 py-3 rounded-full text-white font-bold text-base transition-colors hover:opacity-90" style={{ backgroundColor: DARK }}>
          GET STARTED
        </button>
      </div>
    </section>
  );
});
CustomerReviews.displayName = 'CustomerReviews';

// Call to Action Section
const CTASection = memo(() => (
  <section className="py-16 text-center" style={{ backgroundColor: LIGHT_GREEN }}>
    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
      <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: DARK, fontFamily: "'Lato', sans-serif" }}>
        Join the Shopping Revolution
      </h2>
      <p className="text-gray-600 max-w-2xl mx-auto mb-8 text-base" style={{ fontFamily: "'Lato', sans-serif" }}>
        Explore a vast marketplace of incredible deals from trusted sellers worldwide. Shop top brands, enjoy fast delivery, and discover exclusive offers.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="px-8 py-3 rounded-full text-white font-bold text-base transition-colors hover:opacity-90" style={{ backgroundColor: DARK }}>
          Start Shopping
        </button>
        <button className="px-8 py-3 rounded-full border-2 font-bold text-base transition-colors hover:bg-gray-50" style={{ borderColor: DARK, color: DARK }}>
          Become a Seller
        </button>
      </div>
    </div>
  </section>
));
CTASection.displayName = 'CTASection';

// Footer Section
const SFFooter = memo(({ logo, websiteConfig }: { logo?: string | null; websiteConfig?: WebsiteConfig }) => {
  const storeName = websiteConfig?.storeName || 'Store';
  return (
    <footer className="text-white py-12" style={{ backgroundColor: DARK }}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            {logo ? (
              <img src={normalizeImageUrl(logo)} alt={storeName} className="h-8 mb-4 object-contain brightness-0 invert" />
            ) : (
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>{storeName}</h3>
            )}
            <p className="text-white/70 text-sm leading-relaxed" style={{ fontFamily: "'Lato', sans-serif" }}>
              Your one-stop destination for quality products at great prices.
            </p>
          </div>
          {['Shop', 'Help', 'Company'].map((section) => (
            <div key={section}>
              <h4 className="font-bold text-base mb-4" style={{ fontFamily: "'Lato', sans-serif" }}>{section}</h4>
              <ul className="space-y-2 text-white/70 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
                {section === 'Shop' && ['All Products', 'Categories', 'Brands', 'Deals'].map(l => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}
                {section === 'Help' && ['FAQ', 'Shipping', 'Returns', 'Contact Us'].map(l => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}
                {section === 'Company' && ['About Us', 'Privacy Policy', 'Terms of Service'].map(l => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/20 pt-6 text-center text-white/50 text-sm" style={{ fontFamily: "'Lato', sans-serif" }}>
          © {new Date().getFullYear()} {storeName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
});
SFFooter.displayName = 'SFFooter';

// Main StoreFront Theme Page
export const StoreFrontThemePage: React.FC<StoreFrontThemeProps> = memo(({
  products,
  categories,
  brands,
  websiteConfig,
  logo,
  onProductClick,
  onBuyNow,
  onAddToCart,
  onCategoryClick,
  onOpenChat,
}) => {
  const activeProducts = useMemo(() =>
    products.filter(p => p.status === 'Active' || !p.status)
  , [products]);

  const trendingProducts = useMemo(() =>
    [...activeProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8)
  , [activeProducts]);

  const bestSelling = useMemo(() =>
    [...activeProducts].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 8)
  , [activeProducts]);

  const newArrivals = useMemo(() =>
    [...activeProducts].slice(0, 4)
  , [activeProducts]);

  const handleAddToCart = useCallback((p: Product) => {
    onAddToCart?.(p, 1, {});
  }, [onAddToCart]);

  return (
    <div className="bg-white min-h-screen" style={{ fontFamily: "'Lato', sans-serif", zoom: 1.25 }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet" />

      {/* Hero Banner */}
      <HeroBanner websiteConfig={websiteConfig} categories={categories} onCategoryClick={onCategoryClick} />

      {/* Promotional Grid */}
      <PromoGrid products={newArrivals} onProductClick={onProductClick} />

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
          <SectionHeader title="Trending Product" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {trendingProducts.map(p => (
              <SFProductCard key={p.id} product={p} onClick={() => onProductClick(p)} onAddToCart={() => handleAddToCart(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Categories */}
      <FeaturedCategories categories={categories} onCategoryClick={onCategoryClick} />

      {/* Best Selling Products */}
      <BestSellingSection products={bestSelling} onProductClick={onProductClick} />

      {/* More Trending Products */}
      {activeProducts.length > 8 && (
        <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
          <SectionHeader title="Limited-Time Deal" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {activeProducts.slice(8, 16).map(p => (
              <SFProductCard key={p.id} product={p} onClick={() => onProductClick(p)} onAddToCart={() => handleAddToCart(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews */}
      <CustomerReviews />

      {/* Call to Action */}
      <CTASection />

      {/* Footer */}
      <SFFooter logo={logo} websiteConfig={websiteConfig} />
    </div>
  );
});

StoreFrontThemePage.displayName = 'StoreFrontThemePage';
export default StoreFrontThemePage;
