import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles } from 'lucide-react';
import { CustomLogoSvg } from './HeroAnimation';

interface IntroAnimationProps {
  onComplete: () => void;
}

export const IntroAnimation = ({ onComplete }: IntroAnimationProps) => {
  const [phase, setPhase] = useState<'ignition' | 'cooking' | 'puffing' | 'reveal'>('ignition');

  useEffect(() => {
    // Phase transitions matching physical action timeline
    const timers = [
      setTimeout(() => setPhase('cooking'), 1200), // Roti lands, starts toasting
      setTimeout(() => setPhase('puffing'), 2800), // Roti puffs up with yeast-free wood heat
      setTimeout(() => setPhase('reveal'), 4500),  // Fire fades into Brand Name
      setTimeout(() => onComplete(), 6500)         // Full splash dissolve 
    ];

    // Disable background page scrolling while intro is active
    document.body.style.overflow = 'hidden';

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  // Generate responsive spark positions
  const sparks = [
    { left: '42%', delay: 0.2, duration: 1.8, size: 4 },
    { left: '48%', delay: 0.8, duration: 2.2, size: 5 },
    { left: '55%', delay: 0.5, duration: 2.0, size: 3 },
    { left: '38%', delay: 1.2, duration: 2.5, size: 6 },
    { left: '58%', delay: 1.5, duration: 1.9, size: 4 },
    { left: '45%', delay: 0.1, duration: 2.3, size: 5 },
    { left: '52%', delay: 1.1, duration: 1.7, size: 4 },
  ];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
      className="fixed inset-0 z-[9999] bg-[#0E0A08] flex flex-col items-center justify-center overflow-hidden font-sans select-none"
    >
      {/* Absolute Dark Vignette for maximum luxury & fire contrast */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(26,14,8,0.2)_0%,rgba(10,6,4,0.95)_100%)] z-10 pointer-events-none" />

      {/* Decorative Firewood Smoulder Gradients in Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-950/10 rounded-full blur-[100px] z-0" />

      {/* skip button in corner */}
      <button 
        onClick={onComplete}
        className="absolute top-6 right-8 text-[#FAF6ED]/40 hover:text-brand-accent text-[10px] tracking-[0.25em] font-mono uppercase bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-full border border-white/5 transition-all outline-none z-50 cursor-pointer"
      >
        Skip Intro ✕
      </button>

      {/* Phase 1-3: Traditional Desi Chulha Roti Simulation */}
      <AnimatePresence mode="wait">
        {phase !== 'reveal' && (
          <motion.div 
            key="chulha-simulation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.6 } }}
            className="relative flex flex-col items-center justify-center z-20 w-full max-w-md h-[400px]"
          >
            {/* 1. Firewood sparks shooting up from the mouth of chulha */}
            <div className="absolute bottom-28 inset-x-0 h-48 pointer-events-none overflow-hidden z-25">
              {sparks.map((spark, idx) => (
                <motion.div
                  key={idx}
                  className="absolute bottom-0 rounded-full bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  style={{ 
                    left: spark.left,
                    width: spark.size,
                    height: spark.size
                  }}
                  animate={{
                    y: [-40, -180, -260],
                    x: [0, (idx % 2 === 0 ? 15 : -15) * Math.sin(idx), (idx % 2 === 0 ? 30 : -30)],
                    opacity: [0, 0.9, 0.4, 0],
                    scale: [0.8, 1.2, 0.4]
                  }}
                  transition={{
                    duration: spark.duration,
                    repeat: Infinity,
                    delay: spark.delay,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>

            {/* 2. CHULHA & TAWA SYSTEM SVG */}
            <div className="w-80 h-72 relative">
              <svg viewBox="0 0 400 350" className="w-full h-full fill-none">
                <defs>
                  {/* Mud Gradients */}
                  <radialGradient id="mudGlow" cx="50%" cy="100%" r="90%">
                    <stop offset="0%" stopColor="#A85A3F" />
                    <stop offset="60%" stopColor="#5E2F1E" />
                    <stop offset="100%" stopColor="#30160D" />
                  </radialGradient>
                  
                  {/* Black Iron Tawa Gradient */}
                  <linearGradient id="tawaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2E2E2E" />
                    <stop offset="50%" stopColor="#1B1B1B" />
                    <stop offset="100%" stopColor="#0B0B0B" />
                  </linearGradient>

                  {/* Hot Ember Core Glow */}
                  <radialGradient id="emberGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFE033" />
                    <stop offset="40%" stopColor="#FF6B00" />
                    <stop offset="85%" stopColor="#9E1B00" />
                    <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                  </radialGradient>

                  {/* Flame Gradients */}
                  <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#E63900" stopOpacity="0.8" />
                    <stop offset="70%" stopColor="#FF7700" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FFA000" stopOpacity="0" />
                  </linearGradient>
                  
                  <linearGradient id="flameInner" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#FF5500" />
                    <stop offset="50%" stopColor="#FFCC00" />
                    <stop offset="100%" stopColor="#FFFFCC" stopOpacity="0" />
                  </linearGradient>

                  {/* Wheat Roti Texture */}
                  <radialGradient id="rotiGrad" cx="45%" cy="40%" r="55%">
                    <stop offset="0%" stopColor="#F9F4DF" />
                    <stop offset="70%" stopColor="#EADBBD" />
                    <stop offset="100%" stopColor="#CDA773" />
                  </radialGradient>
                </defs>

                {/* --- A. HEARTH FIRE GLOW --- */}
                <ellipse cx="200" cy="275" rx="75" ry="32" fill="url(#emberGlow)" opacity="0.85" className="animate-pulse" />

                {/* --- B. WOOD FIRED LOGS --- */}
                {/* Left Wood Log */}
                <g transform="translate(130, 240) rotate(-15)">
                  <path d="M 0,15 L 90,15 L 85,32 L -5,32 Z" fill="#4B271A" stroke="#25120B" strokeWidth="2" />
                  <ellipse cx="0" cy="23.5" rx="6" ry="8.5" fill="#5C3624" stroke="#25120B" strokeWidth="1.5" />
                  {/* Glowing wood ember tip */}
                  <ellipse cx="85" cy="23.5" rx="8" ry="8.5" fill="#FF5500" filter="blur(2px)" />
                </g>
                {/* Right Wood Log */}
                <g transform="translate(270, 240) rotate(195) scale(1, -1)">
                  <path d="M 0,15 L 90,15 L 85,32 L -5,32 Z" fill="#4B271A" stroke="#25120B" strokeWidth="2" />
                  <ellipse cx="0" cy="23.5" rx="6" ry="8.5" fill="#5C3624" stroke="#25120B" strokeWidth="1.5" />
                  {/* Glowing wood ember tip */}
                  <ellipse cx="85" cy="23.5" rx="8" ry="8.5" fill="#FF5500" filter="blur(2px)" />
                </g>

                {/* --- C. FLICKERING FIRE FLAMES --- */}
                {/* Background Outer Flame Glow */}
                <motion.path 
                  d="M 160,280 C 140,220 180,180 200,140 C 220,180 260,220 240,280 Z" 
                  fill="url(#flameOuter)" 
                  animate={{ 
                    scaleX: [1, 1.08, 0.94, 1.05, 1],
                    scaleY: [1, 0.92, 1.12, 0.96, 1],
                    skewX: [0, 4, -4, 2, 0]
                  }}
                  transition={{ 
                    duration: 0.7, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="origin-bottom"
                />

                {/* Core Flame */}
                <motion.path 
                  d="M 175,275 C 160,235 185,200 200,165 C 215,200 240,235 225,275 Z" 
                  fill="url(#flameInner)" 
                  animate={{ 
                    scaleX: [1, 0.92, 1.06, 0.95, 1],
                    scaleY: [1, 1.1, 0.9, 1.05, 1],
                    skewX: [0, -3, 3, -1, 0]
                  }}
                  transition={{ 
                    duration: 0.45, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="origin-bottom"
                />

                {/* --- D. THE TRADITIONAL CLAY CHULHA --- */}
                {/* Back shadow inside the chulha */}
                <path d="M 140,270 Q 200,170 260,270 Q 200,285 140,270" fill="rgba(20, 10, 5, 0.85)" />

                {/* Left Pillar of Chulha */}
                <path 
                  d="M 100,280 C 100,240 120,200 145,210 C 158,215 152,240 145,260 C 135,285 110,290 100,280 Z" 
                  fill="url(#mudGlow)" 
                  stroke="#3B1C10" 
                  strokeWidth="2.5" 
                />

                {/* Right Pillar of Chulha */}
                <path 
                  d="M 300,280 C 300,240 280,200 255,210 C 242,215 248,240 255,260 C 265,285 290,290 300,280 Z" 
                  fill="url(#mudGlow)" 
                  stroke="#3B1C10" 
                  strokeWidth="2.5" 
                />

                {/* Bottom solid base linking the pillars */}
                <path 
                  d="M 98,278 Q 200,295 302,278 Q 280,315 200,315 Q 120,315 98,278" 
                  fill="#472213" 
                  stroke="#251007" 
                  strokeWidth="2" 
                />

                {/* --- E. THE BLACK IRON TAWA PAN --- */}
                {/* Tawa resting securely across both mud pillars above fire */}
                <g>
                  {/* Subtle Tawa Handle */}
                  <path d="M 120,185 L 50,165 Q 46,164 48,160 Q 50,156 54,158 L 122,178 Z" fill="#222" stroke="#111" strokeWidth="1.5" />
                  
                  {/* Tawa Dish Base */}
                  <ellipse cx="200" cy="184" rx="90" ry="16" fill="url(#tawaGrad)" stroke="#111111" strokeWidth="3" />
                  
                  {/* Tawa inner concave rim highlight */}
                  <ellipse cx="200" cy="186" rx="84" ry="12" fill="none" stroke="#D3AF37" strokeWidth="0.5" opacity="0.25" />
                </g>

                {/* --- F. DESI CHULHA ROTI (THE ACCENT FLAVOR) --- */}
                {/* Roti on top of tawa, showing various phases of cooking & puffing */}
                <g id="roti-assembly">
                  {phase !== 'ignition' && (
                    <motion.g
                      initial={{ opacity: 0, scale: 0.6, y: 15 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0 
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      {/* Wavy steam drifting up from cooking Roti */}
                      {phase !== 'ignition' && (
                        <g>
                          <motion.path 
                            d="M 185,150 Q 180,110 190,80 Q 200,50 185,30" 
                            stroke="#EADBBD" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            opacity="0"
                            animate={{ 
                              opacity: [0, 0.45, 0],
                              strokeDashoffset: [0, -30],
                              y: [0, -10]
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                            style={{ strokeDasharray: "10,20" }}
                          />
                          <motion.path 
                            d="M 215,150 Q 220,115 210,85 Q 220,55 210,35" 
                            stroke="#EADBBD" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            opacity="0"
                            animate={{ 
                              opacity: [0, 0.5, 0],
                              strokeDashoffset: [0, -30],
                              y: [0, -12]
                            }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: "linear", delay: 0.8 }}
                            style={{ strokeDasharray: "12,18" }}
                          />
                        </g>
                      )}

                      {/* --- THE PHYSICAL ROTI BODY --- */}
                      {/* Using framer motion to scaleY to represent "Puffing up" */}
                      <motion.ellipse 
                        cx="200" 
                        cy="176" 
                        rx="68" 
                        ry={phase === 'puffing' ? 36 : 10} 
                        fill="url(#rotiGrad)" 
                        stroke="#BD9355" 
                        strokeWidth="1"
                        animate={phase === 'puffing' ? {
                          ry: [10, 24, 38, 35, 36],
                          y: [0, -8, -14, -11, -12],
                          rotate: [0, 1, -1, 0]
                        } : {
                          ry: 10,
                          y: 0,
                          rotate: 0
                        }}
                        transition={phase === 'puffing' ? {
                          duration: 2.2, 
                          ease: "easeOut",
                          times: [0, 0.3, 0.7, 0.9, 1]
                        } : { duration: 0.5 }}
                        className="origin-bottom shadow-2xl"
                      />

                      {/* Roasted Wheat Brown Spots (baking texture) fading-in during toasting */}
                      <motion.g 
                        opacity={0}
                        animate={phase === 'cooking' || phase === 'puffing' ? { opacity: 0.9 } : { opacity: 0 }}
                        transition={{ duration: 1.5 }}
                      >
                        {/* Spot 1 */}
                        <ellipse cx="168" cy="174" rx="4" ry="2" fill="#75512B" opacity="0.75" />
                        <ellipse cx="167.5" cy="174" rx="2" ry="1" fill="#422C14" />

                        {/* Spot 2 */}
                        <ellipse cx="225" cy="177" rx="3.5" ry="1.8" fill="#75512B" opacity="0.8" />
                        <ellipse cx="225" cy="177" rx="1.5" ry="1.0" fill="#4B3115" />

                        {/* Cluster Spot 3 (Fluff Centre) */}
                        <ellipse cx="194" cy="171" rx="5" ry="2.5" fill="#8A6337" opacity="0.7" />
                        <ellipse cx="193.5" cy="171" rx="2.5" ry="1.3" fill="#583C1C" />

                        {/* Spot 4 */}
                        <ellipse cx="210" cy="179" rx="3" ry="1.5" fill="#75512B" opacity="0.72" />
                      </motion.g>

                      {/* Puffing expansion wave ring circles radiating outwards (Golden aroma halo) */}
                      {phase === 'puffing' && (
                        <motion.ellipse
                          cx="200"
                          cy="164"
                          rx={72}
                          ry={38}
                          stroke="#D4AF37"
                          strokeWidth="2"
                          fill="none"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ 
                            opacity: [0, 0.75, 0],
                            scale: [0.95, 1.25, 1.45],
                          }}
                          transition={{ duration: 2.0, repeat: Infinity, ease: "easeOut" }}
                        />
                      )}
                    </motion.g>
                  )}
                </g>
              </svg>
            </div>

            {/* Dynamic Status Badging below Chulha */}
            <div className="text-center mt-6 h-12">
              <AnimatePresence mode="wait">
                {phase === 'ignition' && (
                  <motion.p
                    key="ign"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[#FAF6ED]/70 font-mono text-[10px] tracking-[0.25em] uppercase flex items-center justify-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    Igniting firewood hearth...
                  </motion.p>
                )}
                {phase === 'cooking' && (
                  <motion.p
                    key="cook"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[#FAF6ED]/70 font-mono text-[10px] tracking-[0.25em] uppercase flex items-center justify-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    Hand-rolling clay oven Roti...
                  </motion.p>
                )}
                {phase === 'puffing' && (
                  <motion.p
                    key="puff"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-brand-accent font-mono text-[10px] tracking-[0.25em] font-black uppercase flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-spin" style={{ animationDuration: '3s' }} />
                    PUFFING LIVE ON FIERY TAWA!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Phase 4: Full Royal Gold Brand Reveal */}
        {phase === 'reveal' && (
          <motion.div
            key="brand-reveal"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute z-30 flex flex-col items-center justify-center text-center px-4"
          >
            {/* Gilded crest logo rotating / scaling gently */}
            <motion.div
              initial={{ opacity: 0, y: -25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.0, delay: 0.2, type: "spring" }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 bg-brand-accent/20 rounded-full blur-[40px]" />
              <CustomLogoSvg className="w-24 h-24 drop-shadow-[0_4px_12px_rgba(212,175,55,0.4)] relative z-10" />
            </motion.div>

            {/* Main brand heading with golden shimmering gradient */}
            <motion.h1 
              initial={{ letterSpacing: "0.1em", opacity: 0 }}
              animate={{ letterSpacing: "0.45em", opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl font-serif font-black uppercase text-[#FAF6ED] mb-4 pr-[-0.45em]"
            >
              <span className="bg-gradient-to-b from-[#FFFDF9] via-[#EADBBD] to-[#C8A76B] bg-clip-text text-transparent drop-shadow-md">
                THE TAWA BOX
              </span>
            </motion.h1>

            {/* Royal Gold Line Divider */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 140 }}
              transition={{ duration: 1.0, delay: 0.8 }}
              className="h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-5"
            />

            {/* Estd & Slogan with custom font spacing */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="text-[#FAF6ED]/50 font-mono text-[9px] sm:text-[10px] tracking-[0.35em] uppercase"
            >
              ESTD. 2026 • THE RUSTIC HEARTH REVOLUTION
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
