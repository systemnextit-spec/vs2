import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import FigmaDashboardHeader from './FigmaDashboardHeader';
import { SidebarProps, DashboardHeaderProps } from './types';
import { Menu, X } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarProps?: Partial<SidebarProps>;
  headerProps?: DashboardHeaderProps;
  className?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  sidebarProps = {},
  headerProps = {},
  className = ""
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside
  const handleOverlayClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`flex min-h-screen bg-[#F8FAFC] dark:bg-gray-900 transition-colors duration-300 ${className}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar - Hidden on mobile, slide-in drawer */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50
        transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
        flex-shrink-0 w-[250px] bg-white dark:bg-gray-800 shadow-lg lg:shadow-sm border-r border-gray-100 dark:border-gray-700
      `}>
        <div className="sticky top-0 h-screen overflow-y-auto">
          {/* Logo + Close Button (mobile) */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              
              <span className="text-lg font-semibold text-gray-900 dark:text-white font-['Poppins']">
              <img src="https://hdnfltv.com/image/nitimages/04aad350-812e-4678-a009-7d576378b603.webp" alt="System Next IT" className="w-full h-auto" /> 
              </span>
            </div>
            {/* Close button - only on mobile */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 -mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <DashboardSidebar
            {...sidebarProps}
            className="p-3 sm:p-4"
            onNavigate={(item) => {
              sidebarProps.onNavigate?.(item);
              // Close sidebar on mobile after navigation
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] dark:bg-gray-900">
        {/* Header with burger menu */}
        <div className="flex-shrink-0 flex items-center">
          {/* Burger Menu Button - only on mobile */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 sm:p-3 m-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div className="flex-1">
            <FigmaDashboardHeader
              searchQuery=""
              onSearchChange={() => {}}
              {...headerProps}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 sm:space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
