/**
 * useThemeEffects - Theme application and persistence extracted from App.tsx
 */

import { useEffect, useRef } from 'react';
import type { ThemeConfig, WebsiteConfig } from '../types';
import { DataService, isKeyFromSocket, clearSocketFlag } from '../services/DataService';
import { hexToRgb } from '../utils/appHelpers';

interface UseThemeEffectsOptions {
  themeConfig: ThemeConfig | null;
  websiteConfig?: WebsiteConfig;
  activeTenantId: string;
  isLoading: boolean;
  currentView: string;
  isTenantSwitching?: boolean;
}

export function useThemeEffects({
  themeConfig,
  websiteConfig,
  activeTenantId,
  isLoading,
  currentView,
  isTenantSwitching = false,
}: UseThemeEffectsOptions) {
  const themeLoadedRef = useRef(false);
  const lastSavedThemeRef = useRef<string>('');
  const websiteConfigLoadedRef = useRef(false);
  const lastSavedWebsiteConfigRef = useRef<string>('');

  // Reset on tenant change
  useEffect(() => {
    websiteConfigLoadedRef.current = false;
    themeLoadedRef.current = false;
    lastSavedThemeRef.current = '';
    lastSavedWebsiteConfigRef.current = '';
  }, [activeTenantId]);

  // Track previous theme config to avoid unnecessary re-renders
  const prevThemeConfigRef = useRef<string>('');

  // Apply theme colors to CSS variables
  useEffect(() => { 
    if(!themeConfig || !activeTenantId) {
      return;
    }
    
    // Compare with previous to avoid loop
    const currentThemeStr = JSON.stringify({
      primaryColor: themeConfig.primaryColor,
      secondaryColor: themeConfig.secondaryColor,
      tertiaryColor: themeConfig.tertiaryColor,
      fontColor: themeConfig.fontColor,
      hoverColor: themeConfig.hoverColor
    });
    if (prevThemeConfigRef.current === currentThemeStr) {
      return; // No change, skip
    }
    prevThemeConfigRef.current = currentThemeStr;
    
    const root = document.documentElement;

    console.log('[useThemeEffects] Applying theme colors:', {
      primaryColor: themeConfig.primaryColor,
      secondaryColor: themeConfig.secondaryColor,
      tertiaryColor: themeConfig.tertiaryColor,
      fontColor: themeConfig.fontColor,
      hoverColor: themeConfig.hoverColor,
      surfaceColor: themeConfig.surfaceColor
    });

    // Store theme colors - apply for ALL views (store needs these too)
    const primaryRgb = hexToRgb(themeConfig.primaryColor || '#22c55e');
    const secondaryRgb = hexToRgb(themeConfig.secondaryColor || '#ec4899');
    const tertiaryRgb = hexToRgb(themeConfig.tertiaryColor || '#9333ea');
    const fontRgb = hexToRgb(themeConfig.fontColor || '#0f172a');
    const hoverRgb = hexToRgb(themeConfig.hoverColor || '#f97316');
    const surfaceRgb = hexToRgb(themeConfig.surfaceColor || '#e2e8f0');
    
    root.style.setProperty('--color-primary-rgb', primaryRgb);
    root.style.setProperty('--color-secondary-rgb', secondaryRgb);
    root.style.setProperty('--color-tertiary-rgb', tertiaryRgb);
    root.style.setProperty('--color-font-rgb', fontRgb);
    root.style.setProperty('--color-hover-rgb', hoverRgb);
    root.style.setProperty('--color-surface-rgb', surfaceRgb);

    // Theme applied successfully

    // Admin-only theme tokens - only apply when admin shell is active
    const isAdminView = currentView === 'admin' || currentView === 'admin-login';
    if (!isAdminView) {
      ['--admin-bg','--admin-bg-input','--admin-border-rgb','--admin-focus-rgb']
        .forEach((key) => root.style.removeProperty(key));
      // Note: Dark mode is now handled by DarkModeContext - don't override here
    } else {
      if (themeConfig.adminBgColor) {
        root.style.setProperty('--admin-bg', hexToRgb(themeConfig.adminBgColor));
      }
      if (themeConfig.adminInputBgColor) {
        root.style.setProperty('--admin-bg-input', hexToRgb(themeConfig.adminInputBgColor));
      }
      if (themeConfig.adminBorderColor) {
        root.style.setProperty('--admin-border-rgb', hexToRgb(themeConfig.adminBorderColor));
      }
      if (themeConfig.adminFocusColor) {
        root.style.setProperty('--admin-focus-rgb', hexToRgb(themeConfig.adminFocusColor));
      }
      // Note: Dark mode is now handled by DarkModeContext - don't override here
    }
    
    // Track when theme is loaded (saves are handled by App.tsx)
    if(!isLoading && !isTenantSwitching && !themeLoadedRef.current) {
      themeLoadedRef.current = true;
      lastSavedThemeRef.current = JSON.stringify(themeConfig);
    }
  }, [themeConfig, isLoading, isTenantSwitching, activeTenantId, currentView]);

  // Website config - only handle favicon (saves are handled by App.tsx)
  useEffect(() => { 
    if(!isLoading && !isTenantSwitching && websiteConfig && activeTenantId) {
      if (!websiteConfigLoadedRef.current) {
        websiteConfigLoadedRef.current = true;
        lastSavedWebsiteConfigRef.current = JSON.stringify(websiteConfig);
      }
      
      // Apply favicon
      if (websiteConfig.favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = websiteConfig.favicon;
      }
    }
  }, [websiteConfig, isLoading, isTenantSwitching, activeTenantId]);

  return {
    websiteConfigLoadedRef,
  };
}
