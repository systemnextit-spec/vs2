import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Package } from 'lucide-react';
import { Product } from '../../types';
import toast from 'react-hot-toast';

// Icons matching Figma design
const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#7B7B7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="#7B7B7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ProductIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 16V8.00002C20.9996 7.6493 20.9071 7.30483 20.7315 7.00119C20.556 6.69754 20.3037 6.44539 20 6.27002L13 2.27002C12.696 2.09449 12.3511 2.00208 12 2.00208C11.6489 2.00208 11.304 2.09449 11 2.27002L4 6.27002C3.69626 6.44539 3.44398 6.69754 3.26846 7.00119C3.09294 7.30483 3.00036 7.6493 3 8.00002V16C3.00036 16.3508 3.09294 16.6952 3.26846 16.9989C3.44398 17.3025 3.69626 17.5547 4 17.73L11 21.73C11.304 21.9056 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9056 13 21.73L20 17.73C20.3037 17.5547 20.556 17.3025 20.7315 16.9989C20.9071 16.6952 20.9996 16.3508 21 16Z" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3.27002 6.96002L12 12.01L20.73 6.96002" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22.08V12" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CatalogIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.29 3.86001L1.82002 18C1.64539 18.3024 1.55299 18.6453 1.55201 18.9945C1.55103 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.901 3.18082 20.9962 3.53002 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0127 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.4471 18.6453 22.3547 18.3024 22.18 18L13.71 3.86001C13.5318 3.56611 13.2807 3.32313 12.9812 3.15449C12.6817 2.98585 12.3438 2.89726 12 2.89726C11.6563 2.89726 11.3184 2.98585 11.0188 3.15449C10.7193 3.32313 10.4682 3.56611 10.29 3.86001Z" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 9V13" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 17H12.01" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GrowthIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 6H23V12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GrowthIconOrange = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 6H23V12" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface FigmaInventoryProps {
  products: Product[];
  tenantId?: string;
  user?: { name?: string; avatar?: string } | null;
}

const FigmaInventory: React.FC<FigmaInventoryProps> = ({
  products,
  tenantId,
  user
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('stock-low-high');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [expireThreshold, setExpireThreshold] = useState(10);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved thresholds from backend
  useEffect(() => {
    const loadThresholds = async () => {
      if (!tenantId) return;
      try {
        const response = await fetch(`/api/tenant-data/${tenantId}/inventory_settings`);
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            if (result.data.lowStockThreshold) setLowStockThreshold(result.data.lowStockThreshold);
            if (result.data.expireThreshold) setExpireThreshold(result.data.expireThreshold);
          }
        }
      } catch (error) {
        console.error('Failed to load inventory settings:', error);
      }
    };
    loadThresholds();
  }, [tenantId]);

  // Save thresholds to backend (debounced)
  const saveThresholds = useCallback(async (lowStock: number, expire: number) => {
    if (!tenantId) {
      console.warn('Cannot save thresholds: tenantId is undefined');
      return;
    }
    try {
      const response = await fetch(`/api/tenant-data/${tenantId}/inventory_settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: { 
            lowStockThreshold: lowStock, 
            expireThreshold: expire 
          } 
        })
      });
      if (response.ok) {
        console.log(`[Inventory] Saved thresholds: lowStock=${lowStock}, expire=${expire} for tenant ${tenantId}`);
        toast.success('Threshold settings saved');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save settings:', errorData);
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save inventory settings:', error);
      toast.error('Failed to save settings');
    }
  }, [tenantId]);

  // Handle low stock threshold change with debounce
  const handleLowStockChange = (value: number) => {
    setLowStockThreshold(value);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveThresholds(value, expireThreshold);
    }, 1000);
  };

  // Handle expire threshold change with debounce
  const handleExpireThresholdChange = (value: number) => {
    setExpireThreshold(value);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveThresholds(lowStockThreshold, value);
    }, 1000);
  };

  // Calculate inventory stats
  const inventoryStats = useMemo(() => {
    const totalProducts = products.length;
    const totalUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockCount = products.filter(p => (p.stock || 0) < lowStockThreshold).length;
    const outOfStockCount = products.filter(p => (p.stock || 0) === 0).length;
    // Capital value: Cost Price * Stock (what you paid for inventory)
    const inventoryValue = products.reduce((sum, p) => sum + ((p.costPrice || 0) * (p.stock || 0)), 0);
    // Inventory value: Selling Price * Stock (what you can sell inventory for)
    const inventorySaleValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);

    return {
      totalProducts,
      totalUnits,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
      inventorySaleValue
    };
  }, [products, lowStockThreshold]);

  // Filter and sort products for stock table
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'stock-low-high':
        filtered.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        break;
      case 'stock-high-low':
        filtered.sort((a, b) => (b.stock || 0) - (a.stock || 0));
        break;
      case 'price-low-high':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high-low':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
    }

    return filtered.slice(0, 4); // Show only first 4 items as per Figma
  }, [products, searchQuery, sortBy]);

  // Products with expiry dates (simulated for demo)
  const expiryProducts = useMemo(() => {
    // In real app, filter by actual expiry dates
    return products.slice(0, 5).map((p, idx) => ({
      ...p,
      expireDays: 35 + (idx * 30) // Simulated expire days
    }));
  }, [products]);

  const isInventoryHealthy = inventoryStats.lowStockCount === 0;
  const hasExpiryAlerts = expiryProducts.filter(p => p.expireDays <= expireThreshold).length > 0;

  const sortOptions = [
    { value: 'stock-low-high', label: 'Stock low to high' },
    { value: 'stock-high-low', label: 'Stock high to low' },
    { value: 'price-low-high', label: 'Price low to high' },
    { value: 'price-high-low', label: 'Price high to low' },
  ];

  return (
    <div className="bg-white min-h-screen font-['Poppins']">
      <div className="px-5 py-5">
        {/* Header */}
        <h1 className="text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-[22px] font-bold text-[#023337] tracking-[0.11px] font-['Lato'] mb-5">
          Inventory
        </h1>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
          {/* Card 1: Products */}
          <div className="bg-[#f9f9f9] rounded-lg p-4 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-medium text-black">Products</p>
              <div>
                <p className="text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-[24px] font-medium text-black">{inventoryStats.totalProducts}</p>
                <p className="text-[12px] text-[#979797]">Category wise</p>
              </div>
            </div>
            <div className="bg-white rounded-lg w-[44px] h-[44px] flex items-center justify-center">
              <ProductIcon />
            </div>
          </div>

          {/* Card 2: Total unit on hand */}
          <div className="bg-[#f9f9f9] rounded-lg p-4 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-medium text-black">Total unit on hand</p>
              <div>
                <p className="text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-[24px] font-medium text-black">{inventoryStats.totalUnits}</p>
                <p className="text-[12px] text-[#979797]">Products entire shop</p>
              </div>
            </div>
            <div className="bg-white rounded-lg w-[44px] h-[44px] flex items-center justify-center">
              <CatalogIcon />
            </div>
          </div>

          {/* Card 3: Low stock */}
          <div className="bg-[#f9f9f9] rounded-lg p-4 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-medium text-black">Low stock</p>
              <div>
                <p className="text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-[24px] font-medium text-black">{inventoryStats.lowStockCount}</p>
                <p className="text-[12px] text-[#979797]">{inventoryStats.outOfStockCount} out / {inventoryStats.lowStockCount} low ({'<'}{lowStockThreshold})</p>
              </div>
            </div>
            <div className="bg-white rounded-lg w-[44px] h-[44px] flex items-center justify-center">
              <WarningIcon />
            </div>
          </div>

          {/* Card 4: Capital value */}
          <div className="bg-[#f9f9f9] rounded-lg p-4 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-medium text-black">Capital value</p>
              <div>
                <p className="text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-[24px] font-medium text-black">৳ {inventoryStats.inventoryValue.toLocaleString('en-IN')}</p>
                <p className="text-[12px] text-[#979797]">Cost Price</p>
              </div>
            </div>
            <div className="bg-white rounded-lg w-[44px] h-[44px] flex items-center justify-center">
              <GrowthIcon />
            </div>
          </div>

          {/* Card 5: Inventory value */}
          <div className="bg-[#f9f9f9] rounded-lg p-4 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              <p className="text-[16px] font-medium text-black">Inventory value</p>
              <div>
                <p className="text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-[24px] font-medium text-black">৳ {inventoryStats.inventorySaleValue.toLocaleString('en-IN')}</p>
                <p className="text-[12px] text-[#979797]">Selling Price</p>
              </div>
            </div>
            <div className="bg-white rounded-lg w-[44px] h-[44px] flex items-center justify-center">
              <GrowthIconOrange />
            </div>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-4 mb-5">
          {/* Search Bar */}
          <div className="bg-[#f9f9f9] h-[34px] rounded-lg flex items-center px-2 flex-1 min-w-[200px] max-w-[300px]">
            <SearchIcon />
            <input
              type="text"
              placeholder="Product Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[12px] text-[#7b7b7b] ml-2 flex-1 outline-none placeholder:text-[#7b7b7b]"
            />
            <button className="text-[12px] text-black font-medium px-2">Search</button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#7b7b7b]">Sort by</span>
            <div className="relative" data-dropdown>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="bg-[#f9f9f9] rounded-lg flex items-center gap-2 px-3 py-2 w-[159px]"
              >
                <span className="text-[12px] text-black">
                  {sortOptions.find(o => o.value === sortBy)?.label}
                </span>
                <ChevronDown size={14} className="text-gray-600" />
              </button>
              {showSortDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border z-50 py-1 w-full">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                      className="w-full px-3 py-2 text-left text-[12px] hover:bg-gray-50"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Threshold */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-black">Set the low stock threshold at</span>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => handleLowStockChange(parseInt(e.target.value) || 5)}
              className="bg-[#f9f9f9] h-[32px] w-[80px] rounded-lg text-center text-[12px] text-black outline-none border border-transparent focus:border-[#ff6a00] transition-colors"
              min="1"
            />
            <span className="text-[12px] text-black">Unit</span>
          </div>

          {/* Expire Threshold */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-black">Set the Low Expire threshold at</span>
            <input
              type="number"
              value={expireThreshold}
              onChange={(e) => handleExpireThresholdChange(parseInt(e.target.value) || 10)}
              className="bg-[#f9f9f9] h-[32px] w-[80px] rounded-lg text-center text-[12px] text-black outline-none border border-transparent focus:border-[#ff6a00] transition-colors"
              min="1"
            />
            <span className="text-[12px] text-black">Days</span>
          </div>
        </div>

        {/* Main Content: Two Tables + Right Sidebar */}
        <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 lg:gap-6">
          {/* Left Column: Stock Table */}
          <div className="flex-1">
            {/* Stock Table */}
            <div className="mb-6">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="bg-[#E0F2FE]">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-black text-[16px]">Product</th>
                      <th className="px-4 py-3 text-center font-medium text-black text-[16px]">Category</th>
                      <th className="px-4 py-3 text-center font-medium text-black text-[16px]">Price</th>
                      <th className="px-4 py-3 text-center font-medium text-black text-[16px]">Stock</th>
                      <th className="px-4 py-3 text-center font-medium text-black text-[16px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#b9b9b9]/50">
                    {filteredProducts.length > 0 ? filteredProducts.map((product, idx) => (
                      <tr key={`stock-${product.id}-${idx}`} className="h-[68px] hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-[12px] text-[#1d1a1a] max-w-[263px]">
                          <p className="line-clamp-2">{product.name}</p>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#1d1a1a] text-center">
                          {product.category || 'Uncategorized'}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#1d1a1a] text-center">
                          {product.price || 0}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#1d1a1a] text-center">
                          {product.stock || 0}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-[9px] py-0.5 rounded-[30px] text-[12px] font-medium ${
                            product.status === 'Active' 
                              ? 'bg-[#c1ffbc] text-[#085e00]' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {product.status === 'Active' ? 'Publish' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <Package size={40} className="text-gray-300 mb-3" />
                            <p>No products found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expiry Table */}
            <div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead className="bg-[#E0F2FE]">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium text-black text-[16px]">Product</th>
                      <th className="px-4 py-3 text-center font-medium text-black text-[16px]">Category</th>
                      <th className="px-4 py-3 text-center font-medium text-black text-[16px]">Expire in</th>
                      <th className="px-4 py-3 text-center font-medium text-black text-[16px]">Stock</th>
                      <th className="px-4 py-3 text-center font-medium text-black text-[16px]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#b9b9b9]/50">
                    {expiryProducts.map((product, idx) => (
                      <tr key={`expiry-${product.id}-${idx}`} className="h-[68px] hover:bg-gray-50 transition-colors border-b border-[#b9b9b9]/50">
                        <td className="px-4 py-3 text-[12px] text-[#1d1a1a] max-w-[263px]">
                          <p className="line-clamp-2">{product.name}</p>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#1d1a1a] text-center">
                          {product.category || 'Uncategorized'}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#1d1a1a] text-center">
                          {product.expireDays} Days
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#1d1a1a] text-center">
                          {product.stock || 0}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-[9px] py-0.5 rounded-[30px] text-[12px] font-medium ${
                            product.status === 'Active' 
                              ? 'bg-[#c1ffbc] text-[#085e00]' 
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {product.status === 'Active' ? 'Publish' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Alerts */}
          <div className="xl:w-[450px] flex flex-col gap-3 sm:gap-4 lg:gap-6">
            {/* Inventory Alerts */}
            <div className="bg-white rounded-lg shadow-[0px_4px_5px_0px_rgba(0,0,0,0.11)] p-4">
              <div className="mb-3">
                <p className="text-[16px] font-medium text-black">Inventory alerts</p>
                <p className="text-[12px] text-[#979797]">Review the most critical SKUs and plan replenishment</p>
              </div>
              <div className={`p-4 rounded ${isInventoryHealthy ? 'bg-[#ecfdf5]' : 'bg-red-50'}`}>
                <p className={`text-[12px] font-medium text-center ${isInventoryHealthy ? 'text-[#00a557]' : 'text-red-600'}`}>
                  {isInventoryHealthy 
                    ? 'Inventory looks healthy: No low-stock items.'
                    : `${inventoryStats.lowStockCount} items need attention. ${inventoryStats.outOfStockCount} out of stock.`
                  }
                </p>
              </div>
            </div>

            {/* Expired Date Alerts */}
            <div className="bg-white rounded-lg shadow-[0px_4px_5px_0px_rgba(0,0,0,0.11)] p-4">
              <div className="mb-3">
                <p className="text-[16px] font-medium text-black">Expired date alerts</p>
                <p className="text-[12px] text-[#979797]">Review the most critical SKUs and plan replenishment</p>
              </div>
              <div className={`p-4 rounded ${!hasExpiryAlerts ? 'bg-[#ecfdf5]' : 'bg-amber-50'}`}>
                <p className={`text-[12px] font-medium text-center ${!hasExpiryAlerts ? 'text-[#00a557]' : 'text-amber-600'}`}>
                  {!hasExpiryAlerts 
                    ? 'Inventory looks healthy: No low-stock items.'
                    : `Some items are expiring within ${expireThreshold} days.`
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigmaInventory;
