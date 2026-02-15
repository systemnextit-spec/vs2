import { Router, Request } from 'express';
import { z } from 'zod';
import { getTenantData, setTenantData, getTenantDataBatch } from '../services/tenantDataService';
import { getCached, setCachedWithTTL, CacheKeys, deleteCached } from '../services/redisCache';
import { getTenantBySubdomain } from '../services/tenantsService';
import { createAuditLog } from './auditLogs';
import { Server as SocketIOServer } from 'socket.io';

// Store Studio configuration interface
interface StoreStudioConfig {
  tenantId: string;
  enabled: boolean;
  productDisplayOrder?: number[];
  customLayout?: unknown;
  updatedAt: string;
  updatedBy?: string;
}

const paramsSchema = z.object({
  tenantId: z.string().min(1, 'tenantId is required'),
  key: z.string().min(1, 'key is required')
});

const updateSchema = z.object({
  data: z.any()
});

// Helper to check if a string looks like a MongoDB ObjectId
const isObjectIdLike = (str: string): boolean => /^[a-f\d]{24}$/i.test(str);

// Resolve tenant scope - if it's a slug, convert to tenant ID
const resolveTenantId = async (scope: string): Promise<string> => {
  // If it looks like a MongoDB ObjectId, use it directly
  if (isObjectIdLike(scope)) {
    return scope;
  }
  
  // If it's 'public', keep as-is for global data
  if (scope === 'public') {
    return scope;
  }
  
  // Otherwise, try to resolve as a subdomain/slug
  try {
    const tenant = await getTenantBySubdomain(scope);
    if (tenant?._id) {
      const tenantId = tenant._id.toString();
      console.log(`[TenantData] Resolved slug "${scope}" to tenant ID: ${tenantId}`);
      return tenantId;
    }
  } catch (e) {
    console.warn(`[TenantData] Failed to resolve slug "${scope}":`, e);
  }
  
  // Fallback to original scope
  return scope;
};

export const tenantDataRouter = Router();

// Helper to emit Socket.IO events
const emitDataUpdate = (req: Request, tenantId: string, key: string, data: unknown) => {
  const io = req.app.get('io') as SocketIOServer | undefined;
  if (io) {
    // Emit to tenant-specific room
    io.to(`tenant:${tenantId}`).emit('data-update', { tenantId, key, data, timestamp: Date.now() });
    
    // Emit specific event for chat messages for real-time chat
    if (key === 'chat_messages') {
      io.to(`tenant:${tenantId}`).emit('chat-update', { tenantId, data, timestamp: Date.now() });
      console.log(`[Socket.IO] Emitted chat-update for ${tenantId}`);
    }
    
    // Also emit globally for cross-tenant admins
    io.emit('data-update-global', { tenantId, key, timestamp: Date.now() });
    console.log(`[Socket.IO] Emitted data-update for ${tenantId}/${key}`);
  }
};

// Bootstrap endpoint - returns all critical data in ONE database query
tenantDataRouter.get('/:tenantId/bootstrap', async (req, res, next) => {
  try {
    const rawTenantId = req.params.tenantId;
    if (!rawTenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    // Resolve slug to tenant ID if needed
    const tenantId = await resolveTenantId(rawTenantId);
    
    // Fetch all critical data in ONE database query (not 3 parallel queries)
    const data = await getTenantDataBatch<{
      products: unknown;
      theme_config: unknown;
      website_config: unknown;
    }>(tenantId, ['products', 'theme_config', 'website_config']);
    
    // Allow short caching for bootstrap data (30 seconds)
    res.set({
      'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
    });
    
    res.json({
      data: {
        products: data.products || [],
        theme_config: data.theme_config || null,
        website_config: data.website_config || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Secondary data endpoint - returns all secondary data in ONE database query
tenantDataRouter.get('/:tenantId/secondary', async (req, res, next) => {
  try {
    const rawTenantId = req.params.tenantId;
    if (!rawTenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    // Resolve slug to tenant ID if needed
    const tenantId = await resolveTenantId(rawTenantId);
    
    // Fetch all secondary data in ONE database query (not 10 parallel queries)
    const data = await getTenantDataBatch<{
      orders: unknown;
      logo: unknown;
      delivery_config: unknown;
      payment_methods: unknown;
      chat_messages: unknown;
      landing_pages: unknown;
      categories: unknown;
      subcategories: unknown;
      childcategories: unknown;
      brands: unknown;
      tags: unknown;
    }>(tenantId, [
      'orders', 'logo', 'delivery_config', 'payment_methods', 'chat_messages', 'landing_pages',
      'categories', 'subcategories', 'childcategories', 'brands', 'tags'
    ]);
    
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    
    res.json({
      data: {
        orders: data.orders || [],
        logo: data.logo || null,
        delivery_config: data.delivery_config || [],
        payment_methods: data.payment_methods || [],
        chat_messages: data.chat_messages || [],
        landing_pages: data.landing_pages || [],
        categories: data.categories || [],
        subcategories: data.subcategories || [],
        childcategories: data.childcategories || [],
        brands: data.brands || [],
        tags: data.tags || []
      }
    });
  } catch (error) {
    next(error);
  }
});

// Store Studio Configuration Endpoints
// NOTE: These specific routes MUST be defined BEFORE the generic /:tenantId/:key routes
// otherwise Express will match the generic route first

// Get store studio configuration
tenantDataRouter.get('/:tenantId/store_studio_config', async (req, res, next) => {
  try {
    const rawTenantId = req.params.tenantId;
    if (!rawTenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    // Prevent browser caching to ensure fresh data on reload
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const tenantId = await resolveTenantId(rawTenantId);
    const config = await getTenantData(tenantId, 'store_studio_config');
    
    // Return default config if none exists
    const defaultConfig = {
      tenantId,
      enabled: false,
      productDisplayOrder: [],
      customLayout: null,
      updatedAt: new Date().toISOString()
    };
    
    // Check for null, undefined, or empty object
    const hasValidConfig = config && typeof config === 'object' && Object.keys(config).length > 0;
    res.json({ data: hasValidConfig ? config : defaultConfig });
  } catch (error) {
    console.error(`[TenantData] Error fetching store_studio_config:`, error);
    return res.status(500).json({ 
      error: 'Failed to fetch store studio configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update store studio configuration (toggle, settings, etc.)
tenantDataRouter.put('/:tenantId/store_studio_config', async (req, res, next) => {
  try {
    const rawTenantId = req.params.tenantId;
    if (!rawTenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    // Prevent browser caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const tenantId = await resolveTenantId(rawTenantId);
    const config = req.body;
    
    // Ensure tenantId is set correctly
    config.tenantId = tenantId;
    config.updatedAt = new Date().toISOString();
    
    // Get user info for audit
    const user = (req as any).user;
    if (user) {
      config.updatedBy = user._id || user.id;
    }
    
    await setTenantData(tenantId, 'store_studio_config', config);
    
    // Emit real-time update
    emitDataUpdate(req, tenantId, 'store_studio_config', config);
    
    // Create audit log
    await createAuditLog({
      tenantId,
      userId: user?._id || user?.id || 'system',
      userName: user?.name || 'System',
      userRole: user?.role || 'system',
      action: 'Store Studio Config Updated',
      actionType: 'update',
      resourceType: 'settings',
      resourceId: tenantId,
      resourceName: 'store_studio_config',
      details: `Store Studio ${config.enabled ? 'enabled' : 'disabled'}`,
      metadata: { enabled: config.enabled },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });
    
    res.json({ data: config, success: true });
  } catch (error) {
    console.error(`[TenantData] Error updating store_studio_config:`, error);
    return res.status(500).json({ 
      error: 'Failed to update store studio configuration',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update product display order
tenantDataRouter.put('/:tenantId/product_display_order', async (req, res, next) => {
  try {
    const rawTenantId = req.params.tenantId;
    if (!rawTenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    
    // Prevent browser caching
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    const tenantId = await resolveTenantId(rawTenantId);
    const { productDisplayOrder } = req.body;
    
    if (!Array.isArray(productDisplayOrder)) {
      return res.status(400).json({ error: 'productDisplayOrder must be an array' });
    }
    
    // Update the store studio config with new product order
    const existingConfig: StoreStudioConfig = (await getTenantData(tenantId, 'store_studio_config') as StoreStudioConfig | null) || {
      tenantId,
      enabled: false,
      updatedAt: new Date().toISOString()
    };
    
    existingConfig.productDisplayOrder = productDisplayOrder;
    existingConfig.updatedAt = new Date().toISOString();
    
    const user = (req as any).user;
    if (user) {
      existingConfig.updatedBy = user._id || user.id;
    }
    
    await setTenantData(tenantId, 'store_studio_config', existingConfig);
    
    // Emit real-time update
    emitDataUpdate(req, tenantId, 'store_studio_config', existingConfig);
    
    // Create audit log
    await createAuditLog({
      tenantId,
      userId: user?._id || user?.id || 'system',
      userName: user?.name || 'System',
      userRole: user?.role || 'system',
      action: 'Product Display Order Updated',
      actionType: 'update',
      resourceType: 'product',
      resourceId: tenantId,
      resourceName: 'product_display_order',
      details: `Product display order updated (${productDisplayOrder.length} products)`,
      metadata: { productCount: productDisplayOrder.length },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });
    
    res.json({ data: existingConfig, success: true });
  } catch (error) {
    console.error(`[TenantData] Error updating product_display_order:`, error);
    return res.status(500).json({ 
      error: 'Failed to update product display order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generic tenant data endpoints
// NOTE: These MUST be defined AFTER specific routes like store_studio_config

tenantDataRouter.get('/:tenantId/:key', async (req, res, next) => {
  try {
    const { tenantId, key } = paramsSchema.parse(req.params);
    
    // Use Redis cache for frequently accessed data like 'users'
    const cacheKey = `tenant:${tenantId}:${key}`;
    const cached = await getCached<unknown>(cacheKey);
    if (cached !== null) {
      console.log(`[Redis] Cache hit for ${tenantId}/${key}`);
      res.set({ 'Cache-Control': 'no-cache, no-store, must-revalidate' });
      return res.json({ data: cached });
    }
    
    const data = await getTenantData(tenantId, key);
    
    // Cache the result for 5 minutes
    if (data !== null) {
      await setCachedWithTTL(cacheKey, data, 'short');
    }
    
    // Prevent browser/CDN caching for dynamic tenant data
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.json({ data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

tenantDataRouter.put('/:tenantId/:key', async (req, res, next) => {
  try {
    const { tenantId, key } = paramsSchema.parse(req.params);
    const payload = updateSchema.parse(req.body ?? {});
    await setTenantData(tenantId, key, payload.data);
    
    // Invalidate Redis cache for this key so next GET fetches fresh data
    const cacheKey = `tenant:${tenantId}:${key}`;
    await deleteCached(cacheKey);
    
    // Emit real-time update via Socket.IO
    emitDataUpdate(req, tenantId, key, payload.data);
    
    console.log(`[TenantData] Saved ${key} for tenant ${tenantId} (cache invalidated)`);
    
    // Create audit log for important data changes
    if (['products', 'categories', 'subcategories', 'childcategories', 'brands', 'tags'].includes(key)) {
      const user = (req as any).user;
      const dataArray = Array.isArray(payload.data) ? payload.data : [];
      await createAuditLog({
        tenantId,
        userId: user?._id || user?.id || 'system',
        userName: user?.name || 'System',
        userRole: user?.role || 'system',
        action: `${key.charAt(0).toUpperCase() + key.slice(1)} Updated`,
        actionType: 'update',
        resourceType: key === 'products' ? 'product' : key === 'categories' ? 'category' : 'other',
        resourceId: tenantId,
        resourceName: key,
        details: `${key} data updated (${dataArray.length} items)`,
        metadata: { key, itemCount: dataArray.length },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'success'
      });
    }
    res.json({ data: { tenantId, key, success: true } });
  } catch (error) {
    console.error(`[TenantData] Error saving ${req.params.key} for ${req.params.tenantId}:`, error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});
