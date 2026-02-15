// OrderService - Reusable order API operations
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

function getHeaders(tenantId: string): Record<string, string> {
  const token = localStorage.getItem('admin_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Id': tenantId,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface DeleteOrderResult {
  success: boolean;
  orderId: string;
  error?: string;
}

export interface BulkDeleteResult {
  successCount: number;
  failCount: number;
  results: DeleteOrderResult[];
}

export interface UpdateOrderResult {
  success: boolean;
  orderId: string;
  error?: string;
}

export interface BulkUpdateResult {
  successCount: number;
  failCount: number;
  results: UpdateOrderResult[];
}

export const OrderService = {
  /**
   * Delete a single order
   */
  async deleteOrder(tenantId: string, orderId: string): Promise<DeleteOrderResult> {
    try {
      // URL encode the orderId to handle special characters like #
      const encodedOrderId = encodeURIComponent(orderId);
      const response = await fetch(`${API_BASE_URL}/api/orders/${tenantId}/${encodedOrderId}`, {
        method: 'DELETE',
        headers: getHeaders(tenantId),
      });
      
      if (response.ok) {
        return { success: true, orderId };
      } else {
        const errorText = await response.text();
        console.error(`[OrderService] Failed to delete order ${orderId}:`, errorText);
        return { success: false, orderId, error: errorText };
      }
    } catch (error: any) {
      console.error(`[OrderService] Error deleting order ${orderId}:`, error);
      return { success: false, orderId, error: error.message || 'Network error' };
    }
  },

  /**
   * Delete multiple orders
   */
  async bulkDelete(tenantId: string, orderIds: string[]): Promise<BulkDeleteResult> {
    const results: DeleteOrderResult[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const orderId of orderIds) {
      const result = await this.deleteOrder(tenantId, orderId);
      results.push(result);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    return { successCount, failCount, results };
  },

  /**
   * Update a single order
   */
  async updateOrder(tenantId: string, orderId: string, updates: Record<string, any>): Promise<UpdateOrderResult> {
    try {
      // URL encode the orderId to handle special characters like #
      const encodedOrderId = encodeURIComponent(orderId);
      const response = await fetch(`${API_BASE_URL}/api/orders/${tenantId}/${encodedOrderId}`, {
        method: 'PATCH',
        headers: getHeaders(tenantId),
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        return { success: true, orderId };
      } else {
        const errorText = await response.text();
        console.error(`[OrderService] Failed to update order ${orderId}:`, errorText);
        return { success: false, orderId, error: errorText };
      }
    } catch (error: any) {
      console.error(`[OrderService] Error updating order ${orderId}:`, error);
      return { success: false, orderId, error: error.message || 'Network error' };
    }
  },

  /**
   * Update multiple orders with the same changes
   */
  async bulkUpdate(tenantId: string, orderIds: string[], updates: Record<string, any>): Promise<BulkUpdateResult> {
    const results: UpdateOrderResult[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const orderId of orderIds) {
      const result = await this.updateOrder(tenantId, orderId, updates);
      results.push(result);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    return { successCount, failCount, results };
  },

  /**
   * Update order status
   */
  async updateStatus(tenantId: string, orderId: string, status: string): Promise<UpdateOrderResult> {
    return this.updateOrder(tenantId, orderId, { status });
  },

  /**
   * Bulk update order status
   */
  async bulkUpdateStatus(tenantId: string, orderIds: string[], status: string): Promise<BulkUpdateResult> {
    return this.bulkUpdate(tenantId, orderIds, { status });
  },
};

export default OrderService;
