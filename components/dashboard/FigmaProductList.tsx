import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Plus, Search, MoreVertical, ChevronLeft, ChevronRight, ChevronDown, Download, Upload, Filter, Printer, Edit, Trash2, Copy, Eye, X, Loader2, LayoutGrid, List } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Product, Category, Brand } from '../../types';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';

// Icons as SVG components
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#7B7B7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="#7B7B7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SortIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6 12H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 17H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ExpandIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 3H21V9" stroke="#070707" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21H3V15" stroke="#070707" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 3L14 10" stroke="#070707" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 21L10 14" stroke="#070707" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddSquareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="white" strokeWidth="1.5"/>
  </svg>
);

const DotsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="5" r="1.5" fill="#1D1A1A"/>
    <circle cx="12" cy="12" r="1.5" fill="#1D1A1A"/>
    <circle cx="12" cy="19" r="1.5" fill="#1D1A1A"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-90">
    <path d="M1 1L9 9L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface FigmaProductListProps {
  products?: Product[];
  categories?: Category[];
  brands?: Brand[];
  onAddProduct?: () => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: number) => void;
  onCloneProduct?: (product: Product) => void;
  onBulkDelete?: (ids: number[]) => void;
  onBulkStatusUpdate?: (ids: number[], status: 'Active' | 'Draft') => void;
  onBulkFlashSale?: (ids: number[], action: 'add' | 'remove') => void;
  onBulkDiscount?: (ids: number[], discount: number) => void;
  onImport?: () => void;
  onExport?: () => void;
  onBulkImport?: (products: Product[]) => void;
}

const FigmaProductList: React.FC<FigmaProductListProps> = ({
  products: propProducts = [],
  categories = [],
  brands = [],
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onCloneProduct,
  onBulkDelete,
  onBulkStatusUpdate,
  onBulkFlashSale,
  onBulkDiscount,
  onImport,
  onExport,
  onBulkImport
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'large' | 'small' | 'list'>('list');
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const [productsPerPage, setProductsPerPage] = useState(10);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountValue, setDiscountValue] = useState<number>(0);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Export products to CSV
  const handleExportCSV = useCallback(() => {
    if (propProducts.length === 0) {
      toast.error('No products to export');
      return;
    }
    const dataToExport = propProducts.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || '',
      sku: p.sku || '',
      stock: p.stock || 0,
      category: p.category || '',
      subCategory: p.subCategory || '',
      brand: p.brand || '',
      status: p.status || 'Active',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      galleryImages: Array.isArray(p.galleryImages) ? p.galleryImages.join(';') : '',
      description: p.description || ''
    }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${propProducts.length} products`);
  }, [propProducts]);

  // Generate unique ID using timestamp + random number
  const generateUniqueId = useCallback((): number => {
    return Date.now() + Math.floor(Math.random() * 10000);
  }, []);

  // Helper function to detect Daraz/Lazada format
  const isDarazFormat = (headers: string[]): boolean => {
    const darazHeaders = ['Product Name(English)', '*Product Name(English)', 'Product Images1', '*Product Images1', 'Main Description'];
    return darazHeaders.some(h => headers.some(header => header.includes(h.replace('*', ''))));
  };

  // Helper function to strip HTML tags for clean text
  const stripHtmlTags = (html: string): string => {
    if (!html) return '';
    // Create a temporary div to parse HTML
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Parse Daraz/Lazada format product
  const parseDarazProduct = (row: any, existingIds: Set<number>): Product => {
    // Generate unique ID, ensuring no collision with existing products
    let newId = generateUniqueId();
    while (existingIds.has(newId)) {
      newId = generateUniqueId();
    }
    existingIds.add(newId);

    // Collect all product images (Product Images1 through Product Images8 + White Background Image)
    const imageKeys = [
      'Product Images1', '*Product Images1',
      'Product Images2',
      'Product Images3',
      'Product Images4',
      'Product Images5',
      'Product Images6',
      'Product Images7',
      'Product Images8',
      'White Background Image'
    ];
    
    const galleryImages: string[] = [];
    imageKeys.forEach(key => {
      const value = row[key];
      if (value && typeof value === 'string' && value.trim()) {
        galleryImages.push(value.trim());
      }
    });

    // Get product name (handle asterisk variations)
    const productName = row['*Product Name(English)'] || row['Product Name(English)'] || row['*Product Name'] || row['Product Name'] || '';
    const productNameBengali = row['Product Name(Bengali)'] || '';

    // Get description (Main Description column contains HTML)
    const mainDescription = row['Main Description'] || row['Description'] || '';
    const highlights = row['Highlights'] || '';

    // Build full description with Bengali name and highlights if available
    let fullDescription = mainDescription;
    if (productNameBengali) {
      fullDescription = `<p><strong>Bengali:</strong> ${productNameBengali}</p>${fullDescription}`;
    }
    if (highlights && highlights.trim()) {
      fullDescription = `${fullDescription}<div class="highlights"><h4>Highlights</h4>${highlights}</div>`;
    }

    // Warranty info (can be appended to description or stored separately)
    const warranty = row['Warranty'] || '';
    const warrantyType = row['Warranty Type'] || '';
    const warrantyPolicy = row['Warranty Policy'] || '';
    if (warranty || warrantyType || warrantyPolicy) {
      const warrantyText = [warranty, warrantyType, warrantyPolicy].filter(Boolean).join(' - ');
      fullDescription = `${fullDescription}<p><strong>Warranty:</strong> ${warrantyText}</p>`;
    }

    // Create slug from product name
    const slug = productName.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .substring(0, 100);

    return {
      id: newId,
      name: productName || 'Unnamed Product',
      price: parseFloat(row['Price'] || row['*Price'] || row['Sale Price'] || '0') || 0,
      originalPrice: parseFloat(row['Original Price'] || row['Regular Price'] || '0') || 0,
      costPrice: 0,
      image: galleryImages[0] || '',
      galleryImages: galleryImages,
      description: fullDescription,
      category: row['Category'] || row['*Category'] || '',
      subCategory: row['Sub Category'] || '',
      childCategory: row['Child Category'] || '',
      brand: row['Brand'] || row['*Brand'] || '',
      sku: row['SKU'] || row['Product ID'] || `SKU-${newId}`,
      stock: parseInt(row['Stock'] || row['Quantity'] || '0') || 0,
      status: 'Active' as const,
      tags: [],
      slug: slug || `product-${newId}`,
    };
  };

  // Parse standard CSV format product
  const parseStandardProduct = (row: any, existingIds: Set<number>): Product => {
    // Generate unique ID, ensuring no collision with existing products
    let newId = generateUniqueId();
    while (existingIds.has(newId)) {
      newId = generateUniqueId();
    }
    existingIds.add(newId);
    
    return {
      id: newId,
      name: row.name || row.Name || row.product_name || 'Unnamed Product',
      price: parseFloat(row.price || row.Price || row.salesPrice || row.sales_price || '0') || 0,
      originalPrice: parseFloat(row.originalPrice || row.original_price || row.regularPrice || row.regular_price || '0') || 0,
      costPrice: parseFloat(row.costPrice || row.cost_price || '0') || 0,
      image: row.image || row.Image || row.mainImage || row.main_image || '',
      galleryImages: (row.galleryImages || row.gallery_images || '').split(',').filter(Boolean).map((s: string) => s.trim()),
      description: row.description || row.Description || '',
      category: row.category || row.Category || '',
      subCategory: row.subCategory || row.sub_category || '',
      childCategory: row.childCategory || row.child_category || '',
      brand: row.brand || row.Brand || '',
      sku: row.sku || row.SKU || `SKU-${newId}`,
      stock: parseInt(row.stock || row.Stock || row.quantity || row.Quantity || '0') || 0,
      status: (row.status || row.Status || 'Active') as 'Active' | 'Draft',
      tags: (row.tags || row.Tags || '').split(',').filter(Boolean).map((s: string) => s.trim()),
      slug: row.slug || row.Slug || (row.name || row.Name || '').toLowerCase().replace(/\s+/g, '-'),
    };
  };

  // Process parsed data (common logic for CSV/TSV/XLSX)
  const processImportedData = useCallback((data: any[], headers: string[]) => {
    try {
      // Get existing product IDs to avoid duplicates
      const existingIds = new Set(propProducts.map(p => p.id));
      
      const useDarazFormat = isDarazFormat(headers);
      
      if (useDarazFormat) {
        console.log('Detected Daraz/Lazada format, using specialized parser');
      }
      
      const importedProducts: Product[] = data.map((row: any) => {
        if (useDarazFormat) {
          return parseDarazProduct(row, existingIds);
        } else {
          return parseStandardProduct(row, existingIds);
        }
      }).filter((p: Product) => p.name !== 'Unnamed Product' || p.price > 0 || p.image);

      if (importedProducts.length === 0) {
        toast.error('No valid products found in file');
        return;
      }

      if (onBulkImport) {
        onBulkImport(importedProducts);
        toast.success(`Imported ${importedProducts.length} products successfully! (${useDarazFormat ? 'Daraz format' : 'Standard format'})`);
      } else {
        toast.success(`Parsed ${importedProducts.length} products. Connect onBulkImport handler to save.`);
        console.log('Import ready:', importedProducts);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file data');
    }
  }, [propProducts, onBulkImport]);

  // Import products from CSV/TSV/XLSX (supports multiple formats)
  const handleImportFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (onImport) {
      onImport();
      if (importInputRef.current) importInputRef.current.value = '';
      return;
    }
    
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    const isTSV = fileName.endsWith('.tsv');
    
    if (isExcel) {
      // Handle Excel files (.xlsx, .xls)
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          
          // Get headers from first row
          const headers = Object.keys(jsonData[0] || {});
          
          processImportedData(jsonData, headers);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          toast.error('Failed to parse Excel file');
        }
      };
      reader.onerror = () => {
        toast.error('Failed to read Excel file');
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Handle CSV/TSV files
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        delimiter: isTSV ? '\t' : undefined, // Use tab delimiter for TSV
        complete: (results) => {
          const headers = results.meta.fields || [];
          processImportedData(results.data, headers);
        },
        error: (error) => {
          toast.error('Failed to parse file');
          console.error('File parse error:', error);
        }
      });
    }
    
    if (importInputRef.current) importInputRef.current.value = '';
  }, [onImport, processImportedData]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setOpenDropdownId(null);
        setShowCategoryDropdown(false);
        setShowBrandDropdown(false);
        setShowStatusDropdown(false);
        setShowPerPageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = propProducts;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (brandFilter !== 'all') {
      filtered = filtered.filter(p => p.brand === brandFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    return filtered;
  }, [propProducts, searchQuery, categoryFilter, brandFilter, statusFilter]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, currentPage, productsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, brandFilter, statusFilter]);

  // Helper to get unique key for each product (handles duplicate IDs)
  const getProductKey = useCallback((product: Product, idx: number): string => {
    return (product as any)._id || `${product.id}-${idx}`;
  }, []);

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === paginatedProducts.length) {
      setSelectedIds(new Set());
    } else {
      const allKeys = paginatedProducts.map((p, idx) => getProductKey(p, idx));
      setSelectedIds(new Set(allKeys));
    }
  }, [selectedIds.size, paginatedProducts, getProductKey]);

  const handleSelectProduct = useCallback((key: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  // Get actual product IDs from selected keys
  const getSelectedProductIds = useCallback((): number[] => {
    return paginatedProducts
      .filter((p, idx) => selectedIds.has(getProductKey(p, idx)))
      .map(p => p.id);
  }, [paginatedProducts, selectedIds, getProductKey]);

  const handlePrintMultiple = useCallback(() => {
    if (selectedIds.size === 0) {
      toast.error('Select products to print');
      return;
    }
    toast.success(`Printing ${selectedIds.size} products`);
  }, [selectedIds.size]);

  // Bulk action handlers
  const handleBulkDelete = useCallback(() => {
    const ids = getSelectedProductIds();
    if (ids.length === 0) {
      toast.error('Select products to delete');
      return;
    }
    if (onBulkDelete) {
      onBulkDelete(ids);
    } else {
      toast.success(`Deleted ${ids.length} products`);
    }
    setSelectedIds(new Set());
  }, [getSelectedProductIds, onBulkDelete]);

  const handleBulkPublish = useCallback(() => {
    const ids = getSelectedProductIds();
    if (ids.length === 0) {
      toast.error('Select products to publish');
      return;
    }
    if (onBulkStatusUpdate) {
      onBulkStatusUpdate(ids, 'Active');
    } else {
      toast.success(`Published ${ids.length} products`);
    }
    setSelectedIds(new Set());
  }, [getSelectedProductIds, onBulkStatusUpdate]);

  const handleBulkDraft = useCallback(() => {
    const ids = getSelectedProductIds();
    if (ids.length === 0) {
      toast.error('Select products to draft');
      return;
    }
    if (onBulkStatusUpdate) {
      onBulkStatusUpdate(ids, 'Draft');
    } else {
      toast.success(`Moved ${ids.length} products to draft`);
    }
    setSelectedIds(new Set());
  }, [getSelectedProductIds, onBulkStatusUpdate]);

  const handleBulkFlashSale = useCallback((action: 'add' | 'remove') => {
    const ids = getSelectedProductIds();
    if (ids.length === 0) {
      toast.error('Select products first');
      return;
    }
    if (onBulkFlashSale) {
      onBulkFlashSale(ids, action);
    } else {
      toast.success(action === 'add' ? `Added ${ids.length} products to Flash Sale` : `Removed ${ids.length} products from Flash Sale`);
    }
    setSelectedIds(new Set());
  }, [getSelectedProductIds, onBulkFlashSale]);

  const handleApplyDiscount = useCallback(() => {
    const ids = getSelectedProductIds();
    if (ids.length === 0) {
      toast.error('Select products first');
      return;
    }
    if (discountValue <= 0) {
      toast.error('Enter a valid discount percentage');
      return;
    }
    if (onBulkDiscount) {
      onBulkDiscount(ids, discountValue);
    } else {
      toast.success(`Applied ${discountValue}% discount to ${ids.length} products`);
    }
    setShowDiscountModal(false);
    setDiscountValue(0);
    setSelectedIds(new Set());
  }, [getSelectedProductIds, discountValue, onBulkDiscount]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const uniqueCategories = useMemo(() => {
    const cats = new Set(propProducts.map(p => p.category).filter(Boolean));
    return Array.from(cats);
  }, [propProducts]);

  const uniqueBrands = useMemo(() => {
    const brds = new Set(propProducts.map(p => p.brand).filter(Boolean));
    return Array.from(brds);
  }, [propProducts]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl mx-1 xxs:mx-2 sm:mx-4 md:mx-6 p-2 xxs:p-3 sm:p-6 shadow-sm font-['Poppins']">
      {/* Hidden file input for CSV/TSV/XLSX import */}
      <input
        type="file"
        ref={importInputRef}
        onChange={handleImportFile}
        accept=".csv,.tsv,.xlsx,.xls"
        className="hidden"
      />
      {/* Header Row */}
      <div className="flex flex-col gap-3 xxs:gap-4 mb-4 xxs:mb-5">
        <h1 className="text-base xxs:text-lg sm:text-xl lg:text-[22px] font-bold text-[#023337] dark:text-white tracking-[0.11px] font-['Lato']">Products</h1>
        
        <div className="flex flex-col xxs:flex-row flex-wrap items-stretch xxs:items-center gap-2 xxs:gap-3 sm:gap-4 lg:gap-6 w-full lg:w-auto">
          {/* Search Bar */}
          <div className="bg-[#f9f9f9] dark:bg-gray-700 h-[32px] xxs:h-[34px] rounded-lg flex items-center px-2 w-full xxs:w-auto xxs:flex-1 sm:w-[200px] md:w-[292px] sm:flex-none">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[11px] xxs:text-[12px] text-[#7b7b7b] dark:text-gray-400 ml-2 flex-1 outline-none min-w-0"
            />
          </div>

          {/* Deep Search - Hidden on very small screens */}
          <button className="hidden xs:flex bg-[#f9f9f9] dark:bg-gray-700 h-[34px] rounded-lg items-center gap-2 px-3 sm:px-4">
            <SortIcon />
            <span className="text-[12px] text-black dark:text-white">Deep Search</span>
          </button>

          {/* View Mode */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => setShowViewDropdown(!showViewDropdown)}
              className="border border-[#ff6a00] h-[36px] xxs:h-[40px] sm:h-[48px] rounded-lg flex items-center justify-between px-2 xxs:px-3 min-w-0 xxs:min-w-[100px] sm:min-w-[140px] w-full xxs:w-auto"
            >
              <div className="flex flex-col gap-0 xxs:gap-0.5 items-start overflow-hidden">
                <span className="text-[10px] xxs:text-[11px] font-medium text-[#070707] dark:text-white tracking-[-0.24px]">View</span>
                <div className="flex items-center gap-1">
                  <ExpandIcon />
                  <span className="text-[11px] xxs:text-[13px] text-[#070707] dark:text-white tracking-[-0.3px] truncate">
                    {viewMode === 'large' ? 'Large' : viewMode === 'small' ? 'Small' : 'List'}
                  </span>
                </div>
              </div>
              <ChevronDown size={14} className="text-gray-600 dark:text-gray-400 flex-shrink-0 ml-1" />
            </button>
            {showViewDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-600 z-50 py-1 w-[140px] xxs:w-[155px]">
                <button
                  onClick={() => { setViewMode('large'); setShowViewDropdown(false); }}
                  className={`w-full px-2 xxs:px-3 py-2 text-left text-[12px] xxs:text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${viewMode === 'large' ? 'bg-orange-50 text-[#ff6a00]' : 'dark:text-gray-200'}`}
                >
                  <ExpandIcon />
                  Large icons
                </button>
                <button
                  onClick={() => { setViewMode('small'); setShowViewDropdown(false); }}
                  className={`w-full px-2 xxs:px-3 py-2 text-left text-[12px] xxs:text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${viewMode === 'small' ? 'bg-orange-50 text-[#ff6a00]' : 'dark:text-gray-200'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                  Small icons
                </button>
                <button
                  onClick={() => { setViewMode('list'); setShowViewDropdown(false); }}
                  className={`w-full px-2 xxs:px-3 py-2 text-left text-[12px] xxs:text-[13px] hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 ${viewMode === 'list' ? 'bg-orange-50 text-[#ff6a00]' : 'dark:text-gray-200'}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                  List view
                </button>
              </div>
            )}
          </div>

          {/* Add Product */}
          <button
            onClick={onAddProduct}
            className="bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] h-[36px] xxs:h-[40px] sm:h-[48px] rounded-lg flex items-center justify-center gap-1 px-3 sm:px-4 w-full xxs:w-auto"
          >
            <AddSquareIcon />
            <span className="text-[13px] xxs:text-[15px] font-bold text-white tracking-[-0.3px] font-['Lato']">Add Product</span>
          </button>
        </div>
      </div>

      {/* Second Row: Import/Export & Filters */}
      <div className="flex flex-col gap-3 xxs:gap-4 mb-4 xxs:mb-5">
        <div className="flex flex-wrap items-center gap-2 xxs:gap-3 sm:gap-4">
          {/* Import */}
          <button onClick={() => importInputRef.current?.click()} className="flex items-center gap-1 text-[11px] xxs:text-[12px] text-[#161719] dark:text-gray-300 hover:text-[#ff6a00] transition-colors">
            {/* <Download size={20} className="text-[#161719]" /> */}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="xxs:w-5 xxs:h-5">
                <path d="M14.1667 17.5C13.6611 17.0085 11.6667 15.7002 11.6667 15C11.6667 14.2997 13.6611 12.9915 14.1667 12.5M12.5001 15H18.3334" stroke="#FF5500" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.0001 17.5C6.07171 17.5 4.10752 17.5 2.88714 16.2796C1.66675 15.0592 1.66675 13.095 1.66675 9.16667V6.62023C1.66675 5.1065 1.66675 4.34963 1.98368 3.78172C2.2096 3.37689 2.54364 3.04285 2.94846 2.81693C3.51638 2.5 4.27325 2.5 5.78697 2.5C6.75676 2.5 7.24166 2.5 7.66613 2.65917C8.63525 3.0226 9.03491 3.90298 9.47225 4.77761L10.0001 5.83333M6.66675 5.83333H13.9584C15.714 5.83333 16.5917 5.83333 17.2223 6.25466C17.4953 6.43706 17.7297 6.67143 17.9121 6.94441C18.3164 7.54952 18.3327 8.38233 18.3334 10V11.6667" stroke="#FF5500" strokeWidth="1.25" strokeLinecap="round"/>
                </svg>

            Import
          </button>

          {/* Export */}
          <button onClick={handleExportCSV} className="flex items-center gap-1 text-[11px] xxs:text-[12px] text-[#161719] dark:text-gray-300 hover:text-[#ff6a00] transition-colors">
            {/* <Upload size={20} className="text-[#161719]" /> */}
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="xxs:w-5 xxs:h-5">
            <path d="M15.8334 17.5C16.3391 17.0085 18.3334 15.7002 18.3334 15C18.3334 14.2997 16.3391 12.9915 15.8334 12.5M17.5001 15H11.6667" stroke="#FF5500" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.0001 17.5C6.07171 17.5 4.10752 17.5 2.88714 16.2796C1.66675 15.0592 1.66675 13.095 1.66675 9.16667V6.62023C1.66675 5.1065 1.66675 4.34963 1.98368 3.78172C2.2096 3.37689 2.54364 3.04285 2.94846 2.81693C3.51638 2.5 4.27325 2.5 5.78697 2.5C6.75676 2.5 7.24166 2.5 7.66613 2.65917C8.63525 3.0226 9.03491 3.90298 9.47225 4.77761L10.0001 5.83333M6.66675 5.83333H13.9584C15.714 5.83333 16.5917 5.83333 17.2223 6.25466C17.4953 6.43706 17.7297 6.67143 17.9121 6.94441C18.3164 7.54952 18.3327 8.38233 18.3334 10V10.8333" stroke="#FF5500" strokeWidth="1.25" strokeLinecap="round"/>
            </svg>

            Export
          </button>

          {/* Products Per Page */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => setShowPerPageDropdown(!showPerPageDropdown)}
              className="bg-[#f9f9f9] dark:bg-gray-700 rounded-lg flex items-center justify-between gap-1 xxs:gap-2 px-2 xxs:px-3 py-1.5 xxs:py-2 w-auto"
            >
              <span className="text-[11px] xxs:text-[12px] text-black dark:text-white">{productsPerPage}</span>
              <ChevronDown size={12} className="text-gray-600 dark:text-gray-400 xxs:w-[14px] xxs:h-[14px]" />
            </button>
            {showPerPageDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-600 z-50 py-1 w-[80px] xxs:w-[100px]">
                {[10, 20, 50, 100].map(num => (
                  <button
                    key={num}
                    onClick={() => { setProductsPerPage(num); setShowPerPageDropdown(false); }}
                    className="w-full px-2 xxs:px-3 py-1.5 xxs:py-2 text-left text-[11px] xxs:text-[12px] hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xxs:gap-3 sm:gap-4">
          {/* Filter Label */}
          <div className="flex items-center gap-1 xxs:gap-2">
            <SortIcon />
            <span className="text-[11px] xxs:text-[12px] text-black dark:text-white">Filter:</span>
          </div>

          {/* Category Filter */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowBrandDropdown(false); setShowStatusDropdown(false); }}
              className="bg-[#f9f9f9] dark:bg-gray-700 rounded-lg flex items-center justify-between gap-1 xxs:gap-2 px-2 xxs:px-3 py-1.5 xxs:py-2 min-w-0 max-w-[100px] xxs:max-w-[119px]"
            >
              <span className="text-[11px] xxs:text-[12px] text-black dark:text-white truncate">
                {categoryFilter === 'all' ? 'All' : categoryFilter}
              </span>
              <ChevronDown size={12} className="text-gray-600 dark:text-gray-400 flex-shrink-0 xxs:w-[14px] xxs:h-[14px]" />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-600 z-50 py-1 w-[130px] xxs:w-[150px] max-h-[200px] overflow-y-auto">
                <button
                  onClick={() => { setCategoryFilter('all'); setShowCategoryDropdown(false); }}
                  className="w-full px-2 xxs:px-3 py-1.5 xxs:py-2 text-left text-[11px] xxs:text-[12px] hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  All Category
                </button>
                {uniqueCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategoryFilter(cat!); setShowCategoryDropdown(false); }}
                    className="w-full px-2 xxs:px-3 py-1.5 xxs:py-2 text-left text-[11px] xxs:text-[12px] hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 truncate"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Brand Filter */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setShowBrandDropdown(!showBrandDropdown); setShowCategoryDropdown(false); setShowStatusDropdown(false); }}
              className="bg-[#f9f9f9] dark:bg-gray-700 rounded-lg flex items-center justify-between gap-1 xxs:gap-2 px-2 xxs:px-3 py-1.5 xxs:py-2 min-w-0 max-w-[90px] xxs:max-w-[110px]"
            >
              <span className="text-[11px] xxs:text-[12px] text-black dark:text-white truncate">
                {brandFilter === 'all' ? 'All' : brandFilter}
              </span>
              <ChevronDown size={12} className="text-gray-600 dark:text-gray-400 flex-shrink-0 xxs:w-[14px] xxs:h-[14px]" />
            </button>
            {showBrandDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-600 z-50 py-1 w-[130px] xxs:w-[150px] max-h-[200px] overflow-y-auto">
                <button
                  onClick={() => { setBrandFilter('all'); setShowBrandDropdown(false); }}
                  className="w-full px-2 xxs:px-3 py-1.5 xxs:py-2 text-left text-[11px] xxs:text-[12px] hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  All Brands
                </button>
                {uniqueBrands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => { setBrandFilter(brand!); setShowBrandDropdown(false); }}
                    className="w-full px-2 xxs:px-3 py-1.5 xxs:py-2 text-left text-[11px] xxs:text-[12px] hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 truncate"
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative" data-dropdown>
            <button
              onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowCategoryDropdown(false); setShowBrandDropdown(false); }}
              className="bg-[#f9f9f9] dark:bg-gray-700 rounded-lg flex items-center justify-between gap-1 xxs:gap-2 px-2 xxs:px-3 py-1.5 xxs:py-2 min-w-0"
            >
              <span className="text-[11px] xxs:text-[12px] text-black dark:text-white">
                {statusFilter === 'all' ? 'All' : statusFilter}
              </span>
              <ChevronDown size={12} className="text-gray-600 dark:text-gray-400 xxs:w-[14px] xxs:h-[14px]" />
            </button>
            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-600 z-50 py-1 w-[100px] xxs:w-[120px]">
                <button
                  onClick={() => { setStatusFilter('all'); setShowStatusDropdown(false); }}
                  className="w-full px-2 xxs:px-3 py-1.5 xxs:py-2 text-left text-[11px] xxs:text-[12px] hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  All Status
                </button>
                <button
                  onClick={() => { setStatusFilter('Active'); setShowStatusDropdown(false); }}
                  className="w-full px-2 xxs:px-3 py-1.5 xxs:py-2 text-left text-[11px] xxs:text-[12px] hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  Publish
                </button>
                <button
                  onClick={() => { setStatusFilter('Draft'); setShowStatusDropdown(false); }}
                  className="w-full px-2 xxs:px-3 py-1.5 xxs:py-2 text-left text-[11px] xxs:text-[12px] hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                >
                  Draft
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar - Shows when items are selected */}
      {selectedIds.size > 0 && (
        <div className="bg-gradient-to-r from-[#ff6a00] to-[#ff9500] rounded-xl p-2 xxs:p-3 sm:p-4 mb-4 xxs:mb-5 flex flex-col xxs:flex-row flex-wrap items-start xxs:items-center justify-between gap-2 xxs:gap-4">
          <div className="flex items-center gap-2 xxs:gap-3">
            <span className="text-white font-semibold text-xs xxs:text-sm">
              {selectedIds.size} selected
            </span>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-white/80 hover:text-white text-xs xxs:text-sm underline"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1 xxs:gap-2">
            <button
              onClick={handleBulkPublish}
              className="bg-white text-green-600 px-2 xxs:px-3 sm:px-4 py-1.5 xxs:py-2 rounded-lg text-xs xxs:text-sm font-medium hover:bg-green-50 transition-colors flex items-center gap-1 xxs:gap-2"
            >
              <Eye size={14} className="xxs:w-4 xxs:h-4" />
              <span className="hidden xxs:inline">Publish</span>
            </button>
            <button
              onClick={handleBulkDraft}
              className="bg-white text-gray-600 px-2 xxs:px-3 sm:px-4 py-1.5 xxs:py-2 rounded-lg text-xs xxs:text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1 xxs:gap-2"
            >
              <Edit size={14} className="xxs:w-4 xxs:h-4" />
              <span className="hidden xxs:inline">Draft</span>
            </button>
            <button
              onClick={() => handleBulkFlashSale('add')}
              className="bg-white text-orange-600 px-2 xxs:px-3 sm:px-4 py-1.5 xxs:py-2 rounded-lg text-xs xxs:text-sm font-medium hover:bg-orange-50 transition-colors flex items-center gap-1 xxs:gap-2"
            >
              ⚡ <span className="hidden xs:inline">Flash Sale</span>
            </button>
            <button
              onClick={() => handleBulkFlashSale('remove')}
              className="hidden sm:flex bg-white text-yellow-600 px-2 xxs:px-3 sm:px-4 py-1.5 xxs:py-2 rounded-lg text-xs xxs:text-sm font-medium hover:bg-yellow-50 transition-colors items-center gap-1 xxs:gap-2"
            >
              ⚡ Remove
            </button>
            <button
              onClick={() => setShowDiscountModal(true)}
              className="bg-white text-purple-600 px-2 xxs:px-3 sm:px-4 py-1.5 xxs:py-2 rounded-lg text-xs xxs:text-sm font-medium hover:bg-purple-50 transition-colors flex items-center gap-1 xxs:gap-2"
            >
              %
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-white text-red-600 px-2 xxs:px-3 sm:px-4 py-1.5 xxs:py-2 rounded-lg text-xs xxs:text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-1 xxs:gap-2"
            >
              <Trash2 size={14} className="xxs:w-4 xxs:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 xxs:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 xxs:p-4 sm:p-6 w-full max-w-[350px] xxs:max-w-[400px] shadow-2xl">
            <h3 className="text-base xxs:text-lg font-semibold mb-3 xxs:mb-4 dark:text-white">Apply Discount</h3>
            <p className="text-xs xxs:text-sm text-gray-600 dark:text-gray-400 mb-3 xxs:mb-4">
              Apply discount to {selectedIds.size} selected product{selectedIds.size > 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2 mb-3 xxs:mb-4">
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                placeholder="Enter discount %"
                className="flex-1 h-9 xxs:h-10 border dark:border-gray-600 rounded-lg px-2 xxs:px-3 text-xs xxs:text-sm outline-none focus:border-[#ff6a00] bg-white dark:bg-gray-700 dark:text-white"
                min="0"
                max="100"
              />
              <span className="text-gray-500 dark:text-gray-400">%</span>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowDiscountModal(false); setDiscountValue(0); }}
                className="px-3 xxs:px-4 py-1.5 xxs:py-2 text-xs xxs:text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyDiscount}
                className="px-3 xxs:px-4 py-1.5 xxs:py-2 text-xs xxs:text-sm bg-[#ff6a00] text-white rounded-lg hover:bg-[#e55d00]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid View - Large Icons */}
      {viewMode === 'large' && (
        <div className="grid grid-cols-1 xxs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 xxs:gap-3 sm:gap-4">
          {paginatedProducts.length > 0 ? paginatedProducts.map((product, idx) => {
            const productKey = getProductKey(product, idx);
            return (
            <div key={productKey} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-2 xxs:p-3 sm:p-4 hover:shadow-lg transition-shadow relative group">
              {/* Checkbox */}
              <div className="absolute top-2 xxs:top-3 left-2 xxs:left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedIds.has(productKey)}
                  onChange={() => handleSelectProduct(productKey)}
                  className="w-4 h-4 xxs:w-5 xxs:h-5 rounded border-gray-300"
                />
              </div>
              {/* Actions Dropdown */}
              <div className="absolute top-2 xxs:top-3 right-2 xxs:right-3 z-10" data-dropdown>
                <button
                  onClick={() => setOpenDropdownId(openDropdownId === productKey ? null : productKey)}
                  className="p-1 xxs:p-1.5 bg-white/80 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors"
                >
                  <DotsIcon />
                </button>
                {openDropdownId === productKey && (
                  <div className="absolute right-0 top-[calc(100%+4px)] z-[9999]">
                    <div className="w-[140px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-600 overflow-hidden py-1">
                      <button
                        onClick={() => { onEditProduct?.(product); setOpenDropdownId(null); }}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => { onCloneProduct?.(product); setOpenDropdownId(null); }}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Copy size={14} /> Duplicate
                      </button>
                      <button
                        onClick={() => { window.open(`/product/${product.slug || product.id}`, '_blank'); setOpenDropdownId(null); }}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <Eye size={14} /> View
                      </button>
                      <button
                        onClick={() => { onDeleteProduct?.(product.id); setOpenDropdownId(null); }}
                        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm text-red-600"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                )}&rbrace;
              </div>
              {/* Image */}
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] mb-3">
                {product.image ? (
                  <img
                    src={normalizeImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-xs xxs:text-sm">
                    No Image
                  </div>
                )}
              </div>
              {/* Info */}
              <h3 className="text-[11px] xxs:text-xs sm:text-[14px] font-medium text-gray-900 dark:text-white line-clamp-2 mb-1 sm:mb-2">{product.name}</h3>
              <p className="text-[11px] xxs:text-[13px] text-gray-500 dark:text-gray-400 mb-1 xxs:mb-2">{product.category || 'Uncategorized'}</p>
              <div className="flex items-center justify-between">
                <span className="text-[13px] xxs:text-[15px] font-bold text-[#1e90ff]">৳{product.price}</span>
                <span className={`px-1.5 xxs:px-2 py-0.5 rounded-full text-[9px] xxs:text-[11px] font-medium ${
                  product.status === 'Active' 
                    ? 'bg-[#c1ffbc] text-[#085e00]' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {product.status === 'Active' ? 'Publish' : 'Draft'}
                </span>
              </div>
              {product.sku && <p className="text-[10px] xxs:text-[11px] text-gray-400 dark:text-gray-500 mt-1 xxs:mt-2">SKU: {product.sku}</p>}
            </div>
          );}) : (
            <div className="col-span-full py-8 xxs:py-12 text-center text-gray-500 dark:text-gray-400">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 xxs:w-16 xxs:h-16 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-2 xxs:mb-3">
                  <Search size={20} className="text-gray-400 dark:text-gray-500 xxs:w-6 xxs:h-6" />
                </div>
                <p className="font-medium text-sm xxs:text-base">No products found</p>
                <p className="text-xs xxs:text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid View - Small Icons */}
      {viewMode === 'small' && (
        <div className="grid grid-cols-2 xxs:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 xxs:gap-3">
          {paginatedProducts.length > 0 ? paginatedProducts.map((product, idx) => {
            const productKey = getProductKey(product, idx);
            return (
            <div key={productKey} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-1.5 xxs:p-2 hover:shadow-md transition-shadow relative group">
              {/* Checkbox */}
              <div className="absolute top-1 left-1 z-10">
                <input
                  type="checkbox"
                  checked={selectedIds.has(productKey)}
                  onChange={() => handleSelectProduct(productKey)}
                  className="w-3 h-3 xxs:w-4 xxs:h-4 rounded border-gray-300"
                />
              </div>
              {/* Image */}
              <div 
                className="w-full aspect-square rounded overflow-hidden bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] mb-1.5 xxs:mb-2 cursor-pointer"
                onClick={() => onEditProduct?.(product)}
              >
                {product.image ? (
                  <img
                    src={normalizeImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-[10px] xxs:text-xs">
                    No Img
                  </div>
                )}
              </div>
              {/* Info */}
              <h3 className="text-[10px] xxs:text-[11px] font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
              <div className="flex items-center justify-between mt-0.5 xxs:mt-1">
                <span className="text-[11px] xxs:text-[12px] font-bold text-[#1e90ff]">৳{product.price}</span>
                <span className={`w-1.5 h-1.5 xxs:w-2 xxs:h-2 rounded-full ${
                  product.status === 'Active' ? 'bg-green-500' : 'bg-orange-400'
                }`} title={product.status === 'Active' ? 'Published' : 'Draft'} />
              </div>
            </div>
            );
          }) : (
            <div className="col-span-full py-8 xxs:py-12 text-center text-gray-500 dark:text-gray-400">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 xxs:w-16 xxs:h-16 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-2 xxs:mb-3">
                  <Search size={20} className="text-gray-400 dark:text-gray-500 xxs:w-6 xxs:h-6" />
                </div>
                <p className="font-medium text-sm xxs:text-base">No products found</p>
                <p className="text-xs xxs:text-sm">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List View - Table */}
      {viewMode === 'list' && (
      <><div className="hidden sm:block overflow-visible min-h-[200px] -mx-2 xxs:-mx-3 sm:mx-0 px-2 xxs:px-3 sm:px-0">
        <table className="w-full text-xs xxs:text-sm overflow-visible min-w-0">
          <thead className="bg-[#E0F2FE] dark:bg-gray-700">
            <tr>
              <th className="px-2 xxs:px-3 sm:px-4 py-2 xxs:py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === paginatedProducts.length && paginatedProducts.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 xxs:w-5 xxs:h-5 rounded border-[1.5px] border-[#050605] bg-white dark:bg-gray-600"
                />
              </th>
              <th className="px-2 xxs:px-3 sm:px-4 py-2 xxs:py-3 text-left font-medium text-black dark:text-white text-[12px] xxs:text-[14px] sm:text-[16px]">SL</th>
              <th className="px-2 xxs:px-3 sm:px-4 py-2 xxs:py-3 text-left font-medium text-black dark:text-white text-[12px] xxs:text-[14px] sm:text-[16px]">Image</th>
              <th className="px-2 xxs:px-3 sm:px-4 py-2 xxs:py-3 text-left font-medium text-black dark:text-white text-[12px] xxs:text-[14px] sm:text-[16px]">Name</th>
              <th className="px-2 xxs:px-3 sm:px-4 py-2 xxs:py-3 text-left font-medium text-black dark:text-white text-[12px] xxs:text-[14px] sm:text-[16px]">Category</th>
              <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-black dark:text-white text-[16px]">Sub Category</th>
              <th className="hidden lg:table-cell px-4 py-3 text-left font-medium text-black dark:text-white text-[16px]">Priority</th>
              <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-black dark:text-white text-[16px]">SKU</th>
              <th className="hidden lg:table-cell px-4 py-3 text-left font-medium text-black dark:text-white text-[16px]">Tags</th>
              <th className="px-4 py-3 text-left font-medium text-black dark:text-white text-[16px]">Status</th>
              <th className="px-4 py-3 text-center font-medium text-black dark:text-white text-[16px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#b9b9b9]/50 dark:divide-gray-700 overflow-visible">
            {paginatedProducts.length > 0 ? paginatedProducts.map((product, index) => {
              const productKey = getProductKey(product, index);
              return (
              <tr key={productKey} className="h-[68px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(productKey)}
                    onChange={() => handleSelectProduct(productKey)}
                    className="w-5 h-5 rounded border-[1.5px] border-[#eaf8e7] bg-white dark:bg-gray-600"
                  />
                </td>
                <td className="px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200 text-center">
                  {(currentPage - 1) * productsPerPage + index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-r from-[#38bdf8] to-[#1e90ff]">
                    {product.image ? (
                      <img
                        src={normalizeImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs">
                        No img
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[12px] text-[#1d1a1a] dark:text-gray-200 max-w-[200px] line-clamp-2">
                    {product.name}
                  </p>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200">
                  {product.category || '-'}
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200">
                  {product.subCategory || '-'}
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200">
                  {product.rating ? `${Math.round(product.rating * 10)}%` : '-'}
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200">
                  {product.sku || '-'}
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200">
                  {product.tag || (Array.isArray(product.tags) ? product.tags.join(', ') : '') || '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-[9px] py-0.5 rounded-[30px] text-[12px] font-medium ${
                    product.status === 'Active' 
                      ? 'bg-[#c1ffbc] text-[#085e00]' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {product.status === 'Active' ? 'Publish' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center relative">
                  <div data-dropdown>
                    <button
                      onClick={() => setOpenDropdownId(openDropdownId === productKey ? null : productKey)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      <DotsIcon />
                    </button>
                    {openDropdownId === productKey && (
                      <div className="absolute right-4 top-[calc(100%+4px)] z-[9999]">
                        <div className="w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 overflow-hidden py-2">
                          <button
                            onClick={() => { onEditProduct?.(product); setOpenDropdownId(null); }}
                            className="flex items-center gap-3 w-full h-10 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => { onCloneProduct?.(product); setOpenDropdownId(null); }}
                            className="flex items-center gap-3 w-full h-10 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            <Copy size={16} />
                            Duplicate
                          </button>
                          <button
                            onClick={() => { window.open(`/product/${product.slug || product.id}`, '_blank'); setOpenDropdownId(null); }}
                            className="flex items-center gap-3 w-full h-10 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            <Eye size={16} />
                            View
                          </button>
                          <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
                          <button
                            onClick={() => { onDeleteProduct?.(product.id); setOpenDropdownId(null); }}
                            className="flex items-center gap-3 w-full h-10 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-red-600"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );}) : (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-3">
                      <Search size={24} className="text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="font-medium">No products found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View for Products */}
      <div className="block sm:hidden space-y-2">
        {paginatedProducts.length > 0 ? paginatedProducts.map((product, idx) => {
          const productKey = getProductKey(product, idx);
          return (
            <div key={productKey} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {product.images?.[0] ? (
                  <img src={normalizeImageUrl(product.images[0])} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">৳{product.sellingPrice || product.price} | Stock: {product.stock ?? 0}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${product.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {product.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="relative" data-dropdown>
                <button onClick={() => setOpenDropdownId(openDropdownId === productKey ? null : productKey)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                {openDropdownId === productKey && (
                  <div className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[120px]">
                    <button onClick={() => { window.open(`/product/${product.slug || product.id}`, '_blank'); setOpenDropdownId(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Eye size={16} />
                      View
                    </button>
                    <button onClick={() => { onEditProduct?.(product); setOpenDropdownId(null); }} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <Edit size={16} />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            <p className="text-sm">No products found</p>
          </div>
        )}
      </div>
      </>
      )}

      {/* Footer: Print & Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col items-center mt-6 pt-4 gap-4">
          {/* Pagination - Centered */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center border dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page, idx) => (
              <button
                key={idx}
                onClick={() => typeof page === 'number' && setCurrentPage(page)}
                disabled={page === '...'}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-[#38bdf8] text-white'
                    : page === '...'
                    ? 'cursor-default dark:text-gray-400'
                    : 'border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center border dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-300"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FigmaProductList;
