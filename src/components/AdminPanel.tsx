import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart as ChartIcon, Users, FileText, Download, Award, DollarSign, 
  Settings, Plus, Edit3, Trash2, CheckCircle, X, Eye, ThumbsUp, Crown, 
  TrendingUp, RefreshCw, FolderPlus, Grid, Award as BrandIcon 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';
import { Manual, Category } from '../types';

interface AdminPanelProps {
  manuals: Manual[];
  categories: Category[];
  brands: string[];
  onAddManual: (manual: Manual) => void;
  onUpdateManual: (manual: Manual) => void;
  onDeleteManual: (id: string) => void;
  onClose: () => void;
}

export default function AdminPanel({
  manuals,
  categories,
  brands,
  onAddManual,
  onUpdateManual,
  onDeleteManual,
  onClose
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'manuals' | 'categories' | 'ads'>('analytics');
  const [editingManual, setEditingManual] = useState<Manual | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Manual>>({});
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.name || '');

  // Analytics Metrics Simulation
  const metrics = [
    { label: 'Usuários Ativos', value: '4.820', icon: Users, change: '+12% esta semana', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
    { label: 'Assinantes Pro', value: '1.240', icon: Crown, change: '+8% este mês', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { label: 'Downloads Efetuados', value: '24.150', icon: Download, change: '+14.2% total', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { label: 'Faturamento Estimado', value: 'R$ 37.180', icon: DollarSign, change: 'Anualizado', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { label: 'Anúncios Premiados', value: '18.420', icon: Award, change: '+20% conversão', color: 'bg-red-50 text-red-600 border-red-100' },
    { label: 'Total de Manuais', value: manuals.length.toString(), icon: FileText, change: 'Biblioteca ativa', color: 'bg-slate-50 text-slate-600 border-slate-100' },
  ];

  // Simulated chart datasets
  const activeUserTimeline = [
    { day: 'Seg', users: 1200, views: 2400 },
    { day: 'Ter', users: 1800, views: 3100 },
    { day: 'Qua', users: 1600, views: 2900 },
    { day: 'Qui', users: 2100, views: 4200 },
    { day: 'Sex', users: 2500, views: 5100 },
    { day: 'Sáb', users: 1400, views: 2100 },
    { day: 'Dom', users: 1100, views: 1800 },
  ];

  const categoryViews = categories.map((cat, idx) => ({
    name: cat.name,
    views: [1200, 1500, 950, 2100, 450, 600, 800, 500, 700, 300][idx % 10] || 400,
    downloads: [400, 520, 280, 850, 120, 180, 240, 150, 210, 80][idx % 10] || 150
  }));

  const userDistribution = [
    { name: 'Assinantes Prata', value: 450 },
    { name: 'Assinantes Anuais Ouro', value: 790 },
    { name: 'Usuários Grátis com Ads', value: 3580 },
  ];

  const PIE_COLORS = ['#8E54FF', '#6A1BFF', '#94A3B8'];

  // Handle Create or Edit submission
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.model || !formData.brand) return;

    if (editingManual) {
      // Edit
      const updated: Manual = {
        ...editingManual,
        title: formData.title,
        brand: formData.brand,
        model: formData.model,
        category: formData.category || 'Air Conditioners',
        description: formData.description || '',
        keywords: formData.keywords || [],
        coverImage: formData.coverImage || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
        premium: formData.premium || false,
        updatedAt: new Date().toISOString()
      };
      onUpdateManual(updated);
    } else {
      // Create
      const created: Manual = {
        id: 'man_' + Math.random().toString(36).substr(2, 9),
        title: formData.title,
        brand: formData.brand,
        model: formData.model,
        category: formData.category || 'Air Conditioners',
        description: formData.description || 'Manual de reparo técnico adicionado pela administração.',
        keywords: formData.keywords || ['manual', formData.brand.toLowerCase(), formData.model.toLowerCase()],
        coverImage: formData.coverImage || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
        pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        premium: formData.premium || false,
        views: 0,
        downloads: 0,
        favorites: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pages: formData.pages || 32,
        fileSize: formData.fileSize || '4.5 MB',
        compatibleEquipment: [formData.model + ' 127V', formData.model + ' 220V'],
        publicationDate: new Date().toISOString().split('T')[0]
      };
      onAddManual(created);
    }

    setIsFormOpen(false);
    setEditingManual(null);
    setFormData({});
  };

  const startEdit = (manual: Manual) => {
    setEditingManual(manual);
    setFormData(manual);
    setIsFormOpen(true);
  };

  const startCreate = () => {
    setEditingManual(null);
    setFormData({
      title: '',
      brand: brands[0] || 'Brastemp',
      model: '',
      category: categories[0]?.name || 'Air Conditioners',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
      premium: false,
      pages: 40,
      fileSize: '5.2 MB',
      keywords: []
    });
    setIsFormOpen(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-100 z-30 flex flex-col font-sans select-none overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 bg-secondary text-white flex items-center justify-between border-b border-white/5">
        <div className="flex items-center space-x-3">
          <Settings className="w-5 h-5 text-brand-orange animate-spin-slow" />
          <div>
            <h2 className="font-display font-bold text-base leading-none">Painel de Administração</h2>
            <span className="text-[10px] font-mono text-white/50">Tec W Manuais Cloud Console</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Drawer Menu */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="p-4 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2.5 mb-2">GERENCIAMENTO</span>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2.5 ${
                activeTab === 'analytics' ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ChartIcon className="w-4 h-4" />
              <span>Análise & Métricas</span>
            </button>

            <button
              onClick={() => setActiveTab('manuals')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2.5 ${
                activeTab === 'manuals' ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Acervo de Manuais</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2.5 ${
                activeTab === 'categories' ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Categorias & Marcas</span>
            </button>

            <button
              onClick={() => setActiveTab('ads')}
              className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2.5 ${
                activeTab === 'ads' ? 'bg-primary/5 text-primary' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Campanhas de Ads</span>
            </button>
          </div>

          <div className="p-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono font-medium">
            Sessão segura: Admin-Root<br />
            IP: 192.168.10.45 • SSL Ativo
          </div>
        </div>

        {/* Right Dynamic Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Mobile Tab Selectors */}
          <div className="flex md:hidden border-b border-slate-200 pb-3 space-x-1 overflow-x-auto">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${activeTab === 'analytics' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}
            >
              Métricas
            </button>
            <button 
              onClick={() => setActiveTab('manuals')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${activeTab === 'manuals' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}
            >
              Manuais
            </button>
            <button 
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${activeTab === 'categories' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}
            >
              Categorias
            </button>
            <button 
              onClick={() => setActiveTab('ads')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold ${activeTab === 'ads' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'}`}
            >
              Ads
            </button>
          </div>

          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              {/* Bento-grid Analytics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.map((m, idx) => {
                  const IconComp = m.icon;
                  return (
                    <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 flex items-start justify-between relative overflow-hidden group hover:border-primary/20 transition-all">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{m.label}</span>
                        <h4 className="font-display font-black text-slate-800 text-2xl mt-1.5">{m.value}</h4>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">{m.change}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border ${m.color} shrink-0`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Analytical Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Timeline Active Users */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm">Visitas diárias e Leituras</h4>
                      <p className="text-[10px] text-slate-400">Total acumulado de cliques no Applet esta semana</p>
                    </div>
                    <span className="text-emerald-500 text-xs font-bold flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+14.8%</span>
                    </span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activeUserTimeline}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6A1BFF" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#6A1BFF" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="day" tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                        <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                        <Area type="monotone" dataKey="users" stroke="#6A1BFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUsers)" name="Usuários" />
                        <Area type="monotone" dataKey="views" stroke="#1D5CFF" strokeWidth={1.5} fillOpacity={0} name="Visualizações" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Categories view count */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h4 className="font-display font-bold text-slate-800 text-sm">Leituras por Categoria</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryViews}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 9, fill: '#64748B' }} />
                        <YAxis tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 10 }} />
                        <Bar dataKey="views" fill="#6A1BFF" radius={[4, 4, 0, 0]} name="Acessos" />
                        <Bar dataKey="downloads" fill="#FF6600" radius={[4, 4, 0, 0]} name="Downloads" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Subscriptions breakdown */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                  <h4 className="font-display font-bold text-slate-800 text-sm">Distribuição de Planos de Monetização</h4>
                  <div className="h-60 flex items-center">
                    <div className="flex-1 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {userDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 shrink-0 pr-4">
                      {userDistribution.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-[11px] font-semibold text-slate-500">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx] }} />
                          <span className="truncate max-w-[140px]">{item.name} ({item.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time actions feed */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3.5">
                  <h4 className="font-display font-bold text-slate-800 text-sm">Registro de Operações Cloud</h4>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto">
                    {[
                      { action: "E-mail de redefinição enviado", target: "julio.refri@gmail.com", time: "Há 2 min", status: "success" },
                      { action: "Manual aberto por anúncio", target: "man_003 (Washing)", time: "Há 4 min", status: "ad" },
                      { action: "Inscrição Premium Confirmada", target: "victorcraft264@gmail.com (Ouro)", time: "Há 12 min", status: "premium" },
                      { action: "Arquivo PDF baixado local", target: "man_004 (VRF Multi V)", time: "Há 22 min", status: "download" },
                      { action: "Adição de manual", target: "Ar Split Consul 9k", time: "Há 1 hora", status: "created" }
                    ].map((log, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-semibold">
                        <div>
                          <span className="text-slate-800">{log.action}</span>
                          <span className="text-slate-400 block font-mono text-[9px]">{log.target}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block">{log.time}</span>
                          <span className={`text-[8px] uppercase font-extrabold ${
                            log.status === 'premium' ? 'text-amber-500' : log.status === 'success' ? 'text-emerald-500' : 'text-primary'
                          }`}>{log.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'manuals' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-display font-bold text-slate-800 text-sm">Manuais Cadastrados ({manuals.length})</h4>
                  <p className="text-[10px] text-slate-400">Administre o acervo técnico e os privilégios de acesso</p>
                </div>
                <button
                  onClick={startCreate}
                  className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm shadow-primary/10 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Manual</span>
                </button>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[9px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Manual / Modelo</th>
                        <th className="py-3 px-4">Categoria</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Estatísticas</th>
                        <th className="py-3 px-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {manuals.map((manual) => (
                        <tr key={manual.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <img src={manual.coverImage} className="w-8 h-10 rounded object-cover border border-slate-200" />
                              <div>
                                <span className="text-slate-900 font-bold block leading-snug truncate max-w-[200px]">{manual.title}</span>
                                <span className="text-[10px] text-slate-400 font-mono">Mod: <span className="text-slate-700">{manual.model}</span> • {manual.brand}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[9px]">
                              {manual.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {manual.premium ? (
                              <span className="bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center space-x-1 uppercase">
                                <Crown className="w-2.5 h-2.5 fill-amber-700" />
                                <span>Premium</span>
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center uppercase">
                                Grátis
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-[10px] text-slate-500">
                            <div className="flex justify-center space-x-3.5">
                              <span title="Acessos">👁️ {manual.views}</span>
                              <span title="Downloads">📥 {manual.downloads}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center space-x-1.5">
                              <button 
                                onClick={() => startEdit(manual)}
                                className="p-1.5 hover:bg-primary/5 text-primary rounded-lg transition-colors"
                                title="Editar Cadastro"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => onDeleteManual(manual.id)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                title="Deletar Manual"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Categories List */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-bold text-slate-800 text-sm">Categorias Ativas ({categories.length})</h4>
                    <button className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1">
                      <FolderPlus className="w-3 h-3" />
                      <span>Nova Categoria</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold">
                        <div className="flex items-center space-x-3">
                          <div className="p-1.5 bg-primary/5 text-primary rounded-lg">
                            <Grid className="w-4 h-4" />
                          </div>
                          <span className="text-slate-800">{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">ID: {cat.id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands Manager */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-display font-bold text-slate-800 text-sm">Marcas Homologadas ({brands.length})</h4>
                    <button className="text-[10px] font-bold text-primary hover:underline flex items-center space-x-1">
                      <BrandIcon className="w-3 h-3" />
                      <span>Nova Marca</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {brands.map((b, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-center text-slate-700">
                        {b}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-6 animate-fade-in">
              <div>
                <h4 className="font-display font-bold text-slate-800 text-sm">Gerenciador de Campanhas AdMob</h4>
                <p className="text-[10px] text-slate-400">Controle patrocinadores de anúncios premiados e taxa de veiculação</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <h5 className="font-bold text-xs text-slate-700">Configurações Gerais</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-500">Taxa de Preenchimento (Fill Rate)</span>
                      <span className="font-mono font-bold text-slate-800">99.8%</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-500">Tempo de Anúncio Premiado</span>
                      <span className="font-mono font-bold text-slate-800">6 Segundos</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-500">ECPM Médio</span>
                      <span className="font-mono font-bold text-emerald-600">R$ 14,20</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <h5 className="font-bold text-xs text-slate-700">Patrocinadores Recomendados</h5>
                  <div className="space-y-2">
                    {['Elgin Compressores', 'Curso Split Inverter Pro', 'Brastemp Peças Direct'].map((partner, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1">
                        <span className="text-slate-600 font-semibold">{partner}</span>
                        <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-2 rounded font-mono font-bold">ATIVO</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Manual Creation/Editing Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="bg-secondary px-6 py-4 text-white flex justify-between items-center">
                <h4 className="font-display font-bold text-sm">
                  {editingManual ? 'Editar Manual Técnico' : 'Cadastrar Novo Manual'}
                </h4>
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Título do Manual</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Manual de Serviço Ar Condicionado"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white text-slate-950"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Marca</label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white text-slate-950"
                      value={formData.brand || brands[0]}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    >
                      {brands.map((b, i) => (
                        <option key={i} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Modelo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: BSI10 / BSV10"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white text-slate-950"
                      value={formData.model || ''}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Categoria</label>
                    <select
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white text-slate-950"
                      value={formData.category || categories[0]?.name}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 flex items-center pt-5">
                    <input 
                      type="checkbox"
                      id="premium_flag"
                      className="w-4 h-4 text-primary focus:ring-primary border-slate-200 rounded cursor-pointer"
                      checked={formData.premium || false}
                      onChange={(e) => setFormData({ ...formData, premium: e.target.checked })}
                    />
                    <label htmlFor="premium_flag" className="text-xs font-bold text-slate-700 ml-2 cursor-pointer flex items-center">
                      <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                      <span>Conteúdo Premium PRO</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Páginas</label>
                    <input 
                      type="number" 
                      placeholder="40"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white text-slate-950"
                      value={formData.pages || ''}
                      onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) || 30 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tamanho do Arquivo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 5.2 MB"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white text-slate-950"
                      value={formData.fileSize || ''}
                      onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descrição Técnica</label>
                  <textarea 
                    rows={3}
                    placeholder="Descreva detalhes dos testes de placa, esquemas e procedimentos..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white text-slate-950"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">URL da Imagem de Capa</label>
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-primary focus:bg-white text-slate-950"
                    value={formData.coverImage || ''}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-3 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
