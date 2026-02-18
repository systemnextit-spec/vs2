import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import FigmaViewsChart from './FigmaViewsChart';
import CustomDateRangePicker, { DateRange } from './CustomDateRangePicker';

type DateRangeType = 'day' | 'month' | 'year' | 'all' | 'custom';

interface ChartDataPoint {
  date: string;
  mobile: number;
  tablet: number;
  desktop: number;
}

interface FigmaAnalyticsChartProps {
  timeFilter?: string;
  onTimeFilterChange?: (filter: string) => void;
  onDateRangeChange?: (range: { start: Date; end: Date }) => void;
  tenantId?: string;
  chartData?: ChartDataPoint[];
}

const FigmaAnalyticsChart: React.FC<FigmaAnalyticsChartProps> = ({
  timeFilter = 'December 2025',
  onTimeFilterChange = () => {},
  onDateRangeChange,
  tenantId,
  chartData: propChartData
}) => {
  const [dateRange, setDateRange] = useState<DateRangeType>('month');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const dateRangeOptions = [
    { id: 'day' as DateRangeType, label: 'Day' },
    { id: 'month' as DateRangeType, label: 'Month' },
    { id: 'year' as DateRangeType, label: 'Year' },
    { id: 'all' as DateRangeType, label: 'All Time' },
  ];

  // Fetch visitor chart data
  useEffect(() => {
    if (propChartData) {
      setChartData(propChartData);
      setLoading(false);
      return;
    }

    const fetchChartData = async () => {
      const activeTenantId = tenantId || localStorage.getItem('activeTenantId');
      if (!activeTenantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const hostname = window.location.hostname;
        const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
        const apiUrl = isLocal ? 'http://localhost:5001' : `${window.location.protocol}//${hostname.split('.').slice(-2).join('.')}`;
        
        let url = `${apiUrl}/api/visitors/${activeTenantId}/stats`;
        const params = new URLSearchParams();

        if (dateRange === 'custom' && customDateRange.startDate && customDateRange.endDate) {
          params.set('startDate', customDateRange.startDate.toISOString());
          params.set('endDate', customDateRange.endDate.toISOString());
        } else if (dateRange === 'month') {
          params.set('month', String(selectedMonth.getMonth() + 1));
          params.set('year', String(selectedMonth.getFullYear()));
        } else {
          params.set('period', dateRange);
        }

        const response = await fetch(`${url}?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setChartData(data.chartData || []);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [propChartData, tenantId, dateRange, selectedMonth, customDateRange]);

  // Get display data - last 7 entries or fill with empty
  const displayData = useMemo(() => {
    if (chartData.length === 0) {
      // Generate last 7 days as fallback
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push({
          date: date.toISOString().split('T')[0],
          mobile: 0,
          tablet: 0,
          desktop: 0
        });
      }
      return days;
    }
    return chartData.slice(-7);
  }, [chartData]);

  // Calculate max value for scaling bars
  const maxValue = useMemo(() => {
    return Math.max(
      100,
      ...displayData.flatMap(d => [d.mobile, d.tablet, d.desktop])
    );
  }, [displayData]);

  // Format date for display
  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  };

  // Calculate bar height (max 160px, min 8px for zero values, min 50px for values with data)
  const getBarHeight = (value: number) => {
    const maxHeight = 160;
    const minVisibleHeight = 8; // Very small for zero values
    if (value === 0) return minVisibleHeight;
    if (maxValue === 0) return minVisibleHeight;
    return Math.max(50, Math.round((value / maxValue) * maxHeight));
  };

  const handleDateRangeClick = (rangeType: DateRangeType) => {
    setDateRange(rangeType);
    setShowCustomPicker(false);
    onTimeFilterChange(rangeType);
    // Also notify parent of the date range
    if (onDateRangeChange) {
      onDateRangeChange({ start: selectedMonth, end: selectedMonth });
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedMonth(newMonth);
    onTimeFilterChange('month');
    if (onDateRangeChange) {
      onDateRangeChange({ start: newMonth, end: newMonth });
    }
  };

  const handleCustomApply = (range: DateRange) => {
    setCustomDateRange(range);
    setDateRange('custom');
    setShowCustomPicker(false);
    if (range.startDate && range.endDate && onDateRangeChange) {
      onDateRangeChange({ start: range.startDate, end: range.endDate });
    }
  };

  const formatCustomRange = () => {
    if (!customDateRange.startDate || !customDateRange.endDate) return 'Custom';
    const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    return `${formatDate(customDateRange.startDate)} - ${formatDate(customDateRange.endDate)}`;
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {/* Filters - Wrap on mobile */}
      <div className="flex flex-wrap justify-end items-center gap-1.5 sm:gap-2 relative">
        {dateRangeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleDateRangeClick(option.id)}
            className={`px-2 py-1 rounded-lg flex justify-center items-center gap-2.5 cursor-pointer transition-all ${
              dateRange === option.id
                ? 'bg-gradient-to-b from-orange-500 to-amber-500'
                : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <span className={`text-sm font-medium font-['Poppins'] ${
              dateRange === option.id ? 'text-white' : 'text-neutral-400 dark:text-gray-300'
            }`}>
              {option.label}
            </span>
          </button>
        ))}

        {/* Month Selector - shown when Month is selected */}
        {dateRange === 'month' && (
          <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg flex justify-center items-center gap-1 sm:gap-2">
            <button 
              onClick={() => handleMonthChange('prev')}
              className="text-white hover:opacity-80"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-white text-xs sm:text-sm font-normal font-['Lato'] min-w-[100px] text-center">
              {selectedMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </span>
            <button 
              onClick={() => handleMonthChange('next')}
              className="text-white hover:opacity-80"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Custom Date Range Display */}
        {dateRange === 'custom' && customDateRange.startDate && (
          <div className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-lg flex justify-center items-center gap-1">
            <span className="text-white text-xs sm:text-sm font-normal font-['Lato']">
              {formatCustomRange()}
            </span>
          </div>
        )}

        {/* Custom Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              if (dateRange === 'custom') {
                setShowCustomPicker(!showCustomPicker);
              } else {
                setShowCustomPicker(true);
              }
            }}
            className={`px-2 py-1 rounded-lg flex justify-center items-center gap-1.5 cursor-pointer transition-all ${
              dateRange === 'custom'
                ? 'bg-gradient-to-b from-orange-500 to-amber-500'
                : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <span className={`text-sm font-medium font-['Poppins'] ${
              dateRange === 'custom' ? 'text-white' : 'text-neutral-400 dark:text-gray-300'
            }`}>
              Custom
            </span>
            <ChevronDown size={14} className={`${dateRange === 'custom' ? 'text-white' : 'text-neutral-400'} ${showCustomPicker ? 'rotate-180' : ''} transition-transform`} />
          </button>
          
          <CustomDateRangePicker
            isOpen={showCustomPicker}
            onClose={() => setShowCustomPicker(false)}
            onApply={handleCustomApply}
            initialDateRange={customDateRange}
          />
        </div>
      </div>

      {/* Chart */}
      <FigmaViewsChart 
        data={displayData}
        loading={loading}
      />
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 md:gap-12 px-2 mt-4 pb-4">
        <div className="flex justify-center items-center gap-1.5 sm:gap-2.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full" />
          <div className="text-center text-neutral-600 dark:text-gray-400 text-[10px] sm:text-xs font-medium font-['DM_Sans']">Mobile View</div>
        </div>
        <div className="flex justify-center items-center gap-1.5 sm:gap-2.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full" />
          <div className="text-center text-neutral-600 dark:text-gray-400 text-[10px] sm:text-xs font-medium font-['DM_Sans']">Tab View</div>
        </div>
        <div className="flex justify-center items-center gap-1.5 sm:gap-2.5">
          <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-b from-violet-400 to-indigo-600 rounded-full" />
          <div className="text-center text-neutral-600 dark:text-gray-400 text-[10px] sm:text-xs font-medium font-['DM_Sans']">Desktop View</div>
        </div>
      </div>
    </div>
  );
};

export default FigmaAnalyticsChart;
