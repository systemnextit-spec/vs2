import React, { useState, useEffect } from 'react';
import { Package, ClipboardList, Tag, TrendingUp, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage, formatNumber } from '../../context/LanguageContext';
import { OrderAnalyticsProps } from './types';

const OrderAnalytics: React.FC<OrderAnalyticsProps> = ({
  totalProducts,
  totalOrders,
  totalRevenue,
  lowStockProducts,
  toBeReviewed,
  reservedPrice = 0,
  notifications = []
}) => {
  const { language, setLanguage: setLang, t } = useLanguage();
  const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
  
  // Get current day info
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
  const currentDate = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });

  // Default notifications if none provided
  const displayNotifications = notifications.length > 0 ? notifications : [
    { id: '1', image: '/placeholder-notification.jpg', title: 'গ্রিপ দিল পাতা' }
  ];

  // Auto-rotate notifications
  useEffect(() => {
    if (displayNotifications.length > 1) {
      const interval = setInterval(() => {
        setCurrentNotificationIndex(prev => (prev + 1) % displayNotifications.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [displayNotifications.length]);

  const StatCard = ({ 
    value, 
    label, 
    icon: Icon, 
    className = '' 
  }: { 
    value: number | string; 
    label: string; 
    icon: React.ElementType; 
    className?: string;
  }) => (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow ${className}`}>
      <div>
        <div className="text-2xl sm:text-3xl font-bold text-slate-900">
          {typeof value === 'number' ? formatNumber(value, language) : value}
        </div>
        <div className="text-sm text-slate-500 mt-1">{label}</div>
      </div>
      <div className="p-2">
        <Icon className="w-6 h-6 text-slate-400" strokeWidth={1.5} />
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Section Title with blue left border */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          Order Analytics
        </h2>
      </div>
      
      {/* Row 1: 5 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
        {/* Products on Hands */}
        <StatCard 
          value={totalProducts} 
          label={t('products_on_hand') || 'Products on Hands'} 
          icon={Package} 
        />

        {/* Total Orders */}
        <StatCard 
          value={totalOrders} 
          label={t('total_orders') || 'Total Orders'} 
          icon={ClipboardList} 
        />

        {/* Language Switcher */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
          <div className="text-sm text-slate-500 mb-2">{t('language') || 'Language'}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                language === 'en' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Eng
            </button>
            <button
              onClick={() => setLang('bn')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                language === 'bn' 
                  ? 'bg-blue-500 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        {/* Calendar/Date */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white hover:shadow-md hover:shadow-blue-500/30 transition-shadow">
          <div className="text-sm text-blue-100 mb-1">{currentDate}</div>
          <div className="text-2xl sm:text-3xl font-bold">{currentDay}</div>
        </div>

        {/* Important Notification */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <div className="text-sm text-slate-500 mb-2">Important Notification</div>
          <div className="relative">
            {displayNotifications.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                  {displayNotifications[currentNotificationIndex]?.image && (
                    <img 
                      src={displayNotifications[currentNotificationIndex].image} 
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                </div>
                <div className="text-xs text-slate-700 line-clamp-2">
                  {displayNotifications[currentNotificationIndex]?.title}
                </div>
              </div>
            )}
            {displayNotifications.length > 1 && (
              <div className="flex justify-center gap-1 mt-2">
                {displayNotifications.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      idx === currentNotificationIndex ? 'bg-blue-500' : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: 3 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Reserved Price */}
        <StatCard 
          value={reservedPrice || totalRevenue} 
          label={t('reserved_price') || 'Reserved Price'} 
          icon={Tag} 
        />

        {/* Low Stock */}
        <StatCard 
          value={lowStockProducts} 
          label={t('low_stock') || 'Low Stock'} 
          icon={TrendingUp} 
        />

        {/* To be Reviewed */}
        <StatCard 
          value={toBeReviewed} 
          label={t('to_be_reviewed') || 'To be Reviewed'} 
          icon={MessageSquare} 
        />
      </div>
    </div>
  );
};

export default OrderAnalytics;
