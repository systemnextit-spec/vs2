// Purchase Service – per-tenant purchase tracking
// Uses same pattern as ExpenseService / IncomeService

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// In-memory cache for faster subsequent loads
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any, ttl = CACHE_TTL): void {
  cache.set(key, { data, expires: Date.now() + ttl });
}

function invalidateCache(pattern?: string): void {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) cache.delete(key);
    }
  } else {
    cache.clear();
  }
}

export interface PurchaseItemDTO {
  productId?: string;
  productName: string;
  sku?: string;
  barcode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  batchNo?: string;
  expireDate?: string | null;
  image?: string;
}

export interface PurchaseDTO {
  _id?: string;
  purchaseNumber?: string;
  items: PurchaseItemDTO[];
  totalAmount: number;
  supplierName: string;
  mobileNumber?: string;
  address?: string;
  paymentType?: 'cash' | 'due';
  paymentMethod?: string;
  cashPaid?: number;
  dueAmount?: number;
  employeeName?: string;
  note?: string;
  status?: string;
  tenantId?: string;
  createdAt?: string;
}

export interface PurchaseSummary {
  totalPurchases: number;
  totalAmount: number;
  totalItems: number;
}

let _tenantId = '';
export function setPurchaseTenantId(id: string) { _tenantId = id; }

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const base = API_BASE_URL || window.location.origin;
  const url = new URL(path, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

function headers(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { ...extra };
  if (_tenantId) h['X-Tenant-Id'] = _tenantId;
  // Add Authorization token from localStorage
  const token = localStorage.getItem('admin_auth_token');
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

export const PurchaseService = {
  // List with caching and pagination
  async list(opts: { startDate?: string; endDate?: string; page?: number; pageSize?: number } = {}) {
    const cacheKey = `purchases:list:${JSON.stringify(opts)}:${_tenantId}`;
    const cached = getCached<{ items: PurchaseDTO[]; total: number } | PurchaseDTO[]>(cacheKey);
    if (cached) return cached;

    const url = buildUrl('/api/purchases', opts);
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) return { items: [], total: 0 };
    const data = await res.json();
    // Handle both old (array) and new (paginated) response formats
    const result = Array.isArray(data) ? { items: data, total: data.length } : data;
    setCache(cacheKey, result);
    return result as { items: PurchaseDTO[]; total: number };
  },

  async getById(id: string) {
    const cacheKey = `purchases:item:${id}:${_tenantId}`;
    const cached = getCached<PurchaseDTO>(cacheKey);
    if (cached) return cached;

    const res = await fetch(buildUrl(`/api/purchases/${id}`), { headers: headers() });
    if (!res.ok) throw new Error('Purchase not found');
    const data = await res.json() as PurchaseDTO;
    setCache(cacheKey, data);
    return data;
  },

  // Summary with caching
  async summary() {
    const cacheKey = `purchases:summary:${_tenantId}`;
    const cached = getCached<PurchaseSummary>(cacheKey);
    if (cached) return cached;

    const res = await fetch(buildUrl('/api/purchases/summary/stats'), { headers: headers() });
    if (!res.ok) return { totalPurchases: 0, totalAmount: 0, totalItems: 0 };
    const data = await res.json() as PurchaseSummary;
    setCache(cacheKey, data);
    return data;
  },

  // Load both list and summary in parallel (for fast initial load)
  async loadAll(opts: { startDate?: string; endDate?: string; page?: number; pageSize?: number } = {}) {
    const [listResult, summaryResult] = await Promise.all([
      this.list(opts),
      this.summary()
    ]);
    return { list: listResult, summary: summaryResult };
  },

  async create(payload: Omit<PurchaseDTO, '_id' | 'purchaseNumber' | 'createdAt'>) {
    invalidateCache('purchases:');
    const res = await fetch(buildUrl('/api/purchases'), {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create purchase');
    return res.json() as Promise<PurchaseDTO>;
  },

  async update(id: string, payload: Partial<PurchaseDTO>) {
    invalidateCache('purchases:');
    const res = await fetch(buildUrl(`/api/purchases/${id}`), {
      method: 'PUT',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update purchase');
    return res.json() as Promise<{ message: string }>;
  },

  async remove(id: string) {
    invalidateCache('purchases:');
    const res = await fetch(buildUrl(`/api/purchases/${id}`), { method: 'DELETE', headers: headers() });
    if (!res.ok) throw new Error('Failed to delete purchase');
    return res.json() as Promise<{ message: string }>;
  },

  // Clear cache manually
  clearCache() {
    invalidateCache('purchases:');
  }
};
