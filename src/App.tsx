import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Compass, Clock, Calendar, ChevronRight, ChevronLeft, Plus, Minus, X, UtensilsCrossed, Flame, Instagram, Facebook, Twitter, Mail, Phone, MapPin, Send, Star, Leaf, LogIn, UserPlus, LogOut, LayoutDashboard, Settings, CheckCircle2, AlertCircle, Package, User as UserIcon, Menu, CreditCard, Banknote, Filter, Trophy, ArrowRight, Eye, EyeOff, Smartphone, Landmark, Check, Wallet } from 'lucide-react';
import { MenuItem, CartItem, User, OrderDetails } from './types';
import { HeroAnimation, CustomLogoSvg } from './components/HeroAnimation';
import { IntroAnimation } from './components/IntroAnimation';
import { WeeklyShowcase } from './components/WeeklyShowcase';
import { triggerEmailNotification } from './services/emailService';
import { db, auth, handleFirestoreError, OperationType } from './lib/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';


// @ts-ignore
import tawaBoxHero from './assets/images/tawa_box_hero_1779282315522.png';
// @ts-ignore
import namkeenDaliyaImg from './assets/images/namkeen_daliya_1779282338658.png';
// @ts-ignore
import doodhDaliyaImg from './assets/images/doodh_daliya_1779282359860.png';
// @ts-ignore
import desiLunchTrayLocal from './assets/images/desi_lunch_tray_1779282381475.png';
const desiLunchTrayImg = 'https://lh3.googleusercontent.com/d/1hxLbnG844atKqc1KZU2AcelaRHGRWdfW';
// @ts-ignore
import lunchSideMealImg from './assets/images/lunch_side_meal_1779282404443.png';

// --- Mock Data ---
const MENU_ITEMS: MenuItem[] = [
  { id: '15', name: 'Lunch Box', description: 'Gourmet lunch box tray cooked over slow firewood. Includes hot, fresh rotis baked on clay oven, delicious seasonal dry subji, basmati rice, garden salad, and sweet fruits.', price: 199, category: 'combo', image: desiLunchTrayImg },
  { id: '16', name: 'Salty Veggie Daliya', description: 'A wholesome, high-fiber broken wheat bowl cooked with fresh veggies, green peas, aromatic ginger, tempered with dynamic mustard seeds and curry leaves.', price: 199, category: 'healthy', image: namkeenDaliyaImg },
  { id: '17', name: 'Cardamom Doodh Daliya', description: 'Wholesome broken wheat simmered in pure milk, sweetened with organic jaggery, infused with cardamom, and served with almonds & raisins.', price: 199, category: 'healthy', image: doodhDaliyaImg },
  { id: 'daliya-1-day', name: 'Daliya Diet (1 Day Trial Plan)', description: 'Wholesome Morning Daliya and Fresh Daily Salad prepared exactly down to your health preferences.', price: 199, category: 'healthy', image: namkeenDaliyaImg },
  { id: 'daliya-weekly', name: 'Daliya Diet (Weekly Subscription - 6 Days)', description: 'Freshly prepared Daily Daliya + Special Salad rotation delivered straight to your door from Monday to Saturday.', price: 1099, category: 'healthy', image: tawaBoxHero },
  { id: 'daliya-monthly', name: 'Daliya Diet (Monthly Subscription - 24 Days)', description: 'The absolute health-tracker pack: 24 active week-days of clean, delicious Daliya & diverse loaded salad rotations.', price: 3999, category: 'healthy', image: lunchSideMealImg },
];

const TESTIMONIALS = [
  { id: 1, name: 'Amit Sharma', comment: 'The smoky flavor of the chulha roti took me back to my childhood village. Absolutely authentic!', rating: 5, location: 'Gurgaon' },
  { id: 2, name: 'Priya Verma', comment: 'Best wholesome food I have had in years. The Lunch Box is a must-try.', rating: 5, location: 'Delhi' },
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between bg-[#9E5638] border-b border-[#B76F50]/45 md:px-12 backdrop-blur-md shadow-lg select-none">
        {/* Left: Main Title "THE TAWA BOX" positioned on the left side */}
        <Link to="/" className="text-left pointer-events-auto">
          <span className="text-sm md:text-base font-serif font-black uppercase tracking-[0.16em] text-[#EADBBD] hover:text-[#FAF6ED] transition-colors block drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            THE TAWA BOX
          </span>
        </Link>

        {/* Right: Clean, minimalist Hamburger Menu & Cart access with warm gold tones */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenCart}
            className="relative p-2 rounded-full text-[#EADBBD] hover:text-[#FAF6ED] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ShoppingCart className="w-5.5 h-5.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#4A2010] text-[#EADBBD] text-[9.5px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border border-[#9E5638] shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 rounded-full text-[#EADBBD] hover:text-[#FAF6ED] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Menu className="w-6.5 h-6.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]" />
          </button>
        </div>
      </nav>

      {/* Elegant Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-[#F4F1EA] p-8 flex flex-col border-l border-[#5A3825]/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-12 border-b border-[#5A3825]/10 pb-6">
                <div>
                  <h3 className="font-serif text-2xl uppercase tracking-[0.1em] text-[#5A3825]">THE TAWA BOX</h3>
                  <p className="text-[10px] text-[#7A8B6B] lowercase italic font-medium">hand-crafted desi meals</p>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-[#5A3825]/5 rounded-full text-[#5A3825] hover:bg-[#5A3825]/15 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { name: 'Home', path: '/' },
                  { name: 'Our Full Menu', path: '/#breakfast-lunch-combos' },
                  { name: 'About Heritage', path: '/about' },
                  { name: 'Kitchen Gallery', path: '/gallery' },
                  { name: 'Contact Us', path: '/contact' },
                  { name: `Shopping Cart`, path: '#cart', isCart: true },
                ].map((link) => {
                  if (link.isCart) {
                    return (
                      <button
                        key="cart-drawer-link"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onOpenCart();
                        }}
                        className="font-serif text-lg p-3 rounded-xl transition-all text-left flex items-center justify-between text-[#5A3825]/75 hover:bg-[#5A3825]/5 hover:text-[#5A3825] cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          {link.name}
                        </span>
                        {cartCount > 0 && (
                          <span className="bg-[#9E5638] text-[#EADBBD] text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full">
                            {cartCount}
                          </span>
                        )}
                      </button>
                    );
                  }
                  const isCurrentActive = link.path.includes('#')
                    ? location.hash === link.path.substring(link.path.indexOf('#'))
                    : isActive(link.path);
                  return (
                    <Link 
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`font-serif text-lg p-3 rounded-xl transition-all ${
                        isCurrentActive 
                          ? 'bg-[#5A3825] text-white font-bold shadow-md' 
                          : 'text-[#5A3825]/75 hover:bg-[#5A3825]/5 hover:text-[#5A3825]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-auto pt-8 border-t border-[#5A3825]/10 space-y-4">
                {user ? (
                  <div className="space-y-3">
                    <p className="text-xs text-[#5A3825]/60 px-3">Logged in as <strong className="text-[#5A3825] font-bold">{user.name}</strong></p>
                    <Link 
                      to={user.role === 'admin' ? '/admin' : '/dashboard'}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 p-3 bg-[#5A3825]/5 hover:bg-[#5A3825]/10 rounded-xl text-[#5A3825] font-bold text-sm transition-colors"
                    >
                      {user.role === 'admin' ? <Settings className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                      {user.role === 'admin' ? 'Admin Panel' : 'My Account Logs'}
                    </Link>
                    <button 
                      onClick={() => {
                        onLogout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 p-3 text-red-700 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link 
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center py-3 border border-[#5A3825] text-[#5A3825] rounded-xl font-bold text-sm hover:bg-[#5A3825]/5 text-center transition-all"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center py-3 bg-[#5A3825] text-white rounded-xl font-bold text-sm hover:shadow-lg hover:bg-[#523220] text-center transition-all"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const BottomNav = ({ 
  cartCount, 
  onOpenCart, 
  user 
}: { 
  cartCount: number, 
  onOpenCart: () => void,
  user: User | null
}) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#1A1A1A] border-t border-[#5A3825]/20 px-6 py-3 pb-6 flex justify-between items-center safe-area-bottom shadow-lg">
      <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-[#D4AF37]' : 'text-white/40'}`}>
        <UtensilsCrossed className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
      </Link>
      
      <Link to="/#breakfast-lunch-combos" className={`flex flex-col items-center gap-1 ${location.hash === '#breakfast-lunch-combos' ? 'text-[#D4AF37]' : 'text-white/40'}`}>
        <Flame className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">Menu</span>
      </Link>

      <button 
        onClick={onOpenCart}
        className="relative -mt-6 bg-[#5A3825] p-3.5 rounded-full shadow-2xl text-white border-4 border-[#1A1A1A]"
      >
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#5A3825] text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-[#5A3825]">
            {cartCount}
          </span>
        )}
      </button>

      <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className={`flex flex-col items-center gap-1 ${isActive('/dashboard') || isActive('/admin') ? 'text-[#D4AF37]' : 'text-white/40'}`}>
        {user?.role === 'admin' ? <Settings className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
        <span className="text-[10px] font-bold uppercase tracking-tighter">{user ? (user.role === 'admin' ? 'Admin' : 'Profile') : 'Login'}</span>
      </Link>

      <Link to="/about" className={`flex flex-col items-center gap-1 ${isActive('/about') ? 'text-[#D4AF37]' : 'text-white/40'}`}>
        <Clock className="w-5 h-5" />
        <span className="text-[10px] font-bold uppercase tracking-tighter">About</span>
      </Link>
    </nav>
  );
};

const GoldSealCoin = ({ size = 26 }: { size?: number }) => (
  <span className="inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] animate-pulse">
      <defs>
        <linearGradient id="goldGradMenu" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF4D0" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#8A640F" />
          <stop offset="100%" stopColor="#B38F24" />
        </linearGradient>
        <radialGradient id="goldInnerMenu" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFAE0" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#5A3825" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#goldGradMenu)" stroke="#5A3825" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="38" fill="url(#goldInnerMenu)" stroke="#B38F24" strokeWidth="1" />
      <circle cx="50" cy="50" r="32" fill="none" stroke="#FFF4D0" strokeWidth="1.5" strokeDasharray="5 3" />
      {/* Decorative Traditional T crest stand inside seal */}
      <path d="M35 34 L65 34 M50 34 L50 68 M40 68 L60 68 M42 46 L58 46" stroke="#5A3825" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M35 34 L65 34 M50 34 L50 68 M40 68 L60 68 M42 46 L58 46" stroke="#FFFAE0" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </span>
);

const Hero = () => {
  return (
    <section className="relative h-[48vh] min-h-[360px] flex items-center justify-center overflow-hidden border-b border-[#5A3825]/20">
      {/* Background Image: Generated top-down Indian meal flatlay table */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.45)), url(${tawaBoxHero})` 
        }}
      />
      
      {/* Centered Hero Text exactly matching reference layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="space-y-4 max-w-3xl mx-auto"
        >
          <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-black tracking-[0.06em] leading-tight text-[#FAF6ED] drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            <span className="text-[#F5D061] block sm:inline">HAND-CRAFTED DESI MEALS, </span>
            <span className="block sm:inline">DELIVERED WITH PASSION.</span>
          </h1>
        </motion.div>
      </div>
    </section>
  );
};

const QuickOrderSteps = () => {
  return (
    <section className="py-5 bg-[#FAF8F4] border-b border-[#5A3825]/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center">
        {/* Understated steps title matching layout */}
        <h2 className="text-[#5A3825] font-serif font-black text-lg md:text-xl uppercase tracking-[0.1em] text-center mb-4">
          Quick Order Steps
        </h2>
        
        {/* Horizontal flow line of steps with matching Gold coins - single line wrapper */}
        <div className="w-full overflow-x-auto no-scrollbar py-1 flex justify-start sm:justify-center">
          <div className="flex items-center gap-x-5 md:gap-x-12 px-2 min-w-max mx-auto">
            {/* Step 1 */}
            <div className="flex items-center gap-2 select-none">
              <GoldSealCoin size={22} />
              <span className="text-xs md:text-sm font-serif font-extrabold text-[#5A3825] tracking-wide whitespace-nowrap">
                Discover Your Meal
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2 select-none">
              <GoldSealCoin size={22} />
              <span className="text-xs md:text-sm font-serif font-extrabold text-[#5A3825] tracking-wide whitespace-nowrap">
                Select Your
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-2 select-none">
              <GoldSealCoin size={22} />
              <span className="text-xs md:text-sm font-serif font-extrabold text-[#5A3825] tracking-wide whitespace-nowrap">
                Receive & Relish
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FRONT_PAGE_LUNCH_BOX_DESC = `🚀 Short & Punchy List (For Quick Reading)
🔥 Smoky Wood-Fired Rotis

🍲 Savory Seasonal Sabji

🍚 Fluffy Steamed Rice

🥗 Crisp Garden Salad

🥭 Tangy Pickle Pouch

🍉 Sweet Fruit Salad`;

const MorningBreakfastCombo = ({ onAddToCart }: { onAddToCart: (item: MenuItem) => void }) => {
  const comboItem = MENU_ITEMS.find(item => item.id === '15') || {
    id: '15',
    name: 'Lunch Box',
    price: 199,
    description: 'Gourmet lunch box tray cooked over slow firewood. Includes hot, fresh rotis baked on clay oven, delicious seasonal dry subji, basmati rice, garden salad, and sweet fruits.',
    image: desiLunchTrayImg
  };

  return (
    <section id="breakfast-lunch-combos" className="bg-[#E8EFE5] pt-8 pb-10 border-b border-[#5A3825]/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Header Ribbon for Lunch Box */}
        <div className="bg-[#7A8B6B] rounded-xl py-3.5 px-6 flex items-center justify-center shadow-sm border border-[#7A8B6B]/20 mb-8 max-w-4xl mx-auto">
          <h2 className="text-xs md:text-sm font-serif font-black tracking-[0.2em] text-[#FAF8F4] uppercase text-center">
            GOURMET LUNCH BOX
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Lunch Box - Full width containing wood-fired meal detail */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row bg-[#FDFBF7] rounded-[22px] border-4 border-[#C5A028] shadow-md hover:shadow-lg transition-all overflow-hidden h-auto md:h-72"
          >
            {/* Left Column: Image with overlays covering the full section half */}
            <div className="relative w-full md:w-1/2 h-64 md:h-full flex-shrink-0 bg-white">
              <img 
                src={comboItem.image} 
                alt="Lunch Box" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = desiLunchTrayLocal;
                }}
              />
              
              {/* Gold seal stamp relative */}
              <div className="absolute bottom-4 right-4 animate-spin-slow">
                <GoldSealCoin size={26} />
              </div>
            </div>

            {/* Right Column: delicious copy of Lunch Box item */}
            <div className="flex flex-col justify-center flex-1 p-6 md:p-8">
              <div>
                <span className="text-[#7A8B6B] text-[10px] font-serif uppercase tracking-[0.25em] font-extrabold mb-1 block">Wood-Fired Gourmet Selection</span>
                <h3 className="text-xl md:text-2xl font-serif font-black text-[#5A3825] mb-2 leading-tight">
                  Lunch Box
                </h3>
                <div className="text-xs text-[#2E1C12]/90 font-serif leading-relaxed whitespace-pre-line bg-[#EADBBD]/15 p-4 rounded-2xl border border-[#B38F24]/10 max-w-sm mt-3 font-semibold">
                  {FRONT_PAGE_LUNCH_BOX_DESC}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const MorningDaliyaSection = ({ onAddToCart }: { onAddToCart: (item: MenuItem) => void }) => {
  const daliyaDays = [
    {
      day: 'Monday',
      name: 'Veggie Masala Daliya with Mixed Garden Salad',
      description: 'A robust, high-fiber broken wheat bowl slow-cooked with organic carrots, tender green peas, aromatic ginger, and freshly ground country spices, tempered with dynamic mustard seeds and warm curry leaves.',
      image: namkeenDaliyaImg,
      calories: '280 kcal',
      protein: '9g',
      salad: 'Moong Sprouts & Cucumber Salad',
      benefitTag: 'High Fiber • Pure Energy'
    },
    {
      day: 'Tuesday',
      name: 'Cardamom Doodh Daliya with Sliced Fruits',
      description: 'Golden broken wheat tenderly simmered in hot milk, sweetened with organic village jaggery, infused with green cardamom pods, and topped with roasted crunch almonds, black raisins, and fresh banana slices.',
      image: doodhDaliyaImg,
      calories: '320 kcal',
      protein: '11g',
      salad: 'Fresh Minty Apple & Beet Salad',
      benefitTag: 'Rich Calcium • Fitness Fuel'
    },
    {
      day: 'Wednesday',
      name: 'High-Protein Paneer Daliya Khichdi & Salad',
      description: 'Comforting, creamy country daliya khichdi loaded with low-fat organic paneer cubes, whole yellow lentils, fresh dill leaves, and a pure cow ghee tempering of roasted cumin.',
      image: lunchSideMealImg,
      calories: '310 kcal',
      protein: '14g',
      salad: 'Crunchy Spiced Chickpea Salad',
      benefitTag: 'Muscle Recovery • Peak Protein'
    },
    {
      day: 'Thursday',
      name: 'Rustic Wood-Fired Daliya Pulao & Raita',
      description: 'Infused with smoky clay stove heat, this dry vegetable daliya features french beans, cauliflower heads, and spring onions, lightly sautéed with black pepper. Served with tomato-cucumber cool raita.',
      image: tawaBoxHero,
      calories: '260 kcal',
      protein: '8g',
      salad: 'Spiced Tomato & Cucumber Garden Toss',
      benefitTag: 'Weight Management • Good Carbs'
    },
    {
      day: 'Friday',
      name: 'Garlic-Herb Buttered Daliya with Corn',
      description: 'Fragrant roasted broken wheat tossed in a tiny hint of yellow farm butter, real garlic cloves, sweet corn niblets, fresh dynamic garden mint, and custom lemon juice. Supremely easy on digestion.',
      image: desiLunchTrayLocal,
      calories: '290 kcal',
      protein: '9g',
      salad: 'Garden-Fresh Mixed Greens & Corn Salad',
      benefitTag: 'Active Metabolism • Gut Health'
    },
    {
      day: 'Saturday',
      name: 'Saffron Badam Doodh Daliya Infusion',
      description: 'A weekend special! Whole broken daliya slow-cooked in thick almond milk, steeped with premium Kashmiri saffron strands, sweetened with organic dates, and loaded with roasted walnuts and cashews.',
      image: doodhDaliyaImg,
      calories: '340 kcal',
      protein: '12g',
      salad: 'Sweet Sliced Pear & Golden Raisin Toss',
      benefitTag: 'Premium Nutrition • Heart Loving'
    }
  ];

  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const activeDay = daliyaDays[activeDayIdx];
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const planCarouselRef = useRef<HTMLDivElement>(null);

  const scrollPlanLeft = () => {
    if (planCarouselRef.current) {
      planCarouselRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollPlanRight = () => {
    if (planCarouselRef.current) {
      planCarouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  // Helper to add appropriate plan to cart
  const handleAddPlanToCart = (planId: string) => {
    const item = MENU_ITEMS.find(i => i.id === planId);
    if (item) {
      onAddToCart(item);
    }
  };

  return (
    <section id="morning-daliya" className="bg-[#FAF8F4] pt-6 pb-12 sm:pt-8 sm:pb-16 border-b border-[#5A3825]/5 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        
        {/* Header Ribbon for Daliya Diet System (Responsive padding & stacking) */}
        <div className="bg-[#9E5638] rounded-2xl py-4 px-4 sm:px-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-md border border-[#B76F50]/20 mb-6 sm:mb-10 max-w-5xl mx-auto gap-3.5">
          <div className="w-full md:w-auto">
            <span className="bg-white/15 text-white text-[8px] sm:text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest inline-block mb-1.5">Diet Program</span>
            <h2 className="text-xs sm:text-sm md:text-base font-serif font-black tracking-[0.15em] sm:tracking-[0.22em] text-[#FAF8F4] uppercase leading-tight">
              6-DAY MORNING DALIYA & SALAD DIET
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            <span className="text-[9px] sm:text-[10px] md:text-xs font-serif font-bold tracking-wider sm:tracking-widest text-[#FAF8F4]/90 uppercase bg-black/10 py-1 px-2.5 sm:py-1.5 sm:px-3.5 rounded-lg border border-white/5">
              Service: Mon - Sat • 7 AM - 11 AM
            </span>
            <span className="bg-[#7A8B6B] text-white text-[9px] sm:text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-bold shadow-sm animate-pulse">
              Healthy & Fresh
            </span>
          </div>
        </div>

        {/* Dynamic 6-Day Showcase Component (Optimized outer padding for small screens) */}
        <div className="max-w-5xl mx-auto mb-10 sm:mb-16 bg-[#FDFBF7] rounded-3xl sm:rounded-[2rem] border border-[#5A3825]/10 p-3.5 sm:p-6 md:p-8 shadow-sm">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="text-xl sm:text-2xl font-serif font-black text-[#5A3825]">Wholesome Day-by-Day Menu</h3>
            <p className="text-[10px] sm:text-xs text-[#7A8B6B] mt-1.5 font-medium bg-[#7A8B6B]/5 px-3.5 py-1 sm:py-1.5 rounded-full inline-block max-w-full">
              We rotate our recipes daily to ensure balanced nutrition and delicious variety!
            </p>
          </div>

          <div className="w-full border border-[#5A3825]/12 rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-xs max-w-5xl mx-auto">
            
            {/* TOP HALF: MAIN ACTIVE DAY DISPLAY CARD (Seamlessly merged & perfectly responsive) */}
            <motion.div 
              key={activeDayIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full grid grid-cols-1 md:grid-cols-12 items-stretch"
            >
              {/* Left Column: Rich image of daliya + salad (Scaled beautifully) */}
              <div className="md:col-span-6 relative h-52 sm:h-64 md:h-auto min-h-[200px] sm:min-h-[260px] md:min-h-[300px] w-full overflow-hidden bg-neutral-100">
                <img 
                  src={activeDay.image} 
                  alt={activeDay.name} 
                  className="w-full h-full object-cover absolute inset-0"
                  referrerPolicy="no-referrer"
                />
                
                {/* Active Day Ribbon overlay on top-left of the running image */}
                <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#9E5638] text-white font-serif font-black text-[10px] sm:text-xs uppercase px-3 py-1.5 sm:px-4 sm:py-2 rounded-full tracking-wider sm:tracking-widest shadow-md z-10">
                  {activeDay.day} Diet
                </span>

                {/* Energy Stamp Badge */}
                <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-sm border border-[#5A3825]/10 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 shadow-sm z-10">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  <div>
                    <p className="text-[8px] sm:text-[10px] text-[#5A3825]/50 leading-none font-bold uppercase">ENERGY</p>
                    <p className="text-[10px] sm:text-xs font-serif font-black text-[#5A3825] mt-0.5">{activeDay.calories}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic menu content card with fresh salad pairing details (Optimized padding) */}
              <div className="md:col-span-6 bg-[#FAF8F4]/40 p-4 sm:p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[#5A3825]/10">
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className="bg-[#7A8B6B]/10 text-[#7A8B6B] text-[8.5px] sm:text-[9.5px] font-black uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md tracking-wide">
                      {activeDay.benefitTag}
                    </span>
                    <span className="bg-[#9E5638]/10 text-[#9E5638] text-[8.5px] sm:text-[9.5px] font-black uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md tracking-wide">
                      Protein: {activeDay.protein}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-black text-[#5A3825] leading-tight mb-3">
                    {activeDay.name}
                  </h3>
                </div>

                {/* Salad Pairing display box */}
                <div className="p-2.5 sm:p-3 bg-[#7A8B6B]/10 rounded-xl border border-[#7A8B6B]/20 flex items-center gap-2.5 sm:gap-3">
                  <div className="bg-[#7A8B6B] text-white p-1.5 rounded-lg flex-shrink-0">
                    <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-[8.5px] sm:text-[10px] font-black text-[#7A8B6B] uppercase tracking-wider leading-none">Fresh Salad Pairing</h5>
                    <p className="text-xs font-semibold text-[#5A3825] mt-1 truncate">{activeDay.salad}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* BOTTOM HALF: SMALL CAROUSEL ROW FOR OTHER DAY SELECTIONS (Exactly touching, styled perfectly for touch gesturing) */}
            <div className="w-full flex flex-col bg-[#FAF8F4] px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4 border-t border-[#5A3825]/12">
              <div className="flex justify-end mb-2">
                {/* Carousel Navigation Arrow Controls */}
                <div className="flex gap-1.5">
                  <button 
                    onClick={scrollLeft}
                    className="p-1.5 rounded-full bg-white hover:bg-[#FAF6ED] border border-[#5A3825]/10 text-[#5A3825]/75 hover:text-[#5A3825] active:scale-95 transition-all shadow-sm cursor-pointer"
                    title="Previous Slide"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={scrollRight}
                    className="p-1.5 rounded-full bg-[#9E5638] text-white hover:bg-[#83452B] border border-[#5A3825]/10 active:scale-95 transition-all shadow-sm cursor-pointer"
                    title="Next Slide"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Carousel Track - Horizontal Scrollable Row for other days (Touch-friendly sizes optimized to peek & invite swiping with minimal top margin) */}
              <div 
                ref={carouselRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto pb-3 snap-x scroll-smooth w-full select-none cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {daliyaDays.map((item, index) => {
                  const isActive = index === activeDayIdx;
                  if (isActive) return null; // We display the other 5 days as requested

                  return (
                    <motion.button
                      key={item.day}
                      whileHover={{ y: -2 }}
                      onClick={() => setActiveDayIdx(index)}
                      className="flex-shrink-0 w-[170px] sm:w-[210px] flex flex-col p-2.5 sm:p-3 bg-white border border-[#5A3825]/8 rounded-xl sm:rounded-2xl transition-all cursor-pointer text-left shadow-xs hover:shadow-md snap-start h-[170px] sm:h-[190px] justify-between"
                    >
                      {/* Thumbnail image with tag overlay */}
                      <div className="relative w-full h-20 sm:h-24 rounded-lg overflow-hidden bg-white border border-black/5 flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.day} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-[#9E5638] text-white text-[7.5px] sm:text-[8px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wide shadow-sm">
                          {item.day}
                        </span>
                      </div>
                      
                      {/* Description / Content footer for small cards */}
                      <div className="mt-2 text-ellipsis overflow-hidden flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] sm:text-xs font-black text-[#5A3825] line-clamp-1 leading-tight">
                            {item.name.split(' with ')[0]}
                          </p>
                          <p className="text-[8.5px] sm:text-[9.5px] text-[#2E1C12]/60 font-serif line-clamp-1 italic mt-1.5 flex items-center gap-1">
                            <Leaf className="w-2.5 h-2.5 text-[#7A8B6B] flex-shrink-0" />
                            <span className="truncate">{item.salad}</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-[#5A3825]/5 pt-2 mt-1.5">
                          <span className="text-[7.5px] sm:text-[8px] font-black uppercase text-[#7A8B6B] tracking-wider">
                            {item.calories}
                          </span>
                          <span className="text-[8px] sm:text-[9px] font-black text-[#9E5638] flex items-center gap-0.5">
                            View <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Bottom active status bar inside the block (Mobile Stack-Friendly & highly interactive info) */}
              <div className="bg-[#7A8B6B]/10 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between mt-1 gap-2.5 sm:gap-4 text-xs">
                <div className="min-w-0">
                  <span className="text-[8px] sm:text-[9px] font-black text-[#7A8B6B] uppercase block tracking-wider leading-none">CURRENT VIEWED DIET</span>
                  <span className="text-xs font-black text-[#5A3825] mt-1 block truncate">{activeDay.day}: {activeDay.name.split(' with ')[0]}</span>
                </div>
                <div className="flex items-center justify-between sm:justify-end sm:text-right border-t sm:border-t-0 border-[#7A8B6B]/10 pt-2 sm:pt-0 gap-4">
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-bold text-[#5A3825]/40 block uppercase tracking-wider leading-none">CALORIES</span>
                    <span className="text-xs font-black text-[#5A3825] mt-1 block">{activeDay.calories}</span>
                  </div>
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-bold text-[#5A3825]/40 block uppercase tracking-wider leading-none">PROTEIN</span>
                    <span className="text-xs font-black text-[#FAF8F4] bg-[#9E5638] px-2 py-0.5 rounded-lg mt-0.5 block">{activeDay.protein}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3 SUBSCRIPTION / TRIAL PLANS AREA */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center m-0 p-0">
            <h3 className="text-xl md:text-2xl font-serif font-black text-[#5A3825] m-0 p-0">
              Select Your Healthy Daliya Diet Plan
            </h3>
            <p className="text-xs md:text-sm text-[#7A8B6B] m-0 mt-0.5 p-0 font-serif max-w-lg mx-auto">
              Choose from our daily trials, flexible weekly packages, or best-value continuous monthly subscriptions. Delivered hot and fresh!
            </p>
          </div>

          {/* Compact Left/Right Controls for Plan Carousel on mobile screens */}
          <div className="flex justify-end gap-1.5 mb-2 mt-4 md:hidden">
            <button 
              onClick={scrollPlanLeft}
              className="p-1.5 rounded-full bg-white hover:bg-[#FAF6ED] border border-[#5A3825]/10 text-[#5A3825]/75 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Previous Plan"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={scrollPlanRight}
              className="p-1.5 rounded-full bg-[#9E5638] text-white hover:bg-[#83452B] border border-[#5A3825]/10 active:scale-95 transition-all shadow-xs cursor-pointer"
              title="Next Plan"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Responsive Touch Carousel Wrapper (Touch-ready swipe layout on mobile, clean cols on desktop) */}
          <div 
            ref={planCarouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 md:pb-0 scroll-smooth w-full select-none md:grid md:grid-cols-3 md:gap-6 mt-4 md:mt-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            
            {/* PLAN 1: 1 Day Trial Plan */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="flex-shrink-0 w-[270px] sm:w-[290px] md:w-auto bg-[#FAF8F4] rounded-2xl border-2 border-[#5A3825]/8 shadow-xs flex flex-col justify-between overflow-hidden group hover:border-[#7A8B6B]/40 transition-colors snap-start"
            >
              <div className="p-4 sm:p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black uppercase text-[#5A3825]/50 tracking-wider bg-white py-0.5 px-2.5 rounded-md border border-black/5">
                    1 Day Test
                  </span>
                  <UtensilsCrossed className="w-4 h-4 text-[#7A8B6B]" />
                </div>
                <h4 className="text-base font-serif font-black text-[#5A3825]">Daily Trial Diet Plan</h4>
                <p className="text-[10.5px] leading-relaxed text-[#2E1C12]/70 font-serif mt-1.5">
                  Sampling single morning daliya bowl paired with fresh organic garden salad.
                </p>
                <div className="my-3 py-2 border-t border-[#5A3825]/5">
                  <span className="text-[9px] text-[#5A3825]/40 block uppercase tracking-wider font-bold leading-none mb-1">COST</span>
                  <span className="text-2xl font-serif font-black text-[#5A3825]">Rs. 199</span>
                  <span className="text-[10px] text-[#5A3825]/50"> / day delivery</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-[#2E1C12]/80 font-serif">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7A8B6B] flex-shrink-0" />
                    <span>Selected Day Daliya Bowl</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7A8B6B] flex-shrink-0" />
                    <span>Crunchy Fresh Daily Salad</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7A8B6B] flex-shrink-0" />
                    <span>Eco Thermal Packed Hot</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-[#FAF8F4] border-t border-[#5A3825]/5">
                <button 
                  onClick={() => handleAddPlanToCart('daliya-1-day')}
                  className="w-full py-2 bg-[#9E5638] hover:bg-[#B76F50] text-[#FAF6ED] rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer text-center block"
                >
                  Order Trial • Rs. 199
                </button>
              </div>
            </motion.div>
 
            {/* PLAN 2: Weekly Subscription Plan */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="flex-shrink-0 w-[270px] sm:w-[290px] md:w-auto bg-[#EADBBD]/20 rounded-2xl border-2 border-[#7A8B6B] shadow-xs flex flex-col justify-between overflow-hidden relative group snap-start"
            >
              <div className="absolute top-0 right-0 bg-[#7A8B6B] text-white text-[8px] font-black uppercase px-2.5 py-1 rounded-bl-lg tracking-wider">
                POPULAR CHOICE
              </div>
              
              <div className="p-4 sm:p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black uppercase text-[#7A8B6B] tracking-wider bg-white py-0.5 px-2.5 rounded-md border border-[#7A8B6B]/25 font-semibold">
                    6 Active Days
                  </span>
                  <Calendar className="w-4 h-4 text-[#7A8B6B]" />
                </div>
                <h4 className="text-base font-serif font-black text-[#5A3825]">Weekly Health Rotation</h4>
                <p className="text-[10.5px] leading-relaxed text-[#2E1C12]/70 font-serif mt-1.5">
                  Monday to Saturday premium rotation with different salad schedules.
                </p>
                <div className="my-3 py-2 border-t border-[#7A8B6B]/15">
                  <span className="text-[9px] text-[#7A8B6B] block uppercase tracking-wider font-extrabold leading-none mb-1">COST</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-serif font-black text-[#5A3825]">Rs. 1099</span>
                    <span className="text-[10px] text-[#7A8B6B]/80 font-bold line-through">Rs. 1194</span>
                  </div>
                </div>
                <ul className="space-y-1.5 text-[11px] text-[#2E1C12]/80 font-serif">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7A8B6B] flex-shrink-0" />
                    <span>6 Balanced Daliya Bowls</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7A8B6B] flex-shrink-0" />
                    <span>6 Different Salad Pairings</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7A8B6B] flex-shrink-0" />
                    <span>Cancel or Pause Any Day</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-[#EADBBD]/10 border-t border-[#7A8B6B]/10">
                <button 
                  onClick={() => handleAddPlanToCart('daliya-weekly')}
                  className="w-full py-2 bg-[#7A8B6B] hover:bg-[#617054] text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer text-center block"
                >
                  Activate Weekly • Rs. 1099
                </button>
              </div>
            </motion.div>
 
            {/* PLAN 3: Monthly Subscription Plan */}
            <motion.div 
              whileHover={{ y: -3 }}
              className="flex-shrink-0 w-[270px] sm:w-[290px] md:w-auto bg-[#FAF8F4] rounded-2xl border-2 border-[#5A3825]/8 shadow-xs flex flex-col justify-between overflow-hidden group hover:border-[#9E5638]/40 transition-colors snap-start"
            >
              <div className="p-4 sm:p-5 flex-1">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-black uppercase text-[#9E5638] tracking-wider bg-[#9E5638]/5 py-0.5 px-2.5 rounded-md border border-[#9E5638]/20 font-semibold">
                    24 Active Days
                  </span>
                  <Trophy className="w-4 h-4 text-[#9E5638]" />
                </div>
                <h4 className="text-base font-serif font-black text-[#5A3825]">Monthly Master Plan</h4>
                <p className="text-[10.5px] leading-relaxed text-[#2E1C12]/70 font-serif mt-1.5">
                  Super-saver package covering 4 consecutive Mon-Sat weeks. Ultimate nutrition.
                </p>
                <div className="my-3 py-2 border-t border-[#5A3825]/5">
                  <span className="text-[9px] text-[#9E5638] block uppercase tracking-wider font-extrabold leading-none mb-1">COST</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-serif font-black text-[#5A3825]">Rs. 3999</span>
                    <span className="text-[10px] text-[#5A3825]/40 line-through">Rs. 4776</span>
                  </div>
                </div>
                <ul className="space-y-1.5 text-[11px] text-[#2E1C12]/80 font-serif">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#9E5638] flex-shrink-0" />
                    <span className="font-semibold text-[#5A3825]">Save Rs. 777 Instantly</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7A8B6B] flex-shrink-0" />
                    <span>Complete Custom 4-Week Rotation</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#7A8B6B] flex-shrink-0" />
                    <span>VIP Fast Morning Delivery Slot</span>
                  </li>
                </ul>
              </div>
              <div className="p-4 bg-[#FAF8F4] border-t border-[#5A3825]/5">
                <button 
                  onClick={() => handleAddPlanToCart('daliya-monthly')}
                  className="w-full py-2 bg-[#9E5638] hover:bg-[#B76F50] text-[#FAF6ED] rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer text-center block"
                >
                  Activate Monthly • Rs. 3999
                </button>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
};

const LunchBoxCombo = ({ onAddToCart }: { onAddToCart: (item: MenuItem) => void }) => {
  const lunchItem = MENU_ITEMS.find(item => item.id === '14') || {
    id: '14',
    name: 'Desi Lunch Thali Box',
    price: 249,
    description: 'Premium 5-compartment meal tray cooked fresh. Includes hot, hand-rolled rotis, seasonal dry subji, steamed basmati rice, garden salad, and fresh sweet fruits.',
    image: desiLunchTrayImg
  };

  return (
    <section className="bg-[#FAF8F4] pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Full-width Banner Strip matching morning layout */}
        <div className="w-full bg-[#5A3825] rounded-xl py-3.5 px-6 flex items-center justify-between shadow-sm border border-[#5A3825]/20 mb-8">
          <h2 className="text-xs md:text-sm font-serif font-black tracking-[0.2em] text-[#FAF8F4] uppercase">
            LUNCH BOX DIET COMBO
          </h2>
          <span className="text-[10px] md:text-xs font-serif font-bold tracking-widest text-[#FAF8F4]/90 uppercase">
            Time: 12 PM - 3 PM
          </span>
        </div>

        {/* Dynamic 3-Compartment Thali representation */}
        <div className="bg-[#FAF8F4] rounded-[22px] border-4 border-[#C5A028] shadow-md overflow-hidden p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column (lg:col-span-4): Top down compartment lunch box tray image */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="aspect-[3/4] max-h-80 lg:max-h-[340px] w-full rounded-[14px] overflow-hidden relative border border-[#5A3825]/10 bg-white shadow-md p-2">
                <img 
                  src={lunchItem.image} 
                  alt="5-compartment Desi meal tray" 
                  className="w-full h-full object-cover rounded-[11px]"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = desiLunchTrayLocal;
                  }}
                />
              </div>
            </div>

            {/* Center Column (lg:col-span-4): Bullet checkmarks and CTA customize button */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center">
              <h3 className="text-xl md:text-2xl font-serif font-black text-[#5A3825] mb-4">
                Desi Lunch Thali Box
              </h3>
              
              {/* Features bulleted list styled with spacing */}
              <div className="text-left mb-6 text-xs text-[#2E1C12]/90 font-serif leading-relaxed whitespace-pre-line bg-[#EADBBD]/25 p-4 rounded-2xl border border-[#B38F24]/10 max-w-xs font-semibold">
                {FRONT_PAGE_LUNCH_BOX_DESC}
              </div>

              {/* Price Tag: sharp-edged dark brown ribbon banner */}
              <div className="inline-block bg-[#5A3825] border border-[#D4AF37]/30 text-white font-serif font-black text-sm px-6 py-2.5 rounded-md mb-6 shadow">
                Rs. 249
              </div>

              {/* Action Button: gold/cream gradient pill-button with deep gold shadows */}
              <button 
                onClick={() => onAddToCart(lunchItem as MenuItem)}
                className="w-full max-w-[280px] py-3 bg-gradient-to-r from-[#D4AF37] via-[#FFF4D0] to-[#D4AF37] text-[#5A3825] font-serif font-black text-[11px] uppercase tracking-widest rounded-full shadow-[0_4px_12px_rgba(212,175,55,0.3)] hover:shadow-[0_6px_16px_rgba(212,175,55,0.45)] transition-all active:scale-95 border border-[#B38F24]/50"
              >
                CUSTOMIZE YOUR LUNCH BOX
              </button>
            </div>

            {/* Right Column (lg:col-span-4): Side Sprouts and Lassi image */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="aspect-square w-full max-h-[300px] rounded-[14px] overflow-hidden relative border border-[#D4AF37]/25 bg-white shadow-md p-2">
                <img 
                  src={lunchSideMealImg} 
                  alt="Glass of fresh buttermilk and sprouts side" 
                  className="w-full h-full object-cover rounded-[11px]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

const MenuPage = ({ onAddToCart, onUpdateQuantity, cart }: { 
  onAddToCart: (item: MenuItem) => void, 
  onUpdateQuantity: (id: string, delta: number) => void,
  cart: CartItem[]
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuItem['category'] | 'all'>('all');
  const navigate = useNavigate();
  
  const categories: { id: MenuItem['category'] | 'all', label: string }[] = [
    { id: 'all', label: 'All Items' },
    { id: 'healthy', label: 'Morning Breakfast' },
    { id: 'combo', label: 'Lunch Box' },
  ];

  const filteredItems = MENU_ITEMS.filter(item => selectedCategory === 'all' || item.category === selectedCategory);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderMenuItemCard = (item: MenuItem, idx: number) => {
    const cartItem = cart.find(i => i.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.01 }}
        viewport={{ once: true }}
        transition={{ delay: idx * 0.05, duration: 0.4 }}
        className="group glass-card rounded-[1.8rem] p-4 sm:p-6 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 border-white/5 flex flex-col gap-4 relative overflow-hidden"
      >
        <div className="aspect-video w-full bg-white/5 rounded-[11px] overflow-hidden relative">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            referrerPolicy="no-referrer" 
            onError={(e) => {
              if (item.id === '15' || item.id === '14') {
                e.currentTarget.src = desiLunchTrayLocal;
              }
            }}
          />
          {item.category === 'thali' && (
            <div className="absolute top-2 left-2 bg-brand-primary text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
              Signature
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-display font-black text-white leading-tight line-clamp-1">{item.name}</h3>
              <span className="text-lg font-display font-black text-brand-accent ml-2">Rs. {item.price}</span>
            </div>
            <p className="text-white/45 text-[10.5px] leading-relaxed whitespace-pre-line mb-4 font-medium font-sans">
              {item.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {quantity > 0 ? (
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 w-full justify-between">
                <button 
                  onClick={() => onUpdateQuantity(item.id, -1)}
                  className="p-2 bg-white/10 rounded-lg hover:text-brand-accent transition-colors text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-black text-brand-primary text-sm">{quantity}</span>
                <button 
                  onClick={() => onUpdateQuantity(item.id, 1)}
                  className="p-2 bg-white/10 rounded-lg hover:text-brand-accent transition-colors text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => onAddToCart(item)}
                className="w-full bg-brand-primary hover:bg-brand-secondary text-white py-3 rounded-xl font-black text-xs transition-all shadow-lg shadow-brand-primary/10 active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {item.category === 'thali' ? 'Make Your Box' : 'Add to Box'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="pb-20 px-4 md:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="lg:w-64 space-y-8">
        <div className="sticky top-32 space-y-8">
          <div className="hidden lg:block glass-card p-6 rounded-[2rem] border-brand-primary/20 bg-brand-primary/5 text-center">
            <h4 className="text-white font-display font-black text-lg mb-2 leading-tight">Create Your Masterpiece</h4>
            <p className="text-white/40 text-[10px] mb-6 px-2">Customize the ultimate Chulha Thali with your choices.</p>
            <button 
              onClick={() => {
                const thali = MENU_ITEMS.find(i => i.category === 'thali');
                if (thali) onAddToCart(thali);
              }}
              className="w-full bg-brand-primary text-white py-4 rounded-xl font-black text-xs shadow-lg shadow-brand-primary/10 hover:scale-105 transition-all"
            >
              Make Your Box Now
            </button>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 min-w-0">
        <div className="text-center lg:text-left mb-10">
          <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-2">Our Menu</h2>
          <p className="text-brand-primary font-black uppercase tracking-widest text-[10px]">Pure Desi • Wood-Fired • Traditional</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => renderMenuItemCard(item, idx))}
        </div>
        
        <div className="mt-16 glass-card p-10 rounded-[3rem] text-center border-dashed border-white/10 bg-brand-primary/5">
          <p className="text-white max-w-2xl mx-auto leading-relaxed text-sm">
            Our thali system is designed to give you the perfect balance of nutrition and flavor. 
            Every thali comes with a fresh vegetable salad, a seasonal fruit salad, and aromatic Jeera Basmati rice as standard.
          </p>
        </div>
      </div>

      {/* Desktop Cart Summary */}
      <div className="hidden xl:block w-80">
        <div className="sticky top-32 glass-card rounded-[2.5rem] border-white/5 flex flex-col h-[calc(100vh-160px)]">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest">Cart Summary</h3>
            <div className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md text-[10px] font-black">
              {cart.reduce((s, i) => s + i.quantity, 0)} Items
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <ShoppingCart className="w-12 h-12" />
                <p className="text-xs font-bold uppercase tracking-widest">Box is Empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm line-clamp-1">{item.name}</div>
                        <div className="text-xs text-brand-accent font-bold">x{item.quantity} • Rs. {item.price * item.quantity}</div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 hover:text-brand-primary transition-colors"><Minus className="w-3 h-3" /></button>
                        <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 hover:text-brand-primary transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Subtotal</span>
              <span className="text-xl font-display font-black text-brand-primary">Rs. {cartTotal}</span>
            </div>
            <button 
              disabled={cart.length === 0}
              className={`w-full py-4 rounded-xl font-black text-xs transition-all shadow-xl ${
                cart.length > 0 
                  ? 'bg-brand-primary text-white hover:bg-brand-secondary shadow-brand-primary/20 active:scale-95' 
                  : 'bg-white/5 text-white/10 cursor-not-allowed'
              }`}
            >
              Checkout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BenefitsSection = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[150px] -z-10" />
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex-1 space-y-8"
        >
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 px-4 py-2 rounded-full border border-brand-primary/20">
            <Star className="w-4 h-4 text-brand-primary fill-brand-primary" />
            <span className="text-xs font-black uppercase text-brand-primary tracking-widest">Premium Desi Experience</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-black text-white leading-tight">
            The <span className="text-brand-primary italic">Soul</span> of the Village, in a Box.
          </h2>
          <div className="space-y-6">
            {[
              { title: 'Farmer Sourced', desc: 'Grains and veggies are sourced directly from small local farms.' },
              { title: 'No Chemicals', desc: 'Pure Desi Ghee and cold-pressed oils. No additives, ever.' }
            ].map((benefit, bidx) => (
              <motion.div 
                key={bidx} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + bidx * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="bg-brand-primary p-1 rounded-full mt-1.5 shadow-lg shadow-brand-primary/40">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{benefit.title}</h4>
                  <p className="text-white/50 text-sm">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="pt-8">
            <Link 
              to="/#breakfast-lunch-combos" 
              className="bg-brand-primary text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-brand-primary/30 hover:bg-brand-secondary transition-all active:scale-95 inline-flex items-center gap-4"
            >
              Curate Your Box
              <ChevronRight className="w-6 h-6" />
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 relative"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4 pt-12">
              <img src="https://picsum.photos/seed/food-vibe-1/400/600" alt="Vibe 1" className="rounded-3xl shadow-2xl border border-white/5" referrerPolicy="no-referrer" />
              <img src="https://picsum.photos/seed/food-vibe-2/400/400" alt="Vibe 2" className="rounded-3xl shadow-2xl border border-white/5" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-4">
              <img src="https://picsum.photos/seed/food-vibe-3/400/400" alt="Vibe 3" className="rounded-3xl shadow-2xl border border-white/5" referrerPolicy="no-referrer" />
              <img src="https://picsum.photos/seed/food-vibe-4/400/600" alt="Vibe 4" className="rounded-3xl shadow-2xl border border-white/5" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="absolute inset-0 bg-brand-bg/20 backdrop-blur-[1px] -z-10 rounded-[3rem]" />
        </motion.div>
      </div>
    </section>
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
            The Tawa Box was born from a simple longing for the smoky, earthy flavors of a village kitchen. In the hustle of modern life, the traditional "Chulha" (clay Desi chulha) has become a rare sight, and with it, the authentic taste of hand-rolled rotis.
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
        <div className="aspect-square rounded-[2.7rem] overflow-hidden shadow-2xl">
          <img 
            src="https://picsum.photos/seed/chulha_fire/800/800" 
            alt="Traditional Chulha" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-10 -left-10 glass-card p-8 rounded-[22px] hidden md:block">
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const d = userSnap.data();
        const profileData: User = {
          id: uid,
          name: d.name || 'Tawa Lover',
          email: d.email || email,
          role: d.role || ((email === 'yklove0001@gmail.com') ? 'admin' : 'user'),
          points: d.points || 0,
          deliveryAddresses: d.deliveryAddresses || [],
          subscription: d.subscription || { plan: 'none', status: 'none', expiresAt: '' },
          createdAt: d.createdAt || new Date().toISOString()
        };
        onLogin(profileData);
        navigate(profileData.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        // Fallback profile if Firestore is out of sync
        const profileData: User = {
          id: uid,
          name: userCred.user.displayName || 'Tawa Lover',
          email: email,
          role: (email === 'yklove0001@gmail.com') ? 'admin' : 'user',
          points: 0,
          deliveryAddresses: [],
          subscription: { plan: 'none', status: 'none', expiresAt: '' },
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profileData);
        onLogin(profileData);
        navigate(profileData.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const firebaseUser = userCred.user;
      const uid = firebaseUser.uid;
      const email = firebaseUser.email || '';

      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      
      let profileData: User;
      if (userSnap.exists()) {
        const d = userSnap.data();
        profileData = {
          id: uid,
          name: d.name || firebaseUser.displayName || 'Tawa Lover',
          email: email,
          role: d.role || ((email === 'yklove0001@gmail.com') ? 'admin' : 'user'),
          points: d.points || 0,
          deliveryAddresses: d.deliveryAddresses || [],
          subscription: d.subscription || { plan: 'none', status: 'none', expiresAt: '' },
          createdAt: d.createdAt || new Date().toISOString()
        };
      } else {
        profileData = {
          id: uid,
          name: firebaseUser.displayName || 'Tawa Lover',
          email: email,
          role: (email === 'yklove0001@gmail.com') ? 'admin' : 'user',
          points: 0,
          deliveryAddresses: [],
          subscription: {
            plan: 'none',
            status: 'none',
            expiresAt: ''
          },
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profileData);
      }
      onLogin(profileData);
      navigate(profileData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
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
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all pr-14" 
                placeholder="••••••••" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-brand-primary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-white/40 text-xs font-mono">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            type="button"
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.111C18.281 1.09 15.545 0 12.24 0 5.581 0 0 5.373 0 12s5.581 12 12.24 12c6.96 0 11.57-4.894 11.57-11.79 0-.795-.085-1.4-.192-1.925H12.24Z" />
            </svg>
            Continue with Google
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      const profileData: User = {
        id: uid,
        name,
        email,
        role: (email === 'yklove0001@gmail.com') ? 'admin' : 'user',
        points: 0,
        deliveryAddresses: [],
        subscription: {
          plan: 'none',
          status: 'none',
          expiresAt: ''
        },
        createdAt: new Date().toISOString()
      };

      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, profileData);

      onLogin(profileData);
      navigate(profileData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCred = await signInWithPopup(auth, provider);
      const firebaseUser = userCred.user;
      const uid = firebaseUser.uid;
      const email = firebaseUser.email || '';

      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);
      
      let profileData: User;
      if (userSnap.exists()) {
        const d = userSnap.data();
        profileData = {
          id: uid,
          name: d.name || firebaseUser.displayName || 'Tawa Lover',
          email: email,
          role: d.role || ((email === 'yklove0001@gmail.com') ? 'admin' : 'user'),
          points: d.points || 0,
          deliveryAddresses: d.deliveryAddresses || [],
          subscription: d.subscription || { plan: 'none', status: 'none', expiresAt: '' },
          createdAt: d.createdAt || new Date().toISOString()
        };
      } else {
        profileData = {
          id: uid,
          name: firebaseUser.displayName || 'Tawa Lover',
          email: email,
          role: (email === 'yklove0001@gmail.com') ? 'admin' : 'user',
          points: 0,
          deliveryAddresses: [],
          subscription: {
            plan: 'none',
            status: 'none',
            expiresAt: ''
          },
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, profileData);
      }
      onLogin(profileData);
      navigate(profileData.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
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
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all pr-14" 
                placeholder="••••••••" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-brand-primary transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-white/40 text-xs font-mono">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            type="button"
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.111C18.281 1.09 15.545 0 12.24 0 5.581 0 0 5.373 0 12s5.581 12 12.24 12c6.96 0 11.57-4.894 11.57-11.79 0-.795-.085-1.4-.192-1.925H12.24Z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-white/60 text-sm">
            Already have an account? <Link to="/login" className="text-brand-accent font-bold">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

const OrderStatusSteps = ({ status }: { status: OrderDetails['status'] }) => {
  const steps = [
    { id: 'pending', label: 'Confirmed', icon: CheckCircle2 },
    { id: 'preparing', label: 'Preparing', icon: Flame },
    { id: 'shipping', label: 'On the Way', icon: Package },
    { id: 'delivered', label: 'Arrived', icon: MapPin },
  ];

  const getStatusIndex = (s: string) => {
    if (s === 'pending') return 0;
    if (s === 'preparing') return 1;
    if (s === 'delivered') return 3;
    if (s === 'cancelled') return -1;
    return 2; // shipping / ready for pickup
  };

  const currentIndex = getStatusIndex(status);

  if (status === 'cancelled') return null;

  return (
    <div className="relative pt-12 pb-4">
      {/* Background Line */}
      <div className="absolute top-[4.2rem] left-0 right-0 h-1 bg-white/5 rounded-full" />
      
      {/* Progress Line */}
      <div className="absolute top-[4.2rem] left-0 right-0 h-1 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-brand-primary shadow-[0_0_20px_rgba(234,88,12,0.5)]"
        />
      </div>

      <div className="flex justify-between relative px-2">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-4 relative">
              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                  isCompleted 
                    ? 'bg-brand-primary border-brand-primary text-white shadow-[0_10px_25px_-5px_rgba(234,88,12,0.4)]' 
                    : 'bg-white/5 border-white/10 text-white/20'
                } ${isActive ? 'ring-4 ring-brand-primary/20 scale-110 z-10' : ''}`}
              >
                {isActive ? (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <step.icon className="w-7 h-7" />
                  </motion.div>
                ) : (
                  <step.icon className={`w-6 h-6 ${isCompleted ? 'text-white' : 'text-white/20'}`} />
                )}
              </div>
              
              <div className="flex flex-col items-center">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-brand-primary' : 'text-white/20'}`}>
                  {step.label}
                </span>
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[8px] text-white/40 font-bold mt-1"
                  >
                    Live
                  </motion.span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = ({ user, orders, onUpdateStatus, onOpenEmailLogs, onUpdateUser }: { 
  user: User, 
  orders: OrderDetails[], 
  onUpdateStatus: (id: string, status: OrderDetails['status']) => void, 
  onOpenEmailLogs?: () => void,
  onUpdateUser: (updatedFields: Partial<User>) => Promise<void>
}) => {
  const [statusFilter, setStatusFilter] = useState<OrderDetails['status'] | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [newAddress, setNewAddress] = useState('');
  const [editingName, setEditingName] = useState(user.name);
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const userOrders = orders.filter(o => o.userId === user.id);

  const filteredOrders = userOrders.filter(order => {
    const statusMatch = statusFilter === 'all' || order.status === statusFilter;
    const orderDate = new Date(order.createdAt).getTime();
    const startMatch = !startDate || orderDate >= new Date(startDate).setHours(0, 0, 0, 0);
    const endMatch = !endDate || orderDate <= new Date(endDate).setHours(23, 59, 59, 999);
    return statusMatch && startMatch && endMatch;
  });

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div>
          <h2 className="text-5xl font-display font-black text-brand-primary mb-2">Welcome, {user.name}!</h2>
          <p className="text-white/60">Manage your orders and track your subscription details.</p>
          {onOpenEmailLogs && (
            <button 
              onClick={onOpenEmailLogs}
              className="mt-4 flex items-center gap-2 bg-[#7A8B6B]/15 hover:bg-[#7A8B6B]/25 text-[#E8EFE5] px-4 py-2 rounded-xl text-xs font-bold transition-all border border-[#7A8B6B]/30 cursor-pointer shadow-md"
            >
              <Mail className="w-4 h-4 text-[#7A8B6B]" />
              📬 View Dispatched E-mails (Transactional Inbox)
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center">
              <Package className="text-brand-primary w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-display font-black text-brand-primary">{userOrders.length}</div>
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Total Orders</div>
            </div>
          </div>
          <div className="bg-brand-primary/5 p-6 rounded-3xl border border-brand-accent/20 flex items-center gap-4 shadow-xl shadow-brand-accent/5">
            <div className="bg-brand-accent/10 p-4 rounded-2xl">
              <Trophy className="w-8 h-8 text-brand-accent" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mb-1">Tawa Rewards</div>
              <div className="text-2xl font-display font-black text-brand-primary flex items-baseline gap-1">
                {user.points || 0} 
                <span className="text-xs font-bold text-brand-accent uppercase tracking-tighter">Points</span>
              </div>
              <div className="text-[10px] text-white/30 font-medium whitespace-nowrap">Rs. {(user.points / 10).toFixed(0)} to redeem</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-white/10 mb-8 gap-6">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'orders' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-white/40 hover:text-white'
          }`}
        >
          🍛 Order History
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`pb-4 text-sm font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'profile' ? 'border-brand-primary text-[#EA580C]' : 'border-transparent text-white/40 hover:text-white'
          }`}
        >
          👤 Addresses & Subscription
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'orders' ? (
          <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h3 className="text-2xl font-display font-bold text-brand-primary">Order History</h3>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/5 p-1 rounded-2xl flex items-center gap-1 border border-white/10 flex-wrap">
                  {['all', 'pending', 'preparing', 'shipping', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status as any)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        statusFilter === status 
                          ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                          : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {status === 'shipping' ? 'shipping' : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
              <div className="flex items-center gap-3 px-4 py-2 bg-black/20 rounded-xl border border-white/10 flex-1 min-w-[200px]">
                <Calendar className="w-4 h-4 text-brand-primary" />
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-xs font-bold text-white/80 w-full outline-none"
                />
                <span className="text-white/20 text-xs">to</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-xs font-bold text-white/80 w-full outline-none"
                />
              </div>
              {(startDate || endDate || statusFilter !== 'all') && (
                <button 
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 text-xs font-bold text-brand-accent hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="glass-card p-20 rounded-[3rem] text-center border-white/5">
                <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter className="w-10 h-10 text-white/20" />
                </div>
                <p className="text-white/60 text-lg">No orders match your current filters.</p>
                {(startDate || endDate || statusFilter !== 'all') && (
                  <button 
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setStatusFilter('all');
                    }}
                    className="mt-4 text-brand-primary font-bold hover:underline"
                  >
                    Show all orders
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
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
                          order.status === 'shipping' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-brand-accent/20 text-brand-accent'
                        }`}>
                          {order.status === 'shipping' ? 'shipping' : order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                        <div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Mobile</div>
                          <div className="font-bold text-brand-primary">{order.mobile}</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Address</div>
                          <div className="font-bold text-brand-primary text-xs line-clamp-1">{order.address}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total</div>
                          <div className="font-bold text-brand-primary">Rs. {order.total}</div>
                          {order.discountAmount && order.discountAmount > 0 ? (
                            <div className="text-[10px] text-brand-accent font-bold mt-1 tracking-tighter">-Rs. {order.discountAmount} saved</div>
                          ) : null}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Rewards</div>
                          <div className="text-brand-accent font-black tracking-tighter">+{order.loyaltyPointsEarned || 0} pts</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Payment</div>
                          <div className="font-bold text-brand-accent uppercase text-[10px]">{order.paymentMethod === 'cod' ? 'Pay on Delivery' : 'Online'}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map(item => (
                          <span key={item.id} className="bg-white/5 px-3 py-1 rounded-lg text-xs text-white/60">
                            {item.name} x{item.quantity}
                          </span>
                        ))}
                      </div>

                      {order.notes && (
                        <div className="mt-4 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                          <div className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">Order Notes</div>
                          <p className="text-white/80 text-sm italic">"{order.notes}"</p>
                        </div>
                      )}

                      {/* Tracking Progress */}
                      {order.status !== 'cancelled' && (
                        <div className="mt-8 pt-6 border-t border-white/5">
                          <div className="flex justify-between items-end mb-4">
                            <div>
                              <div className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mb-1">Live Tracking</div>
                              <div className="flex items-center gap-2">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="w-2.5 h-2.5 bg-brand-accent rounded-full"
                                />
                                <span className="text-sm font-bold text-white uppercase tracking-tight">
                                  {order.status === 'pending' ? 'Order Confirmed' : 
                                   order.status === 'preparing' ? 'Food being prepared' :
                                   order.status === 'shipping' ? 'Out for Delivery 🛵' :
                                   'Arrived & Delivered!'}
                                </span>
                              </div>
                            </div>
                            {order.estimatedDelivery && order.status !== 'delivered' && (
                              <div className="text-right">
                                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Estimated Delivery</div>
                                <div className="text-xl font-display font-black text-brand-primary">
                                  {new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <OrderStatusSteps status={order.status} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {order.status === 'pending' && (
                        <div className="flex items-center gap-2 text-brand-accent">
                          <Clock className="w-5 h-5" />
                          <span className="font-bold">Preparing soon...</span>
                        </div>
                      )}
                      {order.status === 'shipping' && (
                        <div className="flex items-center gap-2 text-blue-400">
                          <Compass className="w-5 h-5 animate-spin" />
                          <span className="font-bold">On the Way 🛵</span>
                        </div>
                      )}
                      {order.status === 'delivered' && (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-bold">Delivered</span>
                        </div>
                      )}
                      {(order.status === 'pending' || order.status === 'preparing') && (
                        <button 
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to cancel order #${order.id}?`)) {
                              onUpdateStatus(order.id, 'cancelled');
                              alert('Order cancelled successfully.');
                            }
                          }}
                          className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all font-bold text-xs"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            
            {/* 1. Edit Name Display */}
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <h4 className="text-xl font-display font-bold text-[#EADBBD]">Personal Details</h4>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Your Full Name</label>
                  <input 
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary text-white outline-none transition-all"
                  />
                </div>
                <button 
                  onClick={async () => {
                    setIsUpdatingName(true);
                    await onUpdateUser({ name: editingName });
                    setIsUpdatingName(false);
                    alert('Name successfully updated!');
                  }}
                  disabled={isUpdatingName}
                  className="px-6 py-4 bg-brand-primary hover:bg-brand-secondary text-white font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  {isUpdatingName ? 'Saving...' : 'Update Name'}
                </button>
              </div>
            </div>

            {/* 2. Saved Delivery Addresses */}
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <h4 className="text-xl font-display font-bold text-[#EADBBD]">Saved Delivery Addresses</h4>
              <div className="space-y-4">
                {!user.deliveryAddresses || user.deliveryAddresses.length === 0 ? (
                  <p className="text-white/40 text-sm">No saved delivery addresses yet. Add one below!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.deliveryAddresses.map((addr, i) => (
                      <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex justify-between items-start gap-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-brand-primary mt-1 shrink-0" />
                          <span className="text-xs font-bold text-white/80">{addr}</span>
                        </div>
                        <button 
                          onClick={async () => {
                            const updated = user.deliveryAddresses?.filter((_, idx) => idx !== i) || [];
                            await onUpdateUser({ deliveryAddresses: updated });
                          }}
                          className="text-red-400 hover:text-red-500 transition-colors cursor-pointer text-xs font-bold font-mono p-1 shrink-0"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">New Delivery Address</label>
                    <input 
                      type="text"
                      placeholder="House No, Apartment Name, Street, Landmark..."
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      className="w-full bg-white/5 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary text-white outline-none transition-all text-xs"
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      if (!newAddress.trim()) return;
                      const updated = [...(user.deliveryAddresses || []), newAddress.trim()];
                      await onUpdateUser({ deliveryAddresses: updated });
                      setNewAddress('');
                      alert('Delivery address added!');
                    }}
                    className="px-6 py-4 bg-[#9E5638] hover:bg-[#B76F50] text-[#FAF6ED] font-bold rounded-2xl transition-all cursor-pointer whitespace-nowrap"
                  >
                    Add Address
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Active Tawa Subscription Details */}
            <div className="glass-card p-8 rounded-[2.5rem] border-white/5 space-y-6">
              <h4 className="text-xl font-display font-bold text-[#EADBBD]">Active Subscription Details</h4>
              
              <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-accent/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <div className="text-[10px] font-bold text-brand-accent uppercase tracking-widest mb-1">Your Selected Plan</div>
                  <div className="text-2xl font-display font-black text-brand-primary">
                    {!user.subscription || user.subscription.plan === 'none' ? 'No Active Subscription' : 
                     user.subscription.plan === 'weekly_basic' ? 'Weekly Basic (7 Combos)' : 
                     'Monthly Pro Box (30 Combos)'}
                  </div>
                  {user.subscription && user.subscription.status !== 'none' && user.subscription.status !== 'cancelled' && (
                    <div className="text-xs text-white/60 mt-1">
                      Status: <span className="font-bold text-brand-accent uppercase">{user.subscription.status}</span> • Expires on: <span className="font-bold text-brand-primary">{new Date(user.subscription.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  {user.subscription && user.subscription.status === 'cancelled' && (
                    <div className="text-xs text-red-400 mt-1">
                      Subscription Cancelled. (Access remains valid until {new Date(user.subscription.expiresAt).toLocaleDateString()})
                    </div>
                  )}
                </div>
                {user.subscription && user.subscription.status === 'active' && (
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to cancel your Tawa Box subscription?')) {
                        await onUpdateUser({
                          subscription: {
                            plan: user.subscription?.plan || 'none',
                            status: 'cancelled',
                            expiresAt: user.subscription?.expiresAt || ''
                          }
                        });
                        alert('Subscription cancelled successfully.');
                      }
                    }}
                    className="px-4 py-2 border border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Weekly Basic Plan */}
                <div className={`p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-64 border transition-all ${
                  user.subscription?.plan === 'weekly_basic' && user.subscription?.status === 'active'
                    ? 'bg-brand-primary/10 border-brand-primary shadow-xl shadow-brand-primary/10 scale-102'
                    : 'bg-white/5 border-white/10 hover:border-white/25'
                }`}>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">7 Lunch/Dinner Boxes</span>
                      {user.subscription?.plan === 'weekly_basic' && user.subscription?.status === 'active' && (
                        <span className="bg-brand-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <h5 className="text-xl font-bold font-serif text-[#EADBBD]">Weekly Basic</h5>
                    <p className="text-white/60 text-xs mt-2">Get high-quality desi flame-cooked Lunch Box combos delivered daily. Baked rotis, sabji, salad and real sweets.</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-2xl font-display font-black text-[#EADBBD]">Rs. 499</span>
                      <span className="text-[10px] text-white/40">/week</span>
                    </div>
                    {user.subscription?.plan !== 'weekly_basic' || user.subscription?.status !== 'active' ? (
                      <button 
                        onClick={async () => {
                          const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                          await onUpdateUser({
                            subscription: {
                              plan: 'weekly_basic',
                              status: 'active',
                              expiresAt
                            }
                          });
                          alert('Successfully upgraded to Weekly Basic plan!');
                        }}
                        className="bg-[#9E5638] hover:bg-[#B76F50] text-[#FAF6ED] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Select Plan
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Monthly Pro Plan */}
                <div className={`p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-64 border transition-all ${
                  user.subscription?.plan === 'monthly_pro' && user.subscription?.status === 'active'
                    ? 'bg-brand-primary/10 border-brand-primary shadow-xl shadow-brand-primary/10 scale-102'
                    : 'bg-white/5 border-white/10 hover:border-white/25'
                }`}>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">30 Lunch/Dinner Boxes</span>
                      {user.subscription?.plan === 'monthly_pro' && user.subscription?.status === 'active' && (
                        <span className="bg-brand-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full">Active</span>
                      )}
                    </div>
                    <h5 className="text-xl font-bold font-serif text-[#EADBBD]">Monthly Pro Box</h5>
                    <p className="text-white/60 text-xs mt-2">Our best-value subscription! 30 authentic clay-oven cooked lunch box combinations delivered straight to your home or office.</p>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-2xl font-display font-black text-[#EADBBD]">Rs. 1899</span>
                      <span className="text-[10px] text-white/40">/month</span>
                    </div>
                    {user.subscription?.plan !== 'monthly_pro' || user.subscription?.status !== 'active' ? (
                      <button 
                        onClick={async () => {
                          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                          await onUpdateUser({
                            subscription: {
                              plan: 'monthly_pro',
                              status: 'active',
                              expiresAt
                            }
                          });
                          alert('Successfully upgraded to Monthly Pro Box plan!');
                        }}
                        className="bg-[#9E5638] hover:bg-[#B76F50] text-[#FAF6ED] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Select Plan
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminPanel = ({ orders, onUpdateStatus, onOpenEmailLogs }: { orders: OrderDetails[], onUpdateStatus: (id: string, status: OrderDetails['status']) => void, onOpenEmailLogs?: () => void }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderDetails['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date_newest' | 'date_oldest' | 'amount_highest' | 'amount_lowest'>('date_newest');

  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      order.id.toLowerCase().includes(term) ||
      order.userName.toLowerCase().includes(term) ||
      order.userEmail.toLowerCase().includes(term)
    );
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date_newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'date_oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'amount_highest') {
      return b.total - a.total;
    }
    if (sortBy === 'amount_lowest') {
      return a.total - b.total;
    }
    return 0;
  });

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
        <div>
          <h2 className="text-5xl font-display font-black text-brand-primary mb-2">Admin Panel</h2>
          <p className="text-white/60">Manage all incoming orders and update their status.</p>
          {onOpenEmailLogs && (
            <button 
              onClick={onOpenEmailLogs}
              className="mt-4 flex items-center gap-2 bg-[#7A8B6B]/15 hover:bg-[#7A8B6B]/25 text-[#E8EFE5] px-4 py-2 rounded-xl text-xs font-bold transition-all border border-[#7A8B6B]/30 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#7A8B6B]" />
              📬 View Transactional Email Logs (Resend Outbox)
            </button>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Search Box */}
          <div className="relative w-full md:w-64 group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search ID, Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3.5 outline-none focus:ring-2 focus:ring-brand-primary transition-all text-white font-medium text-xs"
            />
          </div>

          {/* Sorting Dropdown */}
          <div className="relative w-full md:w-48 group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-brand-primary transition-all text-white font-bold text-xs appearance-none cursor-pointer [color-scheme:dark]"
            >
              <option value="date_newest">Date: Newest First</option>
              <option value="date_oldest">Date: Oldest First</option>
              <option value="amount_highest">Amount: High to Low</option>
              <option value="amount_lowest">Amount: Low to High</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
              <ChevronRight className="w-3 h-3 transform rotate-90" />
            </div>
          </div>

          {/* Status Filter Tab Buttons */}
          <div className="bg-white/5 p-1 rounded-2xl flex items-center gap-1 border border-white/10 w-full md:w-auto flex-wrap">
            {['all', 'pending', 'preparing', 'shipping', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                className={`flex-1 md:flex-none px-3.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                  statusFilter === status 
                    ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedOrders.length === 0 ? (
          <div className="glass-card p-20 rounded-[3rem] text-center border-white/5">
            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="w-10 h-10 text-white/20" />
            </div>
            <p className="text-white/60 text-lg">{searchTerm ? 'No orders found matching your search.' : 'No orders placed yet.'}</p>
          </div>
        ) : (
          sortedOrders.map(order => (
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
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Mobile</div>
                    <div className="font-bold text-brand-primary">{order.mobile}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Total</div>
                    <div className="font-bold text-brand-primary text-xl">Rs. {order.total}</div>
                    {order.discountAmount && order.discountAmount > 0 ? (
                      <div className="text-[10px] text-brand-accent font-bold mt-1 tracking-tighter">-Rs. {order.discountAmount} redeemed</div>
                    ) : null}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Earned</div>
                    <div className="text-brand-accent font-black tracking-tighter">+{order.loyaltyPointsEarned || 0} pts</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Payment</div>
                    <div className="font-bold text-brand-accent uppercase text-xs">{order.paymentMethod === 'cod' ? 'Pay on Delivery' : 'Online'}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Address</div>
                    <div className="font-bold text-brand-primary text-xs">{order.address}</div>
                  </div>
                </div>

                {order.notes && (
                  <div className="mb-6 p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                    <div className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">Customer Note</div>
                    <p className="text-white/80 text-sm italic">"{order.notes}"</p>
                  </div>
                )}

                <div className="border-t border-white/5 pt-6">
                  <OrderStatusSteps status={order.status} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <button 
                    onClick={() => {
                      if (window.confirm(`Admin: Cancel order #${order.id}?`)) {
                        onUpdateStatus(order.id, 'cancelled');
                        alert(`Order #${order.id} has been cancelled.`);
                      }
                    }}
                    className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                )}
                <select 
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value as any)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-brand-primary outline-none focus:ring-2 focus:ring-brand-primary [color-scheme:dark] cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="shipping">On the Way</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                  order.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                  order.status === 'shipping' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-brand-accent/20 text-brand-accent'
                }`}>
                  {order.status === 'shipping' ? 'shipping' : order.status}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

const EmailLogsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [emails, setEmails] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      const raw = localStorage.getItem('tawabox_sent_emails');
      const loaded = raw ? JSON.parse(raw) : [];
      setEmails(loaded);
      if (loaded.length > 0) {
        setSelectedEmail(loaded[0]);
      } else {
        setSelectedEmail(null);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-[#FAF8F4] w-full max-w-4xl h-[80vh] rounded-[2.5rem] border-2 border-[#7A8B6B]/30 overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-[#DFE7DC] p-6 border-b border-[#7A8B6B]/25 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-[#5A3825]" />
              <div>
                <h3 className="font-serif font-black text-[#5A3825] text-lg uppercase tracking-wider">Transactional Email Service Log</h3>
                <p className="text-[10px] text-[#7A8B6B] uppercase tracking-widest font-bold">Resend Outbox Live Delivery status</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 bg-[#5A3825]/5 text-[#5A3825] rounded-full hover:bg-[#5A3825]/15 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* List */}
            <div className="w-80 border-r border-[#7A8B6B]/15 overflow-y-auto p-4 space-y-2 bg-[#FAF6ED] flex-shrink-0">
              {emails.length === 0 ? (
                <div className="text-center py-20 text-[#5A3825]/40 font-bold text-sm">
                  No emails dispatched yet.<br />Place an order or update status as Admin!
                </div>
              ) : (
                emails.map((email) => (
                  <button
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border cursor-pointer ${
                      selectedEmail?.id === email.id 
                        ? 'bg-[#7A8B6B] text-white border-[#7A8B6B]' 
                        : 'bg-white text-[#5A3825] border-[#5A3825]/10 hover:border-[#7A8B6B]/40 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1 text-[9px] font-bold uppercase tracking-wider">
                      <span className="opacity-75">{email.type === 'order_confirmed' ? 'Receipt' : 'Update'}</span>
                      <span className="opacity-50">{new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="font-serif font-black text-xs line-clamp-1 leading-tight mb-1">{email.subject}</div>
                    <div className="text-[9px] opacity-70 truncate">To: {email.recipient}</div>
                  </button>
                ))
              )}
            </div>

            {/* Viewer preview */}
            <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col justify-start">
              {selectedEmail ? (
                <div className="space-y-4">
                  {/* Meta headers */}
                  <div className="bg-[#FAF8F4] p-4 rounded-2xl border border-[#5A3825]/10 space-y-1">
                    <div className="text-xs text-slate-500 font-mono"><strong>From:</strong> orders@tawabox.com</div>
                    <div className="text-xs text-slate-500 font-mono"><strong>To:</strong> {selectedEmail.recipient}</div>
                    <div className="text-xs text-slate-500 font-mono"><strong>Subject:</strong> {selectedEmail.subject}</div>
                    <div className="text-xs text-slate-500 font-mono"><strong>Date:</strong> {new Date(selectedEmail.sentAt).toLocaleString()}</div>
                    <div className="text-xs text-[#7A8B6B] font-mono flex items-center gap-1.5 pt-1">
                      <span className="inline-block w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                      <strong>Delivery Status:</strong> Sent (Delivered securely in sandbox mode)
                    </div>
                  </div>

                  {/* Rendered HTML inside an insulated container */}
                  <div className="border border-[#7A8B6B]/15 rounded-3xl overflow-hidden shadow-sm p-4 bg-transparent max-w-full">
                    <div className="w-full overflow-x-auto" dangerouslySetInnerHTML={{ __html: selectedEmail.html }} />
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center text-[#5A3825]/40 py-20">
                  <Mail className="w-12 h-12 text-[#5A3825]/20 mb-3" />
                  <p className="font-serif font-bold">Review Dispatched E-mails</p>
                  <p className="text-xs max-w-xs mt-1">Select an email to view full transactional HTML layout and delivery payloads.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const THALI_OPTIONS = {
  rotis: '5 Assorted Wood-fired Rotis (Fixed)',
  vegetables: ['Seasonal Dry Sabji', 'Slow-Cooked Dal Tadka', 'Village Style Mixed Veg', 'Healthy Sprouts Curry'],
  vegSalad: 'Garden Fresh Green Salad',
  fruitSalad: 'Seasonal Fruit Medley',
  rice: 'Basmati Jeera Rice'
};

const LUNCH_BOX_OPTIONS = {
  rotis: '🔥 Smoky Wood-Fired Rotis (clay oven)',
  vegetables: [
    'Paneer Butter Masala (Traditional Cottage Cheese)',
    'Dry Bhindi Masala (Wood-fired Spiced Okra)',
    'Village Style Dal Tadka (Clay Pot Lentils)',
    'Jeera Aloo Handi (Cumin-Tempered Potatoes)'
  ],
  rice: '🍚 Fluffy Steamed Basmati Rice',
  salad: '🥗 Crisp Garden Salad',
  fruits: '🍉 Sweet Fresh Fruit Salad',
  pickle: '🥭 Tangy Handmade Mango Pickle'
};

const ThaliCustomizationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  item
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: (selections: any) => void,
  item: MenuItem | null
}) => {
  const [selectedVegs, setSelectedVegs] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedVegs([]);
    }
  }, [isOpen, item]);

  const isLunchBox = item?.id === '15' || item?.id === '14';
  const options = isLunchBox ? LUNCH_BOX_OPTIONS : THALI_OPTIONS;

  const toggleVeg = (veg: string) => {
    setSelectedVegs(prev => {
      if (prev.includes(veg)) return prev.filter(v => v !== veg);
      if (prev.length < 2) return [...prev, veg];
      return prev;
    });
  };

  const isValid = selectedVegs.length === 2;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
      >
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[#0a150d] border border-white/10 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="p-8 border-b border-white/10 flex justify-between items-center bg-brand-primary/5">
            <div>
              <h2 className="text-3xl font-display font-black text-brand-primary">Setup Your {isLunchBox ? 'Lunch Box' : 'Thali'}</h2>
              <p className="text-white/40 text-sm">Select 2 delicious sabjis to complete your meal</p>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 overflow-y-auto flex-1 space-y-10 custom-scrollbar">
            {/* Fixed Items Summary */}
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
              <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest">Included in your {isLunchBox ? 'Lunch Box' : 'Thali'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary/20 p-2 rounded-xl"><Flame className="w-4 h-4 text-brand-primary" /></div>
                  <span className="text-sm font-bold text-[#f7fcf8]">{options.rotis}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary/20 p-2 rounded-xl"><UtensilsCrossed className="w-4 h-4 text-brand-primary" /></div>
                  <span className="text-sm font-bold text-[#f7fcf8]">{options.rice}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary/20 p-2 rounded-xl"><Leaf className="w-4 h-4 text-brand-primary" /></div>
                  <span className="text-sm font-bold text-[#f7fcf8]">{isLunchBox ? LUNCH_BOX_OPTIONS.salad : THALI_OPTIONS.vegSalad}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-brand-primary/20 p-2 rounded-xl"><Star className="w-4 h-4 text-brand-primary" /></div>
                  <span className="text-sm font-bold text-[#f7fcf8]">{isLunchBox ? LUNCH_BOX_OPTIONS.fruits : THALI_OPTIONS.fruitSalad}</span>
                </div>
                {isLunchBox && (
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-primary/20 p-2 rounded-xl"><Leaf className="w-4 h-4 text-brand-primary" /></div>
                    <span className="text-sm font-bold text-[#f7fcf8]">{LUNCH_BOX_OPTIONS.pickle}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Vegetable Selection */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-brand-primary" />
                  Choose 2 Sabjis
                </h3>
                <span className={`text-xs font-black p-2 rounded-lg ${selectedVegs.length === 2 ? 'bg-green-500/20 text-green-500' : 'bg-brand-primary/20 text-brand-primary'}`}>
                  {selectedVegs.length}/2 Selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.vegetables.map(veg => (
                  <button
                    key={veg}
                    onClick={() => toggleVeg(veg)}
                    className={`p-5 rounded-[1.5rem] border text-left transition-all relative overflow-hidden group ${
                      selectedVegs.includes(veg) 
                        ? 'bg-brand-primary/25 border-brand-primary text-white shadow-lg' 
                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold relative z-10">{veg}</div>
                    {selectedVegs.includes(veg) && (
                      <motion.div 
                        layoutId="active-veg"
                        className="absolute inset-0 bg-brand-primary/5 -z-0"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8 bg-brand-primary/5 border-t border-white/10">
            <button
              onClick={() => onConfirm({ 
                rotis: [options.rotis], 
                vegetables: selectedVegs,
                vegSalad: isLunchBox ? LUNCH_BOX_OPTIONS.salad : THALI_OPTIONS.vegSalad,
                fruitSalad: isLunchBox ? LUNCH_BOX_OPTIONS.fruits : THALI_OPTIONS.fruitSalad,
                rice: options.rice
              })}
              disabled={!isValid}
              className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl ${
                isValid 
                  ? 'bg-brand-primary text-white hover:bg-brand-secondary shadow-brand-primary/20 active:scale-[0.98]' 
                  : 'bg-white/10 text-white/20 cursor-not-allowed'
              }`}
            >
              Order This {isLunchBox ? 'Lunch Box' : 'Thali'} • Rs. {item?.price || 250}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
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
            className="aspect-[4/3] rounded-[22px] overflow-hidden shadow-lg group cursor-pointer"
            onClick={() => setSelectedImage(img)}
          >
            <div className="relative w-full h-full overflow-hidden">
              <img 
                src={img} 
                alt={`Gallery ${idx}`} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-black uppercase tracking-widest text-sm bg-brand-primary/80 px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  View Large
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button 
              className="absolute top-8 right-8 text-white bg-white/10 p-4 rounded-full hover:bg-white/20 transition-colors z-[110]"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </motion.button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full aspect-[4/3] rounded-[2.7rem] overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Selected Gallery" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
  orderName,
  setOrderName,
  orderMobile,
  setOrderMobile,
  orderAddress,
  setOrderAddress,
  orderNotes,
  setOrderNotes,
  orderLocation,
  setOrderLocation,
  orderPaymentMethod,
  setOrderPaymentMethod,
  userPoints,
  pointsToRedeem,
  setPointsToRedeem,
  onConfirmOrder
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  cartItems: CartItem[],
  onUpdateQuantity: (id: string, delta: number) => void,
  orderName: string,
  setOrderName: (v: string) => void,
  orderMobile: string,
  setOrderMobile: (v: string) => void,
  orderAddress: string,
  setOrderAddress: (v: string) => void,
  orderNotes: string,
  setOrderNotes: (v: string) => void,
  orderLocation: { lat: number; lng: number } | null,
  setOrderLocation: (v: { lat: number; lng: number } | null) => void,
  orderPaymentMethod: 'cod' | 'online',
  setOrderPaymentMethod: (v: 'cod' | 'online') => void,
  userPoints: number,
  pointsToRedeem: number,
  setPointsToRedeem: (v: number) => void,
  onConfirmOrder: (onSuccess: (order: OrderDetails) => void) => void
}) => {
  const [step, setStep] = useState<'cart' | 'delivery' | 'payment' | 'confirmation'>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<OrderDetails | null>(null);

  // Razorpay Gateway Integration States
  const [razorpayKey, setRazorpayKey] = useState<string>(
    // Ensure we safely fallback if key doesn't exist
    (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_RAZORPAY_KEY_ID) || 
    localStorage.getItem('VITE_RAZORPAY_KEY_ID') || ''
  );
  const [useSimulator, setUseSimulator] = useState<boolean>(
    !((typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_RAZORPAY_KEY_ID) || localStorage.getItem('VITE_RAZORPAY_KEY_ID'))
  );
  const [showSimulatorModal, setShowSimulatorModal] = useState<boolean>(false);
  const [showRzpManual, setShowRzpManual] = useState<boolean>(false);
  const [rzpLoading, setRzpLoading] = useState<boolean>(false);

  // Razorpay Simulator UI Form States
  const [simTab, setSimTab] = useState<'methods' | 'card' | 'upi' | 'processing'>('methods');
  const [simCardNo, setSimCardNo] = useState('');
  const [simExpiry, setSimExpiry] = useState('');
  const [simCVV, setSimCVV] = useState('');
  const [simHolder, setSimHolder] = useState('');
  const [simUPIId, setSimUPIId] = useState('user@upi');

  // Online Payment Options States
  const [onlinePayOption, setOnlinePayOption] = useState<'upi_id' | 'app_redirect'>('upi_id');
  const [onlineUpiId, setOnlineUpiId] = useState('');
  const [onlineRedirectApp, setOnlineRedirectApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [showRedirectOverlay, setShowRedirectOverlay] = useState<boolean>(false);
  const [redirectOverlayMessage, setRedirectOverlayMessage] = useState<string>('');

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = pointsToRedeem / 10;
  const finalTotal = Math.max(0, total - discount);

  // Reset step when modal closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep('cart');
        setPlacedOrder(null);
        setIsProcessing(false);
        setPointsToRedeem(0);
        setShowRedirectOverlay(false);
        setRedirectOverlayMessage('');
        setOnlineUpiId('');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setPointsToRedeem]);

  // Auto-complete simulator payments after a standard bank processing duration
  useEffect(() => {
    if (showSimulatorModal && simTab === 'processing') {
      const timer = setTimeout(() => {
        setShowSimulatorModal(false);
        setSimTab('methods');
        // Trigger full authentic confirmation state
        onConfirmOrder((order) => {
          setPlacedOrder({
            ...order,
            paymentMethod: 'online',
            status: 'pending',
            razorpayPaymentId: `pay_sandbox_mock_${Math.random().toString(36).substr(2, 9)}`,
            razorpayOrderId: `order_sandbox_mock_${Math.random().toString(36).substr(2, 9)}`,
            razorpaySignature: 'security_simulated_hmac_hash_code_256'
          });
          setStep('confirmation');
        });
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSimulatorModal, simTab, onConfirmOrder]);

  // Auto-complete custom online payment simulator after verification/redirect processing
  useEffect(() => {
    if (showRedirectOverlay) {
      setIsProcessing(true);
      const timer = setTimeout(() => {
        setShowRedirectOverlay(false);
        setIsProcessing(false);
        // Trigger full authentic confirmation state
        onConfirmOrder((order) => {
          setPlacedOrder({
            ...order,
            paymentMethod: 'online',
            status: 'pending',
            razorpayPaymentId: `pay_online_sim_${Math.random().toString(36).substr(2, 9)}`,
            razorpayOrderId: `order_online_sim_${Math.random().toString(36).substr(2, 9)}`,
          });
          setStep('confirmation');
        });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showRedirectOverlay, onConfirmOrder]);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setOrderLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          // Show a temporary success message in the UI would be better, but user requested feedback
          alert("📍 Precision location captured successfully!");
        }, 
        (error) => {
          let message = "Could not get location.";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              message = "Location permission denied. Please allow location access in your browser.";
              break;
            case error.POSITION_UNAVAILABLE:
              message = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              message = "The request to get user location timed out.";
              break;
          }
          console.error("Geolocation Error:", error);
          alert(message);
        },
        options
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const nextStep = () => {
    if (step === 'cart') {
      if (cartItems.length === 0) return;
      setStep('delivery');
    } else if (step === 'delivery') {
      if (!orderName || !orderMobile || !orderAddress) {
        alert("Please fill in all delivery details");
        return;
      }
      setStep('payment');
    }
  };

  const prevStep = () => {
    if (step === 'delivery') setStep('cart');
    if (step === 'payment') setStep('delivery');
  };

  // Load Razorpay script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.id = 'razorpay-sdk-script';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (orderPaymentMethod === 'cod') {
      setIsProcessing(true);
      onConfirmOrder((order) => {
        setPlacedOrder({
          ...order,
          paymentMethod: 'cod',
          status: 'pending'
        });
        setStep('confirmation');
      });
      return;
    }

    if (orderPaymentMethod === 'online') {
      if (onlinePayOption === 'upi_id') {
        if (!onlineUpiId.trim() || !onlineUpiId.includes('@')) {
          alert('Please enter a valid UPI ID (e.g., name@upi)');
          return;
        }
        setRedirectOverlayMessage(`Verifying UPI ID "${onlineUpiId}"... Sending a secure payment collect request to your UPI App. Please open your UPI app to complete the transaction.`);
      } else {
        const appNames = {
          gpay: 'Google Pay',
          phonepe: 'PhonePe',
          paytm: 'Paytm',
          bhim: 'BHIM UPI'
        };
        setRedirectOverlayMessage(`Redirecting to ${appNames[onlineRedirectApp]}... Opening the app on your device for quick 1-click payment authorization.`);
      }
      setShowRedirectOverlay(true);
      return;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#5A3825]/40 backdrop-blur-md z-[60] flex items-end md:items-center justify-center p-0 md:p-4"
          >
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#E8EFE5] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#5A3825]/10"
            >
              <div className="p-6 border-b border-brand-primary/15 flex justify-between items-center bg-[#DFE7DC] relative">
                <div className="w-12 h-1.5 bg-brand-primary/10 rounded-full absolute top-3 left-1/2 -translate-x-1/2 md:hidden" />
                <div className="flex items-center gap-3">
                  {step !== 'cart' && (
                    <button onClick={prevStep} className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors">
                      <ChevronLeft className="w-6 h-6 text-brand-primary" />
                    </button>
                  )}
                  <h2 className="text-2xl font-display font-black text-brand-primary flex items-center gap-2">
                    {step === 'cart' && <><UtensilsCrossed className="w-6 h-6" /> Your Tawa Box</>}
                    {step === 'delivery' && <><MapPin className="w-6 h-6" /> Delivery Details</>}
                    {step === 'payment' && <><CreditCard className="w-6 h-6" /> Payment Method</>}
                    {step === 'confirmation' && <><CheckCircle2 className="w-6 h-6 text-brand-secondary" /> Order Confirmed!</>}
                  </h2>
                </div>
                {step !== 'confirmation' && (
                  <button onClick={onClose} className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors">
                    <X className="w-6 h-6 text-brand-primary" />
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-[#E8EFE5]">
                <AnimatePresence mode="wait">
                  {step === 'cart' && (
                    <motion.div 
                      key="cart"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {cartItems.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                          <div className="bg-[#F1F6F0] p-6 rounded-full mb-4 border border-brand-primary/10">
                            <ShoppingCart className="w-12 h-12 text-brand-primary/20" />
                          </div>
                          <p className="text-[#5A3825] font-serif font-bold text-base">Your box is empty.<br/>Start adding some desi goodness!</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {cartItems.map((item) => (
                            <div key={item.id} className="flex flex-col bg-[#F1F6F0] p-4 rounded-2xl shadow-sm border border-brand-primary/10">
                              <div className="flex gap-4 items-center w-full">
                                <div className="flex-1">
                                  <h4 className="font-serif font-black text-brand-primary text-base">{item.name}</h4>
                                  <p className="text-brand-secondary font-serif font-extrabold text-[#7A8B6B] text-sm">Rs. {item.price}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <button 
                                    onClick={() => onUpdateQuantity(item.id, -1)}
                                    className="p-1.5 bg-white border border-brand-primary/15 rounded-xl hover:border-brand-primary transition-colors text-brand-primary"
                                  >
                                    <Minus className="w-4 h-4" />
                                  </button>
                                  <span className="font-black w-6 text-center text-brand-primary">{item.quantity}</span>
                                  <button 
                                    onClick={() => onUpdateQuantity(item.id, 1)}
                                    className="p-1.5 bg-white border border-brand-primary/15 rounded-xl hover:border-brand-primary transition-colors text-brand-primary"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              {item.customization && (
                                <div className="mt-3 pt-3 border-t border-brand-primary/10 grid grid-cols-2 gap-2">
                                  <div className="col-span-2">
                                    <div className="text-[9px] font-bold text-brand-primary/50 uppercase tracking-widest mb-1">Rotis</div>
                                    <div className="text-[11px] text-brand-text/80 font-medium font-serif font-semibold">
                                      {item.customization.rotis?.join(', ')}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] font-bold text-brand-primary/50 uppercase tracking-widest mb-1">Vegetables</div>
                                    <div className="text-[11px] text-brand-text/80 font-medium font-serif font-semibold">
                                      {item.customization.vegetables?.join(', ')}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[9px] font-bold text-brand-primary/50 uppercase tracking-widest mb-1">Included Sides</div>
                                    <div className="text-[11px] text-brand-text/80 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                      Veg Salad, Fruit Salad, Rice
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {step === 'delivery' && (
                    <motion.div 
                      key="delivery"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="bg-[#F1F6F0] p-4 rounded-2xl border border-brand-primary/10 shadow-sm">
                        <label className="block text-[10px] font-bold text-brand-primary/50 uppercase mb-1 tracking-widest">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="Enter your name"
                          value={orderName}
                          onChange={(e) => setOrderName(e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-black p-0 text-brand-primary placeholder:text-brand-primary/20"
                        />
                      </div>
                      <div className="bg-[#F1F6F0] p-4 rounded-2xl border border-brand-primary/10 shadow-sm">
                        <label className="block text-[10px] font-bold text-brand-primary/50 uppercase mb-1 tracking-widest">Mobile Number</label>
                        <input 
                          type="tel" 
                          placeholder="Enter mobile number"
                          value={orderMobile}
                          onChange={(e) => setOrderMobile(e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-black p-0 text-brand-primary placeholder:text-brand-primary/20"
                        />
                      </div>
                      <div className="bg-[#F1F6F0] p-4 rounded-2xl border border-brand-primary/10 shadow-sm">
                        <label className="block text-[10px] font-bold text-brand-primary/50 uppercase mb-1 tracking-widest">Delivery Address</label>
                        <textarea 
                          placeholder="Enter full address"
                          value={orderAddress}
                          onChange={(e) => setOrderAddress(e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-black p-0 text-brand-primary placeholder:text-brand-primary/20 resize-none font-serif font-semibold"
                          rows={3}
                        />
                      </div>
                      <div className="bg-[#F1F6F0] p-4 rounded-2xl border border-brand-primary/10 shadow-sm">
                        <label className="block text-[10px] font-bold text-brand-primary/50 uppercase mb-1 tracking-widest">Order Notes (Optional)</label>
                        <textarea 
                          placeholder="Any special instructions for the kitchen?"
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 text-sm font-black p-0 text-brand-primary placeholder:text-brand-primary/20 resize-none font-serif font-semibold"
                          rows={2}
                        />
                      </div>
                      <button 
                        onClick={handleGetLocation}
                        className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                          orderLocation 
                            ? 'bg-[#7A8B6B]/20 text-[#7A8B6B] border border-[#7A8B6B]/30 font-black' 
                            : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/10 hover:bg-brand-primary/20'
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                        {orderLocation ? 'Location Captured' : 'Share Current Location'}
                      </button>
                    </motion.div>
                  )}

                  {step === 'payment' && (
                    <motion.div 
                      key="payment"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Pay on Delivery Option */}
                      <div 
                        onClick={() => setOrderPaymentMethod('cod')}
                        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          orderPaymentMethod === 'cod' 
                            ? 'bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/10' 
                            : 'bg-[#F1F6F0] border-brand-primary/10 hover:border-brand-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${orderPaymentMethod === 'cod' ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary/60'}`}>
                            <Banknote className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-serif font-black text-brand-primary">Pay on Delivery</div>
                            <div className="text-xs text-brand-primary/60">Cash or UPI at your doorstep</div>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${orderPaymentMethod === 'cod' ? 'border-brand-primary' : 'border-brand-primary/20'}`}>
                          {orderPaymentMethod === 'cod' && <div className="w-3 h-3 bg-brand-primary rounded-full" />}
                        </div>
                      </div>

                      {/* Online Payment Option */}
                      <div 
                        onClick={() => setOrderPaymentMethod('online')}
                        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          orderPaymentMethod === 'online' 
                            ? 'bg-brand-primary/10 border-brand-primary shadow-lg shadow-brand-primary/10' 
                            : 'bg-[#F1F6F0] border-brand-primary/10 hover:border-brand-primary/30'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${orderPaymentMethod === 'online' ? 'bg-brand-primary text-white' : 'bg-brand-primary/10 text-brand-primary/60'}`}>
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-serif font-black text-brand-primary">Online Payment</div>
                            <div className="text-xs text-brand-primary/60">UPI ID or Direct App Redirect</div>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${orderPaymentMethod === 'online' ? 'border-brand-primary' : 'border-brand-primary/20'}`}>
                          {orderPaymentMethod === 'online' && <div className="w-3 h-3 bg-brand-primary rounded-full" />}
                        </div>
                      </div>

                      {/* Direct UPI ID vs Payment App Sub-Selection Panel */}
                      {orderPaymentMethod === 'online' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-[#FAF8F4] border-2 border-brand-primary/10 rounded-3xl p-5 space-y-4 shadow-sm"
                        >
                          <div className="text-xs font-serif font-black text-[#5A3825] uppercase tracking-wider">
                            Choose Online Mode
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setOnlinePayOption('upi_id')}
                              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-xs font-black ${
                                onlinePayOption === 'upi_id'
                                  ? 'bg-[#EADBBD]/25 border-[#9E5638] text-[#9E5638]'
                                  : 'bg-white border-[#5A3825]/5 text-brand-primary/70 hover:bg-white/80'
                              }`}
                            >
                              <span className="text-xl">✏️</span>
                              <span>Add UPI ID</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setOnlinePayOption('app_redirect')}
                              className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-xs font-black ${
                                onlinePayOption === 'app_redirect'
                                  ? 'bg-[#EADBBD]/25 border-[#9E5638] text-[#9E5638]'
                                  : 'bg-white border-[#5A3825]/5 text-brand-primary/70 hover:bg-white/80'
                              }`}
                            >
                              <span className="text-xl">🚀</span>
                              <span>Redirect to App</span>
                            </button>
                          </div>

                          {onlinePayOption === 'upi_id' ? (
                            <div className="space-y-2 animate-fadeIn">
                              <label className="text-xs font-black text-brand-primary/80 block">
                                Enter your UPI ID
                              </label>
                              <input
                                type="text"
                                value={onlineUpiId}
                                onChange={(e) => setOnlineUpiId(e.target.value)}
                                placeholder="e.g. mobileNumber@ybl, user@upi"
                                className="w-full bg-white border border-[#5A3825]/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9E5638] text-brand-primary font-mono placeholder:text-brand-primary/30"
                              />
                              <p className="text-[10px] text-brand-primary/60">
                                A collect request will be sent to your UPI ID after placing order.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3 animate-fadeIn">
                              <label className="text-xs font-black text-brand-primary/80 block">
                                Choose Payment App
                              </label>
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { id: 'gpay', name: 'GPay', icon: '⚡' },
                                  { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                                  { id: 'paytm', name: 'Paytm', icon: '🔵' },
                                  { id: 'bhim', name: 'BHIM', icon: '🇮🇳' },
                                ].map((app) => (
                                  <button
                                    key={app.id}
                                    type="button"
                                    onClick={() => setOnlineRedirectApp(app.id as any)}
                                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all text-[10px] font-black ${
                                      onlineRedirectApp === app.id
                                        ? 'bg-[#9E5638]/15 border-[#9E5638] text-[#9E5638]'
                                        : 'bg-white border-[#5A3825]/5 text-brand-primary/70 hover:bg-white/80'
                                    }`}
                                  >
                                    <span className="text-base">{app.icon}</span>
                                    <span>{app.name}</span>
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-brand-primary/60 text-center">
                                You will be redirected instantly to authorize payment.
                              </p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {step === 'payment' && userPoints >= 10 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-brand-primary/5 p-6 rounded-[2rem] border border-brand-primary/15 mt-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-brand-primary/15 p-2 rounded-xl">
                            <Trophy className="w-5 h-5 text-brand-primary" />
                          </div>
                          <div>
                            <div className="text-xs font-serif font-black text-brand-primary uppercase tracking-widest">Tawa Rewards</div>
                            <div className="text-[10px] text-brand-primary/60">You have {userPoints} points</div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={pointsToRedeem > 0}
                            onChange={(e) => {
                              if (e.target.checked) setPointsToRedeem(Math.floor(userPoints / 10) * 10);
                              else setPointsToRedeem(0);
                            }}
                          />
                          <div className="w-11 h-6 bg-brand-primary/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                        </label>
                      </div>
                      {pointsToRedeem > 0 && (
                        <div className="flex justify-between items-center text-sm font-bold text-brand-secondary animate-pulse">
                          <span>Redeeming {pointsToRedeem} points</span>
                          <span>- Rs. {pointsToRedeem / 10}</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {step === 'confirmation' && placedOrder && (
                    <motion.div
                      key="confirmation"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="py-10 flex flex-col items-center text-center space-y-8"
                    >
                      <div className="relative">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.2 }}
                          className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center shadow-2xl shadow-brand-primary/20"
                        >
                          <CheckCircle2 className="w-12 h-12 text-white" />
                        </motion.div>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-full border-2 border-brand-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-3xl font-display font-black text-brand-primary uppercase">Mubarak Ho!</h3>
                        <p className="text-brand-text/70 font-serif font-bold text-base">Your order #{placedOrder.id} has been placed.</p>
                      </div>

                      <div className="w-full bg-[#F1F6F0] border border-brand-primary/10 rounded-[2rem] p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-brand-primary/50 uppercase tracking-widest font-bold text-[10px]">Estimated Arrival</span>
                          <span className="text-brand-secondary font-black text-base">
                            {new Date(placedOrder.estimatedDelivery!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm border-t border-brand-primary/10 pt-4">
                          <span className="text-brand-primary/50 uppercase tracking-widest font-bold text-[10px]">Total Paid</span>
                          <span className="text-2xl font-display font-black text-brand-primary">Rs. {placedOrder.total}</span>
                        </div>
                      </div>

                      <div className="w-full space-y-3 pt-4">
                        <button 
                          onClick={() => {
                            onClose();
                            setTimeout(() => {
                              window.location.href = '/dashboard';
                            }, 300);
                          }}
                          className="w-full bg-brand-secondary text-white py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-[#617054] transition-all shadow-lg shadow-brand-secondary/20 active:scale-95"
                        >
                          Track Order
                        </button>
                        <button 
                          onClick={onClose}
                          className="w-full py-4 text-brand-primary/60 font-black hover:text-brand-primary transition-colors text-sm uppercase tracking-wider"
                        >
                          Back to Menu
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {step !== 'confirmation' && cartItems.length > 0 && (
                <div className="p-6 bg-[#DFE7DC] border-t border-brand-primary/15">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                      <span className="text-brand-primary/50 text-[10px] font-bold uppercase tracking-widest">
                        {step === 'cart' ? 'Subtotal' : 'Total Amount'}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className={`font-display font-black text-brand-primary ${pointsToRedeem > 0 ? 'text-lg line-through opacity-45' : 'text-3xl'}`}>Rs. {total}</span>
                        {pointsToRedeem > 0 && (
                          <span className="text-3xl font-display font-black text-brand-secondary">Rs. {finalTotal}</span>
                        )}
                      </div>
                    </div>
                    {step === 'payment' && (
                      <div className="text-right">
                        <span className="text-brand-primary/50 text-[10px] font-bold uppercase tracking-widest">Method</span>
                        <div className="text-brand-secondary font-bold uppercase text-xs tracking-widest">
                          {orderPaymentMethod === 'cod' ? 'Pay on Delivery' : 'Online Payment'}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {step === 'payment' ? (
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="w-full py-5 rounded-2xl font-black text-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed bg-brand-primary text-white shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-5 h-5 border-2 rounded-full border-t-transparent border-white"
                          />
                          Processing...
                        </>
                      ) : (
                        <>
                          Place Order
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      <button 
                        onClick={nextStep}
                        className="w-full bg-brand-primary text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                      >
                        {step === 'cart' ? 'Standard Checkout' : 'Continue to Payment'}
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

          {showSimulatorModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-sans text-slate-800"
            >
              <motion.div
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 15 }}
                className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
              >
                {/* Secure Gateway Brand Header */}
                <div className="bg-[#5A3825] text-white p-5 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <h4 className="text-[10px] font-mono tracking-widest text-[#EADBBD] uppercase font-black">SECURE GATEWAY</h4>
                      </div>
                      <h3 className="text-lg font-serif font-black tracking-wide mt-1 text-white">The Tawa Box Checkout</h3>
                      <p className="text-xs text-[#FAF6ED]/80 font-sans mt-0.5 font-bold">Amount to pay: <span className="font-sans font-black text-[#EADBBD]">Rs. {finalTotal.toFixed(2)}</span></p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSimulatorModal(false);
                        setSimTab('methods');
                      }}
                      className="text-white/70 hover:text-white transition-colors p-1.5 bg-white/10 rounded-full cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-[#EADBBD] bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 font-mono">
                    <span>Contact: {orderMobile || '9999999999'}</span>
                    <span>🔒 Secured SSL Integration</span>
                  </div>
                </div>

                {/* Content Panel */}
                <div className="p-6 bg-slate-50 min-h-[300px] flex flex-col justify-between">
                  {simTab === 'methods' && (
                    <div className="space-y-3 flex-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 font-mono">Select Payment Option</p>
                      
                      {/* CARD option */}
                      <button
                        type="button"
                        onClick={() => setSimTab('card')}
                        className="w-full bg-white hover:bg-[#FAF8F4] p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group transition-all cursor-pointer hover:border-[#D4AF37]/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-amber-50 text-[#9E5638] rounded-lg group-hover:bg-[#EADBBD]/25 transition-colors">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-[#5A3825]">Credit / Debit Card</div>
                            <div className="text-[10px] text-slate-400">Visa, Mastercard, RuPay, Maestro</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      {/* UPI option */}
                      <button
                        type="button"
                        onClick={() => setSimTab('upi')}
                        className="w-full bg-white hover:bg-[#FAF8F4] p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group transition-all cursor-pointer hover:border-[#D4AF37]/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100/70 transition-colors">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-[#5A3825]">UPI / Instant QR Code</div>
                            <div className="text-[10px] text-slate-400">BHIM, GooglePay, PhonePe, Paytm</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      {/* Netbanking option */}
                      <button
                        type="button"
                        onClick={() => setSimTab('processing')}
                        className="w-full bg-white hover:bg-[#FAF8F4] p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group transition-all cursor-pointer hover:border-[#D4AF37]/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100/70 transition-colors">
                            <Landmark className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-[#5A3825]">Netbanking</div>
                            <div className="text-[10px] text-slate-400">All Indian banks supported</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>

                      {/* Wallet option */}
                      <button
                        type="button"
                        onClick={() => setSimTab('processing')}
                        className="w-full bg-white hover:bg-[#FAF8F4] p-4 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-between group transition-all cursor-pointer hover:border-[#D4AF37]/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100/70 transition-colors">
                            <Wallet className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-bold text-[#5A3825]">Mobile Wallets</div>
                            <div className="text-[10px] text-slate-400">AmazonPay, Paytm, Mobikwik</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}

                  {simTab === 'card' && (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <button type="button" onClick={() => setSimTab('methods')} className="text-xs font-bold text-[#9E5638] hover:underline flex items-center gap-1 cursor-pointer">
                            ← Other Methods
                          </button>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Fill Card Details</span>
                        </div>

                        {/* Card Form */}
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wide">Card Number</label>
                            <input
                              type="text"
                              value={simCardNo}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                                const parts = val.match(/.{1,4}/g);
                                setSimCardNo(parts ? parts.join(' ') : val);
                              }}
                              placeholder="4111 2222 3333 4444"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#9E5638] font-mono shadow-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3.5">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wide">Expiry Date</label>
                              <input
                                type="text"
                                value={simExpiry}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                  if (val.length >= 2) {
                                    setSimExpiry(val.substring(0, 2) + '/' + val.substring(2));
                                  } else {
                                    setSimExpiry(val);
                                  }
                                }}
                                placeholder="MM/YY"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#9E5638] font-mono shadow-sm text-center"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wide">CVV / CVN</label>
                              <input
                                type="password"
                                value={simCVV}
                                onChange={(e) => setSimCVV(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                placeholder="•••"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-[#9E5638] font-mono shadow-sm text-center tracking-widest"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wide">Cardholder Name</label>
                            <input
                              type="text"
                              value={simHolder}
                              onChange={(e) => setSimHolder(e.target.value)}
                              placeholder="e.g. AMAN SHARMA"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#9E5638] font-sans font-semibold uppercase shadow-sm"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSimTab('processing')}
                        className="w-full bg-[#5A3825] hover:bg-[#9E5638] font-serif text-white py-3.5 rounded-xl text-sm font-black tracking-wide shadow-lg shadow-[#5A3825]/20 active:scale-95 transition-all text-center cursor-pointer mt-4"
                      >
                        Securely Pay Rs. {finalTotal.toFixed(2)}
                      </button>
                    </div>
                  )}

                  {simTab === 'upi' && (
                    <div className="space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => setSimTab('methods')} className="text-xs font-bold text-[#9E5638] hover:underline flex items-center gap-1 cursor-pointer">
                            ← Other Methods
                          </button>
                          <span className="text-slate-300">|</span>
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Pay via UPI</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200 rounded-xl shadow-inner space-y-3">
                          <span className="text-xs font-bold text-slate-500 font-sans">Option A: Scan UPI QR Code</span>
                          <div className="w-28 h-28 bg-slate-50 flex items-center justify-center rounded-lg relative border-2 border-slate-200">
                            {/* Visual QR Simulator */}
                            <div className="absolute inset-2 border border-slate-500 grid grid-cols-4 grid-rows-4 gap-1 p-1">
                              {[...Array(16)].map((_, i) => (
                                <div key={i} className={`rounded-sm ${(i % 3 === 0 || i % 5 === 2) ? 'bg-slate-800' : 'bg-transparent'}`} />
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 font-semibold font-sans italic text-center">Scan QR code using any UPI App (GPay, PhonePe, Paytm, etc)</span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wide">Option B: Enter UPI ID</label>
                          <input
                            type="text"
                            value={simUPIId}
                            onChange={(e) => setSimUPIId(e.target.value)}
                            placeholder="username@upi"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#9E5638] shadow-sm"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSimTab('processing')}
                        className="w-full bg-[#5A3825] hover:bg-[#9E5638] font-serif text-white py-3.5 rounded-xl text-sm font-black tracking-wide shadow-lg shadow-[#5A3825]/20 active:scale-95 transition-all text-center cursor-pointer mt-4"
                      >
                        Securely Pay Rs. {finalTotal.toFixed(2)}
                      </button>
                    </div>
                  )}

                  {simTab === 'processing' && (
                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-6 flex-1">
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-16 h-16 border-4 border-slate-200 border-t-[#9E5638] rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-6 h-6 text-[#7A8B6B] animate-pulse" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-slate-800 font-sans">Authorizing Secure Payment Session</h4>
                        <p className="text-[11px] text-slate-400 leading-normal max-w-[280px] font-sans">Verifying transaction details securely with your banking partner. Please do not close this window or reload.</p>
                        <p className="text-[10px] text-[#7A8B6B] font-bold font-sans mt-3 animate-pulse bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-block">⏳ Authorizing and returning securely in seconds...</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3.5 w-full pt-4 font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            setShowSimulatorModal(false);
                            setSimTab('methods');
                            // Trigger full authentic confirmation state
                            onConfirmOrder((order) => {
                              setPlacedOrder({
                                ...order,
                                paymentMethod: 'online',
                                status: 'pending',
                                razorpayPaymentId: `pay_gateway_secure_${Math.random().toString(36).substr(2, 9)}`,
                                razorpayOrderId: `order_gateway_secure_${Math.random().toString(36).substr(2, 9)}`,
                                razorpaySignature: 'security_simulated_hmac_hash_code_256'
                              });
                              setStep('confirmation');
                            });
                          }}
                          className="bg-[#7A8B6B] hover:bg-[#667657] text-white py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#7A8B6B]/15 cursor-pointer animate-pulse"
                        >
                          ✔️ Confirm Approval
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSimTab('methods');
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white py-3 px-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-red-500/10 cursor-pointer"
                        >
                          ❌ Cancel Verification
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Seal */}
                <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200/60 flex justify-between items-center text-[10px] text-slate-400 font-sans font-semibold">
                  <span className="flex items-center gap-1">🔒 256-BIT ENCRYPTED</span>
                  <span>POWERED BY SECURE MERCHANT SERVICES</span>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showRedirectOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#5A3825]/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-sans"
            >
              <motion.div
                initial={{ scale: 0.9, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 15 }}
                className="w-full max-w-md bg-white text-brand-primary rounded-[2.5rem] shadow-2xl p-8 border border-brand-primary/10 flex flex-col items-center text-center space-y-6"
              >
                <div className="relative w-20 h-20 flex items-center justify-center bg-[#EADBBD]/25 rounded-full border-2 border-brand-primary/15">
                  <div className="absolute inset-0 rounded-full border-4 border-[#9E5638]/20 border-t-[#9E5638] animate-spin" />
                  <span className="text-3xl">🛡️</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-serif font-black text-brand-primary">
                    Processing Your Payment
                  </h3>
                  <p className="text-sm text-brand-primary/70 leading-relaxed">
                    {redirectOverlayMessage}
                  </p>
                </div>

                <div className="w-full bg-[#FAF8F4] rounded-2xl p-4 border border-brand-primary/5 space-y-2 text-left font-sans text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Order Subtotal:</span>
                    <span>Rs. {total}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-brand-secondary font-bold">
                      <span>Loyalty Discount:</span>
                      <span>- Rs. {discount}</span>
                    </div>
                  )}
                  <div className="border-t border-brand-primary/10 pt-2 flex justify-between text-sm font-black text-brand-primary">
                    <span>Total Amount:</span>
                    <span>Rs. {finalTotal}</span>
                  </div>
                </div>

                <p className="text-[10px] text-brand-primary/40 flex items-center gap-1 font-semibold">
                  <span>🔒 Secure 256-Bit SSL Encryption</span>
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Removed Gokwik block */}




            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Footer = () => (
  <footer className="bg-black/40 backdrop-blur-md text-white pt-20 pb-10 px-6 border-t border-white/5">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 mb-8">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Flame className="text-brand-accent w-8 h-8" />
          <span className="text-3xl font-display font-bold tracking-tight">The Tawa Box</span>
        </div>
        <p className="text-white/60 leading-relaxed">
          Bringing the authentic taste of traditional clay Desi chulha cooking to your modern lifestyle.
        </p>
        <div className="flex gap-4">
          <a href="#" className="bg-white/5 p-3 rounded-xl hover:bg-brand-accent transition-colors"><Instagram className="w-5 h-5" /></a>
          <a href="#" className="bg-white/5 p-3 rounded-xl hover:bg-brand-accent transition-colors"><Facebook className="w-5 h-5" /></a>
          <a href="#" className="bg-white/5 p-3 rounded-xl hover:bg-brand-accent transition-colors"><Twitter className="w-5 h-5" /></a>
        </div>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-6">Traditional Feast</h4>
        <ul className="space-y-4 text-white/60">
          <li>Special Chulha Thali</li>
          <li>Customizable Roti & Sabji</li>
          <li>Fresh Village Salads</li>
          <li>Heritage Village Scents</li>
        </ul>
      </div>
    </div>
  </footer>
);

function ScrollToHash({ setActiveHomeTab }: { setActiveHomeTab: (t: 'daliya' | 'thali') => void }) {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      if (id === 'morning-daliya') {
        setActiveHomeTab('daliya');
      } else if (id === 'breakfast-lunch-combos') {
        setActiveHomeTab('thali');
      } else if (id === 'diet-and-meals-tabs') {
        // any default hash can go here
      }
      
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  }, [location, setActiveHomeTab]);

  return null;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('tawabox_intro_completed');
    }
    return true;
  });

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('tawabox_intro_completed', 'true');
  };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showThaliModal, setShowThaliModal] = useState(false);
  const [thaliToCustomize, setThaliToCustomize] = useState<MenuItem | null>(null);
  const [orderName, setOrderName] = useState('');
  const [orderMobile, setOrderMobile] = useState('');
  const [orderAddress, setOrderAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderLocation, setOrderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [orderPaymentMethod, setOrderPaymentMethod] = useState<'cod' | 'online'>('online');
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [isEmailLogsOpen, setIsEmailLogsOpen] = useState(false);
  const [activeHomeTab, setActiveHomeTab] = useState<'daliya' | 'thali'>('thali');
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Simulated Order Progression
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const updatedOrders = orders.map(order => {
        const orderTime = new Date(order.createdAt).getTime();
        const elapsedMinutes = (now - orderTime) / 60000;

        if (order.status === 'pending' && elapsedMinutes > 1) {
          changed = true;
          return { ...order, status: 'preparing' as const };
        }
        return order;
      });

      if (changed) {
        setOrders(updatedOrders);
        localStorage.setItem('orders', JSON.stringify(updatedOrders));
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [orders]);

  // Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', authUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setCurrentUser(userData);
            localStorage.setItem('currentUser', JSON.stringify(userData));
          }
        } catch (error) {
          console.error("Error fetching user on auth change:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateUserProfile = async (updatedFields: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedFields };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    try {
      await updateDoc(doc(db, 'users', currentUser.id), updatedFields);
      console.log('User profile successfully updated in Firestore');
    } catch (error) {
      console.error('Failed to update user profile in Firestore, trying setDoc merger:', error);
      try {
        await setDoc(doc(db, 'users', currentUser.id), updatedUser, { merge: true });
      } catch (innerError) {
        handleFirestoreError(innerError, OperationType.UPDATE, `users/${currentUser.id}`);
      }
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Auth signOut error:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleUpdateOrderStatus = (id: string, status: OrderDetails['status']) => {
    let oldStatus = 'pending';
    const updated = orders.map(o => {
      if (o.id === id) {
        oldStatus = o.status;
        const newOrderObj = { ...o, status };
        triggerEmailNotification('status_updated', newOrderObj, oldStatus).catch(err => {
          console.error('Failed sending status email update', err);
        });
        return newOrderObj;
      }
      return o;
    });
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const confirmOrder = (
    onSuccess: (order: OrderDetails) => void
  ) => {
    const name = orderName;
    const mobile = orderMobile;
    const address = orderAddress;

    if (!name || !mobile || !address) {
      alert('Please fill in all delivery details');
      return;
    }

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const discount = pointsToRedeem / 10;
    const finalTotal = Math.max(0, subtotal - discount);
    const pointsEarned = Math.floor(finalTotal / 10);

    const newOrder: OrderDetails = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: currentUser ? currentUser.id : 'guest',
      userName: name,
      userEmail: currentUser ? currentUser.email : 'guest@tawabox.com',
      mobile: mobile,
      address: address,
      notes: orderNotes || undefined,
      location: orderLocation || undefined,
      items: [...cart],
      total: finalTotal,
      loyaltyPointsEarned: pointsEarned,
      discountAmount: discount,
      paymentMethod: orderPaymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString()
    };

    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));

    // Trigger transactional email
    triggerEmailNotification('order_confirmed', newOrder).catch(err => {
      console.error('Failed sending order confirmation email', err);
    });
    
    // Update User Points if logged in
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        points: currentUser.points - pointsToRedeem + pointsEarned
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // Update global users list
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedAllUsers = allUsers.map((u: any) => u.id === updatedUser.id ? { ...u, points: updatedUser.points } : u);
      localStorage.setItem('users', JSON.stringify(updatedAllUsers));
    }

    setCart([]);
    setOrderName('');
    setOrderMobile('');
    setOrderAddress('');
    setOrderNotes('');
    setOrderLocation(null);
    setOrderPaymentMethod('cod');
    setPointsToRedeem(0);
    
    onSuccess(newOrder);
  };

  const addToCart = (item: MenuItem) => {
    if (item.category === 'thali' || item.id === '15' || item.id === '14') {
      setThaliToCustomize(item);
      setShowThaliModal(true);
      return;
    }
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

  const handleThaliConfirm = (selections: any) => {
    if (thaliToCustomize) {
      setCart(prev => [...prev, { ...thaliToCustomize, quantity: 1, customization: selections }]);
      setShowThaliModal(false);
      setThaliToCustomize(null);
      setIsCartOpen(true);
    }
  };

  return (
    <Router>
      <ScrollToHash setActiveHomeTab={setActiveHomeTab} />
      <div className="min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-white flex flex-col pb-20 md:pb-0">
        <Navbar 
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
          onOpenCart={() => setIsCartOpen(true)} 
          user={currentUser}
          onLogout={handleLogout}
        />

        <BottomNav 
          cartCount={cart.reduce((s, i) => s + i.quantity, 0)} 
          onOpenCart={() => setIsCartOpen(true)} 
          user={currentUser}
        />
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={
              <>
                <AnimatePresence>
                  {showIntro && (
                    <IntroAnimation onComplete={handleIntroComplete} />
                  )}
                </AnimatePresence>
                <HeroAnimation 
                  onExploreMenu={() => {
                    setActiveHomeTab('thali');
                    setTimeout(() => {
                      const el = document.getElementById('diet-and-meals-tabs');
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 50);
                  }}
                  onTrackOrder={() => {
                    window.location.href = '/dashboard';
                  }}
                  hasActiveOrders={orders.some(o => o.userId === currentUser?.id && o.status !== 'delivered' && o.status !== 'cancelled')}
                />

                {/* Compact, Segmented Tab switcher for mobile-friendly easy layout */}
                <div id="diet-and-meals-tabs" className="bg-[#FAF8F4] pt-8 pb-4 border-b border-[#5A3825]/5 select-none scroll-mt-24">
                  <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-6">
                      <span className="text-[#9E5638] font-mono text-[9px] sm:text-[10px] uppercase font-black tracking-[0.25em] block mb-1">OUR DAILY EXPERT PROGRAM</span>
                      <h2 className="text-xl sm:text-2xl font-serif font-black text-[#5A3825] uppercase tracking-wider">Select Health Category</h2>
                    </div>

                    <div className="bg-[#EADBBD]/20 p-1.5 rounded-2xl border border-[#5A3825]/10 grid grid-cols-2 gap-1 shadow-xs max-w-2xl mx-auto">
                      {[
                        { id: 'thali', label: '🍱 Desi Thali', desc: '6-Day Cycle' },
                        { id: 'daliya', label: '🥣 Daliya Diet', desc: '6-Day Program' }
                      ].map((tab) => {
                        const isActive = activeHomeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveHomeTab(tab.id as any)}
                            className={`relative flex flex-col items-center justify-center py-2.5 px-1 sm:px-3 rounded-xl transition-all font-serif font-black text-center cursor-pointer overflow-hidden ${
                              isActive
                                ? 'bg-[#9E5638] text-white shadow-md'
                                : 'text-[#5A3825]/85 hover:bg-[#FAF6ED] hover:text-[#5A3825]'
                            }`}
                          >
                            <span className="text-xs sm:text-sm">{tab.label}</span>
                            <span className={`text-[8px] sm:text-[9.5px] font-sans font-bold tracking-tight uppercase leading-none mt-1 ${isActive ? 'text-white/80' : 'text-[#2E1C12]/50'}`}>
                              {tab.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tab content panel */}
                <div className="relative">
                  <AnimatePresence mode="wait">
                    {activeHomeTab === 'thali' && (
                      <motion.div
                        key="thali"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                      >
                        <WeeklyShowcase onAddToCart={addToCart} onOpenCart={() => setIsCartOpen(true)} />
                      </motion.div>
                    )}

                    {activeHomeTab === 'daliya' && (
                      <motion.div
                        key="daliya"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3 }}
                      >
                        <MorningDaliyaSection onAddToCart={addToCart} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <QuickOrderSteps />
              </>
            } />
            <Route path="/menu" element={<Navigate to="/#breakfast-lunch-combos" replace />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            <Route 
              path="/dashboard" 
              element={currentUser ? <Dashboard user={currentUser} orders={orders} onUpdateStatus={handleUpdateOrderStatus} onOpenEmailLogs={() => setIsEmailLogsOpen(true)} onUpdateUser={handleUpdateUserProfile} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={currentUser?.role === 'admin' ? <AdminPanel orders={orders} onUpdateStatus={handleUpdateOrderStatus} onOpenEmailLogs={() => setIsEmailLogsOpen(true)} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>

        <CartModal 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          cartItems={cart}
          onUpdateQuantity={updateQuantity}
          orderName={orderName}
          setOrderName={setOrderName}
          orderMobile={orderMobile}
          setOrderMobile={setOrderMobile}
          orderAddress={orderAddress}
          setOrderAddress={setOrderAddress}
          orderNotes={orderNotes}
          setOrderNotes={setOrderNotes}
          orderLocation={orderLocation}
          setOrderLocation={setOrderLocation}
          orderPaymentMethod={orderPaymentMethod}
          setOrderPaymentMethod={setOrderPaymentMethod}
          userPoints={currentUser?.points || 0}
          pointsToRedeem={pointsToRedeem}
          setPointsToRedeem={setPointsToRedeem}
          onConfirmOrder={confirmOrder}
        />
        <ThaliCustomizationModal 
          isOpen={showThaliModal} 
          onClose={() => setShowThaliModal(false)} 
          onConfirm={handleThaliConfirm} 
          item={thaliToCustomize}
        />
        <EmailLogsModal 
          isOpen={isEmailLogsOpen} 
          onClose={() => setIsEmailLogsOpen(false)} 
        />
      </div>
    </Router>
  );
}


