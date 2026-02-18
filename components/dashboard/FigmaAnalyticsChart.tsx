import React, { useEffect, useState } from 'react';

/**
 * Types and Interfaces
 */
interface ChartDataEntry {
  date: string;
  mobile: number;
  tab: number;
  desktop: number;
}

interface BarProps {
  value: number;
  color: string;
}

interface BarGroupProps {
  date: string;
  data: ChartDataEntry;
}

interface VisitorCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: number;
  bgColor: string;
  iconColor: string;
  titleColor: string;
  loading?: boolean;
}

interface FigmaAnalyticsChartProps {
  timeFilter?: string;
  onTimeFilterChange?: (filter: string) => void;
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  tenantId?: string;
  visitorStats?: {
    onlineNow?: number;
    todayVisitors?: number;
    totalVisitors?: number;
    last7Days?: number;
    pageViews?: number;
    chartData?: Array<{
      date: string;
      mobile: number;
      tablet: number;
      desktop: number;
    }>;
  };
}

/**
 * Icon Components
 */
const OnlineNowIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="2" fill={color} />
    <path d="M8 8C9.1 6.9 10.5 6.3 12 6.3C13.5 6.3 14.9 6.9 16 8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 4C6.2 1.8 9.1 0.5 12 0.5C14.9 0.5 17.8 1.8 20 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TodayVisitorsIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.5"/>
    <path d="M23 21V19C22.9992 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TotalVisitorsIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"/>
    <ellipse cx="12" cy="12" rx="5" ry="10" stroke={color} strokeWidth="1.5"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5"/>
  </svg>
);

/**
 * Visitor Card Component
 */
const VisitorCard: React.FC<VisitorCardProps> = ({ icon, title, subtitle, value, bgColor, iconColor, titleColor, loading = false }) => {
  return (
    <div 
      className="relative w-full h-[81px] rounded-xl shadow-sm flex items-center px-5 gap-4 overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background Ellipse */}
      <div 
        className="absolute w-[198px] h-[198px] rounded-full opacity-20"
        style={{ 
          background: `radial-gradient(circle, ${iconColor} 0%, ${iconColor}88 100%)`,
          right: '-37px',
          top: '-83px'
        }}
      />
      
      {/* Icon */}
      <div className="w-[38px] h-[38px] flex items-center justify-center z-10">
        {icon}
      </div>
      
      {/* Text Content */}
      <div className="flex-1 z-10">
        <div className="font-medium text-base leading-tight" style={{ color: titleColor }}>
          {title}
        </div>
        <div className="text-[13px] text-[#161719] leading-tight mt-0.5">
          {subtitle}
        </div>
      </div>
      
      {/* Value */}
      <div className="text-[28px] font-medium text-[#161719] z-10">
        {loading ? (
          <div className="w-10 h-8 bg-gray-200 animate-pulse rounded" />
        ) : (
          value
        )}
      </div>
    </div>
  );
};

/**
 * Bar Component
 * Individual bar with height calculation and label
 */
const Bar: React.FC<BarProps> = ({ value, color }) => {
  // Scaling factor to make 70 fit nicely in the 160px container
  const height = (value / 75) * 160; 
  
  return (
    <div className="relative flex flex-col items-center group">
      <div 
        style={{ 
          height: `${height}px`,
          background: color
        }}
        className="w-6 flex items-center justify-center relative transition-all duration-300 hover:brightness-90 cursor-default rounded-t-sm"
      >
        <span className="rotate-[-90.00deg] text-white text-[10px] font-bold pointer-events-none">
          {value}
        </span>
      </div>
    </div>
  );
};

/**
 * BarGroup Component
 * Represents one day of data (3 bars grouped together)
 */
const BarGroup: React.FC<BarGroupProps> = ({ date, data }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-end gap-[2px] h-[160px]">
        <Bar value={data.mobile} color="linear-gradient(180deg, #38bdf8 1.829%, #1e90ff 100%)" />
        <Bar value={data.tab} color="linear-gradient(180deg, #ff9f1c 0%, #ff6a00 100%)" />
        <Bar value={data.desktop} color="linear-gradient(180deg, #a08bff 0%, #5943ff 100%)" />
      </div>
      <div className="mt-3 text-[11px] text-gray-500 font-medium">
        {date}
      </div>
    </div>
  );
};

/**
 * Format date string to "Jan 25" format
 */
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  } catch {
    return dateStr;
  }
};

/**
 * FigmaAnalyticsChart Component
 * Displays visitor stats cards alongside a multi-category bar chart with real data
 */
const FigmaAnalyticsChart: React.FC<FigmaAnalyticsChartProps> = ({
  tenantId,
  visitorStats: propStats
}) => {
  const [stats, setStats] = useState({
    onlineNow: 0,
    todayVisitors: 0,
    totalVisitors: 0,
    last7Days: 0,
    pageViews: 0
  });
  const [chartData, setChartData] = useState<ChartDataEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If stats are passed as props, use them
    if (propStats) {
      setStats({
        onlineNow: propStats.onlineNow || 0,
        todayVisitors: propStats.todayVisitors || 0,
        totalVisitors: propStats.totalVisitors || 0,
        last7Days: propStats.last7Days || 0,
        pageViews: propStats.pageViews || 0
      });
      if (propStats.chartData && propStats.chartData.length > 0) {
        setChartData(propStats.chartData.map(d => ({
          date: formatDate(d.date),
          mobile: d.mobile,
          tab: d.tablet,
          desktop: d.desktop
        })));
      }
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

          // Set chart data from API response
          if (statsData.chartData && statsData.chartData.length > 0) {
            setChartData(statsData.chartData.map((d: any) => ({
              date: formatDate(d.date),
              mobile: d.mobile || 0,
              tab: d.tablet || 0,
              desktop: d.desktop || 0
            })));
          }
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
  }, [propStats, tenantId]);

  // Generate default empty chart data if none from API
  const displayChartData = chartData.length > 0 ? chartData : (() => {
    const days: ChartDataEntry[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: formatDate(d.toISOString()),
        mobile: 0,
        tab: 0,
        desktop: 0
      });
    }
    return days;
  })();

  return (
    <div className="w-full p-6 bg-[#F8F9FA]">
      <div className="grid grid-cols-[300px_1fr] gap-5">
        {/* Left Side: Visitor Cards */}
        <div className="flex flex-col gap-3.5">
          <VisitorCard
            icon={<OnlineNowIcon color="#38bdf8" />}
            title="Online Now"
            subtitle="Active visitors on site"
            value={stats.onlineNow}
            bgColor="rgba(34, 161, 255, 0.08)"
            iconColor="#38bdf8"
            titleColor="#008dff"
            loading={loading}
          />
          
          <VisitorCard
            icon={<TodayVisitorsIcon color="#ff6a00" />}
            title="Today visitors"
            subtitle={`Last 7 days: ${stats.last7Days}`}
            value={stats.todayVisitors}
            bgColor="rgba(255, 130, 14, 0.08)"
            iconColor="#ff6a00"
            titleColor="#f50"
            loading={loading}
          />
          
          <VisitorCard
            icon={<TotalVisitorsIcon color="#5943ff" />}
            title="Total visitors"
            subtitle={`${stats.pageViews} page view`}
            value={stats.totalVisitors}
            bgColor="rgba(115, 97, 255, 0.08)"
            iconColor="#5943ff"
            titleColor="#3f34be"
            loading={loading}
          />
        </div>

        {/* Right Side: Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start">
            {/* Y-Axis Label Section */}
            <div className="flex items-center h-[180px] mr-4">
              <div className="rotate-[-90.00deg] text-gray-400 text-[10px] whitespace-nowrap w-8 select-none">
                Units of measure
              </div>
              {/* Simple Divider Line */}
              <div className="w-[1px] h-full bg-gray-100 ml-2" />
            </div>

            {/* Main Charting Area */}
            <div className="flex-1 flex justify-between items-end pl-4 pr-4">
              {displayChartData.map((day, idx) => (
                <BarGroup key={idx} date={day.date} data={day} />
              ))}
            </div>
          </div>

          {/* Legend Section */}
          <div className="mt-8 flex flex-wrap justify-center gap-x-12 gap-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#38bdf8] to-[#1e90ff]" />
              <span className="text-xs font-medium text-gray-600">Mobile View</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#ff9f1c] to-[#ff6a00]" />
              <span className="text-xs font-medium text-gray-600">Tab View</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-[#a08bff] to-[#5943ff]" />
              <span className="text-xs font-medium text-gray-600">Desktop View</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigmaAnalyticsChart;
