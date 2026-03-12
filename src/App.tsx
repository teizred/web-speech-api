import { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { AddLoss } from "./components/AddLoss";
import { LossTable } from "./components/LossTable";
import { ExportButtons } from "./components/ExportButtons";
import { CategoryDrawer } from "./components/CategoryDrawer";
import { API_BASE_URL } from "./config/api";
import { LossTypeTabs } from "./components/LossTypeTabs";
import { HistoryModal } from "./components/HistoryModal";

interface Loss {
  id: number;
  product: string;
  quantity: number;
  size: string | null;
  unit: string;
  created_at: string;
}

// Structure d'un produit venant de l'API
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

// C'est le composant principal de l'app
export default function App() {
  const [losses, setLosses] = useState<Loss[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [lossType, setLossType] = useState<'complet' | 'vide'>('vide');
  const [searchQuery, setSearchQuery] = useState("");
  const [historyDate, setHistoryDate] = useState<string | null>(null);
  const [tempDate, setTempDate] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const globalDateInputRef = useRef<HTMLInputElement>(null);
  

  
  // Flag pour savoir si le changement vient d'un clic utilisateur
  const manualChangeRef = useRef(false);

  // Fonction pour charger la liste des pertes depuis le serveur
  const fetchLosses = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/losses`);
      const data = await response.json();
      setLosses(data); // On met à jour l'état avec les données reçues
    } catch (e) {
      console.error("Erreur lors du chargement des pertes", e);
    }
  }, []);

  // On charge les données initiales
  useEffect(() => {
    fetchLosses();
  }, [fetchLosses]);

  // Fonction pour charger les produits depuis la base de données
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?type=${lossType}`);
      const data = await response.json();
      setCategories(data);
      
      // On ne réinitialise la catégorie que si aucune n'est active ou si l'actuelle n'existe plus
      if (data.length > 0) {
        const stillExists = data.some((c: ProductCategory) => c.label === activeCategory);
        if (!activeCategory || !stillExists) {
          setActiveCategory(data[0].label);
        }
      }
    } catch (e) {
      console.error("Erreur lors du chargement des produits", e);
    }
  };

  // On recharge les produits quand le type change
  useEffect(() => {
    fetchProducts();
  }, [lossType]);

  // Auto-scroll vers la catégorie active quand les catégories sont mises à jour
  // UNIQUEMENT si c'est un changement manuel (clic sur bouton)
  useEffect(() => {
    if (manualChangeRef.current && activeCategory && !searchQuery && categories.length > 0) {
      const id = activeCategory.toLowerCase().replace(/\s+/g, '-');
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          scrollToCategory(activeCategory);
        }
        manualChangeRef.current = false; // Reset après le scroll
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [categories]);

  const handleTypeChange = (type: 'complet' | 'vide') => {
    manualChangeRef.current = true;
    setLossType(type);
  };

  // Detection de la section active pour la bottom nav
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const margin = isMobile ? "-210px 0px -80% 0px" : "-160px 0px -85% 0px";

    const observer = new IntersectionObserver(
      (entries) => {
        // On récupère toutes les sections qui intersectent
        const intersecting = entries.filter(e => e.isIntersecting);
        
        if (intersecting.length > 0) {
          // On trie par position top pour prendre celle qui est la plus haute dans la zone de détection
          intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          const topVisible = intersecting[0];
          
          const label = categories.find(c => c.label.toLowerCase().replace(/\s+/g, '-') === topVisible.target.id)?.label;
          if (label) setActiveCategory(label);
        }
      },
      { threshold: 0, rootMargin: margin }
    );

    categories.forEach((cat) => {
      const id = cat.label.toLowerCase().replace(/\s+/g, '-');
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  // Fonction pour scroller vers une catégorie
  const scrollToCategory = (label: string) => {
    const id = label.toLowerCase().replace(/\s+/g, '-');
    const element = document.getElementById(id);
    if (element) {
      setActiveCategory(label);
      
      // Décalage adaptatif pour mobile/desktop (prend en compte le header + contrôles sticky)
      const isMobile = window.innerWidth < 768;
      const offset = isMobile ? 210 : 160; 
      
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0">
      {/* Header McDonald's with Mobile Menu Support */}
      <Header onReset={fetchLosses} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      {/* Contenu principal — layout adaptatif selon le wireframe */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex flex-col md:flex-row md:gap-6 lg:gap-8 items-start">
          
          {/* Colonne gauche : micro + catégories (side) + export (Desktop) */}
          <aside className="w-full md:w-[300px] lg:w-[340px] md:shrink-0 md:sticky md:top-[88px] flex flex-col gap-1.5 md:gap-4 md:h-[calc(100vh-110px)] md:overflow-y-auto no-scrollbar">
            <AddLoss onLossAdded={fetchLosses} />
            
            {/* Barre de contrôles (Desktop uniquement ici, car Mobile est géré plus bas pour être globalement sticky) */}
            <div className="hidden md:block">
              <LossTypeTabs activeType={lossType} onChange={handleTypeChange} />
            </div>
            
            {/* Menu catégories Sidebar (Uniquement Desktop/Tablette) */}
            <nav className="hidden md:flex flex-col gap-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-center mb-2">
                📂 Catégories
              </h3>
              {categories.map((cat) => {
                const isActive = activeCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => scrollToCategory(cat.label)}
                    className={`w-full justify-start px-5 py-4 rounded-2xl text-base font-bold transition-all flex items-center gap-4 active:scale-[0.98]
                      ${isActive ? 'bg-[#FFC72C] text-slate-900 shadow-md ring-2 ring-[#FFC72C]/20' : 'hover:bg-slate-100 text-slate-700'}
                    `}
                  >
                    {cat.icon ? (
                      cat.icon.startsWith('/') || cat.icon.startsWith('http') ? (
                        <img src={cat.icon} alt={cat.label} className="w-9 h-9 object-contain rounded-md" />
                      ) : (
                        <span className="text-3xl w-9 h-9 flex items-center justify-center">{cat.icon}</span>
                      )
                    ) : (
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                        {cat.label.charAt(0)}
                      </span>
                    )}
                    <span className="flex-1 text-left leading-tight">{cat.label}</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${isActive ? 'bg-black/10 text-slate-900' : 'bg-slate-100 text-slate-400'}`}>
                      {cat.subcategories.reduce((acc, sub) => acc + sub.products.length, 0) + cat.products.length}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="hidden md:flex flex-col gap-4 mt-2">
              <ExportButtons onReset={fetchLosses} onHistorySelect={(date: string) => setHistoryDate(date)} />
            </div>
          </aside>

          {/* Colonne droite : recherche + grille de produits */}
          <main className="w-full md:flex-1 md:min-w-0">
            {/* Barre de contrôles collante sur Mobile (Placée ici pour être sticky par rapport au défilement de la liste) */}
            <div className="md:hidden sticky top-[calc(env(safe-area-inset-top,0px)+56px)] z-30 bg-slate-50/95 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 mb-2">
              <LossTypeTabs activeType={lossType} onChange={handleTypeChange} />
              
              <label className="relative block group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium shadow-sm transition-all focus:border-[#00420b]/20 outline-none"
                />
              </label>
            </div>

            {/* Barre de recherche (Desktop uniquement ici, en haut de la liste) */}
            <div className="hidden md:block mb-6 sticky top-[calc(env(safe-area-inset-top,0px)+56px)] z-20 bg-slate-50/95 backdrop-blur-md py-2 px-1">
              <label className="relative block group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-medium shadow-sm transition-all focus:border-[#00420b]/20 outline-none"
                />
              </label>
            </div>
            <LossTable losses={losses} categories={categories} searchQuery={searchQuery} onUpdate={fetchLosses} />
          </main>
        </div>
      </div>

      {/* History Modal */}
      {historyDate && (
        <HistoryModal date={historyDate} onClose={() => setHistoryDate(null)} />
      )}

      {/* Category Drawer (Mobile uniquement — caché quand l'historique est ouvert) */}
      {!historyDate && (
        <CategoryDrawer 
          categories={categories} 
          activeCategory={activeCategory} 
          onCategoryClick={scrollToCategory} 
        />
      )}
      {/* Hidden Global Date Picker Input (Mainly for Mobile Menu to avoid unmount bugs) */}
      <input
        id="global-date-input"
        ref={globalDateInputRef}
        type="date"
        max={new Date().toISOString().split("T")[0]}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-px opacity-0 pointer-events-none"
        onChange={(e) => {
          setTempDate(e.target.value);
        }}
        onBlur={() => {
          if (tempDate) {
            setHistoryDate(tempDate);
            setTempDate(null);
            setIsMenuOpen(false);
          }
        }}
      />
    </div>
  );
}