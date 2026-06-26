import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Crown, Check, X, ShieldAlert, Sparkles, CreditCard, ChevronRight } from 'lucide-react';
import { SubscriptionPlan, UserProfile } from '../types';
import { mockSubscriptionPlans } from '../data/mockManuals';

interface PremiumModalProps {
  onClose: () => void;
  onSubscribeSuccess: (planId: string) => void;
  user: UserProfile;
}

export default function PremiumModal({ onClose, onSubscribeSuccess, user }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('plan_yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'plans' | 'checkout' | 'success'>('plans');

  const currentPlan = mockSubscriptionPlans.find(p => p.id === selectedPlan);

  const handleSubscribe = () => {
    setPaymentStep('checkout');
  };

  const handleCompletePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onSubscribeSuccess(selectedPlan);
      setPaymentStep('success');
      setIsProcessing(false);
    }, 1500);
  };

  const benefits = [
    "Acesso a mais de 100.000 manuais técnicos",
    "Downloads ilimitados de PDFs em alta velocidade",
    "Experiência 100% livre de anúncios e comerciais",
    "Salvamento Offline direto no armazenamento do celular",
    "Novos manuais e esquemas elétricos adicionados diariamente",
    "Suporte prioritário via canal exclusivo WhatsApp",
    "Sincronização instantânea de pastas e favoritos entre dispositivos"
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-40 flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none font-sans">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#1E1E24] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative border border-slate-100 dark:border-white/5 flex flex-col text-slate-800 dark:text-slate-200"
      >
        {/* Banner with Close Option */}
        <div className="bg-gradient-premium px-6 py-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center space-x-2 text-amber-300">
            <Crown className="w-5 h-5 fill-amber-300" />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">ASSINATURA TEC W PRO</span>
          </div>
          <h3 className="font-display font-bold text-2xl tracking-tight mt-1">
            Seja um Técnico Premium
          </h3>
          <p className="text-white/80 text-xs mt-1">
            Tenha todos os manuais na palma da sua mão e nunca mais fique preso em um diagnóstico.
          </p>
        </div>

        {/* Content Stages */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          <AnimatePresence mode="wait">
            {paymentStep === 'plans' && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Benefits List */}
                <div className="space-y-2.5">
                  <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide">
                    O que você recebe ao assinar:
                  </h4>
                  <ul className="space-y-2">
                    {benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plans Selection */}
                <div className="grid grid-cols-2 gap-3.5">
                  {mockSubscriptionPlans.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                        selectedPlan === plan.id
                          ? 'border-primary bg-primary/5 dark:bg-[#6A1BFF]/10 shadow-sm'
                          : 'border-slate-100 dark:border-white/5 hover:border-slate-200 dark:hover:border-zinc-800 bg-slate-50/50 dark:bg-[#16161C]/50'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 right-4 bg-brand-orange text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                          Melhor Valor
                        </span>
                      )}
                      
                      <div>
                        <h5 className="font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider">{plan.name}</h5>
                        <p className="font-display font-black text-slate-900 dark:text-white text-xl mt-1.5">{plan.price}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">/{plan.period === 'monthly' ? 'mês' : 'ano'}</span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-primary">
                        <span>Selecionar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubscribe}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Assinar Agora por {currentPlan?.price}</span>
                </button>
              </motion.div>
            )}

            {paymentStep === 'checkout' && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Checkout info */}
                <div className="bg-slate-50 dark:bg-[#16161C] p-4 rounded-2xl border border-slate-100 dark:border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Plano Selecionado:</span>
                    <span className="text-xs text-slate-800 dark:text-white font-bold uppercase">{currentPlan?.name}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-white/10 pt-2 font-display">
                    <span className="text-sm text-slate-900 dark:text-slate-300 font-extrabold">Total a pagar:</span>
                    <span className="text-base text-primary dark:text-[#8B5CF6] font-black">{currentPlan?.price}</span>
                  </div>
                </div>

                {/* Simulated credit card form */}
                <div className="space-y-4">
                  <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Informações de Pagamento Seguras</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Nome no Cartão</label>
                      <input 
                        type="text" 
                        defaultValue={user.fullName}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#16161C] border border-slate-200 dark:border-white/5 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary dark:focus:border-[#6A1BFF] focus:bg-white dark:focus:bg-[#16161C] text-slate-800 dark:text-white"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Número do Cartão</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          maxLength={19}
                          placeholder="4000 1234 5678 9010"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#16161C] border border-slate-200 dark:border-white/5 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-primary dark:focus:border-[#6A1BFF] focus:bg-white dark:focus:bg-[#16161C] text-slate-800 dark:text-white"
                        />
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Validade</label>
                        <input 
                          type="text" 
                          maxLength={5}
                          placeholder="12/29"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#16161C] border border-slate-200 dark:border-white/5 rounded-xl text-xs font-mono font-bold text-center focus:outline-none focus:border-primary dark:focus:border-[#6A1BFF] focus:bg-white dark:focus:bg-[#16161C] text-slate-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">CVV</label>
                        <input 
                          type="password" 
                          maxLength={3}
                          placeholder="***"
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#16161C] border border-slate-200 dark:border-white/5 rounded-xl text-xs font-mono font-bold text-center focus:outline-none focus:border-primary dark:focus:border-[#6A1BFF] focus:bg-white dark:focus:bg-[#16161C] text-slate-800 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3.5">
                  <button
                    onClick={() => setPaymentStep('plans')}
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleCompletePayment}
                    disabled={isProcessing}
                    className="flex-[2] py-3 bg-gradient-premium text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Pagar {currentPlan?.price}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-medium pt-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pagamento processado em ambiente SSL criptografado 256-bit</span>
                </div>
              </motion.div>
            )}

            {paymentStep === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center py-6"
              >
                <div className="w-16 h-16 bg-emerald-100/10 border border-emerald-200/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-display font-black text-slate-900 dark:text-white text-xl">Assinatura Ativada!</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                    Parabéns! Sua conta foi atualizada para <span className="text-primary dark:text-[#8B5CF6] font-bold">Tec W Pro</span>. 
                    Você agora tem acesso total e irrestrito aos manuais, downloads rápidos e modo offline.
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                  }}
                  className="w-full py-3.5 bg-gradient-premium text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  Ir para a Biblioteca
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
