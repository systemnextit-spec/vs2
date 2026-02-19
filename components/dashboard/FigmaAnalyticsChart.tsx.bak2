import React, { useEffect, useState } from 'react';

/**
 * Icons rendered as SVGs for efficiency and scalability
 */
const OnlineNowIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="2" fill={color} />
    <path d="M8 8C9.1 6.9 10.5 6.3 12 6.3C13.5 6.3 14.9 6.9 16 8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4 4C6.2 1.8 9.1 0.5 12 0.5C14.9 0.5 17.8 1.8 20 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const TodayVisitorsIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.5"/>
    <path d="M23 21V19C22.9992 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TotalVisitorsIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"/>
    <ellipse cx="12" cy="12" rx="5" ry="10" stroke={color} strokeWidth="1.5"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.5"/>
  </svg>
);

/**
 * Visitor Card: Responsive height to fill container on PC
 */
const VisitorCard = ({ icon, title, subtitle, value, bgColor, iconColor, titleColor, loading }) => (
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
      <div className="text-[11px] sm:text-[13px] text-gray-600 leading-tight mt-0.5 truncate opacity-80">
        {subtitle}
      </div>
    </div>
    
    <div className="text-xl sm:text-[28px] font-bold text-[#161719] z-10 ml-2 tabular-nums">
      {loading ? (
        <div className="w-10 h-8 bg-black/5 animate-pulse rounded" />
      ) : (
        value.toLocaleString()
      )}
    </div>
  </div>
);

const SVGBarChart = ({ data, maxValue }) => {
  const chartHeight = 160; 
  const barWidth = 22;
  const barGap = 3;
  const groupWidth = barWidth * 3 + barGap * 2; 
  const groupGap = 32; 
  
  // Increased buffer and added internal horizontal padding to prevent clipping
  const horizontalPadding = 10;
  const extraRightBuffer = 50; 
  const svgWidth = data.length * groupWidth + (data.length - 1) * groupGap + horizontalPadding * 2 + extraRightBuffer; 
  const svgHeight = chartHeight + 40;

  const getBarHeight = (value) => {
    if (value === 0 || maxValue === 0) return 4;
    return (value / maxValue) * chartHeight;
  };

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible"
    >
      <defs>
        <linearGradient id="barBlue" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#38BDF8" /><stop offset="1" stopColor="#1E90FF" /></linearGradient>
        <linearGradient id="barOrange" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#FF9F1C" /><stop offset="1" stopColor="#FF6A00" /></linearGradient>
        <linearGradient id="barPurple" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#A08BFF" /><stop offset="1" stopColor="#5943FF" /></linearGradient>
      </defs>
      {data.map((day, i) => {
        // Added horizontalPadding offset
        const gx = i * (groupWidth + groupGap) + horizontalPadding;
        const bars = [
          { h: getBarHeight(day.mobile), fill: 'url(#barBlue)', xOff: 0 },
          { h: getBarHeight(day.desktop), fill: 'url(#barPurple)', xOff: barWidth + barGap },
          { h: getBarHeight(day.tab), fill: 'url(#barOrange)', xOff: (barWidth + barGap) * 2 },
        ];
        return (
          <g key={i}>
            {bars.map((bar, j) => (
              <rect key={j} x={gx + bar.xOff} y={chartHeight - bar.h} width={barWidth} height={bar.h} fill={bar.fill} rx="3" />
            ))}
            <text x={gx + groupWidth / 2} y={chartHeight + 24} fill="#64748B" fontSize="11" fontWeight="600" textAnchor="middle">{day.date}</text>
          </g>
        );
      })}
    </svg>
  );
};

const FigmaAnalyticsChart = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ onlineNow: 0, todayVisitors: 0, totalVisitors: 0, last7Days: 0, pageViews: 0 });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ onlineNow: 124, todayVisitors: 1450, totalVisitors: 89420, last7Days: 12840, pageViews: 245000 });
      const mockData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          mobile: Math.floor(Math.random() * 500) + 200,
          tab: Math.floor(Math.random() * 200) + 50,
          desktop: Math.floor(Math.random() * 600) + 300,
        };
      });
      setChartData(mockData);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(1, ...chartData.flatMap(d => [d.mobile, d.tab, d.desktop]));

  return (
    <div className="bg-[#F1F5F9] p-4 sm:p-6 md:p-8 font-sans antialiased text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 lg:items-stretch">
          <section className="flex flex-col gap-4 lg:h-full">
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

          <main className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 flex flex-col lg:h-full min-h-[400px]">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Device Breakdown</h2>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Real-time</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center overflow-hidden">
              <div className="overflow-x-auto scrollbar-hide touch-pan-x">
                {/* Fixed the clipping issue by ensuring padding inside the scroll area */}
                <div className="min-w-max px-4 h-[220px]">
                  {loading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-slate-100 border-t-slate-400 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <SVGBarChart data={chartData} maxValue={maxValue} />
                  )}
                </div>
              </div>
            </div>

            <footer className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap justify-center sm:justify-start gap-x-8 gap-y-4 shrink-0">
              <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#38bdf8] to-[#1e90ff]" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Mobile</span></div>
              <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#ff9f1c] to-[#ff6a00]" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Tablet</span></div>
              <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-md bg-gradient-to-br from-[#a08bff] to-[#5943ff]" /><span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Desktop</span></div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default FigmaAnalyticsChart;