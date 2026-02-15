import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, CheckCircle, AlertCircle, Facebook, Settings, 
  Camera, Loader2, Code, FolderOpen, ArrowRight,
  Shield, CreditCard, Link2, MessageSquare, Coins, User, Store
} from 'lucide-react';
import { CourierConfig, User as UserType, Tenant, Role } from '../types';
import { convertFileToWebP } from '../services/imageUtils';
import { GalleryPicker } from '../components/GalleryPicker';
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
  users = [], roles = [], onAddUser, onUpdateUser, onDeleteUser,
  onAddRole, onUpdateRole, onDeleteRole, onUpdateUserRole, userPermissions = {}
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('manage_shop');
  const shopLogoRef = useRef<HTMLInputElement>(null);
  const [shopLogo, setShopLogo] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryTarget, setGalleryTarget] = useState<'shopLogo' | null>(null);
  const [shopLogoLoading, setShopLogoLoading] = useState(false);

  useEffect(() => {
    if (logo) setShopLogo(logo);
  }, [logo]);

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

  const openGallery = (target: 'shopLogo') => {
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
    }
    setIsGalleryOpen(false);
    setGalleryTarget(null);
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
        title="Select Shop Logo"
      />
    </div>
  );
};

export default AdminSettings;