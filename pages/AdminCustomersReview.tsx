import React, { useMemo, useState, useEffect } from 'react';
import { 
  Users, 
  Star, 
  Search, 
  Ban, 
  ChevronDown, 
  MoreVertical, 
  UserPlus,
  RefreshCw,
  CheckCircle,
  XCircle,
  Mail,
  ShoppingBag,
  X,
  Clock,
  Send,
  ArrowUpDown,
  Eye,
  Edit
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Order, Product } from '../types';
import { MetricsSkeleton } from '../components/SkeletonLoaders';
import { DataService } from '../services/DataService';

type ReviewStatus = 'approved' | 'pending' | 'rejected';

type ReviewItem = {
  _id: string;
  productId: number;
  tenantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  headline?: string;
  comment: string;
  verified: boolean;
  status: ReviewStatus;
  helpful: number;
  reply?: string;
  repliedBy?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
};

interface CustomerInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  firstOrderDate: string;
  avgOrderValue: number;
  orders: Order[];
  avatar?: string;
  status: 'Active' | 'Blocked';
  serialNumber: number;
}

interface AdminCustomersReviewProps {
  orders: Order[];
  products?: Product[];
  activeTenantId: string;
}

const AdminCustomersReview: React.FC<AdminCustomersReviewProps> = ({ orders, products = [], activeTenantId }) => {
  const [customerSearch, setCustomerSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [customerSortBy, setCustomerSortBy] = useState('Newest');
  const [reviewSortBy, setReviewSortBy] = useState('Newest');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [tagFilter, setTagFilter] = useState('10 Tags');
  const [categorySearch, setCategorySearch] = useState('');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [mobileReviewMenuOpen, setMobileReviewMenuOpen] = useState<string | null>(null);

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      if (!activeTenantId) return;
      
      try {
        setReviewsLoading(true);
        const { reviews: fetchedReviews } = await DataService.getAllReviewsForTenant(activeTenantId, {
          limit: 1000 // Fetch all reviews
        });
        setReviews(fetchedReviews as ReviewItem[]);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [activeTenantId]);

  // Get selected review
  const selectedReview = useMemo(() => 
    reviews.find(r => r._id === selectedReviewId) || null
  , [reviews, selectedReviewId]);

  // Handle status change (approve/reject)
  const handleStatusChange = async (reviewId: string, status: ReviewStatus) => {
    if (!activeTenantId) return;
    setIsUpdating(true);
    try {
      await DataService.updateReviewStatus(activeTenantId, reviewId, status);
      setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, status } : r));
      toast.success(
        status === 'approved' 
          ? 'Review approved - now visible in storefront' 
          : status === 'rejected' 
            ? 'Review rejected' 
            : 'Review set to pending'
      );
    } catch (error) {
      console.error('Failed to update review status:', error);
      toast.error('Failed to update review status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle reply submission
  const handleSendReply = async () => {
    if (!selectedReview || !replyDraft.trim() || !activeTenantId) return;
    setIsUpdating(true);
    try {
      await DataService.replyToReview(activeTenantId, selectedReview._id, replyDraft.trim());
      setReviews(prev => prev.map(r => 
        r._id === selectedReview._id 
          ? { ...r, reply: replyDraft.trim(), repliedAt: new Date().toISOString(), status: 'approved' as ReviewStatus } 
          : r
      ));
      toast.success('Reply sent and review approved');
      setReplyDraft('');
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get status badge style
  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'rejected':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-BD', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Extract unique customers from orders
  const customers = useMemo(() => {
    const customerMap = new Map<string, CustomerInfo>();
    let serialCounter = 100;
    
    orders.forEach(order => {
      const phone = order.customerPhone || order.phone || '';
      if (!phone) return;
      
      const existing = customerMap.get(phone);
      const orderTotal = order.total || order.grandTotal || 0;
      // Normalize orderDate to string
      const rawDate = order.createdAt || order.date || new Date().toISOString();
      const orderDate = typeof rawDate === 'string' ? rawDate : new Date(rawDate).toISOString();
      
      if (existing) {
        existing.totalOrders += 1;
        existing.totalSpent += orderTotal;
        existing.orders.push(order);
        
        if (new Date(orderDate) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = orderDate;
        }
        if (new Date(orderDate) < new Date(existing.firstOrderDate)) {
          existing.firstOrderDate = orderDate;
        }
        existing.avgOrderValue = existing.totalSpent / existing.totalOrders;
      } else {
        customerMap.set(phone, {
          id: phone,
          name: order.customer || 'Unknown Customer',
          phone: phone,
          email: order.email || '',
          address: order.location || '',
          totalOrders: 1,
          totalSpent: orderTotal,
          lastOrderDate: orderDate,
          firstOrderDate: orderDate,
          avgOrderValue: orderTotal,
          orders: [order],
          avatar: 'https://hdnfltv.com/image/nitimages/pasted_1770973977439.webp',
          status: 'Active',
          serialNumber: serialCounter++
        });
      }
    });
    
    // If no orders, add sample data
    if (customerMap.size === 0) {
      for (let i = 0; i < 4; i++) {
        customerMap.set(`sample-${i}`, {
          id: `sample-${i}`,
          name: `Sample Customer ${i + 1}`,
          phone: '0000-000000',
          email: 'sample@example.com',
          address: '',
          totalOrders: 1,
          totalSpent: 0,
          lastOrderDate: new Date().toISOString(),
          firstOrderDate: new Date().toISOString(),
          avgOrderValue: 0,
          orders: [],
          avatar: 'https://hdnfltv.com/image/nitimages/pasted_1770973977439.webp',
          status: 'Active',
          serialNumber: 100
        });
      }
    }
    
    return Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  // Customer stats
  const customerStats = useMemo(() => {
    const totalCustomers = customers.length || 0;
    const totalReviews = reviews.length || 0;
    const repeatCustomers = customers.filter(c => c.totalOrders > 1).length || 0;
    const blockedCustomers = customers.filter(c => c.status === 'Blocked').length || 0;
    
    return { totalCustomers, totalReviews, repeatCustomers, blockedCustomers };
  }, [customers, reviews]);

  // Filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    let result = [...customers];
    
    // Search filter
    if (customerSearch.trim()) {
      const query = customerSearch.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.address?.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'All Status') {
      result = result.filter(c => c.status === statusFilter);
    }
    
    // Category/Product search (also searches customers by name, phone, email)
    if (categorySearch.trim()) {
      const catQuery = categorySearch.toLowerCase();
      result = result.filter(c => 
        // Search customer info
        c.name.toLowerCase().includes(catQuery) ||
        c.phone.includes(catQuery) ||
        c.email?.toLowerCase().includes(catQuery) ||
        c.address?.toLowerCase().includes(catQuery) ||
        // Search products in orders
        c.orders.some(order => 
          order.items?.some((item: { name?: string; productName?: string }) => 
            item.name?.toLowerCase().includes(catQuery) ||
            item.productName?.toLowerCase().includes(catQuery)
          )
        )
      );
    }
    
    // Sorting
    switch (customerSortBy) {
      case 'Newest':
        result.sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
        break;
      case 'Oldest':
        result.sort((a, b) => new Date(a.firstOrderDate).getTime() - new Date(b.firstOrderDate).getTime());
        break;
      case 'Name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Most Orders':
        result.sort((a, b) => b.totalOrders - a.totalOrders);
        break;
      case 'Highest Spent':
        result.sort((a, b) => b.totalSpent - a.totalSpent);
        break;
      default:
        break;
    }
    
    return result;
  }, [customers, customerSearch, statusFilter, categorySearch, customerSortBy]);

  // Helper function to get product name from productId
  const getProductName = (productId: number): string => {
    const product = products.find(p => p.id === productId);
    return product?.name || `Product #${productId}`;
  };

  // Filtered and sorted reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];
    
    // Category/Product search for reviews
    if (categorySearch.trim()) {
      const catQuery = categorySearch.toLowerCase();
      result = result.filter(r => {
        const productName = getProductName(r.productId).toLowerCase();
        return productName.includes(catQuery) ||
               r.userName?.toLowerCase().includes(catQuery) ||
               r.comment?.toLowerCase().includes(catQuery) ||
               r.headline?.toLowerCase().includes(catQuery);
      });
    }
    
    // Sorting
    switch (reviewSortBy) {
      case 'Newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'Oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'Highest Rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'Lowest Rating':
        result.sort((a, b) => a.rating - b.rating);
        break;
      case 'Most Helpful':
        result.sort((a, b) => (b.helpful || 0) - (a.helpful || 0));
        break;
      default:
        break;
    }
    
    return result;
  }, [reviews, categorySearch, reviewSortBy, products]);

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomers(prev => 
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleSelectAllReviews = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map(r => r._id));
    } 
  };

  const handleSelectReview = (id: string) => {
    setSelectedReviews(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  // Helper function to get user avatar
  const getUserAvatar = (userName: string): string => {
    const hash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const avatarIndex = hash % 70; 
    return `https://images.unsplash.com/photo-${1500000000000 + avatarIndex}?w=100&h=100&fit=crop&crop=faces`;
  };

  const getRatingBadgeStyle = (rating: number) => {
    if (rating >= 4) return { bg: 'bg-[#E0F2FE]', text: 'text-sky-600', starFill: 'text-sky-500' };
    if (rating >= 3) return { bg: 'bg-[#FFEDD5]', text: 'text-orange-600', starFill: 'text-orange-500' };
    return { bg: 'bg-[#FEE2E2]', text: 'text-red-600', starFill: 'text-red-500' };
  };

  return (
    <div className="min-h-screen bg-stone-50 font-['Poppins'] p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-teal-950">
          Customers <span className="font-normal">Review</span>
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Category Search */}
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-16 py-2.5 bg-[#F1F5F9] border-none rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              placeholder="Search customer, phone, product..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <span className="text-xs font-medium text-gray-500">Search</span>
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-[#F1F5F9] text-gray-700 text-sm font-medium py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Blocked</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Tag Filter */}
            <div className="relative">
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="appearance-none bg-[#F1F5F9] text-gray-700 text-sm font-medium py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{ WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}
              >
                <option>10 Tags</option>
                <option>5 Tags</option>
                <option>20 Tags</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            {/* Add Button */}
            {/* <button className="flex items-center gap-2 bg-[#0095FF] hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm whitespace-nowrap">
              <UserPlus className="w-5 h-5" />
              <span className="text-sm font-semibold">Add Customer</span>
            </button> */}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <MetricsSkeleton count={4} />
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {/* Customer Card */}
            <div className="bg-[#F0F9FF] rounded-xl p-5 flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-stone-900 text-base font-medium">Customer</h3>
                <p className="text-3xl font-bold text-gray-900">{customerStats.totalCustomers}</p>
                <p className="text-gray-500 text-xs font-medium">Total user</p>
              </div>
              <div className="w-12 h-12 bg-[#0095FF] rounded-lg flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Review Card */}
            <div className="bg-[#FFF7ED] rounded-xl p-5 flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-stone-900 text-base font-medium">Review</h3>
                <p className="text-3xl font-bold text-gray-900">{customerStats.totalReviews}</p>
                <p className="text-gray-500 text-xs font-medium">Consumers review</p>
              </div>
              <div className="w-12 h-12 bg-[#F97316] rounded-lg flex items-center justify-center shadow-sm">
                <Star className="w-6 h-6 text-white" fill="currentColor" />
            </div>
          </div>

            {/* Recurring Card */}
            <div className="bg-[#F0FDF4] rounded-xl p-5 flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-stone-900 text-base font-medium">Recurring customers</h3>
                <p className="text-3xl font-bold text-gray-900">{customerStats.repeatCustomers}</p>
                <p className="text-gray-500 text-xs font-medium">Repeat customers</p>
              </div>
              <div className="w-12 h-12 bg-[#22C55E] rounded-lg flex items-center justify-center shadow-sm">
                <RefreshCw className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Blocked Card */}
            <div className="bg-[#FEF2F2] rounded-xl p-5 flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-stone-900 text-base font-medium">Blocked</h3>
                <p className="text-3xl font-bold text-gray-900">{customerStats.blockedCustomers}</p>
                <p className="text-gray-500 text-xs font-medium">Blocked users</p>
              </div>
              <div className="w-12 h-12 bg-[#EF4444] rounded-lg flex items-center justify-center shadow-sm">
                <Ban className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Split */}
      <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 lg:gap-6 items-start">

        {/* Left: Customers Table */}
        <div className="w-full xl:flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Table Header */}
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full sm:max-w-md bg-[#F1F5F9] rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="Search Customers"
                className="block w-full pl-9 pr-16 py-2 bg-transparent border-none text-sm text-gray-900 placeholder-gray-500 focus:ring-0"
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                <span className="text-xs font-medium text-gray-500">Search</span>
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-gray-500 text-sm">Sort by</span>
              <div className="relative">
                <select
                  value={customerSortBy}
                  onChange={(e) => setCustomerSortBy(e.target.value)}
                  className="appearance-none bg-[#F1F5F9] text-gray-700 text-sm font-medium py-1.5 pl-3 pr-8 rounded-md focus:outline-none cursor-pointer"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}
                >
                  <option>Newest</option>
                  <option>Oldest</option>
                  <option>Name</option>
                  <option>Most Orders</option>
                  <option>Highest Spent</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
              <button className="p-1.5 bg-[#F1F5F9] rounded-md hover:bg-gray-200 transition">
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#E0F2FE]">
                <tr>
                  <th className="p-4 w-12">
                    <div
                      className={`w-5 h-5 rounded border border-gray-400 cursor-pointer flex items-center justify-center transition-colors ${selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0 ? 'bg-[#0095FF] border-[#0095FF]' : 'bg-transparent'}`}
                      onClick={handleSelectAllCustomers}
                    >
                      {selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0 && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm">Sl</th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm">Image</th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm">Name</th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm">Contact</th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm text-center">Status</th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer, i) => (
                    <tr key={customer.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <div 
                          className={`w-5 h-5 rounded border border-gray-400 cursor-pointer flex items-center justify-center transition-colors ${selectedCustomers.includes(customer.id) ? 'bg-[#0095FF] border-[#0095FF]' : 'bg-transparent'}`}
                          onClick={() => handleSelectCustomer(customer.id)}
                        >
                          {selectedCustomers.includes(customer.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-600">{filteredCustomers.length - i}</td>
                      <td className="py-4 px-2">
                        <img src={customer.avatar} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-200" />
                      </td>
                      <td className="py-4 px-2 text-sm font-medium text-gray-900">{customer.name}</td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col text-sm">
                          <span className="text-gray-900">{customer.phone}</span>
                          <span className="text-gray-500 text-xs">{customer.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.status === 'Active' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Customers) */}
          <div className="md:hidden space-y-4 p-4">
            {filteredCustomers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No customers found</div>
            ) : (
                filteredCustomers.map(customer => (
                  <div key={customer.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-start gap-4">
                    <div 
                      className={`mt-1 w-5 h-5 rounded border border-gray-400 cursor-pointer flex items-center justify-center flex-shrink-0 ${selectedCustomers.includes(customer.id) ? 'bg-[#0095FF] border-[#0095FF]' : 'bg-transparent'}`}
                      onClick={() => handleSelectCustomer(customer.id)}
                    >
                      {selectedCustomers.includes(customer.id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <img src={customer.avatar} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{customer.name}</h4>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                          <p className="text-xs text-gray-400 truncate">{customer.email}</p>
                        </div>
                        <button className="text-gray-400">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.status === 'Active' ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#FEE2E2] text-[#991B1B]'}`}>
                          {customer.status}
                        </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Reviews Table */}
        <div className="w-full xl:w-[420px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Review</h3>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm hidden sm:inline">Sort by</span>
              <div className="relative">
                <select
                  value={reviewSortBy}
                  onChange={(e) => setReviewSortBy(e.target.value)}
                  className="appearance-none bg-[#F1F5F9] text-gray-700 text-sm font-medium py-1.5 pl-3 pr-8 rounded-md focus:outline-none cursor-pointer"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}
                >
                  <option>Newest</option>
                  <option>Oldest</option>
                  <option>Highest Rating</option>
                  <option>Lowest Rating</option>
                  <option>Most Helpful</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
              <button className="p-1.5 bg-[#F1F5F9] rounded-md hover:bg-gray-200 transition">
                <ArrowUpDown className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#E0F2FE]">
                <tr>
                  <th className="p-4 w-10">
                    <div
                      className={`w-5 h-5 rounded border border-gray-400 cursor-pointer flex items-center justify-center transition-colors ${selectedReviews.length === filteredReviews.length && filteredReviews.length > 0 ? 'bg-[#0095FF] border-[#0095FF]' : 'bg-transparent'}`}
                      onClick={handleSelectAllReviews}
                    >
                      {selectedReviews.length === filteredReviews.length && filteredReviews.length > 0 && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm">Sl</th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm">Image</th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm">Name</th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm">Star</th>
                  <th className="py-4 px-2 text-gray-900 font-semibold text-sm text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-500">
                      No reviews found
                    </td>
                  </tr>
                ) : (
                    filteredReviews.map((review, idx) => {
                      const ratingStyle = getRatingBadgeStyle(review.rating);
                      return (
                        <tr
                          key={review._id} 
                          className={`border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition ${selectedReviewId === review._id ? 'bg-blue-50' : ''}`}
                          onClick={() => setSelectedReviewId(review._id)}
                        >
                          <td className="p-4">
                            <div 
                              className={`w-5 h-5 rounded border border-gray-400 cursor-pointer flex items-center justify-center transition-colors ${selectedReviews.includes(review._id) ? 'bg-[#0095FF] border-[#0095FF]' : 'bg-transparent'}`}
                              onClick={(e) => { e.stopPropagation(); handleSelectReview(review._id); }}
                            >
                              {selectedReviews.includes(review._id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </td>
                          <td className="py-4 px-2 text-sm text-gray-600">{filteredReviews.length - idx}</td>
                          <td className="py-4 px-2">
                            <img src={getUserAvatar(review.userName)} alt="" className="w-9 h-9 rounded-lg object-cover bg-gray-200" />
                          </td>
                          <td className="py-4 px-2">
                            <span className="text-sm text-gray-900 font-medium block truncate max-w-[100px]">{review.userName}</span>
                          </td>
                          <td className="py-4 px-2">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${ratingStyle.bg}`}>
                              <span className={`text-xs font-bold ${ratingStyle.text}`}>{review.rating}</span>
                              <Star className={`w-3 h-3 ${ratingStyle.starFill}`} fill="currentColor" />
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center">
                            <button className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Reviews) */}
          <div className="block sm:hidden space-y-3 p-4">
            {filteredReviews.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">No reviews found</div>
            ) : (
              filteredReviews.map((review, idx) => {
                const ratingStyle = getRatingBadgeStyle(review.rating);
                return (
                  <div 
                    key={review._id} 
                    className={`bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm ${selectedReviewId === review._id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedReviewId(review._id)}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className={`mt-1 w-5 h-5 rounded border border-gray-400 dark:border-gray-500 cursor-pointer flex items-center justify-center flex-shrink-0 ${selectedReviews.includes(review._id) ? 'bg-[#0095FF] border-[#0095FF]' : 'bg-transparent'}`}
                        onClick={(e) => { e.stopPropagation(); handleSelectReview(review._id); }}
                      >
                        {selectedReviews.includes(review._id) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <img src={getUserAvatar(review.userName)} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{review.userName}</h4>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full mt-1 ${ratingStyle.bg}`}>
                              <span className={`text-xs font-bold ${ratingStyle.text}`}>{review.rating}</span>
                              <Star className={`w-3 h-3 ${ratingStyle.starFill}`} fill="currentColor" />
                            </div>
                          </div>
                          <div className="relative">
                            <button 
                              className="text-gray-400 dark:text-gray-500 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                              onClick={(e) => { e.stopPropagation(); setMobileReviewMenuOpen(mobileReviewMenuOpen === review._id ? null : review._id); }}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {mobileReviewMenuOpen === review._id && (
                              <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
                                <button 
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  onClick={(e) => { e.stopPropagation(); setSelectedReviewId(review._id); setMobileReviewMenuOpen(null); }}
                                >
                                  <Eye className="w-4 h-4" /> View
                                </button>
                                <button 
                                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                                  onClick={(e) => { e.stopPropagation(); setSelectedReviewId(review._id); setMobileReviewMenuOpen(null); }}
                                >
                                  <Edit className="w-4 h-4" /> Edit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{review.comment}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedReviewId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 p-5 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">Review Details</h3>
              <button 
                onClick={() => setSelectedReviewId(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Customer Info */}
            <div className="p-5 border-b border-gray-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Customer Information</h4>
              <div className="flex items-center gap-4">
                <img 
                  src={getUserAvatar(selectedReview.userName)} 
                  alt={selectedReview.userName}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div className="flex-1">
                  <p className="text-base font-bold text-gray-900">{selectedReview.userName}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Mail size={14} />
                    <span>{selectedReview.userEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Review Analysis</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(selectedReview.status)}`}>
                  {selectedReview.status}
                </span>
              </div>
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < selectedReview.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-600">({selectedReview.rating}/5)</span>
              </div>

              {selectedReview.headline && (
                <p className="font-bold text-gray-800 mb-2 text-lg">{selectedReview.headline}</p>
              )}

              <p className="text-gray-600 text-sm leading-relaxed mb-4">{selectedReview.comment}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded">
                  <ShoppingBag size={12} />
                  <span className="font-medium">{getProductName(selectedReview.productId)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>{formatDate(selectedReview.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Shop Owner Reply */}
            {selectedReview.reply ? (
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Your Reply</h4>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedReview.reply}</p>
                  {selectedReview.repliedAt && (
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Sent on {formatDate(selectedReview.repliedAt)}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-5 border-b border-gray-100">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Write a Reply</h4>
                <textarea
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                    placeholder="Write a professional response to the customer..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                    rows={4}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyDraft.trim() || isUpdating}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                >
                    <Send size={16} />
                    Send Reply & Approve Review
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-5 bg-gray-50 rounded-b-2xl flex gap-3">
              {selectedReview.status !== 'approved' && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedReview._id, 'approved');
                    setSelectedReviewId(null);
                  }}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
              )}
              {selectedReview.status !== 'rejected' && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedReview._id, 'rejected');
                    setSelectedReviewId(null);
                  }}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 disabled:opacity-50 transition-all shadow-sm"
                >
                  <XCircle size={18} />
                  Reject
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomersReview;