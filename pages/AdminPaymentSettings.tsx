import React, { useState, useEffect } from 'react';
import { PaymentMethod } from '../types';
import { 
  CheckCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2,
  Plus,
  Trash2,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

// Provider logos (SVG or image URLs)
const PROVIDER_LOGOS: Record<string, string> = {
  cod: '',
  bkash: 'https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg',
  nagad: 'https://nagad.com.bd/wp-content/uploads/2022/02/nagad-logo.png',
  rocket: '',
  sslcommerz: 'https://sslcommerz.com/wp-content/uploads/2021/11/sslcommerz.png',
  custom: ''
};

const PROVIDER_OPTIONS = [
  { value: 'cod', label: 'Cash On Delivery' },
  { value: 'bkash', label: 'Bkash' },
  { value: 'nagad', label: 'Nagad' },
  { value: 'rocket', label: 'Rocket' },
  { value: 'sslcommerz', label: 'SSLCommerz' },
  { value: 'custom', label: 'Custom' }
] as const;

const PAYMENT_TYPE_OPTIONS = [
  { value: 'send_money', label: 'Sent Money (Manual)' },
  { value: 'payment', label: 'Payment' },
  { value: 'merchant', label: 'Merchant Payment' },
  { value: 'agent', label: 'Agent Banking' }
] as const;

interface AdminPaymentSettingsProps {
  paymentMethods: PaymentMethod[];
  onSave: (methods: PaymentMethod[]) => void;
  onBack: () => void;
}

const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ 
  paymentMethods, 
  onSave, 
  onBack 
}) => {
  const [localMethods, setLocalMethods] = useState<PaymentMethod[]>([]);
  const [activeMethodId, setActiveMethodId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Ensure COD is always the first method
  const ensureDefaultMethods = (methods: PaymentMethod[]): PaymentMethod[] => {
    const hasCod = methods.some(m => m.provider === 'cod');
    if (!hasCod) {
      return [
        {
          id: 'cod-default',
          provider: 'cod',
          name: 'Cash On Delivery',
          isEnabled: true,
          tenantId: undefined
        },
        ...methods
      ];
    }
    return methods;
  };

  useEffect(() => {
    const methods = ensureDefaultMethods(paymentMethods || []);
    setLocalMethods(methods);
    if (methods.length > 0 && !activeMethodId) {
      setActiveMethodId(methods[0].id);
    }
  }, [paymentMethods]);

  const activeMethod = localMethods.find(m => m.id === activeMethodId);

  const handleUpdateMethod = (field: keyof PaymentMethod, value: any) => {
    setLocalMethods(prev => 
      prev.map(m => m.id === activeMethodId ? { ...m, [field]: value } : m)
    );
  };

  const handleAddMethod = () => {
    const newMethod: PaymentMethod = {
      id: `payment-${Date.now()}`,
      provider: 'bkash',
      name: 'Bkash',
      isEnabled: true,
      paymentType: 'send_money',
      accountNumber: '',
      paymentInstruction: ''
    };
    setLocalMethods(prev => [...prev, newMethod]);
    setActiveMethodId(newMethod.id);
    setIsFormVisible(true);
  };

  const handleDeleteMethod = (id: string) => {
    const method = localMethods.find(m => m.id === id);
    if (method?.provider === 'cod') {
      toast.error('Cannot delete Cash On Delivery method');
      return;
    }
    setLocalMethods(prev => prev.filter(m => m.id !== id));
    if (activeMethodId === id) {
      const remaining = localMethods.filter(m => m.id !== id);
      setActiveMethodId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleProviderChange = (provider: PaymentMethod['provider']) => {
    const providerLabel = PROVIDER_OPTIONS.find(p => p.value === provider)?.label || provider;
    handleUpdateMethod('provider', provider);
    handleUpdateMethod('name', providerLabel);
    handleUpdateMethod('logo', PROVIDER_LOGOS[provider] || '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      onSave(localMethods);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSaveSuccess(true);
      toast.success('Payment settings saved!');
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in w-full max-w-6xl mx-auto px-3 sm:px-4 lg:px-0">
      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button onClick={onBack} className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition flex-shrink-0">
          <ArrowLeft size={18} className="text-gray-600 sm:w-5 sm:h-5"/>
        </button>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">Payment Settings</h2>
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">Configure payment methods for your store checkout.</p>
        </div>
      </div>

      {/* Payment Method Cards - Compact Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        {localMethods.map((method) => {
          const isActive = activeMethodId === method.id;
          const isEnabled = method.isEnabled;

          return (
            <div 
              key={method.id}
              onClick={() => { setActiveMethodId(method.id); setIsFormVisible(true); }}
              className={`
                relative p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all duration-200
                ${isActive ? 'border-purple-600 bg-purple-50' : 'border-gray-200 bg-white hover:border-purple-200'}
              `}
            >
              <div className="flex justify-between items-start gap-1">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  {isEnabled ? (
                    <CheckCircle size={16} className="text-green-500 fill-green-100 flex-shrink-0 sm:w-5 sm:h-5" />
                  ) : (
                    <Circle size={16} className="text-gray-300 flex-shrink-0 sm:w-5 sm:h-5" />
                  )}
                  <div className="min-w-0">
                    <span className={`font-bold text-xs sm:text-sm block truncate ${isActive ? 'text-purple-700' : 'text-gray-700'}`}>
                      {method.name}
                    </span>
                    {method.provider !== 'cod' && (
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">{method.accountNumber || 'Not configured'}</p>
                    )}
                  </div>
                </div>
                {method.provider !== 'cod' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteMethod(method.id); }}
                    className="p-0.5 sm:p-1 hover:bg-red-100 rounded transition flex-shrink-0"
                  >
                    <Trash2 size={14} className="text-gray-400 hover:text-red-500 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
              
              {isActive && (
                <div className="text-[10px] sm:text-xs text-purple-600 font-medium flex items-center gap-1 mt-2 sm:mt-3">
                  {isFormVisible ? 'Hide' : 'Show'} 
                  {isFormVisible ? <ChevronUp size={10} className="sm:w-3 sm:h-3" /> : <ChevronDown size={10} className="sm:w-3 sm:h-3" />}
                </div>
              )}
            </div>
          );
        })}

        {/* Add New Payment Method Card */}
        <button
          onClick={handleAddMethod}
          className="p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 sm:gap-2 min-h-[70px] sm:min-h-[80px] lg:min-h-[100px] bg-gray-50 hover:bg-purple-50"
        >
          <Plus size={20} className="text-gray-400 sm:w-6 sm:h-6" />
          <span className="text-xs sm:text-sm font-medium text-gray-600 text-center">Add Payment</span>
        </button>
      </div>

      {/* Configuration Form */}
      {isFormVisible && activeMethod && (
        <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-to p-2">
          <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg truncate">{activeMethod.name} Configuration</h3>
              <p className="text-[10px] sm:text-xs text-gray-500">Configure this payment method for your customers.</p>
            </div>
            
            <label className="flex items-center gap-2 sm:gap-3 cursor-pointer flex-shrink-0">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Enable</span>
              <div className="relative inline-block w-10 sm:w-12 h-5 sm:h-6 transition duration-200 ease-in-out rounded-full border border-gray-300 bg-white">
                <input 
                  type="checkbox" 
                  className="absolute w-full h-full opacity-0 cursor-pointer"
                  checked={activeMethod.isEnabled}
                  onChange={(e) => handleUpdateMethod('isEnabled', e.target.checked)}
                />
                <span className={`block w-5 sm:w-6 h-5 sm:h-6 rounded-full shadow transition-transform duration-200 ${activeMethod.isEnabled ? 'translate-x-5 sm:translate-x-6 bg-green-500' : 'translate-x-0 bg-gray-300'}`}></span>
              </div>
            </label>
          </div>

          <form onSubmit={handleSave} className="p-3 sm:p-4 lg:p-6">
            {activeMethod.provider === 'cod' ? (
              <div className="text-center py-4 sm:py-6 lg:py-8">
                <div className="w-12 sm:w-14 lg:w-16 h-12 sm:h-14 lg:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <CheckCircle2 size={24} className="text-green-600 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
                </div>
                <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-1 sm:mb-2">Cash On Delivery</h4>
                <p className="text-gray-500 text-xs sm:text-sm">Default payment method. Customers pay when the order arrives.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Provider*</label>
                  <select 
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                    value={activeMethod.provider}
                    onChange={(e) => handleProviderChange(e.target.value as PaymentMethod['provider'])}
                  >
                    {PROVIDER_OPTIONS.filter(p => p.value !== 'cod').map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {(activeMethod.provider === 'bkash' || activeMethod.provider === 'nagad' || activeMethod.provider === 'rocket') && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                    <select 
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
                      value={activeMethod.paymentType || 'send_money'}
                      onChange={(e) => handleUpdateMethod('paymentType', e.target.value)}
                    >
                      {PAYMENT_TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Account Number*</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none pr-9"
                      placeholder="e.g., 01715332701"
                      value={activeMethod.accountNumber || ''}
                      onChange={(e) => handleUpdateMethod('accountNumber', e.target.value)}
                    />
                    {activeMethod.accountNumber && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeMethod.accountNumber || '')}
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                      >
                        <Copy size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Account holder name"
                    value={activeMethod.accountName || ''}
                    onChange={(e) => handleUpdateMethod('accountName', e.target.value)}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Payment Instruction</label>
                  <textarea 
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                    value={activeMethod.paymentInstruction || ''}
                    onChange={(e) => handleUpdateMethod('paymentInstruction', e.target.value)}
                    placeholder="Instructions for customers on how to make payment..."
                  ></textarea>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Shown to customers at checkout.</p>
                </div>
              </div>
            )}

            <div className="pt-4 sm:pt-5 lg:pt-6 border-t border-gray-100 mt-4 sm:mt-5 lg:mt-6 flex justify-end">
              <button 
                type="submit"
                disabled={isSaving}
                className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg font-bold text-sm transition-all duration-300 shadow-lg min-w-[120px] sm:min-w-[150px] lg:min-w-[180px] justify-center transform active:scale-95 ${
                  saveSuccess 
                    ? 'bg-emerald-500 text-white shadow-emerald-200' 
                    : isSaving 
                      ? 'bg-purple-500 text-white shadow-purple-200 cursor-wait' 
                      : 'bg-purple-600 text-white shadow-purple-200 hover:bg-purple-700'
                }`}
              >
                {saveSuccess ? (
                  <><CheckCircle2 size={16} className="animate-bounce sm:w-[18px] sm:h-[18px]" /> Saved!</>
                ) : isSaving ? (
                  <><Loader2 size={16} className="animate-spin sm:w-[18px] sm:h-[18px]" /> Saving...</>
                ) : (
                  <><Save size={16} className="sm:w-[18px] sm:h-[18px]" /> Save</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentSettings;
