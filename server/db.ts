import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  role: 'buyer' | 'seller' | 'admin';
  created_at: string;
}

export interface PropertyMedia {
  id: string;
  property_id: string;
  media_type: 'photo' | 'video';
  media_url: string;
  is_cover: boolean;
  created_at: string;
}

export interface PropertyDetails {
  id: string;
  property_id: string;
  // Type-specific specs
  bedrooms?: number;
  bathrooms?: number;
  floors?: number;
  floor_number?: number;
  total_floors?: number;
  parking?: string;
  furnished_status?: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
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
  private_seller_notes?: string;
  created_at: string;
}

export interface PropertyRecord {
  id: string;
  slug: string;
  seller_id: string;
  title: string;
  property_type: 'House' | 'Flat' | 'Plot' | 'Land' | 'Shop' | 'Office' | 'Other';
  price: number; // in INR
  area: number;
  area_unit: 'Sq Ft' | 'Sq Yard' | 'Sq Meter' | 'Bigha' | 'Acre' | 'Other';
  state: string;
  city: string;
  locality: string;
  // Protected private fields:
  address: string;
  landmark?: string;
  pincode: string;
  seller_name: string;
  seller_mobile: string;
  seller_whatsapp?: string;
  seller_type: 'Owner' | 'Dealer / Agent' | 'Builder / Developer';
  description: string;
  status: 'Available' | 'Sold';
  approval_status: 'Pending Approval' | 'Approved' | 'Rejected';
  unlock_status: 'LOCKED' | 'UNLOCKED';
  views: number;
  unlocks_count: number;
  created_at: string;
  updated_at: string;
}

export interface PropertyUnlockRecord {
  id: string;
  buyer_id: string;
  property_id: string;
  payment_id: string;
  amount: number; // 50
  payment_status: 'Successful' | 'Pending' | 'Failed';
  unlocked_at: string;
}

export interface PaymentRecord {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  buyer_mobile?: string;
  property_id: string;
  property_title?: string;
  amount: number; // 50
  gateway: 'razorpay' | 'upi_direct' | 'simulation';
  gateway_payment_id: string;
  status: 'Successful' | 'Pending' | 'Failed' | 'Refunded';
  created_at: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  properties: PropertyRecord[];
  property_media: PropertyMedia[];
  property_details: PropertyDetails[];
  property_unlocks: PropertyUnlockRecord[];
  payments: PaymentRecord[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'portal_database.json');

// Ensure data folder exists
const dataDir = path.dirname(DB_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function getInitialData(): DatabaseSchema {
  const now = new Date().toISOString();

  const users: UserRecord[] = [
    {
      id: 'usr_admin_1',
      name: 'Portal Admin',
      email: 'admin@apnaproperty.in',
      mobile: '+91 9876543210',
      role: 'admin',
      created_at: now
    },
    {
      id: 'usr_seller_1',
      name: 'Rameshwar Sharma',
      email: 'rameshwar.agra@gmail.com',
      mobile: '+91 9412356789',
      role: 'seller',
      created_at: now
    },
    {
      id: 'usr_seller_2',
      name: 'Vikram Singh Shekhawat',
      email: 'vikram.jaipur@properties.com',
      mobile: '+91 9829012345',
      role: 'seller',
      created_at: now
    },
    {
      id: 'usr_seller_3',
      name: 'Sunil Verma',
      email: 'sunil.noida@gmail.com',
      mobile: '+91 9910022334',
      role: 'seller',
      created_at: now
    },
    {
      id: 'usr_buyer_1',
      name: 'Amit Kumar',
      email: 'amit.buyer@gmail.com',
      mobile: '+91 9897011223',
      role: 'buyer',
      created_at: now
    }
  ];

  const properties: PropertyRecord[] = [
    {
      id: 'prop_agra_house_1',
      slug: 'beautiful-3-bhk-house-in-agra',
      seller_id: 'usr_seller_1',
      title: 'Beautiful 3 BHK Independent House',
      property_type: 'House',
      price: 6500000, // ₹65 Lakh
      area: 1500,
      area_unit: 'Sq Ft',
      state: 'Uttar Pradesh',
      city: 'Agra',
      locality: 'Dayalbagh',
      address: 'Plot 42, Radhasoami Nagar, Near Prem Nagar Gate, Dayalbagh',
      landmark: 'Opposite Radha Ballabh Mandir',
      pincode: '282005',
      seller_name: 'Rameshwar Sharma',
      seller_mobile: '+91 9412356789',
      seller_whatsapp: '+91 9412356789',
      seller_type: 'Owner',
      description: 'Well-maintained, sunlit 3 BHK double-storey independent home with private terrace, covered car parking, modular kitchen, and 24-hour sweet water supply. Located in a secure, peaceful gated colony.',
      status: 'Available',
      approval_status: 'Approved',
      unlock_status: 'LOCKED',
      views: 184,
      unlocks_count: 3,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      updated_at: now
    },
    {
      id: 'prop_jaipur_plot_2',
      slug: 'prime-residential-corner-plot-jaipur',
      seller_id: 'usr_seller_2',
      title: 'Prime 200 Sq Yard JDA Approved Corner Plot',
      property_type: 'Plot',
      price: 4800000, // ₹48 Lakh
      area: 200,
      area_unit: 'Sq Yard',
      state: 'Rajasthan',
      city: 'Jaipur',
      locality: 'Mansarovar Extension',
      address: 'Plot No. B-114, Sector 7, Near Vande Mataram Road, Mansarovar Ext.',
      landmark: 'Near DPS School Main Gate',
      pincode: '302020',
      seller_name: 'Vikram Singh Shekhawat',
      seller_mobile: '+91 9829012345',
      seller_whatsapp: '+91 9829012345',
      seller_type: 'Owner',
      description: 'East-facing corner residential plot with 40-foot wide asphalt road on front and 30-foot on side. Fully developed colony with electricity poles, drainage lines, and water pipeline ready for construction.',
      status: 'Available',
      approval_status: 'Approved',
      unlock_status: 'LOCKED',
      views: 240,
      unlocks_count: 5,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      updated_at: now
    },
    {
      id: 'prop_noida_flat_3',
      slug: 'modern-luxury-2-bhk-highrise-noida',
      seller_id: 'usr_seller_3',
      title: 'Modern Luxury 2 BHK Highrise Flat',
      property_type: 'Flat',
      price: 7800000, // ₹78 Lakh
      area: 1150,
      area_unit: 'Sq Ft',
      state: 'Uttar Pradesh',
      city: 'Noida',
      locality: 'Sector 137 Expressway',
      address: 'Tower 4, Flat 1203, Paras Tierea Society, Sector 137',
      landmark: 'Walking distance to Sector 137 Metro Station',
      pincode: '201305',
      seller_name: 'Sunil Verma',
      seller_mobile: '+91 9910022334',
      seller_whatsapp: '+91 9910022334',
      seller_type: 'Dealer / Agent',
      description: 'Park-facing 12th floor apartment with modular Italian kitchen, wooden flooring in master bedroom, 2 balconies with scenic greenery view, clubhouse, swimming pool, and gym access.',
      status: 'Available',
      approval_status: 'Approved',
      unlock_status: 'LOCKED',
      views: 312,
      unlocks_count: 8,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: now
    },
    {
      id: 'prop_pune_land_4',
      slug: 'fertile-farm-land-2-acre-pune',
      seller_id: 'usr_seller_1',
      title: 'Fertile Agricultural Farm Land (2 Acre)',
      property_type: 'Land',
      price: 5200000, // ₹52 Lakh
      area: 2,
      area_unit: 'Acre',
      state: 'Maharashtra',
      city: 'Pune',
      locality: 'Saswad Highway',
      address: 'Survey No. 89/2, Village Dive, Saswad Road',
      landmark: 'Near Dive Ghat Toll Plaza',
      pincode: '412301',
      seller_name: 'Rameshwar Sharma',
      seller_mobile: '+91 9412356789',
      seller_whatsapp: '+91 9412356789',
      seller_type: 'Owner',
      description: 'Clear title agricultural land with black cotton soil, perennial canal water connection, operational borewell with 5HP pump, and 20-foot tar road connectivity directly from state highway.',
      status: 'Available',
      approval_status: 'Approved',
      unlock_status: 'LOCKED',
      views: 145,
      unlocks_count: 2,
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      updated_at: now
    },
    {
      id: 'prop_lucknow_shop_5',
      slug: 'commercial-corner-shop-lucknow',
      seller_id: 'usr_seller_3',
      title: 'High Footfall Main Road Commercial Shop',
      property_type: 'Shop',
      price: 3400000, // ₹34 Lakh
      area: 320,
      area_unit: 'Sq Ft',
      state: 'Uttar Pradesh',
      city: 'Lucknow',
      locality: 'Hazratganj',
      address: 'Shop No. 12, Ground Floor, Plaza Complex, Ashok Marg',
      landmark: 'Opposite GPO Main Post Office',
      pincode: '226001',
      seller_name: 'Sunil Verma',
      seller_mobile: '+91 9910022334',
      seller_whatsapp: '+91 9910022334',
      seller_type: 'Dealer / Agent',
      description: 'Prime ground-floor retail shop with glass shutter facade, heavy daily pedestrian footfall, ample parking area in front, ideal for pharmacy, boutique, clinic, or electronics store.',
      status: 'Available',
      approval_status: 'Approved',
      unlock_status: 'LOCKED',
      views: 198,
      unlocks_count: 4,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: now
    },
    {
      id: 'prop_bengaluru_villa_6',
      slug: 'spacious-4-bhk-gated-villa-bengaluru',
      seller_id: 'usr_seller_2',
      title: 'Spacious 4 BHK Gated Community Villa',
      property_type: 'House',
      price: 18500000, // ₹1.85 Cr
      area: 2800,
      area_unit: 'Sq Ft',
      state: 'Karnataka',
      city: 'Bengaluru',
      locality: 'Whitefield',
      address: 'Villa 28, Palm Meadows Enclave, Varthur Road',
      landmark: 'Near Forum Shantiniketan Mall',
      pincode: '560066',
      seller_name: 'Vikram Singh Shekhawat',
      seller_mobile: '+91 9829012345',
      seller_whatsapp: '+91 9829012345',
      seller_type: 'Builder / Developer',
      description: 'Vaastu compliant luxury triplex villa with private landscaped garden, solar water heater, home automation, 2 covered car garages, clubhouse, tennis court, and 24/7 security surveillance.',
      status: 'Available',
      approval_status: 'Approved',
      unlock_status: 'LOCKED',
      views: 420,
      unlocks_count: 11,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: now
    }
  ];

  const property_media: PropertyMedia[] = [
    // Agra House
    {
      id: 'med_1',
      property_id: 'prop_agra_house_1',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
      is_cover: true,
      created_at: now
    },
    {
      id: 'med_2',
      property_id: 'prop_agra_house_1',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
      is_cover: false,
      created_at: now
    },
    {
      id: 'med_3',
      property_id: 'prop_agra_house_1',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80&w=1200',
      is_cover: false,
      created_at: now
    },
    {
      id: 'med_4',
      property_id: 'prop_agra_house_1',
      media_type: 'video',
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      is_cover: false,
      created_at: now
    },

    // Jaipur Plot
    {
      id: 'med_5',
      property_id: 'prop_jaipur_plot_2',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200',
      is_cover: true,
      created_at: now
    },
    {
      id: 'med_6',
      property_id: 'prop_jaipur_plot_2',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1592595896551-12b371d546d5?auto=format&fit=crop&q=80&w=1200',
      is_cover: false,
      created_at: now
    },

    // Noida Flat
    {
      id: 'med_7',
      property_id: 'prop_noida_flat_3',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1200',
      is_cover: true,
      created_at: now
    },
    {
      id: 'med_8',
      property_id: 'prop_noida_flat_3',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200',
      is_cover: false,
      created_at: now
    },
    {
      id: 'med_9',
      property_id: 'prop_noida_flat_3',
      media_type: 'video',
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      is_cover: false,
      created_at: now
    },

    // Pune Land
    {
      id: 'med_10',
      property_id: 'prop_pune_land_4',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&q=80&w=1200',
      is_cover: true,
      created_at: now
    },
    {
      id: 'med_11',
      property_id: 'prop_pune_land_4',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&q=80&w=1200',
      is_cover: false,
      created_at: now
    },

    // Lucknow Shop
    {
      id: 'med_12',
      property_id: 'prop_lucknow_shop_5',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200',
      is_cover: true,
      created_at: now
    },
    {
      id: 'med_13',
      property_id: 'prop_lucknow_shop_5',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&q=80&w=1200',
      is_cover: false,
      created_at: now
    },

    // Bengaluru Villa
    {
      id: 'med_14',
      property_id: 'prop_bengaluru_villa_6',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
      is_cover: true,
      created_at: now
    },
    {
      id: 'med_15',
      property_id: 'prop_bengaluru_villa_6',
      media_type: 'photo',
      media_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200',
      is_cover: false,
      created_at: now
    },
    {
      id: 'med_16',
      property_id: 'prop_bengaluru_villa_6',
      media_type: 'video',
      media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      is_cover: false,
      created_at: now
    }
  ];

  const property_details: PropertyDetails[] = [
    {
      id: 'det_1',
      property_id: 'prop_agra_house_1',
      bedrooms: 3,
      bathrooms: 3,
      floors: 2,
      parking: 'Covered Car Porch + Bike Space',
      furnished_status: 'Semi-Furnished',
      society_name: 'Radhasoami Nagar Society',
      road_width: '30 Feet',
      facing: 'North-East',
      water_availability: true,
      electricity_availability: true,
      private_seller_notes: 'Keys available at house next door. Direct registration with clean mutation papers.',
      created_at: now
    },
    {
      id: 'det_2',
      property_id: 'prop_jaipur_plot_2',
      plot_dimensions: '30 x 60 Feet',
      road_width: '40 Feet Front & 30 Feet Side',
      facing: 'East Facing',
      corner_plot: true,
      boundary_status: 'Pucca Boundary Wall Constructed with Gate',
      water_availability: true,
      electricity_availability: true,
      private_seller_notes: 'JDA patta in hand, single owner, zero encumbrance.',
      created_at: now
    },
    {
      id: 'det_3',
      property_id: 'prop_noida_flat_3',
      bedrooms: 2,
      bathrooms: 2,
      floor_number: 12,
      total_floors: 22,
      parking: '1 Reserved Basement Car Parking',
      furnished_status: 'Furnished',
      society_name: 'Paras Tierea',
      private_seller_notes: 'Maintenance paid till end of year. All clubhouse charges settled.',
      created_at: now
    },
    {
      id: 'det_4',
      property_id: 'prop_pune_land_4',
      land_type: 'Agricultural Farm Land',
      road_access: true,
      water_availability: true,
      electricity_availability: true,
      private_seller_notes: '7/12 extract clear, single owner family title.',
      created_at: now
    },
    {
      id: 'det_5',
      property_id: 'prop_lucknow_shop_5',
      floor_number: 0,
      total_floors: 4,
      parking: 'Commercial Visitor Parking',
      furnished_status: 'Unfurnished',
      society_name: 'Ashok Marg Plaza',
      private_seller_notes: 'Commercial electricity meter already installed.',
      created_at: now
    },
    {
      id: 'det_6',
      property_id: 'prop_bengaluru_villa_6',
      bedrooms: 4,
      bathrooms: 5,
      floors: 3,
      parking: '2 Covered Garages',
      furnished_status: 'Furnished',
      society_name: 'Palm Meadows Enclave',
      private_seller_notes: 'A-Katha property, direct possession on registry.',
      created_at: now
    }
  ];

  const property_unlocks: PropertyUnlockRecord[] = [];

  const payments: PaymentRecord[] = [];

  return {
    users,
    properties,
    property_media,
    property_details,
    property_unlocks,
    payments
  };
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading portal_database.json, recreating defaults:', err);
    }
    const initial = getInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving portal_database.json:', err);
    }
  }

  // --- USERS ---
  public getUsers(): UserRecord[] {
    return this.data.users;
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmailOrMobile(identifier: string): UserRecord | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(u => 
      u.email.toLowerCase() === clean || 
      u.mobile.replace(/\D/g, '').endsWith(clean.replace(/\D/g, ''))
    );
  }

  public createUser(userData: Omit<UserRecord, 'id' | 'created_at'>): UserRecord {
    const user: UserRecord = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString()
    };
    this.data.users.push(user);
    this.saveData(this.data);
    return user;
  }

  // --- PROPERTIES (PUBLIC FILTERED) ---
  public getPublicProperties(filters?: {
    city?: string;
    property_type?: string;
    min_price?: number;
    max_price?: number;
    min_area?: number;
    max_area?: number;
    area_unit?: string;
    status?: 'Available' | 'Sold' | 'All';
    search?: string;
    sort?: string;
  }) {
    let result = this.data.properties.filter(p => p.approval_status === 'Approved');

    if (filters) {
      if (filters.status && filters.status !== 'All') {
        result = result.filter(p => p.status === filters.status);
      }
      if (filters.city && filters.city !== 'All') {
        result = result.filter(p => p.city.toLowerCase() === filters.city!.toLowerCase());
      }
      if (filters.property_type && filters.property_type !== 'All') {
        result = result.filter(p => p.property_type.toLowerCase() === filters.property_type!.toLowerCase());
      }
      if (filters.min_price !== undefined && !isNaN(filters.min_price)) {
        result = result.filter(p => p.price >= filters.min_price!);
      }
      if (filters.max_price !== undefined && !isNaN(filters.max_price)) {
        result = result.filter(p => p.price <= filters.max_price!);
      }
      if (filters.min_area !== undefined && !isNaN(filters.min_area)) {
        result = result.filter(p => p.area >= filters.min_area!);
      }
      if (filters.max_area !== undefined && !isNaN(filters.max_area)) {
        result = result.filter(p => p.area <= filters.max_area!);
      }
      if (filters.area_unit && filters.area_unit !== 'All') {
        result = result.filter(p => p.area_unit === filters.area_unit);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(p => 
          p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.property_type.toLowerCase().includes(q)
        );
      }

      // Sorting
      if (filters.sort === 'price_asc') {
        result.sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'price_desc') {
        result.sort((a, b) => b.price - a.price);
      } else if (filters.sort === 'area_asc') {
        result.sort((a, b) => a.area - b.area);
      } else if (filters.sort === 'area_desc') {
        result.sort((a, b) => b.area - a.area);
      } else {
        // default newest
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    }

    // Strip private seller info and address before returning publicly
    return result.map(p => this.formatPublicProperty(p));
  }

  public getPropertyByIdOrSlug(idOrSlug: string, incrementView: boolean = false) {
    const prop = this.data.properties.find(p => p.id === idOrSlug || p.slug === idOrSlug);
    if (!prop) return null;

    if (incrementView) {
      prop.views = (prop.views || 0) + 1;
      this.saveData(this.data);
    }

    return prop;
  }

  // Sanitizes a property to return ONLY public fields (Never seller phone or exact street address)
  public formatPublicProperty(p: PropertyRecord) {
    const media = this.data.property_media.filter(m => m.property_id === p.id);
    const coverMedia = media.find(m => m.is_cover) || media[0];
    const details = this.data.property_details.find(d => d.property_id === p.id);

    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      property_type: p.property_type,
      price: p.price,
      area: p.area,
      area_unit: p.area_unit,
      state: p.state,
      city: p.city,
      locality: p.locality,
      description: p.description,
      status: p.status,
      approval_status: p.approval_status,
      unlock_status: 'LOCKED' as const,
      views: p.views,
      unlocks_count: p.unlocks_count,
      created_at: p.created_at,
      cover_image: coverMedia ? coverMedia.media_url : 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
      media: media.map(m => ({
        id: m.id,
        media_type: m.media_type,
        media_url: m.media_url,
        is_cover: m.is_cover
      })),
      photo_count: media.filter(m => m.media_type === 'photo').length,
      has_video: media.some(m => m.media_type === 'video'),
      public_specifications: details ? {
        bedrooms: details.bedrooms,
        bathrooms: details.bathrooms,
        floors: details.floors,
        floor_number: details.floor_number,
        total_floors: details.total_floors,
        parking: details.parking,
        furnished_status: details.furnished_status,
        society_name: details.society_name,
        plot_dimensions: details.plot_dimensions,
        road_width: details.road_width,
        facing: details.facing,
        corner_plot: details.corner_plot,
        boundary_status: details.boundary_status,
        land_type: details.land_type,
        road_access: details.road_access,
        water_availability: details.water_availability,
        electricity_availability: details.electricity_availability
      } : {}
    };
  }

  // --- UNLOCKS & PAYMENTS ---
  // STRICT BACKEND PRIVACY & SECURITY VERIFICATION:
  // Must verify:
  // 1. Buyer is authenticated.
  // 2. Payment belongs to this buyer.
  // 3. Payment is for this exact property.
  // 4. Payment status is successful.
  // 5. The unlock has not been revoked/refunded.
  public hasBuyerUnlocked(buyerId: string, propertyId: string): boolean {
    if (!buyerId || !propertyId) return false;

    // 1. Check user exists
    const user = this.data.users.find(u => u.id === buyerId);
    if (!user) return false;

    // 2. Find unlock record for this exact buyer and this exact property with Successful status
    const unlock = this.data.property_unlocks.find(
      u => u.buyer_id === buyerId && u.property_id === propertyId && u.payment_status === 'Successful'
    );
    if (!unlock) return false;

    // 3. Find matching payment record for this exact buyer, exact property, and verified successful status
    const payment = this.data.payments.find(
      p => p.id === unlock.payment_id &&
           p.buyer_id === buyerId &&
           p.property_id === propertyId &&
           p.status === 'Successful'
    );

    // 4. If payment record missing or revoked/refunded/failed, deny access
    if (!payment) return false;
    if (payment.status === 'Refunded' || payment.status === 'Failed') return false;

    return true;
  }

  // Return protected details ONLY after all 5 backend verification checks pass (or user is listing owner or admin)
  public getProtectedSellerDetails(propertyId: string, userId: string, userRole: string) {
    const prop = this.data.properties.find(p => p.id === propertyId);
    if (!prop) return null;

    const isOwner = prop.seller_id === userId;
    const isAdmin = userRole === 'admin';
    const isUnlocked = this.hasBuyerUnlocked(userId, propertyId);

    if (!isOwner && !isAdmin && !isUnlocked) {
      return {
        unlocked: false,
        unlock_status: 'LOCKED',
        message: '🔒 Complete address & seller contact details are locked. Pay ₹50 to unlock complete property & seller details'
      };
    }

    const details = this.data.property_details.find(d => d.property_id === propertyId);
    const unlockRecord = this.data.property_unlocks.find(
      u => u.buyer_id === userId && u.property_id === propertyId && u.payment_status === 'Successful'
    );

    return {
      unlocked: true,
      unlock_status: 'UNLOCKED',
      seller_name: prop.seller_name,
      seller_mobile: prop.seller_mobile,
      seller_whatsapp: prop.seller_whatsapp || prop.seller_mobile,
      seller_type: prop.seller_type,
      full_address: prop.address,
      landmark: prop.landmark,
      pincode: prop.pincode,
      exact_location: {
        address: prop.address,
        landmark: prop.landmark,
        pincode: prop.pincode,
        locality: prop.locality,
        city: prop.city,
        state: prop.state
      },
      private_seller_notes: details?.private_seller_notes || '',
      unlocked_at: isUnlocked && unlockRecord ? unlockRecord.unlocked_at : new Date().toISOString()
    };
  }

  public recordSuccessfulUnlock(params: {
    buyer_id: string;
    buyer_name?: string;
    buyer_mobile?: string;
    property_id: string;
    payment_id: string;
    amount?: number;
    gateway?: 'razorpay' | 'upi_direct' | 'simulation';
  }): { unlock: PropertyUnlockRecord; payment: PaymentRecord } {
    const amount = params.amount || 50;
    const now = new Date().toISOString();
    const prop = this.data.properties.find(p => p.id === params.property_id);

    // Ensure no duplicate unlock
    const existing = this.data.property_unlocks.find(
      u => u.buyer_id === params.buyer_id && u.property_id === params.property_id
    );

    let unlockRecord: PropertyUnlockRecord;
    if (existing) {
      existing.payment_status = 'Successful';
      unlockRecord = existing;
    } else {
      unlockRecord = {
        id: `unl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        buyer_id: params.buyer_id,
        property_id: params.property_id,
        payment_id: params.payment_id,
        amount,
        payment_status: 'Successful',
        unlocked_at: now
      };
      this.data.property_unlocks.push(unlockRecord);

      // Increment unlocks_count on property
      if (prop) {
        prop.unlocks_count = (prop.unlocks_count || 0) + 1;
      }
    }

    const paymentRecord: PaymentRecord = {
      id: params.payment_id,
      buyer_id: params.buyer_id,
      buyer_name: params.buyer_name,
      buyer_mobile: params.buyer_mobile,
      property_id: params.property_id,
      property_title: prop?.title || 'Property',
      amount,
      gateway: params.gateway || 'razorpay',
      gateway_payment_id: params.payment_id,
      status: 'Successful',
      created_at: now
    };
    this.data.payments.push(paymentRecord);

    this.saveData(this.data);
    return { unlock: unlockRecord, payment: paymentRecord };
  }

  public getBuyerPurchases(buyerId: string) {
    const unlocks = this.data.property_unlocks.filter(
      u => u.buyer_id === buyerId && u.payment_status === 'Successful'
    );

    return unlocks.map(u => {
      const prop = this.data.properties.find(p => p.id === u.property_id);
      const media = this.data.property_media.filter(m => m.property_id === u.property_id);
      const cover = media.find(m => m.is_cover) || media[0];
      return {
        unlock_id: u.id,
        unlocked_at: u.unlocked_at,
        amount: u.amount,
        payment_id: u.payment_id,
        property: prop ? {
          id: prop.id,
          slug: prop.slug,
          title: prop.title,
          price: prop.price,
          area: prop.area,
          area_unit: prop.area_unit,
          city: prop.city,
          locality: prop.locality,
          cover_image: cover?.media_url,
          status: prop.status,
          seller_name: prop.seller_name,
          seller_mobile: prop.seller_mobile,
          seller_whatsapp: prop.seller_whatsapp,
          full_address: prop.address,
          landmark: prop.landmark,
          pincode: prop.pincode
        } : null
      };
    }).filter(item => item.property !== null);
  }

  public getSellerProperties(sellerId: string) {
    const props = this.data.properties.filter(p => p.seller_id === sellerId);
    return props.map(p => {
      const media = this.data.property_media.filter(m => m.property_id === p.id);
      const cover = media.find(m => m.is_cover) || media[0];
      return {
        ...p,
        cover_image: cover ? cover.media_url : null,
        media_count: media.length
      };
    });
  }

  // --- POST PROPERTY ---
  public createProperty(payload: {
    seller_id: string;
    title: string;
    property_type: PropertyRecord['property_type'];
    price: number;
    area: number;
    area_unit: PropertyRecord['area_unit'];
    state: string;
    city: string;
    locality: string;
    address: string;
    landmark?: string;
    pincode: string;
    seller_name: string;
    seller_mobile: string;
    seller_whatsapp?: string;
    seller_type: PropertyRecord['seller_type'];
    description: string;
    specifications?: Partial<PropertyDetails>;
    media_urls?: { url: string; type: 'photo' | 'video'; is_cover?: boolean }[];
  }): PropertyRecord {
    const now = new Date().toISOString();
    const propId = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const baseSlug = payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || 'property';
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const newProperty: PropertyRecord = {
      id: propId,
      slug,
      seller_id: payload.seller_id,
      title: payload.title,
      property_type: payload.property_type,
      price: payload.price,
      area: payload.area,
      area_unit: payload.area_unit,
      state: payload.state,
      city: payload.city,
      locality: payload.locality,
      address: payload.address,
      landmark: payload.landmark,
      pincode: payload.pincode,
      seller_name: payload.seller_name,
      seller_mobile: payload.seller_mobile,
      seller_whatsapp: payload.seller_whatsapp || payload.seller_mobile,
      seller_type: payload.seller_type,
      description: payload.description,
      status: 'Available',
      approval_status: 'Approved', // Auto-approved for fast seamless testing, can be toggled by admin
      unlock_status: 'LOCKED',
      views: 1,
      unlocks_count: 0,
      created_at: now,
      updated_at: now
    };

    this.data.properties.unshift(newProperty);

    // Details
    const detailRecord: PropertyDetails = {
      id: `det_${Date.now()}`,
      property_id: propId,
      ...(payload.specifications || {}),
      created_at: now
    };
    this.data.property_details.push(detailRecord);

    // Media
    if (payload.media_urls && payload.media_urls.length > 0) {
      payload.media_urls.forEach((m, idx) => {
        this.data.property_media.push({
          id: `med_${Date.now()}_${idx}`,
          property_id: propId,
          media_type: m.type,
          media_url: m.url,
          is_cover: m.is_cover !== undefined ? m.is_cover : idx === 0,
          created_at: now
        });
      });
    } else {
      // Default placeholder photo
      this.data.property_media.push({
        id: `med_${Date.now()}_0`,
        property_id: propId,
        media_type: 'photo',
        media_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1200',
        is_cover: true,
        created_at: now
      });
    }

    this.saveData(this.data);
    return newProperty;
  }

  public updatePropertyStatus(id: string, status: 'Available' | 'Sold', userId: string, role: string) {
    const prop = this.data.properties.find(p => p.id === id);
    if (!prop) return null;
    if (prop.seller_id !== userId && role !== 'admin') {
      throw new Error('Unauthorized');
    }
    prop.status = status;
    prop.updated_at = new Date().toISOString();
    this.saveData(this.data);
    return prop;
  }

  public updatePropertyApproval(id: string, approval_status: 'Pending Approval' | 'Approved' | 'Rejected') {
    const prop = this.data.properties.find(p => p.id === id);
    if (!prop) return null;
    prop.approval_status = approval_status;
    prop.updated_at = new Date().toISOString();
    this.saveData(this.data);
    return prop;
  }

  public deleteProperty(id: string, userId: string, role: string) {
    const idx = this.data.properties.findIndex(p => p.id === id);
    if (idx === -1) return false;
    const prop = this.data.properties[idx];
    if (prop.seller_id !== userId && role !== 'admin') {
      throw new Error('Unauthorized');
    }
    this.data.properties.splice(idx, 1);
    this.data.property_media = this.data.property_media.filter(m => m.property_id !== id);
    this.data.property_details = this.data.property_details.filter(d => d.property_id !== id);
    this.saveData(this.data);
    return true;
  }

  // --- ADMIN METRICS ---
  public getAdminOverview() {
    const totalUsers = this.data.users.length;
    const totalProperties = this.data.properties.length;
    const availableProperties = this.data.properties.filter(p => p.status === 'Available').length;
    const soldProperties = this.data.properties.filter(p => p.status === 'Sold').length;
    const successfulPayments = this.data.payments.filter(p => p.status === 'Successful');
    const totalRevenue = successfulPayments.reduce((acc, p) => acc + (p.amount || 50), 0);

    return {
      metrics: {
        totalUsers,
        totalProperties,
        availableProperties,
        soldProperties,
        totalUnlocks: this.data.property_unlocks.length,
        totalRevenue
      },
      recentPayments: this.data.payments.slice(-20).reverse(),
      properties: this.data.properties.map(p => {
        const media = this.data.property_media.filter(m => m.property_id === p.id);
        const cover = media.find(m => m.is_cover) || media[0];
        return {
          ...p,
          cover_image: cover?.media_url
        };
      }),
      users: this.data.users
    };
  }
}

export const db = new Database();
