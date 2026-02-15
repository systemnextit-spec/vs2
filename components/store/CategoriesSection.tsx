import { memo, useMemo, RefObject, useState, useCallback, useEffect, useRef } from 'react';
import { Grid, ChevronRight, ChevronLeft, Sparkles, ShoppingBag, Star, Layers } from 'lucide-react';
import { Category } from '../../types';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';

const isImageUrl = (icon?: string) => {
  if (!icon) return false;
  return icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:');
};

interface Props {
  categories?: Category[];
  onCategoryClick: (name: string) => void;
  sectionRef?: RefObject<HTMLDivElement>;
  categoryScrollRef?: RefObject<HTMLDivElement>;
  style?: string;
}

// ============================================================================
// Style 1: Classic Pill Carousel (Default) - Horizontal scrolling pills
// ============================================================================
const CategoryStyle1 = memo(({ categories, onCategoryClick, sectionRef }: Omit<Props, 'style'>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [animationDuration, setAnimationDuration] = useState(30);

  const processed = useMemo(() => 
    categories?.filter(c => !c.status || c.status === 'Active' || c.status?.toLowerCase() === 'active')
      .slice(0, 30)
      .map(c => ({ name: c.name, icon: c.icon || 'grid', image: c.image, slug: c.slug })) || []
  , [categories]);

  useEffect(() => {
    const baseSpeed = 20;
    const itemCount = processed.length;
    const duration = Math.max(15, (itemCount / 10) * baseSpeed);
    setAnimationDuration(duration);
  }, [processed.length]);

  const handleClick = useCallback((slug: string) => onCategoryClick(slug), [onCategoryClick]);

  const handleManualScroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    setIsPaused(true);
    container.scrollBy({ left: direction === 'right' ? 300 : -300, behavior: 'smooth' });
    setTimeout(() => setIsPaused(false), 3000);
  }, []);

  if (!processed.length) return null;

  const duplicatedItems = [...processed, ...processed];

  return (
    <div ref={sectionRef} className="relative py-2 sm:py-3 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}>
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Categories</h2>
          <div className="h-0.5 w-8 sm:w-12 bg-gradient-theme-r rounded-full"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5">
            <button onClick={() => handleManualScroll('left')} className="p-1.5 rounded-full bg-gray-100 hover:bg-theme-primary/10 text-gray-500 hover:text-theme-primary transition-all shadow-sm" aria-label="Scroll left">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <button onClick={() => handleManualScroll('right')} className="p-1.5 rounded-full bg-gray-100 hover:bg-theme-primary/10 text-gray-500 hover:text-theme-primary transition-all shadow-sm" aria-label="Scroll right">
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>
          <button className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-theme-primary hover:text-theme-secondary transition-colors px-2 py-1 rounded-full hover:bg-theme-primary/10" onClick={() => onCategoryClick('__all__')}>
            View All <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      
      <div ref={scrollContainerRef} className="overflow-hidden">
        <div className={`flex gap-2 w-max ${isPaused ? '' : 'animate-marquee-cat'}`}
          style={{ animationDuration: `${animationDuration}s`, animationPlayState: isPaused ? 'paused' : 'running' }}>
          {duplicatedItems.map((category, index) => {
            const iconSrc = category.image || category.icon;
            const hasImage = iconSrc && isImageUrl(iconSrc);
            return (
              <button key={`${category.name}-${index}`} onClick={() => handleClick(category.slug || category.name)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-gray-100 text-gray-700 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-sm group touch-manipulation">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200">
                  {hasImage ? <img src={normalizeImageUrl(iconSrc)} alt={category.name} className="w-full h-full object-cover rounded-full" loading="eager" decoding="sync" />
                    : <Grid size={18} className="text-theme-primary" strokeWidth={1.5} />}
                </div>
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap text-gray-700 group-hover:text-gray-900 transition-colors">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="absolute left-0 to p-12 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 to p-12 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10" />
      <style>{`@keyframes marquee-cat{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}.animate-marquee-cat{animation:marquee-cat linear infinite}`}</style>
    </div>
  );
});
CategoryStyle1.displayName = 'CategoryStyle1';

// ============================================================================
// Style 2: Grid Cards - Modern card grid layout with hover effects
// ============================================================================
const CategoryStyle2 = memo(({ categories, onCategoryClick, sectionRef }: Omit<Props, 'style'>) => {
  const processed = useMemo(() => 
    categories?.filter(c => !c.status || c.status === 'Active' || c.status?.toLowerCase() === 'active')
      .slice(0, 12)
      .map(c => ({ name: c.name, icon: c.icon || 'grid', image: c.image, slug: c.slug })) || []
  , [categories]);

  if (!processed.length) return null;

  return (
    <div ref={sectionRef} className="py-4 sm:py-6 px-2 sm:px-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-theme-br flex items-center justify-center shadow-lg">
            <Layers size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Shop by Category</h2>
            <p className="text-xs text-gray-500">Browse our collection</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-sm font-semibold text-theme-primary hover:text-theme-secondary transition-colors px-3 py-1.5 rounded-lg hover:bg-theme-primary/10" onClick={() => onCategoryClick('__all__')}>
          See All <ChevronRight size={18} />
        </button>
      </div>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
        {processed.map((category, index) => {
          const iconSrc = category.image || category.icon;
          const hasImage = iconSrc && isImageUrl(iconSrc);
          return (
            <button key={`${category.name}-${index}`} onClick={() => onCategoryClick(category.slug || category.name)}
              className="group flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white border border-gray-100 hover:border-theme-primary/30 hover:shadow-xl hover:shadow-theme-primary/10 transition-all duration-300 hover:-translate-y-1 active:scale-95">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-theme-primary/10 group-hover:to-theme-secondary/10 flex items-center justify-center overflow-hidden mb-2 sm:mb-3 transition-all duration-300 shadow-inner">
                {hasImage ? <img src={normalizeImageUrl(iconSrc)} alt={category.name} className="w-full h-full object-cover rounded-xl" loading="lazy" />
                  : <ShoppingBag size={24} className="text-gray-400 group-hover:text-theme-primary transition-colors" />}
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-theme-primary text-center line-clamp-2 transition-colors">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
CategoryStyle2.displayName = 'CategoryStyle2';

// ============================================================================
// Style 3: Circular Icons with Labels - Instagram-style circular layout
// ============================================================================
const CategoryStyle3 = memo(({ categories, onCategoryClick, sectionRef }: Omit<Props, 'style'>) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const processed = useMemo(() => 
    categories?.filter(c => !c.status || c.status === 'Active' || c.status?.toLowerCase() === 'active')
      .slice(0, 20)
      .map(c => ({ name: c.name, icon: c.icon || 'grid', image: c.image, slug: c.slug })) || []
  , [categories]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' });
  }, []);

  if (!processed.length) return null;

  return (
    <div ref={sectionRef} className="py-4 sm:py-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="flex items-center justify-between mb-4 px-3 sm:px-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={18} className="text-theme-primary" /> Categories
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('left')} className="hidden sm:flex p-1.5 rounded-full bg-white shadow-md hover:shadow-lg text-gray-500 hover:text-theme-primary transition-all" aria-label="Scroll left">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll('right')} className="hidden sm:flex p-1.5 rounded-full bg-white shadow-md hover:shadow-lg text-gray-500 hover:text-theme-primary transition-all" aria-label="Scroll right">
            <ChevronRight size={18} />
          </button>
          <button className="text-xs sm:text-sm font-semibold text-theme-primary" onClick={() => onCategoryClick('__all__')}>View All</button>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto px-3 sm:px-4 pb-2 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {processed.map((category, index) => {
          const iconSrc = category.image || category.icon;
          const hasImage = iconSrc && isImageUrl(iconSrc);
          return (
            <button key={`${category.name}-${index}`} onClick={() => onCategoryClick(category.slug || category.name)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group snap-start active:scale-95 transition-transform">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-theme-tr group-hover:shadow-lg group-hover:shadow-theme-primary/30 transition-shadow">
                  <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden">
                    {hasImage ? <img src={normalizeImageUrl(iconSrc)} alt={category.name} className="w-full h-full object-cover rounded-full" loading="lazy" />
                      : <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Grid size={24} className="text-gray-400" />
                        </div>}
                  </div>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-theme-primary flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={14} className="text-white" />
                </div>
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-theme-primary text-center max-w-[72px] sm:max-w-[88px] truncate transition-colors">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
});
CategoryStyle3.displayName = 'CategoryStyle3';

// ============================================================================
// Style 4: Compact List with Icons - Elegant list layout for many categories
// ============================================================================
const CategoryStyle4 = memo(({ categories, onCategoryClick, sectionRef }: Omit<Props, 'style'>) => {
  const [showAll, setShowAll] = useState(false);
  
  const processed = useMemo(() => 
    categories?.filter(c => !c.status || c.status === 'Active' || c.status?.toLowerCase() === 'active')
      .slice(0, 16)
      .map(c => ({ name: c.name, icon: c.icon || 'grid', image: c.image, slug: c.slug })) || []
  , [categories]);

  const visible = showAll ? processed : processed.slice(0, 8);

  if (!processed.length) return null;

  return (
    <div ref={sectionRef} className="py-4 sm:py-6 px-2 sm:px-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-theme-r p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Layers size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Categories</h2>
                <p className="text-xs text-white/70">{processed.length} collections</p>
              </div>
            </div>
            <button onClick={() => onCategoryClick('__all__')} className="text-xs sm:text-sm font-medium text-white/90 hover:text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-all">
              View All
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-gray-100">
          {visible.map((category, index) => {
            const iconSrc = category.image || category.icon;
            const hasImage = iconSrc && isImageUrl(iconSrc);
            return (
              <button key={`${category.name}-${index}`} onClick={() => onCategoryClick(category.slug || category.name)}
                className="flex items-center gap-3 p-3 sm:p-4 hover:bg-gradient-to-r hover:from-theme-primary/5 hover:to-theme-secondary/5 transition-all group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-100 group-hover:bg-theme-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0 transition-colors">
                  {hasImage ? <img src={normalizeImageUrl(iconSrc)} alt={category.name} className="w-full h-full object-cover" loading="lazy" />
                    : <Grid size={18} className="text-gray-400 group-hover:text-theme-primary transition-colors" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-theme-primary truncate block transition-colors">{category.name}</span>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-theme-primary flex-shrink-0 transition-colors" />
              </button>
            );
          })}
        </div>
        
        {processed.length > 8 && (
          <button onClick={() => setShowAll(!showAll)} className="w-full py-3 text-sm font-semibold text-theme-primary hover:bg-theme-primary/5 border-t border-gray-100 transition-colors flex items-center justify-center gap-1">
            {showAll ? 'Show Less' : `Show ${processed.length - 8} More`}
            <ChevronRight size={16} className={`transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
});
CategoryStyle4.displayName = 'CategoryStyle4';

// ============================================================================
// Style 5: Featured Cards - Large featured cards with gradient overlays
// ============================================================================
const CategoryStyle5 = memo(({ categories, onCategoryClick, sectionRef }: Omit<Props, 'style'>) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const processed = useMemo(() => 
    categories?.filter(c => !c.status || c.status === 'Active' || c.status?.toLowerCase() === 'active')
      .slice(0, 10)
      .map(c => ({ name: c.name, icon: c.icon || 'grid', image: c.image, slug: c.slug })) || []
  , [categories]);

  const scroll = useCallback((dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 250 : -250, behavior: 'smooth' });
  }, []);

  if (!processed.length) return null;

  const gradients = [
    'from-rose-500 to-pink-600', 'from-blue-500 to-cyan-600', 'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600', 'from-violet-500 to-purple-600', 'from-red-500 to-rose-600',
    'from-sky-500 to-blue-600', 'from-lime-500 to-green-600', 'from-fuchsia-500 to-pink-600', 'from-indigo-500 to-violet-600'
  ];

  return (
    <div ref={sectionRef} className="py-4 sm:py-6">
      <div className="flex items-center justify-between mb-4 px-3 sm:px-4">
        <div className="flex items-center gap-2">
          <Star size={20} className="text-theme-primary fill-theme-primary" />
          <h2 className="text-base sm:text-lg font-bold text-gray-900">Featured Categories</h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('left')} className="hidden sm:flex p-2 rounded-full bg-gray-100 hover:bg-theme-primary hover:text-white text-gray-500 transition-all shadow-sm" aria-label="Scroll left">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll('right')} className="hidden sm:flex p-2 rounded-full bg-gray-100 hover:bg-theme-primary hover:text-white text-gray-500 transition-all shadow-sm" aria-label="Scroll right">
            <ChevronRight size={18} />
          </button>
          <button className="text-sm font-semibold text-theme-primary hover:underline" onClick={() => onCategoryClick('__all__')}>All</button>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex gap-3 sm:gap-4 overflow-x-auto px-3 sm:px-4 pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {processed.map((category, index) => {
          const iconSrc = category.image || category.icon;
          const hasImage = iconSrc && isImageUrl(iconSrc);
          const gradient = gradients[index % gradients.length];
          return (
            <button key={`${category.name}-${index}`} onClick={() => onCategoryClick(category.slug || category.name)}
              className="flex-shrink-0 relative w-32 h-40 sm:w-40 sm:h-48 rounded-2xl overflow-hidden group snap-start active:scale-95 transition-transform">
              {hasImage ? (
                <>
                  <img src={normalizeImageUrl(iconSrc)} alt={category.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </>
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-500`}>
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <ShoppingBag size={64} className="text-white" />
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <span className="text-sm sm:text-base font-bold text-white drop-shadow-lg line-clamp-2">{category.name}</span>
                <div className="mt-1 flex items-center gap-1 text-white/80 text-xs font-medium group-hover:text-white transition-colors">
                  <span>Shop Now</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});
CategoryStyle5.displayName = 'CategoryStyle5';

// ============================================================================
// Main Component with Style Switch
// ============================================================================
export const CategoriesSection = memo(({ categories, onCategoryClick, sectionRef, categoryScrollRef, style }: Props) => {
  const ref = categoryScrollRef || sectionRef;
  const styleNum = style || 'style1';

  switch (styleNum) {
    case 'style2':
      return <CategoryStyle2 categories={categories} onCategoryClick={onCategoryClick} sectionRef={ref} />;
    case 'style3':
      return <CategoryStyle3 categories={categories} onCategoryClick={onCategoryClick} sectionRef={ref} />;
    case 'style4':
      return <CategoryStyle4 categories={categories} onCategoryClick={onCategoryClick} sectionRef={ref} />;
    case 'style5':
      return <CategoryStyle5 categories={categories} onCategoryClick={onCategoryClick} sectionRef={ref} />;
    case 'style1':
    default:
      return <CategoryStyle1 categories={categories} onCategoryClick={onCategoryClick} sectionRef={ref} />;
  }
});

CategoriesSection.displayName = 'CategoriesSection';
export default CategoriesSection;
