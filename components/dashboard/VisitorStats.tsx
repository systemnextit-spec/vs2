import React from 'react';
import { Wifi, Users, Globe } from 'lucide-react';
import { VisitorStatsProps } from './types';

const VisitorStats: React.FC<VisitorStatsProps> = ({ visitorStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {/* Online Now */}
      <div className="group bg-white border border-slate-100 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-200 transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform">
            <Wifi className="w-5 h-5 text-blue-500" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-400 font-medium mb-1">
              Online Now
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {visitorStats?.onlineNow || 35}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
              Active visitors on site
            </div>
          </div>
        </div>
      </div>

      {/* Today Visitors */}
      <div className="group bg-white border border-slate-100 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg hover:shadow-orange-500/20 hover:border-orange-200 transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 text-orange-500" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-400 font-medium mb-1">
              Today Visitors
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {visitorStats?.todayVisitors || 35}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
              Last 7 days: {visitorStats?.periodVisitors || 4}
            </div>
          </div>
        </div>
      </div>

      {/* Total Visitors */}
      <div className="group bg-white border border-slate-100 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 hover:border-indigo-200 transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg group-hover:scale-110 transition-transform">
            <Globe className="w-5 h-5 text-indigo-500" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="text-xs text-slate-400 font-medium mb-1">
              Total Visitors
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {visitorStats?.totalVisitors || 35}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
              {visitorStats?.totalPageViews || 15} page views
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorStats;
