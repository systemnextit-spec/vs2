import React, { useEffect, useState } from 'react';

// Icon components matching Figma design
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

interface VisitorCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: number;
  themeColors: {
    gradient: string;
    iconColor: string;
    titleColor: string;
  };
  loading?: boolean;
}

const VisitorCard: React.FC<VisitorCardProps> = ({
  icon,
  title,
  subtitle,
  value,
  themeColors,
  loading = false
}) => {
  const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '81px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
    borderRadius: '12px',
    boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.10)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: '16px',
    position: 'relative',
    overflow: 'hidden'
  };

  const ellipseStyle: React.CSSProperties = {
    position: 'absolute',
    width: '198px',
    height: '198px',
    right: '-37px',
    top: '-83px',
    background: themeColors.gradient,
    borderRadius: '50%',
    opacity: 0.2
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '38px',
    height: '38px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  };

  const textContainerStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 0,
    zIndex: 10
  };

  const titleStyle: React.CSSProperties = {
    color: themeColors.titleColor,
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '1.2',
    fontFamily: 'Poppins, sans-serif'
  };

  const subtitleStyle: React.CSSProperties = {
    color: '#161719',
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '1.2',
    fontFamily: 'Poppins, sans-serif',
    marginTop: '2px'
  };

  const valueStyle: React.CSSProperties = {
    color: '#161719',
    fontSize: '28px',
    fontWeight: 500,
    lineHeight: '1',
    fontFamily: 'Poppins, sans-serif',
    flexShrink: 0,
    zIndex: 10
  };

  const loadingStyle: React.CSSProperties = {
    width: '40px',
    height: '32px',
    backgroundColor: '#E5E7EB',
    borderRadius: '4px',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  };

  return (
    <div style={cardStyle}>
      <div style={ellipseStyle} />
      <div style={iconContainerStyle}>
        {icon}
      </div>
      <div style={textContainerStyle}>
        <div style={titleStyle}>{title}</div>
        <div style={subtitleStyle}>{subtitle}</div>
      </div>
      <div style={valueStyle}>
        {loading ? <div style={loadingStyle} /> : value}
      </div>
    </div>
  );
};

interface BarChartProps {
  chartData: Array<{
    date: string;
    mobile: number;
    tablet: number;
    desktop: number;
  }>;
  loading?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ chartData, loading = false }) => {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
    borderRadius: '12px',
    boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.10)',
    padding: '20px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  };

  const headerStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 500,
    color: '#161719',
    fontFamily: 'Poppins, sans-serif',
    marginBottom: '16px'
  };

  const chartAreaStyle: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: '40px'
  };

  const yAxisLabelStyle: React.CSSProperties = {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%) rotate(-90deg)',
    transformOrigin: 'center center',
    fontSize: '10px',
    color: '#4b494e',
    fontFamily: 'DM Sans, sans-serif',
    whiteSpace: 'nowrap'
  };

  const barsContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '689px',
    height: '200px',
    gap: '20px',
    paddingLeft: '40px'
  };

  const dayGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    flex: 1
  };

  const barsWrapperStyle: React.CSSProperties = {
    display: 'flex',
    gap: '4px',
    alignItems: 'flex-end'
  };

  const barStyle = (height: number, gradient: string): React.CSSProperties => ({
    width: '24px',
    height: `${height}px`,
    background: gradient,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '2px'
  });

  const barLabelStyle: React.CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '5px',
    transform: 'translateX(-50%) rotate(-90deg)',
    transformOrigin: 'center center',
    fontSize: '14px',
    fontWeight: 600,
    color: 'white',
    fontFamily: 'Lato, sans-serif',
    whiteSpace: 'nowrap'
  };

  const dateLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#4b494e',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 400
  };

  const legendContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    gap: '48px',
    marginTop: '20px'
  };

  const legendItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  const legendColorStyle = (gradient: string): React.CSSProperties => ({
    width: '20px',
    height: '20px',
    borderRadius: '22px',
    background: gradient,
    flexShrink: 0
  });

  const legendTextStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 500,
    color: '#4b494e',
    fontFamily: 'DM Sans, sans-serif'
  };

  // Color gradients matching Figma
  const mobileGradient = 'linear-gradient(180deg, #38bdf8 1.829%, #1e90ff 100%)';
  const tabletGradient = 'linear-gradient(180deg, #ff9f1c 0%, #ff6a00 100%)';
  const desktopGradient = 'linear-gradient(180deg, #a08bff 0%, #5943ff 100%)';

  // Scale values to fit chart height (max 200px)
  const getBarHeight = (value: number, maxValue: number): number => {
    const minHeight = 40;
    const maxHeight = 193;
    if (maxValue === 0) return minHeight;
    return Math.max(minHeight, Math.min(maxHeight, (value / maxValue) * maxHeight));
  };

  const maxValue = Math.max(
    ...chartData.flatMap(d => [d.mobile, d.tablet, d.desktop])
  );

  // Format date (e.g., "Jan 25")
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const day = date.getDate();
      return `${month} ${day}`;
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    const loadingContainerStyle: React.CSSProperties = {
      ...containerStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '300px'
    };

    const loadingTextStyle: React.CSSProperties = {
      fontSize: '14px',
      color: '#9CA3AF',
      fontFamily: 'Poppins, sans-serif'
    };

    return (
      <div style={loadingContainerStyle}>
        <div style={loadingTextStyle}>Loading chart data...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>Visitor Analytics</div>
        <div style={{ ...chartAreaStyle, justifyContent: 'center', fontSize: '14px', color: '#9CA3AF' }}>
          No data available
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>Visitor Analytics</div>
      
      <div style={chartAreaStyle}>
        <div style={yAxisLabelStyle}>Units of measure</div>
        
        <div style={barsContainerStyle}>
          {chartData.map((day, index) => (
            <div key={index} style={dayGroupStyle}>
              <div style={barsWrapperStyle}>
                {/* Mobile bar */}
                <div style={barStyle(getBarHeight(day.mobile, maxValue), mobileGradient)}>
                  <div style={barLabelStyle}>{day.mobile}</div>
                </div>
                
                {/* Tablet bar */}
                <div style={barStyle(getBarHeight(day.tablet, maxValue), tabletGradient)}>
                  <div style={barLabelStyle}>{day.tablet}</div>
                </div>
                
                {/* Desktop bar */}
                <div style={barStyle(getBarHeight(day.desktop, maxValue), desktopGradient)}>
                  <div style={barLabelStyle}>{day.desktop}</div>
                </div>
              </div>
              
              <div style={dateLabelStyle}>{formatDate(day.date)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={legendContainerStyle}>
        <div style={legendItemStyle}>
          <div style={legendColorStyle(mobileGradient)} />
          <div style={legendTextStyle}>Mobile View</div>
        </div>
        <div style={legendItemStyle}>
          <div style={legendColorStyle(tabletGradient)} />
          <div style={legendTextStyle}>Tab View</div>
        </div>
        <div style={legendItemStyle}>
          <div style={legendColorStyle(desktopGradient)} />
          <div style={legendTextStyle}>Desktop View</div>
        </div>
      </div>
    </div>
  );
};

interface FigmaVisitorStatsProps {
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
  tenantId?: string;
}

const FigmaVisitorStats: React.FC<FigmaVisitorStatsProps> = ({
  visitorStats,
  tenantId
}) => {
  const [stats, setStats] = useState({
    onlineNow: 0,
    todayVisitors: 0,
    totalVisitors: 0,
    last7Days: 0,
    pageViews: 0,
    chartData: [] as Array<{
      date: string;
      mobile: number;
      tablet: number;
      desktop: number;
    }>
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If stats are passed as props, use them
    if (visitorStats) {
      setStats({
        onlineNow: visitorStats.onlineNow || 0,
        todayVisitors: visitorStats.todayVisitors || 0,
        totalVisitors: visitorStats.totalVisitors || 0,
        last7Days: visitorStats.last7Days || 0,
        pageViews: visitorStats.pageViews || 0,
        chartData: visitorStats.chartData || []
      });
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
            pageViews: statsData.totalPageViews || 0,
            chartData: statsData.chartData || []
          });
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
  }, [visitorStats, tenantId]);

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '372px 1fr',
    gap: '20px',
    fontFamily: 'Poppins, sans-serif'
  };

  const cardsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  };

  const blueTheme = {
    gradient: 'radial-gradient(circle at 50% 50%, #38bdf8 0%, #1e90ff 100%)',
    iconColor: '#38bdf8',
    titleColor: '#008dff'
  };

  const orangeTheme = {
    gradient: 'radial-gradient(circle at 50% 50%, #ff9f1c 0%, #ff6a00 100%)',
    iconColor: '#ff6a00',
    titleColor: '#f50'
  };

  const purpleTheme = {
    gradient: 'radial-gradient(circle at 50% 50%, #a08bff 0%, #5943ff 100%)',
    iconColor: '#5943ff',
    titleColor: '#3f34be'
  };

  return (
    <div style={containerStyle}>
      {/* Left: Visitor Cards */}
      <div style={cardsContainerStyle}>
        <VisitorCard
          icon={<OnlineNowIcon color={blueTheme.iconColor} />}
          title="Online Now"
          subtitle="Active visitors on site"
          value={stats.onlineNow}
          themeColors={blueTheme}
          loading={loading}
        />
        
        <VisitorCard
          icon={<TodayVisitorsIcon color={orangeTheme.iconColor} />}
          title="Today visitors"
          subtitle={`Last 7 days: ${stats.last7Days}`}
          value={stats.todayVisitors}
          themeColors={orangeTheme}
          loading={loading}
        />
        
        <VisitorCard
          icon={<TotalVisitorsIcon color={purpleTheme.iconColor} />}
          title="Total visitors"
          subtitle={`${stats.pageViews} page view`}
          value={stats.totalVisitors}
          themeColors={purpleTheme}
          loading={loading}
        />
      </div>

      {/* Right: Bar Chart */}
      <BarChart chartData={stats.chartData} loading={loading} />
    </div>
  );
};

export default FigmaVisitorStats;
