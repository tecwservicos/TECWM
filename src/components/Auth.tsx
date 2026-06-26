import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, Wrench, Snowflake, Globe } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface AuthProps {
  onAuthSuccess: (user: UserProfile) => void;
  defaultEmail?: string;
}

export default function Auth({ onAuthSuccess, defaultEmail = 'victorcraft264@gmail.com' }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('Victor Craft');
  const [confirmPassword, setConfirmPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (!email || !password) {
        setError('Por favor, preencha todos os campos.');
        setLoading(false);
        return;
      }

      const role = email.toLowerCase() === 'victorcraft264@gmail.com' ? UserRole.ADMIN : UserRole.USER;
      const user: UserProfile = {
        uid: 'user_trial_' + Math.random().toString(36).substr(2, 9),
        fullName: role === UserRole.ADMIN ? 'Victor Craft (Admin)' : (fullName || 'Técnico Autônomo'),
        email: email,
        role: role,
        isPremium: role === UserRole.ADMIN, // Admin has premium features unlocked automatically
        premiumUntil: role === UserRole.ADMIN ? '2030-12-31T23:59:59Z' : null,
        avatarUrl: role === UserRole.ADMIN 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' 
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        stats: {
          manualsViewed: role === UserRole.ADMIN ? 124 : 14,
          downloadsCount: role === UserRole.ADMIN ? 48 : 3,
          favoritesCount: role === UserRole.ADMIN ? 25 : 4,
          readingTimeMinutes: role === UserRole.ADMIN ? 320 : 45
        }
      };

      onAuthSuccess(user);
      setLoading(false);
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const role = email.toLowerCase() === 'victorcraft264@gmail.com' ? UserRole.ADMIN : UserRole.USER;
      const user: UserProfile = {
        uid: 'user_trial_' + Math.random().toString(36).substr(2, 9),
        fullName: fullName,
        email: email,
        role: role,
        isPremium: false,
        premiumUntil: null,
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
        stats: {
          manualsViewed: 0,
          downloadsCount: 0,
          favoritesCount: 0,
          readingTimeMinutes: 0
        }
      };
      
      onAuthSuccess(user);
      setLoading(false);
    }, 1200);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Por favor, digite seu e-mail.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSuccessMsg('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
      setLoading(false);
      setTimeout(() => {
        setMode('login');
        setSuccessMsg('');
      }, 3000);
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      // Create admin profile if Google accounts match, otherwise standard user
      const googleEmail = email || 'victor.google@tecw.com';
      const role = googleEmail.toLowerCase() === 'victorcraft264@gmail.com' ? UserRole.ADMIN : UserRole.USER;
      const user: UserProfile = {
        uid: 'google_user_' + Math.random().toString(36).substr(2, 9),
        fullName: role === UserRole.ADMIN ? 'Victor Craft (Admin)' : 'Técnico Conectado',
        email: googleEmail,
        role: role,
        isPremium: role === UserRole.ADMIN,
        premiumUntil: role === UserRole.ADMIN ? '2030-12-31T23:59:59Z' : null,
        avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=150',
        stats: {
          manualsViewed: 2,
          downloadsCount: 1,
          favoritesCount: 1,
          readingTimeMinutes: 8
        }
      };
      onAuthSuccess(user);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 select-none">
      {/* Brand Header */}
      <div className="flex flex-col items-center mt-4">
        <div className="flex items-center space-x-2 bg-[#1E1E24] p-3 rounded-2xl shadow-md border border-white/5">
          <Wrench className="w-6 h-6 text-[#8B5CF6] animate-pulse" />
          <Snowflake className="w-6 h-6 text-[#6A1BFF]" />
          <span className="font-display font-bold text-xl bg-gradient-to-r from-[#8B5CF6] to-[#6A1BFF] bg-clip-text text-transparent tracking-tighter">
            TEC W
          </span>
        </div>
        <h2 className="mt-4 font-display font-bold text-2xl text-white tracking-tight text-center">
          Tec W Manuais
        </h2>
        <p className="text-slate-400 text-sm mt-1 text-center max-w-xs">
          A maior biblioteca de manuais de refrigeração e linha branca do país.
        </p>
      </div>

      {/* Main Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', damping: 20 }}
        className="my-auto max-w-md w-full mx-auto bg-[#1E1E24] rounded-3xl shadow-xl border border-white/5 overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white">
                Acesse sua conta
              </h3>
              
              {error && (
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold border border-red-500/20 animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#16161C] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#6A1BFF] focus:ring-1 focus:ring-[#6A1BFF] font-medium text-white placeholder:text-slate-500 transition-colors"
                    placeholder="E-mail profissional"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-10 pr-10 py-3 bg-[#16161C] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#6A1BFF] focus:ring-1 focus:ring-[#6A1BFF] font-medium text-white placeholder:text-slate-500 transition-colors"
                    placeholder="Senha secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-xs font-semibold text-[#8B5CF6] hover:text-[#6A1BFF] transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#6A1BFF] hover:bg-[#4F10CE] text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-950/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Entrar com E-mail</span>
                )}
              </button>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-white/5 w-full"></div>
                <span className="bg-[#1E1E24] px-3 text-xs text-slate-500 font-medium absolute">ou continue com</span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 bg-[#16161C] border border-white/5 hover:bg-[#25252D] text-slate-300 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2 shadow-sm"
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.5l3.86 3C6.18 7.35 8.87 5.04 12 5.04z"/>
                  <path fill="#4285F4" d="M23.45 12.27c0-.82-.07-1.6-.2-2.36H12v4.51h6.43c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.36-4.88 3.36-8.54z"/>
                  <path fill="#FBBC05" d="M5.25 14.77c-.25-.75-.39-1.55-.39-2.37s.14-1.62.39-2.37l-3.86-3C.53 8.74 0 10.3 0 12s.53 3.26 1.39 4.97l3.86-3z"/>
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.5 1.18-4.3 1.18-3.13 0-5.82-2.31-6.75-5.46l-3.86 3C3.37 20.35 7.35 23 12 23z"/>
                </svg>
                <span>Google</span>
              </button>

              <div className="text-center mt-4">
                <span className="text-xs text-slate-500">Ainda não tem conta? </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-xs font-bold text-[#8B5CF6] hover:text-[#6A1BFF] transition-colors"
                >
                  Criar Conta Grátis
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white">
                Crie sua conta técnica
              </h3>

              {error && (
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold border border-red-500/20 animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#16161C] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#6A1BFF] focus:ring-1 focus:ring-[#6A1BFF] font-medium text-white placeholder:text-slate-500 transition-colors"
                    placeholder="Nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#16161C] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#6A1BFF] focus:ring-1 focus:ring-[#6A1BFF] font-medium text-white placeholder:text-slate-500 transition-colors"
                    placeholder="E-mail principal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-10 pr-10 py-3 bg-[#16161C] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#6A1BFF] focus:ring-1 focus:ring-[#6A1BFF] font-medium text-white placeholder:text-slate-500 transition-colors"
                    placeholder="Crie sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-10 pr-10 py-3 bg-[#16161C] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#6A1BFF] focus:ring-1 focus:ring-[#6A1BFF] font-medium text-white placeholder:text-slate-500 transition-colors"
                    placeholder="Confirme a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#6A1BFF] hover:bg-[#4F10CE] text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-950/20 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Registrar e Começar</span>
                )}
              </button>

              <div className="text-center mt-4">
                <span className="text-xs text-slate-500">Já possui conta? </span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-[#8B5CF6] hover:text-[#6A1BFF] transition-colors"
                >
                  Fazer Login
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white">
                Esqueceu a senha?
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Insira o seu e-mail cadastrado e enviaremos um link de redefinição de senha instantâneo.
              </p>

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-semibold border border-emerald-500/20">
                  {successMsg}
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl text-xs font-semibold border border-red-500/20">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="w-5 h-5" />
                  </span>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#16161C] border border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#6A1BFF] focus:ring-1 focus:ring-[#6A1BFF] font-medium text-white placeholder:text-slate-500 transition-colors"
                    placeholder="Seu e-mail profissional"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#6A1BFF] hover:bg-[#4F10CE] text-white rounded-xl font-semibold text-sm shadow-md shadow-purple-950/20 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Enviar Link</span>
                )}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  Voltar para o Login
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>

      {/* Trust Message Footer */}
      <div className="flex flex-col items-center space-y-1">
        <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
          <Globe className="w-3.5 h-3.5 text-[#8B5CF6]" />
          <span>Servidores locais seguros em nuvem</span>
        </div>
        <p className="text-xs text-slate-500 font-medium text-center">
          "Acesse milhares de manuais técnicos imediatamente."
        </p>
      </div>
    </div>
  );
}
