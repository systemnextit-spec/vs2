import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  Save,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { WebsiteConfig, SocialLink, FooterLink, FooterLinkField } from './types';
import { SOCIAL_PLATFORM_OPTIONS, FOOTER_LINK_SECTIONS } from './constants';
import { normalizeImageUrl } from '../../utils/imageUrlHelper';
import { convertFileToWebP, dataUrlToFile } from '../../services/imageUtils';
import { uploadPreparedImageToServer } from '../../services/imageUploadService';
import toast from 'react-hot-toast';

interface WebsiteInfoTabProps {
  websiteConfiguration: WebsiteConfig;
  setWebsiteConfiguration: React.Dispatch<React.SetStateAction<WebsiteConfig>>;
  logo: string | null;
  onUpdateLogo: (logo: string | null) => void;
  tenantId: string;
  onSave?: (config: WebsiteConfig) => Promise<void>;
}

// Figma-styled Logo Upload Card
const LogoUploadCard: React.FC<{
  title: string;
  imageUrl: string | null;
  onSelect: () => void;
  onRemove: () => void;
}> = ({ title, imageUrl, onSelect, onRemove }) => (
  <div
    style={{
      width: '270px',
      height: '154px',
      border: '1px dashed #bababa',
      borderRadius: '8px',
      overflow: 'hidden',
      position: 'relative',
    }}
  >
    {/* Title */}
    <p
      style={{
        position: 'absolute',
        top: '11px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 500,
        fontSize: '12px',
        color: 'black',
        whiteSpace: 'nowrap',
      }}
    >
      {title}
    </p>

    {/* Image Preview */}
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, calc(-50% - 14px))',
        width: '246px',
        height: '68px',
        backgroundColor: 'white',
        borderRadius: '4px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {imageUrl ? (
        <img
          src={normalizeImageUrl(imageUrl)}
          alt=""
          style={{ maxWidth: '204px', maxHeight: '57px', objectFit: 'contain' }}
        />
      ) : (
        <p style={{ color: '#a2a2a2', fontSize: '12px', fontFamily: '"Poppins", sans-serif' }}>
          No image
        </p>
      )}
    </div>

    {/* Select Image Button */}
    <button
      onClick={onSelect}
      style={{
        position: 'absolute',
        bottom: '17px',
        left: '50%',
        transform: 'translateX(calc(-50% - 22.5px))',
        width: '201px',
        height: '32px',
        background: 'linear-gradient(90deg, rgba(56,189,248,0.06) 0%, rgba(30,144,255,0.06) 100%)',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 500,
        fontSize: '12px',
      }}
    >
      <span
        style={{
          background: 'linear-gradient(90deg, #38bdf8 0%, #1e90ff 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Select Image
      </span>
    </button>

    {/* Delete Button */}
    {imageUrl && (
      <button
        onClick={onRemove}
        style={{
          position: 'absolute',
          bottom: '17px',
          right: '12px',
          width: '32px',
          height: '32px',
          backgroundColor: 'rgba(218,0,0,0.1)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Trash2 size={20} color="#da0000" />
      </button>
    )}
  </div>
);

// Figma-styled Input Field
const FigmaInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  flex?: boolean;
}> = ({ label, value, onChange, placeholder, type = 'text', flex = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', ...(flex ? { flex: 1, minWidth: 0 } : {}) }}>
    <p
      style={{
        fontFamily: '"Lato", sans-serif',
        fontWeight: 700,
        fontSize: '15px',
        color: 'black',
        margin: 0,
      }}
    >
      {label}
    </p>
    <div
      style={{
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        padding: '10px 12px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          border: 'none',
          background: 'transparent',
          outline: 'none',
          width: '100%',
          fontFamily: '"Poppins", sans-serif',
          fontSize: '16px',
          color: value ? 'black' : '#a2a2a2',
        }}
      />
    </div>
  </div>
);

// Figma-styled Select Field
const FigmaSelect: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  width?: string;
}> = ({ label, value, onChange, options, width }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: width || 'auto' }}>
    <p
      style={{
        fontFamily: '"Lato", sans-serif',
        fontWeight: 700,
        fontSize: '15px',
        color: 'black',
        margin: 0,
      }}
    >
      {label}
    </p>
    <div
      style={{
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        padding: '10px 12px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: 'none',
          background: 'transparent',
          outline: 'none',
          width: '100%',
          fontFamily: '"Poppins", sans-serif',
          fontSize: '16px',
          color: 'black',
          cursor: 'pointer',
          appearance: 'none',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown size={24} color="#666" />
    </div>
  </div>
);

// Figma-styled Section Header
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <p
    style={{
      fontFamily: '"Lato", sans-serif',
      fontWeight: 700,
      fontSize: '22px',
      color: 'black',
      letterSpacing: '0.11px',
      margin: 0,
    }}
  >
    {title}
  </p>
);

// Figma-styled Rich Text Editor (Simplified)
const RichTextEditor: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
    <SectionHeader title={label} />
    {/* Toolbar */}
    <div
      style={{
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        padding: '9px 13px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontFamily: '"Lato", sans-serif', fontWeight: 600, fontSize: '14px', color: '#4f4d4d' }}>Normal</span>
      <span style={{ fontFamily: '"Lato", sans-serif', fontWeight: 800, fontSize: '14px', color: '#4f4d4d' }}>B</span>
      <span style={{ fontFamily: '"Crimson Text", serif', fontWeight: 600, fontSize: '15px', color: '#4f4d4d', fontStyle: 'italic' }}>I</span>
      <span style={{ fontFamily: '"Lato", sans-serif', fontWeight: 600, fontSize: '14px', color: '#4f4d4d', textDecoration: 'underline' }}>U</span>
      <span style={{ fontFamily: '"Lato", sans-serif', fontWeight: 600, fontSize: '14px', color: '#4f4d4d', textDecoration: 'underline' }}>A</span>
    </div>
    {/* Text Area */}
    <div
      style={{
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        height: '175px',
        overflow: 'hidden',
      }}
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          resize: 'none',
          padding: '13px',
          fontFamily: '"Lato", sans-serif',
          fontSize: '14px',
          color: value ? 'black' : '#a2a2a2',
        }}
      />
    </div>
  </div>
);

// Figma-styled Checkbox
const FigmaCheckbox: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <div
    style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}
    onClick={() => onChange(!checked)}
  >
    <div
      style={{
        width: '26px',
        height: '26px',
        border: '1.5px solid rgba(12,32,52,0.77)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: checked ? '#38bdf8' : 'transparent',
      }}
    >
      {checked && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <p
      style={{
        fontFamily: '"Poppins", sans-serif',
        fontSize: '12px',
        color: '#1d1a1a',
        margin: 0,
      }}
    >
      {label}
    </p>
  </div>
);

// Footer Link Card
const FooterLinkCard: React.FC<{
  title: string;
  description: string;
  links: FooterLink[];
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
  onUpdateLink: (index: number, key: keyof FooterLink, value: string) => void;
}> = ({ title, description, links, onAddLink, onRemoveLink, onUpdateLink }) => (
  <div
    style={{
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      padding: '12px',
      height: '74px',
      position: 'relative',
      width: '536px',
    }}
  >
    <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500, fontSize: '12px', color: 'black', margin: 0 }}>
      {title}
    </p>
    <p style={{ fontFamily: '"Poppins", sans-serif', fontSize: '8px', color: '#b9b9b9', marginTop: '6px' }}>
      {description}
    </p>
    <p style={{ fontFamily: '"Poppins", sans-serif', fontSize: '8px', color: '#b9b9b9', marginTop: '6px' }}>
      {links.length === 0 ? 'No links yet.' : `${links.length} link(s)`}
    </p>
    <button
      onClick={onAddLink}
      style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        width: '86px',
        height: '26px',
        background: 'linear-gradient(90deg, #38bdf8 0%, #1e90ff 100%)',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
      }}
    >
      <Plus size={16} color="white" />
      <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '12px', color: 'white' }}>
        Add Link
      </span>
    </button>
  </div>
);

export const WebsiteInfoTab: React.FC<WebsiteInfoTabProps> = ({
  websiteConfiguration,
  setWebsiteConfiguration,
  logo,
  onUpdateLogo,
  tenantId,
  onSave
}) => {
  // File Input Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const headerLogoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const initialConfigRef = useRef<string>('');

  // Initialize socialLogins and offers in websiteConfiguration if not present
  useEffect(() => {
    if (!websiteConfiguration.socialLogins) {
      setWebsiteConfiguration(prev => ({
        ...prev,
        socialLogins: [{ type: 'Google', clientId: '' }]
      }));
    }
    if (!websiteConfiguration.offers) {
      setWebsiteConfiguration(prev => ({
        ...prev,
        offers: []
      }));
    }
  }, []);

  // Track changes
  useEffect(() => {
    if (!initialConfigRef.current) {
      initialConfigRef.current = JSON.stringify(websiteConfiguration);
    } else {
      const hasChanged = JSON.stringify(websiteConfiguration) !== initialConfigRef.current;
      setHasChanges(hasChanged);
    }
  }, [websiteConfiguration]);

  // Social login helpers
  const socialLogins = websiteConfiguration.socialLogins || [{ type: 'Google', clientId: '' }];
  const offers = websiteConfiguration.offers || [];

  const updateSocialLogin = (index: number, key: 'type' | 'clientId', value: string) => {
    setWebsiteConfiguration(prev => {
      const updated = [...(prev.socialLogins || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, socialLogins: updated };
    });
  };

  const addSocialLogin = () => {
    setWebsiteConfiguration(prev => ({
      ...prev,
      socialLogins: [...(prev.socialLogins || []), { type: 'Google', clientId: '' }]
    }));
  };

  const removeSocialLogin = (index: number) => {
    setWebsiteConfiguration(prev => ({
      ...prev,
      socialLogins: (prev.socialLogins || []).filter((_, i) => i !== index)
    }));
  };

  const updateOffer = (index: number, key: 'type' | 'discount', value: string) => {
    setWebsiteConfiguration(prev => {
      const updated = [...(prev.offers || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, offers: updated };
    });
  };

  const addOffer = () => {
    setWebsiteConfiguration(prev => ({
      ...prev,
      offers: [...(prev.offers || []), { type: 'Registration', discount: '' }]
    }));
  };

  const removeOffer = (index: number) => {
    setWebsiteConfiguration(prev => ({
      ...prev,
      offers: (prev.offers || []).filter((_, i) => i !== index)
    }));
  };

  // Handle save
  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(websiteConfiguration);
      toast.success('Website settings saved successfully!');
      initialConfigRef.current = JSON.stringify(websiteConfiguration);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save website settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  }, [onSave, websiteConfiguration]);

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    imageType: 'logo' | 'favicon' | 'headerLogo' | 'footerLogo'
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert('File too large. Max 2MB.');
      event.target.value = '';
      return;
    }

    try {
      const convertedImage = await convertFileToWebP(file, {
        quality: imageType === 'favicon' ? 0.9 : 0.82,
        maxDimension: imageType === 'favicon' ? 512 : 2000
      });

      const filename = `${imageType}-${Date.now()}.webp`;
      const webpFile = dataUrlToFile(convertedImage, filename);
      const uploadedUrl = await uploadPreparedImageToServer(webpFile, tenantId, 'branding');
      
      if (imageType === 'logo') {
        onUpdateLogo(uploadedUrl);
      } else if (imageType === 'favicon') {
        setWebsiteConfiguration((prev) => ({ ...prev, favicon: uploadedUrl }));
      } else if (imageType === 'headerLogo') {
        setWebsiteConfiguration((prev) => ({ ...prev, headerLogo: uploadedUrl }));
      } else if (imageType === 'footerLogo') {
        setWebsiteConfiguration((prev) => ({ ...prev, footerLogo: uploadedUrl }));
      }
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Failed to process image.');
    } finally {
      event.target.value = '';
    }
  };

  const handleRemoveImage = (imageType: 'logo' | 'favicon' | 'headerLogo' | 'footerLogo'): void => {
    if (imageType === 'logo') {
      onUpdateLogo(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    } else if (imageType === 'favicon') {
      setWebsiteConfiguration((prev) => ({ ...prev, favicon: null }));
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    } else if (imageType === 'headerLogo') {
      setWebsiteConfiguration((prev) => ({ ...prev, headerLogo: null }));
      if (headerLogoInputRef.current) headerLogoInputRef.current.value = '';
    } else {
      setWebsiteConfiguration((prev) => ({ ...prev, footerLogo: null }));
      if (footerLogoInputRef.current) footerLogoInputRef.current.value = '';
    }
  };

  const addSocialLink = (): void => {
    setWebsiteConfiguration((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        { id: Date.now().toString(), platform: 'Facebook', url: '' }
      ]
    }));
  };

  const updateSocialLink = (index: number, key: keyof SocialLink, value: string): void => {
    setWebsiteConfiguration((prev) => {
      const updated = [...prev.socialLinks];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, socialLinks: updated };
    });
  };

  const removeSocialLink = (index: number): void => {
    setWebsiteConfiguration((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const addFooterLink = (field: FooterLinkField): void => {
    setWebsiteConfiguration((prev) => ({
      ...prev,
      [field]: [
        ...((prev[field] as FooterLink[]) || []),
        { id: Date.now().toString(), label: '', url: '' }
      ]
    }));
  };

  const updateFooterLink = (
    field: FooterLinkField,
    index: number,
    key: keyof FooterLink,
    value: string
  ): void => {
    setWebsiteConfiguration((prev) => {
      const updated = [...((prev[field] as FooterLink[]) || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, [field]: updated };
    });
  };

  const removeFooterLink = (field: FooterLinkField, index: number): void => {
    setWebsiteConfiguration((prev) => ({
      ...prev,
      [field]: ((prev[field] as FooterLink[]) || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Logo Upload Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <LogoUploadCard
            title="Primary Store Logo (Fallback)"
            imageUrl={logo}
            onSelect={() => logoInputRef.current?.click()}
            onRemove={() => handleRemoveImage('logo')}
          />
          <LogoUploadCard
            title="Header Logo Override"
            imageUrl={websiteConfiguration.headerLogo ?? null}
            onSelect={() => headerLogoInputRef.current?.click()}
            onRemove={() => handleRemoveImage('headerLogo')}
          />
          <LogoUploadCard
            title="Footer Logo Override"
            imageUrl={websiteConfiguration.footerLogo ?? null}
            onSelect={() => footerLogoInputRef.current?.click()}
            onRemove={() => handleRemoveImage('footerLogo')}
          />
          <LogoUploadCard
            title="Favicon (32x32 px)"
            imageUrl={websiteConfiguration.favicon}
            onSelect={() => faviconInputRef.current?.click()}
            onRemove={() => handleRemoveImage('favicon')}
          />
          <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" accept="image/*" style={{ display: 'none' }} />
          <input type="file" ref={headerLogoInputRef} onChange={(e) => handleImageUpload(e, 'headerLogo')} className="hidden" accept="image/*" style={{ display: 'none' }} />
          <input type="file" ref={footerLogoInputRef} onChange={(e) => handleImageUpload(e, 'footerLogo')} className="hidden" accept="image/*" style={{ display: 'none' }} />
          <input type="file" ref={faviconInputRef} onChange={(e) => handleImageUpload(e, 'favicon')} className="hidden" accept="image/*" style={{ display: 'none' }} />
        </div>
      </div>

      {/* Input Fields Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Row 1: Announcement & Email */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <FigmaInput
            label="Announcement"
            value={websiteConfiguration.adminNoticeText || ''}
            onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, adminNoticeText: v }))}
            placeholder="Text"
            flex
          />
          <div style={{ width: '304px' }}>
            <FigmaInput
              label="Email"
              value={websiteConfiguration.emails?.[0] || ''}
              onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, emails: [v, ...(p.emails?.slice(1) || [])] }))}
              placeholder="xyz@gmail.com"
              type="email"
            />
          </div>
        </div>

        {/* Row 2: Branding Text & Address */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <FigmaInput
            label="Branding Text"
            value={websiteConfiguration.brandingText || ''}
            onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, brandingText: v }))}
            placeholder="Your Brand Text"
            flex
          />
          <FigmaInput
            label="Address"
            value={websiteConfiguration.addresses?.[0] || ''}
            onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, addresses: [v, ...(p.addresses?.slice(1) || [])] }))}
            placeholder="Your Address"
            flex
          />
        </div>

        {/* Row 3: Facebook & Massager */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <FigmaInput
            label="Facebook"
            value={websiteConfiguration.socialLinks?.find((l) => l.platform === 'Facebook')?.url || ''}
            onChange={(v) => {
              const idx = websiteConfiguration.socialLinks?.findIndex((l) => l.platform === 'Facebook');
              if (idx !== undefined && idx >= 0) {
                updateSocialLink(idx, 'url', v);
              } else {
                setWebsiteConfiguration((p) => ({
                  ...p,
                  socialLinks: [...(p.socialLinks || []), { id: Date.now().toString(), platform: 'Facebook', url: v }]
                }));
              }
            }}
            placeholder="Facebook link"
            flex
          />
          <FigmaInput
            label="Massager"
            value={websiteConfiguration.socialLinks?.find((l) => l.platform === 'Messenger')?.url || ''}
            onChange={(v) => {
              const idx = websiteConfiguration.socialLinks?.findIndex((l) => l.platform === 'Messenger');
              if (idx !== undefined && idx >= 0) {
                updateSocialLink(idx, 'url', v);
              } else {
                setWebsiteConfiguration((p) => ({
                  ...p,
                  socialLinks: [...(p.socialLinks || []), { id: Date.now().toString(), platform: 'Messenger', url: v }]
                }));
              }
            }}
            placeholder="Massager Link"
            flex
          />
        </div>

        {/* Row 4: Instagram & TikTok */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <FigmaInput
            label="Instagram"
            value={websiteConfiguration.socialLinks?.find((l) => l.platform === 'Instagram')?.url || ''}
            onChange={(v) => {
              const idx = websiteConfiguration.socialLinks?.findIndex((l) => l.platform === 'Instagram');
              if (idx !== undefined && idx >= 0) {
                updateSocialLink(idx, 'url', v);
              } else {
                setWebsiteConfiguration((p) => ({
                  ...p,
                  socialLinks: [...(p.socialLinks || []), { id: Date.now().toString(), platform: 'Instagram', url: v }]
                }));
              }
            }}
            placeholder="Instagram Link"
            flex
          />
          <FigmaInput
            label="TikTok"
            value={websiteConfiguration.socialLinks?.find((l) => l.platform === 'TikTok')?.url || ''}
            onChange={(v) => {
              const idx = websiteConfiguration.socialLinks?.findIndex((l) => l.platform === 'TikTok');
              if (idx !== undefined && idx >= 0) {
                updateSocialLink(idx, 'url', v);
              } else {
                setWebsiteConfiguration((p) => ({
                  ...p,
                  socialLinks: [...(p.socialLinks || []), { id: Date.now().toString(), platform: 'TikTok', url: v }]
                }));
              }
            }}
            placeholder="TikTok Text"
            flex
          />
        </div>

        {/* Row 5: Social Link & Add Button */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <div style={{ width: '547px' }}>
            <FigmaInput
              label="Social Link"
              value=""
              onChange={() => {}}
              placeholder="Social Link"
            />
          </div>
          <button
            onClick={addSocialLink}
            style={{
              flex: 1,
              height: '48px',
              background: 'linear-gradient(180deg, #ff6a00 0%, #ff9f1c 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <Plus size={24} color="white" />
            <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '16px', color: 'white' }}>
              Add New Link
            </span>
          </button>
        </div>
      </div>

      {/* Country Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SectionHeader title="Country Settings" />
        <div style={{ display: 'flex', gap: '16px' }}>
          <FigmaSelect
            label="Shop Country"
            value={websiteConfiguration.shopCountry || 'BD'}
            onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, shopCountry: v }))}
            options={[
              { value: 'BD', label: 'Bangladesh (BD)' },
              { value: 'IN', label: 'India (IN)' },
              { value: 'US', label: 'United States (US)' },
              { value: 'UK', label: 'United Kingdom (UK)' },
            ]}
            width="425px"
          />
          <FigmaSelect
            label="Shop Currency"
            value={websiteConfiguration.shopCurrency || 'BDT'}
            onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, shopCurrency: v }))}
            options={[
              { value: 'BDT', label: 'Taka-BDT (৳)' },
              { value: 'INR', label: 'Rupee-INR (₹)' },
              { value: 'USD', label: 'Dollar-USD ($)' },
              { value: 'GBP', label: 'Pound-GBP (£)' },
            ]}
            width="auto"
          />
        </div>
      </div>

      {/* Social Login */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SectionHeader title="Social Login" />
        {socialLogins.map((login, index) => (
          <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <FigmaSelect
              label={index === 0 ? 'Login Type' : ''}
              value={login.type || 'Google'}
              onChange={(v) => updateSocialLogin(index, 'type', v)}
              options={[
                { value: 'Google', label: 'Google' },
                { value: 'Facebook', label: 'Facebook' },
              ]}
              width="426px"
            />
            <FigmaInput
              label={index === 0 ? 'Auth/Client ID' : ''}
              value={login.clientId || ''}
              onChange={(v) => updateSocialLogin(index, 'clientId', v)}
              placeholder="531559968835-9dne3cs01s1knffdctpgvu955qfft588.apps.googleusercontent.com"
              flex
            />
            {socialLogins.length > 1 && (
              <button
                onClick={() => removeSocialLogin(index)}
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'rgba(218,0,0,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={20} color="#da0000" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addSocialLogin}
          style={{
            width: '132px',
            height: '48px',
            background: 'linear-gradient(180deg, #ff6a00 0%, #ff9f1c 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <Plus size={24} color="white" />
          <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '16px', color: 'white' }}>
            Add New
          </span>
        </button>
      </div>

      {/* Offer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SectionHeader title="Offer" />
        {offers.length === 0 ? (
          <div style={{ display: 'flex', gap: '16px' }}>
            <FigmaSelect
              label="Offer Type"
              value="Registration"
              onChange={() => {}}
              options={[
                { value: 'Registration', label: 'Registration' },
                { value: 'First Purchase', label: 'First Purchase' },
                { value: 'Referral', label: 'Referral' },
              ]}
              width="426px"
            />
            <FigmaInput
              label="Discount"
              value=""
              onChange={() => {}}
              placeholder="Ex: 1000 or 20%"
              flex
            />
          </div>
        ) : (
          offers.map((offer, index) => (
            <div key={index} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
              <FigmaSelect
                label={index === 0 ? 'Offer Type' : ''}
                value={offer.type || 'Registration'}
                onChange={(v) => updateOffer(index, 'type', v)}
                options={[
                  { value: 'Registration', label: 'Registration' },
                  { value: 'First Purchase', label: 'First Purchase' },
                  { value: 'Referral', label: 'Referral' },
                ]}
                width="426px"
              />
              <FigmaInput
                label={index === 0 ? 'Discount' : ''}
                value={offer.discount || ''}
                onChange={(v) => updateOffer(index, 'discount', v)}
                placeholder="Ex: 1000 or 20%"
                flex
              />
              <button
                onClick={() => removeOffer(index)}
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'rgba(218,0,0,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Trash2 size={20} color="#da0000" />
              </button>
            </div>
          ))
        )}
        <button
          onClick={addOffer}
          style={{
            width: '132px',
            height: '48px',
            background: 'linear-gradient(180deg, #ff6a00 0%, #ff9f1c 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
          }}
        >
          <Plus size={24} color="white" />
          <span style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: '16px', color: 'white' }}>
            Add New
          </span>
        </button>
      </div>

      {/* Rich Text Editors */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <RichTextEditor
          label="About us"
          value={websiteConfiguration.aboutUs || ''}
          onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, aboutUs: v }))}
          placeholder="About your brand"
        />
        <RichTextEditor
          label="Privacy Policy"
          value={websiteConfiguration.privacyPolicy || ''}
          onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, privacyPolicy: v }))}
          placeholder="Shop Privacy And Policy"
        />
        <RichTextEditor
          label="Terms and Condition"
          value={websiteConfiguration.termsAndConditions || ''}
          onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, termsAndConditions: v }))}
          placeholder="Shop Terms And Conditions"
        />
        <RichTextEditor
          label="Return and Cancellation Policy"
          value={websiteConfiguration.returnPolicy || ''}
          onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, returnPolicy: v }))}
          placeholder="Return and Cancellation Policy"
        />
      </div>

      {/* Footer Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        {/* Footer Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <FooterLinkCard
            title="Footer Quick Links"
            description="Shown in the Quick Links column of Footer 2"
            links={(websiteConfiguration.footerQuickLinks as FooterLink[]) || []}
            onAddLink={() => addFooterLink('footerQuickLinks')}
            onRemoveLink={(i) => removeFooterLink('footerQuickLinks', i)}
            onUpdateLink={(i, k, v) => updateFooterLink('footerQuickLinks', i, k, v)}
          />
          <FooterLinkCard
            title="Footer Useful Links"
            description="Shown in the useful Links column of Footer 3"
            links={(websiteConfiguration.footerUsefulLinks as FooterLink[]) || []}
            onAddLink={() => addFooterLink('footerUsefulLinks')}
            onRemoveLink={(i) => removeFooterLink('footerUsefulLinks', i)}
            onUpdateLink={(i, k, v) => updateFooterLink('footerUsefulLinks', i, k, v)}
          />
        </div>

        {/* Footer Section Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500, fontSize: '14px', color: 'black', margin: 0 }}>
            Footer Section Settings
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FigmaCheckbox
              label="Is show new slider"
              checked={websiteConfiguration.showNewsSlider || false}
              onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, showNewsSlider: v }))}
            />
            <FigmaCheckbox
              label="Hide copyright section"
              checked={websiteConfiguration.hideCopyright || false}
              onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, hideCopyright: v }))}
            />
            <FigmaCheckbox
              label="Hide copyright text"
              checked={websiteConfiguration.hideCopyrightText || false}
              onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, hideCopyrightText: v }))}
            />
            <FigmaCheckbox
              label="Powered by System Next IT"
              checked={websiteConfiguration.showPoweredBy || false}
              onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, showPoweredBy: v }))}
            />
          </div>
        </div>

        {/* Product Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500, fontSize: '14px', color: 'black', margin: 0 }}>
            Product Settings
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FigmaCheckbox
              label="Show Product Sold Count"
              checked={websiteConfiguration.showProductSoldCount || false}
              onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, showProductSoldCount: v }))}
            />
            <FigmaCheckbox
              label="Allow Product Image Downloads"
              checked={websiteConfiguration.allowProductImageDownloads || false}
              onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, allowProductImageDownloads: v }))}
            />
            <FigmaCheckbox
              label="Show Email Field for Place Order"
              checked={websiteConfiguration.showEmailFieldForOrder || false}
              onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, showEmailFieldForOrder: v }))}
            />
            <FigmaCheckbox
              label="Enable Promo Code for Place Order"
              checked={websiteConfiguration.enablePromoCode || false}
              onChange={(v) => setWebsiteConfiguration((p) => ({ ...p, enablePromoCode: v }))}
            />
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      {onSave && hasChanges && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
          }}
        >
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px 28px',
              background: isSaving 
                ? 'linear-gradient(180deg, #94a3b8 0%, #64748b 100%)'
                : 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
              color: 'white',
              fontFamily: '"Poppins", sans-serif',
              fontWeight: 600,
              fontSize: '16px',
              border: 'none',
              borderRadius: '12px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            {isSaving ? (
              <>
                <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default WebsiteInfoTab;
