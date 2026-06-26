import { motion } from 'motion/react';
import { Eye, Download, BookOpen, Crown } from 'lucide-react';
import { Manual } from '../types';

interface ManualCardProps {
  key?: any;
  manual: Manual;
  onOpen: (manual: Manual) => void;
}

export default function ManualCard({ manual, onOpen }: ManualCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white dark:bg-[#1E1E24] rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between group cursor-pointer"
      onClick={() => onOpen(manual)}
    >
      <div className="relative">
        {/* Cover Image */}
        <div className="h-36 w-full bg-slate-100 dark:bg-[#16161C] overflow-hidden relative">
          <img
            src={manual.coverImage}
            alt={manual.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60" />
          
          {/* Brand Logo Badge */}
          <span className="absolute top-3 left-3 bg-white/90 dark:bg-[#1E1E24]/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-sm tracking-wide uppercase border dark:border-white/5">
            {manual.brand}
          </span>

          {/* Premium Tag */}
          {manual.premium && (
            <span className="absolute top-3 right-3 bg-amber-500 text-white font-bold text-[9px] px-2 py-0.5 rounded-full shadow-sm flex items-center space-x-1 uppercase tracking-wider">
              <Crown className="w-2.5 h-2.5 fill-white" />
              <span>Premium</span>
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-1.5">
          <span className="text-[10px] text-primary dark:text-[#8B5CF6] font-bold uppercase tracking-wider bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-md">
            {manual.category}
          </span>
          <h4 className="font-sans font-bold text-slate-800 dark:text-white text-sm line-clamp-2 leading-snug group-hover:text-primary dark:group-hover:text-[#8B5CF6] transition-colors">
            {manual.title}
          </h4>
          <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            Model: <span className="text-slate-800 dark:text-slate-200 font-semibold">{manual.model}</span>
          </p>
        </div>
      </div>

      {/* Footer / Stats & Action */}
      <div className="p-4 pt-0 border-t border-slate-50 dark:border-white/5 flex items-center justify-between text-slate-400 dark:text-slate-500 text-[11px] font-medium">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <Eye className="w-3.5 h-3.5 stroke-[2]" />
            <span>{manual.views > 999 ? `${(manual.views / 1000).toFixed(1)}k` : manual.views}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Download className="w-3.5 h-3.5 stroke-[2]" />
            <span>{manual.downloads}</span>
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen(manual);
          }}
          className="text-primary dark:text-[#8B5CF6] font-bold hover:text-primary-dark dark:hover:text-[#6A1BFF] transition-colors flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Abrir</span>
          <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </motion.div>
  );
}
