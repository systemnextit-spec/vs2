import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Monitor, Smartphone, CheckCircle2, Circle, ExternalLink, Image, Globe } from 'lucide-react';
import { WebsiteConfig } from './types';
import { THEME_DEMO_IMAGES } from './constants';

// Web sections configuration
const WEB_SECTIONS = [
  { title: 'Header Section', key: 'headerStyle', label: 'Header', count: 5 },
  { title: 'Showcase Section', key: 'showcaseSectionStyle', label: 'Showcase', count: 5 },
  { title: 'Category Section', key: 'categorySectionStyle', label: 'Category', count: 5 },
  { title: 'Product Section', key: 'productSectionStyle', label: 'Product', count: 0 },
  { title: 'Product Card', key: 'productCardStyle', label: 'Card', count: 5 },  //product card
  { title: 'Brand Section', key: 'brandSectionStyle', label: 'Brand', count: 0 },
  { title: 'Footer Section', key: 'footerStyle', label: 'Footer', count: 5 },
];

// Mobile sections configuration
const MOBILE_SECTIONS = [
  { title: 'Mobile Header', key: 'mobileHeaderStyle', label: 'Header', count: 5 },
  { title: 'Product Card', key: 'productCardStyle', label: 'Card', count: 5 },
  { title: 'Bottom Nav', key: 'bottomNavStyle', label: 'Nav', count: 5 },
];

interface CustomThemeSectionsProps {
  websiteConfiguration: WebsiteConfig;
  setWebsiteConfiguration: React.Dispatch<React.SetStateAction<WebsiteConfig>>;
  tenantSubdomain?: string;
  isSaved?: boolean;
}

// Toggle Switch sub-component
const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
  <div
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    style={{
      width: '38px',
      height: '20px',
      borderRadius: '20px',
      backgroundColor: enabled ? '#ff6a00' : '#d1d5db',
      cursor: 'pointer',
      position: 'relative',
      transition: 'background-color 0.25s ease',
      flexShrink: 0,
    }}
  >
    <div
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'absolute',
        top: '2px',
        left: enabled ? '20px' : '2px',
        transition: 'left 0.25s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }}
    />
  </div>
);

// Style option pill component
const StyleOptionPill: React.FC<{
  label: string;
  isSelected: boolean;
  disabled: boolean;
  onSelect: () => void;
}> = ({ label, isSelected, disabled, onSelect }) => (
  <div
    onClick={() => !disabled && onSelect()}
    style={{
      flex: '1 0 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      border: isSelected ? '1.5px solid #ff6a00' : '1.5px solid rgba(0,0,0,0.1)',
      backgroundColor: isSelected ? '#fff8f3' : 'white',
      cursor: disabled ? 'not-allowed' : 'pointer',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      minWidth: 0,
      opacity: disabled ? 0.4 : 1,
    }}
  >
    {isSelected ? (
      <CheckCircle2 size={22} style={{ color: '#ff6a00', flexShrink: 0 }} />
    ) : (
      <Circle size={22} style={{ color: '#d1d5db', flexShrink: 0 }} />
    )}
    <span
      style={{
        fontFamily: '"Lato", sans-serif',
        fontWeight: isSelected ? 600 : 500,
        fontSize: '15px',
        color: isSelected ? '#ff6a00' : '#1a1a1a',
        letterSpacing: '-0.32px',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  </div>
);

// Section block component
const ThemeSection: React.FC<{
  title: string;
  sectionKey: string;
  label: string;
  count: number;
  currentStyle: string;
  enabled: boolean;
  onStyleSelect: (key: string, value: string) => void;
  onToggle: () => void;
}> = ({ title, sectionKey, label, count, currentStyle, enabled, onStyleSelect, onToggle }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
    transition: 'opacity 0.25s ease',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <h3 style={{ fontFamily: '"Lato", sans-serif', fontWeight: 700, fontSize: '20px', color: '#023337', letterSpacing: '0.1px', margin: 0 }}>
        {title}
      </h3>
      <ToggleSwitch enabled={enabled} onToggle={onToggle} />
    </div>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => {
        const styleValue = `style${i + 1}`;
        return (
          <StyleOptionPill
            key={i}
            label={`${label} ${i + 1}`}
            isSelected={enabled && currentStyle === styleValue}
            disabled={!enabled}
            onSelect={() => onStyleSelect(sectionKey, styleValue)}
          />
        );
      })}
    </div>
  </div>
);

export const CustomThemeSections: React.FC<CustomThemeSectionsProps> = ({
  websiteConfiguration,
  setWebsiteConfiguration,
  tenantSubdomain,
  isSaved,
}) => {
  const [deviceMode, setDeviceMode] = useState<'web' | 'mobile'>('web');
  const [previewSection, setPreviewSection] = useState<string>('headerStyle');
  const [previewTab, setPreviewTab] = useState<'style' | 'store'>('style');

  const sections = deviceMode === 'web' ? WEB_SECTIONS : MOBILE_SECTIONS;

  // Ref for the live store iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeCacheBuster, setIframeCacheBuster] = useState(0);

  // Refresh iframe and switch to live store preview when save completes
  useEffect(() => {
    if (isSaved) {
      // Switch to live store tab so user sees the result
      setPreviewTab('store');
      // Bump cache buster to force iframe reload with fresh data
      setIframeCacheBuster(prev => prev + 1);
    }
  }, [isSaved]);

  // Build store URL for the live store tab
  const storeUrl = useMemo(() => {
    if (!tenantSubdomain) return '';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
    const host = typeof window !== 'undefined' ? window.location.host : '';
    const mainDomain = host.split('.').slice(-2).join('.');
    return `${protocol}//${tenantSubdomain}.${mainDomain}`;
  }, [tenantSubdomain]);

  const handleStyleSelect = useCallback((sectionKey: string, styleValue: string) => {
    setWebsiteConfiguration((prev) => ({ ...prev, [sectionKey]: styleValue }));
    setPreviewSection(sectionKey);
    setPreviewTab('style'); // Switch to style preview on selection
  }, [setWebsiteConfiguration]);

  const handleToggle = useCallback((sectionKey: string) => {
    setWebsiteConfiguration((prev) => {
      const currentVal = (prev[sectionKey as keyof WebsiteConfig] as string) || 'style1';
      const newVal = currentVal === 'none' ? 'style1' : 'none';
      return { ...prev, [sectionKey]: newVal };
    });
  }, [setWebsiteConfiguration]);

  const isSectionEnabled = (sectionKey: string) => {
    const val = (websiteConfiguration[sectionKey as keyof WebsiteConfig] as string) || 'style1';
    return val !== 'none';
  };

  const getCurrentStyle = (sectionKey: string) => {
    const val = (websiteConfiguration[sectionKey as keyof WebsiteConfig] as string) || 'style1';
    return val === 'none' ? 'style1' : val;
  };

  const getPreviewImage = () => {
    const style = getCurrentStyle(previewSection);
    return THEME_DEMO_IMAGES[previewSection]?.[style] || '';
  };

  const getPreviewTitle = () => {
    const all = [...WEB_SECTIONS, ...MOBILE_SECTIONS];
    const found = all.find((s) => s.key === previewSection);
    return found ? found.title : 'Preview';
  };

  return (
    <div style={{ display: 'flex', gap: '24px', position: 'relative', alignItems: 'flex-start' }}>
      {/* Left: Sections Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '28px', minWidth: 0 }}>
        {/* Web / Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #38bdf8', borderRadius: '24px', padding: '4px', overflow: 'hidden' }}>
            <button
              onClick={() => setDeviceMode('web')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', height: '26px',
                fontFamily: '"Poppins", sans-serif', fontSize: '12px', fontWeight: 400, transition: 'all 0.25s ease',
                ...(deviceMode === 'web' ? { background: 'linear-gradient(to right, #38bdf8, #1e90ff)', color: 'white' } : { background: 'white', color: '#1a1a1a' }),
              }}
            >
              <Monitor size={14} /> Web
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', height: '26px',
                fontFamily: '"Poppins", sans-serif', fontSize: '12px', fontWeight: 400, transition: 'all 0.25s ease',
                ...(deviceMode === 'mobile' ? { background: 'linear-gradient(to right, #38bdf8, #1e90ff)', color: 'white' } : { background: 'white', color: '#1a1a1a' }),
              }}
            >
              <Smartphone size={14} /> Mobile
            </button>
          </div>
        </div>

        {/* Theme Sections */}
        {sections.map((section) => {
          const enabled = isSectionEnabled(section.key);
          const currentStyle = getCurrentStyle(section.key);
          return (
            <ThemeSection
              key={section.key}
              title={section.title}
              sectionKey={section.key}
              label={section.label}
              count={section.count}
              currentStyle={currentStyle}
              enabled={enabled}
              onStyleSelect={handleStyleSelect}
              onToggle={() => handleToggle(section.key)}
            />
          );
        })}
      </div>

      {/* Right: Preview Panel (sticky) */}
      <div
        style={{ width: '438px', flexShrink: 0, position: 'sticky', top: '20px', alignSelf: 'flex-start', height: 'fit-content' }}
        className="hidden lg:block"
      >
        <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          {/* Preview Header */}
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <h4 style={{ fontFamily: '"Lato", sans-serif', fontWeight: 700, fontSize: '20px', color: '#023337', margin: 0 }}>
                Preview
              </h4>
              <p style={{ margin: '2px 0 0', fontFamily: '"Lato", sans-serif', fontSize: '13px', color: '#64748b' }}>
                {previewTab === 'style' ? getPreviewTitle() : 'Live Store'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {/* Style Preview / Live Store toggle */}
              <button
                onClick={() => setPreviewTab('style')}
                title="Style preview"
                style={{
                  width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e5e7eb', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease',
                  backgroundColor: previewTab === 'style' ? '#ff6a00' : 'white',
                }}
              >
                <Image size={14} style={{ color: previewTab === 'style' ? 'white' : '#64748b' }} />
              </button>
              {storeUrl && (
                <>
                  <button
                    onClick={() => setPreviewTab('store')}
                    title="Live store preview"
                    style={{
                      width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e5e7eb', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease',
                      backgroundColor: previewTab === 'store' ? '#ff6a00' : 'white',
                    }}
                  >
                    <Globe size={14} style={{ color: previewTab === 'store' ? 'white' : '#64748b' }} />
                  </button>
                  <button
                    onClick={() => window.open(storeUrl, '_blank')}
                    title="Open store in new tab"
                    style={{
                      width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e5e7eb', backgroundColor: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease',
                    }}
                  >
                    <ExternalLink size={14} style={{ color: '#64748b' }} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Preview Content */}
          <div style={{ width: '100%', height: '680px', overflow: 'hidden', backgroundColor: '#f8fafc', position: 'relative' }}>
            {previewTab === 'style' ? (
              // Style demo image — updates instantly on click
              getPreviewImage() ? (
                <img
                  key={previewSection + getCurrentStyle(previewSection)}
                  src={getPreviewImage()}
                  alt={getPreviewTitle()}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'top center', transition: 'opacity 0.2s ease' }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: '"Poppins", sans-serif', fontSize: '15px', gap: '12px' }}>
                  <Image size={32} style={{ color: '#cbd5e1' }} />
                  <span>Select a style to preview</span>
                </div>
              )
            ) : (
              // Live store iframe — proper fit using scale transform
              storeUrl ? (
                <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
                  <iframe
                    ref={iframeRef}
                    key={iframeCacheBuster}
                    src={`${storeUrl}${storeUrl.includes('?') ? '&' : '?'}_cb=${iframeCacheBuster}`}
                    title="Store Live Preview"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '1440px',
                      height: '2240px',
                      border: 'none',
                      transformOrigin: 'top left',
                      transform: 'scale(0.304)',
                    }}
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontFamily: '"Poppins", sans-serif', fontSize: '15px', gap: '12px' }}>
                  <Globe size={32} style={{ color: '#cbd5e1' }} />
                  <span>Store preview unavailable</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomThemeSections;
