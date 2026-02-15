import React from 'react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';

// SSR-safe minimal shell - avoids useLayoutEffect warnings from third-party libs
// The full App hydrates on the client side
export function render() {
  const helmetContext = {};
  
  // Render a minimal shell for SEO - client will hydrate the full app
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <div id="root">
        {/* Minimal loading shell - full app hydrates on client */}
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" />
      </div>
    </HelmetProvider>
  );
  
  return { html, head: (helmetContext as any).helmet };
}
