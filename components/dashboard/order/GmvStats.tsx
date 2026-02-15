import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

/**
 * MetricCardProps Interface
 * Defines the structure for each individual metric card.
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  additionalInfo?: {
    label: string;
    value: string;
  }[];
  showAction?: boolean;
}

const metricsData: MetricCardProps[] = [
  {
    title: "G M V",
    value: "0",
    subtitle: "Last 7 days",
    trend: {
      value: "0%",
      isPositive: true,
    },
  },
  {
    title: "AVG Order",
    value: "৳ 0",
    subtitle: "Per customer spend",
    trend: {
      value: "0%",
      isPositive: true,
    },
  },
  {
    title: "Courier Return (COD)",
    value: "৳0.00",
    additionalInfo: [
      {
        label: "Total Returned",
        value: "0",
      },
      {
        label: "Demurrage charges",
        value: "৳0.00",
      },
    ],
    showAction: true,
  },
];

/**
 * MetricCard Component
 * Renders individual metric boxes. Handles two distinct layouts:
 * 1. Standard: Title, Big Value, Trend, and Subtitle.
 * 2. Detailed: Title, Grid of info, and Action icon.
 */
const MetricCard = ({
  title,
  value,
  subtitle,
  trend,
  additionalInfo,
  showAction,
}: MetricCardProps) => {
  // Common container classes
  const containerClasses = "relative w-full p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-1 transition-all hover:shadow-md";

  // Layout for cards with detailed multi-point info (e.g., Courier Return)
  if (additionalInfo) {
    return (
      <article className={containerClasses}>
        <div className="flex justify-between items-start">
          <h2 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
            {title}
          </h2>
          {showAction && (
            <button className="text-gray-400 hover:text-blue-600 transition-colors">
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-4">
          {additionalInfo.map((info, index) => (
            <div key={index} className="flex flex-col">
              <span className="font-bold text-red-600 text-sm leading-tight">
                {info.value}
              </span>
              <span className="text-[9px] font-medium text-gray-400 uppercase tracking-tight">
                {info.label}
              </span>
            </div>
          ))}
        </div>
      </article>
    );
  }

  // Layout for standard numeric metrics
  return (
    <article className={containerClasses}>
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-gray-900 text-xs uppercase tracking-wider">
          {title}
        </h2>
        {subtitle && (
          <span className="text-[9px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded-full">
            {subtitle}
          </span>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div className="font-bold text-slate-800 text-xl leading-none">
          {value}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
            trend.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          }`}>
            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span className="text-[10px] font-bold leading-none">
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

/**
 * GmvStats Component
 * Displays a grid/list of metrics within a themed background.
 */
const GmvStats = () => {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3 dark:bg-gray-800">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Business Overview</h3>
      
      <div className="flex flex-col gap-2">
        {metricsData.map((metric, index) => (
          <MetricCard
            key={index}
            {...metric}
          />
        ))}
      </div>
    </div>
  );
};

export default GmvStats;