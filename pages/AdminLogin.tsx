import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, LogIn, Shield, Store, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import * as authService from '../services/authService';
import { User } from '../types';

// Check if we're on the superadmin subdomain
const isSuperAdminSubdomain = typeof window !== 'undefined' && 
  (window.location.hostname === 'superadmin.allinbangla.com' || 
   window.location.hostname.startsWith('superadmin.'));

// Check if we're on the tenant login portal (systemnextit.website)
const isTenantLoginPortal = typeof window !== 'undefined' &&
  (window.location.hostname === 'systemnextit.website' ||
   window.location.hostname === 'www.systemnextit.website');

interface AdminLoginProps {
  onLoginSuccess?: (user: User) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login(email, password);
      
      // Check if user has admin/staff privileges
      const user = result.user;
      
      // On superadmin subdomain, only allow super_admin login
      if (isSuperAdminSubdomain) {
        if (!user || user.role !== 'super_admin') {
          setError('Access denied. Only Super Admin can login here.');
          authService.logout();
          setIsLoading(false);
          return;
        }
      } else if (isTenantLoginPortal) {
        // On tenant login portal, allow tenant_admin, admin, staff
        if (!user || !['admin', 'tenant_admin', 'staff'].includes(user.role)) {
          setError('Access denied. This portal is for tenant administrators only.');
          authService.logout();
          setIsLoading(false);
          return;
        }
      } else {
        // On regular admin subdomain, allow admin/staff/tenant_admin
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'tenant_admin' && user.role !== 'staff')) {
          setError('Access denied. This login is for admin and staff users only.');
          authService.logout();
          setIsLoading(false);
          return;
        }
      }

      toast.success('Login successful!');
      
      // Call parent callback to navigate to admin
      if (onLoginSuccess) {
        onLoginSuccess(user as User);
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Login failed. Please check your credentials.';
      // Add helpful hint for user not found error
      if (errorMsg.includes('User not found')) {
        setError(errorMsg + ' (Tip: Default admin is admin@admin.com / admin123)');
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Determine branding based on domain
  const getBranding = () => {
    if (isSuperAdminSubdomain) {
      return {
        icon: <Shield className="text-white" size={28} />,
        gradientFrom: 'from-purple-500',
        gradientTo: 'to-indigo-500',
        shadowColor: 'shadow-purple-900/50',
        title: 'Super Admin Portal',
        subtitle: 'Sign in with super admin credentials',
        accentColor: 'purple',
        ringColor: 'focus:ring-purple-500/50',
        borderColor: 'focus:border-purple-500/50',
        btnFrom: 'from-purple-500',
        btnTo: 'to-indigo-500',
        btnHoverFrom: 'hover:from-purple-600',
        btnHoverTo: 'hover:to-indigo-600',
        btnShadow: 'shadow-purple-900/50',
        checkboxColor: 'text-purple-500',
        linkColor: 'text-purple-400',
        linkHover: 'hover:text-purple-300',
        bgGlow1: 'bg-purple-500/10',
        bgGlow2: 'bg-indigo-500/10',
        bgGlow3: 'bg-purple-500/5',
      };
    }
    if (isTenantLoginPortal) {
      return {
        icon: <LayoutDashboard className="text-white" size={28} />,
        gradientFrom: 'from-blue-500',
        gradientTo: 'to-cyan-500',
        shadowColor: 'shadow-blue-900/50',
        title: 'Tenant Dashboard',
        subtitle: 'Sign in to manage your store',
        accentColor: 'blue',
        ringColor: 'focus:ring-blue-500/50',
        borderColor: 'focus:border-blue-500/50',
        btnFrom: 'from-blue-500',
        btnTo: 'to-cyan-500',
        btnHoverFrom: 'hover:from-blue-600',
        btnHoverTo: 'hover:to-cyan-600',
        btnShadow: 'shadow-blue-900/50',
        checkboxColor: 'text-blue-500',
        linkColor: 'text-blue-400',
        linkHover: 'hover:text-blue-300',
        bgGlow1: 'bg-blue-500/10',
        bgGlow2: 'bg-cyan-500/10',
        bgGlow3: 'bg-blue-500/5',
      };
    }
    return {
      icon: <Shield className="text-white" size={28} />,
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-500',
      shadowColor: 'shadow-emerald-900/50',
      title: 'Admin Portal',
      subtitle: 'Sign in to access the admin dashboard',
      accentColor: 'emerald',
      ringColor: 'focus:ring-emerald-500/50',
      borderColor: 'focus:border-emerald-500/50',
      btnFrom: 'from-emerald-500',
      btnTo: 'to-teal-500',
      btnHoverFrom: 'hover:from-emerald-600',
      btnHoverTo: 'hover:to-teal-600',
      btnShadow: 'shadow-emerald-900/50',
      checkboxColor: 'text-emerald-500',
      linkColor: 'text-emerald-400',
      linkHover: 'hover:text-emerald-300',
      bgGlow1: 'bg-emerald-500/10',
      bgGlow2: 'bg-teal-500/10',
      bgGlow3: 'bg-emerald-500/5',
    };
  };

  const brand = getBranding();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a1410] p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute to p-1/4 -left-20 w-80 h-80 ${brand.bgGlow1} rounded-full blur-[100px]`} />
        <div className={`absolute bottom-1/4 -right-20 w-80 h-80 ${brand.bgGlow2} rounded-full blur-[100px]`} />
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${brand.bgGlow3} rounded-full blur-[150px]`} />
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-gradient-to-br from-[#0f0f1a]/90 to-[#0a1410]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-0 text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl shadow-lg mb-6 bg-gradient-to-br ${brand.gradientFrom} ${brand.gradientTo} ${brand.shadowColor}`}>
              {brand.icon}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {brand.title}
            </h1>
            <p className="text-slate-400 text-sm">
              {brand.subtitle}
            </p>
            {isTenantLoginPortal && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Store size={14} />
                <span>System Next IT — E-Commerce Platform</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm animate-shake">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 ${brand.ringColor} ${brand.borderColor} text-white placeholder-slate-500 transition`}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 ${brand.ringColor} ${brand.borderColor} text-white placeholder-slate-500 transition`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`w-4 h-4 rounded border-white/30 bg-white/5 ${brand.checkboxColor} ${brand.ringColor}`}
                />
                Remember me
              </label>
              <a
                href="#"
                className={`${brand.linkColor} ${brand.linkHover} transition`}
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r ${brand.btnFrom} ${brand.btnTo} text-white font-semibold rounded-xl ${brand.btnHoverFrom} ${brand.btnHoverTo} focus:outline-none focus:ring-2 ${brand.ringColor} transition shadow-lg ${brand.btnShadow} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  {isTenantLoginPortal ? 'Sign In to Dashboard' : 'Sign In'}
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-slate-500">
                  {isTenantLoginPortal ? 'Need a store?' : 'New to the platform?'}
                </span>
              </div>
            </div>

            {/* Register Link for tenant portal */}
            {isTenantLoginPortal && (
              <a
                href=""
                className={`w-full flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl text-slate-300 hover:bg-white/5 transition text-sm font-medium`}
              >
                <Store size={18} />
               Helpline: 09617-510 520
              </a>
            )}
          </form>

          {/* Footer */}
          <div className="px-8 pb-6 pt-2">
            <div className="pt-6 border-t border-white/10 text-center">
              {isTenantLoginPortal ? (
                <p className="text-slate-400 text-sm">
                  Powered by{' '}
                  <a
                    href="https://systemnextit.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${brand.linkColor} ${brand.linkHover} font-medium transition`}
                  >
                    System Next IT
                  </a>
                </p>
              ) : (
                <p className="text-slate-400 text-sm">
                  Customer?{' '}
                  <a
                    href="/"
                    className={`${brand.linkColor} ${brand.linkHover} font-medium transition`}
                  >
                    Visit Store
                  </a>
                </p>
              )}
            </div>
            <p className="text-xs text-slate-600 text-center mt-4">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>

        {/* Version */}
        <p className="text-center text-slate-600 text-xs mt-6">
          {isTenantLoginPortal ? 'Merchant Dashboard' : 'Admin Panel'} v2.0 • © {new Date().getFullYear()} SystemNextIT
        </p>
      </div>

      {/* Animation styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
