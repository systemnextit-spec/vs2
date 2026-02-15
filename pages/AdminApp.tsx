// admin/pages/AdminApp.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Suspense, lazy } from 'react';
import { 
  Product, Order, User, ThemeConfig, WebsiteConfig, Role, Category, SubCategory, 
  ChildCategory, Brand, Tag, DeliveryConfig, PaymentMethod, CourierConfig, Tenant, 
  CreateTenantPayload, FacebookPixelConfig, ChatMessage 
} from '../types';
import { DataService } from '../services/DataService';
import * as authService from '../services/authService';
import { getAuthHeader } from '../services/authService';
import { toast } from 'react-hot-toast';
import {
  DashboardSkeleton,
  OrdersSkeleton,
  ProductsSkeleton,
  InventorySkeleton,
  CustomersSkeleton,
  ActivityLogSkeleton,
  PageSkeleton,
} from '../components/SkeletonLoaders';
import { LanguageProvider } from '../context/LanguageContext';
import { useNotifications } from '../hooks/useNotifications';
import { useTenant } from '../hooks/useTenant';

// Lazy loaded admin pages with webpackChunkName for better caching
// const AdminDashboard = lazy(() => import(/* webpackChunkName: "admin-dashboard" */ './ModernDashboard'));
const FigmaOrderList = lazy(() => import(/* webpackChunkName: "figma-order-list" */ '../components/dashboard/FigmaOrderList'));
const FigmaProductList = lazy(() => import(/* webpackChunkName: "figma-product-list" */ '../components/dashboard/FigmaProductList'));
const FigmaProductUpload = lazy(() => import(/* webpackChunkName: "figma-product-upload" */ '../components/dashboard/FigmaProductUpload'));
const AdminCustomization = lazy(() => import(/* webpackChunkName: "admin-customization" */ './AdminCustomization'));
const AdminWebsiteContent = lazy(() => import(/* webpackChunkName: "admin-website-content" */ './AdminWebsiteContent'));
const AdminSettings = lazy(() => import(/* webpackChunkName: "admin-settings" */ './AdminSettingsNew'));
const AdminManageShop = lazy(() => import(/* webpackChunkName: "admin-manage-shop" */ './AdminManageShop'));
const AdminControlNew = lazy(() => import(/* webpackChunkName: "admin-control-new" */ './AdminControlNew'));
const FigmaCatalogManager = lazy(() => import(/* webpackChunkName: "figma-catalog" */ '../components/dashboard/FigmaCatalogManager'));
const FigmaInventory = lazy(() => import(/* webpackChunkName: "figma-inventory" */ '../components/dashboard/FigmaInventory'));
const FigmaBusinessReport = lazy(() => import(/* webpackChunkName: "figma-business-report" */ '../components/dashboard/FigmaBusinessReport'));
const AdminDeliverySettings = lazy(() => import(/* webpackChunkName: "admin-delivery" */ './AdminDeliverySettings'));
const AdminPaymentSettings = lazy(() => import(/* webpackChunkName: "admin-payment" */ './AdminPaymentSettingsNew'));
const AdminCourierSettings = lazy(() => import(/* webpackChunkName: "admin-courier" */ './AdminCourierSettings'));

const AdminCustomers = lazy(() => import(/* webpackChunkName: "admin-customers" */ './AdminCustomersReview'));
const AdminDailyTarget = lazy(() => import(/* webpackChunkName: "admin-target" */ './AdminDailyTarget'));
const AdminGallery = lazy(() => import(/* webpackChunkName: "admin-gallery" */ './AdminGallery'));
const AdminPopups = lazy(() => import(/* webpackChunkName: "admin-popups" */ './AdminPopups'));
const AdminFacebookPixel = lazy(() => import(/* webpackChunkName: "admin-pixel" */ './AdminFacebookPixel'));
const AdminGTM = lazy(() => import(/* webpackChunkName: "admin-gtm" */ './AdminGTM'));
const AdminMarketingIntegrations = lazy(() => import(/* webpackChunkName: "admin-marketing" */ './AdminMarketingIntegrations'));
const AdminLandingPage = lazy(() => import(/* webpackChunkName: "admin-landing" */ './AdminLandingPage'));
const StoreStudioManager = lazy(() => import(/* webpackChunkName: "store-studio" */ '../components/StoreStudio'));

const AdminSupport = lazy(() => import(/* webpackChunkName: "admin-support" */ './AdminSupport'));
const AdminFigmaIntegration = lazy(() => import(/* webpackChunkName: "admin-figma" */ './AdminFigmaIntegration'));
const AdminBilling = lazy(() => import(/* webpackChunkName: "admin-billing" */ './AdminBilling'));
const AdminTutorial = lazy(() => import(/* webpackChunkName: "admin-tutorial" */ './AdminTutorial'));
const AdminSMSMarketing = lazy(() => import(/* webpackChunkName: "admin-sms-marketing" */ './AdminSMSMarketing'));
const AdminActivityLog = lazy(() => import(/* webpackChunkName: "admin-activity-log" */ './AdminActivityLog'));
const AdminProfile = lazy(() => import(/* webpackChunkName: "admin-profile" */ './AdminProfile'));
const AdminShopDomain = lazy(() => import(/* webpackChunkName: "admin-shop-domain" */ './AdminShopDomain'));
const AdminRewardPointSettings = lazy(() => import(/* webpackChunkName: "admin-reward-settings" */ './AdminRewardPointSettings'));
const AdminExpenses = lazy(() => import(/* webpackChunkName: "admin-expenses" */ './AdminExpenses'));
const AdminIncome = lazy(() => import(/* webpackChunkName: "admin-income" */ './AdminIncome'));
const AdminPurchase = lazy(() => import(/* webpackChunkName: "admin-purchase" */ './AdminPurchase'));
const AdminDueListPage = lazy(() => import(/* webpackChunkName: "admin-duelist" */ './AdminDueList'));
import AIChatAssistant from '../components/AIChatAssistant';
// Admin Components - directly imported for instant layout render

import AdminDueList from './AdminDueList';
import { FigmaDashboardPage as AdminDashboard, DashboardLayout } from '../components/dashboard';
import SubscriptionRenewalPopup from '../components/SubscriptionRenewalPopup';
import SubscriptionNotification from '../components/SubscriptionNotification';
import { useSubscription } from '../hooks/useSubscription';

// Preload critical admin chunks on idle - only when admin view is triggered
let adminChunksPreloaded = false;
export const preloadAdminChunks = () => {
  if (adminChunksPreloaded) return;
  adminChunksPreloaded = true;
// Preloading disabled to avoid long-pending chunk requests on initial load.
};

// Section-aware loading fallback for lazy-loaded sections
const PageLoadingFallback = ({ section }: { section?: string }) => {
  switch (section) {
    case 'dashboard':
      return <DashboardSkeleton />;
    case 'orders':
      return <OrdersSkeleton />;
    case 'products':
      return <ProductsSkeleton />;
    case 'inventory':
      return <InventorySkeleton />;
    case 'customers_reviews':
      return <CustomersSkeleton />;
    case 'activity_log':
      return <ActivityLogSkeleton />;
    default:
      return <PageSkeleton />;
  }
};

// Permission map type
type PermissionMap = Record<string, string[]>;

interface AdminAppProps {
  user: User | null;
  userPermissions?: PermissionMap;
  activeTenantId: string;
  tenants: Tenant[];
  orders: Order[];
  products: Product[];
  logo: string | null;
  themeConfig: ThemeConfig | null;
  websiteConfig?: WebsiteConfig;
  deliveryConfig: DeliveryConfig[];
  paymentMethods?: PaymentMethod[];
  courierConfig: CourierConfig;
  facebookPixelConfig: FacebookPixelConfig;
  chatMessages: ChatMessage[];
  onLogout: () => void;
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onBulkDeleteProducts: (ids: number[]) => void;
  onBulkUpdateProducts: (ids: number[], updates: Partial<Product>) => void;
  onBulkFlashSale: (ids: number[], action: 'add' | 'remove') => void;
  onUpdateLogo: (logo: string | null) => void;
  onUpdateTheme: (config: ThemeConfig) => Promise<void>;
  onUpdateWebsiteConfig: (config: WebsiteConfig) => Promise<void>;
  onUpdateDeliveryConfig: (configs: DeliveryConfig[]) => void;
  onUpdatePaymentMethods?: (methods: PaymentMethod[]) => void;
  onUpdateCourierConfig: (config: CourierConfig) => void;
  onUpdateProfile: (user: User) => void;
  onTenantChange: (tenantId: string) => void;
  isTenantSwitching: boolean;
  onSwitchToStore: () => void;
  onOpenAdminChat: () => void;
  hasUnreadChat: boolean;
  // Tenant management props
  onCreateTenant?: (payload: CreateTenantPayload, options?: { activate?: boolean }) => Promise<Tenant>;
  onDeleteTenant?: (tenantId: string) => Promise<void>;
  onRefreshTenants?: () => Promise<Tenant[]>;
  isTenantCreating?: boolean;
  deletingTenantId?: string | null;
  // Landing pages props
  landingPages: any[];
  onCreateLandingPage: (page: any) => void;
  onUpsertLandingPage: (page: any) => void;
  onToggleLandingPublish: (pageId: string, status: string) => void;
  // Order management
  onAddOrder?: (order: Order) => void;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  onSwitchView: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
  logo: string | null;
  user?: { name?: string; email?: string; avatar?: string; role?: string } | null;
  onLogout?: () => void;
  tenants?: Tenant[];
  activeTenantId?: string;
  activeTenantSubdomain?: string;
  onTenantChange?: (tenantId: string) => void;
  isTenantSwitching?: boolean;
  onOpenChatCenter?: () => void;
  hasUnreadChat?: boolean;
  userPermissions?: PermissionMap;
  onOrderNotificationClick?: (orderId: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  onSwitchView,
  activePage,
  onNavigate,
  logo,
  user,
  onLogout,
  tenants,
  activeTenantId,
  activeTenantSubdomain: propSubdomain,
  onTenantChange,
  isTenantSwitching,
  onOpenChatCenter,
  hasUnreadChat,
  userPermissions = {},
  onOrderNotificationClick
}) => {
  const highlightPage = activePage.startsWith('settings') ? 'settings' : activePage;
  const [resolvedSubdomain, setResolvedSubdomain] = useState<string>('');

  // Get subdomain from useTenant hook (hostTenantSlug is captured once from URL)
  const { hostTenantSlug, tenants: hookTenants, activeTenantId: hookTenantId } = useTenant();
  
  // Resolve subdomain from multiple sources
  useEffect(() => {
    const findSubdomain = () => {
      // Priority 1: URL subdomain (hostTenantSlug)
      if (hostTenantSlug) return hostTenantSlug;
      // Priority 2: Prop from parent
      if (propSubdomain) return propSubdomain;
      // Priority 3: Find from hook tenants
      const hookTenant = hookTenants.find(t => t.id === hookTenantId || t._id === hookTenantId);
      if (hookTenant?.subdomain) return hookTenant.subdomain;
      // Priority 4: Find from prop tenants
      const propTenant = tenants?.find(t => t.id === activeTenantId || t._id === activeTenantId);
      if (propTenant?.subdomain) return propTenant.subdomain;
      return '';
    };
    const resolved = findSubdomain();
    if (resolved) {
      setResolvedSubdomain(resolved);
    } else if (activeTenantId) {
      // Fallback: load tenants list and find subdomain
      DataService.listTenants().then(allTenants => {
        const tenant = allTenants.find(t => t.id === activeTenantId || t._id === activeTenantId);
        if (tenant?.subdomain) {
          setResolvedSubdomain(tenant.subdomain);
        }
      }).catch(() => {});
    }
  }, [hostTenantSlug, propSubdomain, hookTenants, hookTenantId, tenants, activeTenantId]);

  const activeTenantSubdomain = resolvedSubdomain;

  // Use notifications hook with tenant context
  const {
    notifications,
    unreadCount,
    markAsRead
  } = useNotifications({
    tenantId: activeTenantId,
    autoFetch: true,
    autoConnect: true,
    pollingInterval: 30000 // Poll every 30 seconds
  });

  return (
    <DashboardLayout
      sidebarProps={{
        activeItem: highlightPage,
        onNavigate: onNavigate,
        onLogoutClick: onLogout,
        userRole: user?.role,
        permissions: userPermissions
      }}
      headerProps={{
        user,
        tenantId: activeTenantId,
        tenantSubdomain: activeTenantSubdomain,
        currentPage: activePage,
        searchQuery: '',
        onSearchChange: () => {},
        onSearch: () => {},
        onNavigate: onNavigate,
        // Notification props
        notificationCount: unreadCount,
        notifications: notifications,
        onMarkNotificationRead: markAsRead,
        onOrderNotificationClick: onOrderNotificationClick,
        // Chat props
        unreadChatCount: hasUnreadChat ? 1 : 0,
        onChatClick: onOpenChatCenter
      }}
    >
      <div className="animate-fade-in">
        {children}
      </div>
    </DashboardLayout>
  );
};


// URL path mapping for admin routes


// URL path mapping for admin routes
const adminUrlMap: Record<string, string> = {
  'dashboard': '/dashboard',
  'orders': '/orders',
  'products': '/products',
  'inventory': '/inventory',
  'customers_reviews': '/customers',
  'customization': '/customization',
  'landing_pages': '/landing-pages',
  'store_studio': '/store-studio',
  'gallery': '/gallery',
  'admin_control': '/admin-control',
  'business_report': '/reports',
  'business_report_purchase': '/reports',
  'business_report_expense': '/reports',
  'business_report_income': '/reports',
  'business_report_due_book': '/reports',
  'business_report_profit_loss': '/reports',
  'business_report_contact_list': '/reports',
  'business_report_note': '/reports',
  'expenses': '/expenses',
  'income': '/income',
  'purchases': '/purchases',
  'due_book': '/due-book',
  'activity_log': '/activity',
  'support': '/support',
  'tutorial': '/tutorial',
  'profile': '/profile',
  'settings': '/settings',
  'catalog_categories': '/catalog/categories',
  'catalog_subcategories': '/catalog/subcategories',
  'catalog_childcategories': '/catalog/child-categories',
  'catalog_brands': '/catalog/brands',
  'catalog_tags': '/catalog/tags',
};

// Reverse map URL to page name
const getPageFromUrl = (): string => {
  const path = window.location.pathname.replace(/^\/admin/, '').replace(/^\//, '') || 'dashboard';
  for (const [page, url] of Object.entries(adminUrlMap)) {
    if (url.replace(/^\//, '') === path) return page;
  }
  return path || 'dashboard';
};

// Helper to check if user can access a page
const canAccessPage = (page: string, user?: User | null, permissions?: PermissionMap): boolean => {
  if (!user) return false;

  const role = user.role;

  // Super admin can access everything 
  if (role === 'super_admin') return true;

  // Admin can access everything except tenants
  if (role === 'admin' && page !== 'tenants') return true;

  // Tenant admin can access everything except tenants
  if (role === 'tenant_admin' && page !== 'tenants') return true;

  // Staff - check permissions
  if (role === 'staff') {
    // Dashboard is always accessible
    if (page === 'dashboard') return true;

    // Check permissions map
    if (permissions) {
      const pageResourceMap: Record<string, string> = {
        'orders': 'orders',
        'products': 'products',
        'landing_pages': 'landing_pages',
        'popups': 'landing_pages',
        'inventory': 'inventory',
        'customers': 'customers',
        'reviews': 'reviews',
        'daily_target': 'daily_target',
        'gallery': 'gallery',
        'catalog_categories': 'catalog',
        'catalog_subcategories': 'catalog',
        'catalog_childcategories': 'catalog',
        'catalog_brands': 'catalog',
        'catalog_tags': 'catalog',
        'business_report_purchase': 'business_report',
        'business_report_expense': 'business_report',
        'business_report_income': 'business_report',
        'business_report_due_book': 'business_report',
        'business_report_profit_loss': 'business_report',
        'business_report_contact_list': 'business_report',
        'business_report_note': 'business_report',
        'due_list': 'due_book',
        'expenses': 'expenses',
        'income': 'income',
        'purchases': 'purchases',
        'due_book': 'due_book',
        'settings': 'settings',
        'manage_shop': 'settings',
        'settings_delivery': 'settings',
        'settings_payment': 'settings',
        'settings_courier': 'settings',
        'settings_facebook_pixel': 'settings',
        'settings_gtm': 'settings',
        'settings_marketing': 'settings',
        'settings_domain': 'settings',
        'admin': 'admin_control',
        'carousel': 'customization',
        'banner': 'customization',
        'popup': 'customization',
        'website_info': 'customization',
        'theme_view': 'customization',
        'theme_colors': 'customization',
        'tenants': 'tenants',
      };

      const resource = pageResourceMap[page];
      if (resource && permissions[resource]) {
        return permissions[resource].includes('read');
      }
    }

    return false;
  }

  return false;
};

const AdminApp: React.FC<AdminAppProps> = ({
  user,
  userPermissions = {},
  activeTenantId,
  tenants,
  orders,
  products,
  logo,
  themeConfig,
  websiteConfig,
  deliveryConfig,
  courierConfig,
  facebookPixelConfig,
  onLogout,
  onUpdateOrder,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onBulkDeleteProducts,
  onBulkUpdateProducts,
  onBulkFlashSale,
  onUpdateLogo,
  onUpdateTheme,
  onUpdateWebsiteConfig,
  onUpdateDeliveryConfig,
  onUpdatePaymentMethods,
  onUpdateCourierConfig,
  onUpdateProfile,
  onTenantChange,
  isTenantSwitching,
  onSwitchToStore,
  onOpenAdminChat,
  hasUnreadChat,

  landingPages,
  onCreateLandingPage,
  onUpsertLandingPage,
  onToggleLandingPublish,
  onAddOrder,
}) => {
  const [adminSection, setAdminSectionInternal] = useState(() => getPageFromUrl());
  const [selectedOrderIdFromNotification, setSelectedOrderIdFromNotification] = useState<string | null>(null);

  // Handler for when an order notification is clicked
  const handleOrderNotificationClick = useCallback((orderId: string) => {
    setSelectedOrderIdFromNotification(orderId);
    setAdminSectionInternal('orders');
    window.history.pushState({ page: 'orders' }, '', '/admin/orders');
  }, []);

  // Wrapper that checks permission before navigating and updates URL
  const setAdminSection = (page: string) => {
    if (canAccessPage(page, user, userPermissions)) {
      setAdminSectionInternal(page);
      // Update URL without reload
      const urlPath = adminUrlMap[page] || '/' + page;
      window.history.pushState({page}, '', '/admin' + urlPath);
    } else {
      toast.error('You do not have permission to access this page');
      setAdminSectionInternal('dashboard');
      window.history.pushState({ page: 'dashboard' }, '', '/admin/dashboard');
    }
  };

  // Handle browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      const page = getPageFromUrl();
      if (canAccessPage(page, user, userPermissions)) {
        setAdminSectionInternal(page);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, userPermissions]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [childCategories, setChildCategories] = useState<ChildCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [hasLoadedAdminData, setHasLoadedAdminData] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Load admin-only data
  useEffect(() => {
    if (!activeTenantId || !user || hasLoadedAdminData) return;

    let isMounted = true;

    const fetchAdminData = async () => {
      try {
        const [
          usersData,
          rolesData,
          categoriesData,
          subCategoriesData,
          childCategoriesData,
          brandsData,
          tagsData,
          courierConfigData,
        ] = await Promise.all([
          authService.getAdminUsers(),
          authService.getRoles(),
          DataService.getCatalog('categories', [], activeTenantId),
          DataService.getCatalog('subcategories', [], activeTenantId),
          DataService.getCatalog('childcategories', [], activeTenantId),
          DataService.getCatalog('brands', [], activeTenantId),
          DataService.getCatalog('tags', [], activeTenantId),
          fetch('/api/courier/config', { headers: { 'X-Tenant-Id': activeTenantId, ...getAuthHeader() } }).then(r => r.ok ? r.json() : null).catch(() => null),
        ]);

        if (!isMounted) return;

        setUsers(usersData);
        setRoles(rolesData);
        setCategories(categoriesData);
        setSubCategories(subCategoriesData);
        setChildCategories(childCategoriesData);
        setBrands(brandsData);
        setTags(tagsData);
        if (courierConfigData) onUpdateCourierConfig(courierConfigData);
        setHasLoadedAdminData(true);
      } catch (error) {
        console.error('Failed to load admin data', error);
      }
    };

    fetchAdminData();
    return () => {
      isMounted = false;
    };
  }, [activeTenantId, user, hasLoadedAdminData]);

  const createCrudHandler = (setter: React.Dispatch<React.SetStateAction<any[]>>, storageKey: string) => ({
    add: (item: any) => {
      setter(prev => {
        const updated = [...prev, { ...item, tenantId: item?.tenantId || activeTenantId }];
        DataService.save(storageKey, updated, activeTenantId);
        return updated;
      });
    },
    update: (item: any) => {
      setter(prev => {
        const updated = prev.map(i => i.id === item.id ? { ...item, tenantId: item?.tenantId || activeTenantId } : i);
        DataService.save(storageKey, updated, activeTenantId);
        return updated;
      });
    },
    delete: (id: string) => {
      setter(prev => {
        const updated = prev.filter(i => i.id !== id);
        DataService.save(storageKey, updated, activeTenantId);
        return updated;
      });
    }
  });

  const catHandlers = createCrudHandler(setCategories, 'categories');
  const subCatHandlers = createCrudHandler(setSubCategories, 'subcategories');
  const childCatHandlers = createCrudHandler(setChildCategories, 'childcategories');
  const brandHandlers = createCrudHandler(setBrands, 'brands');
  const tagHandlers = createCrudHandler(setTags, 'tags');

  const platformOperator = user?.role === 'super_admin';
  const selectedTenantRecord = tenants.find(t => t.id === activeTenantId || t._id === activeTenantId) || null;
  const headerTenants = platformOperator ? tenants : (selectedTenantRecord ? [selectedTenantRecord] : []);
  const tenantSwitcher = platformOperator ? onTenantChange : undefined;

  // Subscription management - check tenant subscription status
  const {
    showNotification: showSubscriptionNotification,
    showRenewalPopup,
    dismissNotification: dismissSubscriptionNotification,
    dismissRenewalPopup,
    canDismissPopup,
    handleRenew,
    isBlocked: isSubscriptionBlocked,
    daysRemaining,
    daysOverdue,
    expiryMessage,
  } = useSubscription({
    tenantId: activeTenantId,
    subscription: selectedTenantRecord?.subscription as any,
    enabled: !!selectedTenantRecord && user?.role !== 'super_admin', // Don't show to super admin
  });

  const handleAddRole = async (newRole: Omit<Role, '_id' | 'id'>) => {
    try {
      await authService.createRole({
        name: newRole.name,
        description: newRole.description || '',
        permissions: (newRole.permissions || []) as any,
        tenantId: newRole.tenantId || activeTenantId
      });
      // Refresh roles list from server
      const refreshedRoles = await authService.getRoles();
      setRoles(refreshedRoles as unknown as Role[]);
      toast.success('Role created successfully');
    } catch (error) {
      console.error('Failed to create role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create role';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleUpdateRole = async (roleId: string, updates: Partial<Role>) => {
    try {
      await authService.updateRole(roleId, updates as any);
      // Refresh roles list from server to ensure consistency
      const refreshedRoles = await authService.getRoles();
      setRoles(refreshedRoles as unknown as Role[]);
      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
      throw error;
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      await authService.deleteRole(roleId);
      // Refresh roles list from server to ensure consistency
      const refreshedRoles = await authService.getRoles();
      setRoles(refreshedRoles as unknown as Role[]);
      toast.success('Role deleted successfully');
    } catch (error) {
      console.error('Failed to delete role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete role');
      throw error;
    }
  };

  const handleUpdateUserRole = async (userEmail: string, roleId: string) => {
    try {
      await authService.updateUserRole(userEmail, roleId);
      // Refresh users list from server to ensure consistency
      const refreshedUsers = await authService.getAdminUsers();
      setUsers(refreshedUsers);
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user role');
    }
  };

  const handleAddUser = async (userData: Omit<User, '_id' | 'id'>) => {
    try {
      await authService.createUser({ ...userData, role: userData.role || 'staff' });
      // Refresh users list from server
      const refreshedUsers = await authService.getAdminUsers();
      setUsers(refreshedUsers);
      toast.success('User created successfully');
    } catch (error) {
      console.error('Failed to create user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      toast.error(errorMessage);
      throw error;
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await authService.updateUser(userId, updates);
      // Refresh users list from server to ensure consistency
      const refreshedUsers = await authService.getAdminUsers();
      setUsers(refreshedUsers);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await authService.deleteUser(userId);
      // Refresh users list from server to ensure consistency
      const refreshedUsers = await authService.getAdminUsers();
      setUsers(refreshedUsers);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete user');
      throw error;
    }
  };

  const handlePreviewLandingPage = (page: any) => {
    // Open landing page in new tab using the tenant's subdomain
    const tenantSubdomain = selectedTenantRecord?.subdomain;
    const protocol = window.location.protocol;
    const host = window.location.host;
    // Extract the main domain (e.g., allinbangla.com from admin.allinbangla.com)
    const mainDomain = host.split('.').slice(-2).join('.');
    // Build URL using tenant subdomain
    const baseUrl = tenantSubdomain
      ? `${protocol}//${tenantSubdomain}.${mainDomain}`
      : window.location.origin;
    const previewUrl = `${baseUrl}/${page.urlSlug}`;
    window.open(previewUrl, '_blank');
  };

  return (
    <LanguageProvider tenantId={activeTenantId}>
      {/* Subscription Renewal Popup - shows when subscription expires */}
      <SubscriptionRenewalPopup
        isOpen={showRenewalPopup}
        onClose={dismissRenewalPopup}
        onRenew={handleRenew}
        canDismiss={canDismissPopup}
        daysOverdue={daysOverdue}
        isBlocked={isSubscriptionBlocked}
        expiryMessage={expiryMessage}
      />
      
      {adminSection === 'dashboard' ? (
        <>
          {/* Subscription Notification - shows in dashboard for days 27-30 */}
          {showSubscriptionNotification && (
            <div style={{ position: 'fixed', top: '80px', left: '280px', right: '24px', zIndex: 9998 }}>
              <SubscriptionNotification
                isVisible={showSubscriptionNotification}
                onDismiss={dismissSubscriptionNotification}
                daysRemaining={daysRemaining}
                onRenew={handleRenew}
              />
            </div>
          )}
          <AdminDashboard 
            orders={orders} 
            products={products} 
            tenantId={activeTenantId}
            tenantSubdomain={selectedTenantRecord?.subdomain || ''}
            user={user || undefined} 
            onNavigate={setAdminSection}
            onLogoutClick={onLogout}
            hasUnreadChat={hasUnreadChat}
            onOpenAdminChat={onOpenAdminChat}
          />
        </>
      ) : (
        <AdminLayout
        onSwitchView={onSwitchToStore}
        activePage={adminSection}
        onNavigate={setAdminSection}
        logo={logo}
        user={user || undefined}
        onLogout={onLogout}
        tenants={headerTenants}
        activeTenantId={activeTenantId}
        activeTenantSubdomain={selectedTenantRecord?.subdomain}
        onTenantChange={tenantSwitcher}
        isTenantSwitching={isTenantSwitching}
        onOpenChatCenter={onOpenAdminChat}
        hasUnreadChat={hasUnreadChat}
        userPermissions={userPermissions}
        onOrderNotificationClick={handleOrderNotificationClick}
      >
        <Suspense fallback={<PageLoadingFallback section={adminSection} />}>
          {
            adminSection === 'orders' ? <FigmaOrderList orders={orders} courierConfig={courierConfig} onUpdateOrder={onUpdateOrder} products={products} tenantId={activeTenantId} onNewOrder={onAddOrder} initialSelectedOrderId={selectedOrderIdFromNotification} onClearSelectedOrderId={() => setSelectedOrderIdFromNotification(null)} /> :
              adminSection === 'products' ? <FigmaProductList products={products} categories={categories} brands={brands} onAddProduct={() => { setEditingProduct(null); setAdminSection('product-upload'); }} onEditProduct={(p) => { setEditingProduct(p); setAdminSection('product-upload'); }} onDeleteProduct={onDeleteProduct} onCloneProduct={(p) => onAddProduct({ ...p, id: Date.now(), name: p.name + ' (Copy)' })} onBulkDelete={onBulkDeleteProducts} onBulkStatusUpdate={(ids, status) => onBulkUpdateProducts(ids, { status })} onBulkFlashSale={onBulkFlashSale} onBulkImport={(importedProducts) => { importedProducts.forEach(product => onAddProduct(product)); }} /> :
                adminSection === 'product-upload' ? <FigmaProductUpload categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} onAddProduct={editingProduct ? onUpdateProduct : onAddProduct} onBack={() => { setEditingProduct(null); setAdminSection('products'); }} onNavigate={setAdminSection} editProduct={editingProduct} /> :
                  adminSection === 'store_studio' ? <StoreStudioManager tenantId={activeTenantId} onBack={() => setAdminSection('manage_shop')} products={products} /> :
                  adminSection === 'landing_pages' ? <AdminLandingPage tenantSubdomain={selectedTenantRecord?.subdomain || ''} products={products} landingPages={landingPages} onCreateLandingPage={onCreateLandingPage} onUpdateLandingPage={onUpsertLandingPage} onTogglePublish={onToggleLandingPublish} onPreviewLandingPage={handlePreviewLandingPage} /> :
                    adminSection === 'due_list' ? <AdminDueList user={user} onLogout={onLogout} /> :
                      adminSection === 'inventory' ? <FigmaInventory products={products} tenantId={activeTenantId} /> :
                        adminSection === 'popups' ? <AdminPopups onBack={() => setAdminSection('dashboard')} tenantId={activeTenantId} /> :
                          adminSection === 'customers_reviews' ? <AdminCustomers orders={orders} products={products} activeTenantId={activeTenantId} /> :
                            adminSection === 'daily_target' ? <AdminDailyTarget /> :
                              adminSection === 'gallery' ? <AdminGallery /> :
                                adminSection === 'figma' ? <AdminFigmaIntegration onBack={() => setAdminSection('gallery')} tenantId={activeTenantId} /> :
                                  adminSection === 'billing' ? <AdminBilling tenant={selectedTenantRecord} onUpgrade={() => setAdminSection('settings')} /> :
                                    adminSection === 'tutorial' ? <AdminTutorial /> :
                                      adminSection === 'activity_log' ? <AdminActivityLog tenantId={activeTenantId} /> :
                                        adminSection === 'profile' ? <AdminProfile user={user} onUpdateProfile={onUpdateProfile} activeTenant={selectedTenantRecord} /> :
                                          adminSection === 'manage_shop' ? <AdminManageShop onNavigate={setAdminSection} tenantId={activeTenantId} websiteConfig={websiteConfig} tenantSubdomain={selectedTenantRecord?.subdomain} /> :
                                            adminSection === 'settings' ? <AdminSettings courierConfig={courierConfig} onUpdateCourierConfig={onUpdateCourierConfig} onNavigate={setAdminSection} activeTenant={selectedTenantRecord} logo={logo} onUpdateLogo={onUpdateLogo} /> :
                                              adminSection === 'sms_marketing' ? <AdminSMSMarketing tenantId={activeTenantId} onBack={() => setAdminSection('manage_shop')} /> :
                                                adminSection === 'support' ? <AdminSupport user={user} activeTenant={selectedTenantRecord} /> :
                                                  adminSection === 'settings_delivery' ? <AdminDeliverySettings configs={deliveryConfig} onSave={onUpdateDeliveryConfig} onBack={() => setAdminSection('settings')} /> :
                                                    adminSection === 'settings_payment' ? <AdminPaymentSettings tenantId={activeTenantId} onBack={() => setAdminSection('settings')} onUpdatePaymentMethods={onUpdatePaymentMethods} /> :
                                                      adminSection === 'settings_courier' ? <AdminCourierSettings config={courierConfig} onSave={onUpdateCourierConfig} onBack={() => setAdminSection('settings')} tenantId={activeTenantId} /> :
                                                        adminSection === 'settings_facebook_pixel' ? <AdminFacebookPixel config={facebookPixelConfig} onSave={async (cfg: FacebookPixelConfig) => { await fetch('/api/facebook-pixel/config', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': activeTenantId, ...getAuthHeader() }, body: JSON.stringify(cfg) }); toast.success('Facebook Pixel config saved'); }} onBack={() => setAdminSection('settings_marketing')} /> :
                                                          adminSection === 'settings_gtm' ? <AdminGTM onBack={() => setAdminSection('settings_marketing')} tenantId={activeTenantId} /> :
                                                            adminSection === 'settings_marketing' ? <AdminMarketingIntegrations onBack={() => setAdminSection('settings')} onNavigate={setAdminSection} /> :
                                                              adminSection === 'settings_domain' ? <AdminShopDomain onBack={() => setAdminSection('settings')} tenantId={activeTenantId} /> :
                                                              adminSection === 'settings_rewards' ? <AdminRewardPointSettings tenantId={activeTenantId} onBack={() => setAdminSection('settings')} /> :
                                                              adminSection === 'admin_control' ? <AdminControlNew users={users as any} roles={roles as any} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onAddRole={handleAddRole} onUpdateRole={handleUpdateRole} onDeleteRole={handleDeleteRole} onUpdateUserRole={handleUpdateUserRole} currentUser={user as any} tenantId={activeTenantId} userPermissions={userPermissions} /> :
                                                              adminSection.startsWith('catalog_') ? <FigmaCatalogManager view={adminSection} onNavigate={setAdminSection} categories={categories} subCategories={subCategories} childCategories={childCategories} brands={brands} tags={tags} onAddCategory={catHandlers.add} onUpdateCategory={catHandlers.update} onDeleteCategory={catHandlers.delete} onAddSubCategory={subCatHandlers.add} onUpdateSubCategory={subCatHandlers.update} onDeleteSubCategory={subCatHandlers.delete} onAddChildCategory={childCatHandlers.add} onUpdateChildCategory={childCatHandlers.update} onDeleteChildCategory={childCatHandlers.delete} onAddBrand={brandHandlers.add} onUpdateBrand={brandHandlers.update} onDeleteBrand={brandHandlers.delete} onAddTag={tagHandlers.add} onUpdateTag={tagHandlers.update} onDeleteTag={tagHandlers.delete} /> :
                                                                adminSection === 'expenses' ? <AdminExpenses tenantId={activeTenantId} /> :
                                                                adminSection === 'income' ? <AdminIncome tenantId={activeTenantId} /> :
                                                                adminSection === 'purchases' ? <AdminPurchase products={products} tenantId={activeTenantId} categories={categories} /> :
                                                                adminSection === 'due_book' ? <AdminDueListPage user={user} onLogout={onLogout} /> :
                                                                (adminSection === 'business_report' || adminSection.startsWith('business_report_')) ? <FigmaBusinessReport initialTab={adminSection} orders={orders} products={products} user={user} onLogout={onLogout} tenantId={activeTenantId} /> :
                                                                  adminSection === 'website_content_landing_page' ? <AdminLandingPage tenantSubdomain={selectedTenantRecord?.subdomain || ''} products={products} landingPages={landingPages} onCreateLandingPage={onCreateLandingPage} onUpdateLandingPage={onUpsertLandingPage} onTogglePublish={onToggleLandingPublish} onPreviewLandingPage={handlePreviewLandingPage} /> :
                                                                  (adminSection === 'website_content' || adminSection === 'carousel' || adminSection === 'campaigns' || adminSection === 'popup' || adminSection === 'website_info' || adminSection === 'chat_settings' || adminSection === 'website_content_carousel' || adminSection === 'website_content_banners' || adminSection === 'website_content_popups') ? <AdminWebsiteContent tenantId={activeTenantId} logo={logo} onUpdateLogo={onUpdateLogo} themeConfig={themeConfig ?? undefined} onUpdateTheme={onUpdateTheme} websiteConfig={websiteConfig} onUpdateWebsiteConfig={onUpdateWebsiteConfig} products={products} initialTab={adminSection === 'website_content' || adminSection === 'website_content_carousel' ? 'carousel' : adminSection === 'website_content_banners' ? 'campaigns' : adminSection === 'website_content_popups' ? 'popup' : adminSection} /> :
                                                                    <AdminCustomization tenantId={activeTenantId} logo={logo} onUpdateLogo={onUpdateLogo} themeConfig={themeConfig ?? undefined} onUpdateTheme={onUpdateTheme} websiteConfig={websiteConfig} onUpdateWebsiteConfig={onUpdateWebsiteConfig} products={products} initialTab={adminSection === 'customization' ? 'theme_view' : adminSection} />
          }
        </Suspense>
        <AIChatAssistant tenantId={activeTenantId} shopName={selectedTenantRecord?.name} onNavigate={setAdminSection} />
        </AdminLayout>
      )}
    </LanguageProvider>
  );
};

export default AdminApp;