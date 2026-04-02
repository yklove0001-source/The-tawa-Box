export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'roti' | 'paratha' | 'combo';
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderDetails {
  date: string;
  time: string;
  items: CartItem[];
}
