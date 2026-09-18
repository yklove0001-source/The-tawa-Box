export type PropertyType = 'House' | 'Flat' | 'Plot' | 'Land' | 'Shop' | 'Office' | 'Other';
export type AreaUnit = 'Sq Ft' | 'Sq Yard' | 'Sq Meter' | 'Bigha' | 'Acre' | 'Other';
export type PropertyStatus = 'Available' | 'Sold';
export type ApprovalStatus = 'Pending Approval' | 'Approved' | 'Rejected';
export type UnlockStatus = 'LOCKED' | 'UNLOCKED';
export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
}

export interface MediaItem {
  id: string;
  media_type: 'photo' | 'video';
  media_url: string;
  is_cover: boolean;
}

export interface PublicSpecifications {
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  floor_number?: number;
  total_floors?: number;
  parking?: string;
  furnished_status?: string;
  society_name?: string;
  plot_dimensions?: string;
  road_width?: string;
  facing?: string;
  corner_plot?: boolean;
  boundary_status?: string;
  land_type?: string;
  road_access?: boolean;
  water_availability?: boolean;
  electricity_availability?: boolean;
}

export interface PublicProperty {
  id: string;
  slug: string;
  title: string;
  property_type: PropertyType;
  price: number;
  area: number;
  area_unit: AreaUnit;
  state: string;
  city: string;
  locality: string;
  description: string;
  status: PropertyStatus;
  approval_status: ApprovalStatus;
  unlock_status: UnlockStatus;
  views: number;
  unlocks_count: number;
  created_at: string;
  cover_image: string;
  media: MediaItem[];
  photo_count: number;
  has_video: boolean;
  public_specifications: PublicSpecifications;
}

export interface ProtectedSellerDetails {
  unlocked: boolean;
  unlock_status: UnlockStatus;
  seller_name: string;
  seller_mobile: string;
  seller_whatsapp?: string;
  seller_type: string;
  full_address: string;
  landmark?: string;
  pincode: string;
  exact_location?: {
    address: string;
    landmark?: string;
    pincode: string;
    locality: string;
    city: string;
    state: string;
  };
  private_seller_notes?: string;
  unlocked_at?: string;
}

export interface PurchaseItem {
  unlock_id: string;
  unlocked_at: string;
  amount: number;
  payment_id: string;
  property: {
    id: string;
    slug: string;
    title: string;
    price: number;
    area: number;
    area_unit: AreaUnit;
    city: string;
    locality: string;
    cover_image: string;
    status: PropertyStatus;
    seller_name: string;
    seller_mobile: string;
    seller_whatsapp?: string;
    full_address: string;
    landmark?: string;
    pincode: string;
  };
}

export interface AdminStats {
  metrics: {
    totalUsers: number;
    totalProperties: number;
    availableProperties: number;
    soldProperties: number;
    totalUnlocks: number;
    totalRevenue: number;
  };
  recentPayments: Array<{
    id: string;
    buyer_id: string;
    buyer_name?: string;
    buyer_mobile?: string;
    property_id: string;
    property_title?: string;
    amount: number;
    status: string;
    created_at: string;
  }>;
  properties: Array<PublicProperty & { seller_name?: string; seller_mobile?: string; address?: string }>;
  users: User[];
}
