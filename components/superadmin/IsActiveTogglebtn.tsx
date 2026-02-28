import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertCircle, Search, UserCheck, 
  UserX, Ban, PlayCircle, X, ChevronRight, 
  Loader2, Store, Building2, Globe
} from 'lucide-react';

// Status colors matching your main theme
const STATUS_COLORS = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  trialing: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-200' },
  suspended: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', border: 'border-red-200' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', border: 'border-gray-200' },
  pending: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
};

const IsActiveTogglebtn = ({ 
  tenants = [], 
  primaryDomain = 'allinbangla.com',
  onSelectTenant, // This is the required prop from your error
  isProcessing = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [actionModal, setActionModal] = useState(null); // { tenant, action }

  // Filter tenants based on search
  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subdomain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleActionClick = (tenant, action) => {
    setActionModal({ tenant, action });
  };

  const confirmAction = async () => {
    if (actionModal && onSelectTenant) {
      await onSelectTenant(actionModal.tenant, actionModal.action);
      setActionModal(null);
    }
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition active:scale-95"
      >
        <Building2 className="w-4 h-4 text-emerald-600" />
        <span className="font-medium text-gray-700 text-sm">Manage Status</span>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Main Dropdown List */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/5 sm:bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-3 border-b bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
              {filteredTenants.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No stores found
                </div>
              ) : (
                filteredTenants.map((tenant) => {
                  const status = STATUS_COLORS[tenant.status] || STATUS_COLORS.inactive;
                  return (
                    <div 
                      key={tenant.id}
                      className="p-3 hover:bg-emerald-50/50 transition cursor-pointer group"
                      onClick={() => setSelectedTenant(tenant)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm truncate w-32">{tenant.name}</p>
                            <p className="text-[10px] text-gray-400 truncate">{tenant.subdomain}.{primaryDomain}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.bg} ${status.text} ${status.border}`}>
                          {tenant.status}
                        </div>
                      </div>
                      
                      {/* Action Buttons inside List (Quick Actions) */}
                      <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {tenant.status !== 'active' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleActionClick(tenant, 'activate'); }}
                            className="flex-1 py-1 bg-emerald-600 text-white text-[10px] rounded-md hover:bg-emerald-700 flex items-center justify-center gap-1"
                          >
                            <PlayCircle className="w-3 h-3" /> Activate
                          </button>
                        )}
                        {tenant.status === 'active' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleActionClick(tenant, 'suspend'); }}
                            className="flex-1 py-1 bg-orange-500 text-white text-[10px] rounded-md hover:bg-orange-600 flex items-center justify-center gap-1"
                          >
                            <Ban className="w-3 h-3" /> Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* The Popup Modal (Action Confirmation) */}
      {actionModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${
                actionModal.action === 'activate' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
              }`}>
                {actionModal.action === 'activate' ? <UserCheck className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
              </div>
              <button onClick={() => setActionModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
              {actionModal.action} Store?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              You are about to <strong>{actionModal.action}</strong> the store "<strong>{actionModal.tenant.name}</strong>". 
              This will affect the store's accessibility immediately.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 py-2.5 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                disabled={isProcessing}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-white font-medium rounded-xl transition ${
                  actionModal.action === 'activate' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200 shadow-lg' : 'bg-red-600 hover:bg-red-700 shadow-red-200 shadow-lg'
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IsActiveTogglebtn;