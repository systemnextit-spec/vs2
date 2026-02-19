import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Monitor, Smartphone, CheckCircle2, ExternalLink, Image, Globe, ChevronDown, ChevronUp, Eye, Sparkles, Palette, LayoutGrid } from 'lucide-react';
import { WebsiteConfig } from './types';
import { THEME_DEMO_IMAGES } from './constants';
import { useDarkMode } from '../../context/DarkModeContext';

// Web sections configuration
const WEB_SECTIONS = [
  { title: 'Header Section', key: 'headerStyle', label: 'Header', count: 6, icon: '\u{1F3AF}' },
  { title: 'Showcase Section', key: 'showcaseSectionStyle', label: 'Showcase', count: 5, icon: '\u2728' },
  { title: 'Category Section', key: 'categorySectionStyle', label: 'Category', count: 5, icon: '\u{1F4C2}' },
  { title: 'Product Card V2', key: 'productSectionStyle', label: 'Product', count: 5, icon: '\u{1F6CD}\uFE0F' },
  { title: 'Product Card', key: 'productCardStyle', label: 'Card', count: 5, icon: '\u{1F0CF}' },
  { title: 'Brand Section', key: 'brandSectionStyle', label: 'Brand', count: 5, icon: '\u{1F3F7}\uFE0F' },
  { title: 'Footer Section', key: 'footerStyle', label: 'Footer', count: 5, icon: '\u{1F4CB}' },
];

// Mobile sections configuration
const MOBILE_SECTIONS = [
  { title: 'Mobile Header', key: 'mobileHeaderStyle', label: 'Header', count: 6, icon: '\u{1F4F1}' },
  { title: 'Product Card', key: 'productCardStyle', label: 'Card', count: 5, icon: '\u{1F0CF}' },
  { title: 'Bottom Nav', key: 'bottomNavStyle', label: 'Nav', count: 5, icon: '\u{1F9ED}' },
];

interface CustomThemeSectionsProps {
  websiteConfiguration: WebsiteConfig;
  setWebsiteConfiguration: React.Dispatch<React.SetStateAction<WebsiteConfig>>;
  tenantSubdomain?: string;
  isSaved?: boolean;
}

// Toggle Switch sub-component
const ToggleSwitch: React.FC<{
  enabled: boolean;
  onToggle: () => void;
}> = ({ enabled, onToggle }) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    style={{
      width: '44px',
      height: '24px',
      borderRadius: '12px',
      backgroundColor: enabled ? '#ff6a00' : '#e2e8f0',
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      flexShrink: 0,
      boxShadow: enabled ? '0 0 0 2px rgba(255, 106, 0, 0.2)' : 'none',
    }}
  >
    <div
      style={{
        width: '18px',
        height: '18px',
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'absolute',
        top: '3px',
        left: enabled ? '23px' : '3px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      }}
    />
  </div>
);

// Style Card with thumbnail preview
const StyleCard: React.FC<{
  index: number;
  label: string;
  isSelected: boolean;
  disabled: boolean;
  onSelect: () => void;
  thumbnailUrl?: string;
}> = ({ index, label, isSelected, disabled, onSelect, thumbnailUrl }) => (
  <div
    onClick={() => !disabled && onSelect()}
    style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '12px',
      border: isSelected ? '2px solid #ff6a00' : '2px solid transparent',
      backgroundColor: isSelected ? (isDarkMode ? '#451a03' : '#fff7ed') : (isDarkMode ? '#374151' : '#f8fafc'),
      cursor: disabled ? 'not-allowed' : 'pointer',
      overflow: 'hidden',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: disabled ? 0.35 : 1,
      boxShadow: isSelected
        ? '0 4px 14px rgba(255, 106, 0, 0.15), 0 0 0 1px rgba(255, 106, 0, 0.1)'
        : '0 1px 3px rgba(0,0,0,0.06)',
      flex: '1 1 0',
      minWidth: '120px',
      maxWidth: '180px',
    }}
    onMouseEnter={(e) => {
      if (!disabled && !isSelected) {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
        e.currentTarget.style.borderColor = '#ffd6b3';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      if (!isSelected) {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
        e.currentTarget.style.borderColor = 'transparent';
      }
    }}
  >
    {/* Thumbnail */}
    <div style={{
      width: '100%',
      height: '80px',
      backgroundColor: '#e2e8f0',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          loading="lazy"
        />
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
        }}>
          <LayoutGrid size={20} style={{ color: '#94a3b8' }} />
        </div>
      )}
      {/* Selected badge */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: '6px',
          right: '6px',
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          backgroundColor: '#ff6a00',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(255,106,0,0.4)',
        }}>
          <CheckCircle2 size={14} style={{ color: 'white' }} />
        </div>
      )}
    </div>
    {/* Label */}
    <div style={{
      padding: '8px 10px',
      textAlign: 'center',
    }}>
      <span style={{
        fontFamily: '"Inter", "Lato", sans-serif',
        fontWeight: isSelected ? 600 : 500,
        fontSize: '12.5px',
        color: isSelected ? '#ff6a00' : (isDarkMode ? '#d1d5db' : '#475569'),
        letterSpacing: '-0.2px',
      }}>
        {label}
      </span>
    </div>
  </div>
);

// Collapsible Section block
const ThemeSection: React.FC<{
  title: string;
  icon: string;
  sectionKey: string;
  label: string;
  count: number;
  currentStyle: string;
  enabled: boolean;
  isExpanded: boolean;
  onStyleSelect: (key: string, value: string) => void;
  onToggle: () => void;
  onExpand: () => void;
  demoImages?: Record<string, string>;
  listMode?: boolean;
}> = ({
  title,
  icon,
  sectionKey,
  label,
  count,
  currentStyle,
  enabled,
  isExpanded,
  onStyleSelect,
  onToggle,
  onExpand,
  demoImages,
  listMode = false,
}) => (
  <div style={{
    borderRadius: '14px',
    border: isExpanded ? '1px solid #fed7aa' : '1px solid #e2e8f0',
    backgroundColor: isDarkMode ? '#1f2937' : 'white',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: isExpanded ? '0 4px 16px rgba(255,106,0,0.08)' : '0 1px 3px rgba(0,0,0,0.04)',
  }}>
    {/* Section Header - clickable to expand */}
    <div
      onClick={onExpand}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        cursor: 'pointer',
        background: isExpanded ? (isDarkMode ? 'linear-gradient(135deg, #292524, #1c1917)' : 'linear-gradient(135deg, #fff7ed, #fffbf5)') : (isDarkMode ? '#1f2937' : 'white'),
        transition: 'background 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <div>
          <h3 style={{
            fontFamily: '"Inter", "Lato", sans-serif',
            fontWeight: 700,
            fontSize: '14.5px',
            color: isDarkMode ? '#f1f5f9' : '#0f172a',
            margin: 0,
            letterSpacing: '-0.2px',
          }}>
            {title}
          </h3>
          <span style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: '11.5px',
            color: enabled ? '#ff6a00' : '#94a3b8',
            fontWeight: 500,
          }}>
            {enabled ? `Style ${currentStyle.replace('style', '')} active` : 'Disabled'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ToggleSwitch enabled={enabled} onToggle={onToggle} />
        {isExpanded ? (
          <ChevronUp size={18} style={{ color: '#94a3b8', transition: 'transform 0.3s' }} />
        ) : (
          <ChevronDown size={18} style={{ color: '#94a3b8', transition: 'transform 0.3s' }} />
        )}
      </div>
    </div>

    {/* Expandable Style Options */}
    <div style={{
      maxHeight: isExpanded ? (listMode ? `${count * 72 + 16}px` : '220px') : '0',
      overflow: 'hidden',
      transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    }}>
      {listMode ? (
        /* List Layout for Header */
        <div style={{ padding: '8px 12px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {Array.from({ length: count }).map((_, i) => {
            const styleValue = `style${i + 1}`;
            const thumb = demoImages?.[styleValue] || '';
            const isSelected = enabled && currentStyle === styleValue;
            return (
              <div
                key={i}
                onClick={() => enabled && onStyleSelect(sectionKey, styleValue)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #ff6a00' : '2px solid transparent',
                  backgroundColor: isSelected ? (isDarkMode ? '#451a03' : '#fff7ed') : (isDarkMode ? '#374151' : '#f8fafc'),
                  cursor: !enabled ? 'not-allowed' : 'pointer',
                  opacity: !enabled ? 0.35 : 1,
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(255,106,0,0.12)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (enabled && !isSelected) {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f1f5f9';
                    e.currentTarget.style.borderColor = '#ffd6b3';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f8fafc';
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '80px',
                  height: '44px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: '#e2e8f0',
                  border: '1px solid #e2e8f0',
                }}>
                  {thumb ? (
                    <img src={thumb} alt={`${label} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} loading="lazy" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' }}>
                      <LayoutGrid size={14} style={{ color: '#94a3b8' }} />
                    </div>
                  )}
                </div>
                {/* Label */}
                <span style={{
                  fontFamily: '"Inter", "Lato", sans-serif',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '13px',
                  color: isSelected ? '#ff6a00' : (isDarkMode ? '#d1d5db' : '#475569'),
                  flex: 1,
                }}>
                  {label} {i + 1}
                </span>
                {/* Selected indicator */}
                {isSelected && (
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#ff6a00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(255,106,0,0.3)',
                  }}>
                    <CheckCircle2 size={14} style={{ color: 'white' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid/Card Layout for other sections */
        <div style={{
          padding: '4px 16px 16px',
          display: 'flex',
          gap: '10px',
          alignItems: 'stretch',
          overflowX: 'auto',
        }}>
          {Array.from({ length: count }).map((_, i) => {
            const styleValue = `style${i + 1}`;
            const thumb = demoImages?.[styleValue] || '';
            return (
              <StyleCard
                key={i}
                index={i}
                label={`${label} ${i + 1}`}
                isSelected={enabled && currentStyle === styleValue}
                disabled={!enabled}
                onSelect={() => onStyleSelect(sectionKey, styleValue)}
                thumbnailUrl={thumb}
              />
            );
          })}
        </div>
      )}
    </div>
  </div>
);

export const CustomThemeSections: React.FC<CustomThemeSectionsProps> = ({
  websiteConfiguration,
  setWebsiteConfiguration,
  tenantSubdomain,
  isSaved,
}) => {
  const { isDarkMode } = useDarkMode();
  const [deviceMode, setDeviceMode] = useState<'web' | 'mobile'>('web');
  const [previewSection, setPreviewSection] = useState<string>('headerStyle');
  const [previewTab, setPreviewTab] = useState<'style' | 'store'>('style');
  const [expandedSection, setExpandedSection] = useState<string>('headerStyle');

  const sections = deviceMode === 'web' ? WEB_SECTIONS : MOBILE_SECTIONS;

  // Ref for the live store iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeCacheBuster, setIframeCacheBuster] = useState(0);
  const [isThemeLoading, setIsThemeLoading] = useState(false);

  // Refresh iframe and switch to live store preview when save completes
  useEffect(() => {
    if (isSaved) {
      setPreviewTab('store');
      setIsThemeLoading(true);
      setIframeCacheBuster((prev) => prev + 1);
      setTimeout(() => {
        setIsThemeLoading(false);
      }, 5000);
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

  const handleStyleSelect = useCallback(
    (sectionKey: string, styleValue: string) => {
      setWebsiteConfiguration((prev) => ({ ...prev, [sectionKey]: styleValue }));
      setPreviewSection(sectionKey);
      setPreviewTab('style');
    },
    [setWebsiteConfiguration]
  );

  const handleToggle = useCallback(
    (sectionKey: string) => {
      setWebsiteConfiguration((prev) => {
        const currentVal = (prev[sectionKey as keyof WebsiteConfig] as string) || 'style1';
        const newVal = currentVal === 'none' ? 'style1' : 'none';
        return { ...prev, [sectionKey]: newVal };
      });
    },
    [setWebsiteConfiguration]
  );

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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
        {/* Device Toggle + Title */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ff6a00, #ff9f1c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(255, 106, 0, 0.25)',
              }}
            >
              <Palette size={18} style={{ color: 'white' }} />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: '"Inter", "Lato", sans-serif',
                  fontWeight: 700,
                  fontSize: '18px',
                  color: isDarkMode ? '#f1f5f9' : '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}
              >
                Theme Customizer
              </h2>
              <p
                style={{
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '12px',
                  color: '#64748b',
                  margin: '1px 0 0',
                  fontWeight: 400,
                }}
              >
                Customize your store's look and feel
              </p>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: isDarkMode ? '#374151' : '#f1f5f9',
              borderRadius: '10px',
              padding: '3px',
              gap: '2px',
            }}
          >
            <button
              onClick={() => {
                setDeviceMode('web');
                setExpandedSection('headerStyle');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Inter", sans-serif',
                fontSize: '12.5px',
                fontWeight: 500,
                transition: 'all 0.25s ease',
                ...(deviceMode === 'web'
                  ? {
                      background: 'white',
                      color: '#0f172a',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }
                  : { background: 'transparent', color: '#64748b' }),
              }}
            >
              <Monitor size={14} /> Desktop
            </button>
            <button
              onClick={() => {
                setDeviceMode('mobile');
                setExpandedSection('mobileHeaderStyle');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: '"Inter", sans-serif',
                fontSize: '12.5px',
                fontWeight: 500,
                transition: 'all 0.25s ease',
                ...(deviceMode === 'mobile'
                  ? {
                      background: 'white',
                      color: '#0f172a',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }
                  : { background: 'transparent', color: '#64748b' }),
              }}
            >
              <Smartphone size={14} /> Mobile
            </button>
          </div>
        </div>

        {/* Theme Sections - Collapsible Accordion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sections.map((section) => {
            const enabled = isSectionEnabled(section.key);
            const currentStyle = getCurrentStyle(section.key);
            return (
              <ThemeSection
                key={section.key}
                title={section.title}
                icon={section.icon}
                sectionKey={section.key}
                label={section.label}
                count={section.count}
                currentStyle={currentStyle}
                enabled={enabled}
                isExpanded={expandedSection === section.key}
                onStyleSelect={handleStyleSelect}
                onToggle={() => handleToggle(section.key)}
                onExpand={() => {
                  setExpandedSection(expandedSection === section.key ? '' : section.key);
                  setPreviewSection(section.key);
                  setPreviewTab('style');
                }}
                demoImages={THEME_DEMO_IMAGES[section.key]}
                listMode={section.key.toLowerCase().includes('header')}
              />
            );
          })}
        </div>
      </div>

      {/* Right: Preview Panel (sticky) */}
      <div
        style={{
          width: '438px',
          flexShrink: 0,
          position: 'sticky',
          top: '20px',
          alignSelf: 'flex-start',
          height: 'fit-content',
        }}
        className="hidden lg:block"
      >
        <div
          style={{
            backgroundColor: isDarkMode ? '#1f2937' : 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          }}
        >
          {/* Preview Header */}
          <div
            style={{
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #fafafa, #f8fafc)',
              borderBottom: '1px solid #f1f5f9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Eye size={16} style={{ color: '#ff6a00' }} />
              </div>
              <div>
                <h4
                  style={{
                    fontFamily: '"Inter", "Lato", sans-serif',
                    fontWeight: 700,
                    fontSize: '15px',
                    color: '#0f172a',
                    margin: 0,
                  }}
                >
                  Preview
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '11.5px',
                    color: '#94a3b8',
                    fontWeight: 400,
                  }}
                >
                  {previewTab === 'style' ? getPreviewTitle() : 'Live Store'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                onClick={() => setPreviewTab('style')}
                title="Style preview"
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  border:
                    previewTab === 'style'
                      ? '1.5px solid #ff6a00'
                      : '1px solid #e5e7eb',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  backgroundColor: previewTab === 'style' ? '#fff7ed' : 'white',
                }}
              >
                <Image size={14} style={{ color: previewTab === 'style' ? '#ff6a00' : '#94a3b8' }} />
              </button>
              {storeUrl && (
                <>
                  <button
                    onClick={() => setPreviewTab('store')}
                    title="Live store preview"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      border:
                        previewTab === 'store'
                          ? '1.5px solid #ff6a00'
                          : '1px solid #e5e7eb',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      backgroundColor: previewTab === 'store' ? '#fff7ed' : 'white',
                    }}
                  >
                    <Globe
                      size={14}
                      style={{
                        color: previewTab === 'store' ? '#ff6a00' : '#94a3b8',
                      }}
                    />
                  </button>
                  <button
                    onClick={() => window.open(storeUrl, '_blank')}
                    title="Open store in new tab"
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ExternalLink size={14} style={{ color: '#94a3b8' }} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Preview Content */}
          <div
            style={{
              width: '100%',
              height: '680px',
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
              position: 'relative',
            }}
          >
            {previewTab === 'style' ? (
              getPreviewImage() ? (
                <img
                  key={previewSection + getCurrentStyle(previewSection)}
                  src={getPreviewImage()}
                  alt={getPreviewTitle()}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'top center',
                    transition: 'opacity 0.3s ease',
                    animation: 'ctsFadeIn 0.3s ease',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image size={28} style={{ color: '#94a3b8' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#64748b',
                        margin: '0 0 4px',
                      }}
                    >
                      No preview available
                    </p>
                    <p
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '12px',
                        color: '#94a3b8',
                        margin: 0,
                      }}
                    >
                      Select a style to see the preview
                    </p>
                  </div>
                </div>
              )
            ) : storeUrl ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: deviceMode === 'mobile' ? '#1a1a1a' : '#f8fafc',
                }}
              >
                {isThemeLoading ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '24px',
                      padding: '40px',
                    }}
                  >
                    <div style={{ position: 'relative', width: '72px', height: '72px' }}>
                      <div
                        style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          border: '3px solid #f1f5f9',
                          borderTop: '3px solid #ff6a00',
                          borderRadius: '50%',
                          animation: 'ctsSpin 0.8s linear infinite',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <Sparkles size={24} style={{ color: '#ff6a00' }} />
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: 'center',
                        fontFamily: '"Inter", "Lato", sans-serif',
                      }}
                    >
                      <p
                        style={{
                          fontSize: '16px',
                          fontWeight: 600,
                          color: '#0f172a',
                          margin: '0 0 6px 0',
                        }}
                      >
                        Applying your theme...
                      </p>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                        Your store will refresh momentarily
                      </p>
                    </div>
                  </div>
                ) : deviceMode === 'mobile' ? (
                  <div
                    style={{
                      width: '375px',
                      height: '667px',
                      position: 'relative',
                      borderRadius: '36px',
                      overflow: 'hidden',
                      boxShadow:
                        '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)',
                      border: '8px solid #1a1a1a',
                    }}
                  >
                    <iframe
                      ref={iframeRef}
                      key={`mobile-${iframeCacheBuster}`}
                      src={`${storeUrl}${storeUrl.includes('?') ? '&' : '?'}_cb=${iframeCacheBuster}`}
                      title="Mobile Store Preview"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      sandbox="allow-scripts allow-same-origin allow-popups"
                    />
                  </div>
                ) : (
                  <iframe
                    ref={iframeRef}
                    key={`web-${iframeCacheBuster}`}
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
                )}
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Globe size={28} style={{ color: '#94a3b8' }} />
                </div>
                <span
                  style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '14px',
                    color: '#94a3b8',
                  }}
                >
                  Store preview unavailable
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global animation styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ctsFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes ctsSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      ` }} />
    </div>
  );
};

export default CustomThemeSections;
