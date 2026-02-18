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
 * SVG Bar Chart Component
 * Renders a dynamic SVG grouped bar chart matching the Figma design
 */
const SVGBarChart: React.FC<{ data: ChartDataEntry[]; maxValue: number }> = ({ data, maxValue }) => {
  const chartHeight = 193;
  const barWidth = 24;
  const barGap = 4;
  const groupWidth = barWidth * 3 + barGap * 2; // 80
  const groupGap = Math.max(8, (689 - data.length * groupWidth) / Math.max(1, data.length - 1));
  const svgWidth = data.length * groupWidth + Math.max(0, data.length - 1) * groupGap;
  const svgHeight = chartHeight + 25;

  const getBarHeight = (value: number) => {
    if (value === 0 || maxValue === 0) return 0;
    return Math.max(24, (value / maxValue) * chartHeight);
  };

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMinYMax meet"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="barGradBlue" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#1E90FF" />
        </linearGradient>
        <linearGradient id="barGradOrange" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#FF9F1C" />
          <stop offset="1" stopColor="#FF6A00" />
        </linearGradient>
        <linearGradient id="barGradPurple" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#A08BFF" />
          <stop offset="1" stopColor="#5943FF" />
        </linearGradient>
      </defs>

      {data.map((day, i) => {
        const gx = i * (groupWidth + groupGap);
        const mH = getBarHeight(day.mobile);
        const tH = getBarHeight(day.tab);
        const dH = getBarHeight(day.desktop);

        const bars = [
          { h: mH, v: day.mobile, fill: 'url(#barGradBlue)', xOff: 0 },
          { h: dH, v: day.desktop, fill: 'url(#barGradPurple)', xOff: barWidth + barGap },
          { h: tH, v: day.tab, fill: 'url(#barGradOrange)', xOff: (barWidth + barGap) * 2 },
        ];

        return (
          <g key={i}>
            {bars.map((bar, j) => {
              if (bar.h <= 0) return null;
              const bx = gx + bar.xOff;
              const by = chartHeight - bar.h;
              const cx = bx + barWidth / 2;
              const cy = chartHeight - bar.h / 2;
              return (
                <g key={j}>
                  <rect
                    x={bx}
                    y={by}
                    width={barWidth}
                    height={bar.h}
                    fill={bar.fill}
                    rx="1"
                  />
                  {bar.h >= 28 && (
                    <text
                      x={cx}
                      y={cy}
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      transform={`rotate(-90 ${cx} ${cy})`}
                    >
                      {bar.v}
                    </text>
                  )}
                </g>
              );
            })}
            {/* Date label */}
            <text
              x={gx + groupWidth / 2}
              y={chartHeight + 16}
              fill="#4B494E"
              fontSize="11"
              fontWeight="500"
              textAnchor="middle"
            >
              {day.date}
            </text>
          </g>
        );
      })}
    </svg>
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

  // Always generate full 7-day range, filling zeros for days without data
  const displayChartData = (() => {
    const days: ChartDataEntry[] = [];
    const chartMap = new Map<string, ChartDataEntry>();
    
    // Index existing chart data by formatted date
    chartData.forEach(d => {
      chartMap.set(d.date, d);
    });
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d.toISOString());
      const existing = chartMap.get(dateStr);
      days.push(existing || {
        date: dateStr,
        mobile: 0,
        tab: 0,
        desktop: 0
      });
    }
    return days;
  })();

  // Calculate max value across all chart data for dynamic bar scaling
  const maxValue = Math.max(
      1,
      ...displayChartData.flatMap(d => [d.mobile, d.tab, d.desktop])
    );

  return (
    <div className="w-full p-6 bg-[#F8F9FA]">
      <div className="grid grid-cols-[400px_1fr] gap-5">
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

        {/* Right Side: SVG Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          {/* SVG Chart Area */}
          <div className="flex-1 flex items-end px-2">
            <SVGBarChart data={displayChartData} maxValue={maxValue} />
          </div>

          {/* Legend Section */}
          <div className="mt-6 flex flex-wrap justify-center gap-x-12 gap-y-4">
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
