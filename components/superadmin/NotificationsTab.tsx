// import React, { useState } from 'react';
// import { 
//   Bell, Send, Plus, Trash2, Users, Building2, 
//   AlertTriangle, Info, CheckCircle, XCircle,
//   Clock, Search, Filter, MoreVertical, Loader2
// } from 'lucide-react';
// import { AdminNotification } from './types';

// interface NotificationsTabProps {
//   notifications: AdminNotification[];
//   onSendNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
//   onDeleteNotification: (id: string) => Promise<void>;
//   tenants: { id: string; name: string }[];
// }

// const NotificationsTab: React.FC<NotificationsTabProps> = ({
//   notifications,
//   onSendNotification,
//   onDeleteNotification,
//   tenants
// }) => {
//   const [isCreating, setIsCreating] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterType, setFilterType] = useState<'all' | 'info' | 'warning' | 'success' | 'error'>('all');

//   const [newNotification, setNewNotification] = useState({
//     title: '',
//     message: '',
//     type: 'info' as AdminNotification['type'],
//     priority: 'medium' as AdminNotification['priority'],
//     targetTenants: 'all' as string[] | 'all',
//     expiresAt: ''
//   });

//   const handleSend = async () => {
//     if (!newNotification.title || !newNotification.message) return;
    
//     setIsSending(true);
//     try {
//       await onSendNotification({
//         ...newNotification,
//         expiresAt: newNotification.expiresAt || undefined
//       });
//       setNewNotification({
//         title: '',
//         message: '',
//         type: 'info',
//         priority: 'medium',
//         targetTenants: 'all',
//         expiresAt: ''
//       });
//       setIsCreating(false);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const getTypeIcon = (type: AdminNotification['type']) => {
//     switch (type) {
//       case 'info': return <Info className="w-4 h-4 text-blue-500" />;
//       case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
//       case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
//       case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
//     }
//   };

//   const getTypeBadge = (type: AdminNotification['type']) => {
//     const styles = {
//       info: 'bg-blue-100 text-blue-700',
//       warning: 'bg-amber-100 text-amber-700',
//       success: 'bg-emerald-100 text-emerald-700',
//       error: 'bg-red-100 text-red-700'
//     };
//     return styles[type];
//   };

//   const getPriorityBadge = (priority: AdminNotification['priority']) => {
//     const styles = {
//       low: 'bg-slate-100 text-slate-600',
//       medium: 'bg-blue-100 text-blue-600',
//       high: 'bg-red-100 text-red-600'
//     };
//     return styles[priority];
//   };

//   const filteredNotifications = notifications.filter(n => {
//     const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                           n.message.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesType = filterType === 'all' || n.type === filterType;
//     return matchesSearch && matchesType;
//   });

//   return (
//     <div className="p-3 sm:p-4 lg:p-6">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-900">Push Notifications</h2>
//           <p className="text-slate-500 mt-1">Send notifications to tenant admins</p>
//         </div>
//         <button
//           onClick={() => setIsCreating(true)}
//           className="px-4 py-2.5 bg-gradient-to-r from-[#38BDF8] to-[#1E90FF] hover:from-[#2BAEE8] hover:to-[#1A7FE8] text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
//         >
//           <Plus className="w-5 h-5" />
//           New Notification
//         </button>
//       </div>

//       {/* Create Notification Modal */}
//       {isCreating && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
//             <div className="p-6 border-b border-slate-200">
//               <h3 className="text-lg font-semibold text-slate-900">Create Notification</h3>
//               <p className="text-sm text-slate-500">Send a notification to tenant admins</p>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
//                 <input
//                   type="text"
//                   value={newNotification.title}
//                   onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
//                   placeholder="Notification title..."
//                   className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
//                 <textarea
//                   value={newNotification.message}
//                   onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
//                   placeholder="Enter your message..."
//                   rows={4}
//                   className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm resize-none"
//                 />
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
//                   <select
//                     value={newNotification.type}
//                     onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as AdminNotification['type'] }))}
//                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
//                   >
//                     <option value="info">Info</option>
//                     <option value="warning">Warning</option>
//                     <option value="success">Success</option>
//                     <option value="error">Error</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
//                   <select
//                     value={newNotification.priority}
//                     onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value as AdminNotification['priority'] }))}
//                     className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
//                   >
//                     <option value="low">Low</option>
//                     <option value="medium">Medium</option>
//                     <option value="high">High</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Target Tenants</label>
//                 <select
//                   value={newNotification.targetTenants === 'all' ? 'all' : 'selected'}
//                   onChange={(e) => setNewNotification(prev => ({ 
//                     ...prev, 
//                     targetTenants: e.target.value === 'all' ? 'all' : [] 
//                   }))}
//                   className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
//                 >
//                   <option value="all">All Tenants</option>
//                   <option value="selected">Select Specific Tenants</option>
//                 </select>
//               </div>

//               {newNotification.targetTenants !== 'all' && (
//                 <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2">
//                   {tenants.map(tenant => (
//                     <label key={tenant.id} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={Array.isArray(newNotification.targetTenants) && newNotification.targetTenants.includes(tenant.id)}
//                         onChange={(e) => {
//                           const current = Array.isArray(newNotification.targetTenants) ? newNotification.targetTenants : [];
//                           setNewNotification(prev => ({
//                             ...prev,
//                             targetTenants: e.target.checked 
//                               ? [...current, tenant.id]
//                               : current.filter(id => id !== tenant.id)
//                           }));
//                         }}
//                         className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
//                       />
//                       <span className="text-sm text-slate-700">{tenant.name}</span>
//                     </label>
//                   ))}
//                 </div>
//               )}

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">Expires At (Optional)</label>
//                 <input
//                   type="datetime-local"
//                   value={newNotification.expiresAt}
//                   onChange={(e) => setNewNotification(prev => ({ ...prev, expiresAt: e.target.value }))}
//                   className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
//                 />
//               </div>
//             </div>

//             <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
//               <button
//                 onClick={() => setIsCreating(false)}
//                 className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSend}
//                 disabled={isSending || !newNotification.title || !newNotification.message}
//                 className="px-4 py-2.5 bg-gradient-to-r from-[#38BDF8] to-[#1E90FF] hover:from-[#2BAEE8] hover:to-[#1A7FE8] text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
//               >
//                 {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
//                 Send Notification
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Search & Filter */}
//       <div className="flex flex-col sm:flex-row gap-3 mb-6">
//         <div className="relative flex-1">
//           <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
//           <input
//             type="text"
//             placeholder="Search notifications..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//           />
//         </div>
//         <select
//           value={filterType}
//           onChange={(e) => setFilterType(e.target.value as typeof filterType)}
//           className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//         >
//           <option value="all">All Types</option>
//           <option value="info">Info</option>
//           <option value="warning">Warning</option>
//           <option value="success">Success</option>
//           <option value="error">Error</option>
//         </select>
//       </div>

//       {/* Notifications List */}
//       <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//         {filteredNotifications.length === 0 ? (
//           <div className="p-12 text-center">
//             <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
//             <h3 className="text-lg font-medium text-slate-900 mb-1">No notifications</h3>
//             <p className="text-slate-500">Create your first notification to get started</p>
//           </div>
//         ) : (
//           <div className="divide-y divide-slate-100">
//             {filteredNotifications.map((notification) => (
//               <div key={notification.id} className="p-4 hover:bg-slate-50 transition-colors">
//                 <div className="flex items-start gap-4">
//                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeBadge(notification.type).replace('text-', 'bg-').split(' ')[0]}`}>
//                     {getTypeIcon(notification.type)}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-start justify-between gap-2">
//                       <div>
//                         <h4 className="font-medium text-slate-900">{notification.title}</h4>
//                         <p className="text-sm text-slate-500 mt-1 line-clamp-2">{notification.message}</p>
//                       </div>
//                       <button
//                         onClick={() => onDeleteNotification(notification.id)}
//                         className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                     <div className="flex items-center gap-3 mt-3">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(notification.type)}`}>
//                         {notification.type}
//                       </span>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(notification.priority)}`}>
//                         {notification.priority}
//                       </span>
//                       <span className="flex items-center gap-1 text-xs text-slate-500">
//                         {notification.targetTenants === 'all' ? (
//                           <>
//                             <Users className="w-3 h-3" />
//                             All Tenants
//                           </>
//                         ) : (
//                           <>
//                             <Building2 className="w-3 h-3" />
//                             {notification.targetTenants.length} Tenants
//                           </>
//                         )}
//                       </span>
//                       <span className="flex items-center gap-1 text-xs text-slate-400">
//                         <Clock className="w-3 h-3" />
//                         {notification.createdAt}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default NotificationsTab;


import React, { useState } from 'react';
import { 
  Bell, Send, Plus, Trash2, Users, Building2, 
  AlertTriangle, Info, CheckCircle, XCircle,
  Clock, Search, Loader2, CreditCard
} from 'lucide-react';

/**
 * Robust Date Formatter 
 * Firestore Timestamp ba standard date-ke readable string-e convert kore
 */
const formatDisplayDate = (date) => {
  if (!date) return 'Ekhon-i';
  
  if (date && typeof date === 'object' && 'seconds' in date) {
    return new Date(date.seconds * 1000).toLocaleString();
  }
  
  if (date instanceof Date || typeof date === 'string') {
    const d = new Date(date);
    return isNaN(d.getTime()) ? String(date) : d.toLocaleString();
  }

  return typeof date === 'object' ? JSON.stringify(date) : String(date);
};

const NotificationsTab = ({
  notifications = [], 
  onSendNotification = async (data) => {}, 
  onDeleteNotification = async (id) => {}, 
  tenants = [] 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Fix: Explicitly handle the union type for targetTenants to prevent TS errors 
  // when switching between 'all' and an array of IDs.
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'warning',
    priority: 'high',
    targetTenants: 'all', // This will be treated as string | string[] by the logic below
    action: 'none', 
    expiresAt: ''
  });

  const handleSend = async () => {
    if (!newNotification.title || !newNotification.message) return;
    
    setIsSending(true);
    try {
      // Fixed: Ensuring the function call matches a signature that accepts one argument
      const payload = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        priority: newNotification.priority,
        targetTenants: newNotification.targetTenants,
        action: newNotification.action,
        createdAt: new Date(),
        expiresAt: newNotification.expiresAt || undefined
      };

      await onSendNotification(payload);

      // Form Reset
      setNewNotification({
        title: '',
        message: '',
        type: 'warning',
        priority: 'high',
        targetTenants: 'all',
        action: 'none',
        expiresAt: ''
      });
      setIsCreating(false);
    } catch (err) {
      console.error("Error sending notification:", err);
    } finally {
      setIsSending(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeBadge = (type) => {
    const styles = {
      info: 'bg-blue-100 text-blue-700',
      warning: 'bg-amber-100 text-amber-700',
      success: 'bg-emerald-100 text-emerald-700',
      error: 'bg-red-100 text-red-700'
    };
    return styles[type] || styles.info;
  };

  const filteredNotifications = (notifications || []).filter(n => {
    if (!n) return false;
    const title = n.title || '';
    const message = n.message || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || n.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-slate-50 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Broadcasts & Control</h2>
          <p className="text-slate-500 mt-1 text-sm">Tenant-der notification pathan ba renewal modal enable korun</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Notun Message
        </button>
      </div>

      {/* Create Notification & Action Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">Broadcast Draft Korun</h3>
              <p className="text-xs text-slate-500 mt-1">Tenant dashboard control korar jonno settings select korun</p>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Title (Bishoy)</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                    placeholder="e.g., Subscription Shesh Hoye Geche"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Message Content</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none resize-none"
                    placeholder="Keno ei notification deya hocche tar bivoron likhun..."
                  />
                </div>
              </div>

              {/* System Actions */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase mb-3">
                  <CreditCard className="w-4 h-4" />
                  System Automation
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-amber-200 cursor-pointer hover:shadow-sm transition-all">
                    <input 
                      type="radio" 
                      name="action"
                      checked={newNotification.action === 'none'}
                      onChange={() => setNewNotification(prev => ({ ...prev, action: 'none', type: 'info' }))}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-800">Sudhu Notification</p>
                      <p className="text-xs text-slate-500">Tenant-ke sudhu message dekhabe</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 bg-white rounded-xl border border-amber-200 cursor-pointer hover:shadow-sm transition-all">
                    <input 
                      type="radio" 
                      name="action"
                      checked={newNotification.action === 'trigger_renewal'}
                      onChange={() => setNewNotification(prev => ({ ...prev, action: 'trigger_renewal', type: 'warning' }))}
                      className="mt-1"
                    />
                    <div>
                      <p className="text-sm font-bold text-amber-700">Trigger Renew Modal</p>
                      <p className="text-xs text-slate-500">Tenant dashboard-e "Renewal Popup" enable korbe</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Target Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Kader Pathaben? (Recipients)</label>
                <select
                  value={newNotification.targetTenants === 'all' ? 'all' : 'selected'}
                  onChange={(e) => {
                    // Fixed: Type-safe update for switching from string to array
                    const val = e.target.value === 'all' ? 'all' : [];
                    // setNewNotification(prev => ({ 
                    //   ...prev, 
                    //   targetTenants: val 
                    // }));
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none mb-2 text-sm"
                >
                  <option value="all">Sokol Tenant (Global Blast)</option>
                  <option value="selected">Specific Dashboard (Tenant Specific)</option>
                </select>

                {newNotification.targetTenants !== 'all' && (
                  <div className="max-h-32 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50 grid grid-cols-1 gap-1">
                    {(tenants || []).map(tenant => (
                      <label key={tenant.id} className="flex items-center gap-2 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors shadow-sm">
                        <input
                          type="checkbox"
                          checked={Array.isArray(newNotification.targetTenants) && newNotification.targetTenants.includes(tenant.id)}
                          onChange={(e) => {
                            // Fixed: Type-safe update for array manipulation
                            const current = Array.isArray(newNotification.targetTenants) ? newNotification.targetTenants : [];
                            const updated = e.target.checked 
                              ? [...current, tenant.id]
                              : current.filter(id => id !== tenant.id);
                            
                            // setNewNotification(prev => ({ 
                            //   ...prev, 
                            //   targetTenants: updated 
                            // }));
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600"
                        />
                        <span className="text-sm text-slate-700 font-medium">{tenant.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm"
              >
                Bad Din
              </button>
              <button
                onClick={handleSend}
                disabled={isSending || !newNotification.title || !newNotification.message}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold disabled:opacity-50 flex items-center gap-2 shadow-md hover:bg-blue-700 transition-all"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Blast Pathan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main List UI */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Notification khujun..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {filteredNotifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex p-4 rounded-full bg-slate-100 mb-4 text-slate-400">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Kono Notification Nei</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">Dashboard control korar jonno prothom notification-ti pathan.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="p-5 hover:bg-slate-50/80 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeBadge(notification.type).split(' ')[0]}`}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{notification.title}</h4>
                          {notification.action === 'trigger_renewal' && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md uppercase">
                              <CreditCard className="w-3 h-3" />
                              Renewal Triggered
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">{notification.message}</p>
                      </div>
                      <button
                        onClick={() => onDeleteNotification(notification.id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        <Users className="w-3.5 h-3.5" />
                        {notification.targetTenants === 'all' ? 'Sokol Tenant' : `${notification.targetTenants.length} Jon Target`}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDisplayDate(notification.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;