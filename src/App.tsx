import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Clock, Calendar, ChevronRight, Plus, Minus, X, UtensilsCrossed, Flame, Instagram, Facebook, Twitter, Mail, Phone, MapPin, Send, Star, Leaf } from 'lucide-react';
import { MenuItem, CartItem } from './types';

// --- Mock Data ---
const MENU_ITEMS: MenuItem[] = [
  { id: '1', name: 'Chulha Roti (Plain)', description: 'Hand-rolled roti cooked on traditional clay stove.', price: 15, category: 'roti', image: '' },
  { id: '2', name: 'Ghee Wali Roti', description: 'Smoky chulha roti brushed with pure desi ghee.', price: 20, category: 'roti', image: '' },
  { id: '3', name: 'Bajra Rotla', description: 'Nutritious pearl millet flatbread, earthy and rustic.', price: 30, category: 'roti', image: '' },
  { id: '4', name: 'Makki di Roti', description: 'Traditional corn flour bread, perfect with saag.', price: 35, category: 'roti', image: '' },
  { id: '5', name: 'Missi Roti', description: 'Gram flour and wheat bread with spices and herbs.', price: 25, category: 'roti', image: '' },
  { id: '6', name: 'Aloo Paratha', description: 'Stuffed with spiced mashed potatoes, tawa toasted.', price: 60, category: 'paratha', image: '' },
  { id: '7', name: 'Paneer Paratha', description: 'Grated paneer with green chilies and coriander.', price: 80, category: 'paratha', image: '' },
  { id: '8', name: 'Sarson da Saag Combo', description: '2 Makki Rotis served with authentic mustard greens.', price: 150, category: 'combo', image: '' },
  { id: '9', name: 'Dal Makhani Combo', description: '2 Chulha Rotis with slow-cooked black lentils.', price: 140, category: 'combo', image: '' },
  { id: '10', name: 'Baingan Bharta Combo', description: '2 Bajra Rotlas with fire-roasted eggplant mash.', price: 130, category: 'combo', image: '' },
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

const Navbar = ({ cartCount, onOpenCart }: { cartCount: number, onOpenCart: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-brand-bg/90 backdrop-blur-xl border-b border-brand-primary/10 shadow-sm">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-brand-primary p-2 rounded-lg group-hover:rotate-12 transition-transform">
          <Flame className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-display font-bold text-brand-primary tracking-tight">The Tawa Box</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8">
        {[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
          { name: 'Gallery', path: '/gallery' },
          { name: 'Contact', path: '/contact' },
        ].map((link) => (
          <Link 
            key={link.path}
            to={link.path}
            className={`font-medium transition-colors hover:text-brand-accent ${isActive(link.path) ? 'text-brand-accent' : 'text-brand-primary'}`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <button 
        onClick={onOpenCart}
        className="relative p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all text-brand-primary"
      >
        <ShoppingCart className="w-6 h-6" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {cartCount}
          </span>
        )}
      </button>
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
    </section>
  );
};

const MenuSection = ({ onAddToCart, onUpdateQuantity, cart }: { 
  onAddToCart: (item: MenuItem) => void, 
  onUpdateQuantity: (id: string, delta: number) => void,
  cart: CartItem[]
}) => {
  return (
    <div className="pb-20 px-6 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h2 className="text-4xl font-display font-bold text-brand-primary mb-8 text-center">Curate Your Box</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MENU_ITEMS.map((item, idx) => {
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
                    <h3 className="text-lg font-bold text-brand-primary leading-tight">{item.name}</h3>
                    <span className="text-brand-secondary font-bold whitespace-nowrap ml-2">₹{item.price}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-4 line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-center justify-between bg-brand-primary/5 rounded-2xl p-1.5 mt-auto">
                  <button 
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    disabled={quantity === 0}
                    className={`p-2.5 rounded-xl shadow-sm transition-all ${
                      quantity === 0 
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                        : 'bg-white text-brand-primary hover:bg-brand-primary hover:text-white'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <div className="flex flex-col items-center px-4">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Qty</span>
                    <span className={`font-black text-lg leading-none ${quantity > 0 ? 'text-brand-primary' : 'text-gray-300'}`}>
                      {quantity}
                    </span>
                  </div>

                  <button 
                    onClick={() => {
                      if (quantity === 0) onAddToCart(item);
                      else onUpdateQuantity(item.id, 1);
                    }}
                    className="p-2.5 bg-white text-brand-primary rounded-xl shadow-sm hover:bg-brand-primary hover:text-white transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

const TestimonialsSection = () => (
  <div className="pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-display font-bold text-brand-primary mb-4">What Our Foodies Say</h2>
      <p className="text-gray-500">Real stories from people who love authentic desi flavors.</p>
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
            <p className="text-gray-600 italic mb-6 leading-relaxed text-xs">"{t.comment}"</p>
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
        <p className="text-gray-600 mb-12 text-lg">Have questions about our menu, bulk orders, or just want to say hello? We'd love to hear from you.</p>
        
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="bg-brand-primary/10 p-4 rounded-2xl">
              <Phone className="text-brand-primary w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">Call Us</div>
              <div className="text-xl font-bold text-brand-primary">+91 98765 43210</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-brand-primary/10 p-4 rounded-2xl">
              <Mail className="text-brand-primary w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">Email Us</div>
              <div className="text-xl font-bold text-brand-primary">hello@thetawabox.com</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-brand-primary/10 p-4 rounded-2xl">
              <MapPin className="text-brand-primary w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">Visit Us</div>
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
              <input type="text" className="w-full bg-white/50 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-primary ml-1">Email Address</label>
              <input type="email" className="w-full bg-white/50 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all" placeholder="john@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-primary ml-1">Message</label>
            <textarea rows={4} className="w-full bg-white/50 border border-brand-primary/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-primary outline-none transition-all resize-none" placeholder="Tell us what's on your mind..."></textarea>
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
  setOrderTime
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  cartItems: CartItem[],
  onUpdateQuantity: (id: string, delta: number) => void,
  orderDate: string,
  setOrderDate: (v: string) => void,
  orderTime: string,
  setOrderTime: (v: string) => void
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
              className="w-full max-w-lg bg-brand-bg rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-brand-primary/10 flex justify-between items-center bg-white/50">
                <h2 className="text-2xl font-display font-bold text-brand-primary flex items-center gap-2">
                  <UtensilsCrossed className="w-6 h-6" />
                  Your Tawa Box
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {cartItems.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                      <ShoppingCart className="w-12 h-12 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">Your box is empty.<br/>Start adding some desi goodness!</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-brand-primary/5">
                          <div className="flex-1">
                            <h4 className="font-bold text-brand-primary">{item.name}</h4>
                            <p className="text-brand-secondary font-bold">₹{item.price}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-brand-primary transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold w-6 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="p-1.5 bg-gray-50 border border-gray-200 rounded-xl hover:border-brand-primary transition-colors"
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
                        <div className="bg-white p-4 rounded-2xl border border-brand-primary/5 shadow-sm">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Date</label>
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-brand-secondary" />
                            <input 
                              type="date" 
                              value={orderDate}
                              onChange={(e) => setOrderDate(e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold p-0 text-brand-primary"
                            />
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-brand-primary/5 shadow-sm">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Time</label>
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-brand-secondary" />
                            <input 
                              type="time" 
                              value={orderTime}
                              onChange={(e) => setOrderTime(e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold p-0 text-brand-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="p-6 bg-white border-t border-brand-primary/10">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-medium">Total Amount</span>
                    <span className="text-3xl font-display font-black text-brand-primary">₹{total}</span>
                  </div>
                  <button className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:bg-brand-secondary transition-all active:scale-[0.98]">
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
  <footer className="bg-brand-primary text-white pt-20 pb-10 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Flame className="text-brand-accent w-8 h-8" />
          <span className="text-3xl font-display font-bold tracking-tight">The Tawa Box</span>
        </div>
        <p className="text-white/70 leading-relaxed">
          Bringing the authentic taste of traditional clay stove cooking to your modern lifestyle.
        </p>
        <div className="flex gap-4">
          <a href="#" className="bg-white/10 p-3 rounded-xl hover:bg-brand-accent transition-colors"><Instagram className="w-5 h-5" /></a>
          <a href="#" className="bg-white/10 p-3 rounded-xl hover:bg-brand-accent transition-colors"><Facebook className="w-5 h-5" /></a>
          <a href="#" className="bg-white/10 p-3 rounded-xl hover:bg-brand-accent transition-colors"><Twitter className="w-5 h-5" /></a>
        </div>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-6">Quick Links</h4>
        <ul className="space-y-4 text-white/70">
          <li><Link to="/" className="hover:text-brand-accent transition-colors">Home</Link></li>
          <li><Link to="/about" className="hover:text-brand-accent transition-colors">About Us</Link></li>
          <li><Link to="/gallery" className="hover:text-brand-accent transition-colors">Gallery</Link></li>
          <li><Link to="/contact" className="hover:text-brand-accent transition-colors">Contact</Link></li>
        </ul>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-6">Our Menu</h4>
        <ul className="space-y-4 text-white/70">
          <li>Plain Chulha Roti</li>
          <li>Ghee Wali Roti</li>
          <li>Bajra Rotla</li>
          <li>Makki di Roti</li>
        </ul>
      </div>
      
      <div>
        <h4 className="text-xl font-bold mb-6">Newsletter</h4>
        <p className="text-white/70 mb-6">Subscribe to get updates on seasonal specials.</p>
        <div className="flex gap-2">
          <input type="email" placeholder="Email" className="bg-white/10 border border-white/20 rounded-xl px-4 py-2 outline-none flex-1 focus:border-brand-accent" />
          <button className="bg-brand-accent px-4 py-2 rounded-xl font-bold">Join</button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center text-white/50 text-sm">
      © 2026 The Tawa Box. All rights reserved.
    </div>
  </footer>
);

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderDate, setOrderDate] = useState('');
  const [orderTime, setOrderTime] = useState('');
  
  const menuRef = useRef<HTMLDivElement>(null);

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

  const scrollToMenu = () => {
    if (window.location.pathname !== '/') {
      window.location.href = '/#menu';
    } else {
      menuRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-brand-bg selection:bg-brand-accent selection:text-white flex flex-col">
        <Navbar cartCount={cart.reduce((s, i) => s + i.quantity, 0)} onOpenCart={() => setIsCartOpen(true)} />
        
        <div className="flex-1">
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <div ref={menuRef} id="menu">
                  <MenuSection 
                    onAddToCart={addToCart} 
                    onUpdateQuantity={updateQuantity}
                    cart={cart}
                  />
                </div>
                <TestimonialsSection />
              </>
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
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
        />
      </div>
    </Router>
  );
}


