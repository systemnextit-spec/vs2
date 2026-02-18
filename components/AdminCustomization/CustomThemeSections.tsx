import React, { useState, useCallback } from 'react';
import { Monitor, Smartphone, CheckCircle2, Circle } from 'lucide-react';
import { WebsiteConfig } from './types';
import { THEME_DEMO_IMAGES } from './constants';

// Web sections configuration
const WEB_SECTIONS = [
  { title: 'Header Section', key: 'headerStyle', label: 'Header', count: 5 },
  { title: 'Showcase Section', key: 'showcaseSectionStyle', label: 'Showcase', count: 5 },
  { title: 'Category Section', key: 'categorySectionStyle', label: 'Category', count: 5 },
  { title: 'Product Section', key: 'productSectionStyle', label: 'Product', count: 5 },
  { title: 'Brand Section', key: 'brandSectionStyle', label: 'Brand', count: 5 },
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

// Style option pill component (radio-button style from Figma)
const StyleOptionPill: React.FC<{
  label: string;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ label, isSelected, onSelect }) => (
  <div
    onClick={onSelect}
    style={{
      flex: '1 0 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '8px',
      border: isSelected ? '1.5px solid #ff6a00' : '1.5px solid rgba(0,0,0,0.1)',
      backgroundColor: 'white',
      cursor: 'pointer',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      minWidth: 0,
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
        fontWeight: 500,
        fontSize: '15px',
        color: '#1a1a1a',
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
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', opacity: enabled ? 1 : 0.5, transition: 'opacity 0.25s ease' }}>
    {/* Section Header: Title + Toggle */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <h3
        style={{
          fontFamily: '"Lato", sans-serif',
          fontWeight: 700,
          fontSize: '20px',
          color: '#023337',
          letterSpacing: '0.1px',
          margin: 0,
        }}
      >
        {title}
      </h3>
      <ToggleSwitch enabled={enabled} onToggle={onToggle} />
    </div>

    {/* Style Options Row */}
    <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => {
        const styleValue = `style${i + 1}`;
        return (
          <StyleOptionPill
            key={i}
            label={`${label} ${i + 1}`}
            isSelected={enabled && currentStyle === styleValue}
            onSelect={() => enabled && onStyleSelect(sectionKey, styleValue)}
          />
        );
      })}
    </div>
  </div>
);

export const CustomThemeSections: React.FC<CustomThemeSectionsProps> = ({
  websiteConfiguration,
  setWebsiteConfiguration,
}) => {
  const [deviceMode, setDeviceMode] = useState<'web' | 'mobile'>('web');
  const [previewSection, setPreviewSection] = useState<string>('headerStyle');

  const sections = deviceMode === 'web' ? WEB_SECTIONS : MOBILE_SECTIONS;

  const handleStyleSelect = useCallback((sectionKey: string, styleValue: string) => {
    setWebsiteConfiguration((prev) => ({ ...prev, [sectionKey]: styleValue }));
    setPreviewSection(sectionKey);
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

  // Get preview image for the current section
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #38bdf8',
              borderRadius: '24px',
              padding: '4px',
              backgroundColor: 'transparent',
              overflow: 'hidden',
            }}
          >
            {/* Web Button */}
            <button
              onClick={() => setDeviceMode('web')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 14px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                height: '26px',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                transition: 'all 0.25s ease',
                ...(deviceMode === 'web'
                  ? { background: 'linear-gradient(to right, #38bdf8, #1e90ff)', color: 'white' }
                  : { background: 'white', color: '#1a1a1a' }),
              }}
            >
              <Monitor size={14} />
              Web
            </button>
            {/* Mobile Button */}
            <button
              onClick={() => setDeviceMode('mobile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 14px',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                height: '26px',
                fontFamily: '"Poppins", sans-serif',
                fontSize: '12px',
                fontWeight: 400,
                transition: 'all 0.25s ease',
                ...(deviceMode === 'mobile'
                  ? { background: 'linear-gradient(to right, #38bdf8, #1e90ff)', color: 'white' }
                  : { background: 'white', color: '#1a1a1a' }),
              }}
            >
              <Smartphone size={14} />
              Mobile
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
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          {/* Preview Title */}
          <div style={{ padding: '16px 12px 0' }}>
            <h4
              style={{
                fontFamily: '"Lato", sans-serif',
                fontWeight: 700,
                fontSize: '20px',
                color: '#023337',
                letterSpacing: '0.1px',
                margin: 0,
              }}
            >
              Preview
            </h4>
            <p style={{ margin: '4px 0 0', fontFamily: '"Lato", sans-serif', fontSize: '13px', color: '#64748b' }}>
              {getPreviewTitle()}
            </p>
          </div>

          {/* Preview Image */}
          <div
            style={{
              width: '100%',
              height: '650px',
              overflow: 'hidden',
              marginTop: '12px',
            }}
          >
            {getPreviewImage() ? (
              <img
                src={getPreviewImage()}
                alt="Theme Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'top center',
                  backgroundColor: '#f8fafc',
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
                  color: '#94a3b8',
                  fontFamily: '"Poppins", sans-serif',
                  fontSize: '15px',
                  gap: '12px',
                  backgroundColor: '#f8fafc',
                }}
              >
                <Monitor size={32} style={{ color: '#cbd5e1' }} />
                <span>Select a style to preview</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomThemeSections;
