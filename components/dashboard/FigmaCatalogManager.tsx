import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon, ChevronDown, ChevronLeft, ChevronRight, MoreVertical, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Category, SubCategory, ChildCategory, Brand, Tag } from '../../types';
import { convertFileToWebP } from '../../services/imageUtils';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';

// Icons matching Figma design
const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#7B7B7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="#7B7B7B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CategoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H10V10H4V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 4H20V10H14V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 14H10V20H4V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 14H20V20H14V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SubCategoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M3 18H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19 10L21 12L19 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChildCategoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 5H10V10H4V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 5H20V10H14V5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 14H10V19H4V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 14H20V19H14V14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BrandIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2 12V2H12L20.59 10.59C20.9625 10.9647 21.1716 11.4716 21.1716 12C21.1716 12.5284 20.9625 13.0353 20.59 13.41Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 7H7.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


// Sortable table row wrapper for DnD reordering
function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    position: 'relative',
    backgroundColor: isDragging ? '#f0f9ff' : undefined,
  };
  return (
    <tr ref={setNodeRef} style={style} className={`h-[68px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isDragging ? 'shadow-lg' : ''}`}>
      <td className="px-2 py-3 w-[40px]">
        <button className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
      </td>
      {children}
    </tr>
  );
}

interface FigmaCatalogManagerProps {
  view: string;
  onNavigate?: (view: string) => void;
  categories: Category[];
  subCategories: SubCategory[];
  childCategories: ChildCategory[];
  brands: Brand[];
  tags: Tag[];
  products?: any[]; // For calculating actual product counts
  onAddCategory: (item: Category) => void;
  onUpdateCategory: (item: Category) => void;
  onDeleteCategory: (id: string) => void;
  onAddSubCategory: (item: SubCategory) => void;
  onUpdateSubCategory: (item: SubCategory) => void;
  onDeleteSubCategory: (id: string) => void;
  onAddChildCategory: (item: ChildCategory) => void;
  onUpdateChildCategory: (item: ChildCategory) => void;
  onDeleteChildCategory: (id: string) => void;
  onAddBrand: (item: Brand) => void;
  onUpdateBrand: (item: Brand) => void;
  onDeleteBrand: (id: string) => void;
  onAddTag: (item: Tag) => void;
  onUpdateTag: (item: Tag) => void;
  onDeleteTag: (id: string) => void;
  onReorderCategories?: (items: Category[]) => void;
  onReorderSubCategories?: (items: SubCategory[]) => void;
  onReorderChildCategories?: (items: ChildCategory[]) => void;
  onReorderBrands?: (items: Brand[]) => void;
  onReorderTags?: (items: Tag[]) => void;
}

const FigmaCatalogManager: React.FC<FigmaCatalogManagerProps> = ({
  view, onNavigate,
  categories, subCategories, childCategories, brands, tags,
  products = [],
  onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddSubCategory, onUpdateSubCategory, onDeleteSubCategory,
  onAddChildCategory, onUpdateChildCategory, onDeleteChildCategory,
  onAddBrand, onUpdateBrand, onDeleteBrand,
  onAddTag, onUpdateTag, onDeleteTag,
  onReorderCategories, onReorderSubCategories, onReorderChildCategories,
  onReorderBrands, onReorderTags
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPerPageDropdown, setShowPerPageDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localOrder, setLocalOrder] = useState<any[]>([]);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Tab configuration
  const catalogTabs = [
    { id: 'catalog_categories', label: 'Category', icon: <CategoryIcon />, count: categories.length },
    { id: 'catalog_subcategories', label: 'Sub Category', icon: <SubCategoryIcon /> },
    { id: 'catalog_childcategories', label: 'Child Category', icon: <ChildCategoryIcon /> },
    { id: 'catalog_brands', label: 'Brand', icon: <BrandIcon /> },
    { id: 'catalog_tags', label: 'Tags', icon: <TagIcon /> },
  ];

  // Calculate product counts for catalog items
  const enrichWithProductCount = (items: any[], type: 'category' | 'brand' | 'tag' | 'subCategory' | 'childCategory') => {
    return items.map(item => {
      let count = 0;
      if (type === 'category') {
        count = products.filter(p => p.category === item.name).length;
      } else if (type === 'brand') {
        count = products.filter(p => p.brand === item.name).length;
      } else if (type === 'tag') {
        count = products.filter(p => Array.isArray(p.tags) && p.tags.includes(item.name)).length;
      } else if (type === 'subCategory') {
        count = products.filter(p => p.subCategory === item.name).length;
      } else if (type === 'childCategory') {
        count = products.filter(p => p.childCategory === item.name).length;
      }
      return { ...item, productCount: count };
    });
  };

  // Get current tab data with product counts
  const getCurrentData = (): any[] => {
    switch (view) {
      case 'catalog_categories': return enrichWithProductCount(categories, 'category');
      case 'catalog_subcategories': return enrichWithProductCount(subCategories, 'subCategory');
      case 'catalog_childcategories': return enrichWithProductCount(childCategories, 'childCategory');
      case 'catalog_brands': return enrichWithProductCount(brands, 'brand');
      case 'catalog_tags': return enrichWithProductCount(tags, 'tag');
      default: return enrichWithProductCount(categories, 'category');
    }
  };

  // Sync local order when source data or view changes
  useEffect(() => {
    const data = getCurrentData();
    const sorted = [...data].sort((a: any, b: any) => (a.serial ?? Infinity) - (b.serial ?? Infinity));
    setLocalOrder(sorted);
    setHasOrderChanges(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, categories, subCategories, childCategories, brands, tags, products]);

  const getTitle = () => {
    switch (view) {
      case 'catalog_categories': return 'Category';
      case 'catalog_subcategories': return 'Sub Category';
      case 'catalog_childcategories': return 'Child Category';
      case 'catalog_brands': return 'Brand';
      case 'catalog_tags': return 'Tag';
      default: return 'Category';
    }
  };

  // Filter data - uses localOrder for DnD reorder support
  const filteredData = useMemo(() => {
    let data = [...localOrder];
    
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      data = data.filter((item: any) => item.name?.toLowerCase().includes(query));
    }

    if (statusFilter !== 'all') {
      data = data.filter((item: any) => item.status === statusFilter);
    }

    return data;
  }, [localOrder, searchTerm, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [view, searchTerm, statusFilter]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setOpenActionMenu(null);
        setActionMenuPosition(null);
        setShowStatusDropdown(false);
        setShowPerPageDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // DnD handlers
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalOrder((items) => {
      const oldIndex = items.findIndex((item: any) => item.id === active.id);
      const newIndex = items.findIndex((item: any) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      return arrayMove(items, oldIndex, newIndex);
    });
    setHasOrderChanges(true);
  }, []);

  const handleSaveOrder = useCallback(() => {
    setIsSavingOrder(true);
    // Strip productCount and assign serial values
    const withSerial = localOrder.map((item: any, idx: number) => {
      const { productCount, ...rest } = item;
      return { ...rest, serial: idx + 1 };
    });

    switch (view) {
      case 'catalog_categories': onReorderCategories?.(withSerial); break;
      case 'catalog_subcategories': onReorderSubCategories?.(withSerial); break;
      case 'catalog_childcategories': onReorderChildCategories?.(withSerial); break;
      case 'catalog_brands': onReorderBrands?.(withSerial); break;
      case 'catalog_tags': onReorderTags?.(withSerial); break;
    }

    setHasOrderChanges(false);
    setIsSavingOrder(false);
  }, [localOrder, view, onReorderCategories, onReorderSubCategories, onReorderChildCategories, onReorderBrands, onReorderTags]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map(item => item.id));
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Modal handlers
  const handleOpenModal = (item?: any) => {
    setEditItem(item || null);
    if (item) {
      setFormData({ ...item });
    } else {
      const defaults: any = { name: '', status: 'Active', Serial: 0, durationDays: 0 };
      if (view === 'catalog_categories') defaults.icon = '';
      if (view === 'catalog_subcategories') defaults.categoryId = categories[0]?.id || '';
      if (view === 'catalog_childcategories') defaults.subCategoryId = subCategories[0]?.id || '';
      if (view === 'catalog_brands') defaults.logo = '';
      setFormData(defaults);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editItem ? editItem.id : Date.now().toString();
    const newItem = { ...formData, id };

    switch (view) {
      case 'catalog_categories': editItem ? onUpdateCategory(newItem) : onAddCategory(newItem); break;
      case 'catalog_subcategories': editItem ? onUpdateSubCategory(newItem) : onAddSubCategory(newItem); break;
      case 'catalog_childcategories': editItem ? onUpdateChildCategory(newItem) : onAddChildCategory(newItem); break;
      case 'catalog_brands': editItem ? onUpdateBrand(newItem) : onAddBrand(newItem); break;
      case 'catalog_tags': editItem ? onUpdateTag(newItem) : onAddTag(newItem); break;
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    switch (view) {
      case 'catalog_categories': onDeleteCategory(id); break;
      case 'catalog_subcategories': onDeleteSubCategory(id); break;
      case 'catalog_childcategories': onDeleteChildCategory(id); break;
      case 'catalog_brands': onDeleteBrand(id); break;
      case 'catalog_tags': onDeleteTag(id); break;
    }
    setOpenActionMenu(null);
    setActionMenuPosition(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const converted = await convertFileToWebP(file, { quality: 0.8, maxDimension: 600 });
      const fieldName = view === 'catalog_brands' ? 'logo' : 'icon';
      setFormData({ ...formData, [fieldName]: converted });
    } catch (error) {
      console.error('Failed to process image', error);
      alert('Unable to process this image.');
    }
    e.target.value = '';
  };

  // Generate pagination numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const showImageColumn = view === 'catalog_categories' || view === 'catalog_brands';

  return (
    <div className="bg-white dark:bg-gray-800 min-h-screen font-['Poppins']">
      {/* Main Content Container */}
      <div className="bg-white dark:bg-gray-800 mx-4 md:mx-2 sm:mx-4 lg:mx-6 my-5 py-5">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-5">
          <h1 className="text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-[22px] font-bold text-[#023337] dark:text-white tracking-[0.11px] font-['Lato']">
            Catalog
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 lg:gap-3 sm:gap-4 lg:gap-6">
            {/* Search Bar */}
            <div className="bg-[#f9f9f9] dark:bg-gray-700 h-[34px] rounded-lg flex items-center px-2 w-[292px]">
              <SearchIcon />
              <input
                type="text"
                placeholder={`Search ${getTitle()}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-[12px] text-[#7b7b7b] dark:text-gray-400 ml-2 flex-1 outline-none placeholder:text-[#7b7b7b] dark:placeholder-gray-400"
              />
              <button className="text-[12px] text-black dark:text-white font-medium px-2">
                Search
              </button>
            </div>

            {/* Status Filter */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                className="bg-[#f9f9f9] dark:bg-gray-700 rounded-lg flex items-center gap-2 px-3 py-2"
              >
                <span className="text-[12px] text-black dark:text-white">
                  {statusFilter === 'all' ? 'All Status' : statusFilter}
                </span>
                <ChevronDown size={14} className="text-gray-600 dark:text-gray-400" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-600 z-50 py-1 w-[120px]">
                  <button
                    onClick={() => { setStatusFilter('all'); setShowStatusDropdown(false); }}
                    className="w-full px-3 py-2 text-left text-[12px] text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => { setStatusFilter('Active'); setShowStatusDropdown(false); }}
                    className="w-full px-3 py-2 text-left text-[12px] text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Publish
                  </button>
                  <button
                    onClick={() => { setStatusFilter('Inactive'); setShowStatusDropdown(false); }}
                    className="w-full px-3 py-2 text-left text-[12px] text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Inactive
                  </button>
                </div>
              )}
            </div>

            {/* Items Per Page */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setShowPerPageDropdown(!showPerPageDropdown)}
                className="bg-[#f9f9f9] dark:bg-gray-700 rounded-lg flex items-center gap-2 px-3 py-2 w-[119px]"
              >
                <span className="text-[12px] text-black dark:text-white">{itemsPerPage >= 999 ? 'All' : `${itemsPerPage} ${getTitle()}`}</span>
                <ChevronDown size={14} className="text-gray-600 dark:text-gray-400" />
              </button>
              {showPerPageDropdown && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-600 z-50 py-1 w-full">
                  {[5, 10, 15, 20, 50].map(num => (
                    <button
                      key={num}
                      onClick={() => { setItemsPerPage(num); setShowPerPageDropdown(false); setCurrentPage(1); }}
                      className="w-full px-3 py-2 text-left text-[12px] text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      {num} {getTitle()}
                    </button>
                  ))}
                  <button
                    onClick={() => { setItemsPerPage(9999); setShowPerPageDropdown(false); setCurrentPage(1); }}
                    className="w-full px-3 py-2 text-left text-[12px] text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    All
                  </button>
                </div>
              )}
            </div>

            {/* Save Order Button */}
            {hasOrderChanges && (
              <button
                onClick={handleSaveOrder}
                disabled={isSavingOrder}
                className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] h-[48px] rounded-lg flex items-center gap-2 px-5 text-white font-bold text-[15px] font-['Lato'] shadow-md hover:opacity-90 disabled:opacity-50 transition-all animate-pulse"
              >
                {isSavingOrder ? 'Saving...' : 'Save Order'}
              </button>
            )}

            {/* Add Button */}
            <button
              onClick={() => handleOpenModal()}
              className="bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] h-[48px] rounded-lg flex items-center gap-1 px-4 min-w-[142px]"
            >
              <AddSquareIcon />
              <span className="text-[15px] font-bold text-white tracking-[-0.3px] font-['Lato']">
                Add {getTitle()}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-0 border-b border-gray-200 dark:border-gray-600 mb-5 overflow-x-auto">
          {catalogTabs.map((tab) => {
            const isActive = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { onNavigate?.(tab.id); setCurrentPage(1); }}
                className={`flex items-center gap-1 px-[22px] py-3 h-[48px] whitespace-nowrap transition-colors ${
                  isActive 
                    ? 'border-b-2 border-[#38bdf8]' 
                    : ''
                }`}
              >
                <span className={isActive ? 'text-[#38bdf8]' : 'text-black dark:text-white'}>{tab.icon}</span>
                <span 
                  className={`text-[16px] font-medium ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] bg-clip-text text-transparent' 
                      : 'text-black dark:text-white'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && isActive && `(${tab.count})`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Data Table - Hide on mobile */}
        <div className="bg-white dark:bg-gray-800 overflow-visible">
          <div className="hidden sm:block overflow-x-auto overflow-y-visible">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paginatedData.map((item: any) => item.id)} strategy={verticalListSortingStrategy}>
            <table className="w-full min-w-[700px] text-sm">
              {/* Table Header - Gradient Background */}
              <thead className="bg-[#E0F2FE] dark:bg-gray-700">
                <tr>
                  <th className="px-2 py-3 w-[40px]"></th>
                  <th className="px-4 py-3 text-left w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedData.length && paginatedData.length > 0}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-[1.5px] border-[#050605] dark:border-gray-500 bg-white dark:bg-gray-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-black dark:text-white text-[16px]">SL</th>
                  {showImageColumn && (
                    <th className="px-4 py-3 text-left font-medium text-black dark:text-white text-[16px]">Image/icon</th>
                  )}
                  <th className="px-4 py-3 text-left font-medium text-black dark:text-white text-[16px]">Name</th>
                  {view === 'catalog_subcategories' && (
                    <th className="px-4 py-3 text-left font-medium text-black dark:text-white text-[16px]">Parent Category</th>
                  )}
                  {view === 'catalog_childcategories' && (
                    <th className="px-4 py-3 text-left font-medium text-black dark:text-white text-[16px]">Parent Sub Category</th>
                  )}
                  <th className="px-4 py-3 text-center font-medium text-black dark:text-white text-[16px]">Products</th>
                  <th className="px-4 py-3 text-center font-medium text-black dark:text-white text-[16px]">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-black dark:text-white text-[16px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#b9b9b9]/50 dark:divide-gray-600">
                {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                  <SortableRow key={item.id} id={item.id}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-5 h-5 rounded border-[1.5px] border-[#eaf8e7] dark:border-gray-500 bg-white dark:bg-gray-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200 text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    {showImageColumn && (
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-r from-[#38bdf8] to-[#1e90ff]">
                          {(item.icon || item.logo) ? (
                            <img
                              src={normalizeImageUrl(item.icon || item.logo)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200">
                      {item.name}
                    </td>
                    {view === 'catalog_subcategories' && (
                      <td className="px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200">
                        {categories.find(c => c.id === item.categoryId)?.name || '-'}
                      </td>
                    )}
                    {view === 'catalog_childcategories' && (
                      <td className="px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200">
                        {subCategories.find(s => s.id === item.subCategoryId)?.name || '-'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-[12px] text-[#1d1a1a] dark:text-gray-200 text-center">
                      {item.productCount || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-[9px] py-0.5 rounded-[30px] text-[12px] font-medium ${
                        item.status === 'Active' 
                          ? 'bg-[#c1ffbc] text-[#085e00]' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {item.status === 'Active' ? 'Publish' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div data-dropdown>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (openActionMenu === item.id) {
                              setOpenActionMenu(null);
                              setActionMenuPosition(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setActionMenuPosition({
                                top: rect.bottom + 4,
                                left: rect.right - 160 // dropdown width is 160px
                              });
                              setOpenActionMenu(item.id);
                            }
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors inline-flex"
                        >
                          <DotsIcon />
                        </button>
                      </div>
                    </td>
                  </SortableRow>
                )) : (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mb-3">
                          <Search size={24} className="text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="font-medium">No {getTitle().toLowerCase()}s found</p>
                        <p className="text-sm">Try adjusting your search or add a new {getTitle().toLowerCase()}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </SortableContext>
            </DndContext>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-2">
            {paginatedData.length > 0 ? paginatedData.map((item, index) => (
              <div key={item.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {showImageColumn && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] flex-shrink-0">
                      {(item.icon || item.logo) ? (
                        <img
                          src={normalizeImageUrl(item.icon || item.logo)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {view === 'catalog_subcategories' && categories.find(c => c.id === item.categoryId)?.name}
                      {view === 'catalog_childcategories' && subCategories.find(s => s.id === item.subCategoryId)?.name}
                      {(view === 'catalog_categories' || view === 'catalog_brands' || view === 'catalog_tags') && `${item.productCount || 0} products`}
                    </p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      item.status === 'Active' 
                        ? 'bg-[#c1ffbc] text-[#085e00]' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {item.status === 'Active' ? 'Publish' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="relative" data-dropdown>
                  <button
                    onClick={() => setMobileMenuOpen(mobileMenuOpen === item.id ? null : item.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                  {mobileMenuOpen === item.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 min-w-[120px]">
                      <button
                        onClick={() => { handleOpenModal(item); setMobileMenuOpen(null); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Edit size={16} className="text-blue-500" /> Edit
                      </button>
                      <button
                        onClick={() => { handleDelete(item.id); setMobileMenuOpen(null); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mx-auto mb-3">
                  <Search size={24} className="text-gray-400 dark:text-gray-500" />
                </div>
                <p className="font-medium">No {getTitle().toLowerCase()}s found</p>
                <p className="text-sm">Try adjusting your search or add a new {getTitle().toLowerCase()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-center gap-[279px] mt-6">
            {/* Previous */}
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="bg-white dark:bg-gray-800 h-[42px] rounded-lg flex items-center gap-1 px-3 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.5)] disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeftIcon />
              <span className="text-[15px] font-medium text-black dark:text-white font-['Lato']">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-3">
              {getPageNumbers().map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  disabled={page === '...'}
                  className={`w-[36px] h-[36px] flex items-center justify-center rounded text-[15px] font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-[#dff5ff] dark:bg-gray-600 text-[#1e90ff] font-bold'
                      : page === '...'
                      ? 'cursor-default text-[#023337] dark:text-white font-bold'
                      : 'border border-[#d1d5db] dark:border-gray-600 text-[#023337] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page === '...' ? '.....' : page}
                </button>
              ))}
            </div>

            {/* Next */}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="bg-white dark:bg-gray-800 h-[42px] rounded-lg flex items-center gap-1 px-3 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] dark:shadow-[0px_1px_3px_0px_rgba(0,0,0,0.5)] disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span className="text-[15px] font-medium text-black dark:text-white font-['Lato']">Next</span>
              <div className="rotate-180">
                <ArrowLeftIcon />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Fixed Action Dropdown (Portal) */}
      {openActionMenu && actionMenuPosition && (() => {
        const activeItem = getCurrentData().find(item => item.id === openActionMenu);
        if (!activeItem) return null;
        return (
          <div 
            data-dropdown
            className="fixed z-[9999] w-[160px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-600 py-2"
            style={{ 
              top: actionMenuPosition.top, 
              left: actionMenuPosition.left,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)' 
            }}
          >
            <button
              onClick={() => { handleOpenModal(activeItem); setOpenActionMenu(null); setActionMenuPosition(null); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Edit size={16} className="text-blue-500" /> Edit
            </button>
            <button
              onClick={() => { handleDelete(activeItem.id); setActionMenuPosition(null); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm font-medium text-red-600 transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        );
      })()}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md p-3 sm:p-4 lg:p-4 xl:p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editItem ? 'Edit' : 'Add'} {getTitle()}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-900 dark:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                  placeholder={`Enter ${getTitle().toLowerCase()} name`}
                />
              </div>

              {/* Parent Category for Sub Category */}
              {view === 'catalog_subcategories' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Category *</label>
                  <select
                    required
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value, categoryName: categories.find(c => c.id === e.target.value)?.name })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Parent Sub Category for Child Category */}
              {view === 'catalog_childcategories' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Sub Category *</label>
                  <select
                    required
                    value={formData.subCategoryId || ''}
                    onChange={(e) => setFormData({ ...formData, subCategoryId: e.target.value, subCategoryName: subCategories.find(s => s.id === e.target.value)?.name })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Sub Category</option>
                    {subCategories.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Image Upload for Category and Brand */}
              {showImageColumn && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {view === 'catalog_brands' ? 'Logo' : 'Icon'}
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700">
                      {(formData.icon || formData.logo) ? (
                        <img 
                          src={formData.icon || formData.logo} 
                          alt="preview" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <ImageIcon size={24} className="text-gray-400 dark:text-gray-500" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 text-sm"
                    >
                      Upload Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Priority / Duration */}
              {view === 'catalog_tags' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (Days)</label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">How many days this tag stays active. 0 = permanent.</p>
                  <input
                    type="number"
                    min="0"
                    value={formData.durationDays || 0}
                    onChange={(e) => {
                      const days = parseInt(e.target.value) || 0;
                      const updates: any = { ...formData, durationDays: days };
                      if (days > 0) {
                        const expiry = new Date();
                        expiry.setDate(expiry.getDate() + days);
                        updates.expiresAt = expiry.toISOString();
                      } else {
                        updates.expiresAt = undefined;
                      }
                      setFormData(updates);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  {formData.durationDays > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Expires: {new Date(Date.now() + (formData.durationDays || 0) * 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serial</label>
                  <input
                    type="number"
                    value={formData.priority || 0}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status || 'Active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="Active">Publish</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] text-white rounded-lg hover:opacity-90"
                >
                  {editItem ? 'Update' : 'Create'} {getTitle()}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FigmaCatalogManager;
