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
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const handleCategoryClick = (label: string) => {
    setIsOpen(false);
    requestAnimationFrame(() => {
      onCategoryClick(label);
    });
  };

  return (
    <>
      {/* Floating Categories Button — mobile only, sits above the bottom nav */}
      <div
        className="md:hidden fixed left-1/2 -translate-x-1/2 z-40"
        style={{ bottom: 'calc(60px + env(safe-area-inset-bottom, 0px) + 12px)' }}
      >
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 text-white px-5 py-3 rounded-full active:scale-95 transition-all"
          style={{
            background: '#00420b',
            boxShadow: '0 4px 16px rgba(0,66,11,0.4)',
            border: '1.5px solid rgba(255,255,255,0.15)',
          }}
        >
          <span className="text-lg">🗂️</span>
          <span className="font-black text-sm uppercase tracking-wide">Catégories</span>
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 touch-none"
          onClick={() => setIsOpen(false)}
          onPointerMove={(e) => e.preventDefault()}
        />
      )}

      {/* Bottom Sheet Drawer — mobile + desktop */}
      <div
        className={`
          fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out transform
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 20px))' }}
      >
        {/* Drag handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-2" />

        <div className="px-5 py-3">
          <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            📂 <span className="uppercase tracking-tight">Toutes les catégories</span>
          </h3>

          <div className="grid grid-cols-1 gap-2 overflow-y-auto no-scrollbar" style={{ maxHeight: '60vh' }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat.label;
              const isImageIcon = cat.icon && (cat.icon.startsWith('/') || cat.icon.startsWith('http'));

              return (
                <button
                  key={cat.label}
                  onClick={() => handleCategoryClick(cat.label)}
                  className="flex items-center gap-4 w-full p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
                  style={{
                    background: isActive ? '#00420b' : '#f8fafc',
                    border: isActive ? '2px solid #00420b' : '2px solid #f1f5f9',
                    boxShadow: isActive ? '0 2px 10px rgba(0,66,11,0.25)' : 'none',
                  }}
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
                    <p className={`text-xs uppercase font-bold tracking-wider mt-0.5 ${isActive ? 'text-green-200' : 'text-slate-400'}`}>
                      {cat.subcategories.reduce((acc, sub) => acc + sub.products.length, 0) + cat.products.length} produits
                    </p>
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 mt-1">
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-4 font-bold text-sm uppercase tracking-widest rounded-2xl"
            style={{ background: '#f8fafc', color: '#94a3b8' }}
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );
};
