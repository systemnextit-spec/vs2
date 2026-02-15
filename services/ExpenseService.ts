// Resolve API base URL with protocol check
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

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

/** * Interfaces 
 */
export interface ExpenseDTO {
  id?: string;
  name: string;
  category: string;
  amount: number;
  date: string; // ISO format
  status: 'Published' | 'Draft' | 'Trash';
  note?: string;
  imageUrl?: string;
  tenantId?: string;
}

export interface ExpenseSummary {
  totalAmount: number;
  totalTransactions: number;
  categories: number;
}

// Financial Summary Interface for the Dashboard logic
export interface FinancialSummary {
  productSellingPrice: number;
  purchaseCost: number;
  profitFromSell: number;
  otherIncome: number;
  totalExpense: number;
  netProfit: number;
}

/**
 * State & Helpers
 */
let _tenantId = '';
export function setExpenseTenantId(id: string) { _tenantId = id; }

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  // Ensure the base URL has a protocol to prevent URL constructor errors
  const base = API_BASE_URL.startsWith('http') ? API_BASE_URL : `http://${API_BASE_URL}`;
  const url = new URL(path, base);
  
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
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

/**
 * Global Response Handler for cleaner code
 */
async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/**
 * Main Service Object
 */
export const ExpenseService = {
  // 1. List Expenses with caching
  async list(opts: { query?: string; status?: string; category?: string; from?: string; to?: string; page?: number; pageSize?: number } = {}) {
    const cacheKey = `expenses:list:${JSON.stringify(opts)}:${_tenantId}`;
    const cached = getCached<{ items: ExpenseDTO[]; total: number }>(cacheKey);
    if (cached) return cached;

    const url = buildUrl('/api/expenses', opts);
    const res = await fetch(url, { headers: headers() });
    const data = await handleResponse<{ items: ExpenseDTO[]; total: number }>(res);
    setCache(cacheKey, data);
    return data;
  },

  // 2. Simple Expense Summary with caching
  async summary(opts: { from?: string; to?: string } = {}) {
    const cacheKey = `expenses:summary:${JSON.stringify(opts)}:${_tenantId}`;
    const cached = getCached<ExpenseSummary>(cacheKey);
    if (cached) return cached;

    const url = buildUrl('/api/expenses/summary', opts);
    const res = await fetch(url, { headers: headers() });
    const data = await handleResponse<ExpenseSummary>(res);
    setCache(cacheKey, data);
    return data;
  },

  // 3. Load both list and summary in parallel (for fast initial load)
  async loadAll(opts: { query?: string; status?: string; category?: string; from?: string; to?: string; page?: number; pageSize?: number } = {}) {
    const [listResult, summaryResult] = await Promise.all([
      this.list(opts),
      this.summary({ from: opts.from, to: opts.to })
    ]);
    return { list: listResult, summary: summaryResult };
  },

  // 4. Financial Dashboard Logic (Based on your image requirements)
  async getNetProfitReport(opts: { from?: string; to?: string } = {}): Promise<FinancialSummary> {
    const cacheKey = `expenses:profitLoss:${JSON.stringify(opts)}:${_tenantId}`;
    const cached = getCached<FinancialSummary>(cacheKey);
    if (cached) return cached;

    const url = buildUrl('/api/reports/profit-loss', opts);
    const res = await fetch(url, { headers: headers() });
    const data = await handleResponse<any>(res);

    // Business Logic Implementation:
    // Net Profit = (Selling Price - Purchase Cost) + Income - Expense
    const profitFromSell = data.productSellingPrice - data.purchaseCost;
    const netProfit = (profitFromSell + data.otherIncome) - data.totalExpense;

    const result = {
      ...data,
      profitFromSell,
      netProfit
    };
    setCache(cacheKey, result);
    return result;
  },

  // 5. Create Expense
  async create(payload: ExpenseDTO) {
    invalidateCache('expenses:');
    const res = await fetch(buildUrl('/api/expenses'), {
      method: 'POST',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse<ExpenseDTO>(res);
  },

  // 6. Update Expense
  async update(id: string, payload: Partial<ExpenseDTO>) {
    invalidateCache('expenses:');
    const res = await fetch(buildUrl(`/api/expenses/${id}`), {
      method: 'PUT',
      headers: headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return handleResponse<ExpenseDTO>(res);
  },

  // 7. Delete Expense
  async remove(id: string) {
    invalidateCache('expenses:');
    const res = await fetch(buildUrl(`/api/expenses/${id}`), { 
      method: 'DELETE', 
      headers: headers() 
    });
    return handleResponse<{ success: boolean }>(res);
  },

  // 8. Clear cache manually
  clearCache() {
    invalidateCache('expenses:');
  }
};