import { PublicProperty, ProtectedSellerDetails, PurchaseItem, AdminStats, User } from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('apna_property_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('apna_property_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('apna_property_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.message || 'Network request failed');
  }
  return data as T;
}

export const api = {
  // Properties
  async getProperties(params?: Record<string, any>): Promise<{ properties: PublicProperty[]; total: number }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ properties: PublicProperty[]; total: number }>(`/properties${qs}`);
  },

  async getProperty(idOrSlug: string): Promise<{
    property: PublicProperty;
    user_access: {
      is_unlocked: boolean;
      is_owner: boolean;
      is_admin: boolean;
      unlock_cost: number;
    };
  }> {
    return request(`/properties/${idOrSlug}`);
  },

  async getUnlockedDetails(idOrSlug: string): Promise<{
    unlocked: boolean;
    property_id: string;
    seller_details: ProtectedSellerDetails;
  }> {
    return request(`/properties/${idOrSlug}/unlocked`);
  },

  // Payments / Unlock
  async createPaymentOrder(propertyId: string): Promise<{
    order_id: string;
    amount: number;
    currency: string;
    property_id: string;
    property_title: string;
    buyer_name?: string;
    buyer_mobile?: string;
    razorpay_key_id: string;
    already_unlocked?: boolean;
  }> {
    return request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId })
    });
  },

  async verifyPayment(payload: {
    property_id: string;
    payment_id?: string;
    order_id?: string;
    gateway?: string;
    status?: string;
  }): Promise<{
    success: boolean;
    unlocked: boolean;
    seller_details: ProtectedSellerDetails;
    message: string;
  }> {
    return request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Post Property
  async postProperty(payload: any): Promise<{ success: boolean; message: string; property: PublicProperty }> {
    return request('/properties', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updatePropertyStatus(id: string, status: 'Available' | 'Sold'): Promise<{ success: boolean; property: PublicProperty }> {
    return request(`/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async deleteProperty(id: string): Promise<{ success: boolean; message: string }> {
    return request(`/properties/${id}`, {
      method: 'DELETE'
    });
  },

  // Dashboards
  async getBuyerPurchases(): Promise<{ purchases: PurchaseItem[] }> {
    return request<{ purchases: PurchaseItem[] }>('/buyer/purchases');
  },

  async getSellerProperties(): Promise<{ properties: any[] }> {
    return request<{ properties: any[] }>('/seller/properties');
  },

  async getAdminDashboard(): Promise<AdminStats> {
    return request<AdminStats>('/admin/dashboard');
  },

  async adminUpdateApproval(id: string, approval_status: string): Promise<any> {
    return request(`/properties/${id}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ approval_status })
    });
  },

  // Auth
  async login(identifier: string, password?: string, role?: string): Promise<{ user: User; token: string }> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password, role })
    });
  },

  async register(data: { name: string; email: string; mobile: string; password?: string; role: 'buyer' | 'seller' }): Promise<{ user: User; token: string }> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request('/auth/me');
  },

  async getDemoUsers(): Promise<{ users: User[] }> {
    return request('/auth/demo-users');
  }
};
