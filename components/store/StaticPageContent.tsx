import React from 'react';
import type { WebsiteConfig } from '../../types';

interface StaticPageContentProps {
  websiteConfig?: WebsiteConfig;
}

// Map URLs to content keys and titles
const staticPageMap: Record<string, { key: keyof WebsiteConfig; title: string }> = {
  'about': { key: 'aboutUs', title: 'About Us' },
  'about-us': { key: 'aboutUs', title: 'About Us' },
  'privacy': { key: 'privacyPolicy', title: 'Privacy Policy' },
  'privacy-policy': { key: 'privacyPolicy', title: 'Privacy Policy' },
  'terms': { key: 'termsAndConditions', title: 'Terms and Conditions' },
  'termsnconditions': { key: 'termsAndConditions', title: 'Terms and Conditions' },
  'terms-and-conditions': { key: 'termsAndConditions', title: 'Terms and Conditions' },
  'returnpolicy': { key: 'returnPolicy', title: 'Return & Cancellation Policy' },
  'return-policy': { key: 'returnPolicy', title: 'Return & Cancellation Policy' },
  'refund': { key: 'returnPolicy', title: 'Refund Policy' },
  'refund-policy': { key: 'returnPolicy', title: 'Refund Policy' },
};

export const getStaticPageInfo = (path: string) => {
  const cleanPath = path.replace(/^\/+|\/+$/g, '').toLowerCase();
  return staticPageMap[cleanPath] || null;
};

export const StaticPageContent: React.FC<StaticPageContentProps> = ({ websiteConfig }) => {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const pageInfo = getStaticPageInfo(pathname);

  if (!pageInfo) return null;

  const content = websiteConfig?.[pageInfo.key] as string | undefined;

  return (
    <div className="min-h-[60vh] bg-gray-50 py-8 md:py-12">
      <div className="max-w-9xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
            {pageInfo.title}
          </h1>
          {content ? (
            <div 
              className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-theme-primary"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Content coming soon...</p>
              <p className="text-sm mt-2">Please check back later.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaticPageContent;
