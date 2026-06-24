import React from 'react';

interface LossTypeTabsProps {
  activeType: 'complet' | 'vide';
  onChange: (type: 'complet' | 'vide') => void;
}

export const LossTypeTabs: React.FC<LossTypeTabsProps> = ({ activeType, onChange }) => {
  return (
    <div
      className="flex p-1 rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.06)',
      }}
    >
      {(['vide', 'complet'] as const).map((type) => {
        const isActive = activeType === type;
        const label = type === 'vide' ? 'Pertes Vides' : 'Pertes Complètes';
        const imgSrc = type === 'vide' ? '/vide.png' : '/complet.png';
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.97]"
            style={{
              background: isActive ? '#00420b' : 'transparent',
              color: isActive ? '#ffffff' : '#64748b',
              boxShadow: isActive ? '0 2px 8px rgba(0,66,11,0.3)' : 'none',
            }}
          >
            <img src={imgSrc} alt={label} className="w-7 h-7 object-contain" />
            <span className="leading-none">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
