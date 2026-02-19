import React, { useState, useMemo, useEffect } from 'react';
import {
  DashboardLayout,
  FigmaOverview,
  FigmaOrderStatus,
  FigmaBestSellingProducts,
  FigmaTopProducts,
  FigmaSalesPerformance,
  FigmaSalesByCategory,
  FigmaAnalyticsChart,
  FigmaOrderList
} from './index';
import { Order, Product } from '../../types';
import { useNotifications } from '../../hooks/useNotifications';
import { useTenant } from '../../hooks/useTenant';
import { useLanguage } from '../../context/LanguageContext';
import { DataService } from '../../services/DataService';
import { VisitorStatsSection } from './VisitorAnalytics/src/screens/FrameScreen/sections/VisitorStatsSection';
import { TrafficChartSection } from './VisitorAnalytics/src/screens/FrameScreen/sections/TrafficChartSection';

interface FigmaDashboardPageProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  tenantId?: string;
  tenantSubdomain?: string;
  orders?: Order[];
  products?: Product[];
  onNavigate?: (page: string) => void;
  onLogoutClick?: () => void;
  hasUnreadChat?: boolean;
  onOpenAdminChat?: () => void;
  onOrderNotificationClick?: (orderId: string) => void;
}

const FigmaDashboardPage: React.FC<FigmaDashboardPageProps> = ({
  user = { name: 'Yuvraj' },
  tenantId = '',
  tenantSubdomain = '',
  orders = [],
  products = [],
  onNavigate,
  onLogoutClick,
  hasUnreadChat = false,
  onOpenAdminChat,
  onOrderNotificationClick
}) => {
  const { language, setLanguage } = useLanguage();
  const [timeFilter, setTimeFilter] = useState<'day' | 'month' | 'year' | 'all' | 'custom'>('year');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [resolvedSubdomain, setResolvedSubdomain] = useState<string>(tenantSubdomain);

  // Get subdomain from useTenant hook (captures URL subdomain)
  const { hostTenantSlug, tenants: hookTenants, activeTenantId: hookTenantId } = useTenant();

  // Resolve subdomain from multiple sources
  useEffect(() => {
    const findSubdomain = () => {
      // Priority 1: Prop passed from parent
      if (tenantSubdomain) return tenantSubdomain;
      // Priority 2: URL subdomain (hostTenantSlug)
      if (hostTenantSlug) return hostTenantSlug;
      // Priority 3: Find from hook tenants
      const hookTenant = hookTenants.find(t => t.id === (tenantId || hookTenantId) || t._id === (tenantId || hookTenantId));
      if (hookTenant?.subdomain) return hookTenant.subdomain;
      return '';
    };
    const resolved = findSubdomain();
    if (resolved) {
      setResolvedSubdomain(resolved);
    } else if (tenantId) {
      // Fallback: load tenants list and find subdomain
      DataService.listTenants().then(allTenants => {
        const tenant = allTenants.find(t => t.id === tenantId || t._id === tenantId);
        if (tenant?.subdomain) {
          setResolvedSubdomain(tenant.subdomain);
        }
      }).catch(() => {});
    }
  }, [tenantSubdomain, hostTenantSlug, hookTenants, hookTenantId, tenantId]);

  // Use notifications hook with tenant context
  const {
    notifications,
    unreadCount,
    markAsRead
  } = useNotifications({
    tenantId,
    autoFetch: true,
    autoConnect: true,
    pollingInterval: 30000 // Poll every 30 seconds
  });

  const handleSidebarNavigation = (page: string) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
    onNavigate?.(page);
  };

  // Calculate stats from real data - default to 0
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalAmount = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const lowStock = products.filter(p => (p.stock || 0) < 10).length;
  const toReview = orders.filter(o => o.status === 'Pending').length;

  // Order status stats - default to 0
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const confirmedOrders = orders.filter(o => o.status === 'Confirmed').length;
  const courierOrders = orders.filter(o => o.status === 'Sent to Courier' || o.status === 'Shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const canceledOrders = orders.filter(o => o.status === 'Cancelled').length;
  const returnsOrders = orders.filter(o => o.status === 'Return' || o.status === 'Refund').length;

  // Format currency
  const formattedAmount = `৳${totalAmount.toLocaleString('en-IN')}`;

  // Best selling products data - memoized to prevent re-renders
  const bestSellingData = useMemo(() => products.slice(0, 4).map((p, idx) => ({
    id: String(p.id || idx + 1) + '-best-' + idx,
    name: p.name || ['Apple iPhone 13', 'Nike Air Jordan', 'T-shirt', 'Cross Bag'][idx],
    totalOrder: String([104, 56, 266, 506][idx] || 100),
    status: (p.stock || 0) > 0 ? 'Stock' : 'Stock out' as 'Stock' | 'Stock out',
    price: `$${(p.price || 999).toFixed(2)}`,
    image: p.image
  })), [products]);

  // Top products data - memoized to prevent re-renders
  const topProductsData = useMemo(() => products.slice(0, 5).map((p, idx) => ({
    id: String(p.id || idx + 1) + '-top-' + idx,
    name: p.name || ['Apple iPhone 13', 'Nike Air Jordan', 'T-shirt', 'Assorted Cross Bag', 'Fur Pom Gloves'][idx],
    itemCode: `#FXZ-${4567 + idx}`,
    price: `$${(p.price || [999, 72.4, 35.4, 80, 45][idx]).toFixed(2)}`,
    image: p.image
  })), [products]);

  return (
    <DashboardLayout
      sidebarProps={{
        activeItem: currentPage,
        onNavigate: handleSidebarNavigation,
        onLogoutClick: onLogoutClick
      }}
      headerProps={{
        user,
        tenantId,
        tenantSubdomain: resolvedSubdomain,
        searchQuery: '',
        onSearchChange: (query) => console.log('Search:', query),
        onSearch: () => console.log('Search submitted'),
        onNavigate: handleSidebarNavigation,
        // Notification props
        notificationCount: unreadCount,
        notifications: notifications,
        onMarkNotificationRead: markAsRead,
        onOrderNotificationClick: onOrderNotificationClick,
        // Chat props
        unreadChatCount: hasUnreadChat ? 1 : 0,
        onChatClick: onOpenAdminChat
      }}
    >
      {/* Orders Page */}
      {currentPage === 'orders' && (
        <div className="pb-3 sm:pb-4">
          <FigmaOrderList orders={orders} />
        </div>
      )}

      {/* Dashboard Page */}
      {currentPage === 'dashboard' && (
    <div className="space-y-2 xs:space-y-3 sm:space-y-4 pb-3 sm:pb-3 sm:pb-4">
        {/* Overview Section */}
        <FigmaOverview
          stats={{
            totalProducts,
            totalOrders,
            totalAmount: formattedAmount,
            lowStock,
            toReview
          }}
          currentLang={language}
          onLangChange={setLanguage}
        />

        {/* Analytics Bar Chart */}
        <div className="px-2 xs:px-3 sm:px-4 lg:px-3 xl:px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xs:gap-3 sm:gap-4">
              
          <VisitorStatsSection
            // timeFilter={timeFilter}
            // onTimeFilterChange={(filter) => setTimeFilter(filter as any)}
            // onDateRangeChange={(range) => setSelectedMonth(range.start)}
            // tenantId={tenantId}
          />

            
      <TrafficChartSection
          // timeFilter={timeFilter}
          //   onTimeFilterChange={(filter) => setTimeFilter(filter as any)}
          //   onDateRangeChange={(range) => setSelectedMonth(range.start)}
          //   tenantId={tenantId}
          />
       </div>
        </div>

         

        {/* Order Status Row */}
        <FigmaOrderStatus
          orderStats={{
            pending: pendingOrders,
            confirmed: confirmedOrders,
            courier: courierOrders,
            delivered: deliveredOrders,
            canceled: canceledOrders,
            returns: returnsOrders
          }}
        />

        {/* Sales Performance + Sales by Category Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 xs:gap-3 sm:gap-4 px-2 xs:px-3 sm:px-4 lg:px-3 xl:px-4">
          {/* Sales Performance Chart - Left Side */}
          <div className="lg:col-span-8">
            <FigmaSalesPerformance orders={orders} timeFilter={timeFilter} selectedMonth={selectedMonth} />
          </div>

          {/* Sales by Category Pie Chart - Right Side */}
          <div className="lg:col-span-4">
            <FigmaSalesByCategory orders={orders} />
          </div>
        </div>

        {/* Best Selling Products + Top Products Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 xs:gap-3 sm:gap-4 px-2 xs:px-3 sm:px-4 lg:px-3 xl:px-4">
          {/* Best Selling Products Table - Left Side */}
          <div className="lg:col-span-8">
            <FigmaBestSellingProducts products={bestSellingData} />
          </div>

          {/* Top Products List - Right Side */}
          <div className="lg:col-span-4">
            <FigmaTopProducts products={topProductsData} />
          </div>
        </div>
      </div>
      )}
    </DashboardLayout>
  );
};

export default FigmaDashboardPage;
