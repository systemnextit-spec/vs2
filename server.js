import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import compression from 'compression';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

// Cache durations
const ONE_YEAR = 31536000; // 1 year in seconds
const ONE_DAY = 86400; // 1 day in seconds
const ONE_WEEK = 604800; // 1 week in seconds
const ONE_HOUR = 3600; // 1 hour in seconds

// Pre-cache templates in production for instant response
let cachedTemplate = null;
let criticalAssets = []; // Cache critical asset paths for Early Hints

// Brotli-first compression middleware for better performance
const compressionMiddleware = compression({
  level: 6, // Balance between speed and compression
  threshold: 256, // Only compress responses > 256 bytes
  filter: (req, res) => {
    // Skip compression for already compressed formats
    const contentType = res.getHeader('Content-Type') || '';
    if (/image\/(png|jpeg|gif|webp)|font\/(woff|woff2)/.test(contentType)) {
      return false;
    }
    return compression.filter(req, res);
  }
});

// Set cache headers based on file type and whether it's hashed
const setCacheHeaders = (res, filePath) => {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);
  
  // Check if file is in assets directory (Vite output) or has a content hash
  // Vite adds 8-character hashes like: filename.abc12345.js
  const isInAssets = normalizedPath.includes('/assets/');
  const hasHash = /\.[a-f0-9]{8}\.(js|css|woff2?|ttf|eot)$/i.test(filename);
  
  // Set Vary header for proper CDN caching
  res.setHeader('Vary', 'Accept-Encoding');
  
  if (isInAssets || hasHash) {
    // Hashed assets: immutable, long cache (1 year)
    res.setHeader('Cache-Control', `public, max-age=${ONE_YEAR}, immutable`);
    res.setHeader('CDN-Cache-Control', `public, max-age=${ONE_YEAR}`);
  } else if (['.js', '.css'].includes(ext)) {
    // Unhashed JS/CSS: short cache with revalidation
    res.setHeader('Cache-Control', `public, max-age=${ONE_DAY}, stale-while-revalidate=${ONE_WEEK}`);
  } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif'].includes(ext)) {
    // Images: moderate cache with revalidation
    res.setHeader('Cache-Control', `public, max-age=${ONE_WEEK}, stale-while-revalidate=${ONE_YEAR}`);
  } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
    // Fonts: long cache (usually versioned externally)
    res.setHeader('Cache-Control', `public, max-age=${ONE_YEAR}, immutable`);
  } else if (['.json', '.xml', '.txt'].includes(ext)) {
    // Config/data files: short cache with revalidation
    res.setHeader('Cache-Control', `public, max-age=${ONE_HOUR}, stale-while-revalidate=${ONE_DAY}`);
  } else {
    // Default: moderate cache
    res.setHeader('Cache-Control', `public, max-age=${ONE_DAY}`);
  }
  
  // CORS headers for cross-origin requests (CDN subdomains)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Timing-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
};

async function createServer() {
  const app = express();

  // Trust proxy for Cloudflare
  app.set('trust proxy', true);

  // Use compression middleware
  app.use(compressionMiddleware);

  // Security headers middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Allow iframe embedding from same origin and subdomains (for preview feature)
    const host = req.headers.host || '';
    if (host.includes('localhost')) {
      // For localhost development: allow any localhost subdomain
      res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://*.localhost:3000 http://localhost:3000");
    } else {
      // For production: allow same origin and subdomains
      const baseDomain = host.split('.').slice(-2).join('.');
      res.setHeader('Content-Security-Policy', `frame-ancestors 'self' https://*.${baseDomain} https://${baseDomain}`);
    }
    // Remove X-Frame-Options as we're using CSP frame-ancestors instead
    next();
  });

  // CORS middleware for API requests (handles subdomains like admin.localhost)
  app.use('/api', (req, res, next) => {
    const origin = req.headers.origin || '';
    // Allow localhost and any subdomain of localhost
    const localhostPattern = /^https?:\/\/([a-z0-9-]+\.)?localhost(:\d+)?$/i;
    
    if (localhostPattern.test(origin) || !origin) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Tenant-ID, X-Tenant-Subdomain, X-Requested-With, Accept, Origin');
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    next();
  });

  // Proxy API requests to backend server
  // Uses raw streaming to properly handle multipart/form-data file uploads
  app.use('/api', async (req, res) => {
    const backendUrl = `http://localhost:5001/api${req.url}`;
    const contentType = req.get('Content-Type') || '';
    const isMultipart = contentType.includes('multipart/form-data');
    
    try {
      // For multipart/form-data, stream the raw request body to preserve file data
      // For JSON, we can use express.json() parser upstream if needed
      let bodyBuffer;
      let forwardHeaders = {
        'Authorization': req.get('Authorization') || '',
        'X-Tenant-ID': req.get('X-Tenant-ID') || '',
        'X-Tenant-Subdomain': req.get('X-Tenant-Subdomain') || '',
        'X-Forwarded-For': req.ip || req.get('X-Forwarded-For') || '',
        'X-Real-IP': req.get('X-Real-IP') || req.ip || '',
      };

      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        if (isMultipart) {
          // Stream raw body for multipart/form-data (file uploads)
          bodyBuffer = await new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', reject);
          });
          // Preserve the exact Content-Type with boundary
          forwardHeaders['Content-Type'] = contentType;
          forwardHeaders['Content-Length'] = bodyBuffer.length.toString();
        } else {
          // For JSON, collect body and forward as JSON string
          bodyBuffer = await new Promise((resolve, reject) => {
            const chunks = [];
            req.on('data', chunk => chunks.push(chunk));
            req.on('end', () => resolve(Buffer.concat(chunks)));
            req.on('error', reject);
          });
          forwardHeaders['Content-Type'] = contentType || 'application/json';
          forwardHeaders['Content-Length'] = bodyBuffer.length.toString();
        }
      }

      const response = await fetch(backendUrl, {
        method: req.method,
        headers: forwardHeaders,
        body: bodyBuffer || undefined,
        // Ensure we don't modify the body
        duplex: 'half'
      });
      
      // Copy response headers
      const responseContentType = response.headers.get('Content-Type');
      if (responseContentType) res.setHeader('Content-Type', responseContentType);
      
      const data = await response.text();
      res.status(response.status).send(data);
    } catch (error) {
      console.error('[proxy] API request failed:', error.message);
      res.status(503).json({ error: 'Backend server unavailable', retry: true });
    }
  });

  // CORS middleware for static assets (required for CDN subdomains)
  app.use((req, res, next) => {
    const url = (req.url || '').toLowerCase();
    const isAssetRequest =
      url.startsWith('/assets/') ||
      url.endsWith('.js') ||
      url.endsWith('.css') ||
      url.endsWith('.woff') ||
      url.endsWith('.woff2') ||
      url.endsWith('.ttf') ||
      url.endsWith('.eot') ||
      url.endsWith('.svg') ||
      url.endsWith('.png') ||
      url.endsWith('.jpg') ||
      url.endsWith('.jpeg') ||
      url.endsWith('.webp') ||
      url.endsWith('.avif') ||
      url.endsWith('.gif');

    if (isAssetRequest) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Timing-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }
    }

    next();
  });

  // Block access to sensitive files and directories
  // Note: node_modules is only blocked in production - Vite needs it in development
  app.use((req, res, next) => {
    const blocked = ['.git', '.env', '.htaccess', '.svn', 'wp-admin', 'wp-login', 'phpinfo', '.DS_Store'];
    // Only block node_modules in production - Vite serves from node_modules in dev
    if (isProduction) {
      blocked.push('node_modules');
    }
    const url = req.url.toLowerCase();
    if (blocked.some(b => url.includes(b))) {
      return res.status(404).end();
    }
    next();
  });

  // Serve landingpage folder as static content at /landingpage
  // In production, serve from dist/client/landingpage; in development, serve from source landingpage folder
  const landingpagePath = path.resolve(__dirname, 'landingpage');
  app.use('/landingpage', express.static(landingpagePath, {
    index: 'index.html',
    setHeaders: (res) => {
      res.setHeader('Cache-Control', `public, max-age=${ONE_DAY}, stale-while-revalidate=${ONE_WEEK}`);
    }
  }));

  let vite;
  if (!isProduction) {
    // Development: use Vite's dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  } else {
    // Production: pre-cache template at startup
    cachedTemplate = fs.readFileSync(path.resolve(__dirname, 'dist/client/index.html'), 'utf-8');
    
    // Extract critical asset paths for Early Hints and Link preload headers
    const modulePreloadRegex = /<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"[^>]*>/gi;
    const cssPreloadRegex = /<link[^>]+rel="preload"[^>]+href="([^"]+)"[^>]+as="style"[^>]*>/gi;
    const scriptSrcRegex = /<script[^>]+src="([^"]+)"[^>]*>/gi;
    
    let match;
    while ((match = modulePreloadRegex.exec(cachedTemplate)) !== null) {
      criticalAssets.push({ path: match[1], type: 'script', priority: 'high' });
    }
    while ((match = cssPreloadRegex.exec(cachedTemplate)) !== null) {
      criticalAssets.push({ path: match[1], type: 'style', priority: 'high' });
    }
    while ((match = scriptSrcRegex.exec(cachedTemplate)) !== null) {
      if (!criticalAssets.find(a => a.path === match[1])) {
        criticalAssets.push({ path: match[1], type: 'script', priority: 'low' });
      }
    }
    
    console.log(`📦 Cached ${criticalAssets.length} critical assets for preloading`);
    
    // Production: serve static files with optimized caching
    app.use(express.static(path.resolve(__dirname, 'dist/client'), {
      index: false,
      setHeaders: setCacheHeaders,
      maxAge: ONE_YEAR * 1000,
      immutable: true,
      etag: true,
      lastModified: true
    }));
  }

  // Handle all routes - serve static HTML (no SSR to avoid hydration issues)
  app.use('*', async (req, res, next) => {
    try {
      let template;

      if (!isProduction) {
        // Development: read and transform HTML on the fly
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
      } else {
        // Production: use pre-cached template (zero I/O)
        template = cachedTemplate;
        
        // Send Link headers for critical resources (Cloudflare will use these)
        // This enables parallel preloading at the CDN level
        if (criticalAssets.length > 0) {
          const linkHeaders = criticalAssets
            .filter(a => a.priority === 'high')
            .slice(0, 10) // Limit to top 10 critical assets
            .map(({ path: assetPath, type }) => {
              if (type === 'script') {
                return `<${assetPath}>; rel=preload; as=script; crossorigin`;
              }
              return `<${assetPath}>; rel=preload; as=style; crossorigin`;
            });
          
          if (linkHeaders.length > 0) {
            res.setHeader('Link', linkHeaders.join(', '));
          }
        }
      }

      // Send static HTML - React will hydrate on client side
      res.status(200)
        .set({
          'Content-Type': 'text/html; charset=utf-8',
          // Short browser cache, longer CDN cache with stale-while-revalidate
          'Cache-Control': isProduction 
            ? 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400' 
            : 'no-cache, no-store',
          'CDN-Cache-Control': isProduction ? 'public, max-age=60' : 'no-store',
          'X-Content-Type-Options': 'nosniff',
          'Vary': 'Accept-Encoding, Accept'
        })
        .end(template);
    } catch (e) {
      if (!isProduction && vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error('Server Error:', e.message);
      next(e);
    }
  });

  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${port} (${isProduction ? 'production' : 'development'})`);
  });
}

createServer();
