import { Order, Product } from '../../types';

// Chart data types
export type RevenueDataPoint = { name: string; sales: number; costs: number };
export type ProfitDataPoint = { name: string; value: number };
export type CategoryDataPoint = { name: string; value: number; color: string };

// Product display item type
export interface BestSellingProductItem {
  product: Product;
  orders: number;
  revenue: number;
}

// Component props
export interface DashboardHeaderProps {
  tenantId?: string;
  tenantSubdomain?: string;
  currentPage?: string;
  user?: { name?: string; avatar?: string } | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch?: (query: string) => void;
  onNavigate?: (page: string) => void;
  // Notification props
  notificationCount?: number;
  onNotificationClick?: () => void;
  notifications?: Array<{
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: Record<string, any>;
  }>;
  onMarkNotificationRead?: (ids?: string[]) => void;
  onOrderNotificationClick?: (orderId: string) => void;
  // Chat props
  unreadChatCount?: number;
  onChatClick?: () => void;
}

export interface OrderAnalyticsProps {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
  toBeReviewed: number;
  reservedPrice?: number;
  notifications?: Array<{ id: string; image: string; title: string }>;
}

export interface VisitorStatsProps {
  visitorStats?: {
    onlineNow?: number;
    todayVisitors?: number;
    periodVisitors?: number;
    totalVisitors?: number;
    totalPageViews?: number;
  };
}

export interface OrderStatusRowProps {
  todayOrders: number;
  courierOrders: number;
  confirmedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  returnsCount: number;
}

export interface RevenueChartProps {
  data: RevenueDataPoint[];
}

export interface ProfitChartProps {
  data: ProfitDataPoint[];
}

export interface CategoryChartProps {
  data: CategoryDataPoint[];
}

export interface BestSellingProductsProps {
  bestSellingProducts: BestSellingProductItem[];
  products: Product[];
}

export interface TopProductsProps {
  products: Product[];
}

export type PermissionMap = Record<string, string[]>;

export interface SidebarProps {
  activeItem?: string;
  onNavigate?: (item: string) => void;
  onLogoutClick?: () => void;
  className?: string;
  userRole?: string;
  permissions?: PermissionMap;
}
