import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Compass, Sparkles } from 'lucide-react';

interface HeroAnimationProps {
  onExploreMenu: () => void;
  onTrackOrder?: () => void;
  hasActiveOrders?: boolean;
}

const tawaBoxHero = '/src/assets/images/tawa_box_hero_1779282315522.png';

// Elegant Traditional Golden Logo styled exactly like the provided image logo
export const CustomLogoSvg = ({ className = "w-16 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 120 70" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Symmetrical framing on top */}
    <path 
      d="M 30,10 H 90 M 30,10 C 24,10 24,24 30,24 C 33,24 33,14 36,14 H 84 C 87,14 87,24 90,24 C 96,24 96,10 90,10" 
      stroke="#D4AF37" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* The central Stylized 'T' */}
    <path 
      d="M 45,22 H 75 M 60,22 V 58 C 60,63 56,65 52,63" 
      stroke="#D4AF37" 
      strokeWidth="3.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    {/* Left leaf stalks (Foliage) */}
    <path d="M 22,42 C 20,24 36,32 36,32 C 33,37 21,45 22,42 Z" fill="#D4AF37" />
    <path d="M 18,32 C 18,16 31,23 31,23 C 28,28 18,35 18,32 Z" fill="#D4AF37" />
    <path d="M 26,52 C 24,36 38,42 38,42 C 35,46 26,54 26,52 Z" fill="#D4AF37" />
    
    {/* Right leaf stalks (Foliage) */}
    <path d="M 98,42 C 100,24 84,32 84,32 C 87,37 99,45 98,42 Z" fill="#D4AF37" />
    <path d="M 102,32 C 102,16 89,23 89,23 C 92,28 102,35 102,32 Z" fill="#D4AF37" />
    <path d="M 94,52 C 96,36 82,42 82,42 C 85,46 94,54 94,52 Z" fill="#D4AF37" />
  </svg>
);

export const HeroAnimation = ({ onExploreMenu, onTrackOrder, hasActiveOrders = false }: HeroAnimationProps) => {
  return (
    <section 
      id="hero-section" 
      className="relative w-full h-[65vh] min-h-[460px] md:h-[75vh] md:min-h-[560px] flex items-center justify-center overflow-hidden border-b border-[#5A3825]/30 bg-[#0F0A07]"
    >
      {/* Background Image: Generated top-down Indian meal flatlay table from local asset */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 transform scale-102"
        style={{ 
          backgroundImage: `linear-gradient(rgba(10, 6, 4, 0.45), rgba(10, 6, 4, 0.55)), url(${tawaBoxHero})` 
        }}
      />

      {/* Elegant Radial Dark Vignette for maximum text readability and depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.75)_100%)] z-10 pointer-events-none" />

      {/* Subtle Floating Ambient Sparks */}
      <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-t from-amber-500 to-orange-400 rounded-full blur-[0.5px]"
            style={{ 
              left: `${15 + Math.random() * 70}%`, 
              top: `${20 + Math.random() * 60}%` 
            }}
            animate={{
              y: [0, -40, -80],
              opacity: [0, 0.7, 0],
              scale: [0.5, 1, 0.2]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeOut"
            }}
          />
        ))}
      </div>

      {/* Centered Hero Content box */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 w-full text-center flex flex-col items-center">
        
        {/* Understated luxury badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] font-mono tracking-[0.2em] uppercase"
        >
          <Sparkles className="w-3 h-3 text-[#D4AF37] animate-pulse" />
          <span>ESTD. 2026 • RUSTIC HEARTH REVOLUTION</span>
        </motion.div>

        {/* Central Display Slogan matching image typography exactly */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="space-y-4 max-w-4xl"
        >
          <h1 className="text-3xl sm:text-4.5xl md:text-5.5xl lg:text-6xl font-serif font-black tracking-[0.05em] leading-[1.2] text-[#FAF6ED] uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
            <span className="bg-gradient-to-b from-[#FFFDF9] via-[#EADBBD] to-[#C8A76B] bg-clip-text text-transparent block mb-1">
              Hand-Crafted Desi Meals,
            </span>
            <span className="text-[#FAF6ED] block">
              Delivered with Passion.
            </span>
          </h1>

          <p className="text-white/85 text-xs sm:text-sm md:text-base font-medium max-w-xl mx-auto tracking-wide leading-relaxed bg-black/25 backdrop-blur-xs p-3.5 rounded-2xl border border-white/5 shadow-md">
            Prepared with fresh wood-fired chulha roti, slow-cooked dal, and pure desi ingredients straight from the rustic kitchen clay ovens.
          </p>
        </motion.div>

        {/* Call-to-action buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 w-full max-w-md"
        >
          <button
            onClick={onExploreMenu}
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#8C5135] to-[#A05A3C] hover:from-[#9C5B3C] hover:to-[#B36846] text-[#FAF6ED] border border-[#D4AF37]/25 px-8 py-3.5 rounded-xl font-serif font-black text-sm tracking-wide shadow-xl hover:shadow-[#8C5135]/25 cursor-pointer transition-all hover:scale-102"
          >
            ORDER FROM CHULHA NOW
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          {onTrackOrder && (
            <button
              onClick={onTrackOrder}
              className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl border border-white/10 bg-black/40 backdrop-blur-xs text-[#FAF6ED]/90 hover:text-white font-serif font-bold text-xs tracking-wider uppercase hover:bg-white/5 transition-all cursor-pointer ${
                hasActiveOrders ? 'border-[#D4AF37]/40 ring-1 ring-[#D4AF37]/20 bg-[#1A1815]' : ''
              }`}
            >
              {hasActiveOrders ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span>TRACK ACTIVE ORDER 🛵</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4 text-[#D4AF37]" />
                  <span>TRACK MY ORDER</span>
                </>
              )}
            </button>
          )}
        </motion.div>

        {/* Decorative Indian Clay Pattern Border Overlay */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D4AF37]/50 via-[#5A3825]/30 to-[#D4AF37]/50" />

      </div>
    </section>
  );
};
