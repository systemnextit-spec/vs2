import React from 'react';

// Reusable bone component for consistent skeleton styling
const Bone = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
);

// Product card skeleton - matches actual ProductCard structure
const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden border border-gray-100">
    <div className="aspect-square bg-gray-200 animate-pulse" />
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-1">
        <Bone className="h-3 w-8" />
        <Bone className="h-3 w-12" />
      </div>
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-2/3" />
      <div className="flex items-baseline gap-2">
        <Bone className="h-5 w-16" />
        <Bone className="h-3 w-12" />
      </div>
      <Bone className="h-8 w-full rounded-lg" />
    </div>
  </div>
);

// Generic section skeleton (legacy - still used as fallback)
export const SectionSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4 py-4">
    <div className="h-6 w-40 bg-gray-200 rounded" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Flash Sales Section Skeleton - matches FlashSalesSection horizontal scroll layout
export const FlashSalesSkeleton: React.FC = () => (
  <section className="py-2 sm:py-4 md:py-6 animate-pulse">
    <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-xl sm:rounded-2xl p-0.5 sm:p-1">
      <div className="bg-gray-100 rounded-lg sm:rounded-xl p-2.5 sm:p-4 md:p-5">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Bone className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl" />
            <div>
              <Bone className="h-4 sm:h-6 w-24 sm:w-40 mb-1" />
              <Bone className="h-3 w-20 hidden xs:block" />
            </div>
          </div>
          {/* Countdown skeleton */}
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-0.5 sm:gap-1.5">
                <Bone className="h-6 sm:h-10 w-6 sm:w-11 rounded" />
                {i < 2 && <Bone className="h-3 w-1" />}
              </div>
            ))}
          </div>
          <Bone className="h-6 sm:h-9 w-12 sm:w-20 rounded-full" />
        </div>
        {/* Product Cards Horizontal Scroll */}
        <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-hidden pb-1 sm:pb-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[120px] xs:w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px]">
              <div className="bg-white rounded-lg sm:rounded-xl overflow-hidden border border-gray-100">
                <Bone className="aspect-square" />
                <div className="p-1.5 sm:p-2 md:p-3 space-y-1.5 sm:space-y-2">
                  <Bone className="h-3 w-12" />
                  <Bone className="h-3 sm:h-4 w-full" />
                  <Bone className="h-3 sm:h-4 w-2/3" />
                  <Bone className="h-6 sm:h-8 w-full rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// Showcase Section Skeleton - matches carousel/featured products layout
export const ShowcaseSkeleton: React.FC = () => (
  <section className="py-6 px-2 sm:px-4 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <Bone className="w-9 h-9 rounded-xl" />
        <Bone className="h-6 w-40" />
      </div>
      <div className="flex gap-2">
        <Bone className="w-9 h-9 rounded-full" />
        <Bone className="w-9 h-9 rounded-full" />
      </div>
    </div>
    {/* Carousel */}
    <div className="flex gap-4 overflow-hidden pb-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[280px] sm:w-[300px]">
          <ProductCardSkeleton />
        </div>
      ))}
    </div>
  </section>
);

// Brand Section Skeleton - matches horizontal brand logos/cards
export const BrandSkeleton: React.FC = () => (
  <section className="py-6 px-2 sm:px-4 animate-pulse">
    {/* Header */}
    <div className="flex items-center gap-3 mb-4">
      <Bone className="w-9 h-9 rounded-xl" />
      <Bone className="h-6 w-36" />
    </div>
    {/* Brand Logos Horizontal Scroll */}
    <div className="flex gap-3 sm:gap-4 lg:gap-6 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <Bone key={i} className="flex-shrink-0 w-28 h-20 sm:w-36 sm:h-24 rounded-xl" />
      ))}
    </div>
  </section>
);

// Product Grid Section Skeleton - matches product grid with header
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => (
  <section className="py-4 animate-pulse">
    {/* Header */}
    <div className="bg-white/80 backdrop-blur-lg border border-gray-100 rounded-xl p-3 md:p-4 mb-3 shadow-sm flex items-center gap-2.5">
      <Bone className="h-6 w-1 rounded-full" />
      <Bone className="h-5 w-40" />
    </div>
    {/* Product Grid */}
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </section>
);

// Search Results Section Skeleton - matches search results with filter header
export const SearchResultsSkeleton: React.FC = () => (
  <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm animate-pulse">
    {/* Header */}
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 min-w-0 space-y-2">
        <Bone className="h-3 w-12" />
        <Bone className="h-6 w-48 sm:w-64" />
        <Bone className="h-4 w-56" />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Bone className="h-10 w-32 rounded-lg" />
        <Bone className="h-10 w-20 rounded-full" />
      </div>
    </div>
    {/* Product Grid */}
    <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
      {[...Array(10)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  </section>
);

// Footer skeleton to reserve space and prevent CLS
export const FooterSkeleton: React.FC = () => (
  <footer className="mt-auto bg-white border-t border-gray-100" style={{ minHeight: '400px' }}>
    <div className="animate-pulse p-4 sm:p-6 space-y-4">
      <div className="h-8 w-32 bg-gray-200 rounded mx-auto" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  </footer>
);
