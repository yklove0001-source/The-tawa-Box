export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'roti' | 'paratha' | 'combo' | 'sabji' | 'side' | 'thali' | 'healthy' | 'subscription';
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
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  whatsapp?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  points: number;
  deliveryAddresses?: string[];
  subscription?: {
    plan: 'free' | 'weekly_basic' | 'monthly_pro' | 'none';
    status: 'none' | 'active' | 'cancelled';
    expiresAt: string;
  };
  createdAt: string;
  hairPatchServices?: HairPatchService[];
  hairPatchAppointments?: HairPatchAppointment[];
  hairPatchProducts?: HairPatchProduct[];
}

export interface HairPatchService {
  id: string;
  name: string;
  stylist: string;
  date: string;
  cost: number;
  status: 'completed' | 'cancelled';
}

export interface HairPatchAppointment {
  id: string;
  name: string;
  stylist: string;
  date: string;
  time: string;
  status: 'scheduled' | 'cancelled' | 'rescheduled';
}

export interface HairPatchProduct {
  id: string;
  name: string;
  price: number;
  purchaseDate: string;
  status: 'delivered' | 'shipped' | 'pending';
  image?: string;
}
