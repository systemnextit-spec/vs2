import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Search,
  Plus,
  X,
  Package,
  ShoppingBag,
  Coins,
  ChevronDown,
  Calendar,
  ScanLine,
  Upload,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  Link2,
  ImagePlus,
  ArrowRight,
  User,
  Phone,
  MapPin,
  FileText,
  Printer,
  Download,
  RefreshCw,
  ChevronLeft,
  MoreVertical,
  Eye,
  Edit,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Product, Category, SubCategory } from '../types';
import { DataService } from '../services/DataService';
import { getAuthHeader } from '../services/authService';

interface PurchaseItem {
  productId: number;
  productName: string;
  productImage: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  expiryDate?: string;
  stock: number;
}

interface NewProductForm {
  name: string;
  currentStock: number;
  purchasePrice: number;
  sellPrice: number;
  unit: string;
  category: string;
  subCategory: string;
  description: string;
  sellOnline: boolean;
  sellInBulk: boolean;
  lowStockAlert: boolean;
  vatApplicable: boolean;
  warranty: boolean;
  discount: boolean;
  barcode: boolean;
  image: string;
}

interface PaymentForm {
  dateOfPurchase: string;
  amount: number;
  cashPaid: number;
  note: string;
  supplierName: string;
  mobileNumber: string;
  countryCode: string;
  address: string;
  customInvoiceNumber: boolean;
  invoiceNumber: string;
  employeeInfo: boolean;
  employeeName: string;
  employeeNumber: string;
  sendSMS: boolean;
}

interface PurchaseRecord {
  _id: string;
  purchaseNumber: string;
  items: any[];
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

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  supplierName: string;
  mobileNumber: string;
  address: string;
  items: PurchaseItem[];
  subTotal: number;
  discount: number;
  deliveryCharge: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentType: 'cash' | 'due';
  buyerName: string;
}

interface AdminPurchaseProps {
  products?: Product[];
  tenantId?: string;
  categories?: Category[];
  storeInfo?: {
    name: string;
    address: string;
    phone: string;
  };
}

const AdminPurchase: React.FC<AdminPurchaseProps> = ({ products = [], tenantId, categories = [], storeInfo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [showBarcodeInput, setShowBarcodeInput] = useState(false);
  const [cart, setCart] = useState<PurchaseItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>(products);
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [discount, setDiscount] = useState<number | string>(0);
  const [deliveryCharge, setDeliveryCharge] = useState<number | string>(0);

  // View state
  const [showPurchaseReport, setShowPurchaseReport] = useState(false);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Payment panel states
  const [showCashPanel, setShowCashPanel] = useState(false);
  const [showDuePanel, setShowDuePanel] = useState(false);
  const [dueTabType, setDueTabType] = useState<'customer' | 'supplier'>('supplier');

  // Confirmation dialog states
  const [showCashConfirmation, setShowCashConfirmation] = useState(false);
  const [showDueConfirmation, setShowDueConfirmation] = useState(false);

  // Invoice modal state
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  // Add Product Panel State
  const [showAddProductPanel, setShowAddProductPanel] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile menu state for purchase records
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null);

  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    dateOfPurchase: new Date().toISOString().split('T')[0],
    amount: 0,
    cashPaid: 0,
    note: '',
    supplierName: '',
    mobileNumber: '',
    countryCode: '+88',
    address: '',
    customInvoiceNumber: false,
    invoiceNumber: '',
    employeeInfo: false,
    employeeName: '',
    employeeNumber: '',
    sendSMS: false
  });

  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name: '',
    currentStock: 0,
    purchasePrice: 0,
    sellPrice: 0,
    unit: '',
    category: '',
    subCategory: '',
    description: '',
    sellOnline: false,
    sellInBulk: false,
    lowStockAlert: false,
    vatApplicable: false,
    warranty: false,
    discount: false,
    barcode: false,
    image: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (tenantId) {
        try {
          if (products.length === 0) {
            const data = await DataService.getProducts(tenantId);
            setProductsList(data || []);
          }
          if (categories.length === 0) {
            const cats = await DataService.getCatalog('categories', [], tenantId);
            setCategoriesList(cats || []);
          }
        } catch (error) {
          console.error('Error loading data:', error);
        }
      }
    };
    loadData();
  }, [products, categories, tenantId]);

  useEffect(() => {
    if (products.length > 0) setProductsList(products);
    if (categories.length > 0) setCategoriesList(categories);
  }, [products, categories]);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubCategories = async () => {
      if (newProduct.category && tenantId) {
        try {
          const allSubs = await DataService.getCatalog('subcategories', [], tenantId);
          const filteredSubs = allSubs.filter((sub: any) => sub.category === newProduct.category || sub.parentCategory === newProduct.category);
          setSubCategories(filteredSubs || []);
        } catch (error) {
          console.error('Error loading subcategories:', error);
          setSubCategories([]);
        }
      } else {
        setSubCategories([]);
      }
    };
    loadSubCategories();
  }, [newProduct.category, tenantId]);

  // Load purchase records
  const loadPurchaseRecords = async () => {
    if (!tenantId) return;
    try {
      const response = await fetch('/api/purchases', {
        headers: { 'X-Tenant-Id': tenantId, ...getAuthHeader() }
      });
      if (response.ok) {
        const data = await response.json();
        setPurchaseRecords(data || []);
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  };

  useEffect(() => {
    if (showPurchaseReport && tenantId) {
      loadPurchaseRecords();
    }
  }, [showPurchaseReport, tenantId]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return productsList;
    const query = searchQuery.toLowerCase();
    return productsList.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    );
  }, [productsList, searchQuery]);

  const generateSKU = (product: Product) => {
    const prefix = product.category?.substring(0, 2).toUpperCase() || 'PR';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  };

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        productImage: product.image || '',
        sku: product.sku || generateSKU(product),
        quantity: 1,
        price: product.costPrice || product.price || 0,
        total: product.costPrice || product.price || 0,
        stock: product.stock || 0
      }];
    });
  }, []);

  const handleBarcodeScan = useCallback(() => {
    if (!barcodeQuery.trim()) return;
    const product = productsList.find(p => p.sku?.toLowerCase() === barcodeQuery.toLowerCase());
    if (product) {
      addToCart(product);
      setBarcodeQuery('');
      toast.success(`Added ${product.name}`);
    } else {
      toast.error('Product not found with this barcode/SKU');
    }
  }, [barcodeQuery, productsList, addToCart]);

  const updateCartItem = (productId: number, field: keyof PurchaseItem, value: any) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'price') {
          updated.total = Number(updated.quantity) * Number(updated.price);
        }
        return updated;
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setDeliveryCharge(0);
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.total, 0), [cart]);
  const grandTotal = useMemo(() => cartTotal - (Number(discount) || 0) + (Number(deliveryCharge) || 0), [cartTotal, discount, deliveryCharge]);
  const getCartCount = (productId: number) => cart.find(item => item.productId === productId)?.quantity || 0;

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Open Cash Payment Panel
  const openCashPanel = () => {
    if (cart.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    // Show confirmation dialog first
    setShowCashConfirmation(true);
  };

  // Confirm and proceed with cash panel
  const proceedWithCashPanel = () => {
    setPaymentForm(prev => ({
      ...prev,
      dateOfPurchase: new Date().toISOString().split('T')[0],
      amount: grandTotal,
      cashPaid: grandTotal
    }));
    setShowCashConfirmation(false);
    setShowCashPanel(true);
  };

  // Open Due Payment Panel
  const openDuePanel = () => {
    if (cart.length === 0) {
      toast.error('Please add at least one product');
      return;
    }
    // Show confirmation dialog first
    setShowDueConfirmation(true);
  };

  // Confirm and proceed with due panel
  const proceedWithDuePanel = () => {
    setPaymentForm(prev => ({
      ...prev,
      dateOfPurchase: new Date().toISOString().split('T')[0],
      amount: grandTotal,
      cashPaid: 0
    }));
    setShowDueConfirmation(false);
    setShowDuePanel(true);
  };

  // Handle Cash Payment
  const handleCashPayment = async () => {
    if (!tenantId) { toast.error('Tenant ID is required'); return; }
    if (!paymentForm.supplierName.trim()) { toast.error('Supplier name is required'); return; }
    if (!paymentForm.mobileNumber.trim()) { toast.error('Mobile number is required'); return; }

    setIsSubmitting(true);
    try {
      const invoiceNum = paymentForm.customInvoiceNumber && paymentForm.invoiceNumber
        ? paymentForm.invoiceNumber
        : generateInvoiceNumber();

      const purchaseData = {
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          image: item.productImage,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.total
        })),
        totalAmount: grandTotal,
        subTotal: cartTotal,
        discount: Number(discount) || 0,
        deliveryCharge: Number(deliveryCharge) || 0,
        paymentType: 'cash',
        supplierName: paymentForm.supplierName,
        mobileNumber: paymentForm.countryCode + paymentForm.mobileNumber,
        address: paymentForm.address,
        note: paymentForm.note,
        cashPaid: grandTotal,
        dueAmount: 0,
        invoiceNumber: invoiceNum,
        employeeName: paymentForm.employeeInfo ? paymentForm.employeeName : '',
        employeeNumber: paymentForm.employeeInfo ? paymentForm.employeeNumber : '',
        dateOfPurchase: paymentForm.dateOfPurchase
      };

      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId, ...getAuthHeader() },
        body: JSON.stringify(purchaseData)
      });

      if (!response.ok) throw new Error('Failed to create purchase');

      // Show invoice
      setInvoiceData({
        invoiceNumber: invoiceNum,
        date: new Date().toLocaleString('bn-BD'),
        supplierName: paymentForm.supplierName,
        mobileNumber: paymentForm.countryCode + paymentForm.mobileNumber,
        address: paymentForm.address,
        items: cart,
        subTotal: cartTotal,
        discount: Number(discount) || 0,
        deliveryCharge: Number(deliveryCharge) || 0,
        grandTotal,
        paidAmount: grandTotal,
        dueAmount: 0,
        paymentType: 'cash',
        buyerName: 'admin'
      });

      setShowCashPanel(false);
      setShowInvoice(true);
      toast.success('Payment successful!');

      // Refresh products
      if (tenantId) {
        const data = await DataService.getProducts(tenantId);
        setProductsList(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Due Payment
  const handleDuePayment = async () => {
    if (!tenantId) { toast.error('Tenant ID is required'); return; }
    if (!paymentForm.supplierName.trim()) { toast.error('Supplier name is required'); return; }
    if (!paymentForm.mobileNumber.trim()) { toast.error('Mobile number is required'); return; }

    setIsSubmitting(true);
    try {
      const invoiceNum = paymentForm.customInvoiceNumber && paymentForm.invoiceNumber
        ? paymentForm.invoiceNumber
        : generateInvoiceNumber();

      const dueAmount = grandTotal - paymentForm.cashPaid;

      const purchaseData = {
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          image: item.productImage,
          sku: item.sku,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.total
        })),
        totalAmount: grandTotal,
        subTotal: cartTotal,
        discount: Number(discount) || 0,
        deliveryCharge: Number(deliveryCharge) || 0,
        paymentType: 'due',
        supplierName: paymentForm.supplierName,
        mobileNumber: paymentForm.countryCode + paymentForm.mobileNumber,
        address: paymentForm.address,
        note: paymentForm.note,
        cashPaid: paymentForm.cashPaid,
        dueAmount,
        invoiceNumber: invoiceNum,
        employeeName: paymentForm.employeeInfo ? paymentForm.employeeName : '',
        employeeNumber: paymentForm.employeeInfo ? paymentForm.employeeNumber : '',
        dateOfPurchase: paymentForm.dateOfPurchase,
        dueType: dueTabType
      };

      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId, ...getAuthHeader() },
        body: JSON.stringify(purchaseData)
      });

      if (!response.ok) throw new Error('Failed to create purchase');

      // Show invoice
      setInvoiceData({
        invoiceNumber: invoiceNum,
        date: new Date().toLocaleString('bn-BD'),
        supplierName: paymentForm.supplierName,
        mobileNumber: paymentForm.countryCode + paymentForm.mobileNumber,
        address: paymentForm.address,
        items: cart,
        subTotal: cartTotal,
        discount: Number(discount) || 0,
        deliveryCharge: Number(deliveryCharge) || 0,
        grandTotal,
        paidAmount: paymentForm.cashPaid,
        dueAmount,
        paymentType: 'due',
        buyerName: 'admin'
      });

      setShowDuePanel(false);
      setShowInvoice(true);
      toast.success('Purchase saved!');

      // Refresh products
      if (tenantId) {
        const data = await DataService.getProducts(tenantId);
        setProductsList(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save purchase');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close invoice and reset
  const closeInvoice = () => {
    setShowInvoice(false);
    setInvoiceData(null);
    clearCart();
    resetPaymentForm();
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      dateOfPurchase: new Date().toISOString().split('T')[0],
      amount: 0,
      cashPaid: 0,
      note: '',
      supplierName: '',
      mobileNumber: '',
      countryCode: '+88',
      address: '',
      customInvoiceNumber: false,
      invoiceNumber: '',
      employeeInfo: false,
      employeeName: '',
      employeeNumber: '',
      sendSMS: false
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tenantId', tenantId || 'default');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        const data = await response.json();
        setNewProduct(prev => ({ ...prev, image: data.url || data.imageUrl }));
        toast.success('Image uploaded');
      } else {
        const reader = new FileReader();
        reader.onload = () => setNewProduct(prev => ({ ...prev, image: reader.result as string }));
        reader.readAsDataURL(file);
      }
    } catch (error) {
      const reader = new FileReader();
      reader.onload = () => setNewProduct(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  // Handle add new product
  const handleAddNewProduct = async () => {
    if (!newProduct.name.trim()) { toast.error('Product name is required'); return; }
    if (!tenantId) { toast.error('Tenant ID is required'); return; }
    setIsAddingProduct(true);
    try {
      const productData = {
        name: newProduct.name,
        price: newProduct.sellPrice,
        costPrice: newProduct.purchasePrice,
        stock: newProduct.currentStock,
        category: newProduct.category,
        subCategory: newProduct.subCategory,
        description: newProduct.description,
        image: newProduct.image,
        unit: newProduct.unit,
        status: 'active',
        sku: `SKU-${Date.now().toString(36).toUpperCase()}`
      };
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Tenant-Id': tenantId, ...getAuthHeader() },
        body: JSON.stringify(productData)
      });
      if (!response.ok) throw new Error('Failed to add product');
      toast.success('Product added successfully!');
      const updatedProducts = await DataService.getProducts(tenantId);
      setProductsList(updatedProducts || []);
      resetNewProductForm();
      setShowAddProductPanel(false);
    } catch (error) {
      toast.error('Failed to add product');
    } finally {
      setIsAddingProduct(false);
    }
  };

  const resetNewProductForm = () => {
    setNewProduct({
      name: '', currentStock: 0, purchasePrice: 0, sellPrice: 0, unit: '', category: '', subCategory: '',
      description: '', sellOnline: false, sellInBulk: false, lowStockAlert: false, vatApplicable: false,
      warranty: false, discount: false, barcode: false, image: ''
    });
  };

  // Print invoice
  const handlePrint = () => {
    window.print();
  };

  // Calculate total purchases
  const totalPurchaseAmount = useMemo(() => {
    return purchaseRecords.reduce((sum, record) => sum + (record.totalAmount || 0), 0);
  }, [purchaseRecords]);

  // Group purchases by date
  const groupedPurchases = useMemo(() => {
    const groups: { [key: string]: PurchaseRecord[] } = {};
    purchaseRecords.forEach(record => {
      const date = new Date(record.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
    });
    return groups;
  }, [purchaseRecords]);

  const units = ['Pieces', 'Kg', 'Gram', 'Liter', 'ML', 'Meter', 'Box', 'Pack', 'Set', 'Pair'];

  // Purchase Report View
  if (showPurchaseReport) {
    return (
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 bg-white min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <button onClick={() => setShowPurchaseReport(false)} className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-sm sm:text-base">Purchase Report</span>
          </button>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
            <button className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm">
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Download/Print</span>
              <span className="xs:hidden">Print</span>
            </button>
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 rounded-lg font-medium text-xs sm:text-sm text-center xs:text-left">
              Total: <span className="text-blue-600">৳{totalPurchaseAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <input type="date" className="flex-1 xs:flex-initial px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm min-w-0" value={dateRange.start} onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))} />
              <span className="text-xs sm:text-sm">-</span>
              <input type="date" className="flex-1 xs:flex-initial px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg text-xs sm:text-sm min-w-0" value={dateRange.end} onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))} />
            </div>
            <button onClick={loadPurchaseRecords} className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg hover:bg-gray-50 text-xs sm:text-sm">
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {Object.entries(groupedPurchases).map(([date, records]: [string, PurchaseRecord[]]) => (
          <div key={date} className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-blue-600 font-medium">{date}</h3>
              <span className="text-blue-600">Total Purchase: ৳{records.reduce((sum, r) => sum + r.totalAmount, 0).toLocaleString()}</span>
            </div>
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record._id} className="p-3 sm:p-4 border rounded-lg hover:shadow-sm transition bg-white dark:bg-gray-800 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">#{record.purchaseNumber}</p>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-sm sm:text-base">Total Price: ৳{record.totalAmount}</p>
                      <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm">Total Item: {record.items?.length || 0}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{new Date(record.createdAt).toLocaleString()}</p>
                      {/* Mobile: Show supplier inline */}
                      <p className="sm:hidden text-gray-600 dark:text-gray-300 text-xs mt-1">
                        {record.supplierName ? `Supplier: ${record.supplierName}` : ''}
                      </p>
                    </div>
                    {/* Desktop: Right side info */}
                    <div className="hidden sm:block text-right">
                      {record.supplierName && <p className="text-gray-600 dark:text-gray-300">Supplier Name: {record.supplierName}</p>}
                      <span className={`inline-block px-3 py-1 rounded text-sm font-medium mt-2 ${record.paymentType === 'cash' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {record.paymentType?.toUpperCase() || 'CASH'}
                      </span>
                    </div>
                    {/* Mobile & Desktop: 3-dot menu */}
                    <div className="relative ml-2">
                      <button
                        onClick={() => setMobileMenuOpen(mobileMenuOpen === record._id ? null : record._id)}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                      </button>
                      {mobileMenuOpen === record._id && (
                        <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-10 py-1">
                          <button
                            onClick={() => {
                              setMobileMenuOpen(null);
                              toast.success('View purchase details');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => {
                              setMobileMenuOpen(null);
                              toast.success('Edit purchase');
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Mobile: Payment type badge */}
                  <div className="sm:hidden mt-2 flex justify-end">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${record.paymentType === 'cash' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {record.paymentType?.toUpperCase() || 'CASH'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {purchaseRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No purchase records found</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-3 md:p-4 bg-white min-h-screen relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <h1 className="text-base sm:text-lg font-semibold text-gray-900">Purchase</h1>
        <button onClick={() => setShowPurchaseReport(true)} className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium">
          View Purchase Report →
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {/* Left Panel - Product Selection */}
        <div className="bg-white border rounded-lg">
          <div className="p-2 sm:p-3 border-b">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Select Products to Purchase</h2>
            <div className="flex gap-1 sm:gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 sm:pl-9 pr-2 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              {showBarcodeInput && (
                <input type="text" placeholder="Barcode" value={barcodeQuery} onChange={(e) => setBarcodeQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleBarcodeScan()} autoFocus
                  className="flex-1 px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              )}
              <button onClick={() => setShowBarcodeInput(!showBarcodeInput)}
                className={`p-1.5 sm:p-2 border rounded-lg transition ${showBarcodeInput ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}>
                <ScanLine className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button onClick={() => setShowAddProductPanel(true)} className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto">
            {filteredProducts.map((product) => {
              const cartCount = getCartCount(product.id);
              return (
                <div key={product.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 border-b hover:bg-gray-50">
                  <img src={product.image || '/placeholder.png'} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg bg-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-medium text-blue-600 truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">
                      <span className="text-xs sm:text-sm text-gray-600">Price: {product.costPrice || product.price}</span>
                      <span className="text-xs sm:text-sm text-gray-500">Stock: {product.stock || 0}</span>
                    </div>
                  </div>
                  <div className="relative">
                    <button onClick={() => addToCart(product)}
                      className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-[#38BDF8] to-[#1E90FF] text-white rounded-lg hover:from-[#2BAEE8] hover:to-[#1A7FE8] text-xs sm:text-sm font-medium">
                      Add <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    {cartCount > 0 && <span className="absolute -top-1 sm:-to p-2 -right-1 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{cartCount}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Selected Products */}
        <div className="bg-white border rounded-lg flex flex-col">
          <div className="p-2 sm:p-3 border-b flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">Selected Products: ({cart.length})</h2>
            {cart.length > 0 && <button onClick={clearCart} className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">Clear cart</button>}
          </div>
          <div className="flex-1 overflow-y-auto max-h-[250px] sm:max-h-[300px] md:max-h-[350px]">
            {cart.length === 0 ? (
              <div className="p-4 sm:p-6 md:p-8 text-center text-gray-500">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mx-auto mb-2 sm:mb-3 text-gray-300" />
                <p className="text-xs sm:text-sm">No products selected</p>
                <p className="text-xs mt-1">Add products from the left panel</p>
              </div>
            ) : (
                cart.map((item) => (
                  <div key={item.productId} className="p-2 sm:p-3 border-b">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <img src={item.productImage || '/placeholder.png'} alt={item.productName} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-cover rounded-lg bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 sm:gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-medium truncate">{item.productName}</h3>
                            <span className="inline-block px-1.5 sm:px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded mt-0.5 sm:mt-1">Stock {item.stock}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                            <input type="text" value={item.sku} onChange={(e) => updateCartItem(item.productId, 'sku', e.target.value)}
                              className="w-24 sm:w-28 md:w-32 px-1.5 sm:px-2 py-1 sm:py-1.5 border border-gray-300 rounded text-sm" placeholder="SKU" />
                            <button className="p-1 sm:p-1.5 border border-gray-300 rounded hover:bg-gray-50"><ScanLine className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" /></button>
                            <button className="p-1 sm:p-1.5 border border-gray-300 rounded hover:bg-gray-50 flex items-center text-xs text-gray-600">
                              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" /><span className="hidden sm:inline ml-1">expire</span>
                            </button>
                            <button onClick={() => removeFromCart(item.productId)} className="p-1 sm:p-1.5 text-red-500 hover:bg-red-50 rounded"><X className="w-3 h-3 sm:w-4 sm:h-4" /></button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 mt-1.5 sm:mt-2 md:mt-3">
                          <div>
                            <label className="text-xs text-red-500 font-medium">Quantity *</label>
                            <input type="number" min="1" value={item.quantity} onChange={(e) => updateCartItem(item.productId, 'quantity', Number(e.target.value) || 1)}
                              className="w-full mt-0.5 sm:mt-1 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-red-500 font-medium">Price *</label>
                            <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateCartItem(item.productId, 'price', Number(e.target.value) || 0)}
                              className="w-full mt-0.5 sm:mt-1 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 border border-gray-300 rounded-lg text-xs sm:text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-red-500 font-medium">Total *</label>
                            <input type="text" value={item.total.toFixed(2)} readOnly className="w-full mt-0.5 sm:mt-1 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 border border-gray-200 rounded-lg text-xs sm:text-sm bg-gray-50" />
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              ))
            )}
          </div>

          {/* Expand/Collapse Button */}
          <div className="flex justify-center py-1 sm:py-2 border-t">
            <button className="p-0.5 sm:p-1 rounded-full bg-gray-100 hover:bg-gray-200"><ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" /></button>
          </div>

          {/* Totals Section */}
          <div className="p-2 sm:p-3 md:p-4 border-t bg-gray-50">
            <div className="space-y-1.5 sm:space-y-2 md:space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-medium">৳ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Discount</span>
                <div className="flex items-center gap-1 sm:gap-2">
                  <input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)}
                    className="w-20 sm:w-24 md:w-28 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 border border-gray-300 rounded text-sm text-right" />
                  <select className="px-1 sm:px-2 py-1 sm:py-1.5 border border-gray-300 rounded text-sm">
                    <option>৳</option>
                    <option>%</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-600">Delivery Charge</span>
                <input type="number" min="0" value={deliveryCharge} onChange={(e) => setDeliveryCharge(e.target.value)}
                  className="w-20 sm:w-24 md:w-28 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 border border-gray-300 rounded text-sm text-right" />
              </div>
              <div className="flex items-center justify-between pt-2 sm:pt-3 border-t">
                <span className="text-base sm:text-lg font-semibold">Grand Total</span>
                <span className="text-lg sm:text-xl font-bold text-blue-600">৳ {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Cash and Due Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3 md:mt-4">
              <button onClick={openCashPanel} disabled={cart.length === 0}
                className={`py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-lg font-medium text-white flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-900'}`}>
                Cash <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
              <button onClick={openDuePanel} disabled={cart.length === 0}
                className={`py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 rounded-lg font-medium text-white flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm ${cart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                Due <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Payment Panel */}
      {showCashPanel && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowCashPanel(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Confirm Payment</h2>
              <button onClick={() => setShowCashPanel(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Purchase</label>
                <div className="relative">
                  <input type="date" value={paymentForm.dateOfPurchase} onChange={(e) => setPaymentForm(prev => ({ ...prev, dateOfPurchase: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
                <input type="number" value={paymentForm.amount} readOnly className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <input type="text" value={paymentForm.note} onChange={(e) => setPaymentForm(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Note" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <div className="relative">
                  <input type="text" value={paymentForm.supplierName} onChange={(e) => setPaymentForm(prev => ({ ...prev, supplierName: e.target.value }))}
                    placeholder="Supplier Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-10" />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <div className="flex gap-2">
                  <select value={paymentForm.countryCode} onChange={(e) => setPaymentForm(prev => ({ ...prev, countryCode: e.target.value }))}
                    className="px-3 py-3 border border-gray-300 rounded-lg bg-white">
                    <option value="+88">🇧🇩 +88</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>
                  <input type="text" value={paymentForm.mobileNumber} onChange={(e) => setPaymentForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    placeholder="XXXXXXXXXXX" className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={paymentForm.address} onChange={(e) => setPaymentForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Address" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">Custom Invoice Number</span>
                <button onClick={() => setPaymentForm(prev => ({ ...prev, customInvoiceNumber: !prev.customInvoiceNumber }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${paymentForm.customInvoiceNumber ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${paymentForm.customInvoiceNumber ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              {paymentForm.customInvoiceNumber && (
                <input type="text" value={paymentForm.invoiceNumber} onChange={(e) => setPaymentForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="Enter Invoice Number" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              )}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">Employee Information</span>
                <button onClick={() => setPaymentForm(prev => ({ ...prev, employeeInfo: !prev.employeeInfo }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${paymentForm.employeeInfo ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${paymentForm.employeeInfo ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              {paymentForm.employeeInfo && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <div className="relative">
                      <input type="text" value={paymentForm.employeeName} onChange={(e) => setPaymentForm(prev => ({ ...prev, employeeName: e.target.value }))}
                        placeholder="Employee" className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-10" />
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee Number</label>
                    <div className="flex gap-2">
                      <select className="px-3 py-3 border border-gray-300 rounded-lg bg-white">
                        <option>🇧🇩 +88</option>
                      </select>
                      <input type="text" value={paymentForm.employeeNumber} onChange={(e) => setPaymentForm(prev => ({ ...prev, employeeNumber: e.target.value }))}
                        placeholder="XXXXXXXXXXX" className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center justify-center gap-2 mb-4">
                <button onClick={() => setPaymentForm(prev => ({ ...prev, sendSMS: !prev.sendSMS }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${paymentForm.sendSMS ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${paymentForm.sendSMS ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm">Send SMS</span>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded">💬 SMS Balance 30</span>
              </div>
              <button onClick={handleCashPayment} disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isSubmitting ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Due Payment Panel */}
      {showDuePanel && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDuePanel(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Money Given Entry</h2>
              <button onClick={() => setShowDuePanel(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Customer/Supplier Tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button onClick={() => setDueTabType('customer')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${dueTabType === 'customer' ? 'bg-white shadow' : 'text-gray-600'}`}>
                  CUSTOMER
                </button>
                <button onClick={() => setDueTabType('supplier')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${dueTabType === 'supplier' ? 'bg-white shadow' : 'text-gray-600'}`}>
                  SUPPLIER
                </button>
              </div>
              <div className="bg-gray-100 rounded-lg py-3 text-center">
                <span className="font-medium">Total payable {grandTotal.toFixed(0)}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Purchase</label>
                <div className="relative">
                  <input type="date" value={paymentForm.dateOfPurchase} onChange={(e) => setPaymentForm(prev => ({ ...prev, dateOfPurchase: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cash Paid <span className="text-red-500">*</span></label>
                <input type="number" value={paymentForm.cashPaid} onChange={(e) => setPaymentForm(prev => ({ ...prev, cashPaid: Number(e.target.value) || 0 }))}
                  placeholder="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" value={paymentForm.supplierName} onChange={(e) => setPaymentForm(prev => ({ ...prev, supplierName: e.target.value }))}
                    placeholder="Supplier Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-10" />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <select value={paymentForm.countryCode} onChange={(e) => setPaymentForm(prev => ({ ...prev, countryCode: e.target.value }))}
                    className="px-3 py-3 border border-gray-300 rounded-lg bg-white">
                    <option value="+88">🇧🇩 +88</option>
                  </select>
                  <input type="text" value={paymentForm.mobileNumber} onChange={(e) => setPaymentForm(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    placeholder="XXXXXXXXXXX" className="flex-1 px-4 py-3 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={paymentForm.address} onChange={(e) => setPaymentForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Address" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div className="relative">
                <input type="text" value={paymentForm.note} onChange={(e) => setPaymentForm(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Note" className="w-full px-4 py-3 border border-gray-300 rounded-lg pr-10" />
                <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">Custom Invoice Number</span>
                <button onClick={() => setPaymentForm(prev => ({ ...prev, customInvoiceNumber: !prev.customInvoiceNumber }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${paymentForm.customInvoiceNumber ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${paymentForm.customInvoiceNumber ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium">Employee Information</span>
                <button onClick={() => setPaymentForm(prev => ({ ...prev, employeeInfo: !prev.employeeInfo }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${paymentForm.employeeInfo ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${paymentForm.employeeInfo ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center justify-center gap-2 mb-4">
                <button onClick={() => setPaymentForm(prev => ({ ...prev, sendSMS: !prev.sendSMS }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${paymentForm.sendSMS ? 'bg-blue-600' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${paymentForm.sendSMS ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm">Send SMS</span>
                <span className="text-sm text-green-600 bg-green-100 px-2 py-0.5 rounded">💬 SMS Balance 30</span>
              </div>
              <button onClick={handleDuePayment} disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${isSubmitting ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900'}`}>
                {isSubmitting ? 'Processing...' : 'Save'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-green-600">Successful</h2>
              <button onClick={closeInvoice} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6" id="invoice-content">
              {/* Store Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">{storeInfo?.name || 'Store Name'}</h3>
                <p className="text-sm text-gray-600">{storeInfo?.address || 'Store Address'}</p>
                <p className="text-sm text-gray-600">{storeInfo?.phone || 'Store Phone'}</p>
              </div>
              <h4 className="text-center text-lg font-bold mb-4">ইনভয়েস</h4>
              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div><span className="text-gray-600">সাপ্লায়ার:</span> {invoiceData.supplierName || '[দেওয়া হয়নি]'}</div>
                <div className="text-right"><span className="text-gray-600">কিনেছেন:</span> {invoiceData.buyerName}</div>
                <div><span className="text-gray-600">মোবাইল:</span> {invoiceData.mobileNumber || '[দেওয়া হয়নি]'}</div>
                <div className="text-right"><span className="text-gray-600">ইনভয়েস নম্বর:</span> {invoiceData.invoiceNumber}</div>
                <div><span className="text-gray-600">ঠিকানা:</span> {invoiceData.address || '[দেওয়া হয়নি]'}</div>
                <div className="text-right"><span className="text-gray-600">তারিখ:</span> {invoiceData.date}</div>
              </div>
              {/* Items Table */}
              <div className="overflow-x-auto">
              <table className="w-full text-sm mb-4 border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 border text-left">#</th>
                    <th className="p-2 border text-left">পণ্যের নাম</th>
                    <th className="p-2 border text-center">পরিমাণ</th>
                    <th className="p-2 border text-center">ইউনিট</th>
                    <th className="p-2 border text-right">ইউনিট মূল্য</th>
                    <th className="p-2 border text-right">মোট</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceData.items.map((item, index) => (
                    <tr key={item.productId}>
                      <td className="p-2 border">{index + 1}.</td>
                      <td className="p-2 border">
                        <div>{item.productName}</div>
                        <div className="text-xs text-gray-500">বারকোড: {item.sku}</div>
                      </td>
                      <td className="p-2 border text-center">{item.quantity}</td>
                      <td className="p-2 border text-center">পিস</td>
                      <td className="p-2 border text-right">৳{item.price.toFixed(2)}</td>
                      <td className="p-2 border text-right">৳{item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td colSpan={3} className="p-2 border text-center">মোট</td>
                    <td className="p-2 border text-center">{invoiceData.items.reduce((s, i) => s + i.quantity, 0)}</td>
                    <td className="p-2 border"></td>
                    <td className="p-2 border text-right">৳{invoiceData.subTotal.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              </div>
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>পূর্বের বাকি: <span className="text-blue-600">৳ 0</span></p>
                  <p>বর্তমান বাকি: <span className="text-blue-600">৳ 0</span></p>
                  <p>টোটাল বাকি: <span className="text-blue-600">৳ 0</span></p>
                </div>
                <div className="text-right">
                  <p>সাব টোটাল: ৳{invoiceData.subTotal.toFixed(2)}</p>
                  <p>(-) ছাড়: ৳{invoiceData.discount}</p>
                  <p>ডেলিভারি: ৳{invoiceData.deliveryCharge}</p>
                  <p className="font-medium">মোট: ৳{invoiceData.grandTotal.toFixed(2)}</p>
                  <p>পরিশোধিত: ৳{invoiceData.paidAmount.toFixed(2)}</p>
                  <p>বাকি আছে: <span className="text-blue-600">৳{invoiceData.dueAmount.toFixed(2)}</span></p>
                </div>
              </div>
              <p className="text-sm mt-4">এমাউন্ট (কথায়):</p>
            </div>
            <div className="p-4 border-t">
              <button onClick={handlePrint} className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center gap-2">
                <Printer className="w-5 h-5" />
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Panel */}
      {showAddProductPanel && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setShowAddProductPanel(false); resetNewProductForm(); }} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">Add Product</h2>
              <button onClick={() => { setShowAddProductPanel(false); resetNewProductForm(); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
                {newProduct.image ? (
                  <img src={newProduct.image} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-blue-600">Click to upload</span>
                    <span className="text-xs text-gray-500">JPG, PNG up to 5MB</span>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                <input type="text" value={newProduct.name} onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Product Name" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                <input type="number" value={newProduct.currentStock} onChange={(e) => setNewProduct(prev => ({ ...prev, currentStock: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                  <input type="number" value={newProduct.purchasePrice} onChange={(e) => setNewProduct(prev => ({ ...prev, purchasePrice: Number(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sell Price <span className="text-red-500">*</span></label>
                  <input type="number" value={newProduct.sellPrice} onChange={(e) => setNewProduct(prev => ({ ...prev, sellPrice: Number(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Units</label>
                <select value={newProduct.unit} onChange={(e) => setNewProduct(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                  <option value="">Select Unit</option>
                  {units.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value, subCategory: '' }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                    <option value="">Select Category</option>
                    {categoriesList.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                  <select value={newProduct.subCategory} onChange={(e) => setNewProduct(prev => ({ ...prev, subCategory: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg" disabled={!newProduct.category}>
                    <option value="">Select Sub-Category</option>
                    {subCategories.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={newProduct.description} onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Product description" rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
              </div>
            </div>
            <div className="p-4 border-t flex gap-3">
              <button onClick={() => { setShowAddProductPanel(false); resetNewProductForm(); }}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAddNewProduct} disabled={isAddingProduct || !newProduct.name.trim()}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${isAddingProduct || !newProduct.name.trim() ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isAddingProduct ? 'Adding...' : 'Add New Product'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Cash Payment Confirmation Dialog */}
      {showCashConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Confirm Cash Payment</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-1">Are you sure you want to proceed with cash payment?</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Total Amount: <span className="font-bold text-blue-600">৳ {grandTotal.toFixed(2)}</span><br />
              Items: <span className="font-medium">{cart.length} product(s)</span>
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button onClick={() => setShowCashConfirmation(false)}
                className="flex-1 py-2 sm:py-2.5 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 text-sm sm:text-base">
                Cancel
              </button>
              <button onClick={proceedWithCashPanel}
                className="flex-1 py-2 sm:py-2.5 px-4 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 text-sm sm:text-base">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Due Payment Confirmation Dialog */}
      {showDueConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Confirm Due Payment</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-1">Are you sure you want to proceed with due payment?</p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Total Amount: <span className="font-bold text-blue-600">৳ {grandTotal.toFixed(2)}</span><br />
              Items: <span className="font-medium">{cart.length} product(s)</span>
            </p>
            <div className="flex gap-2 sm:gap-3">
              <button onClick={() => setShowDueConfirmation(false)}
                className="flex-1 py-2 sm:py-2.5 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 text-sm sm:text-base">
                Cancel
              </button>
              <button onClick={proceedWithDuePanel}
                className="flex-1 py-2 sm:py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm sm:text-base">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};  

export default AdminPurchase;
