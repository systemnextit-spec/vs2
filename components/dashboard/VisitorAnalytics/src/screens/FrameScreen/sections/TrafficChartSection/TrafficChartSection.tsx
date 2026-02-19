import React from 'react';

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
 */
export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-2">
      <div className="w-full max-w-7xl bg-[#f8fafc] rounded-2xl overflow-hidden shadow-xl p-4">
        <TrafficChartSection />
      </div>
    </div>
  );
}
