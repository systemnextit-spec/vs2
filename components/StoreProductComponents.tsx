import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Eye, Zap, Package } from 'lucide-react';
import { Product, CarouselItem, WebsiteConfig } from '../types';
import { LazyImage } from '../utils/performanceOptimization';
import { normalizeImageUrl } from '../utils/imageUrlHelper';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  variant?: string;
  onQuickView?: (product: Product) => void;
  onBuyNow?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

const getImage = (p: Product) => normalizeImageUrl(p.galleryImages?.[0] || p.image);

// Style 1: Default - Clean modern card with gradient top bar
const ProductCardStyle1: React.FC<ProductCardProps> = ({ product, onClick, onBuyNow, onAddToCart }) => {
  const handleBuyNow = (e?: React.MouseEvent) => { e?.stopPropagation(); onBuyNow ? onBuyNow(product) : onClick(product); };
  const handleCart = (e: React.MouseEvent) => { e.stopPropagation(); onAddToCart?.(product); };

  return (
    <div className="bg-white rounded-xl overflow-hidden flex flex-col relative shadow-sm hover:shadow-lg transition-shadow duration-300" style={{ contain: 'layout' }}>
      <div className="absolute to p-0 left-0 right-0 h-0.5 z-10" style={{ background: 'linear-gradient(to right, #8b5cf6, #ec4899)' }} />
      <button className="absolute to p-2 left-2 z-10 text-pink-400 hover:text-pink-500 transition-colors w-4 h-4" onClick={(e) => e.stopPropagation()}><Heart size={16} /></button>
      <div className="absolute to p-2 right-2 z-10 min-w-[32px] h-[18px]">
        {product.discount && <span className="text-white text-[8px] font-semibold px-1.5 py-0.5 rounded" style={{ background: 'linear-gradient(to right, #8b5cf6, #a855f7)' }}>SALE</span>}
      </div>
      <div className="relative cursor-pointer bg-gray-50" style={{ aspectRatio: '4/3' }} onClick={() => onClick(product)}>
        <LazyImage src={getImage(product)} alt={product.name} className="w-full h-full object-cover" width={300} height={225} />
      </div>
      <div className="px-2 pb-2 pt-1 flex-1 flex flex-col" style={{ minHeight: '110px' }}>
        <div className="flex items-center gap-0.5 text-[9px] text-gray-400 mb-0.5 h-[12px]">
          <Star size={9} className="text-yellow-400 flex-shrink-0" fill="#facc15" />
          <span className="text-gray-500 font-medium">{product.rating || 5}</span>
          <span className="text-gray-300">({product.reviews || 0})</span>
          <span className="text-gray-200 mx-0.5">•</span>
          <span className="text-gray-400">{product.soldCount || 0} sold</span>
        </div>
        <h3 className="font-medium text-gray-700 text-[11px] leading-snug mb-1 line-clamp-2 cursor-pointer hover:text-cyan-600 transition-colors min-h-[28px]" onClick={() => onClick(product)}>{product.name}</h3>
        <div className="flex items-baseline gap-1 mb-1.5 min-h-[18px]">
          <span className="text-[13px] font-bold text-theme-primary">৳{product.price?.toLocaleString()}</span>
          {product.originalPrice && <span className="text-[9px] text-gray-400 line-through">৳{product.originalPrice?.toLocaleString()}</span>}
        </div>
        <div className="flex gap-1 mt-auto h-[30px]">
          <button className="flex items-center justify-center w-8 h-full border border-theme-primary/60 text-theme-primary rounded-md hover:bg-theme-primary hover:text-white transition-all" onClick={handleCart}><ShoppingCart size={14} /></button>
          <button className="flex-1 btn-order text-[11px] font-medium py-1.5 rounded-md h-full" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </div>
    </div>
  );
};

// Style 2: Minimal - Clean with hover overlay actions
const ProductCardStyle2: React.FC<ProductCardProps> = ({ product, onClick, onBuyNow, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const handleBuyNow = (e?: React.MouseEvent) => { e?.stopPropagation(); onBuyNow ? onBuyNow(product) : onClick(product); };
  const handleCart = (e: React.MouseEvent) => { e.stopPropagation(); onAddToCart?.(product); };
  const discountPercent = product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  return (
    <div className="group bg-white rounded-lg overflow-hidden flex flex-col relative border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300" style={{ contain: 'layout' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="absolute to p-2 left-2 z-10 flex flex-col gap-1">
        {(product.discount || discountPercent) && <span className="bg-gradient-to-r from-rose-500 to-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">{product.discount || `-${discountPercent}%`}</span>}
      </div>
      <button onClick={(e) => e.stopPropagation()} className="absolute to p-2 right-2 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:scale-110 transition-all"><Heart size={16} className="text-gray-400 group-hover:text-rose-500" /></button>
      <div className="relative cursor-pointer bg-gray-50 overflow-hidden" style={{ aspectRatio: '1/1' }} onClick={() => onClick(product)}>
        <LazyImage src={getImage(product)} alt={product.name} className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300" width={300} height={300} />
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent p-3 flex justify-center gap-3 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button onClick={(e) => { e.stopPropagation(); onClick(product); }} className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-all"><Eye size={16} className="text-gray-700" /></button>
          <button onClick={handleCart} className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-all"><ShoppingCart size={16} className="text-gray-700" /></button>
        </div>
      </div>
      <div className="px-3 pb-3 pt-2 flex-1 flex flex-col" style={{ minHeight: '100px' }}>
        {product.rating !== undefined && product.rating > 0 && <div className="flex items-center gap-1 mb-1">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} className={s <= Math.round(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />)}</div>}
        <h3 className="font-medium text-gray-800 text-xs leading-tight mb-1.5 line-clamp-2 cursor-pointer hover:text-theme-primary transition-colors" onClick={() => onClick(product)} style={{ minHeight: '32px' }}>{product.name}</h3>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-base font-bold text-theme-primary">৳{product.price?.toLocaleString()}</span>
          {product.originalPrice && <span className="text-[10px] text-gray-400 line-through">৳{product.originalPrice?.toLocaleString()}</span>}
        </div>
        <button className="w-full py-2 bg-gradient-theme-r text-white text-xs font-semibold rounded-lg hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all mt-auto" onClick={handleBuyNow}>Buy Now</button>
      </div>
    </div>
  );
};

// Style 3: Elegant - Rounded corners with soft shadows and elegant typography
const ProductCardStyle3: React.FC<ProductCardProps> = ({ product, onClick, onBuyNow, onAddToCart }) => {
  const handleBuyNow = (e?: React.MouseEvent) => { e?.stopPropagation(); onBuyNow ? onBuyNow(product) : onClick(product); };
  const handleCart = (e: React.MouseEvent) => { e.stopPropagation(); onAddToCart?.(product); };
  const discountPercent = product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  return (
    <div className="group bg-gradient-to-b from-white to-gray-50/50 rounded-2xl overflow-hidden flex flex-col relative shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100" style={{ contain: 'layout' }}>
      {(product.discount || discountPercent) && <div className="absolute to p-3 left-3 z-10"><span className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">{product.discount || `-${discountPercent}%`}</span></div>}
      <button onClick={(e) => e.stopPropagation()} className="absolute to p-3 right-3 z-10 w-9 h-9 bg-white/80 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center hover:scale-110 hover:bg-rose-50 transition-all"><Heart size={16} className="text-gray-400 group-hover:text-rose-500 transition-colors" /></button>
      <div className="relative cursor-pointer bg-white m-2 rounded-xl overflow-hidden" style={{ aspectRatio: '1/1' }} onClick={() => onClick(product)}>
        <LazyImage src={getImage(product)} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" width={300} height={300} />
      </div>
      <div className="px-4 pb-4 pt-1 flex-1 flex flex-col" style={{ minHeight: '120px' }}>
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} className={s <= Math.round(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />)}
          <span className="text-[10px] text-gray-400 ml-1">({product.reviews || 0})</span>
        </div>
        <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-2 line-clamp-2 cursor-pointer hover:text-theme-primary transition-colors" onClick={() => onClick(product)}>{product.name}</h3>
        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="text-lg font-bold text-theme-primary">৳{product.price?.toLocaleString()}</span>
          {product.originalPrice && <span className="text-xs text-gray-400 line-through">৳{product.originalPrice?.toLocaleString()}</span>}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center w-10 h-10 border-2 border-theme-primary/30 text-theme-primary rounded-xl hover:bg-theme-primary hover:text-white hover:border-theme-primary transition-all" onClick={handleCart}><ShoppingCart size={16} /></button>
          <button className="flex-1 bg-theme-primary text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-theme-primary/90 hover:shadow-lg transition-all" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </div>
    </div>
  );
};

// Style 4: Bold - Dark theme with vibrant accents
const ProductCardStyle4: React.FC<ProductCardProps> = ({ product, onClick, onBuyNow, onAddToCart }) => {
  const handleBuyNow = (e?: React.MouseEvent) => { e?.stopPropagation(); onBuyNow ? onBuyNow(product) : onClick(product); };
  const handleCart = (e: React.MouseEvent) => { e.stopPropagation(); onAddToCart?.(product); };
  const discountPercent = product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  return (
    <div className="group bg-gray-900 rounded-xl overflow-hidden flex flex-col relative shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-800" style={{ contain: 'layout' }}>
      {(product.discount || discountPercent) && <div className="absolute to p-3 left-3 z-10"><span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1"><Zap size={10} />{product.discount || `-${discountPercent}%`}</span></div>}
      <button onClick={(e) => e.stopPropagation()} className="absolute to p-3 right-3 z-10 w-8 h-8 bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-rose-500 transition-all"><Heart size={14} className="text-gray-400 group-hover:text-white" /></button>
      <div className="relative cursor-pointer bg-gray-800 m-2 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1' }} onClick={() => onClick(product)}>
        <LazyImage src={getImage(product)} alt={product.name} className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300" width={300} height={300} />
      </div>
      <div className="px-3 pb-3 flex-1 flex flex-col" style={{ minHeight: '110px' }}>
        <div className="flex items-center gap-1 mb-1.5">
          {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={10} className={s <= Math.round(product.rating || 0) ? 'text-cyan-400 fill-cyan-400' : 'text-gray-600'} />)}
          <span className="text-[10px] text-gray-500 ml-1">{product.reviews || 0}</span>
        </div>
        <h3 className="font-medium text-white text-xs leading-snug mb-2 line-clamp-2 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => onClick(product)}>{product.name}</h3>
        <div className="flex items-baseline gap-2 mb-2 mt-auto">
          <span className="text-base font-bold text-cyan-400">৳{product.price?.toLocaleString()}</span>
          {product.originalPrice && <span className="text-[10px] text-gray-500 line-through">৳{product.originalPrice?.toLocaleString()}</span>}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center w-9 h-9 bg-gray-800 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-white transition-all" onClick={handleCart}><ShoppingCart size={14} /></button>
          <button className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold py-2 rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </div>
    </div>
  );
};

// Style 5: Compact - Space-efficient with horizontal layout on larger screens
const ProductCardStyle5: React.FC<ProductCardProps> = ({ product, onClick, onBuyNow, onAddToCart }) => {
  const handleBuyNow = (e?: React.MouseEvent) => { e?.stopPropagation(); onBuyNow ? onBuyNow(product) : onClick(product); };
  const handleCart = (e: React.MouseEvent) => { e.stopPropagation(); onAddToCart?.(product); };
  const discountPercent = product.originalPrice && product.price ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null;

  return (
    <div className="group bg-white rounded-lg overflow-hidden flex flex-col relative border border-gray-200 hover:border-theme-primary/30 hover:shadow-lg transition-all duration-300" style={{ contain: 'layout' }}>
      <div className="absolute to p-0 left-0 w-full h-1 bg-gradient-theme-r opacity-0 group-hover:opacity-100 transition-opacity" />
      {(product.discount || discountPercent) && <div className="absolute to p-2 left-2 z-10"><span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{product.discount || `-${discountPercent}%`}</span></div>}
      <button onClick={(e) => e.stopPropagation()} className="absolute to p-2 right-2 z-10 w-7 h-7 bg-white shadow-md rounded-full flex items-center justify-center hover:scale-110 transition-all"><Heart size={14} className="text-gray-400 group-hover:text-rose-500" /></button>
      <div className="relative cursor-pointer bg-gradient-to-br from-gray-50 to-white overflow-hidden" style={{ aspectRatio: '1/1' }} onClick={() => onClick(product)}>
        <LazyImage src={getImage(product)} alt={product.name} className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300" width={300} height={300} />
        <div className="absolute inset-0 bg-theme-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="px-2.5 pb-2.5 pt-2 flex-1 flex flex-col border-t border-gray-100" style={{ minHeight: '95px' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={9} className={s <= Math.round(product.rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />)}</div>
          <span className="text-[9px] text-gray-400 flex items-center gap-0.5"><Package size={9} />{product.soldCount || 0}</span>
        </div>
        <h3 className="font-medium text-gray-700 text-[11px] leading-snug mb-1 line-clamp-2 cursor-pointer hover:text-theme-primary transition-colors" onClick={() => onClick(product)}>{product.name}</h3>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-theme-primary">৳{product.price?.toLocaleString()}</span>
            {product.originalPrice && <span className="text-[9px] text-gray-400 line-through">৳{product.originalPrice?.toLocaleString()}</span>}
          </div>
          <div className="flex gap-1">
            <button className="w-7 h-7 flex items-center justify-center border border-gray-200 text-gray-500 rounded hover:border-theme-primary hover:text-theme-primary transition-all" onClick={handleCart}><ShoppingCart size={12} /></button>
            <button className="px-3 h-7 bg-theme-primary text-white text-[10px] font-semibold rounded hover:bg-theme-primary/90 transition-all" onClick={handleBuyNow}>Buy</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCard: React.FC<ProductCardProps> = (props) => {
  const { variant = 'style1' } = props;
  
  switch (variant) {
    case 'style2':
      return <ProductCardStyle2 {...props} />;
    case 'style3':
      return <ProductCardStyle3 {...props} />;
    case 'style4':
      return <ProductCardStyle4 {...props} />;
    case 'style5':
      return <ProductCardStyle5 {...props} />;
    case 'style1':
    default:
      return <ProductCardStyle1 {...props} />;
  }
};
