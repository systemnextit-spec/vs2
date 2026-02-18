import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, CheckCircle, AlertCircle, Facebook, Settings, 
  Camera, Loader2, Code, FolderOpen, ArrowRight,
  Shield, CreditCard, Link2, MessageSquare, Coins, User, Store
} from 'lucide-react';
import { CourierConfig, User as UserType, Tenant, Role } from '../types';
import { convertFileToWebP } from '../services/imageUtils';
import { GalleryPicker } from '../components/GalleryPicker';
import { useAuth } from '../context/AuthContext';
import AdminControl from './AdminControlNew';

interface AdminSettingsProps {
  courierConfig: CourierConfig;
  onUpdateCourierConfig: (config: CourierConfig) => void;
  onNavigate: (page: string) => void;
  user?: UserType | null;
  activeTenant?: Tenant | null;
  logo?: string | null;
  onUpdateLogo?: (logo: string | null) => void;
  // Props for Admin Control
  users?: UserType[];
  roles?: Role[];
  onAddUser?: (user: Omit<UserType, '_id' | 'id'>) => Promise<void>;
  onUpdateUser?: (userId: string, updates: Partial<UserType>) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  onAddRole?: (role: Omit<Role, '_id' | 'id'>) => Promise<void>;
  onUpdateRole?: (roleId: string, updates: Partial<Role>) => Promise<void>;
  onDeleteRole?: (roleId: string) => Promise<void>;
  onUpdateUserRole?: (userEmail: string, roleId: string) => Promise<void>;
  userPermissions?: Record<string, string[]>;
}

// Figma-styled Tab Component
const FigmaTab: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      backgroundColor: 'white',
      border: 'none',
      borderBottom: active ? '2px solid #38bdf8' : '2px solid transparent',
      padding: '12px 22px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      cursor: 'pointer',
      height: '48px',
    }}
  >
    <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </div>
    {active ? (
      <span
        style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 500,
          fontSize: '16px',
          background: 'linear-gradient(90deg, #38bdf8 0%, #1e90ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {label}
      </span>
    ) : (
      <span
        style={{
          fontFamily: '"Poppins", sans-serif',
          fontWeight: 400,
          fontSize: '16px',
          color: 'black',
        }}
      >
        {label}
      </span>
    )}
  </button>
);

// Figma-styled Feature Card
const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
  <div
    onClick={onClick}
    style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      width: '100%',
      minWidth: '300px',
      height: '127px',
      position: 'relative',
      cursor: 'pointer',
      overflow: 'hidden',
    }}
  >
    {/* Icon Box */}
    <div
      style={{
        position: 'absolute',
        top: '19px',
        right: '19px',
        width: '89px',
        height: '89px',
        background: 'linear-gradient(90deg, rgba(255,156,27,0.04) 0%, rgba(255,106,1,0.04) 100%)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </div>

    {/* Title */}
    <p
      style={{
        position: 'absolute',
        top: '25px',
        left: '19px',
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 600,
        fontSize: '16px',
        color: 'black',
        margin: 0,
      }}
    >
      {title}
    </p>

    {/* Description */}
    <p
      style={{
        position: 'absolute',
        top: '57px',
        left: '19px',
        width: '220px',
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 400,
        fontSize: '10px',
        color: 'black',
        margin: 0,
        lineHeight: '1.4',
      }}
    >
      {description}
    </p>
  </div>
);

// Tab types
type SettingsTab = 'manage_shop' | 'profile_details';

const AdminSettings: React.FC<AdminSettingsProps> = ({ 
  onNavigate, user, activeTenant, logo, onUpdateLogo,
  const { state: authState } = useAuth();
  users = [], roles = [], onAddUser, onUpdateUser, onDeleteUser,
  onAddRole, onUpdateRole, onDeleteRole, onUpdateUserRole, userPermissions = {}
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('manage_shop');
  const shopLogoRef = useRef<HTMLInputElement>(null);
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<'shopLogo' | 'profilePic' | null>(null);
  const [shopLogoLoading, setShopLogoLoading] = useState(false);
  // Profile form state
  const profilePicRef = useRef<HTMLInputElement>(null);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    image: user?.image || ''
  });
  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    if (logo) setShopLogo(logo);
  }, [logo]);
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        image: user.image || ''
      });
    }
  }, [user]);


  const showStatus = (type: 'success' | 'error', msg: string) => { setStatus({ type, msg }); setTimeout(() => setStatus(null), 4000); };

  const handleShopLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShopLogoLoading(true);
    try {
      const img = await convertFileToWebP(file, { quality: 0.85, maxDimension: 400 });
      setShopLogo(img);
      if (onUpdateLogo) {
        onUpdateLogo(img);
        showStatus('success', 'Shop logo updated!');
      }
    } catch { showStatus('error', 'Image processing failed'); }
    setShopLogoLoading(false);
    e.target.value = '';
  };

  const openGallery = (target: 'shopLogo' | 'profilePic') => {
    setGalleryTarget(target);
    setIsGalleryOpen(true);
  };

  const handleGallerySelect = (imageUrl: string) => {
    if (galleryTarget === 'shopLogo') {
      setShopLogo(imageUrl);
      if (onUpdateLogo) {
        onUpdateLogo(imageUrl);
        showStatus('success', 'Shop logo updated!');
      }
    } else if (galleryTarget === 'profilePic') {
      setProfileForm(prev => ({ ...prev, image: imageUrl }));
      showStatus('success', 'Profile picture selected!');
    }
    setIsGalleryOpen(false);
    setGalleryTarget(null);
  };

  
  const handleProfilePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePicLoading(true);
    try {
      const img = await convertFileToWebP(file, { quality: 0.85, maxDimension: 400 });
      setProfileForm(prev => ({ ...prev, image: img }));
      showStatus('success', 'Profile picture ready - save to apply!');
    } catch { showStatus('error', 'Image processing failed'); }
    setProfilePicLoading(false);
    e.target.value = '';
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showStatus('error', 'Name is required');
      return;
    }
    if (!profileForm.email.trim()) {
      showStatus('error', 'Email is required');
      return;
    }
    
    setIsSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local storage
      const updatedUser = data.user;
      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      showStatus('success', 'Profile updated successfully!');
      
      // Reload after 1.5s to refresh user data across app
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      showStatus('error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetProfile = () => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        image: user.image || ''
      });
      showStatus('success', 'Profile reset to current values');
    }
  };

  // Feature cards data
  const featureCards = [
    {
      title: 'Delivery Charge',
      description: "Manage your shop's delivery settings to ensure smooth and efficient order fulfillment.",
      icon: <Truck size={48} color="#ff9c1b" />,
      page: 'settings_delivery',
    },
    {
      title: 'Payment Gateway',
      description: 'Integrate and manage payment options to provide customers with secure and flexible transaction methods.',
      icon: <CreditCard size={48} color="#ff9c1b" />,
      page: 'settings_payment',
    },
    {
      title: 'Marketing Integrations',
      description: "Enhance your shop's visibility by Google Tag Manager, Facebook Pixel, TikTok Pixel, and SEO tools for better engagement.",
      icon: <Code size={48} color="#ff9c1b" />,
      page: 'settings_marketing',
    },
    {
      title: 'Shop Domain',
      description: "Manage your shop's core configurations, including domain setup and general settings.",
      icon: <Link2 size={48} color="#ff9c1b" />,
      page: 'settings_domain',
    },
    {
      title: 'SMS Support',
      description: 'Enable SMS notifications and support to keep your customers informed with real-time updates.',
      icon: <MessageSquare size={48} color="#ff9c1b" />,
      page: 'settings_sms',
    },
    {
      title: 'Reward Point',
      description: 'Enable SMS notifications and support to keep your customers informed with real-time updates.',
      icon: <Coins size={48} color="#ff9c1b" />,
      page: 'settings_rewards',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Card */}
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Title */}
        <div style={{ width: '100%', maxWidth: '1108px', padding: '0 20px' }}>
          <p
            style={{
              fontFamily: '"Lato", sans-serif',
              fontWeight: 700,
              fontSize: '22px',
              color: '#023337',
              letterSpacing: '0.11px',
              margin: 0,
            }}
          >
            Settings
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            width: '100%',
            maxWidth: '1108px',
            padding: '0 20px',
            display: 'flex',
            gap: '16px',
            backgroundColor: 'white',
          }}
        >
          <FigmaTab
            icon={<Store size={24} color={activeTab === 'manage_shop' ? '#38bdf8' : '#666'} />}
            label="Manage Shop"
            active={activeTab === 'manage_shop'}
            onClick={() => setActiveTab('manage_shop')}
          />
          <FigmaTab
            icon={<User size={24} color={activeTab === 'profile_details' ? '#38bdf8' : '#666'} />}
            label="Profile Details"
            active={activeTab === 'profile_details'}
            onClick={() => setActiveTab('profile_details')}
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === 'manage_shop' && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Row 1 */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {featureCards.slice(0, 3).map((card) => (
              <div key={card.title} style={{ flex: '1 1 300px', maxWidth: 'calc(33.333% - 11px)' }}>
                <FeatureCard
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  onClick={() => onNavigate(card.page)}
                />
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {featureCards.slice(3, 6).map((card) => (
              <div key={card.title} style={{ flex: '1 1 300px', maxWidth: 'calc(33.333% - 11px)' }}>
                <FeatureCard
                  title={card.title}
                  description={card.description}
                  icon={card.icon}
                  onClick={() => onNavigate(card.page)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile_details' && (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '32px',
          }}
        >
          {/* Shop Logo Section */}
          <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
            <h4
              style={{
                fontFamily: '"Lato", sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                color: '#023337',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Settings size={18} color="#10b981" /> Shop Info
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                {shopLogo ? (
                  <img
                    src={shopLogo}
                    alt="Shop Logo"
                    style={{
                      width: '112px',
                      height: '112px',
                      borderRadius: '12px',
                      objectFit: 'contain',
                      border: '2px solid #f3f4f6',
                      backgroundColor: '#f9fafb',
                      padding: '8px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '112px',
                      height: '112px',
                      borderRadius: '12px',
                      border: '2px dashed #d1d5db',
                      backgroundColor: '#f9fafb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Camera size={32} color="#d1d5db" />
                  </div>
                )}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-8px',
                    right: '-8px',
                    display: 'flex',
                    gap: '4px',
                  }}
                >
                  <button
                    onClick={() => openGallery('shopLogo')}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                    title="Choose from Gallery"
                  >
                    <FolderOpen size={14} />
                  </button>
                  <button
                    onClick={() => shopLogoRef.current?.click()}
                    style={{
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '50%',
                      padding: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                    title="Upload new"
                  >
                    {shopLogoLoading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  </button>
                </div>
                <input ref={shopLogoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleShopLogo} />
              </div>
              <p
                style={{
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#1f2937',
                  margin: 0,
                }}
              >
                {activeTenant?.name || 'My Shop'}
              </p>
              {activeTenant?.subdomain && (
                <p
                  style={{
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '12px',
                    color: '#6b7280',
                    margin: '4px 0 0 0',
                  }}
                >
                  {activeTenant.subdomain}.allinbangla.com
                </p>
              )}
              {activeTenant?.plan && (
                <span
                  style={{
                    marginTop: '8px',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: '#d1fae5',
                    color: '#047857',
                    textTransform: 'capitalize',
                  }}
                >
                  {activeTenant.plan} Plan
                </span>
              )}
            </div>
            
          {/* Profile Details Section */}
          <div style={{ maxWidth: '1108px', margin: '40px auto 0' }}>
            <h4
              style={{
                fontFamily: '"Lato", sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                color: '#023337',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <User size={18} color="#38bdf8" /> Profile Details
            </h4>

            <form onSubmit={handleSaveProfile}>
              {/* Top Section: Profile Picture and Basic Info */}
              <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {/* Profile Picture */}
                <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
                    {profileForm.image ? (
                      <img
                        src={profileForm.image}
                        alt="Profile"
                        style={{
                          width: '160px',
                          height: '160px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '4px solid #f3f4f6',
                          backgroundColor: '#f9fafb',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '160px',
                          height: '160px',
                          borderRadius: '50%',
                          border: '4px dashed #d1d5db',
                          backgroundColor: '#f9fafb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <User size={48} color="#d1d5db" />
                      </div>
                    )}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        display: 'flex',
                        gap: '4px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => openGallery('profilePic')}
                        style={{
                          backgroundColor: '#38bdf8',
                          color: 'white',
                          borderRadius: '50%',
                          padding: '10px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                        title="Choose from Gallery"
                      >
                        <FolderOpen size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => profilePicRef.current?.click()}
                        style={{
                          backgroundColor: '#38bdf8',
                          color: 'white',
                          borderRadius: '50%',
                          padding: '10px',
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                        title="Upload new"
                      >
                        {profilePicLoading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                      </button>
                    </div>
                    <input ref={profilePicRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleProfilePic} />
                  </div>
                  <p
                    style={{
                      fontFamily: '"Poppins", sans-serif',
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#1f2937',
                      margin: 0,
                    }}
                  >
                    {user?.role === 'tenant_admin' || user?.role === 'admin' ? 'Owner' : 'User'}
                  </p>
                  {user?.createdAt && (
                    <span
                      style={{
                        marginTop: '4px',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 500,
                        backgroundColor: '#fff7ed',
                        color: '#ea580c',
                        display: 'inline-block',
                      }}
                    >
                      Since {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Form Fields Grid */}
                <div style={{ flex: '1 1 500px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {/* Name */}
                    <div>
                      <label
                        style={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#021e2c',
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'border-color 0.2s',
                        }}
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label
                        style={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#021e2c',
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        Username
                      </label>
                      <input
                        type="text"
                        placeholder="Enter username"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        style={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#021e2c',
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        Phone
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        style={{
                          fontFamily: '"Poppins", sans-serif',
                          fontWeight: 600,
                          fontSize: '14px',
                          color: '#021e2c',
                          display: 'block',
                          marginBottom: '8px',
                        }}
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                        required
                        style={{
                          width: '100%',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontFamily: '"Poppins", sans-serif',
                          fontSize: '14px',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Address - Full Width */}
                  <div style={{ marginTop: '20px' }}>
                    <label
                      style={{
                        fontFamily: '"Poppins", sans-serif',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#021e2c',
                        display: 'block',
                        marginBottom: '8px',
                      }}
                    >
                      Address
                    </label>
                    <textarea
                      placeholder="Enter your address"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontFamily: '"Poppins", sans-serif',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  onClick={handleResetProfile}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    color: '#021e2c',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M3 21v-5h5" />
                  </svg>
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(90deg, #38bdf8 0%, #1e90ff 100%)',
                    color: 'white',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              {/* Change Password Button */}
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                <button
                  type="button"
                  style={{
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    backgroundColor: 'white',
                    color: '#38bdf8',
                    fontFamily: '"Poppins", sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Change Password
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </form>
          </div>


{status && (
              <div
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: status.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: status.type === 'success' ? '#047857' : '#b91c1c',
                  border: `1px solid ${status.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                }}
              >
                {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{status.msg}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gallery Picker */}
      <GalleryPicker
        isOpen={isGalleryOpen}
        onClose={() => { setIsGalleryOpen(false); setGalleryTarget(null); }}
        onSelect={handleGallerySelect}
        title={galleryTarget === 'profilePic' ? 'Select Profile Picture' : 'Select Shop Logo'}
      />
    </div>
  );
};

export default AdminSettings;