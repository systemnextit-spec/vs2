import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { 
  Store, Settings, Eye, EyeOff, Save, ArrowLeft, Loader2, 
  CheckCircle2, AlertCircle, Palette, Layout, Grid, Move 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { StoreStudioConfig, Product } from '../../types';
import { DataService } from '../../services/DataService';
import { noCacheFetchOptions } from '../../utils/fetchHelpers';
import ProductOrderManager from './ProductOrderManager';

// Lazy load PageBuilder for the Layout tab
const PageBuilder = lazy(() => import('../PageBuilder').then(m => ({ default: m.PageBuilder })));

interface StoreStudioManagerProps {
  tenantId: string;
  onBack?: () => void;
  products?: Product[];
}

export const StoreStudioManager: React.FC<StoreStudioManagerProps> = ({
  tenantId,
  onBack,
  products = []
}) => {
  const [config, setConfig] = useState<StoreStudioConfig>({
    tenantId,
    enabled: false,
    productDisplayOrder: [],
    updatedAt: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'settings' | 'layout' | 'products'>('settings');
  
  // Ref to store the config before toggle for proper rollback
  const configBeforeToggleRef = useRef<StoreStudioConfig | null>(null);

  // Fetch store studio configuration
  useEffect(() => {
    const fetchConfig = async () => {
      if (!tenantId) return;
      
      setIsLoading(true);
      try {
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
        const response = await fetch(`${API_BASE_URL}/api/tenant-data/${tenantId}/store_studio_config`, noCacheFetchOptions);
        
        if (response.ok) {
          const data = await response.json();
          setConfig(data.data || {
            tenantId,
            enabled: false,
            productDisplayOrder: [],
            updatedAt: new Date().toISOString()
          });
        } else {
          // Handle non-OK responses
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || errorData.error || 'Failed to load store studio configuration';
          console.error('Failed to fetch store studio config:', errorMessage);
          toast.error(errorMessage);
        }
      } catch (error) {
        console.error('Failed to fetch store studio config:', error);
        toast.error('Failed to load store studio configuration');
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, [tenantId]);

  // Save store studio configuration
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/tenant-data/${tenantId}/store_studio_config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        toast.success('Store studio configuration saved successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to save configuration';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to save store studio config:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save configuration';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveConfig();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Toggle store studio enabled/disabled
  const handleToggleEnabled = async () => {
    // Store current config for rollback
    configBeforeToggleRef.current = config;
    
    // Create new config with toggled state
    const newConfig: StoreStudioConfig = {
      ...config,
      enabled: !config.enabled,
      updatedAt: new Date().toISOString()
    };
    
    // Optimistically update UI
    setConfig(newConfig);
    
    // Auto-save the toggle
    setIsSaving(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/tenant-data/${tenantId}/store_studio_config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });

      if (response.ok) {
        toast.success(`Store Studio ${newConfig.enabled ? 'enabled' : 'disabled'}!`);
        configBeforeToggleRef.current = null; // Clear rollback ref on success
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || 'Failed to save configuration';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Failed to toggle store studio:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update configuration';
      toast.error(errorMessage);
      // Revert to the previous config stored in ref
      if (configBeforeToggleRef.current) {
        setConfig(configBeforeToggleRef.current);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Save product order
  const handleSaveProductOrder = async (order: number[]) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
      const response = await fetch(`${API_BASE_URL}/api/tenant-data/${tenantId}/product_display_order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productDisplayOrder: order }),
      });

      if (!response.ok) {
        throw new Error('Failed to save product order');
      }

      // Update local config
      setConfig(prev => ({
        ...prev,
        productDisplayOrder: order,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save product order:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Store Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 md:h-16 md:py-0">
            <div className="flex items-center gap-2 sm:gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                  <Store className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Store Studio</h1>
                  <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Design your store without code</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {config.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={handleToggleEnabled}
                  disabled={isSaving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enabled ? 'bg-green-500' : 'bg-gray-300'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={`Click to ${config.enabled ? 'disable' : 'enable'} Store Studio`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                {config.enabled ? (
                  <Eye className="w-5 h-5 text-green-500" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-t border-gray-200 -mb-px overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-shrink-0 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`flex-shrink-0 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'layout'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                <span className="whitespace-nowrap">Layout Builder</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-shrink-0 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4" />
                <span className="whitespace-nowrap">Product Order</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={activeTab === 'layout' ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Store Studio Settings</h2>
            
            {/* Status Card */}
            <div className={`p-4 rounded-lg mb-6 ${
              config.enabled 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-start gap-3">
                {config.enabled ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {config.enabled ? 'Store Studio is Active' : 'Store Studio is Inactive'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {config.enabled 
                      ? 'Your custom store design is being displayed to customers. You can edit layouts, colors, and product order in the other tabs.'
                      : 'Store is using the default design. Enable Store Studio above to start customizing your store layout and appearance.'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Visual Customization</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Change colors, fonts, spacing, and styling of every element in your store without writing any code.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Layout className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-gray-900">Layout Builder</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Drag and drop sections to create your perfect store layout. Add hero banners, product grids, and more.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Move className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-gray-900">Product Ordering</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Rearrange products to control which items appear first, second, and so on in your store.
                </p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-orange-600" />
                  <h3 className="font-medium text-gray-900">Live Preview</h3>
                </div>
                <p className="text-sm text-gray-600">
                  See changes in real-time with image and video previews before publishing to customers.
                </p>
              </div>
            </div>

            {/* Important Note */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Product checkout flow remains unchanged regardless of Store Studio settings. 
                Your customers will have the same smooth checkout experience.
              </p>
            </div>
          </div>
        )}

        {/* Layout Builder Tab */}
        {activeTab === 'layout' && (
          <div className="h-[calc(100vh-120px)]">
            <Suspense 
              fallback={
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading Layout Builder...</p>
                  </div>
                </div>
              }
            >
              <PageBuilder tenantId={tenantId} />
            </Suspense>
          </div>
        )}

        {/* Product Order Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <ProductOrderManager
              tenantId={tenantId}
              products={products}
              currentOrder={config.productDisplayOrder}
              onSave={handleSaveProductOrder}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreStudioManager;
