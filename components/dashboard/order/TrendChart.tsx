import { useState, useEffect, useMemo } from 'react';

interface TrendChartProps {
  visitorData?: number[][];
  orderData?: number[][];
}

export const TrendChart = ({ 
  visitorData = [[0, 0], [5, 0], [10, 0], [16, 0], [22, 0], [31, 0]],
  orderData = [[0, 0], [6, 0], [12, 0], [16, 0], [20, 0], [24, 0], [31, 0]],
}: TrendChartProps) => {
  const [isAnimated, setIsAnimated] = useState(false);

  // Check if there's actual data with non-zero values
  const hasData = useMemo(() => {
    const hasVisitorData = visitorData.some(d => d[1] > 0);
    const hasOrderData = orderData.some(d => d[1] > 0);
    return hasVisitorData || hasOrderData;
  }, [visitorData, orderData]);

  useEffect(() => {
    // Only animate if there's data
    if (hasData) {
      const timer = setTimeout(() => setIsAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [hasData]);

  // Should show animated chart only when animated AND has data
  const showAnimated = isAnimated && hasData;

  // Helper to convert data points to SVG path string
  const chartHeight = 100;
  
  const getPath = (data: number[][], animated: boolean) => {
    return data.map((p, i) => {
      const x = (p[0] / 31) * 400;
      // If not animated, keep y at bottom (flat line), otherwise show actual data
      const y = animated 
        ? chartHeight - (p[1] / 100) * chartHeight
        : chartHeight - 5; // Slightly above bottom for visibility
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
  };

  const getAreaPath = (linePath: string) => `${linePath} L400,${chartHeight} L0,${chartHeight} Z`;

  const visitorLine = getPath(visitorData, showAnimated);
  const orderLine = getPath(orderData, showAnimated);
  
  const yAxisValues = [100, 75, 50, 25, 0];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Area */}
      <div className="relative flex-1 flex">
        
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between h-full w-8 pr-2 flex-shrink-0">
          {yAxisValues.map((val) => (
            <div 
              key={val} 
              className="text-[10px] font-medium text-gray-400 text-right leading-none"
            >
              {val}
            </div>
          ))}
        </div>

        {/* Grid and Data Visualization */}
        <div className="relative flex-1">
          
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {yAxisValues.map((_, i) => (
              <div key={i} className="w-full h-px bg-gray-200" />
            ))}
          </div>

          {/* SVG Data Visualization */}
          <svg 
            className="absolute inset-0 w-full h-full overflow-visible" 
            viewBox="0 0 400 100" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="visitorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="orderArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF8A00" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#FF8A00" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            <path d={getAreaPath(visitorLine)} fill="url(#visitorArea)" style={{ transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            <path d={getAreaPath(orderLine)} fill="url(#orderArea)" style={{ transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)', transitionDelay: '0.15s' }} />

            <path d={visitorLine} fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2,2" style={{ transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            <path d={orderLine} fill="none" stroke="#FF8A00" strokeWidth="1.5" strokeDasharray="2,2" style={{ transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)', transitionDelay: '0.15s' }} />
          </svg>
        </div>
      </div>

      {/* X-Axis Labels */}
      <div className="flex justify-between pl-8 pt-1">
        {[1, 8, 15, 22, 31].map((day) => (
          <div key={day} className="text-[9px] font-medium text-gray-400 text-center">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendChart;