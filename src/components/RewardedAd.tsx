import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Volume2, VolumeX, ShieldCheck, Award, X } from 'lucide-react';

interface RewardedAdProps {
  manualTitle: string;
  onAdCompleted: () => void;
  onClose: () => void;
}

export default function RewardedAd({ manualTitle, onAdCompleted, onClose }: RewardedAdProps) {
  const [timeLeft, setTimeLeft] = useState(6); // 6 seconds for swift testing
  const [isMuted, setIsMuted] = useState(false);
  const [adStep, setAdStep] = useState<'intro' | 'playing' | 'rewarded'>('playing');

  useEffect(() => {
    if (timeLeft === 0) {
      setAdStep('rewarded');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleClaimReward = () => {
    onAdCompleted();
  };

  const adSlides = [
    {
      title: "Compre Compressores Elgin Originais",
      desc: "Eficiência máxima, garantia estendida e suporte de engenharia para o técnico refrigerista de verdade.",
      promo: "Cupom: TECWELGIN10 (10% OFF)"
    },
    {
      title: "Placa Inverter Queimada?",
      desc: "Conheça o Curso Tec W de Eletrônica Básica para White Goods e pare de terceirizar consertos de placa.",
      promo: "Matrículas Abertas com 30% Desconto"
    },
    {
      title: "Peças Originais Brastemp/Consul",
      desc: "Distribuidor oficial com entrega expressa no mesmo dia para toda região metropolitana.",
      promo: "Frete Grátis na primeira compra"
    }
  ];

  // Pick a random slide
  const slide = adSlides[Math.floor(Math.random() * adSlides.length)];

  return (
    <div className="fixed inset-0 bg-secondary/95 z-50 flex flex-col justify-between p-6 select-none text-white font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
          <span className="text-xs font-mono font-semibold tracking-wider text-red-400">ANÚNCIO</span>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          {adStep === 'rewarded' ? (
            <button 
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="bg-white/10 text-xs px-3.5 py-1.5 rounded-full font-mono font-bold">
              Pular em {timeLeft}s
            </div>
          )}
        </div>
      </div>

      {/* Main Content (Simulator Player) */}
      <div className="my-auto max-w-md w-full mx-auto bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-brand-blue/5 to-transparent pointer-events-none" />
        
        {adStep === 'playing' ? (
          <div className="space-y-6 text-center py-6">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="w-16 h-16 bg-gradient-premium rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/30"
            >
              <Play className="w-8 h-8 fill-white ml-1 text-white" />
            </motion.div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/20">
                Parceiro Recomendado
              </span>
              <h3 className="font-display font-bold text-2xl tracking-tight text-white mt-2">
                {slide.title}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
                {slide.desc}
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-brand-orange font-mono text-sm font-extrabold tracking-wide">
              {slide.promo}
            </div>

            {/* Video-like progress bar */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-premium"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-center py-6">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-20 h-20 bg-brand-orange/10 border-2 border-brand-orange rounded-full flex items-center justify-center mx-auto"
            >
              <Award className="w-10 h-10 text-brand-orange stroke-[2]" />
            </motion.div>

            <div className="space-y-2">
              <span className="text-emerald-400 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center space-x-1">
                <ShieldCheck className="w-4 h-4 fill-emerald-500/10" />
                <span>Recompensa Desbloqueada!</span>
              </span>
              <h3 className="font-display font-bold text-xl text-white">
                Manual Liberado por 24h
              </h3>
              <p className="text-white/60 text-xs max-w-xs mx-auto">
                Obrigado por apoiar a nossa comunidade! Você já pode abrir e baixar o manual: 
                <span className="text-white font-semibold block mt-1">"{manualTitle}"</span>
              </p>
            </div>

            <button
              onClick={handleClaimReward}
              className="w-full py-3.5 bg-gradient-premium text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all"
            >
              Começar Leitura Grátis
            </button>
          </div>
        )}
      </div>

      {/* Footer message */}
      <div className="text-center text-[11px] text-white/40 font-medium">
        Patrocinadores ajudam a manter o Tec W gratuito para milhares de técnicos.
      </div>
    </div>
  );
}
