import React from 'react';

interface FigmaOrderStatusProps {
  orderStats?: {
    pending?: number;
    confirmed?: number;
    courier?: number;
    delivered?: number;
    canceled?: number;
    returns?: number;
  };
}

const FigmaOrderStatus: React.FC<FigmaOrderStatusProps> = ({
  orderStats = {
    pending: 0,
    confirmed: 0,
    courier: 0,
    delivered: 0,
    canceled: 0,
    returns: 0
  }
}) => {
  const orderItems = [
    { label: 'Pending', value: orderStats.pending, bgColor: 'bg-amber-100', color: '#EAB308', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#EAB308" strokeWidth="2"/>
        <path d="M12 7V12L15 14" stroke="#EAB308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { label: 'Confirmed', value: orderStats.confirmed, bgColor: 'bg-green-100', color: '#16A34A', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#16A34A" strokeWidth="2"/>
        <path d="M8 12L11 15L16 9" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )},
    { label: 'Courier', value: orderStats.courier, bgColor: 'bg-orange-100', color: '#D97706', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 3H14V15H1V3Z" fill="#D97706"/>
        <path d="M14 7H18L21 10V15H14V7Z" fill="#D97706"/>
        <circle cx="5" cy="15" r="2.5" fill="white" stroke="#D97706" strokeWidth="1.5"/>
        <circle cx="17" cy="15" r="2.5" fill="white" stroke="#D97706" strokeWidth="1.5"/>
      </svg>
    )},
    { label: 'Delivered', value: orderStats.delivered, bgColor: 'bg-pink-100', color: '#BE185D', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8L12 4L20 8V16L12 20L4 16V8Z" stroke="#BE185D" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M12 12V20" stroke="#BE185D" strokeWidth="2"/>
        <path d="M12 12L20 8" stroke="#BE185D" strokeWidth="2"/>
        <path d="M12 12L4 8" stroke="#BE185D" strokeWidth="2"/>
      </svg>
    )},
    { label: 'Canceled', value: orderStats.canceled, bgColor: 'bg-red-100', color: '#DC2626', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#DC2626" strokeWidth="2"/>
        <path d="M15 9L9 15M9 9L15 15" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )},
    { label: 'Returns', value: orderStats.returns, bgColor: 'bg-blue-100', color: '#1D4ED8', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="#1D4ED8" strokeWidth="2"/>
        <path d="M15 12H9M9 12L12 9M9 12L12 15" stroke="#1D4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )}
  ];

  return (
    <div className="px-2 sm:px-4 md:px-5 lg:px-6 w-full">
      <h2 className="text-black dark:text-white text-base font-semibold mb-3 font-['Poppins']">Order</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
        {orderItems.map((item, index) => (
          <div key={index} className="h-12 bg-white dark:bg-gray-800 rounded-lg shadow-[0px_2px_9.6px_0px_rgba(0,0,0,0.08)] flex items-center px-2">
            <div className={`w-8 h-8 ${item.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
              {item.icon}
            </div>
            <div className="flex-1 ml-2 min-w-0">
              <div className="text-black dark:text-gray-300 text-[13px] font-normal font-['Poppins'] truncate">{item.label}</div>
            </div>
            <div className="text-black dark:text-white text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[28px] font-medium font-['Poppins'] flex-shrink-0">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FigmaOrderStatus;
