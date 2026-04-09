import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Clock, Calendar, ChevronRight, Plus, Minus, X, UtensilsCrossed, Flame, Instagram, Facebook, Twitter, Mail, Phone, MapPin, Send, Star, Leaf, LogIn, UserPlus, LogOut, LayoutDashboard, Settings, CheckCircle2, AlertCircle, Package, User as UserIcon } from 'lucide-react';
import { MenuItem, CartItem, User, OrderDetails } from './types';

// --- Mock Data ---
const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Chulha Roti (Plain)', description: 'Hand-rolled roti cooked on traditional clay stove.', price: 15, category: 'roti', image: '' },
  { id: '2', name: 'Ghee Wali Roti', description: 'Smoky chulha roti brushed with pure desi ghee.', price: 20, category: 'roti', image: '' },
  { id: '3', name: 'Bajra Rotla', description: 'Nutritious pearl millet flatbread, earthy and rustic.', price: 30, category: 'roti', image: '' },
  { id: '4', name: 'Makki di Roti', description: 'Traditional corn flour bread, perfect with saag.', price: 35, category: 'roti', image: '' },
  { id: '5', name: 'Missi Roti', description: 'Gram flour and wheat bread with spices and herbs.', price: 25, category: 'roti', image: '' },
  { id: '6', name: 'Aloo Paratha', description: 'Stuffed with spiced mashed potatoes, tawa toasted.', price: 60, category: 'paratha', image: '' },
  { id: '7', name: 'Paneer Paratha', description: 'Grated paneer with green chilies and coriander.', price: 80, category: 'paratha', image: '' },
  { id: '8', name: 'Sarson da Saag', description: 'Authentic mustard greens cooked with spices.', price: 120, category: 'sabji', image: '' },
  { id: '9', name: 'Dal Makhani', description: 'Slow-cooked black lentils with cream and butter.', price: 110, category: 'sabji', image: '' },
  { id: '10', name: 'Baingan Bharta', description: 'Fire-roasted eggplant mash with herbs.', price: 100, category: 'sabji', image: '' },
  { id: '11', name: 'Paneer Bhurji', description: 'Scrambled paneer with onions and tomatoes.', price: 140, category: 'sabji', image: '' },
  { id: '12', name: 'Mix Veg', description: 'Seasonal vegetables cooked in a rustic gravy.', price: 90, category: 'sabji', image: '' },
  { id: '13', name: 'Boondi Rayta', description: 'Cooling yogurt with crispy gram flour pearls.', price: 40, category: 'side', image: '' },
  { id: '14', name: 'Mix Veg Rayta', description: 'Yogurt with finely chopped vegetables.', price: 50, category: 'side', image: '' },
  { id: '15', name: 'Green Salad', description: 'Fresh seasonal vegetables with lemon.', price: 30, category: 'side', image: '' },
  { id: '16', name: 'Sarson da Saag Combo', description: '2 Makki Rotis served with authentic mustard greens.', price: 150, category: 'combo', image: '' },
  { id: '17', name: 'Dal Makhani Combo', description: '2 Chulha Rotis with slow-cooked black lentils.', price: 140, category: 'combo', image: '' },
];

const TESTIMONIALS = [
  { id: 1, name: 'Amit Sharma', comment: 'The smoky flavor of the chulha roti took me back to my childhood village. Absolutely authentic!', rating: 5, location: 'Gurgaon' },
  { id: 2, name: 'Priya Verma', comment: 'Best Makki di Roti I have had in years. The Sarson da Saag combo is a must-try.', rating: 5, location: 'Delhi' },
  { id: 3, name: 'Rahul Gupta', comment: 'Prompt delivery and the rotis were still hot and soft. The Tawa Box is my new favorite.', rating: 4, location: 'Noida' },
];

const GALLERY_IMAGES = [
  'https://picsum.photos/seed/chulha1/800/600',
  'https://picsum.photos/seed/roti_making/800/600',
  'https://picsum.photos/seed/village_food/800/600',
  'https://picsum.photos/seed/tawa_roti/800/600',
  'https://picsum.photos/seed/desi_kitchen/800/600',
  'https://picsum.photos/seed/rustic_meal/800/600',
];

// --- Components ---

const Navbar = ({ 
  cartCount, 
  onOpenCart, 
  user, 
  onLogout 
}: { 
  cartCount: number, 
  onOpenCart: () => void,
  user: User | null,
  onLogout: () => void
}) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-brand-primary p-2 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-brand-primary/20">
          <Flame className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-display font-bold text-white tracking-tight">The Tawa Box</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        {[
          { name: 'Home', path: '/' },
          { name: 'Menu', path: '/menu' },
          { name: 'About', path: '/about' },
          { name: 'Gallery', path: '/gallery' },
          { name: 'Contact', path: '/contact' },
        ].map((link) => (
          <Link 
            key={link.path}
            to={link.path}
            className={`font-bold transition-all hover:text-brand-accent ${isActive(link.path) ? 'text-brand-accent' : 'text-white/70 hover:text-white'}`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link 
              to={user.role === 'admin' ? '/admin' : '/dashboard'} 
              className="flex items-center gap-2 text-white font-bold hover:text-brand-accent transition-colors"
            >
              {user.role === 'admin' ? <Settings className="w-5 h-5" /> : <LayoutDashboard className="w-5 h-5" />}
              <span className="hidden sm:inline">{user.role === 'admin' ? 'Admin' : 'Dashboard'}</span>
            </Link>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors font-bold"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link 
              to="/register" 
              title="Register Now"
              className="bg-brand-primary text-white p-2.5 rounded-full hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center"
            >
              <UserPlus className="w-5 h-5" />
            </Link>
          </div>
        )}

        <button 
          onClick={onOpenCart}
          className="relative p-2 bg-white/10 rounded-full shadow-md hover:bg-white/20 transition-all text-white"
        >
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a150d]">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative w-full h-[56.25vw] md:h-[calc(100vh-80px)] overflow-hidden bg-black mt-20">
      {/* Background Video Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute inset-0 w-full h-full md:scale-110">
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/MuF1qlWhTqg?autoplay=1&mute=1&loop=1&playlist=MuF1qlWhTqg&controls=0&modestbranding=1&rel=0&iv_load_policy=3" 
            title="The Tawa Box Experience" 
            frameBorder="0" 
            allow="autoplay; encrypted-media" 
          ></iframe>
        </div>
        {/* Subtle Overlay for depth */}
        <div className="absolute inset-0 bg-brand-primary/10" />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-7xl font-display font-black text-white mb-6 drop-shadow-2xl">
            Authentic <span className="text-brand-primary italic">Chulha</span> Flavors
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto drop-shadow-lg">
            Experience the rustic soul of village cooking, delivered hot and fresh to your doorstep.
          </p>
          <Link 
            to="/menu" 
            className="bg-black text-white px-10 py-5 rounded-2xl font-bold text-xl border border-white/20 shadow-2xl hover:bg-white/10 transition-all flex items-center gap-3 group mx-auto w-fit"
          >
            Curate Your Box
            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const MenuPage = ({ onAddToCart, onUpdateQuantity, cart }: { 
  onAddToCart: (item: MenuItem) => void, 
  onUpdateQuantity: (id: string, delta: number) => void,
  cart: CartItem[]
}) => {
  const sabjis = MENU_ITEMS.filter(i => i.category === 'sabji');
  const rotis = MENU_ITEMS.filter(i => i.category === 'roti' || i.category === 'paratha');
  const sides = MENU_ITEMS.filter(i => i.category === 'side');
  const combos = MENU_ITEMS.filter(i => i.category === 'combo');

  const renderMenuItemCard = (item: MenuItem, idx: number) => {
    const cartItem = cart.find(i => i.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: idx * 0.05 }}
        className="group glass-card rounded-3xl p-5 hover:shadow-2xl transition-all duration-300 border-brand-primary/5 flex flex-col justify-between"
      >
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white leading-tight">{item.name}</h3>
            <span className="text-brand-accent font-bold whitespace-nowrap ml-2">₹{item.price}</span>
          </div>
          <p className="text-white/90 text-xs mb-4 line-clamp-2">{item.description}</p>
        </div>

        <div className="flex items-center justify-between bg-white/5 rounded-2xl p-1.5 mt-auto">
          <button 
            onClick={() => onUpdateQuantity(item.id, -1)}
            disabled={quantity === 0}
            className={`p-2.5 rounded-xl shadow-sm transition-all ${
              quantity === 0 
                ? 'bg-white/5 text-white/20 cursor-not-allowed' 
                : 'bg-white/10 text-white hover:bg-brand-primary transition-all'
            }`}
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <div className="flex flex-col items-center px-4">
            <span className="text-[10px] text-white font-black uppercase tracking-widest mb-0.5">Qty</span>
            <span className={`font-black text-lg leading-none ${quantity > 0 ? 'text-brand-accent' : 'text-white/20'}`}>
              {quantity}
            </span>
          </div>

          <button 
            onClick={() => {
              if (quantity === 0) onAddToCart(item);
              else onUpdateQuantity(item.id, 1);
            }}
            className="p-2.5 bg-white/10 text-white rounded-xl shadow-sm hover:bg-brand-primary transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-display font-black text-brand-primary mb-4">Curate Your Box</h2>
        <p className="text-white/80 max-w-xl mx-auto">Mix and match your favorite rotis, sabjis, and sides for the perfect meal.</p>
      </div>

      {/* Main Split Layout: Sabji & Roti */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Left Side: Sabji */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-brand-primary/20 p-3 rounded-2xl">
              <UtensilsCrossed className="text-brand-primary w-6 h-6" />
            </div>
            <h3 className="text-3xl font-display font-bold text-white">Sabji Menu</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sabjis.map((item, idx) => renderMenuItemCard(item, idx))}
          </div>
        </div>

        {/* Right Side: Roti */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-brand-primary/20 p-3 rounded-2xl">
              <Flame className="text-brand-primary w-6 h-6" />
            </div>
            <h3 className="text-3xl font-display font-bold text-white">Roti & Paratha</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rotis.map((item, idx) => renderMenuItemCard(item, idx))}
          </div>
        </div>
      </div>

      {/* Below: Sides (Rayta, etc.) */}
      <div className="space-y-8 mb-20">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-brand-primary/20 p-3 rounded-2xl">
            <Leaf className="text-brand-primary w-6 h-6" />
          </div>
          <h3 className="text-3xl font-display font-bold text-white">Sides & Rayta</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sides.map((item, idx) => renderMenuItemCard(item, idx))}
        </div>
      </div>

      {/* Combos */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-brand-primary/20 p-3 rounded-2xl">
            <Package className="text-brand-primary w-6 h-6" />
          </div>
          <h3 className="text-3xl font-display font-bold text-white">Signature Combos</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {combos.map((item, idx) => renderMenuItemCard(item, idx))}
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => (
  <div className="pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-display font-bold text-brand-primary mb-4">What Our Foodies Say</h2>
      <p className="text-white/80">Real stories from people who love authentic desi flavors.</p>
    </div>
    
    {/* Mobile Carousel / Desktop Grid */}
    <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pb-8 md:pb-0 snap-x snap-mandatory no-scrollbar">
      {TESTIMONIALS.map((t, idx) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card p-8 rounded-[2.5rem] flex flex-col justify-between min-w-[85vw] md:min-w-0 snap-center"
        >
          <div>
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < t.rating ? 'fill-brand-accent text-brand-accent' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <p className="text-white/70 italic mb-6 leading-relaxed text-xs">"{t.comment}"</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center font-bold text-brand-primary">
              {t.name[0]}
            </div>
            <div>
              <div className="font-bold text-brand-primary">{t.name}</div>
              <div className="text-xs text-gray-400 font-medium">{t.location}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
    
    {/* Mobile Swipe Indicator */}
    <div className="flex justify-center gap-2 mt-4 md:hidden">
      {TESTIMONIALS.map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full bg-brand-primary/20" />
      ))}
    </div>
  </div>
);

const AboutPage = () => (
  <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative">
    <div className="absolute top-40 -right-20 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -z-10" />
    <div className="absolute bottom-20 -left-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl -z-10" />
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
    >
      <div>
        <span className="text-brand-secondary font-bold tracking-widest uppercase text-xs mb-4 block">Our Story</span>
        <h2 className="text-5xl font-display font-black text-brand-primary mb-8">Reviving the <span className="text-brand-accent italic">Soul</span> of Desi Cooking.</h2>
        <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
          <p>
            The Tawa Box was born from a simple longing for the smoky, earthy flavors of a village kitchen. In the hustle of modern life, the traditional "Chulha" (clay stove) has become a rare sight, and with it, the authentic taste of hand-rolled rotis.
          </p>
          <p>
            Our mission is to bring that rustic soul back to your dining table. Every roti we deliver is hand-rolled with love and cooked over slow-burning wood and coal, just like it has been for generations.
          </p>
          <p>
            We source our grains directly from local farmers, ensuring that every bite is not just delicious, but also nutritious and honest.
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
          <img 
            src="https://picsum.photos/seed/chulha_fire/800/800" 
            alt="Traditional Chulha" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-10 -left-10 glass-card p-8 rounded-3xl hidden md:block">
          <div className="text-4xl font-display font-black text-brand-primary mb-1">100%</div>
          <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Traditional Method</div>
        </div>
      </div>
    </motion.div>
  </div>
);

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      onLogin(userWithoutPassword);
      navigate(userWithoutPassword.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="pt-40 pb-20 px-6 max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-[3rem]"
      >
        <h2 className="text-4xl font-display font-black text-brand-primary mb-8 text-center">Login</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-primary ml-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" 
              placeholder="your@email.com" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-primary ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          <button className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all">
            Login
          </button>
          <p className="text-center text-white/60 text-sm">
            Don't have an account? <Link to="/register" className="text-brand-accent font-bold">Register Now</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const RegisterPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      setError('Email already registered');
      return;
    }

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      role: (email.includes('admin') || email === 'yklove0001@gmail.com') ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    onLogin(userWithoutPassword as User);
    navigate(userWithoutPassword.role === 'admin' ? '/admin' : '/dashboard');
  };

  return (
    <div className="pt-40 pb-20 px-6 max-w-md mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-10 rounded-[3rem]"
      >
        <h2 className="text-4xl font-display font-black text-brand-primary mb-8 text-center">Register</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-primary ml-1">Full Name</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" 
              placeholder="John Doe" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-primary ml-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" 
              placeholder="your@email.com" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-primary ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>
          <button className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all">
            Create Account
          </button>
          <p className="text-center text-white/60 text-sm">
            Already have an account? <Link to="/login" className="text-brand-accent font-bold">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user, orders }: { user: User, orders: OrderDetails[] }) => {
  const userOrders = orders.filter(o => o.userId === user.id);

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-display font-black text-brand-primary mb-2">Welcome, {user.name}!</h2>
          <p className="text-white/60">Manage your orders and track your desi cravings.</p>
        </div>
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center">
            <Package className="text-brand-primary w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-black text-brand-primary">{userOrders.length}</div>
            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Orders</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-display font-bold text-brand-primary">Order History</h3>
        {userOrders.length === 0 ? (
          <div className="glass-card p-20 rounded-[3rem] text-center">
            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <UtensilsCrossed className="w-10 h-10 text-white/20" />
            </div>
            <p className="text-white/60 text-lg">You haven't placed any orders yet.</p>
            <Link to="/" className="inline-block mt-6 text-brand-accent font-bold hover:underline">Explore our menu</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row justify-between gap-8"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Order #{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                      order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                      'bg-brand-accent/20 text-brand-accent'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Date</div>
                      <div className="font-bold text-brand-primary">{order.date}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Time</div>
                      <div className="font-bold text-brand-primary">{order.time}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Items</div>
                      <div className="font-bold text-brand-primary">{order.items.reduce((s, i) => s + i.quantity, 0)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total</div>
                      <div className="font-bold text-brand-primary">₹{order.total}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map(item => (
                      <span key={item.id} className="bg-white/5 px-3 py-1 rounded-lg text-xs text-white/60">
                        {item.name} x{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  {order.status === 'pending' && (
                    <div className="flex items-center gap-2 text-brand-accent">
                      <Clock className="w-5 h-5" />
                      <span className="font-bold">Preparing soon...</span>
                    </div>
                  )}
                  {order.status === 'delivered' && (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-bold">Delivered</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPanel = ({ orders, onUpdateStatus }: { orders: OrderDetails[], onUpdateStatus: (id: string, status: OrderDetails['status']) => void }) => {
  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-5xl font-display font-black text-brand-primary mb-2">Admin Panel</h2>
          <p className="text-white/60">Manage all incoming orders and update their status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.length === 0 ? (
          <div className="glass-card p-20 rounded-[3rem] text-center">
            <p className="text-white/60">No orders placed yet.</p>
          </div>
        ) : (
          orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
            <motion.div 
              key={order.id}
              className="glass-card p-8 rounded-[2.5rem] border-white/5 flex flex-col lg:flex-row justify-between gap-8"
            >
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Order #{order.id}</span>
                  <div className="flex items-center gap-2 text-brand-accent">
                    <UserIcon className="w-4 h-4" />
                    <span className="font-bold">{order.userName} ({order.userEmail})</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                  <div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Schedule</div>
                    <div className="font-bold text-brand-primary">{order.date} at {order.time}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total</div>
                    <div className="font-bold text-brand-primary text-xl">₹{order.total}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Items</div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map(item => (
                        <span key={item.id} className="bg-white/5 px-2 py-1 rounded-lg text-[10px] text-white/80">
                          {item.name} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <select 
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value as any)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-brand-primary outline-none focus:ring-2 focus:ring-brand-primary [color-scheme:dark]"
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                  order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                  'bg-brand-accent/20 text-brand-accent'
                }`}>
                  {order.status}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const GalleryPage = () => (
  <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative">
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full h-full bg-brand-bg/50 blur-3xl -z-10" />
    <div className="text-center mb-16">
      <h2 className="text-5xl font-display font-black text-brand-primary mb-4">Rustic Glimpses</h2>
      <p className="text-gray-500 max-w-xl mx-auto">A visual journey through our kitchen and the traditions we cherish.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {GALLERY_IMAGES.map((img, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg group"
        >
          <img 
            src={img} 
            alt={`Gallery ${idx}`} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      ))}
    </div>
  </div>
);

const ContactPage = () => (
  <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-accent/5 blur-3xl -z-10" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
      <div>
        <h2 className="text-5xl font-display font-black text-brand-primary mb-8">Get in <span className="text-brand-accent italic">Touch</span></h2>
        <p className="text-white/70 mb-12 text-lg">Have questions about our menu, bulk orders, or just want to say hello? We'd love to hear from you.</p>
        
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="bg-brand-primary/10 p-4 rounded-2xl">
              <Phone className="text-brand-primary w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-white/40 font-bold uppercase tracking-widest">Call Us</div>
              <div className="text-xl font-bold text-brand-primary">+91 98765 43210</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-brand-primary/10 p-4 rounded-2xl">
              <Mail className="text-brand-primary w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-white/40 font-bold uppercase tracking-widest">Email Us</div>
              <div className="text-xl font-bold text-brand-primary">hello@thetawabox.com</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-brand-primary/10 p-4 rounded-2xl">
              <MapPin className="text-brand-primary w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-white/40 font-bold uppercase tracking-widest">Visit Us</div>
              <div className="text-xl font-bold text-brand-primary">Sector 45, Gurgaon, Haryana</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="glass-card p-10 rounded-[3rem]">
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-primary ml-1">Full Name</label>
              <input type="text" className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-primary ml-1">Email Address</label>
              <input type="email" className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" placeholder="john@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-primary ml-1">Message</label>
            <textarea rows={4} className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none" placeholder="Tell us what's on your mind..."></textarea>
          </div>
          <button className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all">
            Send Message
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  </div>
);

const CartModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity,
  orderDate,
  setOrderDate,
  orderTime,
  setOrderTime,
  onConfirmOrder
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  cartItems: CartItem[],
  onUpdateQuantity: (id: string, delta: number) => void,
  orderDate: string,
  setOrderDate: (v: string) => void,
  orderTime: string,
  setOrderTime: (v: string) => void,
  onConfirmOrder: () => void
}) => {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#0a150d] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-white/5"
            >
              <div className="p-6 border-b border-brand-primary/10 flex justify-between items-center bg-white/5">
                <h2 className="text-2xl font-display font-bold text-brand-primary flex items-center gap-2">
                  <UtensilsCrossed className="w-6 h-6" />
                  Your Tawa Box
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-white/5 p-6 rounded-full mb-4">
                      <ShoppingCart className="w-12 h-12 text-white/20" />
                    </div>
                    <p className="text-white/60 font-medium">Your box is empty.<br/>Start adding some desi goodness!</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-2xl shadow-sm border border-white/5">
                          <div className="flex-1">
                            <h4 className="font-bold text-brand-primary">{item.name}</h4>
                            <p className="text-brand-secondary font-bold">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="p-1.5 bg-white/5 border border-white/10 rounded-xl hover:border-brand-primary transition-colors text-white"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-6 text-center text-white">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="p-1.5 bg-white/5 border border-white/10 rounded-xl hover:border-brand-primary transition-colors text-white"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-brand-primary/10 space-y-4">
                      <h3 className="font-display font-bold text-brand-primary text-lg">Delivery Schedule</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-sm">
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 tracking-widest">Date</label>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-brand-secondary" />
                            <input 
                              type="date" 
                              value={orderDate}
                              onChange={(e) => setOrderDate(e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold p-0 text-brand-primary [color-scheme:dark]"
                            />
                          </div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 shadow-sm">
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1 tracking-widest">Time</label>
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-brand-secondary" />
                            <input 
                              type="time" 
                              value={orderTime}
                              onChange={(e) => setOrderTime(e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold p-0 text-brand-primary [color-scheme:dark]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 bg-white/5 border-t border-brand-primary/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-white/60 font-medium">Total Amount</span>
                    <span className="text-3xl font-display font-black text-brand-primary">₹{total}</span>
                  </div>
                  <button 
                    onClick={onConfirmOrder}
                    className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all active:scale-[0.98]"
                  >
                    Confirm Order
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Footer = () => (
  <footer className="bg-black/40 backdrop-blur-md text-white pt-20 pb-10 px-6 border-t border-white/5">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Flame className="text-brand-accent w-8 h-8" />
          <span className="text-3xl font-display font-bold tracking-tight">The Tawa Box</span>
        </div>
        <p className="text-white/60 leading-relaxed">
          Bringing the authentic taste of traditional clay stove cooking to your modern lifestyle.
        </p>
        <div className="flex gap-4">
          <a href="#" className="bg-white/5 p-3 rounded-xl hover:bg-brand-accent transition-colors"><Instagram className="w-5 h-5" /></a>
          <a href="#" className="bg-white/5 p-3 rounded-xl hover:bg-brand-accent transition-colors"><Facebook className="w-5 h-5" /></a>
          <a href="#" className="bg-white/5 p-3 rounded-xl hover:bg-brand-accent transition-colors"><Twitter className="w-5 h-5" /></a>
        </div>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-6">Quick Links</h4>
        <ul className="space-y-4 text-white/60">
          <li><Link to="/" className="hover:text-brand-accent transition-colors">Home</Link></li>
          <li><Link to="/about" className="hover:text-brand-accent transition-colors">About Us</Link></li>
          <li><Link to="/gallery" className="hover:text-brand-accent transition-colors">Gallery</Link></li>
          <li><Link to="/contact" className="hover:text-brand-accent transition-colors">Contact</Link></li>
        </ul>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-6">Our Menu</h4>
        <ul className="space-y-4 text-white/60">
          <li>Plain Chulha Roti</li>
          <li>Ghee Wali Roti</li>
          <li>Bajra Rotla</li>
          <li>Makki di Roti</li>
        </ul>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-6">Newsletter</h4>
        <p className="text-white/60 mb-6">Subscribe to get updates on seasonal specials.</p>
        <div className="flex gap-2">
          <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none flex-1 focus:border-brand-accent" />
          <button className="bg-brand-accent px-4 py-2 rounded-xl font-bold">Join</button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-white/40 text-sm">
      © 2026 The Tawa Box. All rights reserved.
    </div>
  </footer>
);

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderDate, setOrderDate] = useState('');
  const [orderTime, setOrderTime] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleUpdateOrderStatus = (id: string, status: OrderDetails['status']) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const confirmOrder = () => {
    if (!currentUser) {
      alert('Please login to place an order');
      window.location.href = '/login';
      return;
    }

    if (!orderDate || !orderTime) {
      alert('Please select delivery date and time');
      return;
    }

    const newOrder: OrderDetails = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      date: orderDate,
      time: orderTime,
      items: [...cart],
      total: cart.reduce((s, i) => s + i.price * i.quantity, 0),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    setCart([]);
    setIsCartOpen(false);
    alert(`Order #${newOrder.id} placed successfully!`);
    window.location.href = '/dashboard';
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  return (
    <Router>
      <div className="min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-white flex flex-col">
        <Navbar 
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
          onOpenCart={() => setIsCartOpen(true)} 
          user={currentUser}
          onLogout={handleLogout}
        />
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <TestimonialsSection />
              </>
            } />
            <Route path="/menu" element={
              <MenuPage 
                onAddToCart={addToCart} 
                onUpdateQuantity={updateQuantity}
                cart={cart}
              />
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            <Route 
              path="/dashboard" 
              element={currentUser ? <Dashboard user={currentUser} orders={orders} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={currentUser?.role === 'admin' ? <AdminPanel orders={orders} onUpdateStatus={handleUpdateOrderStatus} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>

        <Footer />

        {/* Floating Cart Button */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-8 right-8 z-40 bg-brand-primary text-white p-4 rounded-full shadow-2xl shadow-brand-primary/40 flex items-center justify-center group"
        >
          <ShoppingCart className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-brand-bg">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 font-bold whitespace-nowrap text-xs">
            View Box
          </span>
        </motion.button>

        <CartModal 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cartItems={cart}
          onUpdateQuantity={updateQuantity}
          orderDate={orderDate}
          setOrderDate={setOrderDate}
          orderTime={orderTime}
          setOrderTime={setOrderTime}
          onConfirmOrder={confirmOrder}
        />
      </div>
    </Router>
  );
}


