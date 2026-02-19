import React, { useEffect, useState } from 'react';

// === SVG Icons matching Figma design ===
const OnlineNowIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="2" fill={color} />
    <path d="M8 8C9.1 6.9 10.5 6.3 12 6.3C13.5 6.3 14.9 6.9 16 8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 4C6.2 1.8 9.1 0.5 12 0.5C14.9 0.5 17.8 1.8 20 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TodayVisitorsIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.5"/>
    <path d="M23 21V19C22.9992 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TotalVisitorsIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"/>
    <ellipse cx="12" cy="12" rx="5" ry="10" stroke={color} strokeWidth="1.5"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5"/>
  </svg>
);

// === Visitor Card ===
const VisitorCard = ({ icon, title, subtitle, value, bgColor, iconColor, titleColor, loading }: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: number;
  bgColor: string;
  iconColor: string;
  titleColor: string;
  loading?: boolean;
}) => (
  <div
    className="relative w-full h-[81px] lg:h-full rounded-2xl shadow-sm flex items-center px-4 sm:px-5 gap-3 sm:gap-4 overflow-hidden transition-all duration-200 hover:shadow-md active:scale-[0.98] lg:min-h-0"
    style={{ backgroundColor: bgColor }}
  >
    <div
      className="absolute w-[160px] h-[160px] rounded-full opacity-10 pointer-events-none"
      style={{
        background: `radial-gradient(circle, ${iconColor} 0%, transparent 70%)`,
        right: '-30px',
        top: '-50px'
      }}
    />
    <div className="w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] flex items-center justify-center z-10 shrink-0 bg-white/40 rounded-lg">
      {icon}
    </div>
    <div className="flex-1 z-10 min-w-0">
      <div className="font-bold text-sm sm:text-base leading-tight truncate" style={{ color: titleColor }}>
        {title}
      </div>
      <div className="text-[11px] sm:text-[13px] text-gray-600 dark:text-gray-400 leading-tight mt-0.5 truncate opacity-80">
        {subtitle}
      </div>
    </div>
    <div className="text-xl sm:text-[28px] font-bold text-[#161719] dark:text-white z-10 ml-2 tabular-nums">
      {loading ? (
        <div className="w-10 h-8 bg-black/5 dark:bg-white/10 animate-pulse rounded" />
      ) : (
        value.toLocaleString()
      )}
    </div>
  </div>
);

// === Traffic Chart Section (Figma Design) ===
const TrafficChartSection = ({ chartData, loading }: { chartData: any[]; loading: boolean }) => {
  const legendItems = [
    { color: "bg-[linear-gradient(90deg,rgba(56,189,248,1)_0%,rgba(30,144,255,1)_100%)]", label: "Mobile View" },
    { color: "bg-[linear-gradient(180deg,rgba(255,106,0,1)_0%,rgba(255,159,28,1)_100%)]", label: "Tab View" },
    { color: "bg-[linear-gradient(180deg,rgba(160,139,255,1)_0%,rgba(89,67,255,1)_100%)]", label: "Desktop View" },
  ];

  // Calculate dynamic heights based on max value
  const maxValue = Math.max(...chartData.flatMap(d => [d.mobile, d.tab, d.desktop]), 1);
  const getHeight = (value: number) => {
    const minHeight = 82;
    const maxHeight = 193;
    return Math.max(minHeight, Math.min(maxHeight, (value / maxValue) * maxHeight));
  };

  return (
    <div className="relative w-full h-[273px] bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      {loading ? (
        <div className="h-full w-full flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-400 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Y-axis label */}
          <div className="inline-flex h-[196px] items-center gap-2 absolute top-[13px] left-2.5">
            <div className="relative w-fit ml-[-39.50px] mr-[-31.50px] rotate-[-90.00deg] [font-family:'DM_Sans',Helvetica] font-normal text-[#4b494e] dark:text-gray-400 text-xs text-center tracking-[0] leading-[normal]">
              Units of measure
            </div>
            <div className="relative self-stretch w-px bg-gray-200 dark:bg-gray-600 mt-[-0.35px] mb-[-0.35px] mr-[-0.65px]" />
          </div>

          {/* Chart bars */}
          <div className="flex w-[689px] items-end justify-between absolute top-4 left-[47px]">
            {chartData.map((data, index) => (
              <div key={index} className="inline-flex flex-col items-center justify-center gap-1 relative flex-[0_0_auto]">
                <div className="inline-flex items-end gap-1 relative flex-[0_0_auto]">
                  {/* Mobile bar */}
                  <div className="relative w-6 bg-[linear-gradient(180deg,rgba(56,189,248,1)_0%,rgba(30,144,255,1)_100%)]" style={{ height: `${getHeight(data.mobile)}px` }}>
                    <div className="text-center absolute top-[5px] left-[calc(50.00%_-_10px)] -rotate-90 [font-family:'Lato',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal] whitespace-nowrap">
                      {data.mobile}
                    </div>
                  </div>

                  {/* Tablet bar */}
                  <div className="relative w-6 bg-[linear-gradient(180deg,rgba(255,159,28,1)_0%,rgba(255,106,0,1)_100%)]" style={{ height: `${getHeight(data.tab)}px` }}>
                    <div className="text-right absolute top-[5px] left-[calc(50.00%_-_10px)] -rotate-90 [font-family:'Lato',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal] whitespace-nowrap">
                      {data.tab}
                    </div>
                  </div>

                  {/* Desktop bar */}
                  <div className="relative w-6 bg-[linear-gradient(180deg,rgba(160,139,255,1)_0%,rgba(89,67,255,1)_100%)]" style={{ height: `${getHeight(data.desktop)}px` }}>
                    <div className="text-right absolute top-[5px] left-[calc(50.00%_-_10px)] -rotate-90 [font-family:'Lato',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal] whitespace-nowrap">
                      {data.desktop}
                    </div>
                  </div>
                </div>

                {/* Date label */}
                <div className="relative w-fit [font-family:'DM_Sans',Helvetica] font-normal text-[#4b494e] dark:text-gray-400 text-xs tracking-[0] leading-[normal]">
                  {data.date}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="inline-flex items-center gap-12 absolute top-[238px] left-[calc(50.00%_-_192px)]">
            {legendItems.map((item, index) => (
              <div key={index} className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
                <div className={`relative w-5 h-5 rounded-[22px] ${item.color}`} />
                <div className="relative w-fit [font-family:'DM_Sans',Helvetica] font-medium text-[#4b494e] dark:text-gray-400 text-xs text-center tracking-[0] leading-[normal]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// === Main Component ===
interface VisitorAnalyticsProps {
  tenantId?: string;
}

export const VisitorAnalytics: React.FC<VisitorAnalyticsProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ onlineNow: 0, todayVisitors: 0, totalVisitors: 0, last7Days: 0, pageViews: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const activeTenantId = tenantId || localStorage.getItem('activeTenantId');
    if (!activeTenantId) {
      setLoading(false);
      return;
    }

    const fetchVisitorData = async () => {
      try {
        setLoading(true);
        const hostname = window.location.hostname;
        const isLocal = hostname.includes('localhost');
        const apiUrl = isLocal ? 'http://localhost:5001' : `${window.location.protocol}//${hostname.split('.').slice(-2).join('.')}`;

        const [statsRes, onlineRes] = await Promise.all([
          fetch(`${apiUrl}/api/visitors/${activeTenantId}/stats?period=7d`),
          fetch(`${apiUrl}/api/visitors/${activeTenantId}/online`)
        ]);

        if (statsRes.ok && onlineRes.ok) {
          const statsData = await statsRes.json();
          const onlineData = await onlineRes.json();

          setStats({
            onlineNow: onlineData.count || 0,
            todayVisitors: statsData.today || 0,
            totalVisitors: statsData.total || 0,
            last7Days: statsData.last7Days || 0,
            pageViews: statsData.pageViews || 0
          });

          if (statsData.chartData && Array.isArray(statsData.chartData)) {
            setChartData(statsData.chartData.map((item: any) => ({
              date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              mobile: item.mobile || 0,
              tab: item.tablet || item.tab || 0,
              desktop: item.desktop || 0
            })));
          } else {
            setChartData(Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (6 - i));
              return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), mobile: 0, tab: 0, desktop: 0 };
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching visitor data:', error);
        setChartData(Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return { date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), mobile: 0, tab: 0, desktop: 0 };
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorData();

    // Refresh online count every 30 seconds
    const interval = setInterval(async () => {
      try {
        const hostname = window.location.hostname;
        const isLocal = hostname.includes('localhost');
        const apiUrl = isLocal ? 'http://localhost:5001' : `${window.location.protocol}//${hostname.split('.').slice(-2).join('.')}`;
        const onlineRes = await fetch(`${apiUrl}/api/visitors/${activeTenantId}/online`);
        if (onlineRes.ok) {
          const onlineData = await onlineRes.json();
          setStats(prev => ({ ...prev, onlineNow: onlineData.count || 0 }));
        }
      } catch (error) {
        console.error('Error refreshing online count:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [tenantId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5">
      {/* Left: Visitor Stat Cards */}
      <section className="lg:col-span-4 flex flex-col gap-4">
        <div className="flex-1">
          <VisitorCard
            icon={<OnlineNowIcon color="#0EA5E9" />}
            title="Online Now"
            subtitle="Active visitors browsing right now"
            value={stats.onlineNow}
            bgColor="rgba(14, 165, 233, 0.08)"
            iconColor="#0EA5E9"
            titleColor="#0369A1"
            loading={loading}
          />
        </div>
        <div className="flex-1">
          <VisitorCard
            icon={<TodayVisitorsIcon color="#F97316" />}
            title="Today Visitors"
            subtitle={`Last 7 days avg: ${Math.round(stats.last7Days / 7)}`}
            value={stats.todayVisitors}
            bgColor="rgba(249, 115, 22, 0.08)"
            iconColor="#F97316"
            titleColor="#C2410C"
            loading={loading}
          />
        </div>
        <div className="flex-1">
          <VisitorCard
            icon={<TotalVisitorsIcon color="#6366F1" />}
            title="Total Visitors"
            subtitle={`${(stats.pageViews / 1000).toFixed(1)}k cumulative views`}
            value={stats.totalVisitors}
            bgColor="rgba(99, 102, 241, 0.08)"
            iconColor="#6366F1"
            titleColor="#4338CA"
            loading={loading}
          />
        </div>
      </section>

      {/* Right: Traffic Chart (Figma Design) */}
      <div className="lg:col-span-8 min-w-0">
        <TrafficChartSection chartData={chartData} loading={loading} />
      </div>
    </div>
  );
};

export default VisitorAnalytics;
