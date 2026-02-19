import React from 'react';
import { Users, Activity, Globe } from 'lucide-react';

/**
 * VisitorStatsSection Component
 */
const VisitorStatsSection = () => {
  const statsData = [
    {
      id: "online-now",
      title: "Online Now",
      subtitle: "Active visitors on site",
      value: "35",
      icon: <Activity className="w-4 h-4 text-[#008cff]" />,
      titleColor: "text-[#008cff]",
      bgColor: "bg-blue-50/50",
      circleColor: "bg-[#008cff15]",
    },
    {
      id: "today-visitors",
      title: "Today visitors",
      subtitle: "Last 7 days: 4",
      value: "35",
      icon: <Users className="w-4 h-4 text-[#ff5500]" />,
      titleColor: "text-[#ff5500]",
      bgColor: "bg-orange-50/50",
      circleColor: "bg-[#ff550015]",
    },
    {
      id: "total-visitors",
      title: "Total visitors",
      subtitle: "15 page view",
      value: "35",
      icon: <Globe className="w-4 h-4 text-[#3f34be]" />,
      titleColor: "text-[#3f34be]",
      bgColor: "bg-indigo-50/50",
      circleColor: "bg-[#3f34be15]",
    },
  ];

  return (
    <div className="flex flex-col gap-3 h-full">
      {statsData.map((stat) => (
        <article
          key={stat.id}
          className={`relative group overflow-hidden rounded-xl border border-slate-100 shadow-sm px-4 py-2 ${stat.bgColor} transition-all hover:shadow-md flex-1 flex items-center`}
        >
          {/* Decorative Circle */}
          <div className={`absolute -top-4 -right-4 w-24 h-24 rounded-full ${stat.circleColor} group-hover:scale-110 transition-transform duration-500`} />
          
          <div className="relative flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {stat.icon}
              </div>
              <div>
                <h3 className={`font-semibold text-xs sm:text-sm ${stat.titleColor}`}>
                  {stat.title}
                </h3>
                <p className="text-slate-500 text-[9px] font-medium uppercase tracking-wider">
                  {stat.subtitle}
                </p>
              </div>
            </div>
            <div className="text-xl font-bold text-slate-800 ml-2">
              {stat.value}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

/**
 * TrafficChartSection Component
 */
const TrafficChartSection = () => {
  const chartData = [
    { date: "JAN 25", mobile: 30, tab: 35, desktop: 40, desktopHeight: 100 },
    { date: "JAN 26", mobile: 30, tab: 35, desktop: 55, desktopHeight: 120 },
    { date: "JAN 27", mobile: 30, tab: 35, desktop: 70, desktopHeight: 160 },
    { date: "JAN 28", mobile: 30, tab: 35, desktop: 55, desktopHeight: 125 },
    { date: "JAN 29", mobile: 30, tab: 35, desktop: 40, desktopHeight: 100 },
    { date: "JAN 30", mobile: 30, tab: 35, desktop: 60, desktopHeight: 140 },
    { date: "JAN 31", mobile: 30, tab: 35, desktop: 40, desktopHeight: 100 },
  ];

  const legendItems = [
    { color: "bg-gradient-to-t from-[#1E90FF] to-[#38BDF8]", label: "Mobile" },
    { color: "bg-gradient-to-t from-[#FF6A00] to-[#FF9F1C]", label: "Tablet" },
    { color: "bg-gradient-to-t from-[#5943FF] to-[#A08BFF]", label: "Desktop" },
  ];

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col">
      <div className="relative flex-1 flex flex-col justify-between overflow-hidden">
        {/* Chart Main Area */}
        <div className="flex items-end h-[220px] relative mt-2">
          {/* Y-Axis Label */}
          <div className="absolute left-0 bottom-1/2 -translate-x-14 translate-y-1/2 -rotate-90 origin-center whitespace-nowrap text-slate-400 text-[9px] font-bold uppercase tracking-widest">
            Traffic Volume
          </div>
          
          <div className="w-px h-full bg-slate-200 ml-8 mr-4" />
          
          <div className="flex-1 flex justify-between items-end pr-4 h-full">
            {chartData.map((data, index) => (
              <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
                <div className="flex items-end gap-1 mb-2">
                  <div className="relative w-3 sm:w-5 h-[60px] bg-gradient-to-b from-[#38BDF8] to-[#1E90FF] rounded-t-sm" />
                  <div className="relative w-3 sm:w-5 h-[80px] bg-gradient-to-b from-[#FF9F1C] to-[#FF6A00] rounded-t-sm" />
                  <div 
                    className="relative w-3 sm:w-5 bg-gradient-to-b from-[#A08BFF] to-[#5943FF] rounded-t-sm"
                    style={{ height: `${data.desktopHeight}px` }}
                  />
                </div>
                <div className="text-[9px] text-slate-400 font-bold tracking-tighter">{data.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend Area */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-50">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Main App Component
 * Constrained to 1347px x 360px
 */
export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-2">
      {/* Container fixed to requested dimensions */}
      <div className="w-[1347px] h-[360px] max-w-full bg-[#f8fafc] rounded-2xl overflow-hidden shadow-xl p-4">
        <div className="grid grid-cols-12 gap-4 h-full items-stretch">
          
          {/* Sidebar Stats (25% width) */}
          <div className="col-span-3 h-full">
            <VisitorStatsSection />
          </div>
          
          {/* Main Chart (75% width) */}
          <div className="col-span-9 h-full">
            <TrafficChartSection />
          </div>
          
        </div>
      </div>
    </div>
  );
}