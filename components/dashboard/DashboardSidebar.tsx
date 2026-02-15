import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Palette,
  FileText,
  Bell,
  CreditCard,
  Truck,
  Image,
  Target,
  Boxes,
  ClipboardList,
  Globe,
  Shield,
  Activity,
  GraduationCap
} from 'lucide-react';
import { PermissionMap } from './types';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string | number;
  hasDropdown?: boolean;
  children?: SidebarItem[];
  resource?: string; // Resource name for permission checking
}

interface DashboardSidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
  onLogoutClick?: () => void;
  className?: string;
  userRole?: string;
  permissions?: PermissionMap;
}

// Map menu item IDs to permission resources
const itemResourceMap: Record<string, string> = {
  'orders': 'orders',
  'products': 'products',
  'catalog': 'catalog',
  'catalog_categories': 'catalog',
  'catalog_subcategories': 'catalog',
  'catalog_childcategories': 'catalog',
  'catalog_brands': 'catalog',
  'catalog_tags': 'catalog',
  'inventory': 'inventory',
  'customers_reviews': 'customers',
  'customization': 'customization',
  'website_content': 'customization',
  'website_content_carousel': 'customization',
  'website_content_banners': 'customization',
  'website_content_popups': 'landing_pages',
  'website_content_landing_page': 'landing_pages',
  'gallery': 'gallery',
  'business_report': 'business_report',
  'settings': 'settings',
  'admin_control': 'admin_control',
  'activity_log': 'activity_log',
  'billing': 'billing',
};

const menuItems: SidebarItem[] = [
  // Main Menu
  { id: 'dashboard', label: 'Dashboard', icon: <img src="https://hdnfltv.com/image/nitimages/dashboard-square-01.webp" alt="Dashboard" className="w-5 h-5 object-contain" /> },
  { id: 'orders', label: 'Orders', icon: <img src="https://hdnfltv.com/image/nitimages/invoice.webp" alt="Orders" className="w-5 h-5 object-contain" /> },
  { id: 'products', label: 'Products', icon: <img src="https://hdnfltv.com/image/nitimages/icon-park_ad-product.webp" alt="Products" className="w-5 h-5 object-contain" /> },
  { 
    id: 'catalog', 
    label: 'Catalog', 
    icon: <img src="https://hdnfltv.com/image/nitimages/hugeicons_catalogue.webp" alt="Catalog" className="w-5 h-5 object-contain" />, 
    hasDropdown: true,
    children: [
      { id: 'catalog_categories', label: 'Category', icon: <ChevronRight className="w-4 h-4" /> },
      { id: 'catalog_subcategories', label: 'Sub Category', icon: <ChevronRight className="w-4 h-4" /> },
      { id: 'catalog_childcategories', label: 'Child Category', icon: <ChevronRight className="w-4 h-4" /> },
      { id: 'catalog_brands', label: 'Brands', icon: <ChevronRight className="w-4 h-4" /> },
      { id: 'catalog_tags', label: 'Tags', icon: <ChevronRight className="w-4 h-4" /> },
    ]
  },
  { id: 'inventory', label: 'Inventory', icon: <img src="https://hdnfltv.com/image/nitimages/note.webp" alt="Inventory" className="w-5 h-5 object-contain" /> },
  { id: 'customers_reviews', label: 'Customers & review', icon: <img src="https://hdnfltv.com/image/nitimages/user-group.webp" alt="Customers & review" className="w-5 h-5 object-contain" /> },
  
  // Configuration
  { id: 'customization', label: 'Customization', icon: <img src="https://hdnfltv.com/image/nitimages/arcticons_galaxy-themes.webp" alt="Customization" className="w-5 h-5 object-contain" /> },
  { 
    id: 'website_content', 
    label: 'Website Content', 
    icon: <img src="https://hdnfltv.com/image/nitimages/fluent_content-view-gallery-28-regular.webp" alt="Website Content" className="w-5 h-5 object-contain" />, 
    hasDropdown: true,
    children: [
      { id: 'website_content_carousel', label: 'Carousal', icon: <ChevronRight className="w-4 h-4" /> },
      { id: 'website_content_banners', label: 'Banners', icon: <ChevronRight className="w-4 h-4" /> },
      { id: 'website_content_popups', label: 'Popups', icon: <ChevronRight className="w-4 h-4" /> },
      { id: 'website_content_landing_page', label: 'Landing Page', icon: <ChevronRight className="w-4 h-4" /> },
    ]
  },
  { id: 'gallery', label: 'Gallery', icon: <img src="https://hdnfltv.com/image/nitimages/solar_gallery-linear.webp" alt="Gallery" className="w-5 h-5 object-contain" /> },
  { id: 'business_report', label: 'Business Report', icon: <img src="https://hdnfltv.com/image/nitimages/icon-park_table-report.webp" alt="Business Report" className="w-5 h-5 object-contain" /> },
  
  // System
  { id: 'settings', label: 'Settings', icon: <img src="https://hdnfltv.com/image/nitimages/ci_settings.webp" alt="Settings" className="w-5 h-5 object-contain" /> },
  { id: 'admin_control', label: 'Admin Control', icon:<img src="https://hdnfltv.com/image/nitimages/hugeicons_microsoft-admin.webp" alt="Admin Control" className="w-5 h-5 object-contain" /> },
  { id: 'activity_log', label: 'Activity Log', icon: <img src="https://hdnfltv.com/image/nitimages/transaction-history.webp" alt="Activity Log" className="w-5 h-5 object-contain" /> },
  { id: 'billing', label: 'Billing & Subscription', icon: <img src="https://hdnfltv.com/image/nitimages/solar_card-linear.webp" alt="Billing & Subscription" className="w-5 h-5 object-contain" /> },
  { id: 'support', label: 'Support', icon: <img src="https://hdnfltv.com/image/nitimages/pasted_1770763342068.webp" alt="Support" className="w-5 h-5 object-contain" /> },
  { id: 'tutorial', label: 'Tutorial', icon: <img src="https://hdnfltv.com/image/nitimages/pasted_1770763376612.webp" alt="Tutorial" className="w-5 h-5 object-contain" /> },
];

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeItem = 'dashboard',
  onNavigate,
  onLogoutClick,
  className = '',
  userRole,
  permissions
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Check if user can access a menu item
  const canAccess = (itemId: string): boolean => {
    // Dashboard, support, tutorial are always accessible
    if (['dashboard', 'support', 'tutorial'].includes(itemId)) return true;

    // If no role specified, show all items (assume admin access)
    // Real security is enforced on backend
    if (!userRole) return true;

    // Super admin can access everything
    if (userRole === 'super_admin') return true;

    // Admin can access everything (they manage their own site)
    if (userRole === 'admin') return true;

    // Tenant admin can access everything for their tenant
    if (userRole === 'tenant_admin') return true;

    // Staff - check permissions
    if (userRole === 'staff') {
      const resource = itemResourceMap[itemId];
      if (!resource) return true; // If no resource mapping, allow access
      
      if (permissions && permissions[resource]) {
        return permissions[resource].includes('read');
      }
      return false;
    }

    // For any other role (e.g., customer shouldn't be in admin), hide restricted items
    return false;
  };

  // Filter menu items based on permissions
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => {
      // Check if user can access this item
      if (!canAccess(item.id)) return false;

      // For items with children, filter children and only show if at least one child is accessible
      if (item.children && item.children.length > 0) {
        const accessibleChildren = item.children.filter(child => canAccess(child.id));
        if (accessibleChildren.length === 0) return false;
        // Return new item with filtered children (don't mutate original)
        return true;
      }

      return true;
    }).map(item => {
      // Return items with filtered children
      if (item.children && item.children.length > 0) {
        return {
          ...item,
          children: item.children.filter(child => canAccess(child.id))
        };
      }
      return item;
    });
  }, [userRole, permissions]);

  // Define menu categories by item IDs
  const mainMenuIds = ['dashboard', 'orders', 'products', 'catalog', 'inventory', 'customers_reviews'];
  const configIds = ['customization', 'website_content', 'gallery', 'business_report'];
  const systemIds = ['settings', 'admin_control', 'activity_log', 'billing', 'support', 'tutorial'];

  // Group filtered items by category
  const mainMenuItems = filteredMenuItems.filter(item => mainMenuIds.includes(item.id));
  const configMenuItems = filteredMenuItems.filter(item => configIds.includes(item.id));
  const systemMenuItems = filteredMenuItems.filter(item => systemIds.includes(item.id));

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (itemId: string, hasDropdown?: boolean, children?: SidebarItem[]) => {
    // If item has dropdown with children, toggle expansion
    if (hasDropdown && children && children.length > 0) {
      toggleExpanded(itemId);
      return;
    }
    
    onNavigate?.(itemId);
  };

  const renderMenuItem = (item: SidebarItem) => {
    // For catalog, check if activeItem starts with 'catalog_'
    // For website_content, check if activeItem starts with 'website_content_'
    const isActive = item.id === 'catalog' 
      ? activeItem.startsWith('catalog_') 
      : item.id === 'website_content'
        ? activeItem.startsWith('website_content_')
        : activeItem === item.id;
    
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    
    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item.id, item.hasDropdown, item.children)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group font-['Poppins'] ${
            isActive 
              ? 'bg-gradient-to-r from-sky-400 to-blue-500 text-white shadow-md' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <span className={isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}>
            {item.icon}
          </span>
          <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
          {item.badge && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              isActive ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
            }`}>
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              } ${isActive ? 'text-white' : 'text-gray-400'}`} 
            />
          )}
        </button>
        
        {/* Dropdown children */}
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 dark:border-gray-700">
            {item.children!.map(child => {
              const isChildActive = activeItem === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => onNavigate?.(child.id)}
                  className={`w-full flex items-center gap-2 pl-4 pr-4 py-2 rounded-r-lg transition-all duration-200 font-['Poppins'] ${
                    isChildActive 
                      ? 'text-sky-500 bg-sky-50 dark:bg-sky-900/20 font-medium' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className={isChildActive ? 'text-sky-500' : 'text-gray-400'}>
                    {child.icon}
                  </span>
                  <span className="text-sm">{child.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className={`space-y-1 ${className}`}>
      {/* Main Menu Section */}
      {mainMenuItems.length > 0 && (
        <div className="mb-6">
          <p className="px-4 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-['Poppins']">
            Main Menu
          </p>
          <div className="space-y-1">
            {mainMenuItems.map(renderMenuItem)}
          </div>
        </div>
      )}

      {/* Configuration Section */}
      {configMenuItems.length > 0 && (
        <div className="mb-6">
          <p className="px-4 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-['Poppins']">
            Configuration
          </p>
          <div className="space-y-1">
            {configMenuItems.map(renderMenuItem)}
          </div>
        </div>
      )}

      {/* System Section */}
      {systemMenuItems.length > 0 && (
        <div className="mb-6">
          <p className="px-4 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-['Poppins']">
            System
          </p>
          <div className="space-y-1">
            {systemMenuItems.map(renderMenuItem)}
          </div>
        </div>
      )}

      {/* Logout */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => onLogoutClick?.()}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-['Poppins']"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default DashboardSidebar;
