import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, AlertCircle, CreditCard, ExternalLink } from 'lucide-react';

const IsActiveTogglebtn = () => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showRenewalPopup, setShowRenewalPopup] = useState(false);

  const TENANT_ID = '';
  const API_URL = `https://allinbangla.com/api/tenant-data/${TENANT_ID}/is_active`;

  // Fetch initial status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Watch isActive to trigger the renewal popup for the tenant
  useEffect(() => {
    if (isActive && !isLoading) {
      setShowRenewalPopup(true);
    } else {
      setShowRenewalPopup(false);
    }
  }, [isActive, isLoading]);

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch current status');
      const data = await response.json();
      setIsActive(data.is_active ?? false);
    } catch (err) {
      setError('Could not load status. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    setError(null);
    const newValue = !isActive;

    try {
      const response = await fetch(API_URL, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: newValue }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      setIsActive(newValue);
    } catch (err) {
      setError('Update failed. Please check your connection.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
      {/* Main Admin Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 z-10">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Super Admin Panel</h1>
            <p className="text-gray-500 text-sm mt-1">Manage tenant: <span className="font-mono text-xs">{TENANT_ID}</span></p>
          </div>

          {isLoading ? (
            <div className="flex items-center space-x-2 text-blue-500 animate-pulse">
              <Loader2 className="animate-spin" />
              <span>Checking status...</span>
            </div>
          ) : (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium ${
              isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              <span>{isActive ? 'Active' : 'Inactive'}</span>
            </div>
          )}

          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${!isActive ? 'text-gray-900' : 'text-gray-400'}`}>Deactivate</span>
            <button
              onClick={toggleStatus}
              disabled={isLoading || isUpdating}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive ? 'bg-blue-600' : 'bg-gray-300'
              } ${isUpdating ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  isActive ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>Activate</span>
          </div>

          <div className="min-h-[24px]">
            {isUpdating && (
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Loader2 size={14} className="animate-spin mr-2" />
                Syncing changes...
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center text-sm text-red-500">
                <AlertCircle size={14} className="mr-2" />
                {error}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 w-full text-center">
            <p className="text-xs text-gray-400">
              Developed by <a href="https://systemnextit.com" target="_blank" className="hover:text-blue-500 underline">SystemNext IT</a>
            </p>
          </div>
        </div>
      </div>

      {/* Tenant Renewal Popup */}
      {showRenewalPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 transform transition-all animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4 mx-auto">
              <CreditCard size={24} />
            </div>
            <h2 className="text-xl font-bold text-center text-gray-900">Subscription Notice</h2>
            <p className="text-gray-600 text-center mt-2 text-sm">
              Your tenant account <span className="font-semibold text-gray-800">{TENANT_ID.substring(0, 8)}...</span> is currently active. Please renew your subscription to maintain uninterrupted service.
            </p>
            <div className="mt-6 flex flex-col space-y-3">
              <button 
                onClick={() => window.open('https://systemnextit.com', '_blank')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                Renew Subscription <ExternalLink size={16} />
              </button>
              <button 
                onClick={() => setShowRenewalPopup(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Remind Me Later
              </button>
            </div>
            <p className="mt-4 text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">
              Securely powered by SystemNext IT
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IsActiveTogglebtn;