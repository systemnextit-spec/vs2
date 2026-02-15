import React, { useState, useMemo, useEffect } from 'react';
import { Download, RefreshCw, ChevronDown, TrendingUp, TrendingDown, Plus, Printer, MoreHorizontal, ChevronLeft, ChevronRight, X, Edit2, Trash2, Search, Package, Calendar } from 'lucide-react';

// Import existing sub-components
import AdminNote from '../../pages/AdminNote';
import { ExpenseService, ExpenseDTO, setExpenseTenantId } from '../../services/ExpenseService';
import { IncomeService, IncomeDTO, setIncomeTenantId } from '../../services/IncomeService';
import { CategoryService, CategoryDTO, setCategoryTenantId } from '../../services/CategoryService';
import { dueListService } from '../../services/DueListService';
import { DueEntity, DueTransaction, EntityType, CreateDueTransactionPayload } from '../../types';
import CustomDateRangePicker, { DateRange, QuickSelectOption } from './CustomDateRangePicker';
import AddNewDueModal from '../AddNewDueModal';
import DueHistoryModal from '../DueHistoryModal';

// SVG Assets
const WaterfallIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 22H21" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.59998 18.3999V13.9199" stroke="url(#paint1_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.39996 18.4V10.32" stroke="url(#paint2_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.2 18.4001V13.9201" stroke="url(#paint3_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 18.4V10.32" stroke="url(#paint4_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.59998 9.92L8.63998 6L12.44 9.8L17 4" stroke="url(#paint5_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="paint0_linear" x1="3" y1="22" x2="21" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#1e90ff"/>
      </linearGradient>
      <linearGradient id="paint1_linear" x1="5.59998" y1="13.9199" x2="5.59998" y2="18.3999" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#1e90ff"/>
      </linearGradient>
      <linearGradient id="paint2_linear" x1="9.39996" y1="10.32" x2="9.39996" y2="18.4" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#1e90ff"/>
      </linearGradient>
      <linearGradient id="paint3_linear" x1="13.2" y1="13.9201" x2="13.2" y2="18.4001" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#1e90ff"/>
      </linearGradient>
      <linearGradient id="paint4_linear" x1="17" y1="10.32" x2="17" y2="18.4" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#1e90ff"/>
      </linearGradient>
      <linearGradient id="paint5_linear" x1="5.59998" y1="4" x2="17" y2="4" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8"/><stop offset="1" stopColor="#1e90ff"/>
      </linearGradient>
    </defs>
  </svg>
);

const InvoiceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 6V8.42C22 10 21 11 19.42 11H16V4.01C16 2.9 16.91 2 18.02 2C19.11 2.01 20.11 2.45 20.83 3.17C21.55 3.9 22 4.9 22 6Z" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 7V21C2 21.83 2.94 22.3 3.6 21.8L5.31 20.52C5.71 20.22 6.27 20.26 6.63 20.62L8.29 22.29C8.68 22.68 9.32 22.68 9.71 22.29L11.39 20.61C11.74 20.26 12.3 20.22 12.69 20.52L14.4 21.8C15.06 22.29 16 21.82 16 21V4C16 2.9 16.9 2 18 2H7H6C3 2 2 3.79 2 6V7Z" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 13.01H12" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9.01H12" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.99609 13H6.00508" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5.99609 9H6.00508" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const MoneyReceiveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="black" strokeWidth="1.5"/>
    <text x="12" y="16" textAnchor="middle" fill="black" fontSize="12" fontWeight="bold">৳</text>
    <path d="M15 5L12 2L9 5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 7.67V6.7C7.5 4.45 9.31 2.24 11.56 2.03C14.24 1.77 16.5 3.88 16.5 6.51V7.89" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22H15C19.02 22 19.74 20.39 19.95 18.43L20.7 12.43C20.97 9.99 20.27 8 16 8H8C3.73 8 3.03 9.99 3.3 12.43L4.05 18.43C4.26 20.39 4.98 22 9 22Z" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15.4955 12H15.5045" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.49451 12H8.50349" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BookIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NoteIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2V5" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2V5" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 11H16" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 16H12" stroke="black" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Expense-specific icons
const AddSquareIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 12H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16V8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddSquareSmallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5.33 8H10.67" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10.67V5.33" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 14.67H10C13.33 14.67 14.67 13.33 14.67 10V6C14.67 2.67 13.33 1.33 10 1.33H6C2.67 1.33 1.33 2.67 1.33 6V10C1.33 13.33 2.67 14.67 6 14.67Z" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PrinterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.67 4.67V2.67C4.67 1.93 5.26 1.33 6 1.33H10C10.74 1.33 11.33 1.93 11.33 2.67V4.67" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.67 12H3.33C2.23 12 1.33 11.1 1.33 10V7.33C1.33 6.23 2.23 5.33 3.33 5.33H12.67C13.77 5.33 14.67 6.23 14.67 7.33V10C14.67 11.1 13.77 12 12.67 12H11.33" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 9.33H6C5.26 9.33 4.67 9.93 4.67 10.67V13.33C4.67 14.07 5.26 14.67 6 14.67H10C10.74 14.67 11.33 14.07 11.33 13.33V10.67C11.33 9.93 10.74 9.33 10 9.33Z" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11.33 10H12C12.37 10 12.67 9.7 12.67 9.33V8.67C12.67 8.3 12.37 8 12 8H11.33" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DotsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="5" r="1.5" fill="#1d1a1a"/>
    <circle cx="12" cy="12" r="1.5" fill="#1d1a1a"/>
    <circle cx="12" cy="19" r="1.5" fill="#1d1a1a"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19L8 12L15 5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 5L16 12L9 19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Expense item interface
interface ExpenseItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  status: 'Published' | 'Draft' | 'Trash';
  note?: string;
  imageUrl?: string;
}

// Income item interface
interface IncomeItem {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  status: 'Published' | 'Draft' | 'Trash';
  note?: string;
  imageUrl?: string;
}

// Purchase record interface
interface PurchaseRecord {
  _id: string;
  purchaseNumber: string;
  items: Array<{ productName: string; quantity: number; price: number; total: number; productImage?: string }>;
  totalAmount: number;
  paymentType: 'cash' | 'due';
  supplierName: string;
  mobileNumber: string;
  address: string;
  note: string;
  cashPaid: number;
  dueAmount: number;
  employeeName?: string;
  createdAt: string;
  tenantId: string;
}

interface FigmaBusinessReportProps {
  orders?: any[];
  products?: any[];
  user?: any;
  onLogout?: () => void;
  tenantId?: string;
  initialTab?: string;
}

type TabType = 'profit' | 'expense' | 'income' | 'purchase' | 'due' | 'note';
type DateRangeType = 'day' | 'month' | 'year' | 'all' | 'custom';

const FigmaBusinessReport: React.FC<FigmaBusinessReportProps> = ({
  orders = [],
  products = [],
  user,
  onLogout,
  tenantId,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profit');
  const [dateRange, setDateRange] = useState<DateRangeType>('month');
  const [chartAnimated, setChartAnimated] = useState(false);

  // Chart animation effect - starts flat, then animates to curved
  useEffect(() => {
    const timer = setTimeout(() => setChartAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

  // Helper function to get date range boundaries based on selected range type
  const getDateRangeBoundaries = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    switch (dateRange) {
      case 'day': {
        const start = new Date(today);
        start.setHours(0, 0, 0, 0);
        return { start, end: today };
      }
      case 'month': {
        const start = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const end = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59, 999);
        return { start, end };
      }
      case 'year': {
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        return { start, end };
      }
      case 'custom': {
        return {
          start: customDateRange.startDate || new Date(0),
          end: customDateRange.endDate || today,
        };
      }
      case 'all':
      default:
        return { start: new Date(0), end: today };
    }
  }, [dateRange, customDateRange, selectedMonth]);

  // Filter function for date-based filtering
  const isWithinDateRange = (dateStr: string | Date | undefined): boolean => {
    if (!dateStr) return true;
    const date = new Date(dateStr);
    const { start, end } = getDateRangeBoundaries;
    return date >= start && date <= end;
  };

  // Format current date range for display
  const getDateRangeDisplayText = (): string => {
    const { start, end } = getDateRangeBoundaries;
    const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    if (dateRange === 'day') {
      return formatDate(start);
    } else if (dateRange === 'month') {
      return start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    } else if (dateRange === 'year') {
      return start.getFullYear().toString();
    } else if (dateRange === 'custom' && customDateRange.startDate && customDateRange.endDate) {
      return `${formatDate(customDateRange.startDate)} - ${formatDate(customDateRange.endDate)}`;
    }
    return 'All Time';
  };

  // Expense state management
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<CategoryDTO[]>([]);
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expensePage, setExpensePage] = useState(1);
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>('');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<ExpenseItem>>({ status: 'Published' });
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [expenseDetailsOpen, setExpenseDetailsOpen] = useState<ExpenseItem | null>(null);
  const expensePageSize = 10;

  // Set tenant IDs for services
  useEffect(() => {
    if (tenantId) {
      setExpenseTenantId(tenantId);
      setIncomeTenantId(tenantId);
      setCategoryTenantId(tenantId);
    }
  }, [tenantId]);

  // Preload all data on mount for faster tab switching
  useEffect(() => {
    if (!tenantId) return;
    
    const preloadData = async () => {
      const { start, end } = getDateRangeBoundaries;
      
      // Load expenses in background - use larger page size for summary calculation
      ExpenseService.list({
        page: 1,
        pageSize: 500,
        from: start.toISOString(),
        to: end.toISOString(),
      }).then(res => {
        setExpenses(res.items as any);
      }).catch(console.error);
      
      // Load categories in background
      CategoryService.list().then(res => {
        setExpenseCategories(res.items);
      }).catch(console.error);
      
      // Load incomes in background - use larger page size
      IncomeService.list({
        page: 1,
        pageSize: 500,
        from: start.toISOString(),
        to: end.toISOString(),
      }).then(res => {
        setIncomes(res.items as any);
      }).catch(console.error);
      
      // Load income categories
      IncomeService.listCategories().then(res => {
        setIncomeCategories(res as any);
      }).catch(console.error);
    };
    
    preloadData();
  }, [tenantId, getDateRangeBoundaries]); // Run on mount, tenant change, AND date range change

  // Load expenses when tab is active (for refresh) - only refetch categories, don't replace expense data
  useEffect(() => {
    const loadExpenseCategories = async () => {
      if (activeTab !== 'expense') return;
      if (!tenantId) return;
      
      // Ensure tenant ID is set before API calls
      setExpenseTenantId(tenantId);
      setCategoryTenantId(tenantId);
      
      try {
        // Only load categories if we don't have them yet
        if (expenseCategories.length === 0) {
          const catRes = await CategoryService.list();
          setExpenseCategories(catRes.items);
        }
      } catch (e) {
        console.error('Failed to load expense categories:', e);
      }
    };
    loadExpenseCategories();
  }, [activeTab, tenantId, expenseCategories.length]);

  // Expense calculations
  const expenseStats = useMemo(() => {
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    const uniqueCategories = new Set(expenses.map(e => e.category)).size;
    return {
      totalAmount,
      totalTransactions: expenses.length,
      categories: uniqueCategories > 0 ? uniqueCategories : expenseCategories.length,
    };
  }, [expenses, expenseCategories]);

  const pagedExpenses = useMemo(() => {
    const start = (expensePage - 1) * expensePageSize;
    return expenses.slice(start, start + expensePageSize);
  }, [expenses, expensePage]);

  const totalExpensePages = Math.ceil(expenses.length / expensePageSize) || 1;

  // Income state management
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<CategoryDTO[]>([]);
  const [incomeLoading, setIncomeLoading] = useState(false);
  const [incomePage, setIncomePage] = useState(1);
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<string>('');
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isIncomeCategoryModalOpen, setIsIncomeCategoryModalOpen] = useState(false);
  const [newIncomeCategoryName, setNewIncomeCategoryName] = useState('');
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);
  const [newIncome, setNewIncome] = useState<Partial<IncomeItem>>({ status: 'Published' });
  const [selectedIncomes, setSelectedIncomes] = useState<Set<string>>(new Set());
  const [incomeActionMenuOpen, setIncomeActionMenuOpen] = useState<string | null>(null);
  const incomePageSize = 10;

  // Load income categories when tab is active (for refresh) - don't replace income data
  useEffect(() => {
    const loadIncomeCategories = async () => {
      if (activeTab !== 'income') return;
      if (!tenantId) return;
      try {
        // Only load categories if we don't have them yet
        if (incomeCategories.length === 0) {
          const catRes = await IncomeService.listCategories();
          setIncomeCategories(catRes as any);
        }
      } catch (e) {
        console.error('Failed to load income categories:', e);
      }
    };
    loadIncomeCategories();
  }, [activeTab, tenantId, incomeCategories.length]);

  // Income calculations
  const incomeStats = useMemo(() => {
    const totalAmount = incomes.reduce((sum, i) => sum + i.amount, 0);
    const uniqueCategories = new Set(incomes.map(i => i.category)).size;
    return {
      totalAmount,
      totalTransactions: incomes.length,
      categories: uniqueCategories > 0 ? uniqueCategories : incomeCategories.length,
    };
  }, [incomes, incomeCategories]);

  const totalIncomePages = Math.ceil(incomes.length / incomePageSize) || 1;

  // Purchase state management
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchasePage, setPurchasePage] = useState(1);
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [purchaseSortBy, setPurchaseSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest');
  const [purchaseFilterCategory, setPurchaseFilterCategory] = useState('');
  const [selectedPurchases, setSelectedPurchases] = useState<Set<string>>(new Set());
  const [purchaseActionMenuOpen, setPurchaseActionMenuOpen] = useState<string | null>(null);
  const [isPurchaseCategoryModalOpen, setIsPurchaseCategoryModalOpen] = useState(false);
  const [newPurchaseCategoryName, setNewPurchaseCategoryName] = useState('');
  const purchasePageSize = 10;

  // Load purchases
  useEffect(() => {
    const loadPurchases = async () => {
      if (activeTab !== 'purchase' || !tenantId) return;
      try {
        setPurchaseLoading(true);
        const { start, end } = getDateRangeBoundaries;
        const response = await fetch(`/api/purchases?startDate=${start.toISOString()}&endDate=${end.toISOString()}`, {
          headers: { 'X-Tenant-Id': tenantId },
        });
        if (response.ok) {
          const data = await response.json();
          // Handle both array response and {items: []} response format
          const purchaseList = Array.isArray(data) ? data : (data?.items || data?.purchases || []);
          setPurchases(purchaseList);
        }
      } catch (e) {
        console.error('Failed to load purchases:', e);
      } finally {
        setPurchaseLoading(false);
      }
    };
    loadPurchases();
  }, [activeTab, tenantId, getDateRangeBoundaries]);

  // Purchase calculations - now filtered by date
  const purchaseStats = useMemo(() => {
    const purchaseArray = Array.isArray(purchases) ? purchases : [];
    const filteredByDate = purchaseArray.filter(p => isWithinDateRange(p.createdAt));
    const totalAmount = filteredByDate.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const uniqueSuppliers = new Set(filteredByDate.map(p => p.supplierName)).size;
    return {
      totalAmount,
      totalPurchases: filteredByDate.length,
      categories: uniqueSuppliers,
    };
  }, [purchases, getDateRangeBoundaries]);

  // Filtered and sorted purchases
  const filteredPurchases = useMemo(() => {
    const purchaseArray = Array.isArray(purchases) ? purchases : [];
    let result = [...purchaseArray];
    if (purchaseSearch.trim()) {
      const q = purchaseSearch.toLowerCase();
      result = result.filter(p =>
        p.supplierName?.toLowerCase().includes(q) ||
        p.purchaseNumber?.toLowerCase().includes(q) ||
        p.mobileNumber?.includes(q)
      );
    }
    if (purchaseSortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (purchaseSortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (purchaseSortBy === 'amount') {
      result.sort((a, b) => b.totalAmount - a.totalAmount);
    }
    return result;
  }, [purchases, purchaseSearch, purchaseSortBy]);

  const paginatedPurchases = useMemo(() => {
    const start = (purchasePage - 1) * purchasePageSize;
    return filteredPurchases.slice(start, start + purchasePageSize);
  }, [filteredPurchases, purchasePage]);

  const totalPurchasePages = Math.ceil(filteredPurchases.length / purchasePageSize) || 1;

  // ========== DUE BOOK STATE ==========
  const [dueEntities, setDueEntities] = useState<DueEntity[]>([]);
  const [allDueEntities, setAllDueEntities] = useState<DueEntity[]>([]); // All entities for summary
  const [dueTransactions, setDueTransactions] = useState<DueTransaction[]>([]);
  const [dueLoading, setDueLoading] = useState(false);
  const [dueTabType, setDueTabType] = useState<EntityType>('Customer');
  const [dueSearch, setDueSearch] = useState('');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [showDueHistoryModal, setShowDueHistoryModal] = useState(false);
  const [showAddDueModal, setShowAddDueModal] = useState(false);

  // Set tenant ID on dueListService when available
  useEffect(() => {
    if (tenantId) {
      dueListService.setTenantId(tenantId);
    }
  }, [tenantId]);

  // Load ALL entities for summary calculation on mount (needed for Profit/Loss due graph)
  useEffect(() => {
    if (tenantId) {
      const loadAllEntities = async () => {
        try {
          // Load all entity types for overall summary
          const [customers, suppliers, employees] = await Promise.all([
            dueListService.getEntities('Customer'),
            dueListService.getEntities('Supplier'),
            dueListService.getEntities('Employee')
          ]);
          setAllDueEntities([...customers, ...suppliers, ...employees]);
        } catch (error) {
          console.error('Error loading all entities for summary:', error);
        }
      };
      loadAllEntities();
    }
  }, [tenantId]);

  // Load due entities for the selected tab when tab or dueTabType changes
  useEffect(() => {
    if (activeTab === 'due' && tenantId) {
      const loadDueEntities = async () => {
        setDueLoading(true);
        try {
          const entities = await dueListService.getEntities(dueTabType, dueSearch || undefined);
          setDueEntities(entities);
          // Select first entity by default if none selected
          if (entities.length > 0 && !selectedEntityId) {
            setSelectedEntityId(entities[0]._id || null);
          }
        } catch (error) {
          console.error('Error loading due entities:', error);
          setDueEntities([]);
        } finally {
          setDueLoading(false);
        }
      };
      loadDueEntities();
    }
  }, [activeTab, dueTabType, dueSearch, tenantId]);

  // Load transactions when selected entity changes
  useEffect(() => {
    if (activeTab === 'due' && selectedEntityId && tenantId) {
      const loadTransactions = async () => {
        try {
          const transactions = await dueListService.getTransactions(selectedEntityId);
          setDueTransactions(transactions);
        } catch (error) {
          console.error('Error loading transactions:', error);
          setDueTransactions([]);
        }
      };
      loadTransactions();
    }
  }, [activeTab, selectedEntityId, tenantId]);

  // Due summary calculations - uses ALL entities (not just current tab)
  const dueSummary = useMemo(() => {
    const totalWillGet = allDueEntities.reduce((sum, e) => sum + (e.totalOwedToMe || 0), 0);
    const totalWillGive = allDueEntities.reduce((sum, e) => sum + (e.totalIOweThemNumber || 0), 0);
    return { totalWillGet, totalWillGive };
  }, [allDueEntities]);

  // Get selected entity
  const selectedEntity = useMemo(() => {
    return dueEntities.find(e => e._id === selectedEntityId) || null;
  }, [dueEntities, selectedEntityId]);

  // Filter due transactions by date range
  const filteredDueTransactions = useMemo(() => {
    return dueTransactions.filter(tx => isWithinDateRange(tx.transactionDate));
  }, [dueTransactions, getDateRangeBoundaries]);

  // Calculate due summary from filtered transactions (for date-specific view)
  const filteredDueSummary = useMemo(() => {
    const totalWillGet = filteredDueTransactions
      .filter(tx => tx.direction === 'INCOME')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalWillGive = filteredDueTransactions
      .filter(tx => tx.direction === 'EXPENSE')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { totalWillGet, totalWillGive };
  }, [filteredDueTransactions]);

  // Calculate summary stats - now filtered by date range
  const summary = useMemo(() => {
    // Filter orders by date range
    const filteredOrders = orders.filter(o => isWithinDateRange(o.date || o.createdAt));
    const deliveredOrders = filteredOrders.filter(o => o.status === 'Delivered');
    
    // Product Selling Price (Revenue): Total revenue from delivered sales
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    
    // Purchase Cost (COGS): Calculate from delivered orders' products cost price
    // For each delivered order, sum up the cost price of items sold
    const purchaseCost = deliveredOrders.reduce((sum, order) => {
      // Check if order has items array (multi-item order) or direct productId (single-item order)
      const orderItems = Array.isArray(order.items) && order.items.length > 0 
        ? order.items 
        : [{ productId: order.productId, productName: order.productName, quantity: order.quantity || 1, price: (order.amount || 0) - (order.deliveryCharge || 0) }];
      
      const orderCost = orderItems.reduce((itemSum: number, item: any) => {
        // Find product to get cost price
        const product = products.find((p: any) => 
          String(p.id) === String(item.productId) || 
          p._id === item.productId || 
          p.name === item.productName
        );
        // Use costPrice if available, else estimate as 60% of selling price
        const costPrice = product?.costPrice || (item.price * 0.6);
        return itemSum + (costPrice * (item.quantity || 1));
      }, 0);
      return sum + orderCost;
    }, 0);
    
    // Profit From Sell: Selling Price - Purchase Cost
    const profitFromSell = totalRevenue - purchaseCost;
    
    // Sum incomes - already filtered by date range when loaded
    const totalIncome = incomes.reduce((sum, inc) => sum + (inc.amount || 0), 0);
    
    // Sum expenses - already filtered by date range when loaded
    const totalExpense = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    // Net Profit: (Profit From Sell + Income) - Expense
    const netProfit = profitFromSell + totalIncome - totalExpense;
    
    // Net Profit Percentage (based on revenue) - reusable value
    const netProfitPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;
    const isProfit = netProfit >= 0;
    
    const inventoryValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
    const businessValue = inventoryValue + totalRevenue;
    
    return {
      totalRevenue: totalRevenue,
      purchaseCost: purchaseCost,
      profitFromSell: profitFromSell,
      otherIncome: totalIncome,
      otherExpenses: totalExpense,
      netProfit: netProfit,
      netProfitPercent: netProfitPercent,  // Percentage value (e.g., -12.5 or 25.3)
      isProfit: isProfit,                   // true if profit, false if loss
      businessValue: businessValue,
      ordersCount: filteredOrders.length,
      deliveredCount: deliveredOrders.length,
    };
  }, [orders, products, incomes, expenses, getDateRangeBoundaries]);

  // Due graph percentages - calculated from actual due data
  const dueGraphData = useMemo(() => {
    const totalGet = dueSummary.totalWillGet || 0;
    const totalGive = dueSummary.totalWillGive || 0;
    const total = totalGet + totalGive;
    
    if (total === 0) {
      return { getPercent: 50, givePercent: 50, youWillGet: 0, youWillGive: 0 };
    }
    
    const getPercent = Math.round((totalGet / total) * 100);
    const givePercent = Math.round((totalGive / total) * 100);
    
    return {
      getPercent,
      givePercent,
      youWillGet: totalGet,
      youWillGive: totalGive
    };
  }, [dueSummary]);

  const tabs = [
    { id: 'profit' as TabType, label: 'Profit/Loss', icon: WaterfallIcon, active: true },
    { id: 'expense' as TabType, label: 'Expense', icon: InvoiceIcon },
    { id: 'income' as TabType, label: 'Income', icon: MoneyReceiveIcon },
    { id: 'purchase' as TabType, label: 'Purchase info', icon: ShoppingBagIcon },
    { id: 'due' as TabType, label: 'Due Book', icon: BookIcon },
    { id: 'note' as TabType, label: 'Note', icon: NoteIcon },
  ];

  const dateRangeOptions: { id: DateRangeType; label: string }[] = [
    { id: 'day', label: 'Day' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
    { id: 'all', label: 'All Time' },
    { id: 'custom', label: 'Custom' },
  ];

  const renderProfitLossContent = () => (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Profit/Loss Report Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-bold text-[#023337] tracking-[0.09px] font-['Lato']">
            Profit/Loss Report
          </h2>
          <p className="text-[12px] text-black font-['Poppins']">
            Track your business performance and financial health
          </p>
        </div>
        <button className="bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] flex items-center gap-1 px-4 py-3 rounded-lg">
          <Download size={20} className="text-white" />
          <span className="text-[15px] font-bold text-white tracking-[-0.3px] font-['Lato']">
            Download/Print
          </span>
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-5 px-5 pb-5">
        {/* Left Column: Charts and Financial Details */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Charts Row */}
          <div className="flex flex-col lg:flex-row gap-5">
            {/* Revenue & Costs Chart */}
            <div className="flex-1 bg-white border border-[#f9f9f9] rounded-[10px] p-[10px]">
              <p className="text-[14px] font-medium text-black font-['Poppins'] mb-2">
                Revenue & Costs
              </p>
              <div className="flex gap-3 sm:gap-4 lg:gap-6 mb-3">
                <span className="text-[14px] font-medium text-[#00c80d] font-['Poppins']">Selling Price</span>
                <span className="text-[14px] font-bold text-[#f59f0a] font-['Poppins']">Cost Price</span>
              </div>
              {/* Chart Placeholder */}
              <div className="h-[120px] relative">
                <div className="absolute left-0 top-0 w-[50px] flex flex-col justify-between h-full text-right text-[10px] text-[#131313]/50 font-['Poppins']">
                  <span>$80K</span>
                  <span>$60K</span>
                  <span>$40K</span>
                  <span>$20K</span>
                  <span>$0</span>
                </div>
                <div className="absolute left-[55px] right-0 top-0 bottom-[20px]">
                  {/* Green line (Selling Price) - Animated from flat to curved when data exists */}
                  <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none" className="absolute inset-0">
                    <path 
                      d={(chartAnimated && summary.totalRevenue > 0)
                        ? "M0,80 C50,70 100,50 150,40 C200,30 250,25 300,20 C350,15 400,10 400,10" 
                        : "M0,95 C50,95 100,95 150,95 C200,95 250,95 300,95 C350,95 400,95 400,95"
                      }
                      stroke="#00c80d" strokeWidth="2" fill="none" 
                      style={{ transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                  </svg>
                  {/* Orange line (Cost Price) - Animated from flat to curved when data exists */}
                  <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none" className="absolute inset-0">
                    <path 
                      d={(chartAnimated && summary.purchaseCost > 0)
                        ? "M0,90 C50,85 100,70 150,60 C200,50 250,45 300,35 C350,30 400,25 400,20" 
                        : "M0,95 C50,95 100,95 150,95 C200,95 250,95 300,95 C350,95 400,95 400,95"
                      }
                      stroke="#f59f0a" strokeWidth="2" fill="none" 
                      style={{ transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)', transitionDelay: '0.2s' }}
                    />
                  </svg>
                </div>
                <div className="absolute left-[55px] right-0 bottom-0 flex justify-between text-[10px] text-[#131313]/50 font-['Poppins']">
                  <span>Dec 1</span>
                  <span>Dec 8</span>
                  <span>Dec 15</span>
                  <span>Dec 22</span>
                  <span>Dec 31</span>
                </div>
              </div>
            </div>

            {/* Total Profit Chart */}
            <div className="flex-1 bg-white border border-[#f9f9f9] rounded-[10px] p-[10px]">
              <p className="text-[14px] font-medium text-black font-['Poppins'] mb-2">
                Total Profit
              </p>
              <span className="text-[14px] font-bold bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] bg-clip-text text-transparent font-['Poppins']">
                Profit
              </span>
              {/* Chart Placeholder */}
              <div className="h-[120px] relative mt-3">
                <div className="absolute left-0 top-0 w-[40px] flex flex-col justify-between h-full text-right text-[10px] text-[#131313]/50 font-['Poppins']">
                  <span>$80K</span>
                  <span>$60K</span>
                  <span>$40K</span>
                  <span>$20K</span>
                  <span>$0</span>
                </div>
                <div className="absolute left-[45px] right-0 top-0 bottom-[20px]">
                  {/* Gradient area fill - Animated from flat to curved when data exists */}
                  <svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="none" className="absolute inset-0">
                    <defs>
                      <linearGradient id="profitGradientFigma" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#1e90ff" stopOpacity="0.05"/>
                      </linearGradient>
                      <linearGradient id="profitLineGradientFigma" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8"/>
                        <stop offset="100%" stopColor="#1e90ff"/>
                      </linearGradient>
                    </defs>
                    <path 
                      d={(chartAnimated && summary.profitFromSell > 0)
                        ? "M0,90 C50,85 100,80 150,75 C200,70 250,60 300,50 C350,40 400,25 400,20 L400,100 L0,100 Z" 
                        : "M0,95 C50,95 100,95 150,95 C200,95 250,95 300,95 C350,95 400,95 400,95 L400,100 L0,100 Z"
                      }
                      fill="url(#profitGradientFigma)" 
                      style={{ transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                    <path 
                      d={(chartAnimated && summary.profitFromSell > 0)
                        ? "M0,90 C50,85 100,80 150,75 C200,70 250,60 300,50 C350,40 400,25 400,20" 
                        : "M0,95 C50,95 100,95 150,95 C200,95 250,95 300,95 C350,95 400,95 400,95"
                      }
                      stroke="url(#profitLineGradientFigma)" strokeWidth="3" fill="none" 
                      style={{ transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />
                  </svg>
                </div>
                <div className="absolute left-[45px] right-0 bottom-0 flex justify-between text-[10px] text-[#131313]/50 font-['Poppins']">
                  <span>Dec 1</span>
                  <span>Dec 8</span>
                  <span>Dec 15</span>
                  <span>Dec 22</span>
                  <span>Dec 31</span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="flex flex-col gap-3">
            {/* Product Selling Price, Purchase Cost, Profit From Sell */}
            <div className="bg-[#f9f9f9] rounded-lg py-3 px-4">
              {/* Product Selling Price */}
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-black font-['Lato']">Product Selling Price</span>
                  <span className="text-[10px] text-[#bababa] font-['Poppins']">Total revenue from sales</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[16px] font-semibold text-[#008c09] font-['Lato']">
                    ৳{summary.totalRevenue.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[12px] text-[#a1a1a1] font-['Lato']">See Details &gt;</span>
                </div>
              </div>
              <div className="h-px bg-[#e5e5e5] my-2" />
              
              {/* Purchase Cost */}
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-black font-['Lato']">Purchase Cost</span>
                  <span className="text-[10px] text-[#bababa] font-['Poppins']">Cost of goods sold</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[16px] font-semibold text-[#f59f0a] font-['Lato']">
                    ৳{summary.purchaseCost.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[12px] text-[#a1a1a1] font-['Lato']">See Details &gt;</span>
                </div>
              </div>
              <div className="h-px bg-[#e5e5e5] my-2" />
              
              {/* Profit From Sell */}
              <div className="flex items-center justify-between py-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-black font-['Lato']">Profit From Sell</span>
                  <span className="text-[10px] text-[#bababa] font-['Poppins']">Selling Price - Purchase Cost</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`text-[16px] font-semibold font-['Lato'] ${summary.profitFromSell >= 0 ? 'bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] bg-clip-text text-transparent' : 'text-[#da0000]'}`}>
                    ৳{summary.profitFromSell.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[12px] text-[#a1a1a1] font-['Lato']">See Details &gt;</span>
                </div>
              </div>
            </div>

            {/* Income (+) */}
            <div className="bg-[#f9f9f9] rounded-lg py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-black font-['Lato']">Income</span>
                  <span className="text-[10px] text-[#bababa] font-['Poppins']">Adds to profit (+)</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[16px] font-semibold text-[#008c09] font-['Lato']">
                    ৳{summary.otherIncome.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[12px] text-[#a1a1a1] font-['Lato']">See Details &gt;</span>
                </div>
              </div>
            </div>

            {/* Expense (-) */}
            <div className="bg-[#f9f9f9] rounded-lg py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-black font-['Lato']">Expense</span>
                  <span className="text-[10px] text-[#bababa] font-['Poppins']">Subtracts from profit (-)</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[16px] font-semibold text-[#da0000] font-['Lato']">
                    ৳{summary.otherExpenses.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[12px] text-[#a1a1a1] font-['Lato']">See Details &gt;</span>
                </div>
              </div>
            </div>

            {/* Net Profit (highlighted) */}
            <div className="bg-[#f9f9f9] border border-[#38bdf8] rounded-lg py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-black font-['Lato']">Net Profit</span>
                  <span className="text-[10px] text-[#bababa] font-['Poppins']">Profit + Income - Expense</span>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1">
                    {summary.isProfit ? (
                      <TrendingUp size={18} className="text-[#21c45d]" />
                    ) : (
                      <TrendingDown size={18} className="text-[#da0000]" />
                    )}
                    <span className={`text-[16px] font-semibold font-['Lato'] ${summary.isProfit ? 'text-[#21c45d]' : 'text-[#da0000]'}`}>
                      ৳{Math.abs(summary.netProfit).toLocaleString('en-IN')}
                    </span>
                    <span className={`text-[12px] font-medium font-['Lato'] ${summary.isProfit ? 'text-[#21c45d]' : 'text-[#da0000]'}`}>
                      ({summary.netProfitPercent.toFixed(1)}%)
                    </span>
                  </div>
                  <span className="text-[12px] text-[#a1a1a1] font-['Lato']">See Details &gt;</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Business Value & Due Graph */}
        <div className="xl:w-[316px] flex flex-col gap-5">
          {/* Business Value Card */}
          <div className="bg-[#f9f9f9] rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium text-black font-['Lato']">Business Value</span>
                <span className="text-[10px] text-[#bababa] font-['Poppins']">Including Dues and Inventory Value</span>
              </div>
              <div className="flex items-center">
                {summary.isProfit ? (
                  <TrendingUp size={16} className="text-[#21c45d]" />
                ) : (
                  <TrendingDown size={16} className="text-[#da0000]" />
                )}
                
                <span className={`text-[14px] font-medium font-['Lato'] ml-0.5 ${summary.isProfit ? 'text-[#21c45d]' : 'text-[#da0000]'}`}>
                  {summary.netProfitPercent.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg px-2 py-3 mt-2">
              <span className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-semibold text-[#085e00] font-['Lato']">
                ৳{summary.businessValue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Due Graph Card */}
          <div style={{
            background: 'white',
            border: '1px solid #eee',
            borderRadius: '10px',
            padding: '10px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <p style={{
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontSize: '14px',
              color: '#777',
              margin: 0,
            }}>Due graph</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', width: '100%' }}>
              {/* Legend Row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#E31B23' }} />
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '12px', color: '#131313', fontWeight: 400 }}>You will Give</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '12px', color: '#131313', fontWeight: 400 }}>You will Get</span>
                  <div style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#00A651' }} />
                </div>
              </div>

              {/* Semi-circle Gauge */}
              <div style={{ position: 'relative', width: '260px', height: '130px' }}>
                <svg width="260" height="130" viewBox="0 0 260 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    {/* Green gradient - from right to left */}
                    <linearGradient id="paint0_linear_green" x1="260" y1="65" x2="0" y2="65" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3AA600"/>
                      <stop offset="1" stopColor="#00E82A"/>
                    </linearGradient>
                    {/* Red gradient - for the Give portion */}
                    <linearGradient id="paint0_linear_red" x1="0" y1="0" x2="85" y2="130" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#E31B23"/>
                      <stop offset="1" stopColor="#8B0000"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Green arc (You will Get) - Full semi-circle */}
                  <path 
                    d="M9.15527e-05 130C9.30452e-05 112.928 3.36263 96.0235 9.89574 80.2511C16.4289 64.4788 26.0046 50.1477 38.0762 38.0761C50.1478 26.0045 64.4789 16.4288 80.2512 9.89569C96.0236 3.36258 112.928 4.74315e-05 130 4.96702e-05C147.072 5.19089e-05 163.977 3.36259 179.749 9.8957C195.521 16.4288 209.852 26.0045 221.924 38.0762C233.996 50.1478 243.571 64.4789 250.104 80.2512C256.637 96.0235 260 112.928 260 130L208.165 130C208.165 119.735 206.143 109.571 202.215 100.088C198.287 90.6043 192.529 81.9875 185.271 74.7292C178.013 67.471 169.396 61.7134 159.912 57.7853C150.429 53.8571 140.265 51.8354 130 51.8354C119.735 51.8354 109.571 53.8571 100.088 57.7853C90.6044 61.7134 81.9876 67.471 74.7293 74.7292C67.471 81.9875 61.7135 90.6043 57.7853 100.088C53.8572 109.571 51.8354 119.735 51.8354 130L9.15527e-05 130Z" 
                    fill="url(#paint0_linear_green)"
                  />
                  
                  {/* Red arc (You will Give) - Left portion based on givePercent */}
                  {dueGraphData.givePercent >= 50 ? (
                    // More than half - show larger red arc
                    <path 
                      d="M0 130C0 112.928 3.36254 96.0235 9.89565 80.2511C16.4288 64.4788 26.0045 50.1477 38.0761 38.0761C50.1477 26.0045 64.4788 16.4288 80.2511 9.89569C96.0235 3.36258 112.928 0 130 0L130 51.8354C119.735 51.8354 109.571 53.8571 100.088 57.7853C90.6043 61.7134 81.9875 67.471 74.7292 74.7292C67.471 81.9875 61.7134 90.6043 57.7853 100.088C53.8571 109.571 51.8354 119.735 51.8354 130L0 130Z" 
                      fill="url(#paint0_linear_red)"
                    />
                  ) : dueGraphData.givePercent >= 30 ? (
                    // Around 30-50% - medium red arc
                    <path 
                      d="M0 130C0 112.928 3.36254 96.0235 9.89565 80.2511C16.4288 64.4788 26.0045 50.1477 38.0761 38.0761C50.1477 26.0045 64.4788 16.4288 80.2511 9.89569L100.088 57.7853C90.6043 61.7134 81.9875 67.471 74.7292 74.7292C67.471 81.9875 61.7134 90.6043 57.7853 100.088C53.8571 109.571 51.8354 119.735 51.8354 130L0 130Z" 
                      fill="url(#paint0_linear_red)"
                    />
                  ) : dueGraphData.givePercent > 0 ? (
                    // Less than 30% - small red arc
                    <path 
                      d="M0 130C0 112.928 3.36254 96.0235 9.89565 80.2511C16.4288 64.4788 26.0045 50.1477 38.0761 38.0761L74.7292 74.7292C67.471 81.9875 61.7134 90.6043 57.7853 100.088C53.8571 109.571 51.8354 119.735 51.8354 130L0 130Z" 
                      fill="url(#paint0_linear_red)"
                    />
                  ) : null}
                  
                  {/* Percentage labels */}
                  {dueGraphData.givePercent > 5 && (
                    <text x="25" y="90" fill="white" fontSize="11" fontFamily="Lato, sans-serif" fontWeight="500">{dueGraphData.givePercent}%</text>
                  )}
                  {dueGraphData.getPercent > 5 && (
                    <text x="200" y="50" fill="white" fontSize="11" fontFamily="Lato, sans-serif" fontWeight="500">{dueGraphData.getPercent}%</text>
                  )}
                </svg>
              </div>
            </div>

            {/* Values Row */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              display: 'flex',
              gap: '138px',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start', width: '61px' }}>
                <span style={{ fontFamily: "'Lato', sans-serif", fontSize: '10px', color: '#131313', fontWeight: 400 }}>You will Give</span>
                <span style={{ fontFamily: "'Lato', 'Noto Sans Bengali', sans-serif", fontSize: '16px', fontWeight: 700, color: '#da0000' }}>
                  ৳{dueGraphData.youWillGive.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end', justifyContent: 'center', width: '61px' }}>
                <span style={{ fontFamily: "'Lato', sans-serif", fontSize: '10px', color: '#131313', fontWeight: 400 }}>You will Get</span>
                <span style={{ fontFamily: "'Lato', 'Noto Sans Bengali', sans-serif", fontSize: '16px', fontWeight: 700, color: '#008c09' }}>
                  ৳{dueGraphData.youWillGet.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Expense handlers
  const handleAddExpense = async () => {
    // Validate required fields
    if (!newExpense.name || !newExpense.category || !newExpense.amount || !newExpense.date) {
      const missing = [];
      if (!newExpense.name) missing.push('Name');
      if (!newExpense.category) missing.push('Category');
      if (!newExpense.amount) missing.push('Amount');
      if (!newExpense.date) missing.push('Date');
      alert(`Please fill in required fields: ${missing.join(', ')}`);
      return;
    }
    
    // Ensure tenant ID is set before API call
    if (tenantId) {
      setExpenseTenantId(tenantId);
    }
    
    const payload: ExpenseDTO = {
      name: newExpense.name!,
      category: newExpense.category!,
      amount: Number(newExpense.amount!),
      date: newExpense.date!,
      status: (newExpense.status as any) || 'Published',
      note: newExpense.note,
      imageUrl: newExpense.imageUrl,
    };
    
    console.log('Saving expense:', payload);
    
    try {
      if (editingExpenseId) {
        const updated = await ExpenseService.update(editingExpenseId, payload);
        console.log('Updated expense:', updated);
        setExpenses(prev => prev.map(item => item.id === editingExpenseId ? { ...(updated as any), id: updated.id || editingExpenseId } : item));
      } else {
        const created = await ExpenseService.create(payload);
        console.log('Created expense:', created);
        setExpenses(prev => [{ ...(created as any), id: created.id || Math.random().toString(36).slice(2) }, ...prev]);
      }
      setIsAddExpenseOpen(false);
      setNewExpense({ status: 'Published' });
      setEditingExpenseId(null);
      setIsCategoryDropdownOpen(false);
    } catch (e) {
      console.error('Failed to save expense:', e);
      alert('Failed to save expense. Please try again.');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await ExpenseService.remove(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
    setActionMenuOpen(null);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Please enter a category name');
      return;
    }
    
    // Ensure tenant ID is set before API call
    const effectiveTenantId = tenantId || localStorage.getItem('tenantId') || '';
    if (!effectiveTenantId) {
      console.error('No tenant ID available for category creation');
      alert('Error: No tenant ID available. Please refresh the page and try again.');
      return;
    }
    setCategoryTenantId(effectiveTenantId);
    
    try {
      console.log('Creating category:', newCategoryName, 'for tenant:', effectiveTenantId);
      const created = await CategoryService.create({ name: newCategoryName });
      console.log('Category created:', created);
      setExpenseCategories(prev => [...prev, created]);
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } catch (e: any) {
      console.error('Failed to add category:', e);
      alert('Failed to add category: ' + (e?.message || e?.response?.data?.error || 'Unknown error'));
    }
  };

  const toggleExpenseSelection = (id: string) => {
    setSelectedExpenses(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDeleteExpenses = async () => {
    if (!window.confirm(`Delete ${selectedExpenses.size} selected expenses? This action cannot be undone.`)) {
      return;
    }
    
    // Ensure tenant ID is set
    if (tenantId) {
      setExpenseTenantId(tenantId);
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const id of selectedExpenses) {
      try {
        await ExpenseService.remove(id);
        successCount++;
      } catch (e) {
        console.error(`Failed to delete expense ${id}:`, e);
        failCount++;
      }
    }
    
    // Update local state - remove all deleted expenses
    setExpenses(prev => prev.filter(e => !selectedExpenses.has(e.id)));
    setSelectedExpenses(new Set());
    
    if (successCount > 0) {
      alert(`${successCount} expense(s) deleted successfully${failCount > 0 ? `, ${failCount} failed` : ''}`);
    } else if (failCount > 0) {
      alert(`Failed to delete ${failCount} expense(s)`);
    }
  };

  const handlePrintExpenses = () => {
    const doc = window.open('', '_blank');
    if (!doc) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expense Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #38bdf8; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #023337; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: linear-gradient(to right, #38bdf8, #1e90ff); color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          .amount { color: #da0000; font-weight: bold; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; }
        </style>
      </head>
      <body>
        <div class="header"><div class="title">Expense Report</div></div>
        <div className="overflow-x-auto">
        <table>
          <thead><tr><th>SL</th><th>Name</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            ${expenses.map((e, i) => `
              <tr>
                <td>${expenses.length - i}</td>
                <td>${e.name}</td>
                <td>${e.category}</td>
                <td class="amount">৳${e.amount.toLocaleString('en-IN')}</td>
                <td>${new Date(e.date).toLocaleDateString('en-GB')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">Total: ৳${expenseStats.totalAmount.toLocaleString('en-IN')}</div>
      </body>
      </html>
    `;
    doc.document.write(htmlContent);
    doc.document.close();
    doc.print();
  };

  // Income handlers
  const handleAddIncome = async () => {
    if (!newIncome.name || !newIncome.category || !newIncome.amount || !newIncome.date) return;
    const payload: IncomeDTO = {
      name: newIncome.name!,
      category: newIncome.category!,
      amount: Number(newIncome.amount!),
      date: newIncome.date!,
      status: (newIncome.status as any) || 'Published',
      note: newIncome.note,
      imageUrl: newIncome.imageUrl,
    };
    try {
      if (editingIncomeId) {
        const updated = await IncomeService.update(editingIncomeId, payload);
        setIncomes(prev => prev.map(item => item.id === editingIncomeId ? { ...(updated as any), id: updated.id || editingIncomeId } : item));
      } else {
        const created = await IncomeService.create(payload);
        setIncomes(prev => [{ ...(created as any), id: created.id || Math.random().toString(36).slice(2) }, ...prev]);
      }
    } catch (e) {
      // Fallback to local update
      if (editingIncomeId) {
        setIncomes(prev => prev.map(item => item.id === editingIncomeId ? (newIncome as IncomeItem) : item));
      } else {
        const fallback = { id: Math.random().toString(36).slice(2), ...(payload as any) } as IncomeItem;
        setIncomes(prev => [fallback, ...prev]);
      }
    }
    setIsAddIncomeOpen(false);
    setNewIncome({ status: 'Published' });
    setEditingIncomeId(null);
  };

  const handleDeleteIncome = async (id: string) => {
    if (!window.confirm('Delete this income?')) return;
    try {
      await IncomeService.remove(id);
      setIncomes(prev => prev.filter(i => i.id !== id));
    } catch (e) {
      setIncomes(prev => prev.filter(i => i.id !== id));
    }
    setIncomeActionMenuOpen(null);
  };

  const handleAddIncomeCategory = async () => {
    if (!newIncomeCategoryName.trim()) return;
    try {
      const created = await IncomeService.createCategory(newIncomeCategoryName);
      setIncomeCategories(prev => [...prev, created as any]);
      setNewIncomeCategoryName('');
      setIsIncomeCategoryModalOpen(false);
    } catch (e) {
      alert('Failed to add category');
    }
  };

  const toggleIncomeSelection = (id: string) => {
    setSelectedIncomes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDeleteIncomes = async () => {
    if (!window.confirm(`Delete ${selectedIncomes.size} selected incomes? This action cannot be undone.`)) {
      return;
    }
    
    // Ensure tenant ID is set
    if (tenantId) {
      setIncomeTenantId(tenantId);
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const id of selectedIncomes) {
      try {
        await IncomeService.remove(id);
        successCount++;
      } catch (e) {
        console.error(`Failed to delete income ${id}:`, e);
        failCount++;
      }
    }
    
    // Update local state - remove all deleted incomes
    setIncomes(prev => prev.filter(i => !selectedIncomes.has(i.id)));
    setSelectedIncomes(new Set());
    
    if (successCount > 0) {
      alert(`${successCount} income(s) deleted successfully${failCount > 0 ? `, ${failCount} failed` : ''}`);
    } else if (failCount > 0) {
      alert(`Failed to delete ${failCount} income(s)`);
    }
  };

  const handlePrintIncomes = () => {
    const doc = window.open('', '_blank');
    if (!doc) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Income Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #38bdf8; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #023337; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: linear-gradient(to right, #38bdf8, #1e90ff); color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          .amount { color: #008c09; font-weight: bold; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; color: #008c09; }
        </style>
      </head>
      <body>
        <div class="header"><div class="title">Income Report</div></div>
        <div className="overflow-x-auto">
        <table>
          <thead><tr><th>SL</th><th>Name</th><th>Category</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            ${incomes.map((i, idx) => `
              <tr>
                <td>${incomes.length - idx}</td>
                <td>${i.name}</td>
                <td>${i.category}</td>
                <td class="amount">৳${i.amount.toLocaleString('en-IN')}</td>
                <td>${new Date(i.date).toLocaleDateString('en-GB')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">Total: ৳${incomeStats.totalAmount.toLocaleString('en-IN')}</div>
      </body>
      </html>
    `;
    doc.document.write(htmlContent);
    doc.document.close();
    doc.print();
  };

  const renderIncomeContent = () => (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Income Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-3 sm:px-5 pt-3 pb-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-bold text-[#023337] tracking-[0.09px] font-['Lato']">
            Income
          </h2>
          <p className="text-[12px] text-black font-['Poppins']">
            Track your other income sources
          </p>
        </div>
        <button
          onClick={() => { setNewIncome({ status: 'Published' }); setEditingIncomeId(null); setIsAddIncomeOpen(true); }}
          className="bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] flex items-center gap-1 h-[48px] pl-3 pr-4 py-[6px] rounded-lg"
        >
          <AddSquareIcon />
          <span className="text-[15px] font-bold text-white tracking-[-0.3px] font-['Lato']">
            Add Income
          </span>
        </button>
      </div>

      {/* Summary Cards Row */}
      <div className="flex flex-wrap gap-3 sm:gap-4 px-3 sm:px-5 mt-4">
        {/* Total Income Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[80px] sm:h-[100px] w-full sm:w-[396px] overflow-hidden px-[18px] py-5">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#008c09] tracking-[0.16px] font-['Lato']">
            ৳{incomeStats.totalAmount.toLocaleString('en-IN')}.00
          </p>
          <p className="text-[12px] text-black font-['Poppins'] mt-2">
            Total income
          </p>
        </div>

        {/* Total Transactions Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[80px] sm:h-[100px] w-[calc(50%-6px)] sm:w-[148px] overflow-hidden px-[18px] py-5">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#022f37] tracking-[0.16px] font-['Lato']">
            {incomeStats.totalTransactions}
          </p>
          <p className="text-[12px] text-black font-['Poppins'] mt-2">
            Total Transactions
          </p>
        </div>

        {/* Categories Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[80px] sm:h-[100px] w-[calc(50%-6px)] sm:w-[148px] overflow-hidden px-[18px] py-5">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#022f37] tracking-[0.16px] font-['Lato']">
            {incomeStats.categories}
          </p>
          <p className="text-[12px] text-black font-['Poppins'] mt-2">
            Categories
          </p>
        </div>

        {/* Actions Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[100px] w-full sm:flex-1 overflow-hidden px-[18px] py-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-black font-['Poppins']">Actions</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsIncomeCategoryModalOpen(true)}
                className="bg-white flex items-center gap-1 px-[6px] py-[6px] rounded"
              >
                <AddSquareSmallIcon />
                <span className="text-[12px] text-black font-['Poppins']">Add Category</span>
              </button>
              <button
                onClick={handlePrintIncomes}
                className="bg-white flex items-center gap-1 px-[6px] py-[6px] rounded"
              >
                <PrinterIcon />
                <span className="text-[12px] text-black font-['Poppins']">Print</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-[7px] mt-3">
            <span className="text-[12px] text-black font-['Poppins']">Filter by:</span>
            <div className="bg-white flex-1 flex items-center justify-between px-3 py-[11px] rounded">
              <select
                value={selectedIncomeCategory}
                onChange={(e) => setSelectedIncomeCategory(e.target.value)}
                className="text-[12px] text-black font-['Poppins'] bg-transparent border-none outline-none flex-1 cursor-pointer"
              >
                <option value="">All Categories</option>
                {incomeCategories.map(cat => (
                  <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Income Table */}
      <div className="mt-4 px-2 sm:px-5 overflow-x-auto">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-[#38bdf8]/10 to-[#1e90ff]/10 h-[48px] flex items-center rounded-t-lg min-w-[700px]">
          <div className="w-[60px] text-center">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-[#eaf8e7] accent-[#38bdf8]"
              checked={selectedIncomes.size === incomes.length && incomes.length > 0}
              onChange={() => {
                if (selectedIncomes.size === incomes.length) {
                  setSelectedIncomes(new Set());
                } else {
                  setSelectedIncomes(new Set(incomes.map(i => i.id)));
                }
              }}
            />
          </div>

          {/* Bulk Actions Bar */}
          {selectedIncomes.size > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-[12px] text-blue-700 font-medium">{selectedIncomes.size} selected</span>
              <button
                onClick={handleBulkDeleteIncomes}
                className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-[12px] font-medium hover:bg-red-600"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                onClick={() => setSelectedIncomes(new Set())}
                className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-[12px] font-medium hover:bg-gray-300"
              >
                <X size={14} />
                Clear
              </button>
            </div>
          )}

          <div className={`w-[80px] ${selectedIncomes.size === 0 ? '' : 'ml-auto'}`}><p className="text-[16px] font-medium text-black font-['Poppins']">SL</p></div>
          <div className="flex-1"><p className="text-[16px] font-medium text-black font-['Poppins']">Name</p></div>
          <div className="w-[150px]"><p className="text-[16px] font-medium text-black font-['Poppins']">Category</p></div>
          <div className="w-[120px] text-center"><p className="text-[16px] font-medium text-black font-['Poppins']">Amount</p></div>
          <div className="w-[120px]"><p className="text-[16px] font-medium text-black font-['Poppins']">Date</p></div>
          <div className="w-[80px] text-center"><p className="text-[16px] font-medium text-black font-['Poppins']">Action</p></div>
        </div>

        {/* Table Rows */}
        {incomeLoading && incomes.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="animate-spin text-[#38bdf8]" size={24} />
          </div>
        ) : incomes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <MoneyReceiveIcon />
            <p className="mt-4 text-[14px]">No income found. Click "Add Income" to create one.</p>
          </div>
        ) : (
          incomes.map((income, index) => (
            <div
              key={income.id || `income-${index}`}
              className="h-[68px] flex items-center border-b border- min-w-[700px] [#b9b9b9]/50 hover:bg-gray-50"
            >
              <div className="w-[60px] text-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-[#eaf8e7] accent-[#38bdf8]"
                  checked={selectedIncomes.has(income.id)}
                  onChange={() => toggleIncomeSelection(income.id)}
                />
              </div>
              <div className="w-[80px]">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">{incomes.length - index}</p>
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">{income.name}</p>
              </div>
              <div className="w-[150px]">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">{income.category}</p>
              </div>
              <div className="w-[120px] text-center">
                <p className="text-[12px] text-[#008c09] font-['Poppins']">৳{income.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-[120px]">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">
                  {new Date(income.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                </p>
              </div>
              <div className="w-[80px] flex justify-center relative">
                <button
                  onClick={() => {
                    const menuId = income.id || `income-${index}`;
                    setIncomeActionMenuOpen(incomeActionMenuOpen === menuId ? null : menuId);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <DotsIcon />
                </button>
                {incomeActionMenuOpen === (income.id || `income-${index}`) && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        setNewIncome(income);
                        setEditingIncomeId(income.id);
                        setIsAddIncomeOpen(true);
                        setIncomeActionMenuOpen(null);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-gray-700 hover:bg-gray-50"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteIncome(income.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 hover:bg-gray-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {incomes.length > 0 && (
        <div className="flex items-center justify-center gap-[279px] py-5">
          <button
            onClick={() => setIncomePage(p => Math.max(1, p - 1))}
            disabled={incomePage === 1}
            className="bg-white flex items-center gap-1 h-[42px] pl-2 pr-3 py-[10px] rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
          >
            <ArrowLeftIcon />
            <span className="text-[15px] font-medium text-black font-['Lato']">Previous</span>
          </button>

          <div className="flex items-center gap-3">
            {Array.from({ length: Math.min(5, totalIncomePages) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setIncomePage(page)}
                className={`w-9 h-9 flex items-center justify-center rounded ${
                  incomePage === page
                    ? 'bg-[#dff5ff] text-[#1e90ff]'
                    : 'border border-[#d1d5db] text-[#023337]'
                } text-[15px] font-medium font-['Lato']`}
              >
                {page}
              </button>
            ))}
            {totalIncomePages > 5 && (
              <>
                <button className="w-9 h-9 flex items-center justify-center border border-[#d1d5db] rounded text-[15px] font-bold text-[#023337] font-['Lato']">
                  .....
                </button>
                <button
                  onClick={() => setIncomePage(totalIncomePages)}
                  className="w-9 h-9 flex items-center justify-center border border-[#d1d5db] rounded text-[15px] font-medium text-[#023337] font-['Lato']"
                >
                  {totalIncomePages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setIncomePage(p => Math.min(totalIncomePages, p + 1))}
            disabled={incomePage === totalIncomePages}
            className="bg-white flex items-center gap-1 h-[42px] pl-3 pr-2 py-[10px] rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
          >
            <span className="text-[15px] font-medium text-black font-['Lato']">Next</span>
            <ArrowRightIcon />
          </button>
        </div>
      )}

      {/* Add/Edit Income Modal */}
      {isAddIncomeOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[8px] p-5 w-full max-w-[548px] overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
              <h3 className="text-[16px] font-semibold text-black font-['Poppins']">
                {editingIncomeId ? 'Edit Income' : 'Add Income'}
              </h3>
              <button onClick={() => { setIsAddIncomeOpen(false); setEditingIncomeId(null); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Income Name */}
              <div className="flex flex-col gap-3">
                <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                  Income Name<span className="text-[#da0000]">*</span>
                </label>
                <input
                  type="text"
                  value={newIncome.name || ''}
                  onChange={(e) => setNewIncome(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-[48px] px-3 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[15px] text-[#023337] font-['Lato'] placeholder:text-[#aeaeae] outline-none focus:border-[#38bdf8]"
                  placeholder="Enter income name"
                />
              </div>

              {/* Category */}
              <div className="flex flex-col gap-3">
                <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                  Category<span className="text-[#da0000]">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newIncome.category || ''}
                    onChange={(e) => setNewIncome(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full h-[48px] px-3 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[15px] text-[#023337] font-['Lato'] appearance-none cursor-pointer outline-none focus:border-[#38bdf8]"
                  >
                    <option value="" className="text-[#aeaeae]">Select Category</option>
                    {incomeCategories.map(cat => (
                      <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#023337] pointer-events-none" />
                </div>
              </div>

              {/* Amount and Date Row */}
              <div className="flex gap-4">
                {/* Amount */}
                <div className="flex-1 flex flex-col gap-3">
                  <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                    Amount<span className="text-[#da0000]">*</span>
                  </label>
                  <input
                    type="number"
                    value={newIncome.amount || ''}
                    onChange={(e) => setNewIncome(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full h-[48px] px-3 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[15px] text-[#023337] font-['Lato'] placeholder:text-[#aeaeae] outline-none focus:border-[#38bdf8]"
                    placeholder="0.00"
                  />
                </div>

                {/* Date */}
                <div className="flex-1 flex flex-col gap-3">
                  <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                    Date<span className="text-[#da0000]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newIncome.date || ''}
                      onChange={(e) => setNewIncome(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full h-[48px] px-3 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[15px] text-[#023337] font-['Lato'] placeholder:text-[#aeaeae] outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="flex flex-col gap-3">
                <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                  Image Upload
                </label>
                <div 
                  className="w-full h-[153px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[#38bdf8] transition-colors"
                  onClick={() => document.getElementById('income-image-upload')?.click()}
                >
                  {newIncome.imageUrl ? (
                    <div className="relative w-full h-full p-2">
                      <img 
                        src={newIncome.imageUrl} 
                        alt="Income" 
                        className="w-full h-full object-contain rounded"
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setNewIncome(prev => ({ ...prev, imageUrl: undefined })); }}
                        className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-[15px] text-[#aeaeae] font-['Lato']">Upload Doc</p>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aeaeae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </>
                  )}
                </div>
                <input
                  id="income-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewIncome(prev => ({ ...prev, imageUrl: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              {/* Note */}
              <div className="flex flex-col gap-3">
                <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                  Note
                </label>
                <input
                  type="text"
                  value={newIncome.note || ''}
                  onChange={(e) => setNewIncome(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full h-[48px] px-3 py-[10px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[15px] text-[#023337] font-['Lato'] placeholder:text-[#aeaeae] outline-none focus:border-[#38bdf8]"
                  placeholder="Add any notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-2">
                <button
                  onClick={() => { setIsAddIncomeOpen(false); setEditingIncomeId(null); }}
                  className="h-[40px] px-4 py-2 bg-white border border-[#e5e7eb] rounded-[8px] text-[15px] font-bold text-[#023337] font-['Lato'] tracking-[-0.3px] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddIncome}
                  className="h-[40px] px-4 py-2 bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] rounded-[8px] text-[15px] font-bold text-white font-['Lato'] tracking-[-0.3px] hover:opacity-90"
                >
                  {editingIncomeId ? 'Update Income' : 'Save Income'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Income Category Modal */}
      {isIncomeCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-[#023337] font-['Lato']">Add Category</h3>
              <button onClick={() => setIsIncomeCategoryModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={newIncomeCategoryName}
                onChange={(e) => setNewIncomeCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] font-['Poppins']"
                placeholder="Enter category name"
              />
              <button
                onClick={handleAddIncomeCategory}
                className="bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] text-white py-3 rounded-lg text-[15px] font-bold font-['Lato']"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Purchase handlers
  const togglePurchaseSelection = (id: string) => {
    setSelectedPurchases(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDeletePurchases = async () => {
    if (!window.confirm(`Delete ${selectedPurchases.size} selected purchases? This action cannot be undone.`)) {
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const id of selectedPurchases) {
      try {
        await fetch(`/api/purchases/${id}`, {
          method: 'DELETE',
          headers: { 'X-Tenant-Id': tenantId || '' },
        });
        successCount++;
      } catch (e) {
        console.error(`Failed to delete purchase ${id}:`, e);
        failCount++;
      }
    }
    
    // Update local state - remove all deleted purchases
    setPurchases(prev => prev.filter(p => !selectedPurchases.has(p._id)));
    setSelectedPurchases(new Set());
    
    if (successCount > 0) {
      alert(`${successCount} purchase(s) deleted successfully${failCount > 0 ? `, ${failCount} failed` : ''}`);
    } else if (failCount > 0) {
      alert(`Failed to delete ${failCount} purchase(s)`);
    }
  };

  const handleDeletePurchase = async (id: string) => {
    if (!window.confirm('Delete this purchase?')) return;
    try {
      await fetch(`/api/purchases/${id}`, {
        method: 'DELETE',
        headers: { 'X-Tenant-Id': tenantId || '' },
      });
      setPurchases(prev => prev.filter(p => p._id !== id));
    } catch (e) {
      console.error('Failed to delete purchase:', e);
    }
    setPurchaseActionMenuOpen(null);
  };

  const handleAddPurchaseCategory = async () => {
    if (!newPurchaseCategoryName.trim()) return;
    try {
      await CategoryService.create({ name: newPurchaseCategoryName });
      setNewPurchaseCategoryName('');
      setIsPurchaseCategoryModalOpen(false);
    } catch (e) {
      alert('Failed to add category');
    }
  };

  const handlePrintPurchases = () => {
    const doc = window.open('', '_blank');
    if (!doc) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Purchase Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #38bdf8; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #023337; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: linear-gradient(to right, #38bdf8, #1e90ff); color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          .amount { color: #da3e00; font-weight: bold; }
          .total { font-size: 18px; font-weight: bold; margin-top: 20px; text-align: right; color: #da3e00; }
        </style>
      </head>
      <body>
        <div class="header"><div class="title">Purchase Report</div></div>
        <div className="overflow-x-auto">
        <table>
          <thead><tr><th>SL</th><th>Supplier</th><th>Number</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            ${filteredPurchases.map((p, idx) => `
              <tr>
                <td>${filteredPurchases.length - idx}</td>
                <td>${p.supplierName || 'N/A'}</td>
                <td>${p.mobileNumber || '-'}</td>
                <td class="amount">৳${p.totalAmount?.toLocaleString('en-IN') || 0}</td>
                <td>${new Date(p.createdAt).toLocaleDateString('en-GB')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">Total: ৳${purchaseStats.totalAmount.toLocaleString('en-IN')}</div>
      </body>
      </html>
    `;
    doc.document.write(htmlContent);
    doc.document.close();
    doc.print();
  };

  // ========== DUE BOOK HANDLERS ==========
  const handlePrintDueList = () => {
    const doc = window.open('', '_blank');
    if (!doc) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Due List - ${dueTabType}s</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #38bdf8; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #023337; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: linear-gradient(to right, #38bdf8, #1e90ff); color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #eee; }
          .get { color: #008c09; font-weight: bold; }
          .give { color: #da0000; font-weight: bold; }
          .summary { display: flex; gap: 30px; margin-bottom: 20px; }
          .summary-card { padding: 15px; border-radius: 8px; }
          .summary-get { background: #e6f8e6; }
          .summary-give { background: #ffe6e6; }
        </style>
      </head>
      <body>
        <div class="header"><div class="title">Due List - ${dueTabType}s</div></div>
        <div class="summary">
          <div class="summary-card summary-get">
            <div style="font-size:14px;">You will Get</div>
            <div class="get" style="font-size:20px;">৳${dueSummary.totalWillGet.toLocaleString('en-IN')}</div>
          </div>
          <div class="summary-card summary-give">
            <div style="font-size:14px;">You will Give</div>
            <div class="give" style="font-size:20px;">৳${dueSummary.totalWillGive.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="overflow-x-auto">
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Will Get</th><th>Will Give</th></tr></thead>
          <tbody>
            ${dueEntities.map((e) => `
              <tr>
                <td>${e.name}</td>
                <td>${e.phone || '-'}</td>
                <td class="get">৳${(e.totalOwedToMe || 0).toLocaleString('en-IN')}</td>
                <td class="give">৳${(e.totalIOweThemNumber || 0).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    doc.document.write(htmlContent);
    doc.document.close();
    doc.print();
  };

  const handleSelectEntity = (entityId: string) => {
    setSelectedEntityId(entityId);
  };

  const handleDueTabChange = (type: EntityType) => {
    setDueTabType(type);
    setSelectedEntityId(null);
    setDueTransactions([]);
  };

  // Handle refresh data for current tab
  const handleRefreshData = async () => {
    const { start, end } = getDateRangeBoundaries;
    
    if (activeTab === 'due') {
      // Refresh all entities for summary
      try {
        const [customers, suppliers, employees] = await Promise.all([
          dueListService.getEntities('Customer'),
          dueListService.getEntities('Supplier'),
          dueListService.getEntities('Employee')
        ]);
        setAllDueEntities([...customers, ...suppliers, ...employees]);
        // Refresh current tab entities
        const entities = await dueListService.getEntities(dueTabType, dueSearch || undefined);
        setDueEntities(entities);
        // Refresh transactions for selected entity
        if (selectedEntityId) {
          const txns = await dueListService.getTransactions(selectedEntityId);
          setDueTransactions(txns);
        }
      } catch (error) {
        console.error('Error refreshing due data:', error);
      }
    } else if (activeTab === 'expense') {
      try {
        const res = await ExpenseService.list({
          page: 1,
          pageSize: 500,
          from: start.toISOString(),
          to: end.toISOString(),
        });
        setExpenses(res.items as any);
      } catch (error) {
        console.error('Error refreshing expenses:', error);
      }
    } else if (activeTab === 'income') {
      try {
        const res = await IncomeService.list({
          page: 1,
          pageSize: 500,
          from: start.toISOString(),
          to: end.toISOString(),
        });
        setIncomes(res.items as any);
      } catch (error) {
        console.error('Error refreshing incomes:', error);
      }
    }
  };

  const renderPurchaseContent = () => (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Purchase Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-3 sm:px-5 pt-3 pb-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-bold text-[#023337] tracking-[0.09px] font-['Lato']">
            Purchase information
          </h2>
          <p className="text-[12px] text-black font-['Poppins']">
            View all purchase report
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-6">
          {/* Search */}
          <div className="bg-[#f9f9f9] h-[34px] rounded-lg flex items-center px-2 w-full sm:w-[200px] lg:w-[300px]">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              value={purchaseSearch}
              onChange={(e) => setPurchaseSearch(e.target.value)}
              placeholder="Search Customers"
              className="bg-transparent text-[12px] text-gray-700 font-['Poppins'] outline-none flex-1"
            />
            <span className="text-[12px] text-black font-['Poppins']">Search</span>
          </div>
          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#7b7b7b] font-['Poppins']">Sort by</span>
            <div className="bg-[#f9f9f9] rounded-lg px-2 py-2">
              <select
                value={purchaseSortBy}
                onChange={(e) => setPurchaseSortBy(e.target.value as any)}
                className="bg-transparent text-[12px] text-black font-['Poppins'] outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="amount">Amount</option>
              </select>
            </div>
          </div>
          {/* Add Purchase Button */}
          <button
            onClick={() => {
              // Navigate to AdminPurchase or open modal
              // For now just show alert
              alert('Use the Purchase tab in sidebar to add new purchases');
            }}
            className="bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] flex items-center gap-1 h-[48px] pl-3 pr-4 py-[6px] rounded-lg"
          >
            <AddSquareIcon />
            <span className="text-[15px] font-bold text-white tracking-[-0.3px] font-['Lato']">
              Add Purchase
            </span>
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="flex flex-wrap gap-3 sm:gap-4 px-3 sm:px-5 mt-4">
        {/* Total Purchase Value Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[80px] sm:h-[100px] w-full sm:w-[396px] overflow-hidden px-[18px] py-5">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#da3e00] tracking-[0.16px] font-['Lato']">
            ৳{purchaseStats.totalAmount.toLocaleString('en-IN')}.00
          </p>
          <p className="text-[12px] text-black font-['Poppins'] mt-2">
            Total purchase value
          </p>
        </div>

        {/* Total Purchase Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[80px] sm:h-[100px] w-[calc(50%-6px)] sm:w-[148px] overflow-hidden px-[18px] py-5">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#022f37] tracking-[0.16px] font-['Lato']">
            {purchaseStats.totalPurchases}
          </p>
          <p className="text-[12px] text-black font-['Poppins'] mt-2">
            Total Purchase
          </p>
        </div>

        {/* Categories Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[80px] sm:h-[100px] w-[calc(50%-6px)] sm:w-[148px] overflow-hidden px-[18px] py-5">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#022f37] tracking-[0.16px] font-['Lato']">
            {purchaseStats.categories}
          </p>
          <p className="text-[12px] text-black font-['Poppins'] mt-2">
            Categories
          </p>
        </div>

        {/* Actions Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[100px] w-full sm:flex-1 overflow-hidden px-[18px] py-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-black font-['Poppins']">Actions</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPurchaseCategoryModalOpen(true)}
                className="bg-white flex items-center gap-1 px-[6px] py-[6px] rounded"
              >
                <AddSquareSmallIcon />
                <span className="text-[12px] text-black font-['Poppins']">Add Category</span>
              </button>
              <button
                onClick={handlePrintPurchases}
                className="bg-white flex items-center gap-1 px-[6px] py-[6px] rounded"
              >
                <PrinterIcon />
                <span className="text-[12px] text-black font-['Poppins']">Print</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-[7px] mt-3">
            <span className="text-[12px] text-black font-['Poppins']">Filter by:</span>
            <div className="bg-white flex-1 flex items-center justify-between px-3 py-[11px] rounded">
              <select
                value={purchaseFilterCategory}
                onChange={(e) => setPurchaseFilterCategory(e.target.value)}
                className="text-[12px] text-black font-['Poppins'] bg-transparent border-none outline-none flex-1 cursor-pointer"
              >
                <option value="">Category</option>
                {expenseCategories.map(cat => (
                  <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Table */}
      <div className="mt-4 px-2 sm:px-5 overflow-x-auto">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-[#38bdf8]/10 to-[#1e90ff]/10 h-[48px] flex items-center rounded-t-lg min-w-[700px]">
          <div className="w-12 flex-shrink-0 text-center">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-[#eaf8e7] accent-[#38bdf8]"
              checked={selectedPurchases.size === paginatedPurchases.length && paginatedPurchases.length > 0}
              onChange={() => {
                if (selectedPurchases.size === paginatedPurchases.length) {
                  setSelectedPurchases(new Set());
                } else {
                  setSelectedPurchases(new Set(paginatedPurchases.map(p => p._id)));
                }
              }}
            />
          </div>
          <div className="w-14 flex-shrink-0"><p className="text-[16px] font-medium text-black font-['Poppins']">SL</p></div>
          <div className="w-16 flex-shrink-0"><p className="text-[16px] font-medium text-black font-['Poppins']">Doc</p></div>
          <div className="flex-1 min-w-[120px]"><p className="text-[16px] font-medium text-black font-['Poppins']">Name</p></div>
          <div className="w-28 flex-shrink-0"><p className="text-[16px] font-medium text-black font-['Poppins']">Number</p></div>
          <div className="w-28 flex-shrink-0"><p className="text-[16px] font-medium text-black font-['Poppins']">Category</p></div>
          <div className="w-28 flex-shrink-0"><p className="text-[16px] font-medium text-black font-['Poppins']">Date</p></div>
          <div className="w-24 flex-shrink-0 text-center"><p className="text-[16px] font-medium text-black font-['Poppins']">Amount</p></div>
          <div className="w-16 flex-shrink-0 text-center"><p className="text-[16px] font-medium text-black font-['Poppins']">Action</p></div>
        </div>

        {/* Table Rows */}
        {purchaseLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="animate-spin text-[#38bdf8]" size={24} />
          </div>
        ) : paginatedPurchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ShoppingBagIcon />
            <p className="mt-4 text-[14px]">No purchases found.</p>
          </div>
        ) : (
          paginatedPurchases.map((purchase, index) => (
            <div
              key={purchase._id}
              className="h-[68px] flex items-center border-b border- min-w-[700px] [#b9b9b9]/50 hover:bg-gray-50"
            >
              <div className="w-12 flex-shrink-0 text-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-[#eaf8e7] accent-[#38bdf8]"
                  checked={selectedPurchases.has(purchase._id)}
                  onChange={() => togglePurchaseSelection(purchase._id)}
                />
              </div>
              <div className="w-14 flex-shrink-0">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">{filteredPurchases.length - ((purchasePage - 1) * purchasePageSize) - index}</p>
              </div>
              <div className="w-16 flex-shrink-0">
                <div className="bg-[#f5f5f5] w-[46px] h-[46px] rounded-lg flex items-center justify-center">
                  {purchase.items?.[0]?.productImage ? (
                    <img src={purchase.items[0].productImage} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Package size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-[120px]">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins'] truncate">{purchase.supplierName || 'N/A'}</p>
              </div>
              <div className="w-28 flex-shrink-0">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">{purchase.mobileNumber || '-'}</p>
              </div>
              <div className="w-28 flex-shrink-0">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">Product Buy</p>
              </div>
              <div className="w-28 flex-shrink-0">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">
                  {new Date(purchase.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}
                </p>
              </div>
              <div className="w-24 flex-shrink-0 text-center">
                <p className="text-[12px] text-[#da0000] font-['Poppins']">৳{purchase.totalAmount?.toLocaleString('en-IN') || 0}</p>
              </div>
              <div className="w-16 flex-shrink-0 flex justify-center relative">
                <button
                  onClick={() => setPurchaseActionMenuOpen(purchaseActionMenuOpen === purchase._id ? null : purchase._id)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <DotsIcon />
                </button>
                {purchaseActionMenuOpen === purchase._id && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    <button
                      onClick={() => handleDeletePurchase(purchase._id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-600 hover:bg-gray-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {paginatedPurchases.length > 0 && (
        <div className="flex items-center justify-center gap-[279px] py-5">
          <button
            onClick={() => setPurchasePage(p => Math.max(1, p - 1))}
            disabled={purchasePage === 1}
            className="bg-white flex items-center gap-1 h-[42px] pl-2 pr-3 py-[10px] rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
          >
            <ArrowLeftIcon />
            <span className="text-[15px] font-medium text-black font-['Lato']">Previous</span>
          </button>

          <div className="flex items-center gap-3">
            {Array.from({ length: Math.min(5, totalPurchasePages) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPurchasePage(page)}
                className={`w-9 h-9 flex items-center justify-center rounded ${
                  purchasePage === page
                    ? 'bg-[#dff5ff] text-[#1e90ff]'
                    : 'border border-[#d1d5db] text-[#023337]'
                } text-[15px] font-medium font-['Lato']`}
              >
                {page}
              </button>
            ))}
            {totalPurchasePages > 5 && (
              <>
                <button className="w-9 h-9 flex items-center justify-center border border-[#d1d5db] rounded text-[15px] font-bold text-[#023337] font-['Lato']">
                  .....
                </button>
                <button
                  onClick={() => setPurchasePage(totalPurchasePages)}
                  className="w-9 h-9 flex items-center justify-center border border-[#d1d5db] rounded text-[15px] font-medium text-[#023337] font-['Lato']"
                >
                  {totalPurchasePages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setPurchasePage(p => Math.min(totalPurchasePages, p + 1))}
            disabled={purchasePage === totalPurchasePages}
            className="bg-white flex items-center gap-1 h-[42px] pl-3 pr-2 py-[10px] rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
          >
            <span className="text-[15px] font-medium text-black font-['Lato']">Next</span>
            <ArrowRightIcon />
          </button>
        </div>
      )}

      {/* Add Category Modal */}
      {isPurchaseCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-[#023337] font-['Lato']">Add Category</h3>
              <button onClick={() => setIsPurchaseCategoryModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={newPurchaseCategoryName}
                onChange={(e) => setNewPurchaseCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] font-['Poppins']"
                placeholder="Enter category name"
              />
              <button
                onClick={handleAddPurchaseCategory}
                className="bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] text-white py-3 rounded-lg text-[15px] font-bold font-['Lato']"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ========== RENDER DUE CONTENT ==========
  const renderDueContent = () => (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Due Header with Print Button */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <h2 className="text-[18px] font-bold text-[#023337] tracking-[0.09px]">
          Due List
        </h2>
        <button
          onClick={handlePrintDueList}
          className="flex items-center gap-2 bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] text-white px-4 h-[48px] rounded-lg text-[15px] font-bold tracking-[-0.3px]"
        >
          <Printer size={20} />
          Print Due List
        </button>
      </div>

      {/* Summary Cards - Figma Style */}
      <div className="flex gap-4 px-5 py-4">
        {/* You will Get - Green */}
        <div className="flex-1 bg-[#f9f9f9] rounded-lg h-[80px] px-[18px] py-5 flex flex-col justify-center">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#008c09] tracking-[0.16px]">
            ৳{dueSummary.totalWillGet.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-black">You will Get (Total)</p>
        </div>
        {/* You will Give - Red */}
        <div className="flex-1 bg-[#f9f9f9] rounded-lg h-[80px] px-[18px] py-5 flex flex-col justify-center">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#da0000] tracking-[0.16px]">
            ৳{dueSummary.totalWillGive.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[12px] text-black">You will Give (Total)</p>
        </div>
      </div>

      {/* Date Range Info - For filtered transactions */}
      <div className="px-5 pb-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-blue-600" />
            <span className="text-sm text-blue-700">
              Showing transactions: <span className="font-semibold">{getDateRangeDisplayText()}</span>
            </span>
          </div>
          {selectedEntity && filteredDueTransactions.length > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#008c09]">
                Get: ৳{filteredDueSummary.totalWillGet.toLocaleString('en-IN')}
              </span>
              <span className="text-[#da0000]">
                Give: ৳{filteredDueSummary.totalWillGive.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="flex" style={{ height: 'calc(100vh - 380px)', minHeight: '400px' }}>
        {/* Left Panel - Entity List */}
        <div className="w-[400px] flex flex-col">
          {/* Entity Type Tabs */}
          <div className="flex gap-0 px-5 bg-white">
            {(['Customer', 'Supplier', 'Employee'] as EntityType[]).map((type) => (
              <button
                key={type}
                onClick={() => handleDueTabChange(type)}
                className={`px-[22px] py-3 text-[16px] font-medium border-b-2 transition-colors ${
                  dueTabType === type 
                    ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] border-[#38bdf8]' 
                    : 'text-black border-transparent hover:text-[#333]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="px-5 py-3">
            <div className="bg-[#f9f9f9] h-[34px] rounded-lg flex items-center px-2">
              <Search size={20} className="text-black mr-2" />
              <input
                type="text"
                placeholder="Search"
                value={dueSearch}
                onChange={(e) => setDueSearch(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-[12px] text-black placeholder:text-black"
              />
            </div>
          </div>

          {/* Entity List */}
          <div className="flex-1 overflow-auto px-5">
            {dueLoading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw size={24} className="animate-spin text-[#38bdf8]" />
              </div>
            ) : dueEntities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#888]">
                <Package size={40} className="mb-2 opacity-50" />
                <span className="text-[13px]">No {dueTabType.toLowerCase()}s found</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {dueEntities.map((entity) => (
                  <div
                    key={entity._id}
                    onClick={() => handleSelectEntity(entity._id!)}
                    className={`flex items-center gap-[11px] py-2 cursor-pointer transition-colors border-b border-[#e5e5e5] ${
                      selectedEntityId === entity._id ? 'bg-[#f0f9ff]' : 'hover:bg-[#fafafa]'
                    }`}
                  >
                    {/* Left Border Indicator */}
                    <div className={`w-[2px] h-[46px] rounded-full ${
                      entity.totalOwedToMe > entity.totalIOweThemNumber ? 'bg-[#008c09]' : 'bg-[#da0000]'
                    }`} />
                    
                    {/* Entity Info */}
                    <div className="flex-1 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-[16px] font-semibold text-black">{entity.name}</span>
                        <span className="text-[12px] text-black">{entity.phone || 'No phone'}</span>
                      </div>
                      <div className="flex flex-col items-end gap-[2px] text-[12px]">
                        <p>
                          <span className="text-black">Give: </span>
                          <span className="font-semibold text-[#da0000]">৳{(entity.totalIOweThemNumber || 0).toLocaleString('en-IN')}</span>
                        </p>
                        <p>
                          <span className="text-black">Get: </span>
                          <span className="font-semibold text-[#008c09]">৳{(entity.totalOwedToMe || 0).toLocaleString('en-IN')}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Transaction History */}
        <div className="flex-1 flex flex-col">
          {/* Action Buttons Row */}
          <div className="flex items-center justify-end gap-4 px-5 py-3">
            <button
              onClick={() => setShowDueHistoryModal(true)}
              className="flex items-center gap-2 bg-[#f9f9f9] text-black px-4 h-[48px] rounded-lg text-[15px] font-bold tracking-[-0.3px]"
            >
              <RefreshCw size={20} />
              Due History
            </button>
            <button
              onClick={() => setShowAddDueModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] text-white px-4 h-[48px] rounded-lg text-[15px] font-bold tracking-[-0.3px]"
            >
              <Plus size={20} />
              Add Due
            </button>
          </div>

          {/* Transaction List Panel */}
          <div className="flex-1 mx-5 mb-5 bg-[#f9f9f9] rounded-lg overflow-auto">
            {selectedEntity ? (
              filteredDueTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#888]">
                  <Package size={40} className="mb-2 opacity-50" />
                  <span className="text-[13px]">No transactions in this date range</span>
                </div>
              ) : (
                <div className="p-4">
                  {filteredDueTransactions.map((tx, idx) => (
                    <div key={tx._id} className={`flex items-center justify-between py-3 ${idx !== filteredDueTransactions.length - 1 ? 'border-b border-[#e5e5e5]' : ''}`}>
                      {/* Left: Title & Date */}
                      <div className="flex flex-col gap-[2px] w-[145px]">
                        <span className="text-[14px] font-medium text-black">
                          {tx.transactionType || tx.items || 'Product purchase'}
                        </span>
                        <span className="text-[12px] text-black">
                          {new Date(tx.transactionDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Middle: Notes */}
                      <p className="text-[10px] text-[#b0b0b0] leading-[12px] w-[277px] line-clamp-3">
                        {tx.notes || 'No notes'}
                      </p>

                      {/* Right: Amount, Status, Menu */}
                      <div className="flex items-center gap-4 justify-end w-[224px]">
                        <span className={`text-[16px] font-semibold w-[106px] ${
                          tx.direction === 'INCOME' ? 'text-[#008c09]' : 'text-[#da0000]'
                        }`}>
                          {tx.direction === 'INCOME' ? '+ ' : '- '}৳{tx.amount.toLocaleString('en-IN')}
                        </span>
                        <span className={`px-[9px] py-[2px] rounded-[30px] text-[12px] font-medium w-[62px] text-center ${
                          tx.status === 'Paid' 
                            ? 'bg-[#d4f4d4] text-[#008c09]'
                            : 'bg-[#fff2bc] text-[#2c2400]'
                        }`}>
                          {tx.status === 'Paid' ? 'Paid' : 'Pending'}
                        </span>
                        <button className="p-1 hover:bg-[#e5e5e5] rounded">
                          <MoreHorizontal size={20} className="text-[#888]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#888]">
                <Package size={48} className="mb-3 opacity-50" />
                <span className="text-[14px]">Select a {dueTabType.toLowerCase()} to view transactions</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Due Modal */}
      <AddNewDueModal
        isOpen={showAddDueModal}
        onClose={() => setShowAddDueModal(false)}
        onSave={async (data) => {
          try {
            await dueListService.createTransaction(data);
            // Refresh ALL entities for summary
            const [customers, suppliers, employees] = await Promise.all([
              dueListService.getEntities('Customer'),
              dueListService.getEntities('Supplier'),
              dueListService.getEntities('Employee')
            ]);
            setAllDueEntities([...customers, ...suppliers, ...employees]);
            // Refresh current tab entities
            const tabEntities = await dueListService.getEntities(dueTabType);
            setDueEntities(tabEntities);
            // Refresh transactions if entity selected
            if (selectedEntity) {
              const txns = await dueListService.getTransactions(selectedEntity._id);
              setDueTransactions(txns);
            }
            setShowAddDueModal(false);
          } catch (error) {
            console.error('Error creating due transaction:', error);
          }
        }}
      />

      {/* Due History Modal */}
      <DueHistoryModal
        isOpen={showDueHistoryModal}
        onClose={() => setShowDueHistoryModal(false)}
      />
    </div>
  );

  const renderExpenseContent = () => (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Expense Summary Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 px-3 sm:px-5 pt-3 pb-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] font-bold text-[#023337] tracking-[0.09px] font-['Lato']">
            Expense Summary
          </h2>
          <p className="text-[12px] text-black font-['Poppins']">
            Total expenses overview for the selected period.
          </p>
        </div>
        <button
          onClick={() => { setNewExpense({ status: 'Published' }); setEditingExpenseId(null); setIsAddExpenseOpen(true); }}
          className="bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] flex items-center gap-1 h-[48px] pl-3 pr-4 py-[6px] rounded-lg"
        >
          <AddSquareIcon />
          <span className="text-[15px] font-bold text-white tracking-[-0.3px] font-['Lato']">
            Add Expense
          </span>
        </button>
      </div>

      {/* Summary Cards Row */}
      <div className="flex flex-wrap gap-3 sm:gap-4 px-3 sm:px-5 mt-4">
        {/* Total Expenses Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[80px] sm:h-[100px] w-full sm:w-[396px] overflow-hidden px-[18px] py-5">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#da3e00] tracking-[0.16px] font-['Lato']">
            ৳{expenseStats.totalAmount.toLocaleString('en-IN')}.00
          </p>
          <p className="text-[12px] text-black font-['Poppins'] mt-2">
            Total expenses with product cost
          </p>
        </div>

        {/* Total Transactions Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[80px] sm:h-[100px] w-[calc(50%-6px)] sm:w-[148px] overflow-hidden px-[18px] py-5">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#022f37] tracking-[0.16px] font-['Lato']">
            {expenseStats.totalTransactions}
          </p>
          <p className="text-[12px] text-black font-['Poppins'] mt-2">
            Total Transactions
          </p>
        </div>

        {/* Categories Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[80px] sm:h-[100px] w-[calc(50%-6px)] sm:w-[148px] overflow-hidden px-[18px] py-5">
          <p className="text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[32px] font-bold text-[#022f37] tracking-[0.16px] font-['Lato']">
            {expenseStats.categories}
          </p>
          <p className="text-[12px] text-black font-['Poppins'] mt-2">
            Categories
          </p>
        </div>

        {/* Actions Card */}
        <div className="bg-[#f9f9f9] rounded-lg h-auto min-h-[100px] w-full sm:flex-1 overflow-hidden px-[18px] py-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-black font-['Poppins']">Actions</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-white flex items-center gap-1 px-[6px] py-[6px] rounded"
              >
                <AddSquareSmallIcon />
                <span className="text-[12px] text-black font-['Poppins']">Add Category</span>
              </button>
              <button
                onClick={handlePrintExpenses}
                className="bg-white flex items-center gap-1 px-[6px] py-[6px] rounded"
              >
                <PrinterIcon />
                <span className="text-[12px] text-black font-['Poppins']">Print</span>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-[7px] mt-3">
            <span className="text-[12px] text-black font-['Poppins']">Filter by:</span>
            <div className="bg-white flex-1 flex items-center justify-between px-3 py-[11px] rounded">
              <select
                value={selectedExpenseCategory}
                onChange={(e) => setSelectedExpenseCategory(e.target.value)}
                className="text-[12px] text-black font-['Poppins'] bg-transparent border-none outline-none flex-1 cursor-pointer"
              >
                <option value="">All Categories</option>
                {expenseCategories.map(cat => (
                  <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="mt-4 px-2 sm:px-5 overflow-x-auto">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-[#38bdf8]/10 to-[#1e90ff]/10 h-[48px] flex items-center rounded-t-lg min-w-[700px]">
          <div className="w-[60px] text-center">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-[#eaf8e7] accent-[#38bdf8]"
              checked={selectedExpenses.size === expenses.length && expenses.length > 0}
              onChange={() => {
                if (selectedExpenses.size === expenses.length) {
                  setSelectedExpenses(new Set());
                } else {
                  setSelectedExpenses(new Set(expenses.map(e => e.id)));
                }
              }}
            />
          </div>

          {/* Bulk Actions Bar */}
          {selectedExpenses.size > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-[12px] text-blue-700 font-medium">{selectedExpenses.size} selected</span>
              <button
                onClick={handleBulkDeleteExpenses}
                className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded text-[12px] font-medium hover:bg-red-600"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                onClick={() => setSelectedExpenses(new Set())}
                className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-700 rounded text-[12px] font-medium hover:bg-gray-300"
              >
                <X size={14} />
                Clear
              </button>
            </div>
          )}

          <div className={`w-[80px] ${selectedExpenses.size === 0 ? '' : 'ml-auto'}`}><p className="text-[16px] font-medium text-black font-['Poppins']">SL</p></div>
          <div className="flex-1"><p className="text-[16px] font-medium text-black font-['Poppins']">Name</p></div>
          <div className="w-[150px]"><p className="text-[16px] font-medium text-black font-['Poppins']">Category</p></div>
          <div className="w-[120px] text-center"><p className="text-[16px] font-medium text-black font-['Poppins']">Amount</p></div>
          <div className="w-[120px]"><p className="text-[16px] font-medium text-black font-['Poppins']">Date</p></div>
          <div className="w-[80px] text-center"><p className="text-[16px] font-medium text-black font-['Poppins']">Action</p></div>
        </div>

        {/* Table Rows */}
        {expenseLoading && expenses.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="animate-spin text-[#38bdf8]" size={24} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <InvoiceIcon />
            <p className="mt-4 text-[14px]">No expenses found. Click "Add Expense" to create one.</p>
          </div>
        ) : (
          expenses.map((expense, index) => (
            <div
              key={expense.id || `expense-${index}`}
              className="h-[68px] flex items-center border-b border- min-w-[700px] [#b9b9b9]/50 hover:bg-gray-50"
            >
              <div className="w-[60px] text-center">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-[#eaf8e7] accent-[#38bdf8]"
                  checked={selectedExpenses.has(expense.id)}
                  onChange={() => toggleExpenseSelection(expense.id)}
                />
              </div>
              <div className="w-[80px]">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">{expenses.length - index}</p>
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">{expense.name}</p>
              </div>
              <div className="w-[150px]">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">{expense.category}</p>
              </div>
              <div className="w-[120px] text-center">
                <p className="text-[12px] text-[#da0000] font-['Poppins']">৳{expense.amount.toLocaleString('en-IN')}</p>
              </div>
              <div className="w-[120px]">
                <p className="text-[12px] text-[#1d1a1a] font-['Poppins']">
                  {new Date(expense.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                </p>
              </div>
              <div className="w-[80px] flex justify-center relative">
                <button
                  onClick={() => {
                    const menuId = expense.id || `expense-${index}`;
                    setActionMenuOpen(actionMenuOpen === menuId ? null : menuId);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <DotsIcon />
                </button>
                {actionMenuOpen === (expense.id || `expense-${index}`) && (
                  <div className="absolute right-0 top-8 bg-white rounded-[8px] shadow-[0px_3px_19.5px_0px_rgba(0,0,0,0.13)] z-10 overflow-hidden py-2">
                    {/* Details */}
                    <button
                      onClick={() => {
                        setExpenseDetailsOpen(expense);
                        setActionMenuOpen(null);
                      }}
                      className="w-full h-[48px] flex items-center gap-2 px-3 sm:px-4 lg:px-6 hover:bg-gray-50"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                      <span className="text-[16px] font-semibold text-black font-['Lato']">Details</span>
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => {
                        setNewExpense(expense);
                        setEditingExpenseId(expense.id);
                        setIsAddExpenseOpen(true);
                        setActionMenuOpen(null);
                      }}
                      className="w-full h-[48px] flex items-center gap-2 px-3 sm:px-4 lg:px-6 hover:bg-gray-50"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"/>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                      <span className="text-[16px] font-semibold text-black font-['Lato']">Edit</span>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="w-full h-[48px] flex items-center gap-2 px-3 sm:px-4 lg:px-6 hover:bg-gray-50"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#da0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                      <span className="text-[16px] font-semibold text-[#da0000] font-['Lato']">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {expenses.length > 0 && (
        <div className="flex items-center justify-center gap-[279px] py-5">
          <button
            onClick={() => setExpensePage(p => Math.max(1, p - 1))}
            disabled={expensePage === 1}
            className="bg-white flex items-center gap-1 h-[42px] pl-2 pr-3 py-[10px] rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
          >
            <ArrowLeftIcon />
            <span className="text-[15px] font-medium text-black font-['Lato']">Previous</span>
          </button>

          <div className="flex items-center gap-3">
            {Array.from({ length: Math.min(5, totalExpensePages) }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setExpensePage(page)}
                className={`w-9 h-9 flex items-center justify-center rounded ${
                  expensePage === page
                    ? 'bg-[#dff5ff] text-[#1e90ff]'
                    : 'border border-[#d1d5db] text-[#023337]'
                } text-[15px] font-medium font-['Lato']`}
              >
                {page}
              </button>
            ))}
            {totalExpensePages > 5 && (
              <>
                <button className="w-9 h-9 flex items-center justify-center border border-[#d1d5db] rounded text-[15px] font-bold text-[#023337] font-['Lato']">
                  .....
                </button>
                <button
                  onClick={() => setExpensePage(totalExpensePages)}
                  className="w-9 h-9 flex items-center justify-center border border-[#d1d5db] rounded text-[15px] font-medium text-[#023337] font-['Lato']"
                >
                  {totalExpensePages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setExpensePage(p => Math.min(totalExpensePages, p + 1))}
            disabled={expensePage === totalExpensePages}
            className="bg-white flex items-center gap-1 h-[42px] pl-3 pr-2 py-[10px] rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2)] disabled:opacity-50"
          >
            <span className="text-[15px] font-medium text-black font-['Lato']">Next</span>
            <ArrowRightIcon />
          </button>
        </div>
      )}

      {/* Add/Edit Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[8px] p-5 w-full max-w-[548px] overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
              <h3 className="text-[16px] font-semibold text-black text-center font-['Poppins']">
                {editingExpenseId ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button onClick={() => { setIsAddExpenseOpen(false); setEditingExpenseId(null); }} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Expense Name */}
              <div className="flex flex-col gap-3">
                <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                  Expense Name<span className="text-[#da0000]">*</span>
                </label>
                <input
                  type="text"
                  value={newExpense.name || ''}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full h-[48px] px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[15px] font-['Lato'] text-[#023337] placeholder-[#aeaeae]"
                  placeholder="Enter expense name"
                />
              </div>
              
              {/* Category */}
              <div className="flex flex-col gap-3 relative">
                <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                  Category<span className="text-[#da0000]">*</span>
                </label>
                <div 
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className="w-full h-[48px] px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[15px] font-['Lato'] text-[#023337] cursor-pointer flex items-center justify-between"
                >
                  <span className={newExpense.category ? 'text-[#023337]' : 'text-[#aeaeae]'}>
                    {newExpense.category || 'Select Category'}
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#023337" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                
                {/* Category Dropdown */}
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[16px] shadow-[0px_3px_19.5px_0px_rgba(0,0,0,0.13)] z-10 overflow-hidden">
                    <div className="p-4 flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                      {expenseCategories.map(cat => (
                        <div 
                          key={cat.id || cat.name}
                          onClick={() => { setNewExpense(prev => ({ ...prev, category: cat.name })); setIsCategoryDropdownOpen(false); }}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            newExpense.category === cat.name ? 'border-[#38bdf8] bg-[#38bdf8]' : 'border-gray-300'
                          }`}>
                            {newExpense.category === cat.name && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            )}
                          </div>
                          <span className="text-[15px] font-medium text-black font-['Poppins']">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 pt-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsCategoryDropdownOpen(false); setIsCategoryModalOpen(true); }}
                        className="flex items-center gap-2.5 px-3 py-3 bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] rounded-[8px] text-white"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="12" y1="8" x2="12" y2="16"></line>
                          <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                        <span className="text-[15px] font-medium font-['Poppins']">Add New Category</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Amount and Date Row */}
              <div className="flex gap-4">
                {/* Amount */}
                <div className="flex-1 flex flex-col gap-3">
                  <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                    Amount<span className="text-[#da0000]">*</span>
                  </label>
                  <input
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full h-[48px] px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[15px] font-['Lato'] text-[#023337] placeholder-[#aeaeae]"
                    placeholder="0.00"
                  />
                </div>
                
                {/* Date */}
                <div className="flex-1 flex flex-col gap-3">
                  <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                    Date<span className="text-[#da0000]">*</span>
                  </label>
                  <input
                    type="date"
                    value={newExpense.date || ''}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full h-[48px] px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[15px] font-['Lato'] text-[#023337]"
                  />
                </div>
              </div>
              
              {/* Image Upload */}
              <div className="flex flex-col gap-3">
                <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                  Image Upload
                </label>
                <div 
                  className="w-full h-[153px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-[#f3f4f6] transition-colors"
                  onClick={() => document.getElementById('expense-image-upload')?.click()}
                >
                  {newExpense.imageUrl ? (
                    <div className="relative w-full h-full p-2">
                      <img 
                        src={newExpense.imageUrl} 
                        alt="Expense" 
                        className="w-full h-full object-contain rounded"
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setNewExpense(prev => ({ ...prev, imageUrl: undefined })); }}
                        className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-[15px] text-[#aeaeae] font-['Lato']">Upload Doc</p>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aeaeae" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </>
                  )}
                </div>
                <input
                  id="expense-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setNewExpense(prev => ({ ...prev, imageUrl: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>
              
              {/* Note */}
              <div className="flex flex-col gap-3">
                <label className="text-[15px] font-bold text-[#023337] font-['Lato']">
                  Note
                </label>
                <input
                  type="text"
                  value={newExpense.note || ''}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, note: e.target.value }))}
                  className="w-full h-[48px] px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] text-[15px] font-['Lato'] text-[#023337] placeholder-[#aeaeae]"
                  placeholder="Add any notes..."
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => { setIsAddExpenseOpen(false); setEditingExpenseId(null); }}
                  className="h-[40px] px-4 py-2 bg-white border border-[#e5e7eb] rounded-[8px] text-[15px] font-bold text-[#023337] font-['Lato'] tracking-[-0.3px] min-w-[111px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddExpense}
                  className="h-[40px] px-4 py-2 bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] rounded-[8px] text-[15px] font-bold text-white font-['Lato'] tracking-[-0.3px]"
                >
                  {editingExpenseId ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-[#023337] font-['Lato']">Add Category</h3>
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-[14px] font-['Poppins']"
                placeholder="Enter category name"
              />
              <button
                onClick={handleAddCategory}
                className="bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] text-white py-3 rounded-lg text-[15px] font-bold font-['Lato']"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Details Modal */}
      {expenseDetailsOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-[8px] p-5 w-full max-w-[548px] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
              <h3 className="text-[16px] font-semibold text-black text-center font-['Poppins']">
                Expense Details
              </h3>
              <button onClick={() => setExpenseDetailsOpen(null)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Expense Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-bold text-[#023337] font-['Lato']">Expense Name</label>
                <div className="w-full h-[48px] px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] flex items-center">
                  <span className="text-[15px] font-['Lato'] text-black">{expenseDetailsOpen.name}</span>
                </div>
              </div>
              
              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-[15px] font-bold text-[#023337] font-['Lato']">Category</label>
                <div className="w-full h-[48px] px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] flex items-center">
                  <span className="text-[15px] font-['Lato'] text-black">{expenseDetailsOpen.category}</span>
                </div>
              </div>
              
              {/* Amount and Date Row */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[15px] font-bold text-[#023337] font-['Lato']">Amount</label>
                  <div className="w-full h-[48px] px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] flex items-center">
                    <span className="text-[15px] font-['Lato'] text-black">৳{expenseDetailsOpen.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[15px] font-bold text-[#023337] font-['Lato']">Date</label>
                  <div className="w-full h-[48px] px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] flex items-center">
                    <span className="text-[15px] font-['Lato'] text-black">
                      {new Date(expenseDetailsOpen.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Image */}
              {expenseDetailsOpen.imageUrl && (
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-bold text-[#023337] font-['Lato']">Image</label>
                  <div className="w-full h-[153px] bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] flex items-center justify-center overflow-hidden">
                    <img 
                      src={expenseDetailsOpen.imageUrl} 
                      alt="Expense" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}
              
              {/* Note */}
              {expenseDetailsOpen.note && (
                <div className="flex flex-col gap-2">
                  <label className="text-[15px] font-bold text-[#023337] font-['Lato']">Note</label>
                  <div className="w-full min-h-[48px] px-3 py-2.5 bg-[#f9fafb] border border-[#e5e7eb] rounded-[8px] flex items-center">
                    <span className="text-[15px] font-['Lato'] text-black">{expenseDetailsOpen.note}</span>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  onClick={() => setExpenseDetailsOpen(null)}
                  className="h-[40px] px-4 py-2 bg-white border border-[#e5e7eb] rounded-[8px] text-[15px] font-bold text-[#023337] font-['Lato'] tracking-[-0.3px] min-w-[111px]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setNewExpense(expenseDetailsOpen);
                    setEditingExpenseId(expenseDetailsOpen.id);
                    setExpenseDetailsOpen(null);
                    setIsAddExpenseOpen(true);
                  }}
                  className="h-[40px] px-4 py-2 bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] rounded-[8px] text-[15px] font-bold text-white font-['Lato'] tracking-[-0.3px]"
                >
                  Edit Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'expense':
        return renderExpenseContent();
      case 'income':
        return renderIncomeContent();
      case 'purchase':
        return renderPurchaseContent();
      case 'due':
        return renderDueContent();
      case 'note':
        return <AdminNote tenantId={tenantId} />;
      case 'profit':
      default:
        return renderProfitLossContent();
    }
  };

  return (
    <div className="bg-[#f9f9f9] min-h-screen font-['Poppins']">
      <div className="bg-white rounded-lg mx-2 sm:mx-5 my-2 sm:my-5 p-2 sm:p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
          <h1 className="text-lg sm:text-xl lg:text-lg sm:text-xl lg:text-[22px] font-bold text-[#023337] tracking-[0.11px] font-['Lato']">
            Business Report
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-6">
            {/* Refresh Button */}
            <button 
              onClick={handleRefreshData}
              className="flex items-center gap-2 px-2 py-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-[12px] text-black font-['Poppins']">Refresh</span>
              <RefreshCw size={16} className="text-gray-600" />
            </button>

            {/* Date Range Buttons */}
            <div className="flex flex-wrap items-center gap-2 relative">
              {dateRangeOptions.filter(o => o.id !== 'custom').map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setDateRange(option.id);
                    setShowCustomDatePicker(false);
                  }}
                  className={`px-2 py-1 rounded-lg text-[14px] font-medium font-['Poppins'] min-w-[56px] sm:min-w-[72px] flex items-center justify-center gap-1 sm:gap-2 text-[12px] sm:text-[14px] ${
                    dateRange === option.id
                      ? 'bg-gradient-to-b from-[#ff6a00] to-[#ff9f1c] text-white'
                      : 'bg-[#f9f9f9] text-[#a7a7a7]'
                  }`}
                >
                  {option.label}
                </button>
              ))}

              {/* Month Selector (shown when Month is selected) */}
              {dateRange === 'month' && (
                <div className="flex items-center gap-1 px-3 py-1 border border-[#38bdf8] rounded-lg text-[14px] font-medium text-[#1e90ff] font-['Poppins']">
                  <button
                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                    className="p-0.5 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="min-w-[90px] sm:min-w-[110px] text-center text-[12px] sm:text-[14px]">
                    {selectedMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                    className="p-0.5 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* Custom Date Range Display (shown when Custom is active) */}
              {dateRange === 'custom' && customDateRange.startDate && customDateRange.endDate && (
                <div className="px-3 py-1 border border-[#38bdf8] rounded-lg text-[14px] font-medium text-[#1e90ff] font-['Poppins']">
                  {getDateRangeDisplayText()}
                </div>
              )}

              {/* Custom Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (dateRange === 'custom') {
                      setShowCustomDatePicker(!showCustomDatePicker);
                    } else {
                      setDateRange('custom');
                      setShowCustomDatePicker(true);
                    }
                  }}
                  className={`px-2 py-1 rounded-lg text-[14px] font-medium font-['Poppins'] min-w-[56px] sm:min-w-[72px] flex items-center justify-center gap-1 sm:gap-2 text-[12px] sm:text-[14px] ${
                    dateRange === 'custom'
                      ? 'bg-gradient-to-b from-[#ff6a00] to-[#ff9f1c] text-white'
                      : 'bg-[#f9f9f9] text-[#a7a7a7]'
                  }`}
                >
                  Custom
                  <ChevronDown size={16} className={showCustomDatePicker ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
                
                {/* Custom Date Range Picker Dropdown */}
                <CustomDateRangePicker
                  isOpen={showCustomDatePicker}
                  onClose={() => setShowCustomDatePicker(false)}
                  onApply={(range) => {
                    setCustomDateRange(range);
                    setDateRange('custom');
                    setShowCustomDatePicker(false);
                  }}
                  initialDateRange={customDateRange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 sm:gap-4 border-b border-gray-100 mb-5 overflow-x-auto pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 sm:px-[22px] py-2 sm:py-3 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#38bdf8]'
                    : 'border-transparent'
                }`}
              >
                <Icon />
                <span className={`text-[13px] sm:text-[16px] font-medium font-['Poppins'] ${
                  isActive
                    ? 'bg-gradient-to-r from-[#38bdf8] to-[#1e90ff] bg-clip-text text-transparent'
                    : 'text-black'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </div>
  );
};

export default FigmaBusinessReport;
