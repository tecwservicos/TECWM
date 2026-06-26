import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, Sparkles, Check, Bookmark } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationBannerProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export default function NotificationBanner({
  notifications,
  onMarkAsRead,
  onClearAll,
  onClose
}: NotificationBannerProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex justify-end select-none font-sans">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-sm bg-white dark:bg-[#0F0F12] h-full shadow-2xl flex flex-col justify-between border-l dark:border-white/5"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-[#16161C]">
          <div className="flex items-center space-x-2">
            <Bell className="w-4 h-4 text-[#8B5CF6] animate-bounce" />
            <span className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">Notificações</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} novas
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {notifications.length > 0 && (
              <button 
                onClick={onClearAll}
                className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors"
              >
                Limpar tudo
              </button>
            )}
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200/60 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          <AnimatePresence initial={false}>
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <Bell className="w-10 h-10 stroke-[1.5] text-slate-300" />
                <p className="font-semibold text-xs">Nenhuma notificação por aqui</p>
                <p className="text-[10px] text-slate-400 max-w-[200px]">Avisaremos quando novos manuais técnicos forem homologados!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  onClick={() => onMarkAsRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 hover:border-slate-300 dark:hover:border-zinc-700 ${
                    n.read 
                      ? 'bg-slate-50 dark:bg-[#16161C] border-slate-100 dark:border-white/5 text-slate-500' 
                      : 'bg-primary/5 dark:bg-[#6A1BFF]/5 border-primary/10 dark:border-[#6A1BFF]/20 text-slate-800 dark:text-slate-200 font-medium shadow-sm'
                  }`}
                >
                  <div className={`p-1.5 rounded-xl border shrink-0 mt-0.5 ${
                    n.type === 'promo' 
                      ? 'bg-amber-100/10 border-amber-200/20 text-amber-500' 
                      : n.type === 'new_manual' 
                        ? 'bg-blue-100/10 border-blue-200/20 text-blue-400' 
                        : 'bg-purple-100/10 border-purple-200/20 text-[#8B5CF6]'
                  }`}>
                    {n.type === 'promo' ? <Sparkles className="w-3.5 h-3.5 fill-amber-500/10" /> : <Bookmark className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h5 className={`text-xs leading-snug ${n.read ? 'text-slate-700 dark:text-slate-400 font-semibold' : 'text-slate-900 dark:text-slate-200 font-bold'}`}>
                        {n.title}
                      </h5>
                      {!n.read && <span className="w-2 h-2 bg-[#6A1BFF] rounded-full mt-1.5 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{n.description}</p>
                    <span className="text-[9px] font-mono font-medium text-slate-400 block pt-1">{n.createdAt}</span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer announcement */}
        <div className="p-4 bg-slate-50 dark:bg-[#16161C] border-t border-slate-100 dark:border-white/5 text-center text-[10px] text-slate-400 font-medium">
          Dica: Usuários Pro recebem notificações prioritárias de esquemas elétricos em tempo real!
        </div>
      </motion.div>
    </div>
  );
}
