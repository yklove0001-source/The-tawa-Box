export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'roti' | 'paratha' | 'combo' | 'sabji' | 'side' | 'thali' | 'healthy';
}

export interface CartItem extends MenuItem {
  quantity: number;
  customization?: {
    rotis?: string[];
    vegetables?: string[];
    vegSalad?: string;
    fruitSalad?: string;
    rice?: string;
  };
}

export interface OrderDetails {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  mobile: string;
  address: string;
  location?: { lat: number; lng: number };
  items: CartItem[];
  total: number;
  paymentMethod: 'cod' | 'online';
  status: 'pending' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery?: string;
  notes?: string;
  loyaltyPointsEarned?: number;
  discountAmount?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  createdAt: string;
}
