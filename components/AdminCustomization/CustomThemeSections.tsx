import React, { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { WebsiteConfig } from './types';
import { THEME_DEMO_IMAGES } from './constants';

// Figma-styled section configuration
const FIGMA_THEME_SECTIONS = [
  { title: 'Header Section', key: 'headerStyle', count: 5, layout: 'full' },
  // { title: 'Showcase Section', key: 'showcaseSectionStyle', count: 5, layout: 'grid' },
  { title: 'Category Section', key: 'categorySectionStyle', count: 5, layout: 'grid' },
  // { title: 'Product Section', key: 'productSectionStyle', count: 5, layout: 'grid' },
  { title: 'Product card', key: 'productCardStyle', count: 5, layout: 'cards' },
  // { title: 'Brand Section', key: 'brandSectionStyle', count: 5, layout: 'grid' },
  { title: 'Footer Section', key: 'footerStyle', count: 5, layout: 'grid' },
  { title: 'Bottom Nav Section', key: 'bottomNavStyle', count: 5, layout: 'grid' },
];

interface CustomThemeSectionsProps {
  websiteConfiguration: WebsiteConfig;
  setWebsiteConfiguration: React.Dispatch<React.SetStateAction<WebsiteConfig>>;
}

// Style option card component
const StyleOptionCard: React.FC<{
  sectionKey: string;
  styleIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  imageUrl?: string;
  layout?: string;
}> = ({ sectionKey, styleIndex, isSelected, onSelect, imageUrl, layout }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Determine card height based on layout type - increased for better visibility
  const getCardHeight = () => {
    if (layout === 'full') return '140px';
    if (layout === 'cards') return '320px';
    return '140px';
  };

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: 'white',
        border: isSelected ? '2px solid #ff6a00' : '1.5px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        paddingBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isSelected 
          ? '0 4px 20px rgba(255, 106, 0, 0.25)' 
          : isHovered 
            ? '0 8px 25px rgba(0, 0, 0, 0.12)' 
            : '0 2px 8px rgba(0, 0, 0, 0.06)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
        {/* Preview Image */}
        <div
          style={{
            width: '100%',
            height: getCardHeight(),
            backgroundColor: '#fafafa',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={`Style ${styleIndex + 1}`}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                objectPosition: 'center',
                padding: '4px',
              }}
              onError={() => setImageError(true)}
            />
          ) : (
            <div style={{ 
              width: '100%', 
              height: '100%', 
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
            }}>
              Style {styleIndex + 1}
            </div>
          )}
        </div>

        {/* Select/Selected Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          style={{
            width: '90%',
            maxWidth: '160px',
            height: '36px',
            borderRadius: '8px',
            border: isSelected ? 'none' : '1.5px solid #e5e7eb',
            cursor: 'pointer',
            fontFamily: '"Lato", sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '-0.3px',
            transition: 'all 0.2s ease',
            ...(isSelected
              ? {
                  background: 'linear-gradient(135deg, #ff6a00 0%, #ff9f1c 100%)',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(255, 106, 0, 0.3)',
                }
              : {
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                }),
          }}
        >
          {isSelected ? '✓ Selected' : 'Select'}
        </button>
      </div>
    </div>
  );
};

export const CustomThemeSections: React.FC<CustomThemeSectionsProps> = ({
  websiteConfiguration,
  setWebsiteConfiguration
}) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Get the preview image for the currently selected styles
  const getPreviewImage = () => {
    const headerStyle = (websiteConfiguration.headerStyle as string) || 'style1';
    return THEME_DEMO_IMAGES.headerStyle?.[headerStyle] || '';
  };

  const handleStyleSelect = (sectionKey: string, styleValue: string) => {
    setWebsiteConfiguration(prev => ({ ...prev, [sectionKey]: styleValue }));
  };

  return (
    <div style={{ display: 'flex', gap: '24px', position: 'relative' }}>
      {/* Left: Theme Sections */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '48px' }}>
        {FIGMA_THEME_SECTIONS.map((section) => {
          const currentStyle = (websiteConfiguration[section.key as keyof WebsiteConfig] as string) || 'style1';
          const sectionDemos = THEME_DEMO_IMAGES[section.key] || {};

          return (
            <div key={section.key} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Section Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3
                  style={{
                    fontFamily: '"Lato", sans-serif',
                    fontWeight: 700,
                    fontSize: '24px',
                    color: '#023337',
                    letterSpacing: '0.11px',
                    margin: 0,
                  }}
                >
                  {section.title}
                </h3>
                <span style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontFamily: 'Poppins, sans-serif',
                  backgroundColor: '#f1f5f9',
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}>
                  {section.count} styles
                </span>
              </div>

              {/* Style Options Grid */}
              {section.layout === 'full' ? (
                // Full-width layout for Header Section
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Array.from({ length: section.count }).map((_, i) => {
                    const styleValue = `style${i + 1}`;
                    const isSelected = currentStyle === styleValue;
                    const imageUrl = sectionDemos[styleValue];

                    return (
                      <StyleOptionCard
                        key={i}
                        sectionKey={section.key}
                        styleIndex={i}
                        isSelected={isSelected}
                        onSelect={() => handleStyleSelect(section.key, styleValue)}
                        imageUrl={imageUrl}
                        layout={section.layout}
                      />
                    );
                  })}
                </div>
              ) : section.layout === 'cards' ? (
                // Special layout for Product Cards - 3 columns first row, 2 columns second row
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
                    {Array.from({ length: 3 }).map((_, i) => {
                      const styleValue = `style${i + 1}`;
                      const isSelected = currentStyle === styleValue;
                      const imageUrl = sectionDemos[styleValue];

                      return (
                        <StyleOptionCard
                          key={i}
                          sectionKey={section.key}
                          styleIndex={i}
                          isSelected={isSelected}
                          onSelect={() => handleStyleSelect(section.key, styleValue)}
                          imageUrl={imageUrl}
                          layout={section.layout}
                        />
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', gap: '18px' }}>
                    {Array.from({ length: 2 }).map((_, i) => {
                      const actualIndex = i + 3;
                      const styleValue = `style${actualIndex + 1}`;
                      const isSelected = currentStyle === styleValue;
                      const imageUrl = sectionDemos[styleValue];

                      return (
                        <div key={actualIndex} style={{ width: '209px' }}>
                          <StyleOptionCard
                            sectionKey={section.key}
                            styleIndex={actualIndex}
                            isSelected={isSelected}
                            onSelect={() => handleStyleSelect(section.key, styleValue)}
                            imageUrl={imageUrl}
                            layout={section.layout}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Two-column grid layout for other sections
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                  {Array.from({ length: section.count }).map((_, i) => {
                    const styleValue = `style${i + 1}`;
                    const isSelected = currentStyle === styleValue;
                    const imageUrl = sectionDemos[styleValue];

                    return (
                      <StyleOptionCard
                        key={i}
                        sectionKey={section.key}
                        styleIndex={i}
                        isSelected={isSelected}
                        onSelect={() => handleStyleSelect(section.key, styleValue)}
                        imageUrl={imageUrl}
                        layout={section.layout}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Preview Panel - Sticky */}
      <div
        style={{
          width: '456px',
          position: 'sticky',
          top: '20px',
          alignSelf: 'flex-start',
          height: 'fit-content',
          display: 'none', // Hidden on mobile
        }}
        className="hidden lg:block"
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* Preview Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 20px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
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
              Live Preview
            </h4>
            <button
              onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
              title={`Switch to ${previewMode === 'desktop' ? 'mobile' : 'desktop'} view`}
            >
              {previewMode === 'desktop' ? (
                <>
                  <Monitor size={18} style={{ color: '#023337' }} />
                  <span style={{ fontSize: '13px', color: '#023337', fontWeight: 500 }}>Desktop</span>
                </>
              ) : (
                <>
                  <Smartphone size={18} style={{ color: '#023337' }} />
                  <span style={{ fontSize: '13px', color: '#023337', fontWeight: 500 }}>Mobile</span>
                </>
              )}
            </button>
          </div>

          {/* Preview Content */}
          <div
            style={{
              width: '100%',
              height: '677px',
              overflow: 'hidden',
              backgroundColor: '#f5f5f5',
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
                  objectPosition: 'top',
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
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '16px',
                  gap: '12px',
                }}
              >
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Monitor size={28} style={{ color: '#94a3b8' }} />
                </div>
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
