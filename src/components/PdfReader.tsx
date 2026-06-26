import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ZoomIn, ZoomOut, Search, Bookmark, Sun, Moon, RotateCw, 
  ChevronLeft, ChevronRight, List, Info, Download, Check 
} from 'lucide-react';
import { Manual } from '../types';

interface PdfReaderProps {
  manual: Manual;
  onClose: (lastPage: number, progressPercent: number) => void;
  onDownloadOffline?: (manualId: string) => void;
  isAlreadyDownloaded?: boolean;
}

export default function PdfReader({ manual, onClose, onDownloadOffline, isAlreadyDownloaded = false }: PdfReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [downloadSuccess, setDownloadSuccess] = useState(isAlreadyDownloaded);
  const [downloading, setDownloading] = useState(false);

  // Load random bookmarks for realistic state
  useEffect(() => {
    setBookmarks([3, 12]);
  }, []);

  const totalPages = manual.pages || 32;

  const toggleBookmark = () => {
    if (bookmarks.includes(currentPage)) {
      setBookmarks(bookmarks.filter(p => p !== currentPage));
    } else {
      setBookmarks([...bookmarks, currentPage]);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleDownload = () => {
    if (downloadSuccess) return;
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      if (onDownloadOffline) {
        onDownloadOffline(manual.id);
      }
    }, 2000);
  };

  // Simulated content for pages based on the manual category
  const getPageContent = (page: number) => {
    if (page === 1) {
      return {
        section: "Capa do Equipamento",
        title: manual.title,
        brand: manual.brand,
        model: manual.model,
        diagram: "CENTRAL_UNIT_BLOCK_M_V5",
        text: `ESPECIFICAÇÕES DE SERVIÇO DE ENGENHARIA\n\nPublicado em: ${manual.publicationDate}\nTamanho do arquivo: ${manual.fileSize}\n\nAVISO DE SEGURANÇA: Somente pessoal técnico qualificado e registrado deve realizar procedimentos de manutenção corretiva.`
      };
    }

    if (page === 2) {
      return {
        section: "Seção 1: Códigos de Diagnóstico",
        title: "Tabela Completa de Códigos de Erro",
        brand: manual.brand,
        model: manual.model,
        diagram: "ERROR_LOGIC_MATRIX",
        text: `[CÓDIGO ER1] - Falha de Comunicação Serial entre Condensadora e Evaporadora.\nSolução: Verificar cabo de interligação de sinal (Borne 3) e medir tensão de pulso DC.\n\n[CÓDIGO ER2] - Circuito Aberto / Curto no Sensor de Temperatura de Sucção.\nSolução: Medir resistência do sensor de 10kΩ a 25°C.\n\n[CÓDIGO ER3] - Pressão Excessiva do Fluido Refrigerante.\nSolução: Checar obstrução do filtro de ar ou capilar entupido.`
      };
    }

    if (page === 3) {
      return {
        section: "Seção 2: Diagrama de Comando",
        title: "Diagrama Elétrico de Conexão - Placa Inverter",
        brand: manual.brand,
        model: manual.model,
        diagram: "SCHEMATIC_WIRING_PLATE_V3",
        text: `DETALHAMENTO DO CIRCUITO DE FORÇA:\n- Entrada AC: L1 / L2 / G (Terra)\n- Módulo de Potência IPM (U, V, W) acoplado diretamente ao motor compressor.\n- Relé auxiliar de partida do microventilador externo: Saída de 12VDC regulada.\n- Sensor de corrente shunt acoplado ao circuito de retorno do barramento retificador.`
      };
    }

    if (page === 4) {
      return {
        section: "Seção 3: Testes Físicos",
        title: "Testes Estáticos de Compressores e Bobinas",
        brand: manual.brand,
        model: manual.model,
        diagram: "COMPRESSOR_WINDING_TEST",
        text: `ROTINA DE REPARO DE BOBINAS:\n1. Desconecte a alimentação geral.\n2. Meça a resistência nos três bornes do compressor (C, R, S).\n3. Verifique se há curto-circuito para a massa metálica externa do motor.\nValores de referência: Resistência ôhmica simétrica de 1.8Ω a 3.2Ω em temperatura ambiente.`
      };
    }

    // Default general page
    return {
      section: `Seção ${page - 1}: Anexos e Especificações`,
      title: `Catálogo de Peças Explodidas - Pág ${page}`,
      brand: manual.brand,
      model: manual.model,
      diagram: "EXPLODED_VIEW_BODY_SHEET",
      text: `TABELA DE PEÇAS SOBRESSALENTES:\n- Item 14: Damper Eletrônico Redutores de Fluxo\n- Item 27: Microventilador Axial Blindado Inverter\n- Item 42: Termofusível de Proteção Térmica do Evaporador (Fusível térmico aciona a 72°C)\n\nPara encomendar peças originais, mencione o Product Code localizado na etiqueta traseira do produto.`
    };
  };

  const activeContent = getPageContent(currentPage);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase();
    const matches: string[] = [];
    
    // Scan simulated pages for match
    for (let i = 1; i <= 5; i++) {
      const content = getPageContent(i);
      if (content.text.toLowerCase().includes(query) || content.title.toLowerCase().includes(query)) {
        matches.push(`Pág ${i}: ${content.section} - "${content.title}"`);
      }
    }
    setSearchResults(matches);
  };

  const progressPercent = Math.round((currentPage / totalPages) * 100);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${isDarkMode ? 'bg-[#0F0F12] text-slate-100' : 'bg-slate-100 text-slate-800'} font-sans`}>
      
      {/* Top Header Controls */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${isDarkMode ? 'bg-[#16161C] border-white/5' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onClose(currentPage, progressPercent)}
            className="p-1.5 hover:bg-slate-500/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div>
            <h4 className="font-display font-bold text-xs tracking-tight line-clamp-1">
              {manual.brand} - {manual.model}
            </h4>
            <span className="text-[9px] font-mono opacity-60">
              PDF Built-in • {currentPage}/{totalPages} Pág.
            </span>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex items-center space-x-1.5 sm:space-x-3">
          {/* Zoom controls */}
          <button 
            onClick={() => setZoom(z => Math.max(50, z - 25))} 
            className="p-1.5 hover:bg-slate-500/10 rounded-full transition-colors hidden sm:inline-flex"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-semibold opacity-80 hidden sm:inline-block w-8 text-center">{zoom}%</span>
          <button 
            onClick={() => setZoom(z => Math.min(200, z + 25))} 
            className="p-1.5 hover:bg-slate-500/10 rounded-full transition-colors hidden sm:inline-flex"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Quick download */}
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className={`p-1.5 rounded-full transition-colors ${
              downloadSuccess 
                ? 'text-emerald-500 bg-emerald-500/10' 
                : 'hover:bg-slate-500/10 text-primary'
            }`}
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : downloadSuccess ? (
              <Check className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          {/* Toggle Sidebar */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className={`p-1.5 rounded-full transition-colors ${isSidebarOpen ? 'bg-primary/10 text-primary' : 'hover:bg-slate-500/10'}`}
            title="Sumário de Páginas"
          >
            <List className="w-4 h-4" />
          </button>

          {/* Search inside */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            className={`p-1.5 rounded-full transition-colors ${isSearchOpen ? 'bg-primary/10 text-primary' : 'hover:bg-slate-500/10'}`}
            title="Buscar Termo"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Bookmarks */}
          <button 
            onClick={toggleBookmark} 
            className={`p-1.5 rounded-full transition-colors ${bookmarks.includes(currentPage) ? 'text-amber-500' : 'hover:bg-slate-500/10'}`}
            title="Favoritar Página"
          >
            <Bookmark className={`w-4 h-4 ${bookmarks.includes(currentPage) ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Dark Mode */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-1.5 hover:bg-slate-500/10 rounded-full transition-colors"
            title="Modo Noturno Leitura"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Orientation Rotate */}
          <button 
            onClick={() => setIsLandscape(!isLandscape)} 
            className={`p-1.5 rounded-full transition-colors ${isLandscape ? 'bg-primary/10 text-primary' : 'hover:bg-slate-500/10'}`}
            title="Rotacionar Tela"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Panel Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Thumbnails Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div 
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              className={`w-60 border-r shrink-0 flex flex-col z-10 ${
                isDarkMode ? 'bg-[#16161C] border-white/5' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="p-3.5 border-b border-inherit flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Miniaturas</span>
                <span className="text-[10px] bg-slate-500/10 px-2 py-0.5 rounded-full font-mono">{totalPages} págs</span>
              </div>
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {Array.from({ length: Math.min(8, totalPages) }).map((_, index) => {
                  const pNum = index + 1;
                  const thumbContent = getPageContent(pNum);
                  return (
                    <div 
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        currentPage === pNum 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : isDarkMode ? 'border-zinc-800 bg-zinc-950 hover:bg-zinc-800' : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="aspect-[3/4] bg-slate-500/5 rounded border border-slate-300/25 flex flex-col items-center justify-center p-1 relative overflow-hidden">
                        <span className="text-[8px] font-bold opacity-30 absolute top-1 left-1">P.{pNum}</span>
                        <div className="w-full h-1 bg-slate-400/20 rounded mt-2" />
                        <div className="w-3/4 h-1 bg-slate-400/20 rounded mt-1" />
                        
                        {/* Mock technical drawings representation in thumbnail */}
                        <div className="w-8 h-8 border border-dashed border-slate-400/30 rounded-full mt-2 flex items-center justify-center">
                          <span className="text-[6px] scale-[0.7] font-mono opacity-25">12V</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 block text-center mt-1 truncate">
                        {thumbContent.section}
                      </span>
                    </div>
                  );
                })}
                {totalPages > 8 && (
                  <div className="text-center py-2 text-[10px] text-slate-400 font-mono italic">
                    + {totalPages - 8} páginas adicionais...
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center PDF Render Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 items-center justify-center">
          
          {/* Advanced Search inside PDF drawer */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div 
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -30, opacity: 0 }}
                className={`absolute top-0 inset-x-0 p-3 shadow-md border-b z-20 ${
                  isDarkMode ? 'bg-[#16161C] border-white/5 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <form onSubmit={handleSearch} className="flex items-center space-x-2.5 max-w-lg mx-auto">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Buscar na apostila (Ex: erro, condensadora, IPM...)"
                    className="flex-1 text-xs py-1.5 focus:outline-none bg-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="text-xs bg-primary hover:bg-primary-dark text-white font-bold px-3 py-1 rounded-md">
                    Filtrar
                  </button>
                  <button type="button" onClick={() => { setIsSearchOpen(false); setSearchResults([]); }} className="text-xs text-slate-400">
                    Fechar
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="max-w-lg mx-auto mt-2.5 space-y-1.5 max-h-32 overflow-y-auto pt-2 border-t border-slate-500/15">
                    {searchResults.map((res, i) => (
                      <div 
                        key={i} 
                        onClick={() => {
                          const pNum = parseInt(res.match(/Pág (\d+):/)?.[1] || '1');
                          setCurrentPage(pNum);
                        }}
                        className="text-[10px] text-primary font-bold hover:underline cursor-pointer flex items-center space-x-1"
                      >
                        <span className="bg-primary/5 px-1 py-0.5 rounded text-[8px]">IR</span>
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Document Sheet Canvas */}
          <motion.div
            layout
            animate={{ 
              rotate: isLandscape ? 90 : 0,
              scale: zoom / 100
            }}
            transition={{ duration: 0.3 }}
            className={`w-full max-w-2xl aspect-[3/4] shadow-2xl rounded-2xl p-6 md:p-8 flex flex-col justify-between border select-text relative overflow-hidden ${
              isDarkMode 
                ? 'bg-[#1E1E24] border-white/5 text-slate-200' 
                : 'bg-white border-slate-300/60 text-slate-900'
            }`}
          >
            {/* Blueprint Grid Lines Watermark */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(106,27,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(106,27,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Document Header */}
            <div className="flex justify-between items-start border-b border-slate-500/10 pb-3 z-10">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                  {activeContent.section}
                </span>
                <h2 className="font-display font-extrabold text-sm sm:text-base mt-1 text-slate-800 dark:text-white">
                  {activeContent.title}
                </h2>
              </div>
              <div className="text-right">
                <span className="font-display font-extrabold text-xs text-primary block">
                  {activeContent.brand}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block font-semibold">
                  Mod: {activeContent.model}
                </span>
              </div>
            </div>

            {/* Technical Diagram Block (Simulates high-end Vector schemas) */}
            <div className={`my-4 flex-1 rounded-xl border flex flex-col items-center justify-center p-4 relative bg-slate-500/5 ${
              isDarkMode ? 'border-white/5 bg-[#0F0F12]/40' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <div className="absolute top-2.5 right-3 flex items-center space-x-1.5 text-slate-400 text-[8px] font-mono uppercase tracking-widest font-semibold">
                <Info className="w-2.5 h-2.5 text-primary" />
                <span>Figura {currentPage}.A / Diagrama Esquemático</span>
              </div>

              {/* Wire schematic mockups based on current page */}
              {currentPage === 1 && (
                <div className="space-y-1.5 text-center flex flex-col items-center py-4">
                  <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <img src={manual.coverImage} className="w-16 h-16 rounded-2xl object-cover" />
                  </div>
                  <span className="font-mono text-[10px] font-bold text-slate-500 mt-2">Tec W Servidores Cloud</span>
                </div>
              )}

              {currentPage === 2 && (
                <div className="w-full flex flex-col space-y-2 py-2">
                  <div className="flex space-x-2">
                    <div className="flex-1 h-6 bg-red-500/10 border border-red-500/20 rounded text-[9px] flex items-center justify-center font-mono font-bold text-red-500">ER1: SERIAL COM ERR</div>
                    <div className="flex-1 h-6 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] flex items-center justify-center font-mono font-bold text-amber-500">ER2: SUC SENSOR SC</div>
                  </div>
                  <div className="h-20 border border-dashed border-primary/20 rounded flex items-center justify-center relative">
                    <div className="absolute top-1 left-1 text-[7px] font-mono opacity-40">CHART_DIVERGENCE_MATRIX</div>
                    <div className="w-11/12 h-1 bg-gradient-premium rounded-full" />
                    <div className="w-2 h-2 bg-brand-orange rounded-full absolute left-1/3 animate-ping" />
                  </div>
                </div>
              )}

              {currentPage === 3 && (
                <div className="w-full space-y-1 font-mono text-[8px] opacity-80 leading-relaxed max-w-sm">
                  <div className="border border-primary/20 p-2.5 rounded bg-primary/5">
                    <span className="text-primary font-bold">1. AC FILTER STAGE</span>
                    <div className="flex justify-between mt-1 text-[7px] text-slate-400">
                      <span>L-IN ────────► [FUSE 15A] ────► [VARISTOR] ────► OUT-S</span>
                      <span>220VAC 60Hz</span>
                    </div>
                  </div>
                  <div className="border border-brand-blue/20 p-2.5 rounded bg-brand-blue/5">
                    <span className="text-brand-blue font-bold">2. RECTIFIER & DC-BUS</span>
                    <div className="flex justify-between mt-1 text-[7px] text-slate-400">
                      <span>AC-IN ──────► [BRIDGE DIODE] ──► [CHOKE] ─────► 310VDC</span>
                      <span>CAP 450V 820µF</span>
                    </div>
                  </div>
                </div>
              )}

              {currentPage >= 4 && (
                <div className="w-44 h-24 relative flex items-center justify-center">
                  {/* Circle gear loop */}
                  <div className="w-20 h-20 border-4 border-dashed border-primary/20 rounded-full animate-spin-slow flex items-center justify-center" />
                  <div className="w-12 h-12 border-2 border-brand-orange/30 rounded-full absolute flex items-center justify-center font-mono text-[8px] font-bold text-brand-orange">
                    MTR_1
                  </div>
                  <div className="absolute bottom-0 text-[7px] text-center w-full font-mono font-bold">TEST_PROBE_VOLTAGE (U,V,W)</div>
                </div>
              )}
            </div>

            {/* Explanatory instruction text */}
            <div className="space-y-2 z-10">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-primary font-mono flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span>Procedimentos e Notas</span>
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed font-sans whitespace-pre-line bg-slate-500/5 p-3.5 rounded-xl border border-slate-500/10">
                {activeContent.text}
              </p>
            </div>

            {/* Document Footer */}
            <div className="flex items-center justify-between border-t border-slate-500/10 pt-3 mt-4 text-[10px] font-mono font-semibold text-slate-400 z-10">
              <span>Tec W Manuais Pro • {manual.brand}</span>
              <span className="text-slate-500">Pág {currentPage} de {totalPages}</span>
              <span>DocRef: #TW-{manual.id.toUpperCase()}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Floating Navigation Toolbar */}
      <div className={`px-4 py-3 flex items-center justify-between border-t ${isDarkMode ? 'bg-[#16161C] border-white/5' : 'bg-white border-slate-200'}`}>
        <button 
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-slate-500/5 hover:bg-slate-500/10 disabled:opacity-40 rounded-xl transition-all flex items-center space-x-1 text-xs font-semibold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        {/* Real-time reading progress slider */}
        <div className="flex-1 max-w-xs mx-4 text-center">
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mb-1">
            <span>Progresso</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        <button 
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-white disabled:opacity-40 rounded-xl transition-all flex items-center space-x-1 text-xs font-semibold"
        >
          <span>Avançar</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
