import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { AddLoss } from "./components/AddLoss";
import { LossTable } from "./components/LossTable";
import { ExportButtons } from "./components/ExportButtons";
import { CategoryDrawer } from "./components/CategoryDrawer";
import { API_BASE_URL } from "./config/api";
import { LossTypeTabs } from "./components/LossTypeTabs";
import { HistoryModal } from "./components/HistoryModal";
import { BottomNav, type AppTab } from "./components/BottomNav";
import { ExportView } from "./components/ExportView";

interface Loss {
  id: number;
  product: string;
  quantity: number;
  size: string | null;
  unit: string;
  created_at: string;
}

export interface ProductItem {
  name: string;
  sizes: string[] | null;
  subcategory: string | null;
  unit_type: 'unit' | 'weight' | 'pieces' | 'liquid';
}

export interface ProductSubcategory {
  name: string;
  products: ProductItem[];
}

export interface ProductCategory {
  label: string;
  icon: string | null;
  subcategories: ProductSubcategory[];
  products: ProductItem[];
}

export default function App() {
  const [losses, setLosses] = useState<Loss[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [lossType, setLossType] = useState<'complet' | 'vide'>('vide');
  const [searchQuery, setSearchQuery] = useState("");
  const [historyDate, setHistoryDate] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mobile tab: accueil (dicter + produits together) | exporter
  const [activeTab, setActiveTab] = useState<AppTab>('accueil');

  const globalDateInputRef = useRef<HTMLInputElement>(null);
  const manualChangeRef = useRef(false);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchLosses = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/losses`);
      const data = await response.json();
      setLosses(data);
    } catch (e) {
      console.error("Erreur lors du chargement des pertes", e);
    }
  }, []);

  useEffect(() => { fetchLosses(); }, [fetchLosses]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?type=${lossType}`);
      const data = await response.json();
      setCategories(data);
      if (data.length > 0) {
        const stillExists = data.some((c: ProductCategory) => c.label === activeCategory);
        if (!activeCategory || !stillExists) setActiveCategory(data[0].label);
      }
    } catch (e) {
      console.error("Erreur lors du chargement des produits", e);
    }
  };

  useEffect(() => { fetchProducts(); }, [lossType]);

  // Auto-scroll on manual category change
  useEffect(() => {
    if (manualChangeRef.current && activeCategory && !searchQuery && categories.length > 0) {
      const timer = setTimeout(() => {
        scrollToCategory(activeCategory);
        manualChangeRef.current = false;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [categories]);

  // ── IntersectionObserver for active category ─────────────────────────────────

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const margin = isMobile ? "-210px 0px -80% 0px" : "-160px 0px -85% 0px";

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length > 0) {
          intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const label = categories.find(
            (c) => c.label.toLowerCase().replace(/\s+/g, '-') === intersecting[0].target.id
          )?.label;
          if (label) setActiveCategory(label);
        }
      },
      { threshold: 0, rootMargin: margin }
    );

    categories.forEach((cat) => {
      const el = document.getElementById(cat.label.toLowerCase().replace(/\s+/g, '-'));
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  // ── Navigation helpers ────────────────────────────────────────────────────────

  const handleTypeChange = (type: 'complet' | 'vide') => {
    manualChangeRef.current = true;
    setLossType(type);
  };

  const scrollToCategory = (label: string) => {
    const id = label.toLowerCase().replace(/\s+/g, '-');
    const element = document.getElementById(id);
    if (element) {
      setActiveCategory(label);
      const isMobile = window.innerWidth < 768;
      const offset = isMobile ? 210 : 160;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const offsetPosition = elementRect - bodyRect - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f5f5f5' }}>
      <Header onReset={fetchLosses} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* ══════════════════ MOBILE LAYOUT ══════════════════ */}
      <div className="md:hidden flex flex-col flex-1">

        {/* ── Tab: Accueil (Dicter + Produits sur la même page) ── */}
        {activeTab === 'accueil' && (
          <div className="flex-1">

            {/* Voice panel compact — always visible at top */}
            <div className="px-4 pt-4">
              <AddLoss onLossAdded={fetchLosses} variant="compact" />
            </div>

            {/* Sticky controls: type tabs + search */}
            <div
              className="sticky z-20 bg-white border-b border-slate-100"
              style={{ top: 'calc(env(safe-area-inset-top, 0px) + 56px)' }}
            >
              <div className="px-4 pt-3 pb-2">
                <LossTypeTabs activeType={lossType} onChange={handleTypeChange} />
              </div>
              <div className="px-4 pb-3">
                <label className="relative flex items-center">
                  <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-sm font-semibold focus:outline-none"
                    style={{ background: '#f5f5f5', border: '2px solid transparent', color: '#1a1a1a' }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute right-3 text-slate-400 active:scale-90">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  )}
                </label>
              </div>
            </div>

            {/* Product grid */}
            <div className="px-4 pb-bottom-nav">
              <LossTable
                losses={losses}
                categories={categories}
                searchQuery={searchQuery}
                onUpdate={fetchLosses}
              />
            </div>
          </div>
        )}

        {/* ── Tab: Exporter (PDF + Email + Historique + Reset) ── */}
        {activeTab === 'exporter' && (
          <ExportView
            onReset={fetchLosses}
            onHistorySelect={(date) => setHistoryDate(date)}
          />
        )}
      </div>

      {/* ══════════════════ DESKTOP LAYOUT ══════════════════ */}
      <div className="hidden md:block w-full max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6 lg:gap-8 items-start">

          {/* Left sidebar */}
          <aside className="w-[300px] lg:w-[340px] shrink-0 sticky top-[88px] flex flex-col gap-4 h-[calc(100vh-110px)] overflow-y-auto no-scrollbar">
            <AddLoss onLossAdded={fetchLosses} variant="compact" />

            <LossTypeTabs activeType={lossType} onChange={handleTypeChange} />

            {/* Category nav */}
            <nav className="flex flex-col gap-2 bg-white rounded-3xl p-6 card-shadow">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest text-center mb-2">
                📂 Catégories
              </h3>
              {categories.map((cat) => {
                const isActive = activeCategory === cat.label;
                const isImageIcon = cat.icon && (cat.icon.startsWith('/') || cat.icon.startsWith('http'));
                return (
                  <button
                    key={cat.label}
                    onClick={() => scrollToCategory(cat.label)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
                    style={{
                      background: isActive ? '#00420b' : 'transparent',
                      color: isActive ? '#ffffff' : '#475569',
                    }}
                  >
                    {cat.icon ? (
                      isImageIcon ? (
                        <img src={cat.icon} alt="" className="w-8 h-8 object-contain rounded" />
                      ) : (
                        <span className="text-2xl w-8 h-8 flex items-center justify-center">{cat.icon}</span>
                      )
                    ) : (
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                        style={{ background: isActive ? 'rgba(255,255,255,0.2)' : '#f1f5f9', color: isActive ? '#fff' : '#94a3b8' }}
                      >
                        {cat.label.charAt(0)}
                      </span>
                    )}
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: isActive ? 'rgba(0,0,0,0.15)' : '#f1f5f9',
                        color: isActive ? '#fff' : '#94a3b8',
                      }}
                    >
                      {cat.subcategories.reduce((a, s) => a + s.products.length, 0) + cat.products.length}
                    </span>
                  </button>
                );
              })}
            </nav>

            <ExportButtons onReset={fetchLosses} onHistorySelect={(date) => setHistoryDate(date)} />
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div
              className="sticky z-20 mb-4 py-2"
              style={{ top: 'calc(env(safe-area-inset-top, 0px) + 56px)', background: '#f5f5f5' }}
            >
              <label className="relative flex items-center">
                <div className="absolute left-4 text-slate-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none"
                  style={{ background: '#ffffff', border: '2px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                />
              </label>
            </div>

            <LossTable
              losses={losses}
              categories={categories}
              searchQuery={searchQuery}
              onUpdate={fetchLosses}
            />
          </main>
        </div>
      </div>

      {/* ── Modals & overlays ── */}
      {historyDate && (
        <HistoryModal date={historyDate} onClose={() => setHistoryDate(null)} />
      )}

      {/* Floating Categories button + drawer */}
      {!historyDate && (
        <CategoryDrawer
          categories={categories}
          activeCategory={activeCategory}
          onCategoryClick={scrollToCategory}
        />
      )}

      {/* Bottom Nav — mobile only, 2 tabs */}
      <BottomNav activeTab={activeTab} onChange={setActiveTab} />

      {/* Hidden global date input */}
      <input
        id="global-date-input"
        ref={globalDateInputRef}
        type="date"
        max={new Date().toISOString().split("T")[0]}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-px opacity-0 pointer-events-none"
        onChange={(e) => setTempDate(e.target.value)}
        onBlur={() => {
          if (tempDate) {
            setHistoryDate(tempDate);
            setTempDate(null);
          }
        }}
      />
    </div>
  );
}