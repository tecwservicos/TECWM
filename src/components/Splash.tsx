import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Wrench, Snowflake, Settings } from 'lucide-react';

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div 
      id="splash-screen"
      className="fixed inset-0 bg-gradient-premium flex flex-col items-center justify-center text-white z-50 select-none"
    >
      <div className="relative flex items-center justify-center w-48 h-48 mb-6">
        {/* Animated Background Gears */}
        <motion.div 
          className="absolute text-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <Settings className="w-40 h-40" />
        </motion.div>
        
        <motion.div 
          className="absolute text-brand-orange/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <Settings className="w-24 h-24" />
        </motion.div>

        {/* Central Brand Emblem */}
        <motion.div 
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          className="relative bg-white text-secondary rounded-full p-6 shadow-2xl flex items-center justify-center z-10 border-4 border-brand-orange"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="flex space-x-1.5 text-primary">
              <Wrench className="w-8 h-8 text-brand-orange stroke-[2.5]" />
              <Snowflake className="w-8 h-8 text-brand-blue stroke-[2.5] animate-pulse" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-tighter bg-gradient-to-r from-[#8B5CF6] to-[#6A1BFF] bg-clip-text text-transparent mt-1">
              TEC W
            </span>
          </div>
        </motion.div>
      </div>

      {/* Brand Typographic Identity */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center"
      >
        <h1 className="font-display font-bold text-3xl tracking-tight leading-none mb-2">
          Tec W Manuais
        </h1>
        <p className="text-white/80 text-sm font-medium tracking-wide">
          Technical Manuals Library
        </p>
      </motion.div>

      {/* Dynamic Progress Indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 h-1 bg-white/20 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-brand-orange"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2.6, ease: "easeInOut" }}
        />
      </div>

      <div className="absolute bottom-6 text-xs text-white/50 font-mono">
        v1.2.0 • Premium Edition
      </div>
    </div>
  );
}
