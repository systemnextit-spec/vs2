import { useState, useMemo, Suspense, lazy, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Package, Tag as TagIcon, X, SlidersHorizontal, Hash } from 'lucide-react';
import { Product, Category, Brand, WebsiteConfig, User, Order, Tag } from '../../../types';
import { ProductCard } from '../../StoreProductComponents';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';
import { ProductFilter, SortOption } from '../../ProductFilter';

const LazyStoreHeader = lazy(() => import('../../StoreHeader').then(m => ({ default: m.StoreHeader })));
const StoreFooter = lazy(() => import('../StoreFooter').then(m => ({ default: m.StoreFooter })));
const TrackOrderModal = lazy(() => import('../TrackOrderModal').then(m => ({ default: m.TrackOrderModal })));

export interface StoreCategoryProductsProps {
  products: Product[]; categories?: Category[]; subCategories?: any[]; childCategories?: any[];
  brands?: Brand[]; tags?: Tag[]; selectedCategory: string; websiteConfig?: WebsiteConfig;
  onCategoryChange: (c: string | null) => void; onBack: () => void; onHome?: () => void; onProductClick: (p: Product) => void;
  onBuyNow?: (p: Product) => void; onQuickView?: (p: Product) => void; onAddToCart?: (p: Product) => void;
  logo?: string | null; user?: User | null; wishlistCount?: number; wishlist?: number[]; cart?: number[];
  onToggleWishlist?: (id: number) => void; onToggleCart?: (id: number) => void;
  onCheckoutFromCart?: (id: number) => void; onLoginClick?: () => void; onLogoutClick?: () => void;
  onProfileClick?: () => void; onOpenChat?: () => void; onImageSearchClick?: () => void; orders?: Order[];
}

const eq = (a?: string, b?: string) => a?.toLowerCase() === b?.toLowerCase();

// Check if product has a specific tag
const hasTag = (product: Product, tagName: string): boolean => {
  if (!product.tags || !Array.isArray(product.tags)) return false;
  return product.tags.some(t => t.toLowerCase() === tagName.toLowerCase());
};

export const StoreCategoryProducts = ({ products, categories, subCategories, childCategories, brands, tags,
  selectedCategory, onCategoryChange, onBack, onHome, onProductClick, onBuyNow, onQuickView, onAddToCart, websiteConfig,
  logo, user, wishlistCount = 0, wishlist = [], onToggleWishlist, cart = [], onToggleCart, onCheckoutFromCart,
  onLoginClick, onLogoutClick, onProfileClick, onOpenChat, onImageSearchClick, orders = [] }: StoreCategoryProductsProps) => {
  
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('relevance');
  const [mobileFilter, setMobileFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  
  // Preserve scroll position when category changes
  const scrollPosRef = useRef(0);
  const prevCategoryRef = useRef(selectedCategory);
  
  // useEffect(() => {
  //   // If category changed, restore scroll position
  //   if (prevCategoryRef.current !== selectedCategory) {
  //     const savedScroll = scrollPosRef.current;
  //     // Restore scroll after React finishes rendering
  //     requestAnimationFrame(() => {
  //       window.scrollTo({ top: savedScroll, behavior: 'auto' });
  //     });
  //   }
  //   prevCategoryRef.current = selectedCategory;
  // }, [selectedCategory]);
  
  // Save scroll position before category changes
  const handleCategoryChangeWithScroll = (categoryName: string | null) => {
    scrollPosRef.current = window.scrollY;
    onCategoryChange(categoryName);
  };
  
  const isAll = selectedCategory === '__all__';
  const isBrandFilter = selectedCategory.startsWith('brand:');
  const isTagFilter = selectedCategory.startsWith('tag:');
  const brandFromUrl = isBrandFilter ? selectedCategory.slice(6) : null;
  const tagFromUrl = isTagFilter ? selectedCategory.slice(4) : null;

  const activeCats = useMemo(() => categories?.filter(c => c.status === 'Active') || [], [categories]);
  const activeBrands = useMemo(() => brands?.filter(b => b.status === 'Active') || [], [brands]);
  const activeTags = useMemo(() => tags?.filter(t => t.status === 'Active') || [], [tags]);

  // Filter products to show only Active status in store
  const activeProducts = useMemo(() => 
    products.filter(p => !p.status || p.status === 'Active'), 
    [products]
  );

  const filtered = useMemo(() => activeProducts.filter(p => {
    const brandOk = !selectedBrand || eq(p.brand, selectedBrand);
    const tagOk = !selectedTag || hasTag(p, selectedTag);
    
    if (isAll) return brandOk && tagOk;
    if (isBrandFilter) return eq(p.brand, brandFromUrl!) && tagOk;
    if (isTagFilter) return hasTag(p, tagFromUrl!) && brandOk;
    
    // Check if selectedCategory matches any of: category, subCategory, childCategory, or tag
    const matchesCategory = eq(p.category, selectedCategory);
    const matchesSubCategory = eq(p.subCategory, selectedCategory);
    const matchesChildCategory = eq(p.childCategory, selectedCategory);
    const matchesTag = hasTag(p, selectedCategory);
    
    return (matchesCategory || matchesSubCategory || matchesChildCategory || matchesTag) && brandOk && tagOk;
  }), [activeProducts, selectedCategory, selectedBrand, selectedTag, isAll, isBrandFilter, isTagFilter, brandFromUrl, tagFromUrl]);

  const sorted = useMemo(() => {
    const s = [...filtered];
    const sorts: Record<string, () => Product[]> = {
      'price-low': () => s.sort((a, b) => (a.price || 0) - (b.price || 0)),
      'price-high': () => s.sort((a, b) => (b.price || 0) - (a.price || 0)),
      'rating': () => s.sort((a, b) => (b.rating || 0) - (a.rating || 0)),
      'newest': () => s.sort((a, b) => (b.id || 0) - (a.id || 0)),
    };
    return sorts[sortOption]?.() || s;
  }, [filtered, sortOption]);

  // Get brands available in current filter
  const catBrands = useMemo(() => {
    if (isAll) return activeBrands;
    if (isTagFilter && tagFromUrl) {
      const names = new Set(activeProducts.filter(p => hasTag(p, tagFromUrl)).map(p => p.brand).filter(Boolean));
      return activeBrands.filter(b => names.has(b.name));
    }
    const names = new Set(activeProducts.filter(p => eq(p.category, selectedCategory) || hasTag(p, selectedCategory)).map(p => p.brand).filter(Boolean));
    return activeBrands.filter(b => names.has(b.name));
  }, [activeProducts, selectedCategory, activeBrands, isAll, isTagFilter, tagFromUrl]);

  // Get tags available in current category/filter
  const catTags = useMemo(() => {
    if (isAll) return activeTags;
    if (isTagFilter) return []; // Don't show tags when already filtering by tag
    // Get all tags used by products in current category
    const tagNames = new Set<string>();
    activeProducts.forEach(p => {
      if (eq(p.category, selectedCategory) || isBrandFilter) {
        if (Array.isArray(p.tags)) p.tags.forEach(t => tagNames.add(t));
      }
    });
    return activeTags.filter(t => tagNames.has(t.name));
  }, [activeProducts, selectedCategory, activeTags, isAll, isTagFilter, isBrandFilter]);

  const title = isAll ? 'All Products' : (isTagFilter ? tagFromUrl : (brandFromUrl || selectedCategory));
  const clearFilters = () => { setSelectedBrand(null); setSelectedTag(null); setSortOption('relevance'); };
  const closeFilter = () => setMobileFilter(false);

  const Sidebar = () => (<>
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-theme-r px-4 py-3"><h3 className="text-white font-bold text-sm">Categories</h3></div>
      <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
        {activeCats.map(c => {
          const active = eq(selectedCategory, c.name);
          return (<button key={c.id} onClick={() => { handleCategoryChangeWithScroll(c.name); setSelectedBrand(null); setSelectedTag(null); closeFilter(); }}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all hover:bg-theme-primary/10 group ${active ? 'bg-theme-primary/10 text-theme-primary font-semibold' : 'text-gray-700'}`}>
            <div className="flex items-center gap-3">
              {c.image ? <img src={normalizeImageUrl(c.image)} alt={c.name} className="w-8 h-8 rounded-lg object-cover border border-gray-100" />
                : <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><Package size={16} className="text-gray-400" /></div>}
              <span className="truncate">{c.name}</span>
            </div>
            <ChevronRight size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${active ? 'rotate-90 text-theme-primary' : 'group-hover:translate-x-1'}`} />
          </button>);
        })}
      </div>
    </div>
    
    {/* Tags Section */}
    {activeTags.length > 0 && (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3"><h3 className="text-white font-bold text-sm flex items-center gap-2"><Hash size={14} /> Tags</h3></div>
        <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
          {activeTags.map(t => {
            const active = isTagFilter ? eq(tagFromUrl, t.name) : selectedTag === t.name;
            return (<button key={t.id} onClick={() => { 
              if (isTagFilter) {
                handleCategoryChangeWithScroll(`tag:${t.name}`);
              } else {
                setSelectedTag(prev => prev === t.name ? null : t.name);
              }
              closeFilter();
            }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all hover:bg-purple-50 ${active ? 'bg-purple-50 text-purple-600 font-semibold' : 'text-gray-700'}`}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Hash size={16} className={active ? 'text-purple-600' : 'text-purple-400'} />
              </div>
              <span className="truncate">{t.name}</span>
            </button>);
          })}
        </div>
      </div>
    )}

    {/* Brands Section */}
    {catBrands.length > 0 && <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3"><h3 className="text-white font-bold text-sm">Brands</h3></div>
      <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
        {catBrands.map(b => (<button key={b.id} onClick={() => { setSelectedBrand(p => p === b.name ? null : b.name); closeFilter(); }}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all hover:bg-gray-50 ${selectedBrand === b.name ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'}`}>
          {b.logo ? <img src={normalizeImageUrl(b.logo)} alt={b.name} className="w-8 h-8 rounded-lg object-contain border border-gray-100 bg-white p-1" />
            : <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center"><TagIcon size={16} className="text-gray-400" /></div>}
          <span className="truncate">{b.name}</span>
        </button>))}
      </div>
    </div>}
    
    {(selectedBrand || selectedTag) && <button onClick={() => { clearFilters(); closeFilter(); }} className="w-full py-2 px-4 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition">Clear Filters</button>}
  </>);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Suspense fallback={null}>
        <LazyStoreHeader onTrackOrder={() => setIsTrackOrderOpen(true)} onHomeClick={onHome || onBack} ImageSearchClick={onImageSearchClick} productCatalog={activeProducts}
          wishlistCount={wishlistCount} wishlist={wishlist} onToggleWishlist={onToggleWishlist} cart={cart}
          onToggleCart={onToggleCart} onCheckoutFromCart={onCheckoutFromCart} user={user} onLoginClick={onLoginClick}
          onLogoutClick={onLogoutClick} onProfileClick={onProfileClick} logo={logo} websiteConfig={websiteConfig}
          searchValue={searchTerm} onSearchChange={setSearchTerm} onCategoriesClick={onBack} onProductsClick={onBack}
          categoriesList={activeCats.map(c => c.name)} onCategorySelect={onCategoryChange} onProductClick={onProductClick}
          categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} />
      </Suspense>

      <div className="bg-white border-b border-gray-100 sticky top-[60px] z-20">
        <div className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
              <ChevronLeft size={20} /><span className="text-sm font-medium hidden sm:inline">Back</span>
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <div className="flex items-center gap-2">
                {isTagFilter && <Hash size={16} className="text-purple-500" />}
                <h1 className="text-lg font-bold text-gray-900">{title}</h1>
              </div>
              <p className="text-xs text-gray-500">{sorted.length} products</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ProductFilter products={sorted} sortBy={sortOption} onSortChange={(s, _) => setSortOption(s)} />
            <button onClick={() => setMobileFilter(true)} className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
              <SlidersHorizontal size={16} /><span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1"><div className="max-w-[1408px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6"><div className="flex gap-3 sm:gap-4 lg:gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-4"><Sidebar /></aside>
        <div className="flex-1 min-w-0">
          {(selectedBrand || selectedTag) && <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500">Filters:</span>
            {selectedBrand && <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {selectedBrand}<button onClick={() => setSelectedBrand(null)} className="ml-1 hover:text-blue-900"><X size={14} /></button>
            </span>}
            {selectedTag && <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              <Hash size={12} />{selectedTag}<button onClick={() => setSelectedTag(null)} className="ml-1 hover:text-purple-900"><X size={14} /></button>
            </span>}
          </div>}
          {sorted.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {sorted.map(p => <ProductCard key={`cat-${p.id}`} product={p} onClick={onProductClick} onBuyNow={onBuyNow} variant={websiteConfig?.productCardStyle} onQuickView={onQuickView} onAddToCart={onAddToCart} />)}
            </div>
          ) : (
            <div className="py-16 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium text-lg">No products found</p>
              <p className="text-gray-400 text-sm mt-1">{selectedBrand || selectedTag ? `No products match the selected filters` : `No products in ${title}`}</p>
              {(selectedBrand || selectedTag) && <button onClick={clearFilters} className="mt-4 px-3 sm:px-4 lg:px-6 py-2 bg-theme-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition">Clear Filters</button>}
            </div>
          )}
        </div>
      </div></div></div>

      {mobileFilter && <div className="fixed inset-0 z-50 lg:hidden">
        <div className="absolute inset-0 bg-black/50" onClick={closeFilter} />
        <div className="absolute right-0 to p-0 bottom-0 w-80 max-w-full bg-gray-50 shadow-xl overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Filters</h2>
            <button onClick={closeFilter} className="p-2 hover:bg-gray-100 rounded-lg transition"><X size={20} /></button>
          </div>
          <div className="p-4 space-y-4"><Sidebar /></div>
        </div>
      </div>}

      <Suspense fallback={null}><StoreFooter websiteConfig={websiteConfig} logo={logo} onOpenChat={onOpenChat} /></Suspense>

      {isTrackOrderOpen && (
        <Suspense fallback={null}>
          <TrackOrderModal onClose={() => setIsTrackOrderOpen(false)} orders={orders} />
        </Suspense>
      )}
    </div>
  );
};

export default StoreCategoryProducts;
