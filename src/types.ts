export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'roti' | 'paratha' | 'combo' | 'sabji' | 'side';
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderDetails {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}
