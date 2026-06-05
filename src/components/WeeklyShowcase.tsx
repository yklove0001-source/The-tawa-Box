import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Clock, ShoppingCart, Check, Heart, ShieldCheck, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { MenuItem } from '../types';

interface DayMenu {
  id: string;
  day: string;
  label: string;
  title: string;
  tagline: string;
  description: string;
  image: string;
  items: string[];
}

const WEEK_PLAN: DayMenu[] = [
  {
    id: "sub-mon",
    day: "Monday",
    label: "MON",
    title: "Panchmel Dal & Chulha Bati",
    tagline: "Slow wood-baked golden Batis soaked in pure cow ghee",
    description: "Experience the pride of authentic Rajasthan. Whole-wheat flour batis charcoal-roasted in traditional mud hearths, cracked open, soaked in pure cow ghee, and served with five-lentil Panchmel Dal, sweet jaggery-infused Churma, garlic-chili paste, and salted buttermilk.",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=600",
    items: ["2x Heavy Charcoal Batis", "Panchmel Ghee Dal", "Spicy Garlic-Chili Chutney", "Organic Jaggery Churma", "Fresh Salted Buttermilk"]
  },
  {
    id: "sub-tue",
    day: "Tuesday",
    label: "TUE",
    title: "Amritsari Choli-Kulche Feast",
    tagline: "Robust dark-chana gravy paired with wood-oven breads",
    description: "Direct from the clay ovens of Punjab. Overnight-simmered black chickpeas loaded with 15 hand-ground roasted spices, served with fresh warm coriander butter-brushed kulchas, tangy pickled green chilies, dynamic red onions, and sweet milk lassi.",
    image: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&q=80&w=600",
    items: ["2x Hot Butter Kulchas", "Pindi Chole-Chana", "Pickled Green Chilies & Onions", "Home-churned Mint Chutney", "Thick Sweet Lassi Glass"]
  },
  {
    id: "sub-wed",
    day: "Wednesday",
    label: "WED",
    title: "Sarson Saag & Makki di Roti",
    tagline: "Clay-pot boiled mustard greens with stone-ground maize flatbreads",
    description: "The sweet aroma of winter harvest fields. Churned mustard and spinach greens cooked for 6 hours in mud vessels with fresh white butter, served with hand-patted Makki flatbreads, organic jaggery chunks, and rich mango pickle.",
    image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&q=80&w=600",
    items: ["2x Hand-Patted Makki Rotis", "Slow-churned Sarson Saag", "White Cow Butter Cube", "Desi Organic Gur (Jaggery)", "Tangy Mango Pickle"]
  },
  {
    id: "sub-thu",
    day: "Thursday",
    title: "Shahi Paneer & Fire Paratha",
    label: "THU",
    tagline: "Soft cottage cheese in velvet-smooth almond gravy with layered wheat breads",
    description: "A royal treat cooked purely on dry wood embers. Fresh paneer cottage cheese blocks simmered in rich gravy of cashews, tomatoes, and cardamom. Served with multi-layered fire-grilled paratha brushed with butter, mint cumin raita, and soft hot gulab jamun.",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600",
    items: ["2x Layered Tawa Parathas", "Shahi Paneer Butter Gravy", "Cumin Rice Bowl", "Jeera Mint Raita", "Hot Ghee Gulab Jamun (1pc)"]
  },
  {
    id: "sub-fri",
    day: "Friday",
    label: "FRI",
    title: "Kathiawadi Bajra & Sev Tamatar",
    tagline: "Spicy red tomato stew with hot iron-dense pearl-millet flatbreads",
    description: "Vibrant and rustic heritage recipes from Kathiawar. Spicy sweet tomato chunks cooked with fresh crispy garlic sev, paired with thick, charcoal-charred hand-patted pearl-millet Bajra Rotlas, green garlic mint spread, and deep-fried curd chilies.",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=600",
    items: ["2x Charcoal Bajra Rotlas", "Kathiawadi Sev Tamatar Sabji", "Spiced Green Garlic Paste", "Fried Curd Chilies", "Matka Chhach (Cold buttermilk)"]
  },
  {
    id: "sub-sat",
    day: "Saturday",
    label: "SAT",
    title: "Chulha Biryani & Butter Roti",
    tagline: "Aromatic slow-fire clay-vessel layered basmati feast",
    description: "Our weekend crown jewel. Fragrant, select long-grain Basmati rice loaded with fresh garden vegetables, yogurt, and saffron strands, slow dum-cooked in sealed clay pots for hours over dying wood embers. Served with soft home-styled buttered tawa rotis and double-tadka dal.",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600",
    items: ["Slow-cooked Dum Biryani Bowl", "2x Soft Butter Tawa Rotis", "Double-Tadka Pancharatan Dal", "Spicy Mix Veg Raita", "Sweet Beetroot Halwa"]
  }
];

interface WeeklyShowcaseProps {
  onAddToCart: (item: MenuItem) => void;
  onOpenCart?: () => void;
}

export const WeeklyShowcase = ({ onAddToCart, onOpenCart }: WeeklyShowcaseProps) => {
  // Determine which day it is today (Monday-Saturday) to highlight
  const getTodayIdx = () => {
    const day = new Date().getDay(); // 0 is Sun, 1 is Mon, 2 is Tue ...
    if (day === 0) return 0; // Fallback Sunday to Monday
    return day - 1;
  };

  const [activeIdx, setActiveIdx] = useState<number>(getTodayIdx());
  const activeDay = WEEK_PLAN[activeIdx];

  // Carousel slider indices
  const otherDays = WEEK_PLAN.filter((_, idx) => idx !== activeIdx);

  // Quick notification banner when added
  const [successMsg, setSuccessMsg] = useState<string>('');

  const triggerNotify = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const container = document.getElementById('day-carousel-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -180 : 180;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddTrial = () => {
    onAddToCart({
      id: `trial-${activeDay.id}`,
      name: `1-Day Trial Meal (${activeDay.day}: ${activeDay.title})`,
      price: 249,
      description: `Single ultra-premium trial thali of ${activeDay.title} curated with organic hand-churned ghee and live clay baking. Delivered in insulated heat-cases.`,
      image: activeDay.image,
      category: 'subscription'
    });
    triggerNotify(`Added ${activeDay.day}'s Trial Meal to your Cart!`);
    if (onOpenCart) setTimeout(onOpenCart, 600);
  };

  const handleAddWeekly = () => {
    onAddToCart({
      id: `weekly-sub-6`,
      name: '6-Meal Weekly Subscription (Mon-Sat)',
      price: 1260,
      description: 'Subscribe to a 6-day premium cycle of fresh, wood-fired hot thalis. Includes premium packaging and free organic desserts.',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&q=80&w=200',
      category: 'subscription'
    });
    triggerNotify('6-Meal Weekly Subscription added to your Cart!');
    if (onOpenCart) setTimeout(onOpenCart, 600);
  };

  const handleAddMonthly = () => {
    onAddToCart({
      id: `monthly-sub-24`,
      name: '24-Meal Monthly Subscription (24 Days)',
      price: 4500,
      description: 'The ultimate royal subscription plan. 24 premium meals with fully customisable options, VIP delivery, and unlimited subscription adjustments.',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=200',
      category: 'subscription'
    });
    triggerNotify('24-Meal Monthly Subscription added to your Cart!');
    if (onOpenCart) setTimeout(onOpenCart, 600);
  };

  return (
    <section className="py-12 bg-[#E8EFE5] border-b border-[#5A3825]/15 relative overflow-hidden select-none">
      {/* Decorative grain accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#EADBBD]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#7A8B6B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* SECTION HEADER ALIGNED WITH BRAND RICH DESI AESTHETICS */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EADBBD]/20 rounded-full border border-[#D4AF37]/20 text-[#9E5638] uppercase text-[10px] tracking-[0.2em] font-mono font-bold mb-3 shadow-sm select-none">
            <Flame className="w-3.5 h-3.5 text-[#9E5638] animate-pulse" />
            6-Day Traditional Mud-Hearth Cycles
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-[#5A3825] uppercase tracking-wide">
            Our Desi Hearth Subscriptions
          </h2>
          <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto mt-2 mb-3" />
          <p className="text-xs sm:text-sm text-[#5A3825]/70 font-medium max-w-2xl mx-auto leading-relaxed">
            Sustain your health with our varying 6-day cycle cooked on traditional live clay stoves (mud chulhas). Order a single day trial, save 10% on weekly plans, or save 20% on monthly packs!
          </p>
        </div>

        {/* --- MAIN ENTRANCE FEATURE BLOCK WITH ANIMATION ON TRANSITION --- */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 border border-[#5A3825]/5 shadow-[0_12px_40px_rgba(90,56,37,0.04)] mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* LEFT AREA: MAIN VISUAL THALI WITH ACTIVE ENTERING MOTION ANIMATION */}
            <div className="lg:col-span-6 relative flex flex-col items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, scale: 0.94, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -15 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full relative aspect-[4/3] rounded-[18px] overflow-hidden border-4 border-[#F4F1EA] shadow-xl group cursor-pointer"
                >
                  <img 
                    src={activeDay.image} 
                    alt={activeDay.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle vignette layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                  
                  {/* Glowing tag on active day */}
                  <div className="absolute top-4 left-4 bg-[#9E5638] text-[#FAF6ED] font-mono text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-[#D4AF37]/35 shadow-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-spin" style={{ animationDuration: '4s' }} />
                    {activeDay.day}'s Masterpiece
                  </div>

                  {/* Absolute bottom layout showing Day text overlay */}
                  <div className="absolute bottom-5 left-5 right-5 text-left text-white">
                    <p className="text-[10px] tracking-[0.2em] font-mono uppercase text-[#D4AF37] font-black">{activeDay.tagline}</p>
                    <h3 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-wide mt-1 text-[#FAF6ED]">{activeDay.title}</h3>
                  </div>

                  {/* Steam Float Effect */}
                  <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
                    <motion.div
                      animate={{
                        y: [0, -40, -80],
                        opacity: [0, 1, 0],
                        x: [0, 10, -10]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      className="absolute bottom-16 left-1/3 w-3 h-12 bg-white/20 blur-md rounded-full origin-bottom transform rotate-12"
                    />
                    <motion.div
                      animate={{
                        y: [0, -50, -100],
                        opacity: [0, 0.8, 0],
                        x: [0, -15, 15]
                      }}
                      transition={{ duration: 4.8, repeat: Infinity, ease: 'linear', delay: 1.5 }}
                      className="absolute bottom-20 left-2/3 w-4 h-16 bg-white/20 blur-md rounded-full origin-bottom"
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* --- INTEGRATED DAY ICON MENU DIRECTLY BELOW MAIN IMAGE --- */}
              <div className="mt-4 w-full">
                <p className="text-center font-mono text-[9px] tracking-[0.2em] uppercase text-[#5A3825]/45 font-black mb-3">
                  👈 Slide or tap to browse the daily thali cycle 👉
                </p>
                <div className="relative flex items-center px-6">
                  {/* Left Scroll Button */}
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="absolute left-0 z-20 bg-white hover:bg-[#FAF8F4] text-[#9E5638] border border-[#5A3825]/15 p-1.5 rounded-full shadow-md transition-all hover:scale-115 active:scale-95 cursor-pointer flex items-center justify-center font-bold"
                  >
                    <ChevronLeft className="w-4 h-4" strokeWidth={3} />
                  </button>

                  {/* Carousel Container */}
                  <div 
                    id="day-carousel-container"
                    className="flex-1 overflow-x-auto no-scrollbar scroll-smooth pb-2 px-1"
                  >
                    <div className="flex gap-3 min-w-max">
                      {WEEK_PLAN.map((dayItem, index) => {
                        const isActive = index === activeIdx;
                        return (
                          <button
                            key={dayItem.id}
                            onClick={() => setActiveIdx(index)}
                            className={`flex flex-col items-center p-2 rounded-2xl border transition-all duration-300 relative cursor-pointer outline-none select-none w-28 ${
                              isActive 
                                ? 'bg-[#9E5638] border-[#9E5638] text-white shadow-md scale-102 font-bold' 
                                : 'bg-white hover:bg-[#FAF8F4] border-[#5A3825]/10 hover:border-[#D4AF37]/20 text-[#5A3825] shadow-xs'
                            }`}
                          >
                            {isActive && (
                              <span className="absolute -inset-0.5 rounded-2xl border border-[#D4AF37] opacity-60 animate-ping pointer-events-none" />
                            )}
                            <div className="w-24 h-18 rounded-xl overflow-hidden border border-[#5A3825]/10 shadow-inner mb-1.5 flex-shrink-0 bg-white">
                              <img 
                                src={dayItem.image} 
                                alt={dayItem.day} 
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <span className={`font-mono text-[9px] font-black tracking-widest ${isActive ? 'text-white' : 'text-[#9E5638]'}`}>
                              {dayItem.label}
                            </span>
                            <span className={`font-serif text-[10px] font-black tracking-wide ${isActive ? 'text-[#FAF6ED]' : 'text-[#5A3825]/60'}`}>
                              {dayItem.day}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Scroll Button */}
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="absolute right-0 z-20 bg-white hover:bg-[#FAF8F4] text-[#9E5638] border border-[#5A3825]/15 p-1.5 rounded-full shadow-md transition-all hover:scale-115 active:scale-95 cursor-pointer flex items-center justify-center font-bold"
                  >
                    <ChevronRight className="w-4 h-4" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT AREA: DETAILS WITH BULLET MENU ITEMS & DESCRIPTIONS */}
            <div className="lg:col-span-6 flex flex-col text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIdx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="text-[#9E5638] tracking-[0.25em] font-mono text-[10px] uppercase font-extrabold block mb-1">
                    Authentic Chulha Cycle
                  </span>
                  <h3 className="font-serif font-black text-2xl sm:text-3xl text-[#5A3825] uppercase tracking-wide mb-6">
                    {activeDay.title}
                  </h3>

                  {/* Grid items breakdown inside Thali */}
                  <h4 className="text-[10px] tracking-[0.2em] font-mono text-[#5A3825]/50 uppercase font-black mb-3">
                    What's in the Box?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2">
                    {activeDay.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-[#5A3825]/90 font-serif font-bold">
                        <span className="w-5 h-5 rounded-full bg-[#EADBBD]/40 text-[#5A3825] flex items-center justify-center border border-[#D4AF37]/20 flex-shrink-0">
                          <Check className="w-3 h-3 text-[#9E5638]" strokeWidth={3} />
                        </span>
                        <span>{it}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* --- DYNAMIC ADDED TO CART NOTIFIER COMPONENT --- */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto mb-6 bg-[#7A8B6B] border border-[#7A8B6B]/20 text-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <p className="text-xs sm:text-sm font-serif font-bold text-left">{successMsg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SUBSCRIPTION PREMIUM PLANS PRICING & CALLS TO ACTIONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* PLAN 1: SINGLE DAY TRIAL */}
          <div className="bg-[#FAF8F4] hover:bg-white border-2 border-[#5A3825]/10 hover:border-[#D4AF37]/50 rounded-3xl p-6 flex flex-col items-center justify-between text-center transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md h-full">
            <div className="w-full flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EADBBD]/25 text-[#9E5638] flex items-center justify-center border border-[#D4AF37]/20 mb-4 flex-shrink-0">
                <Calendar className="w-5.5 h-5.5" />
              </div>
              
              <div>
                <span className="text-[10px] tracking-[0.2em] font-mono text-black uppercase font-black">
                  Taste the Tradition
                </span>
                <h4 className="font-serif font-black text-lg text-[#5A3825] uppercase tracking-wide mt-1">
                  Trial a Day
                </h4>
                <p className="text-[11px] text-black font-black font-serif mt-2 mb-4 leading-relaxed max-w-[240px] mx-auto">
                  Experience a premium luxury thali hot from our mud-chulha clay fires directly to your hands.
                </p>
              </div>

              {/* Premium tier benefits checklist */}
              <div className="w-full border-t border-[#5A3825]/5 pt-4 pb-2 text-left space-y-2">
                <div className="flex items-start gap-2 text-[11px] text-[#5A3825]/80 font-bold font-serif">
                  <Check className="w-3.5 h-3.5 text-[#7A8B6B] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span>Woodfired clay baking (₹299 value)</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-[#5A3825]/80 font-bold font-serif">
                  <Check className="w-3.5 h-3.5 text-[#7A8B6B] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span>Double hand-churned Cow Ghee</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-[#5A3825]/80 font-bold font-serif">
                  <Check className="w-3.5 h-3.5 text-[#7A8B6B] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span>Premium Eco-friendly insulated packaging</span>
                </div>
              </div>
            </div>

            <div className="w-full mt-6">
              <div className="mb-4">
                <span className="text-sm font-serif font-black text-[#5A3825]/50">Rs.</span>
                <span className="text-3xl font-serif font-black text-[#9E5638] ml-0.5">249</span>
                <span className="text-[10px] font-mono text-[#5A3825]/40 uppercase tracking-widest block font-bold mt-0.5">Single luxury hot-case meal</span>
              </div>
              
              <button
                onClick={handleAddTrial}
                className="w-full bg-[#9E5638] hover:bg-[#83462C] text-white py-3.5 rounded-xl text-xs font-serif font-extrabold tracking-widest uppercase border border-[#9E5638] hover:border-[#83462C] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                Add Trial Meal
              </button>
            </div>
          </div>

          {/* PLAN 2: 6-MEAL WEEKLY SUBSCRIPTION */}
          <div className="bg-[#FAF8F4] hover:bg-white border-2 border-[#9E5638]/20 hover:border-[#D4AF37]/60 rounded-3xl p-6 flex flex-col items-center justify-between text-center transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-lg h-full relative overflow-hidden">
            {/* Best Value Banner */}
            <div className="absolute top-0 right-0 bg-[#7A8B6B] text-white font-mono text-[8px] font-black tracking-widest uppercase px-4 py-1.5 rounded-bl-2xl shadow-sm border-l border-b border-white/20 select-none">
              Save 15%
            </div>

            <div className="w-full flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#7A8B6B]/15 text-[#7A8B6B] flex items-center justify-center border border-[#7A8B6B]/20 mb-4 flex-shrink-0">
                <Clock className="w-5.5 h-5.5" />
              </div>

              <div>
                <span className="text-[10px] tracking-[0.2em] font-mono text-[#7A8B6B] uppercase font-black">
                  Weekly Routine
                </span>
                <h4 className="font-serif font-black text-lg text-[#5A3825] uppercase tracking-wide mt-1">
                  6-Meal Week Plan
                </h4>
                <p className="text-[11px] text-black font-black font-serif mt-2 mb-4 leading-relaxed max-w-[240px] mx-auto">
                  6 luxurious days (Monday to Saturday) of distinct mud-stoved thalis delivered at precise lunchtime slots.
                </p>
              </div>

              {/* Premium tier benefits checklist */}
              <div className="w-full border-t border-[#5A3825]/5 pt-4 pb-2 text-left space-y-2">
                <div className="flex items-start gap-2 text-[11px] text-[#5A3825]/80 font-bold font-serif">
                  <Check className="w-3.5 h-3.5 text-[#7A8B6B] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span>Premium ₹299 class Gourmet meals</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-[#5A3825]/80 font-bold font-serif">
                  <Check className="w-3.5 h-3.5 text-[#7A8B6B] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span>Free rustic matka sweet buttermilk daily</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-[#5A3825]/80 font-bold font-serif">
                  <Check className="w-3.5 h-3.5 text-[#7A8B6B] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span>Zero delivery fees + dynamic pausing tracker</span>
                </div>
              </div>
            </div>

            <div className="w-full mt-6">
              <div className="mb-4">
                <span className="text-sm font-serif font-black text-[#5A3825]/50">Rs.</span>
                <span className="text-3xl font-serif font-black text-[#9E5638] ml-0.5">1260</span>
                <span className="text-[10px] font-mono text-[#5A3825]/40 uppercase tracking-widest block font-bold mt-0.5">6 thali meals (~Rs. 210/meal)</span>
              </div>

              <button
                onClick={handleAddWeekly}
                className="w-full bg-[#7A8B6B] hover:bg-[#667657] text-white py-3.5 rounded-xl text-xs font-serif font-extrabold tracking-widest uppercase border border-[#7A8B6B] hover:border-[#667657] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                Subscribe (Weekly)
              </button>
            </div>
          </div>

          {/* PLAN 3: 24-MEAL MONTHLY SUBSCRIPTION */}
          <div className="bg-[#FAF8F4] hover:bg-white border-2 border-[#5A3825]/10 hover:border-[#D4AF37]/50 rounded-3xl p-6 flex flex-col items-center justify-between text-center transition-all duration-300 transform hover:-translate-y-1 shadow-sm hover:shadow-md h-full relative overflow-hidden">
            {/* Top Savings Banner */}
            <div className="absolute top-0 right-0 bg-[#9E5638] text-white font-mono text-[8px] font-black tracking-widest uppercase px-4 py-1.5 rounded-bl-2xl shadow-sm border-l border-b border-white/20 select-none">
              Save 37%
            </div>

            <div className="w-full flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EADBBD]/25 text-[#9E5638] flex items-center justify-center border border-[#D4AF37]/20 mb-4 flex-shrink-0">
                <Sparkles className="w-5.5 h-5.5 text-[#9E5638]" />
              </div>

              <div>
                <span className="text-[10px] tracking-[0.2em] font-mono text-[#5A3825]/45 uppercase font-black">
                  Monthly Devotion
                </span>
                <h4 className="font-serif font-black text-lg text-[#5A3825] uppercase tracking-wide mt-1">
                  24-Meal Month Plan
                </h4>
                <p className="text-[11px] text-black font-black font-serif mt-2 mb-4 leading-relaxed max-w-[240px] mx-auto">
                  Ultimate savings of ₹2676. Full control to pause, skip, or modify meals daily on your profile block.
                </p>
              </div>

              {/* Premium tier benefits checklist */}
              <div className="w-full border-t border-[#5A3825]/5 pt-4 pb-2 text-left space-y-2">
                <div className="flex items-start gap-2 text-[11px] text-[#5A3825]/80 font-bold font-serif">
                  <Check className="w-3.5 h-3.5 text-[#7A8B6B] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span>₹299 signature gourmet plate standards</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-[#5A3825]/80 font-bold font-serif">
                  <Check className="w-3.5 h-3.5 text-[#7A8B6B] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span>Customize spices, fat details & salt values</span>
                </div>
                <div className="flex items-start gap-2 text-[11px] text-[#5A3825]/80 font-bold font-serif">
                  <Check className="w-3.5 h-3.5 text-[#7A8B6B] mt-0.5 flex-shrink-0" strokeWidth={3} />
                  <span>Dedicated VIP logistics runner + free desserts</span>
                </div>
              </div>
            </div>

            <div className="w-full mt-6">
              <div className="mb-4">
                <span className="text-sm font-serif font-black text-[#5A3825]/50">Rs.</span>
                <span className="text-3xl font-serif font-black text-[#9E5638] ml-0.5">4500</span>
                <span className="text-[10px] font-mono text-[#5A3825]/40 uppercase tracking-widest block font-bold mt-0.5">24 thali meals (~Rs. 187/meal)</span>
              </div>

              <button
                onClick={handleAddMonthly}
                className="w-full bg-[#9E5638] hover:bg-[#83462C] text-white py-3.5 rounded-xl text-xs font-serif font-extrabold tracking-widest uppercase border border-[#9E5638] hover:border-[#83462C] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                Subscribe (Monthly)
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
