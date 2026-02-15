import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Product } from '../../types';
import { ProductCard } from '../StoreProductComponents';
import { SectionHeader } from '../StoreComponents';
import { getViewportWidth } from '../../utils/viewportHelpers';
import { ShoppingBag, Flame, TrendingUp, Package, Star } from 'lucide-react';

interface Props { 
  title: string; 
  products: Product[]; 
  accentColor?: 'green' | 'purple' | 'orange' | 'blue'; 
  onProductClick: (p: Product) => void; 
  onBuyNow?: (p: Product) => void; 
  onQuickView?: (p: Product) => void; 
  onAddToCart?: (p: Product) => void; 
  productCardStyle?: string; 
  productSectionStyle?: string;
  keyPrefix: string; 
  maxProducts?: number; 
  reverseOrder?: boolean; 
  showSoldCount?: boolean;
}

const colors = { 
  green: 'bg-green-500', 
  purple: 'bg-purple-500', 
  orange: 'bg-orange-500', 
  blue: 'bg-blue-500' 
};

const icons = {
  green: <ShoppingBag size={18} className="text-white" />,
  purple: <TrendingUp size={18} className="text-white" />,
  orange: <Flame size={18} className="text-white" />,
  blue: <Package size={18} className="text-white" />,
};

// Style 1: Classic Clean Grid
const ProductSectionStyle1 = memo(({ title, products, accentColor = 'green', onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, keyPrefix, showSoldCount }: Omit<Props, 'productSectionStyle' | 'maxProducts' | 'reverseOrder'> & { products: Product[] }) => {
  return (
    <section className="py-4">
      <div className="bg-white/80 backdrop-blur-lg border border-gray-100 rounded-xl p-3 md:p-4 mb-3 shadow-sm flex items-center gap-2.5">
        <div className={`h-6 w-1 rounded-full ${colors[accentColor]}`}/>
        <SectionHeader title={title} className="text-lg md:text-xl font-bold text-gray-900"/>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p, idx) => <ProductCard key={`${keyPrefix}-${p.id}-${idx}`} product={p} onClick={onProductClick} onBuyNow={onBuyNow} variant={productCardStyle} onQuickView={onQuickView} onAddToCart={onAddToCart} showSoldCount={showSoldCount}/>)}
      </div>
    </section>
  );
});
ProductSectionStyle1.displayName = 'ProductSectionStyle1';

// Style 2: Bordered Cards with Icon Header
const ProductSectionStyle2 = memo(({ title, products, accentColor = 'green', onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, keyPrefix, showSoldCount }: Omit<Props, 'productSectionStyle' | 'maxProducts' | 'reverseOrder'> & { products: Product[] }) => {
  return (
    <section className="py-4">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className={`p-2.5 rounded-xl ${colors[accentColor]}`}>
          {icons[accentColor]}
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{products.length} products available</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p, idx) => <ProductCard key={`${keyPrefix}-${p.id}-${idx}`} product={p} onClick={onProductClick} onBuyNow={onBuyNow} variant={productCardStyle} onQuickView={onQuickView} onAddToCart={onAddToCart} showSoldCount={showSoldCount}/>)}
        </div>
      </div>
    </section>
  );
});
ProductSectionStyle2.displayName = 'ProductSectionStyle2';

// Style 3: Gradient Header with Shadow Cards
const ProductSectionStyle3 = memo(({ title, products, accentColor = 'green', onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, keyPrefix, showSoldCount }: Omit<Props, 'productSectionStyle' | 'maxProducts' | 'reverseOrder'> & { products: Product[] }) => {
  return (
    <section className="py-4">
      <div className="bg-gradient-theme-br rounded-t-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-white" fill="white" />
            <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
          </div>
          <span className="text-xs text-white/80 bg-white/20 px-3 py-1 rounded-full">{products.length} items</span>
        </div>
      </div>
      <div className="bg-gray-50 rounded-b-2xl p-3 sm:p-4 border border-t-0 border-gray-200">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((p, idx) => <ProductCard key={`${keyPrefix}-${p.id}-${idx}`} product={p} onClick={onProductClick} onBuyNow={onBuyNow} variant={productCardStyle} onQuickView={onQuickView} onAddToCart={onAddToCart} showSoldCount={showSoldCount}/>)}
        </div>
      </div>
    </section>
  );
});
ProductSectionStyle3.displayName = 'ProductSectionStyle3';

// Style 4: Minimal with Underline
const ProductSectionStyle4 = memo(({ title, products, accentColor = 'green', onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, keyPrefix, showSoldCount }: Omit<Props, 'productSectionStyle' | 'maxProducts' | 'reverseOrder'> & { products: Product[] }) => {
  return (
    <section className="py-4">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100">
        <div className="relative">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
          <div className={`absolute -bottom-3 left-0 h-0.5 w-16 rounded-full ${colors[accentColor]}`} />
        </div>
        <span className="text-sm text-gray-500">{products.length} products</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((p, idx) => <ProductCard key={`${keyPrefix}-${p.id}-${idx}`} product={p} onClick={onProductClick} onBuyNow={onBuyNow} variant={productCardStyle} onQuickView={onQuickView} onAddToCart={onAddToCart} showSoldCount={showSoldCount}/>)}
      </div>
    </section>
  );
});
ProductSectionStyle4.displayName = 'ProductSectionStyle4';

// Style 5: Card Container with Badge
const ProductSectionStyle5 = memo(({ title, products, accentColor = 'green', onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, keyPrefix, showSoldCount }: Omit<Props, 'productSectionStyle' | 'maxProducts' | 'reverseOrder'> & { products: Product[] }) => {
  return (
    <section className="py-4">
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="absolute to p-0 left-0 right-0 h-1 bg-gradient-theme-r" />
        <div className="p-4 sm:p-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${colors[accentColor]} flex items-center justify-center`}>
              {icons[accentColor]}
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <div className="px-3 py-1 bg-gray-100 rounded-full">
            <span className="text-xs font-medium text-gray-600">{products.length} items</span>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((p, idx) => <ProductCard key={`${keyPrefix}-${p.id}-${idx}`} product={p} onClick={onProductClick} onBuyNow={onBuyNow} variant={productCardStyle} onQuickView={onQuickView} onAddToCart={onAddToCart} showSoldCount={showSoldCount}/>)}
          </div>
        </div>
      </div>
    </section>
  );
});
ProductSectionStyle5.displayName = 'ProductSectionStyle5';

// Main Component
export const ProductGridSection = ({ title, products, accentColor = 'green', onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, productSectionStyle = '1', keyPrefix, maxProducts = 10, reverseOrder = false, showSoldCount }: Props) => {
  const display = reverseOrder ? products.slice().reverse().slice(0, maxProducts) : products.slice(0, maxProducts);
  
  const initCount = useCallback(() => {
    const t = display.length;
    if (typeof window === 'undefined') return Math.min(6, t);
    const w = getViewportWidth();
    return w >= 1280 ? Math.min(10, t) : w >= 768 ? Math.min(8, t) : Math.min(6, t);
  }, [display.length]);

  const [visible, setVisible] = useState(initCount);
  useEffect(() => { setVisible(initCount()); }, [initCount]);
  useEffect(() => {
    if (typeof window === 'undefined' || visible >= display.length) return;
    const t = setTimeout(() => setVisible(c => Math.min(display.length, c + (display.length > 12 ? 4 : 2))), 180);
    return () => clearTimeout(t);
  }, [display.length, visible]);

  const visibleProducts = display.slice(0, visible);
  const commonProps = { title, products: visibleProducts, accentColor, onProductClick, onBuyNow, onQuickView, onAddToCart, productCardStyle, keyPrefix, showSoldCount };

  switch (productSectionStyle) {
    case '2': return <ProductSectionStyle2 {...commonProps} />;
    case '3': return <ProductSectionStyle3 {...commonProps} />;
    case '4': return <ProductSectionStyle4 {...commonProps} />;
    case '5': return <ProductSectionStyle5 {...commonProps} />;
    default: return <ProductSectionStyle1 {...commonProps} />;
  }
};

export default ProductGridSection;
