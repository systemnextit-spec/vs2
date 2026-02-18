import React, { useEffect, useState } from 'react';

// Online Now Icon (Broadcast/Radio signal style)
const OnlineNowIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="19" cy="19" r="4" fill="#0EA5E9"/>
    <path d="M11 11C13.1217 8.87827 16.0435 7.68629 19.0833 7.68629C22.1232 7.68629 25.045 8.87827 27.1667 11" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M27.1667 27.1667C25.045 29.2884 22.1232 30.4804 19.0833 30.4804C16.0435 30.4804 13.1217 29.2884 11 27.1667" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M7 7C10.1826 3.81738 14.5435 2 19.0833 2C23.6232 2 27.984 3.81738 31.1667 7" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M31.1667 31.1667C27.984 34.3493 23.6232 36.1667 19.0833 36.1667C14.5435 36.1667 10.1826 34.3493 7 31.1667" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// Today s Icon (Users style)
const TodayVisitorsIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M26.5 28V26C26.5 24.4087 25.8679 22.8826 24.7426 21.7574C23.6174 20.6321 22.0913 20 20.5 20H11.5C9.90871 20 8.38258 20.6321 7.25736 21.7574C6.13214 22.8826 5.5 24.4087 5.5 26V28" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 16C19.3137 16 22 13.3137 22 10C22 6.68629 19.3137 4 16 4C12.6863 4 10 6.68629 10 10C10 13.3137 12.6863 16 16 16Z" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32.5 28V26C32.4987 24.6706 32.0478 23.3822 31.2217 22.3462C30.3957 21.3102 29.2446 20.5882 27.9583 20.3" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24.9583 4.3C26.2477 4.58649 27.4022 5.30895 28.2302 6.34696C29.0582 7.38497 29.5094 8.67688 29.5094 10.01C29.5094 11.3431 29.0582 12.635 28.2302 13.673C27.4022 14.711 26.2477 15.4335 24.9583 15.72" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Total Visitors Icon (Globe style)
const TotalVisitorsIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="19" cy="19" r="14" stroke="#4338CA" strokeWidth="2.5"/>
    <ellipse cx="19" cy="19" rx="7" ry="14" stroke="#4338CA" strokeWidth="2"/>
    <line x1="5" y1="19" x2="33" y2="19" stroke="#4338CA" strokeWidth="2"/>
    <line x1="19" y1="5" x2="19" y2="33" stroke="#4338CA" strokeWidth="2"/>
  </svg>
);

interface VisitorCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: number;
  theme: 'blue' | 'orange' | 'purple';
  loading?: boolean;
}

const VisitorCard: React.FC<VisitorCardProps> = ({
  icon,
  title,
  subtitle,
  value,
  theme,
  loading = false
}) => {
  const themes = {
    blue: {
      circleClass: 'bg-sky-500/20',
      titleColor: 'text-sky-500',
    },
    orange: {
      circleClass: 'bg-orange-500/25',
      titleColor: 'text-orange-600',
    },
    purple: {
      circleClass: 'bg-gradient-to-b from-violet-700/20 to-violet-900/20',
      titleColor: 'text-indigo-700',
    }
  };

  const config = themes[theme];

  return (
    <div className="w-full h-[81px] bg-white dark:bg-gray-800 rounded-lg shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10)] overflow-hidden flex items-center px-4 relative">
      {/* Background decorative circle */}
      <div className={`w-[198px] h-[198px] absolute -right-[37px] -top-[83px] ${config.circleClass} rounded-full`} />
      
      {/* Icon */}
      <div className="w-[38px] h-[38px] flex-shrink-0 z-10">
        {icon}
      </div>
      
      {/* Text */}
      <div className="flex-1 flex flex-col justify-center ml-4 min-w-0 z-10">
        <div className={`${config.titleColor} text-base font-medium font-['Poppins']`}>{title}</div>
        <div className="text-black dark:text-gray-300 text-[13px] font-normal font-['Poppins']">{subtitle}</div>
      </div>
      
      {/* Value */}
      <div className="text-black dark:text-white text-xl sm:text-2xl lg:text-xl sm:text-2xl lg:text-[28px] font-medium font-['Poppins'] flex-shrink-0 z-10">
        {loading ? (
          <div className="w-10 h-8 bg-gray-200 dark:bg-gray-600 animate-pulse rounded" />
        ) : (
          value
        )}
      </div>
    </div>
  );
};

interface FigmaVisitorStatsProps {
  visitorStats?: {
    onlineNow?: number;
    todayVisitors?: number;
    totalVisitors?: number;
    last7Days?: number;
    pageViews?: number;
  };
  tenantId?: string;
}

const FigmaVisitorStats: React.FC<FigmaVisitorStatsProps> = ({
  visitorStats,
  tenantId
}) => {
  const [stats, setStats] = useState({
    onlineNow: 0,
    todayVisitors: 0,
    totalVisitors: 0,
    last7Days: 0,
    pageViews: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If stats are passed as props, use them
    if (visitorStats) {
      setStats({
        onlineNow: visitorStats.onlineNow || 0,
        todayVisitors: visitorStats.todayVisitors || 0,
        totalVisitors: visitorStats.totalVisitors || 0,
        last7Days: visitorStats.last7Days || 0,
        pageViews: visitorStats.pageViews || 0
      });
      setLoading(false);
      return;
    }

    // Fetch from API
    const fetchStats = async () => {
      const activeTenantId = tenantId || localStorage.getItem('activeTenantId');
      if (!activeTenantId) {
        setLoading(false);
        return;
      }

      try {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        const apiUrl = isLocal ? 'http://localhost:5001' : `${window.location.protocol}//${hostname.split('.').slice(-2).join('.')}`;
        
        // Fetch stats and online count in parallel
        const [statsRes, onlineRes] = await Promise.all([
          fetch(`${apiUrl}/api/visitors/${activeTenantId}/stats?period=7d`),
          fetch(`${apiUrl}/api/visitors/${activeTenantId}/online`)
        ]);

        if (statsRes.ok && onlineRes.ok) {
          const statsData = await statsRes.json();
          const onlineData = await onlineRes.json();

          setStats({
            onlineNow: onlineData.online || 0,
            todayVisitors: statsData.todayVisitors || 0,
            totalVisitors: statsData.totalVisitors || 0,
            last7Days: statsData.periodVisitors || 0,
            pageViews: statsData.totalPageViews || 0
          });
        }
      } catch (error) {
        console.error('Error fetching visitor stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh online count every 30 seconds
    const interval = setInterval(async () => {
      const activeTenantId = tenantId || localStorage.getItem('activeTenantId');
      if (!activeTenantId) return;
      
      try {
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        const apiUrl = isLocal ? 'http://localhost:5001' : `${window.location.protocol}//${hostname.split('.').slice(-2).join('.')}`;
        const onlineRes = await fetch(`${apiUrl}/api/visitors/${activeTenantId}/online`);
        if (onlineRes.ok) {
          const onlineData = await onlineRes.json();
          setStats(prev => ({ ...prev, onlineNow: onlineData.online || 0 }));
        }
      } catch (error) {
        console.error('Error refreshing online count:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [visitorStats, tenantId]);

  return (
    <div className="h-full flex flex-col justify-center items-stretch gap-3.5">
      {/* Online Now - Blue theme */}
      <VisitorCard
        icon={<OnlineNowIcon />}
        title="Online Now"
        subtitle="Active visitors on site"
        value={stats.onlineNow}
        theme="blue"
        loading={loading}
      />
      
      {/* Today Visitors - Orange theme */}
      <VisitorCard
        icon={<TodayVisitorsIcon />}
        title="Today visitors"
        subtitle={`Last 7 days: ${stats.last7Days}`}
        value={stats.todayVisitors}
        theme="orange"
        loading={loading}
      />
      
      {/* Total Visitors - Purple theme */}
      <VisitorCard
        icon={<TotalVisitorsIcon />}
        title="Total visitors"
        subtitle={`${stats.pageViews} page view`}
        value={stats.totalVisitors}
        theme="purple"
        loading={loading}
      />
    </div>
  );
};

export default FigmaVisitorStats;
