import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Package, AlertTriangle, CheckCircle, TrendingUp, BarChart3, Box } from 'lucide-react';
import { Product } from '../types';
import { normalizeImageUrl } from '../utils/imageUrlHelper';
import toast from 'react-hot-toast';

interface AdminInventoryProps {
  products: Product[];
  tenantId?: string;
  user?: { name?: string; avatar?: string } | null;
}

const AdminInventory: React.FC<AdminInventoryProps> = ({
  products,
  tenantId,
  user
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('stock-low-high');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [expireThreshold, setExpireThreshold] = useState(10);
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

  // Handle threshold changes with debounce
  const handleLowStockChange = (value: number) => {
    setLowStockThreshold(value);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveThresholds(value, expireThreshold);
    }, 1000);
  };

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
    const inventoryValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
    const inventorySaleValue = products.reduce((sum, p) => sum + ((p.originalPrice || p.price || 0) * (p.stock || 0)), 0);

    return {
      totalProducts,
      totalUnits,
      lowStockCount,
      outOfStockCount,
      inventoryValue,
      inventorySaleValue
    };
  }, [products, lowStockThreshold]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Sort
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
      case 'name-asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [products, searchQuery, categoryFilter, sortBy]);

  // Check if inventory is healthy
  const isInventoryHealthy = inventoryStats.lowStockCount === 0 && inventoryStats.outOfStockCount === 0;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 p-4 sm:p-6 lg:p-8">

      {/* Top Header - Kept for logic context but styled minimally to fit new design */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          {/* User logic preserved but de-emphasized to let 'Inventory' be the visual lead */}
          <p className="text-sm text-slate-500 mb-1">Welcome back, {user?.name || 'Admin'}</p>
          <h1 className="text-3xl font-bold text-slate-900">Inventory</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {/* Card 1: Products */}
        <div className="bg-[#F9FAFB] rounded-xl p-5 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-900">Products</p>
            <h3 className="text-3xl font-semibold text-slate-900 mt-3">{inventoryStats.totalProducts}</h3>
            <p className="text-xs text-slate-500 mt-1">Category wise</p>
          </div>
          <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
            <Box className="w-5 h-5 text-slate-900" />
          </div>
        </div>

        {/* Card 2: Total Unit */}
        <div className="bg-[#F9FAFB] rounded-xl p-5 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-900">Total unit on hand</p>
            <h3 className="text-3xl font-semibold text-slate-900 mt-3">{inventoryStats.totalUnits}</h3>
            <p className="text-xs text-slate-500 mt-1">Products entire shop</p>
          </div>
          <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
            <Package className="w-5 h-5 text-slate-900" />
          </div>
        </div>

        {/* Card 3: Low Stock */}
        <div className="bg-[#F9FAFB] rounded-xl p-5 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-900">Low stock</p>
            <h3 className="text-3xl font-semibold text-slate-900 mt-3">{inventoryStats.lowStockCount}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {inventoryStats.outOfStockCount} out / {inventoryStats.lowStockCount} low ({'<'}5)
            </p>
          </div>
          <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
            <AlertTriangle className="w-5 h-5 text-slate-900" />
          </div>
        </div>

        {/* Card 4: Capital Value */}
        <div className="bg-[#F9FAFB] rounded-xl p-5 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-900">Capital value</p>
            <h3 className="text-3xl font-semibold text-slate-900 mt-3">
              <span className="text-2xl mr-1">৳</span>
              {inventoryStats.inventoryValue.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Cost Price</p>
          </div>
          <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
            <BarChart3 className="w-5 h-5 text-slate-900" />
          </div>
        </div>

        {/* Card 5: Inventory Value */}
        <div className="bg-[#F9FAFB] rounded-xl p-5 flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-900">Inventory value</p>
            <h3 className="text-3xl font-semibold text-slate-900 mt-3">
              <span className="text-2xl mr-1">৳</span>
              {inventoryStats.inventorySaleValue.toLocaleString()}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Selling Price</p>
          </div>
          <div className="bg-white p-2.5 rounded-lg shadow-sm border border-gray-100">
            <TrendingUp className="w-5 h-5 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 sm:gap-4 lg:gap-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-[320px] bg-[#F9FAFB] rounded-lg h-10 flex items-center">
            <Search className="ml-3 w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Product Name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-slate-800 placeholder-slate-400 w-full px-3 h-full"
            />
            <div className="mr-2 px-3 py-1 bg-white rounded text-xs font-medium text-slate-600 shadow-sm">
              Search
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 whitespace-nowrap">Sort by</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-[#F9FAFB] hover:bg-gray-100 transition-colors pl-4 pr-10 py-2 rounded-lg text-sm font-medium text-slate-800 outline-none cursor-pointer border-none min-w-[180px]"
              >
                <option value="stock-low-high">Stock low to high</option>
                <option value="stock-high-low">Stock high to low</option>
                <option value="price-low-high">Price low to high</option>
                <option value="price-high-low">Price high to low</option>
                <option value="name-asc">Name A-Z</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Threshold Inputs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-3">
            <span>Set the low stock threshold at</span>
            <div className="relative">
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => handleLowStockChange(parseInt(e.target.value) || 5)}
                min="1"
                className="w-16 h-8 bg-[#F9FAFB] text-center text-slate-700 rounded-md outline-none text-sm font-medium border border-transparent focus:border-[#ff6a00] transition-colors"
              />
            </div>
            <span>Unit</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Set the Low Expire threshold at</span>
            <div className="relative">
              <input
                type="number"
                value={expireThreshold}
                onChange={(e) => handleExpireThresholdChange(parseInt(e.target.value) || 10)}
                min="1"
                className="w-16 h-8 bg-[#F9FAFB] text-center text-slate-700 rounded-md outline-none text-sm font-medium border border-transparent focus:border-[#ff6a00] transition-colors"
              />
            </div>
            <span>Days</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">

        {/* Table Section */}
        <div className="xl:col-span-3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead className="bg-[#E0F2FE]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-900">Price</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-900">Stock</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-12 h-12 text-slate-300 mb-3" />
                        <p>No products found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {/* Product Name & Context */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900 leading-snug line-clamp-2">
                              {product.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900">{product.category || 'Uncategorized'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900">{product.price || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-sm font-medium ${(product.stock || 0) < 5 ? 'text-red-600' : 'text-slate-900'}`}>
                          {product.stock || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${(product.stock || 0) === 0 ? 'bg-red-100 text-red-700' :
                            (product.stock || 0) < 5 ? 'bg-amber-100 text-amber-700' :
                              product.status === 'Active' || !product.status ? 'bg-[#DCFCE7] text-[#166534]' :
                                'bg-gray-100 text-gray-700'
                          }`}>
                          {(product.stock || 0) === 0 ? 'Out' :
                            (product.stock || 0) < 5 ? 'Low' :
                              product.status === 'Active' || !product.status ? 'Publish' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Alerts */}
        <div className="xl:col-span-1 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Inventory alerts</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Review the most critical SKUs and plan replenishment</p>

            <div className={`p-4 rounded-lg flex items-start gap-3 ${isInventoryHealthy ? 'bg-[#ECFDF5]' : 'bg-red-50'}`}>
              {isInventoryHealthy ? (
                <span className="text-xs font-medium text-emerald-700 leading-relaxed">
                  Inventory looks healthy: No low-stock items.
                </span>
              ) : (
                  <div className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-red-700 leading-relaxed">
                      {inventoryStats.lowStockCount} items need attention. {inventoryStats.outOfStockCount} out of stock.
                    </span>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;