import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wind, Snowflake, Sparkles, Wrench, BookOpen, Heart, Search, Download, 
  User, History, Settings, Plus, Folder, Bell, Crown, ChevronRight, 
  ChevronLeft, Moon, Sun, Share2, Info, Lock, Unlock, Send, Star, 
  HelpCircle, Trash2, Smartphone, ShieldCheck, Check, LogOut, Laptop, CheckCircle 
} from 'lucide-react';

import Splash from './components/Splash';
import Auth from './components/Auth';
import ManualCard from './components/ManualCard';
import PdfReader from './components/PdfReader';
import RewardedAd from './components/RewardedAd';
import PremiumModal from './components/PremiumModal';
import AdminPanel from './components/AdminPanel';
import NotificationBanner from './components/NotificationBanner';

import { 
  UserProfile, UserRole, Manual, Category, FavoriteFolder, 
  ReadingHistoryItem, DownloadedManual, NotificationItem 
} from './types';
import { initialManuals, mockCategories, mockBrands } from './data/mockManuals';

export default function App() {
  // Navigation & Screen states
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'favorites' | 'downloads' | 'profile'>('home');
  const [darkMode, setDarkMode] = useState(true);
  const [deviceFrame, setDeviceFrame] = useState(true); // Let user toggle mockup frame for better viewing!

  // Database states
  const [manuals, setManuals] = useState<Manual[]>(() => {
    const cached = localStorage.getItem('tecw_manuals');
    return cached ? JSON.parse(cached) : initialManuals;
  });
  
  // Interaction sheets / modals
  const [selectedManual, setSelectedManual] = useState<Manual | null>(null);
  const [activePdfReader, setActivePdfReader] = useState<Manual | null>(null);
  const [rewardedAdManual, setRewardedAdManual] = useState<Manual | null>(null);
  const [isPremiumOpen, setIsPremiumOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // User relations
  const [searchHistory, setSearchHistory] = useState<string[]>(['Consul CRM43', 'Ar Inverter', 'Código de Erro']);
  const [searchText, setSearchText] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: 'not_1', title: 'Novos Manuais Brastemp', description: 'Adicionamos 5 manuais de serviço da linha de refrigeradores Inverse.', createdAt: 'Hoje • 10:25', read: false, type: 'new_manual' },
    { id: 'not_2', title: 'Campanha de Diagnóstico', description: 'Assine o plano anual hoje e ganhe acesso ao grupo exclusivo VIP do WhatsApp.', createdAt: 'Ontem • 18:40', read: false, type: 'promo' },
    { id: 'not_3', title: 'Configurações de Segurança', description: 'Dispositivo conectado com sucesso em São Paulo, Brasil.', createdAt: 'Há 2 dias', read: true, type: 'system' }
  ]);

  const [favoriteFolders, setFavoriteFolders] = useState<FavoriteFolder[]>([
    { id: 'fld_1', name: 'Refrigeração Comercial', manualIds: ['man_002', 'man_005', 'man_006'], createdAt: new Date().toISOString() },
    { id: 'fld_2', name: 'Ar Condicionado Residenciais', manualIds: ['man_001', 'man_007'], createdAt: new Date().toISOString() }
  ]);

  const [readingHistory, setReadingHistory] = useState<ReadingHistoryItem[]>([
    { id: 'hst_1', manualId: 'man_001', lastReadAt: 'Hoje • 14:10', progressPercent: 40, lastPage: 4 },
    { id: 'hst_2', manualId: 'man_003', lastReadAt: 'Ontem • 09:30', progressPercent: 12, lastPage: 2 }
  ]);

  const [downloadedManuals, setDownloadedManuals] = useState<DownloadedManual[]>([
    { id: 'dl_1', manualId: 'man_001', downloadedAt: new Date().toISOString(), localPath: '/storage/emulated/0/TecW/man_001.pdf', fileSize: '8.4 MB' },
    { id: 'dl_2', manualId: 'man_003', downloadedAt: new Date().toISOString(), localPath: '/storage/emulated/0/TecW/man_003.pdf', fileSize: '4.8 MB' }
  ]);

  const [unlockedManuals, setUnlockedManuals] = useState<string[]>([]); // manualId that are unlocked via ads for 24h
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileNameInput, setProfileNameInput] = useState('');

  // Sync to localStorage on manual changes
  useEffect(() => {
    localStorage.setItem('tecw_manuals', JSON.stringify(manuals));
  }, [manuals]);

  // Auth transition
  const handleAuthSuccess = (profile: UserProfile) => {
    setUser(profile);
    setProfileNameInput(profile.fullName);
  };

  // Manual actions
  const handleOpenManual = (manual: Manual) => {
    setSelectedManual(manual);
  };

  const handleReadManual = (manual: Manual) => {
    if (user?.isPremium || !manual.premium || unlockedManuals.includes(manual.id)) {
      // Access granted
      setActivePdfReader(manual);
      setSelectedManual(null);

      // Add to reading history
      if (user) {
        const updatedStats = { ...user.stats, manualsViewed: user.stats.manualsViewed + 1 };
        setUser({ ...user, stats: updatedStats });
      }

      const exists = readingHistory.find(h => h.manualId === manual.id);
      if (!exists) {
        setReadingHistory([
          { id: 'hst_' + Math.random().toString(36).substr(2, 9), manualId: manual.id, lastReadAt: 'Agora', progressPercent: 1, lastPage: 1 },
          ...readingHistory
        ]);
      }
    } else {
      // Locked: Trigger Premium Modal with Rewarded Ad option
      setRewardedAdManual(manual);
    }
  };

  const handleAdUnlock = () => {
    if (rewardedAdManual) {
      setUnlockedManuals([...unlockedManuals, rewardedAdManual.id]);
      setActivePdfReader(rewardedAdManual);
      setRewardedAdManual(null);
      setSelectedManual(null);
    }
  };

  const handleSubscribe = (planId: string) => {
    if (user) {
      setUser({
        ...user,
        isPremium: true,
        premiumUntil: '2027-12-31T23:59:59Z'
      });
    }
  };

  // Bookmark pages / Favorites Folder
  const toggleFavorite = (manualId: string) => {
    const isFav = favoriteFolders[0]?.manualIds.includes(manualId);
    let updatedFolders = [...favoriteFolders];
    
    if (isFav) {
      updatedFolders = updatedFolders.map(f => {
        if (f.id === 'fld_1') {
          return { ...f, manualIds: f.manualIds.filter(id => id !== manualId) };
        }
        return f;
      });
    } else {
      updatedFolders = updatedFolders.map(f => {
        if (f.id === 'fld_1') {
          return { ...f, manualIds: [...f.manualIds, manualId] };
        }
        return f;
      });
    }
    setFavoriteFolders(updatedFolders);
  };

  const isFavorited = (manualId: string) => {
    return favoriteFolders.some(f => f.manualIds.includes(manualId));
  };

  // Downloads Offline Save
  const handleSaveOffline = (manualId: string) => {
    const manual = manuals.find(m => m.id === manualId);
    if (!manual) return;

    const exists = downloadedManuals.some(dl => dl.manualId === manualId);
    if (exists) return;

    const newDownload: DownloadedManual = {
      id: 'dl_' + Math.random().toString(36).substr(2, 9),
      manualId,
      downloadedAt: new Date().toISOString(),
      localPath: `/storage/emulated/0/TecW/${manualId}.pdf`,
      fileSize: manual.fileSize
    };

    setDownloadedManuals([...downloadedManuals, newDownload]);
    
    if (user) {
      setUser({
        ...user,
        stats: { ...user.stats, downloadsCount: user.stats.downloadsCount + 1 }
      });
    }
  };

  const isDownloaded = (manualId: string) => {
    return downloadedManuals.some(dl => dl.manualId === manualId);
  };

  const handleDeleteDownload = (dlId: string) => {
    setDownloadedManuals(downloadedManuals.filter(dl => dl.id !== dlId));
  };

  // Admin Callbacks
  const handleAddManual = (newManual: Manual) => {
    setManuals([newManual, ...manuals]);
    setNotifications([
      {
        id: 'not_' + Math.random().toString(36).substr(2, 9),
        title: `Novo catálogo ${newManual.brand}`,
        description: `Adicionado o manual técnico de ${newManual.category} para o modelo ${newManual.model}.`,
        createdAt: 'Agora',
        read: false,
        type: 'new_manual'
      },
      ...notifications
    ]);
  };

  const handleUpdateManual = (updated: Manual) => {
    setManuals(manuals.map(m => m.id === updated.id ? updated : m));
  };

  const handleDeleteManual = (id: string) => {
    setManuals(manuals.filter(m => m.id !== id));
  };

  // Feedback submit
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;
    setFeedbackSuccess(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSuccess(false), 4000);
  };

  // Notification triggers
  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Search filter
  const filteredManuals = manuals.filter(manual => {
    const matchesSearch = searchText 
      ? manual.title.toLowerCase().includes(searchText.toLowerCase()) ||
        manual.model.toLowerCase().includes(searchText.toLowerCase()) ||
        manual.brand.toLowerCase().includes(searchText.toLowerCase()) ||
        manual.keywords.some(k => k.toLowerCase().includes(searchText.toLowerCase()))
      : true;

    const matchesBrand = selectedBrand ? manual.brand === selectedBrand : true;
    const matchesCategory = selectedCategoryName ? manual.category === selectedCategoryName : true;

    return matchesSearch && matchesBrand && matchesCategory;
  });

  // Calculate downloaded MBs
  const calculateDownloadsSize = () => {
    let mbs = 0;
    downloadedManuals.forEach(dl => {
      const match = dl.fileSize.match(/([\d.]+)\s*MB/);
      if (match) {
        mbs += parseFloat(match[1]);
      }
    });
    return mbs.toFixed(1);
  };

  // Get lucide icon by name safe
  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'Wind': return <Wind className="w-5 h-5 shrink-0" />;
      case 'Snowflake': return <Snowflake className="w-5 h-5 shrink-0" />;
      case 'ThermometerSnowflake': return <Snowflake className="w-5 h-5 text-teal-600 shrink-0" />;
      case 'WashingMachine': return <Wrench className="w-5 h-5 shrink-0" />;
      case 'Sun': return <Sun className="w-5 h-5 shrink-0" />;
      case 'Zap': return <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'Cpu': return <Settings className="w-5 h-5 text-emerald-600 shrink-0" />;
      default: return <Wrench className="w-5 h-5 shrink-0" />;
    }
  };

  // Splash Screen display
  if (showSplash) {
    return <Splash onComplete={() => setShowSplash(false)} />;
  }

  // Auth Screen display
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Main UI Shell (Responsive Web Viewport / Smartphone Frame Mockup)
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${darkMode ? 'dark-theme bg-zinc-950' : 'bg-slate-100'} p-0 md:p-6 font-sans`}>
      
      {/* Toggle Layout Frames (Floating option) */}
      <div className="fixed top-4 right-4 hidden md:flex items-center space-x-2.5 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-full px-4 py-2 shadow-md z-30 font-semibold text-xs text-slate-500 dark:text-slate-400 select-none">
        <span>Visualização:</span>
        <button 
          onClick={() => setDeviceFrame(true)} 
          className={`p-1.5 rounded-full transition-all ${deviceFrame ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          title="Modo Celular"
        >
          <Smartphone className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setDeviceFrame(false)} 
          className={`p-1.5 rounded-full transition-all ${!deviceFrame ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-100 dark:hover:bg-zinc-800'}`}
          title="Modo Tela Cheia"
        >
          <Laptop className="w-4 h-4" />
        </button>
      </div>

      {/* Main Container */}
      <div className={`w-full ${deviceFrame ? 'max-w-[430px] h-[880px] rounded-[50px] border-[12px] border-slate-950 dark:border-zinc-800 shadow-2xl overflow-hidden' : 'max-w-7xl min-h-screen rounded-none border-none shadow-none'} bg-white dark:bg-zinc-950 flex flex-col relative`}>
        
        {/* Top Simulated Mobile Notch Status Bar (only shown in phone frame view) */}
        {deviceFrame && (
          <div className="h-10 bg-slate-50 dark:bg-zinc-900/40 px-6 flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold shrink-0 border-b border-slate-200/20 z-20">
            <span>20:26</span>
            <div className="w-28 h-4 bg-slate-950 dark:bg-zinc-900 rounded-b-xl absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <span className="w-2.5 h-2.5 bg-slate-800 rounded-full" />
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>5G</span>
              <div className="w-5 h-2.5 border-1.5 border-slate-500 dark:border-slate-400 rounded-sm p-0.5 flex items-center">
                <div className="h-full w-4 bg-slate-500 dark:bg-slate-400" />
              </div>
            </div>
          </div>
        )}

        {/* Global App Header */}
        <header className="px-5 py-4 border-b border-slate-100 dark:border-zinc-900/60 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md flex items-center justify-between shrink-0 z-10 select-none">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="relative cursor-pointer" onClick={() => setActiveTab('profile')}>
              <img 
                src={user.avatarUrl} 
                alt={user.fullName} 
                className="w-9 h-9 rounded-full object-cover border-2 border-primary/20"
              />
              {user.isPremium && (
                <div className="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-0.5 border border-white">
                  <Crown className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              )}
            </div>
            
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block leading-none">Seja bem-vindo,</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[140px] mt-0.5">{user.fullName}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Admin trigger (if admin role) */}
            {user.role === UserRole.ADMIN && (
              <button 
                onClick={() => setIsAdminOpen(true)}
                className="px-3 py-1.5 bg-secondary hover:bg-slate-900 text-white dark:bg-zinc-900 border border-zinc-800 text-[10px] font-bold rounded-lg flex items-center space-x-1 shadow-sm transition-all"
              >
                <Settings className="w-3 h-3 text-brand-orange animate-spin-slow" />
                <span>Admin</span>
              </button>
            )}

            {/* Notification alert bell */}
            <button 
              onClick={() => setNotificationOpen(true)}
              className="p-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition-colors relative"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-zinc-950 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Pages Frame */}
        <div className="flex-1 overflow-y-auto pb-24 z-0">
          
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="p-5 space-y-6"
              >
                {/* Search Header Banner */}
                <div className="bg-gradient-premium rounded-3xl p-5 text-white relative overflow-hidden border border-primary-light/10 shadow-lg shadow-primary/20">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  
                  <span className="text-[9px] bg-white/20 px-2.5 py-1 rounded-full font-mono font-bold tracking-wider uppercase">
                    Biblioteca Digital
                  </span>
                  
                  <h3 className="font-display font-extrabold text-xl mt-3 tracking-tight">
                    Encontre esquemas em segundos
                  </h3>
                  
                  <p className="text-white/80 text-[11px] mt-1.5 leading-normal max-w-[240px]">
                    Procure manuais de white goods, códigos de erro e esquemas elétricos oficiais.
                  </p>

                  {/* Integrated home search bar */}
                  <div 
                    onClick={() => { setActiveTab('search'); }}
                    className="mt-4 flex items-center bg-white rounded-xl py-2 px-3.5 shadow-sm cursor-pointer border border-slate-200"
                  >
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="ml-2.5 text-xs text-slate-400 font-medium">Buscar por modelo, marca ou palavra...</span>
                  </div>
                </div>

                {/* Horizontal Categories Scroll */}
                <div className="space-y-2.5">
                  <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Categorias</h4>
                  <div className="flex space-x-3 overflow-x-auto pb-1 max-w-full">
                    <button
                      onClick={() => { setSelectedCategoryName(null); }}
                      className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all shrink-0 ${
                        selectedCategoryName === null
                          ? 'bg-primary border-primary text-white shadow-sm shadow-primary/10'
                          : 'bg-white dark:bg-zinc-900 border-slate-200/60 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      Todos
                    </button>
                    {mockCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategoryName(cat.name); }}
                        className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                          selectedCategoryName === cat.name
                            ? 'bg-primary border-primary text-white shadow-sm shadow-primary/10'
                            : 'bg-white dark:bg-zinc-900 border-slate-200/60 dark:border-zinc-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {getCategoryIcon(cat.iconName)}
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Reading List (Continue Reading) */}
                {readingHistory.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                      <History className="w-3.5 h-3.5 text-primary" />
                      <span>Continuar Lendo</span>
                    </h4>
                    <div className="space-y-2.5">
                      {readingHistory.map((hst) => {
                        const m = manuals.find(item => item.id === hst.manualId);
                        if (!m) return null;
                        return (
                          <div 
                            key={hst.id}
                            onClick={() => handleReadManual(m)}
                            className="bg-white dark:bg-zinc-900/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-900/60 hover:border-slate-200 shadow-sm flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center space-x-3">
                              <img src={m.coverImage} className="w-10 h-12 rounded object-cover border border-slate-200/50" />
                              <div>
                                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-primary block line-clamp-1">{m.title}</span>
                                <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Pág {hst.lastPage} • Progresso {hst.progressPercent}%</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Featured Manuals Grid list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Manuais Populares</h4>
                    <span className="text-[10px] font-bold text-primary">{filteredManuals.length} encontrados</span>
                  </div>
                  
                  {filteredManuals.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-zinc-900/10 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl text-slate-400 text-xs space-y-2">
                      <Search className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold">Nenhum manual encontrado nesta categoria.</p>
                      <button onClick={() => setSelectedCategoryName(null)} className="text-primary font-bold text-[10px] hover:underline">Limpar filtros</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredManuals.slice(0, 6).map((m) => (
                        <ManualCard key={m.id} manual={m} onOpen={handleOpenManual} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Promotional banner to go premium */}
                {!user.isPremium && (
                  <div className="bg-gradient-orange text-white rounded-3xl p-5 border border-brand-orange/20 shadow-md relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -bottom-10 -right-10 w-28 h-28 bg-white/10 rounded-full" />
                    <div>
                      <span className="text-[8px] bg-white/20 text-white font-extrabold px-2.5 py-1 rounded-full uppercase">Oferta de Diagnóstico</span>
                      <h4 className="font-display font-extrabold text-base mt-2">Diga adeus aos anúncios e esperas!</h4>
                      <p className="text-white/85 text-[11px] mt-1 leading-normal max-w-[280px]">Seja PRO hoje para downloads ilimitados de PDFs de comando e circuitos integrados.</p>
                    </div>
                    <button 
                      onClick={() => setIsPremiumOpen(true)}
                      className="mt-4 bg-white hover:bg-slate-50 text-brand-orange font-extrabold text-xs py-2.5 rounded-xl shadow-md transition-all self-start px-4"
                    >
                      Assinar Premium PRO
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'search' && (
              <motion.div
                key="search"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 space-y-5"
              >
                {/* Search Bar Inputs */}
                <div className="space-y-2.5">
                  <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Busca Avançada</h4>
                  <div className="flex items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl py-2.5 px-4 shadow-sm relative">
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Modelo, marca ou termo... (Ex: WD11M, Consul)"
                      className="ml-2.5 text-xs text-slate-800 dark:text-slate-100 flex-1 focus:outline-none bg-transparent font-medium"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                    {searchText && (
                      <button onClick={() => setSearchText('')} className="text-slate-400 hover:text-slate-600 text-xs">Limpar</button>
                    )}
                  </div>
                </div>

                {/* Brand Filter Pill Selector */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar por Fabricante</span>
                  <div className="flex space-x-2 overflow-x-auto pb-1 max-w-full">
                    <button
                      onClick={() => setSelectedBrand(null)}
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all shrink-0 ${
                        selectedBrand === null ? 'bg-secondary text-white border-secondary' : 'bg-white dark:bg-zinc-900 border-slate-200 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Todos
                    </button>
                    {mockBrands.map((brand, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedBrand(brand)}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all shrink-0 ${
                          selectedBrand === brand ? 'bg-secondary text-white border-secondary' : 'bg-white dark:bg-zinc-900 border-slate-200 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suggestions / Search history */}
                {!searchText && (
                  <div className="space-y-3.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Buscas Recentes</span>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((hist, idx) => (
                        <div 
                          key={idx}
                          onClick={() => setSearchText(hist)}
                          className="px-3.5 py-1.5 bg-slate-100 dark:bg-zinc-900/60 border border-slate-200/30 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-200"
                        >
                          {hist}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search outcomes */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resultados ({filteredManuals.length})</span>
                  {filteredManuals.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-zinc-900/10 border border-slate-200 dark:border-zinc-800 rounded-3xl text-slate-400 text-xs space-y-2">
                      <p className="font-semibold">Nenhum resultado corresponde à pesquisa.</p>
                      <p className="text-[10px] text-slate-400">Tente buscar por termos mais simples, como "Ar" ou "CRM".</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredManuals.map((m) => (
                        <ManualCard key={m.id} manual={m} onOpen={handleOpenManual} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 space-y-5"
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Favoritos Organizados</h4>
                  <button className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova Pasta</span>
                  </button>
                </div>

                {/* Folders List */}
                <div className="space-y-3">
                  {favoriteFolders.map((fld) => (
                    <div key={fld.id} className="bg-white dark:bg-zinc-900/40 p-4 rounded-2xl border border-slate-100 dark:border-zinc-900/60 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <Folder className="w-4 h-4 text-primary fill-primary/10" />
                          <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">{fld.name}</h5>
                        </div>
                        <span className="text-[9px] bg-slate-100 px-2.5 py-0.5 rounded-full font-mono text-slate-500 font-bold">{fld.manualIds.length} itens</span>
                      </div>

                      {/* Display folder items */}
                      <div className="grid grid-cols-1 gap-2 border-t border-slate-50 dark:border-zinc-900/40 pt-2.5">
                        {fld.manualIds.map(manualId => {
                          const m = manuals.find(item => item.id === manualId);
                          if (!m) return null;
                          return (
                            <div 
                              key={manualId} 
                              onClick={() => handleOpenManual(m)}
                              className="p-2 bg-slate-50 dark:bg-zinc-950/40 border border-slate-100 dark:border-zinc-900/40 rounded-xl flex items-center justify-between hover:bg-slate-100/50 cursor-pointer text-xs font-semibold group"
                            >
                              <div className="flex items-center space-x-2 max-w-[85%]">
                                <img src={m.coverImage} className="w-6 h-8 rounded object-cover" />
                                <span className="text-slate-700 dark:text-slate-300 truncate">{m.title}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          );
                        })}
                        {fld.manualIds.length === 0 && (
                          <p className="text-[10px] text-slate-400 italic py-1">Sem itens adicionados nesta pasta.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'downloads' && (
              <motion.div
                key="downloads"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 space-y-5"
              >
                {/* Device Storage Status Indicator */}
                <div className="bg-white dark:bg-zinc-900/40 p-4.5 rounded-2xl border border-slate-100 dark:border-zinc-900/60 shadow-sm space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>Armazenamento Interno Offline</span>
                    <span className="font-mono text-primary font-black">{calculateDownloadsSize()} MB / 512 MB</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-premium transition-all" 
                      style={{ width: `${Math.min(100, (parseFloat(calculateDownloadsSize()) / 5.12))}%` }} 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Você pode acessar estes manuais em qualquer local de trabalho offline, mesmo sem internet móvel.
                  </p>
                </div>

                {/* Downloads List */}
                <div className="space-y-3">
                  <h4 className="font-display font-extrabold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Documentos Baixados ({downloadedManuals.length})</h4>
                  
                  {downloadedManuals.length === 0 ? (
                    <div className="p-8 text-center bg-white dark:bg-zinc-900/10 border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl text-slate-400 text-xs space-y-2">
                      <Download className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold">Nenhum manual salvo localmente.</p>
                      <p className="text-[10px] text-slate-400">Abra qualquer manual técnico e clique no ícone de download para salvar offline.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {downloadedManuals.map((dl) => {
                        const m = manuals.find(item => item.id === dl.manualId);
                        if (!m) return null;
                        return (
                          <div 
                            key={dl.id}
                            onClick={() => handleReadManual(m)}
                            className="bg-white dark:bg-zinc-900/40 p-3 rounded-2xl border border-slate-100 dark:border-zinc-900/60 hover:border-slate-200 shadow-sm flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center space-x-3 max-w-[75%]">
                              <img src={m.coverImage} className="w-8 h-10 rounded object-cover border" />
                              <div className="truncate">
                                <span className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-primary block truncate">{m.title}</span>
                                <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{dl.fileSize} • TW-LOCAL-FS</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2.5">
                              <span className="text-[9px] text-emerald-500 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">Pronto</span>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDownload(dl.id);
                                }}
                                className="p-1.5 bg-slate-50 dark:bg-zinc-950/40 text-red-500 rounded-full hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 space-y-6"
              >
                {/* User Info Stats Summary Banner */}
                <div className="bg-white dark:bg-zinc-900/40 p-5 rounded-3xl border border-slate-100 dark:border-zinc-900/60 shadow-sm flex flex-col items-center text-center">
                  <div className="relative">
                    <img 
                      src={user.avatarUrl} 
                      alt={user.fullName} 
                      className="w-16 h-16 rounded-full object-cover border-4 border-primary/20 shadow-sm"
                    />
                    {user.isPremium && (
                      <span className="absolute bottom-0 right-0 bg-amber-500 p-1 rounded-full border-2 border-white shadow-sm">
                        <Crown className="w-3 h-3 text-white fill-white" />
                      </span>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <div className="mt-3.5 flex items-center space-x-2">
                      <input 
                        type="text" 
                        className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary text-slate-900"
                        value={profileNameInput}
                        onChange={(e) => setProfileNameInput(e.target.value)}
                      />
                      <button 
                        onClick={() => {
                          setUser({ ...user, fullName: profileNameInput });
                          setIsEditingProfile(false);
                        }}
                        className="p-2 bg-primary text-white rounded-xl text-xs font-bold"
                      >
                        Salvar
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3.5">
                      <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-base leading-none">
                        {user.fullName}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium block mt-1.5">{user.email}</span>
                    </div>
                  )}

                  {/* Profile statistics grids */}
                  <div className="grid grid-cols-4 gap-2 w-full border-t border-slate-50 dark:border-zinc-900/40 pt-4 mt-4 text-center">
                    <div>
                      <span className="font-display font-black text-slate-800 dark:text-white text-base block">{user.stats.manualsViewed}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Lidos</span>
                    </div>
                    <div>
                      <span className="font-display font-black text-slate-800 dark:text-white text-base block">{user.stats.downloadsCount}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Salvos</span>
                    </div>
                    <div>
                      <span className="font-display font-black text-slate-800 dark:text-white text-base block">{user.stats.favoritesCount}</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Pastas</span>
                    </div>
                    <div>
                      <span className="font-display font-black text-slate-800 dark:text-white text-base block">{user.stats.readingTimeMinutes}m</span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Estudos</span>
                    </div>
                  </div>
                </div>

                {/* Settings & Subscriptions */}
                <div className="bg-white dark:bg-zinc-900/40 rounded-3xl border border-slate-100 dark:border-zinc-900/60 shadow-sm overflow-hidden divide-y divide-slate-50 dark:divide-zinc-900/40">
                  
                  {/* Premium subscription status */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Crown className="w-4 h-4 text-amber-500 fill-amber-500/10" />
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Assinatura Premium</span>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          {user.isPremium ? 'Ativo até Dezembro 2030' : 'Acesso Grátis com Anúncios'}
                        </span>
                      </div>
                    </div>
                    {!user.isPremium && (
                      <button 
                        onClick={() => setIsPremiumOpen(true)}
                        className="px-3 py-1.5 bg-gradient-premium text-white text-[10px] font-bold rounded-lg shadow-sm"
                      >
                        Assinar
                      </button>
                    )}
                  </div>

                  {/* Dark Mode toggle */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-500" />}
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Modo Escuro</span>
                    </div>
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 ${darkMode ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Edit profile */}
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsEditingProfile(!isEditingProfile)}>
                    <div className="flex items-center space-x-2.5">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Editar Perfil</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                </div>

                {/* Integrated Contact Feedback Form */}
                <div className="bg-white dark:bg-zinc-900/40 p-4.5 rounded-3xl border border-slate-100 dark:border-zinc-900/60 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-primary" />
                    <h5 className="font-display font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">Suporte & Sugestões</h5>
                  </div>
                  
                  {feedbackSuccess && (
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-semibold border border-emerald-100 flex items-center space-x-1.5">
                      <CheckCircle className="w-4 h-4" />
                      <span>Mensagem enviada com sucesso ao suporte técnico!</span>
                    </div>
                  )}

                  <form onSubmit={handleFeedbackSubmit} className="space-y-2">
                    <textarea 
                      rows={2}
                      placeholder="Relate um manual em falta ou peça ajuda com o faturamento..."
                      className="w-full p-3 bg-slate-50 dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-medium focus:outline-none focus:border-primary text-slate-950 dark:text-white"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Mensagem</span>
                    </button>
                  </form>
                </div>

                {/* Logout */}
                <button 
                  onClick={() => setUser(null)}
                  className="w-full py-3.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl font-bold text-xs flex items-center justify-center space-x-2 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair da Conta Profissional</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Global Bottom Navigation Bar */}
        <nav className="absolute bottom-0 inset-x-0 h-16 bg-white/95 dark:bg-[#16161C] backdrop-blur-md border-t border-slate-100 dark:border-white/5 flex items-center justify-around px-2 z-10 select-none">
          
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${
              activeTab === 'home' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[9px] font-bold mt-1">Início</span>
          </button>

          <button 
            onClick={() => setActiveTab('search')}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${
              activeTab === 'search' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Search className={`w-5 h-5 ${activeTab === 'search' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[9px] font-bold mt-1">Busca</span>
          </button>

          <button 
            onClick={() => setActiveTab('favorites')}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${
              activeTab === 'favorites' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${activeTab === 'favorites' ? 'stroke-[2.5] fill-primary/10' : 'stroke-[2]'}`} />
            <span className="text-[9px] font-bold mt-1">Favoritos</span>
          </button>

          <button 
            onClick={() => setActiveTab('downloads')}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${
              activeTab === 'downloads' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Download className={`w-5 h-5 ${activeTab === 'downloads' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[9px] font-bold mt-1">Offline</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${
              activeTab === 'profile' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            <span className="text-[9px] font-bold mt-1">Perfil</span>
          </button>

        </nav>

        {/* Floating Manual Detailed Spec Sheet / Modal drawer */}
        <AnimatePresence>
          {selectedManual && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-20 flex flex-col justify-end">
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white dark:bg-zinc-900 rounded-t-[32px] p-5 shadow-2xl max-h-[85%] overflow-y-auto space-y-5 border-t dark:border-zinc-800"
              >
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full mx-auto" onClick={() => setSelectedManual(null)} />
                
                <div className="flex items-start space-x-4 pt-2">
                  <img src={selectedManual.coverImage} className="w-20 h-24 rounded-xl object-cover shadow-md border" />
                  
                  <div className="flex-1 space-y-1">
                    <span className="text-[9px] font-extrabold uppercase bg-primary/5 text-primary px-2.5 py-0.5 rounded-md">
                      {selectedManual.category}
                    </span>
                    <h3 className="font-display font-bold text-slate-800 dark:text-white text-base leading-snug">
                      {selectedManual.title}
                    </h3>
                    <div className="flex items-center space-x-2 font-mono text-[10px] text-slate-400 mt-1">
                      <span>Fabricante: <strong className="text-slate-700 dark:text-slate-300">{selectedManual.brand}</strong></span>
                      <span>•</span>
                      <span>Mod: <strong className="text-slate-700 dark:text-slate-300">{selectedManual.model}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Grid Technical specs */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-950/40 p-4 rounded-2xl border text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold text-[8px] uppercase tracking-wider">Tamanho do Arquivo</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedManual.fileSize}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[8px] uppercase tracking-wider">Número de Páginas</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedManual.pages} páginas</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[8px] uppercase tracking-wider">Publicação</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">{selectedManual.publicationDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[8px] uppercase tracking-wider">Compatibilidade</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate" title={selectedManual.compatibleEquipment.join(', ')}>
                      {selectedManual.compatibleEquipment[0]} (+{selectedManual.compatibleEquipment.length - 1})
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Resumo Técnico</span>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    {selectedManual.description}
                  </p>
                </div>

                {/* Bottom button controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={() => toggleFavorite(selectedManual.id)}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                      isFavorited(selectedManual.id)
                        ? 'bg-red-500/10 text-red-500 border-red-500/20'
                        : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorited(selectedManual.id) ? 'fill-red-500' : ''}`} />
                  </button>

                  <button
                    onClick={() => handleSaveOffline(selectedManual.id)}
                    className={`p-3 rounded-xl border flex items-center justify-center transition-all ${
                      isDownloaded(selectedManual.id)
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300'
                    }`}
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleReadManual(selectedManual)}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Abrir Manual Técnico</span>
                    <BookOpen className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Full-Screen PDF Reader Overlay Frame */}
        <AnimatePresence>
          {activePdfReader && (
            <PdfReader 
              manual={activePdfReader}
              isAlreadyDownloaded={isDownloaded(activePdfReader.id)}
              onDownloadOffline={handleSaveOffline}
              onClose={(lastPage, progressPercent) => {
                // Update reading progress
                setReadingHistory(readingHistory.map(h => 
                  h.manualId === activePdfReader.id 
                    ? { ...h, lastPage, progressPercent, lastReadAt: 'Agora' } 
                    : h
                ));
                setActivePdfReader(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Rewarded Ad Video Simulator Modal Overlay */}
        <AnimatePresence>
          {rewardedAdManual && (
            <RewardedAd 
              manualTitle={rewardedAdManual.title}
              onAdCompleted={handleAdUnlock}
              onClose={() => setRewardedAdManual(null)}
            />
          )}
        </AnimatePresence>

        {/* Premium Plan Checkout Subscription Modal Overlay */}
        <AnimatePresence>
          {isPremiumOpen && (
            <PremiumModal 
              user={user}
              onClose={() => setIsPremiumOpen(false)}
              onSubscribeSuccess={handleSubscribe}
            />
          )}
        </AnimatePresence>

        {/* Complete Administrative Dashboard Panel */}
        <AnimatePresence>
          {isAdminOpen && (
            <AdminPanel 
              manuals={manuals}
              categories={mockCategories}
              brands={mockBrands}
              onAddManual={handleAddManual}
              onUpdateManual={handleUpdateManual}
              onDeleteManual={handleDeleteManual}
              onClose={() => setIsAdminOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* System & Commercial Alerts Notification Banner sidebar */}
        <AnimatePresence>
          {notificationOpen && (
            <NotificationBanner 
              notifications={notifications}
              onMarkAsRead={markNotificationRead}
              onClearAll={clearNotifications}
              onClose={() => setNotificationOpen(false)}
            />
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
