import React from 'react';
import type { ProductCategory } from '../App';

interface BottomNavProps {
  categories: ProductCategory[];
  activeCategory: string;
  onCategoryClick: (label: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ categories, activeCategory, onCategoryClick }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,16px))] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {/* Indicateur de scroll à droite (dégradé) */}
      <div className="absolute top-0 right-0 bottom-[max(0.5rem,env(safe-area-inset-bottom,16px))] w-12 bg-linear-to-l from-white to-transparent pointer-events-none z-10" />
      
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth px-2 relative">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.label;

          return (
            <button
              key={cat.label}
              onClick={() => onCategoryClick(cat.label)}
              className={`
                flex flex-col items-center justify-center min-w-[85px] py-1.5 px-1 rounded-xl transition-all active:scale-90 shrink-0
                ${isActive ? 'text-[#E11D48]' : 'text-slate-400'}
              `}
            >
              {cat.icon ? (
                <img src={cat.icon} alt={cat.label} className={`w-7 h-7 object-contain mb-0.5 transition-transform ${isActive ? 'scale-110' : 'opacity-70'}`} />
              ) : (
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold mb-0.5 transition-transform ${isActive ? 'scale-110 bg-[#E11D48] text-white' : 'bg-slate-100 text-slate-500 opacity-70'}`}>
                  {cat.label.charAt(0)}
                </span>
              )}
              <span className={`text-[9px] font-extrabold text-center uppercase tracking-tight leading-tight max-w-full
                ${isActive ? 'text-[#E11D48]' : 'text-slate-400'}
              `}>
                {cat.label}
              </span>
            </button>
          );
        })}
        {/* Petit spacer pour pouvoir scroller jusqu'au bout malgré le dégradé */}
        <div className="flex-none w-10 h-10" />
      </div>
    </nav>
  );
};
