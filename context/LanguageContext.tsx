// Language Context and Hook for managing application language
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'bn'; // English and Bangla

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  tenantId?: string;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children, tenantId }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem(`language_${tenantId || 'default'}`) as Language;
    if (savedLang === 'en' || savedLang === 'bn') {
      setLanguageState(savedLang);
    }
  }, [tenantId]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(`language_${tenantId || 'default'}`, lang);
    
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  };

  const t = (key: string): string => {
    const translations = language === 'bn' ? translationsBn : translationsEn;
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// English Translations
const translationsEn: Record<string, string> = {
  // Dashboard Header
  'dashboard': 'Dashboard',
  'welcome': 'Welcome back',
  'overview': 'Business Overview',
  
  // Metrics
  'total_orders': 'Total Orders',
  'products_on_hand': 'Products on Hand',
  'pending_orders': 'Pending Orders',
  'confirmed_orders': 'Confirmed Orders',
  'low_stock': 'Low Stock',
  'visits': 'Visits',
  'revenue': 'Revenue',
  'language': 'Language',
  'reserved_price': 'Reserved Price',
  'to_be_reviewed': 'To be Reviewed',
  
  // Order Status
  'pending': 'Pending',
  'confirmed': 'Confirmed',
  'processing': 'Processing',
  'shipped': 'Shipped',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled',
  'returned': 'Returned',
  'on_hold': 'On Hold',
  'sent_to_courier': 'Sent to Courier',
  
  // Products
  'products': 'Products',
  'add_product': 'Add Product',
  'product_name': 'Product Name',
  'price': 'Price',
  'stock': 'Stock',
  'category': 'Category',
  'in_stock': 'In Stock',
  'out_of_stock': 'Out of Stock',
  
  // Orders
  'orders': 'Orders',
  'order_id': 'Order ID',
  'customer': 'Customer',
  'date': 'Date',
  'status': 'Status',
  'total': 'Total',
  'actions': 'Actions',
  'view_details': 'View Details',
  
  // Common
  'search': 'Search',
  'filter': 'Filter',
  'export': 'Export',
  'print': 'Print',
  'edit': 'Edit',
  'delete': 'Delete',
  'save': 'Save',
  'cancel': 'Cancel',
  'submit': 'Submit',
  'close': 'Close',
  'loading': 'Loading...',
  'no_data': 'No data available',
  
  // Business Report
  'business_report': 'Business Report',
  'expenses': 'Expenses',
  'income': 'Income',
  'profit_loss': 'Profit / Loss',
  'total_expense': 'Total Expense',
  'total_income': 'Total Income',
  
  // Store
  'home': 'Home',
  'shop': 'Shop',
  'cart': 'Cart',
  'checkout': 'Checkout',
  'my_account': 'My Account',
  'contact': 'Contact',
  'about_us': 'About Us',
  
  // Dates
  'today': 'Today',
  'yesterday': 'Yesterday',
  'this_week': 'This Week',
  'this_month': 'This Month',
  'this_year': 'This Year',
  
  // Messages
  'success': 'Success',
  'error': 'Error',
  'warning': 'Warning',
  'info': 'Info',
};

// Bangla Translations
const translationsBn: Record<string, string> = {
  // Dashboard Header
  'dashboard': 'ড্যাশবোর্ড',
  'welcome': 'স্বাগতম',
  'overview': 'ব্যবসায়িক সংক্ষিপ্ত বিবরণ',
  
  // Metrics
  'total_orders': 'মোট অর্ডার',
  'products_on_hand': 'মজুদ পণ্য',
  'pending_orders': 'অপেক্ষমাণ অর্ডার',
  'confirmed_orders': 'নিশ্চিত অর্ডার',
  'low_stock': 'কম স্টক',
  'visits': 'ভিজিট',
  'revenue': 'আয়',
  'language': 'ভাষা',
  'reserved_price': 'সংরক্ষিত মূল্য',
  'to_be_reviewed': 'পর্যালোচনা করতে হবে',
  
  // Order Status
  'pending': 'অপেক্ষমাণ',
  'confirmed': 'নিশ্চিত',
  'processing': 'প্রক্রিয়াধীন',
  'shipped': 'পাঠানো হয়েছে',
  'delivered': 'ডেলিভারি সম্পন্ন',
  'cancelled': 'বাতিল',
  'returned': 'ফেরত',
  'on_hold': 'আটকে আছে',
  'sent_to_courier': 'কুরিয়ারে পাঠানো',
  
  // Products
  'products': 'পণ্য',
  'add_product': 'পণ্য যোগ করুন',
  'product_name': 'পণ্যের নাম',
  'price': 'মূল্য',
  'stock': 'স্টক',
  'category': 'ক্যাটাগরি',
  'in_stock': 'স্টকে আছে',
  'out_of_stock': 'স্টক নেই',
  
  // Orders
  'orders': 'অর্ডার',
  'order_id': 'অর্ডার আইডি',
  'customer': 'ক্রেতা',
  'date': 'তারিখ',
  'status': 'অবস্থা',
  'total': 'মোট',
  'actions': 'কার্যক্রম',
  'view_details': 'বিস্তারিত দেখুন',
  
  // Common
  'search': 'খুঁজুন',
  'filter': 'ফিল্টার',
  'export': 'রপ্তানি',
  'print': 'প্রিন্ট',
  'edit': 'সম্পাদনা',
  'delete': 'মুছুন',
  'save': 'সংরক্ষণ',
  'cancel': 'বাতিল',
  'submit': 'জমা দিন',
  'close': 'বন্ধ করুন',
  'loading': 'লোড হচ্ছে...',
  'no_data': 'কোনো তথ্য নেই',
  
  // Business Report
  'business_report': 'ব্যবসায়িক রিপোর্ট',
  'expenses': 'খরচ',
  'income': 'আয়',
  'profit_loss': 'লাভ / ক্ষতি',
  'total_expense': 'মোট খরচ',
  'total_income': 'মোট আয়',
  
  // Store
  'home': 'হোম',
  'shop': 'দোকান',
  'cart': 'কার্ট',
  'checkout': 'চেকআউট',
  'my_account': 'আমার অ্যাকাউন্ট',
  'contact': 'যোগাযোগ',
  'about_us': 'আমাদের সম্পর্কে',
  
  // Dates
  'today': 'আজ',
  'yesterday': 'গতকাল',
  'this_week': 'এই সপ্তাহ',
  'this_month': 'এই মাস',
  'this_year': 'এই বছর',
  
  // Messages
  'success': 'সফল',
  'error': 'ত্রুটি',
  'warning': 'সতর্কতা',
  'info': 'তথ্য',
};

// Helper function for number formatting
export const formatNumber = (num: number, lang: Language): string => {
  if (lang === 'bn') {
    // Convert to Bangla numerals
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().split('').map(d => d === '.' ? '.' : d === ',' ? ',' : banglaDigits[parseInt(d)] || d).join('');
  }
  return num.toLocaleString('en-US');
};

// Helper function for currency formatting
export const formatCurrency = (amount: number, lang: Language): string => {
  const formatted = amount.toFixed(2);
  const symbol = '৳';
  
  if (lang === 'bn') {
    const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const banglaNumber = formatted.split('').map(d => 
      d === '.' ? '.' : d === ',' ? ',' : banglaDigits[parseInt(d)] || d
    ).join('');
    return `${symbol}${banglaNumber}`;
  }
  
  return `${symbol}${formatted}`;
};
