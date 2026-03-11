import React from 'react';

interface LossTypeTabsProps {
  activeType: 'complet' | 'vide';
  onChange: (type: 'complet' | 'vide') => void;
}

export const LossTypeTabs: React.FC<LossTypeTabsProps> = ({ activeType, onChange }) => {
  return (
    <div className="flex p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm md:mb-6 md:mx-4">
      <button
        onClick={() => onChange('vide')}
        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          activeType === 'vide'
            ? 'bg-[#00420b] text-white shadow-lg shadow-[#00420b]/20'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <img src="/vide.png" alt="Pertes Vides" className="w-8 h-8 object-contain" />
        Pertes Vides
      </button>
      <button
        onClick={() => onChange('complet')}
        className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          activeType === 'complet'
            ? 'bg-[#00420b] text-white shadow-lg shadow-[#00420b]/20'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        <img src="/complet.png" alt="Pertes Complètes" className="w-8 h-8 object-contain" />
        Pertes Complètes
      </button>
    </div>
  );
};
