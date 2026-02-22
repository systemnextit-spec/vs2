import React from 'react';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Globe,
  ArrowRight,
  Heart,
  ShieldCheck,
  Truck,
  CreditCard,
  Headphones,
  Send,
  ExternalLink
} from 'lucide-react';
import './StoreFooter.css';
import { WebsiteConfig } from '../../../types';
import { normalizeImageUrl } from '../../../utils/imageUrlHelper';
import { resolveTenantFooterLogo } from '../../../utils/tenantBrandingHelper';

const buildWhatsAppLink = (rawNumber?: string | null) => {
  if (!rawNumber) return null;
  const sanitized = rawNumber.trim().replace(/[^0-9]/g, '');
  return sanitized ? `https://wa.me/${sanitized}` : null;
};

export interface StoreFooterProps {
  websiteConfig?: WebsiteConfig;
  logo?: string | null;
  tenantId?: string;
  onOpenChat?: () => void;
}

// Default links fallback
const defaultQuickLinks = [
  { id: '1', label: 'Home', url: '/' },
  { id: '2', label: 'Terms and Conditions', url: '/termsnconditions' },
  { id: '3', label: 'Return Policy', url: '/returnpolicy' },
  { id: '4', label: 'Contact', url: '/contact' }
];

const defaultUsefulLinks = [
  { id: '1', label: 'About Us', url: '/about' },
  { id: '2', label: 'Privacy Policy', url: '/privacy' },
  { id: '3', label: 'FAQ', url: '/faq' },
  { id: '4', label: 'Track Order', url: '/track' }
];

// Helper to get footer links with fallback
const getFooterQuickLinks = (config?: WebsiteConfig) => {
  const links = config?.footerQuickLinks;
  if (links && Array.isArray(links) && links.length > 0) {
    const filtered = links.filter(l => l.label && l.url);
    if (filtered.length > 0) {
      return filtered;
    }
  }
  return defaultQuickLinks;
};

const getFooterUsefulLinks = (config?: WebsiteConfig) => {
  const links = config?.footerUsefulLinks;
  if (links && Array.isArray(links) && links.length > 0) {
    const filtered = links.filter(l => l.label && l.url);
    if (filtered.length > 0) {
      return filtered;
    }
  }
  return defaultUsefulLinks;
};

// Shared utilities
const getSocialIconMap = (): { [key: string]: React.ReactNode } => ({
  facebook: <Facebook size={18} />,
  instagram: <Instagram size={18} />,
  twitter: <Twitter size={18} />,
  youtube: <Youtube size={18} />,
  linkedin: <Linkedin size={18} />,
  whatsapp: <MessageCircle size={18} />,
  messenger: <MessageCircle size={18} />,
  fb: <Facebook size={18} />,
  ig: <Instagram size={18} />,
  x: <Twitter size={18} />,
  yt: <Youtube size={18} />,
});

const resolveSocialIcon = (platform?: string): React.ReactNode => {
  const map = getSocialIconMap();
  const key = platform?.toLowerCase() || '';
  return map[key] || <Globe size={18} />;
};

const features = [
  { icon: <Truck size={24} />, title: 'Free Delivery', desc: 'On orders over ৳999' },
  { icon: <ShieldCheck size={24} />, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: <CreditCard size={24} />, title: 'Easy Returns', desc: '7 days return policy' },
  { icon: <Headphones size={24} />, title: '24/7 Support', desc: 'Dedicated support' },
];
// Copyright section helper component
interface CopyrightSectionProps {
  websiteConfig?: WebsiteConfig;
  currentYear: number;
  variant?: 'dark' | 'light' | 'gradient';
  className?: string;
  children?: React.ReactNode;
}

const CopyrightSection: React.FC<CopyrightSectionProps> = ({ 
  websiteConfig, 
  currentYear, 
  variant = 'dark',
  className = '',
  children 
}) => {
  // If hideCopyright is true, hide the entire section
  if (websiteConfig?.hideCopyright) {
    return null;
  }

  const textColors = {
    dark: { main: 'text-gray-500', highlight: 'text-white', powered: 'text-gray-400 hover:text-blue-400' },
    light: { main: 'text-gray-500', highlight: 'text-gray-800', powered: 'text-gray-500 hover:text-blue-500' },
    gradient: { main: 'text-white/70', highlight: 'text-white', powered: 'text-white/60 hover:text-white' },
  };
  const colors = textColors[variant];

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Copyright text - conditionally shown */}
      {!websiteConfig?.hideCopyrightText && (
        <p className={`text-sm ${colors.main}`}>
          © {currentYear} <span className={`font-medium ${colors.highlight}`}>{websiteConfig?.websiteName || 'Store'}</span>. All rights reserved.
        </p>
      )}
      
      {children}
      
      {/* Powered by - conditionally shown */}
      {websiteConfig?.showPoweredBy && (
        <a 
          href="https://systemnextit.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`text-xs ${colors.powered} transition-colors flex items-center gap-1`}
        >
          Powered by <span className="font-semibold">System Next IT</span>
          <ExternalLink size={10} />
        </a>
      )}
    </div>
  );
};



const FloatingChatButton: React.FC<{ websiteConfig?: WebsiteConfig; onOpenChat?: () => void }> = ({ websiteConfig, onOpenChat }) => {
  const whatsappLink = buildWhatsAppLink(websiteConfig?.whatsappNumber);
  const chatEnabled = websiteConfig?.chatEnabled ?? true;
  const chatFallbackLink = !chatEnabled && websiteConfig?.chatWhatsAppFallback ? whatsappLink : null;
  const baseClasses = 'hidden md:flex fixed bottom-20 right-8 w-14 h-14 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1 hover:scale-105 z-40 shadow-lg';
  const chatIcon = <MessageCircle size={24} strokeWidth={2} className="text-white" />;

  if (chatEnabled && onOpenChat) {
    return <button type="button" onClick={onOpenChat} aria-label="Open live chat" className={`${baseClasses} bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-xl hover:shadow-pink-500/30`}>{chatIcon}</button>;
  }
  if (chatFallbackLink) {
    return <a href={chatFallbackLink} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className={`${baseClasses} bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-xl hover:shadow-green-500/30`}>{chatIcon}</a>;
  }
  return null;
};

// Style 1: Default - Dark gradient with feature badges
const FooterStyle1: React.FC<StoreFooterProps> = ({ websiteConfig, logo, tenantId, onOpenChat }) => {
  const whatsappLink = buildWhatsAppLink(websiteConfig?.whatsappNumber);
  const resolvedFooterLogo = resolveTenantFooterLogo(websiteConfig, logo, tenantId);
  const currentYear = new Date().getFullYear();
  const quickLinks = getFooterQuickLinks(websiteConfig);
  const usefulLinks = getFooterUsefulLinks(websiteConfig);

  return (
    <>
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 mt-auto store-footer-minheight">
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white flex-shrink-0">{feature.icon}</div>
                  <div><h4 className="font-semibold text-white text-sm">{feature.title}</h4><p className="text-xs text-gray-400">{feature.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
            <div className="lg:col-span-1">
              {resolvedFooterLogo ? <img src={normalizeImageUrl(resolvedFooterLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-12 w-auto object-contain mb-4" /> : <h3 className="text-2xl font-bold text-white mb-4">{websiteConfig?.websiteName || 'Our Store'}</h3>}
              <p className="text-sm text-gray-400 mb-5 leading-relaxed">{websiteConfig?.shortDescription || websiteConfig?.brandingText || 'Your trusted online shopping destination.'}</p>
              <div className="flex gap-2">
                {websiteConfig?.socialLinks?.slice(0, 5).map((social, idx) => (
                  <a key={idx} href={social.url || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 flex items-center justify-center text-gray-400 hover:text-white transition-all" aria-label={social.platform}>{resolveSocialIcon(social.platform)}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-5 text-lg relative inline-block">Quick Links<span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></span></h4>
              <ul className="space-y-3">
                {quickLinks.map((link, idx) => (
                  <li key={link.id || idx}><a href={link.url} className="text-gray-400 hover:text-white hover:pl-2 transition-all flex items-center gap-2 group text-sm"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-pink-500" />{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-5 text-lg relative inline-block">Useful Links<span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></span></h4>
              <ul className="space-y-3">
                {usefulLinks.map((link, idx) => (
                  <li key={link.id || idx}><a href={link.url} className="text-gray-400 hover:text-white hover:pl-2 transition-all flex items-center gap-2 group text-sm"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-pink-500" />{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-5 text-lg relative inline-block">Contact Us<span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></span></h4>
              <ul className="space-y-4">
                {websiteConfig?.addresses?.[0] && <li className="flex gap-3"><MapPin size={18} className="text-pink-500 flex-shrink-0 mt-0.5" /><span className="text-sm text-gray-400">{websiteConfig.addresses[0]}</span></li>}
                {websiteConfig?.phones?.[0] && <li className="flex gap-3"><Phone size={18} className="text-pink-500 flex-shrink-0" /><a href={`tel:${websiteConfig.phones[0]}`} className="text-sm text-gray-400 hover:text-white">{websiteConfig.phones[0]}</a></li>}
                {websiteConfig?.emails?.[0] && <li className="flex gap-3"><Mail size={18} className="text-pink-500 flex-shrink-0" /><a href={`mailto:${websiteConfig.emails[0]}`} className="text-sm text-gray-400 hover:text-white">{websiteConfig.emails[0]}</a></li>}
                {websiteConfig?.whatsappNumber && <li className="flex gap-3"><MessageCircle size={18} className="text-green-500 flex-shrink-0" /><a href={whatsappLink || '#'} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-white">WhatsApp</a></li>}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <CopyrightSection websiteConfig={websiteConfig} currentYear={currentYear} variant="dark">
              <div className="flex items-center gap-3"><span className="text-xs text-gray-500">We accept:</span><div className="flex gap-2">{['bKash', 'Nagad', 'Visa', 'Master'].map((m, i) => <div key={i} className="px-3 py-1.5 bg-gray-800 rounded text-xs font-medium text-gray-400">{m}</div>)}</div></div>
              <p className="text-xs text-gray-500 flex items-center gap-1">Made with <Heart size={12} className="text-pink-500 fill-pink-500" /> in Bangladesh</p>
            </CopyrightSection>
          </div>
        </div>
      </footer>
      <FloatingChatButton websiteConfig={websiteConfig} onOpenChat={onOpenChat} />
    </>
  );
};

// Style 2: Minimal - Clean white footer with simple layout
const FooterStyle2: React.FC<StoreFooterProps> = ({ websiteConfig, logo, tenantId, onOpenChat }) => {
  const resolvedFooterLogo = resolveTenantFooterLogo(websiteConfig, logo, tenantId);
  const currentYear = new Date().getFullYear();
  const quickLinks = getFooterQuickLinks(websiteConfig);

  return (
    <>
      <footer className="bg-white border-t border-gray-200 mt-auto store-footer-minheight">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              {resolvedFooterLogo ? <img src={normalizeImageUrl(resolvedFooterLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-20 object-contain mb-4" /> : <h3 className="text-xl font-bold text-gray-900 mb-4">{websiteConfig?.websiteName || 'Store'}</h3>}
              <p className="text-gray-600 text-sm mb-4 max-w-md">{websiteConfig?.shortDescription || websiteConfig?.brandingText || 'Quality products at great prices.'}</p>
              <div className="flex gap-3">
                {websiteConfig?.socialLinks?.slice(0, 4).map((social, idx) => (
                  <a key={idx} href={social.url || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-theme-primary hover:text-white flex items-center justify-center text-gray-600 transition-all" aria-label={social.platform}>{resolveSocialIcon(social.platform)}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link, idx) => (
                  <li key={link.id || idx}><a href={link.url} className="text-gray-600 hover:text-theme-primary text-sm transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {websiteConfig?.emails?.[0] && <li>{websiteConfig.emails[0]}</li>}
                {websiteConfig?.phones?.[0] && <li>{websiteConfig.phones[0]}</li>}
                {websiteConfig?.addresses?.[0] && <li>{websiteConfig.addresses[0]}</li>}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-4">
            {!websiteConfig?.hideCopyright && (
              <div className="flex flex-col items-center gap-2">
                {!websiteConfig?.hideCopyrightText && (
                  <p className="text-center text-sm text-gray-500">© {currentYear} {websiteConfig?.websiteName || 'Store'}. All rights reserved.</p>
                )}
                {websiteConfig?.showPoweredBy && (
                  <a href="https://systemnextit.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1">
                    Powered by <span className="font-semibold">System Next IT</span><ExternalLink size={10} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>
      <FloatingChatButton websiteConfig={websiteConfig} onOpenChat={onOpenChat} />
    </>
  );
};

// Style 3: Colorful Gradient - Vibrant gradient footer
const FooterStyle3: React.FC<StoreFooterProps> = ({ websiteConfig, logo, tenantId, onOpenChat }) => {
  const whatsappLink = buildWhatsAppLink(websiteConfig?.whatsappNumber);
  const resolvedFooterLogo = resolveTenantFooterLogo(websiteConfig, logo, tenantId);
  const currentYear = new Date().getFullYear();
  const quickLinks = getFooterQuickLinks(websiteConfig);
  const usefulLinks = getFooterUsefulLinks(websiteConfig);

  return (
    <>
      <footer className="bg-gradient-to-br from-theme-primary via-purple-600 to-theme-secondary text-white mt-auto store-footer-minheight">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              {resolvedFooterLogo ? <img src={normalizeImageUrl(resolvedFooterLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-12 object-contain mb-4 brightness-0 invert" /> : <h3 className="text-2xl font-bold mb-4">{websiteConfig?.websiteName || 'Store'}</h3>}
              <p className="text-white/80 text-sm mb-6">{websiteConfig?.shortDescription || websiteConfig?.brandingText || 'Your favorite online store.'}</p>
              <div className="flex gap-2">
                {websiteConfig?.socialLinks?.slice(0, 5).map((social, idx) => (
                  <a key={idx} href={social.url || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white hover:text-theme-primary flex items-center justify-center transition-all" aria-label={social.platform}>{resolveSocialIcon(social.platform)}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-lg">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, idx) => (
                  <li key={link.id || idx}><a href={link.url} className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2"><ExternalLink size={12} />{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-lg">Useful Links</h4>
              <ul className="space-y-3">
                {usefulLinks.map((link, idx) => (
                  <li key={link.id || idx}><a href={link.url} className="text-white/80 hover:text-white transition-colors text-sm flex items-center gap-2"><ExternalLink size={12} />{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-5 text-lg">Get in Touch</h4>
              <div className="space-y-3 text-sm text-white/80">
                {websiteConfig?.phones?.[0] && <p className="flex items-center gap-2"><Phone size={16} />{websiteConfig.phones[0]}</p>}
                {websiteConfig?.emails?.[0] && <p className="flex items-center gap-2"><Mail size={16} />{websiteConfig.emails[0]}</p>}
                {websiteConfig?.whatsappNumber && <a href={whatsappLink || '#'} className="flex items-center gap-2 hover:text-white"><MessageCircle size={16} />WhatsApp Us</a>}
              </div>
              <div className="mt-6">
                <p className="text-sm mb-2">Subscribe for updates</p>
                <div className="flex"><input type="email" placeholder="Email" className="flex-1 px-3 py-2 rounded-l-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none" /><button className="px-4 py-2 bg-white text-theme-primary rounded-r-lg font-medium hover:bg-white/90 transition-colors"><Send size={16} /></button></div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-5">
            {!websiteConfig?.hideCopyright && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {!websiteConfig?.hideCopyrightText && (
                  <p className="text-sm text-white/70">© {currentYear} {websiteConfig?.websiteName || 'Store'}. All rights reserved.</p>
                )}
                <div className="flex gap-4 text-sm text-white/70"><a href="/privacy" className="hover:text-white">Privacy</a><a href="/terms" className="hover:text-white">Terms</a></div>
                {websiteConfig?.showPoweredBy && (
                  <a href="https://systemnextit.com" target="_blank" rel="noopener noreferrer" className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1">
                    Powered by <span className="font-semibold">System Next IT</span><ExternalLink size={10} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>
      <FloatingChatButton websiteConfig={websiteConfig} onOpenChat={onOpenChat} />
    </>
  );
};

// Style 4: Centered - Centered layout with newsletter focus
const FooterStyle4: React.FC<StoreFooterProps> = ({ websiteConfig, logo, tenantId, onOpenChat }) => {
  const resolvedFooterLogo = resolveTenantFooterLogo(websiteConfig, logo, tenantId);
  const currentYear = new Date().getFullYear();
  const quickLinks = getFooterQuickLinks(websiteConfig);

  return (
    <>
      <footer className="bg-gray-50 mt-auto store-footer-minheight">
        <div className="max-w-2xl mx-auto px-4 py-4 text-center">
          <div className="mb-4">
            {resolvedFooterLogo ? <img src={normalizeImageUrl(resolvedFooterLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-44 object-contain mx-auto mb-1" /> : <h3 className="text-3xl font-bold text-gray-900 mb-4">{websiteConfig?.websiteName || 'Store'}</h3>}
            <p className="text-gray-600 max-w-md mx-auto">{websiteConfig?.shortDescription || websiteConfig?.brandingText || 'Discover quality products curated just for you.'}</p>
          </div>
          <div className="flex justify-center gap-3 mb-3">
            {websiteConfig?.socialLinks?.slice(0, 5).map((social, idx) => (
              <a key={idx} href={social.url || '#'} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-theme-primary hover:text-white flex items-center justify-center text-gray-600 transition-all" aria-label={social.platform}>{resolveSocialIcon(social.platform)}</a>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-8">
            <h4 className="font-bold text-gray-900 text-lg mb-2">Stay Updated</h4>
            <p className="text-gray-600 text-sm mb-4">Subscribe to get exclusive offers and updates</p>
            <div className="flex max-w-md mx-auto"><input type="email" placeholder="Your email address" className="flex-1 px-4 py-3 rounded-l-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary/20" /><button className="px-6 py-3 bg-theme-primary text-white rounded-r-xl font-medium hover:bg-theme-primary/90 transition-colors">Subscribe</button></div>
          </div>
          <nav className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mb-8 text-sm">
            {quickLinks.map((link, idx) => (
              <a key={link.id || idx} href={link.url} className="text-gray-600 hover:text-theme-primary transition-colors">{link.label}</a>
            ))}
          </nav>
        </div>
        <div className="border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-5">
            {!websiteConfig?.hideCopyright && (
              <div className="flex flex-col items-center gap-2">
                {!websiteConfig?.hideCopyrightText && (
                  <p className="text-center text-sm text-gray-500">© {currentYear} {websiteConfig?.websiteName || 'Store'}. Made with <Heart size={12} className="inline text-rose-500 fill-rose-500" /> in Bangladesh</p>
                )}
                {websiteConfig?.showPoweredBy && (
                  <a href="https://systemnextit.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1">
                    Powered by <span className="font-semibold">System Next IT</span><ExternalLink size={10} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>
      <FloatingChatButton websiteConfig={websiteConfig} onOpenChat={onOpenChat} />
    </>
  );
};

// Style 5: E-commerce Pro - Full-featured with app download links
const FooterStyle5: React.FC<StoreFooterProps> = ({ websiteConfig, logo, tenantId, onOpenChat }) => {
  const whatsappLink = buildWhatsAppLink(websiteConfig?.whatsappNumber);
  const resolvedFooterLogo = resolveTenantFooterLogo(websiteConfig, logo, tenantId);
  const currentYear = new Date().getFullYear();
  const quickLinks = getFooterQuickLinks(websiteConfig);
  const usefulLinks = getFooterUsefulLinks(websiteConfig);

  return (
    <>
      <footer className="bg-white border-t border-gray-200 mt-auto store-footer-minheight">
        <div className="bg-theme-primary/5 border-b border-theme-primary/10">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-theme-primary/10 flex items-center justify-center text-theme-primary flex-shrink-0">{feature.icon}</div>
                  <div><h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4><p className="text-xs text-gray-500">{feature.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1 lg:col-span-2">
              {resolvedFooterLogo ? <img src={normalizeImageUrl(resolvedFooterLogo)} alt={websiteConfig?.websiteName || 'Logo'} className="h-10 object-contain mb-4" /> : <h3 className="text-xl font-bold text-gray-900 mb-4">{websiteConfig?.websiteName || 'Store'}</h3>}
              <p className="text-gray-600 text-sm mb-4">{websiteConfig?.shortDescription || websiteConfig?.brandingText || 'Your trusted shopping destination.'}</p>
              <div className="flex gap-2 mb-4">
                {websiteConfig?.socialLinks?.slice(0, 4).map((social, idx) => (
                  <a key={idx} href={social.url || '#'} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-gray-200 hover:border-theme-primary hover:text-theme-primary flex items-center justify-center text-gray-500 transition-all" aria-label={social.platform}>{resolveSocialIcon(social.platform)}</a>
                ))}
              </div>
              <div className="flex gap-2">
                {websiteConfig?.androidAppUrl && <a href={websiteConfig.androidAppUrl} className="px-3 py-2 bg-gray-900 text-white rounded-lg text-xs flex items-center gap-2 hover:bg-gray-800"><span>Google Play</span></a>}
                {websiteConfig?.iosAppUrl && <a href={websiteConfig.iosAppUrl} className="px-3 py-2 bg-gray-900 text-white rounded-lg text-xs flex items-center gap-2 hover:bg-gray-800"><span>App Store</span></a>}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link, idx) => (
                  <li key={link.id || idx}><a href={link.url} className="text-gray-600 hover:text-theme-primary text-sm transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Useful Links</h4>
              <ul className="space-y-2">
                {usefulLinks.map((link, idx) => (
                  <li key={link.id || idx}><a href={link.url} className="text-gray-600 hover:text-theme-primary text-sm transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-600">
                {websiteConfig?.phones?.[0] && <li className="flex items-center gap-2"><Phone size={14} className="text-theme-primary" />{websiteConfig.phones[0]}</li>}
                {websiteConfig?.emails?.[0] && <li className="flex items-center gap-2"><Mail size={14} className="text-theme-primary" />{websiteConfig.emails[0]}</li>}
                {websiteConfig?.whatsappNumber && <li><a href={whatsappLink || '#'} className="flex items-center gap-2 text-green-600 hover:text-green-700"><MessageCircle size={14} />WhatsApp</a></li>}
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {!websiteConfig?.hideCopyright && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {!websiteConfig?.hideCopyrightText && (
                  <p className="text-sm text-gray-500">© {currentYear} {websiteConfig?.websiteName || 'Store'}. All rights reserved.</p>
                )}
                <div className="flex items-center gap-3"><span className="text-xs text-gray-500">Payments:</span><div className="flex gap-1">{['bKash', 'Nagad', 'Visa', 'Master'].map((m, i) => <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-medium text-gray-600">{m}</span>)}</div></div>
                {websiteConfig?.showPoweredBy && (
                  <a href="https://systemnextit.com" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-1">
                    Powered by <span className="font-semibold">System Next IT</span><ExternalLink size={10} />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </footer>
      <FloatingChatButton websiteConfig={websiteConfig} onOpenChat={onOpenChat} />
    </>
  );
};

export const StoreFooter: React.FC<StoreFooterProps> = (props) => {
  const style = props.websiteConfig?.footerStyle || 'style1';
  
  switch (style) {
    case 'style2':
      return <FooterStyle2 {...props} />;
    case 'style3':
      return <FooterStyle3 {...props} />;
    case 'style4':
      return <FooterStyle4 {...props} />;
    case 'style5':
      return <FooterStyle5 {...props} />;
    case 'style1':
    default:
      return <FooterStyle1 {...props} />;
  }
};
