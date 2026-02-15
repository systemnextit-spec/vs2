import React, { useMemo } from 'react';
import { Order } from '../../types';

interface ChartData {
  label: string;
  placedOrder: number;
  delivered: number;
  canceled: number;
}

interface FigmaSalesPerformanceProps {
  orders?: Order[];
  data?: ChartData[];
  timeFilter?: 'day' | 'month' | 'year' | 'all' | 'custom';
  selectedMonth?: Date;
}

const FigmaSalesPerformance: React.FC<FigmaSalesPerformanceProps> = ({
  orders = [],
  data: propData,
  timeFilter = 'year',
  selectedMonth = new Date()
}) => {

  // Last 5 years for yearly view
  const last5Years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => current - 4 + i); // oldest to newest
  }, []);

  // Calculate data based on timeFilter
  const chartData = useMemo(() => {
    const now = new Date();
    
    if (timeFilter === 'year') {
      // Show last 5 years
      const yearStats: ChartData[] = last5Years.map(year => ({
        label: String(year),
        placedOrder: 0,
        delivered: 0,
        canceled: 0
      }));

      orders.forEach(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        if (!orderDate) return;
        
        const orderYear = orderDate.getFullYear();
        const yearIndex = last5Years.indexOf(orderYear);
        if (yearIndex >= 0) {
          yearStats[yearIndex].placedOrder++;
          if (order.status === 'Delivered') yearStats[yearIndex].delivered++;
          if (order.status === 'Cancelled') yearStats[yearIndex].canceled++;
        }
      });

      return yearStats;
    } else if (timeFilter === 'month' || timeFilter === 'custom') {
      // Show days of selected month
      const targetYear = selectedMonth.getFullYear();
      const targetMonthNum = selectedMonth.getMonth();
      const daysInMonth = new Date(targetYear, targetMonthNum + 1, 0).getDate();
      
      const dailyStats: ChartData[] = Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        placedOrder: 0,
        delivered: 0,
        canceled: 0
      }));

      orders.forEach(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        if (!orderDate || orderDate.getMonth() !== targetMonthNum || orderDate.getFullYear() !== targetYear) return;
        
        const dayIndex = orderDate.getDate() - 1;
        if (dayIndex >= 0 && dayIndex < daysInMonth) {
          dailyStats[dayIndex].placedOrder++;
          if (order.status === 'Delivered') dailyStats[dayIndex].delivered++;
          if (order.status === 'Cancelled') dailyStats[dayIndex].canceled++;
        }
      });

      return dailyStats;
    } else if (timeFilter === 'day') {
      // Show hours of today
      const todayStats: ChartData[] = Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        placedOrder: 0,
        delivered: 0,
        canceled: 0
      }));

      orders.forEach(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        if (!orderDate || orderDate.toDateString() !== now.toDateString()) return;
        
        const hour = orderDate.getHours();
        todayStats[hour].placedOrder++;
        if (order.status === 'Delivered') todayStats[hour].delivered++;
        if (order.status === 'Cancelled') todayStats[hour].canceled++;
      });

      return todayStats;
    } else {
      // All time - show last 12 months
      const monthStats: ChartData[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthStats.push({
          label: date.toLocaleString('default', { month: 'short' }),
          placedOrder: 0,
          delivered: 0,
          canceled: 0
        });
      }

      orders.forEach(order => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        if (!orderDate) return;
        
        for (let i = 11; i >= 0; i--) {
          const checkDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
          if (orderDate.getMonth() === checkDate.getMonth() && orderDate.getFullYear() === checkDate.getFullYear()) {
            const idx = 11 - i;
            monthStats[idx].placedOrder++;
            if (order.status === 'Delivered') monthStats[idx].delivered++;
            if (order.status === 'Cancelled') monthStats[idx].canceled++;
            break;
          }
        }
      });

      return monthStats;
    }
  }, [orders, timeFilter, selectedMonth, last5Years]);

  // Use chartData directly - flat (zero) values when no orders
  const displayData = chartData;

  const maxValue = Math.max(100, ...displayData.map(d => Math.max(d.placedOrder, d.delivered, d.canceled)));
  
  // Creates sharp angular lines (not smooth curves)
  const createSharpPath = (values: number[], chartWidth: number, chartHeight: number) => {
    const points = values.map((value, index) => ({
      x: (index / (values.length - 1)) * chartWidth,
      y: chartHeight - (value / maxValue) * chartHeight
    }));
    if (points.length < 2) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    return path;
  };

  return (
    <div className="w-full h-80 sm:h-96 p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-zinc-200 dark:border-gray-700 flex flex-col justify-start items-start gap-2 overflow-hidden">
      {/* Header */}
      <div className="w-full flex justify-between items-center gap-2.5">
        <div className="text-zinc-800 dark:text-white text-lg font-bold font-['Lato']">Sale Performance</div>
      </div>

      {/* Legend - Wrap on mobile */}
      <div className="flex flex-wrap justify-start items-center gap-3 sm:gap-6">
        <div className="text-sky-400 text-sm font-bold font-['Poppins']">Placed Order</div>
        <div className="text-orange-500 text-sm font-bold font-['Poppins']">Order Delivered</div>
        <div className="text-red-600 text-sm font-bold font-['Poppins']">Order Cancel</div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full flex overflow-x-auto">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between h-full pr-2">
          {[100, 75, 50, 25, 0].map((val) => (
            <div key={val} className="w-6 h-9 opacity-50 text-right text-neutral-900 dark:text-gray-300 text-[10px] font-medium font-['Poppins'] flex items-center justify-end">
              {val}
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="flex-1 relative">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className="absolute w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-zinc-300 dark:outline-gray-600" 
              style={{ top: `${i * 25}%` }} 
            />
          ))}
          {/* Line chart */}
          <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 700 180" preserveAspectRatio="none">
            {/* Placed Order (sky-400) */}
            <path
              d={createSharpPath(displayData.map(d => d.placedOrder), 700, 180)}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2"
            />
            {/* Order Delivered (orange-500) */}
            <path
              d={createSharpPath(displayData.map(d => d.delivered), 700, 180)}
              fill="none"
              stroke="#F97316"
              strokeWidth="2"
            />
            {/* Order Cancel (red-700) */}
            <path
              d={createSharpPath(displayData.map(d => d.canceled), 700, 180)}
              fill="none"
              stroke="#B91C1C"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="w-full pl-8 inline-flex justify-between items-center">
        {displayData.map((item, i) => (
          <div key={i} className="opacity-50 text-neutral-900 dark:text-gray-300 text-[10px] font-medium font-['Poppins']">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FigmaSalesPerformance;
