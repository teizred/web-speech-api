import React, { useState, useEffect } from 'react';
import type { ProductCategory } from '../App';

interface CategoryDrawerProps {
  categories: ProductCategory[];
  activeCategory: string;
  onCategoryClick: (label: string) => void;
}

export const CategoryDrawer: React.FC<CategoryDrawerProps> = ({ categories, activeCategory, onCategoryClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Bloquer le scroll du corps quand le drawer est ouvert
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100% ';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCategoryClick = (label: string) => {
    onCategoryClick(label);
    setIsOpen(false);
  };

  return (
    <>
      {/* Bouton Fixe en bas au centre */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#00420b] text-white px-6 py-3 rounded-full shadow-lg shadow-green-900/20 active:scale-95 transition-all border border-white/10"
        >
          <span className="text-xl">🗂️</span>
          <span className="font-bold text-sm uppercase tracking-wide">Catégories</span>
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Bottom Sheet Drawer */}
      <div 
        className={`
          md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out transform
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          pb-[max(1rem,env(safe-area-inset-bottom,20px))]
        `}
      >
        {/* Barre de drag */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-2" />
        
        <div className="px-6 py-4">
          <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            📂 <span className="uppercase tracking-tight">Toutes les catégories</span>
          </h3>
          
          <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto no-scrollbar py-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.label;
              
              // On vérifie si l'icône est un chemin d'image ou un emoji
              const isImageIcon = cat.icon && (cat.icon.startsWith('/') || cat.icon.startsWith('http'));

              return (
                <button
                  key={cat.label}
                  onClick={() => handleCategoryClick(cat.label)}
                  className={`
                    flex items-center gap-4 w-full p-4 rounded-2xl text-left transition-all active:scale-[0.98]
                    ${isActive 
                      ? 'bg-[#264F36] text-white shadow-md ring-2 ring-[#264F36]/20' 
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                    }
                  `}
                >
                  <div className="w-12 h-12 flex items-center justify-center shrink-0">
                    {isImageIcon ? (
                      <img src={cat.icon!} alt={cat.label} className="w-10 h-10 object-contain" />
                    ) : (
                      <span className="text-3xl">{cat.icon || "📦"}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-base ${isActive ? 'text-white' : 'text-slate-800'}`}>
                      {cat.label}
                    </p>
                    <p className={`text-xs uppercase font-bold tracking-wider mt-0.5 ${isActive ? 'text-green-100' : 'text-slate-400'}`}>
                      {cat.subcategories.reduce((acc, sub) => acc + sub.products.length, 0) + cat.products.length} produits
                    </p>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bouton fermer en bas */}
        <div className="px-6 mt-2">
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full py-4 text-slate-400 font-bold text-sm uppercase tracking-widest bg-slate-50 rounded-2xl"
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );
};
