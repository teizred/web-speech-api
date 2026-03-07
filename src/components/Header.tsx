import { useState } from "react";
import { MobileMenu } from "./MobileMenu";

interface HeaderProps {
  onReset?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[#264F36] text-white shadow-md sticky top-0 z-40 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
        {/* McDonald's Logo */}
        <img
          src="/logo.png"
          alt="McDonald's"
          className="w-8 h-8 md:w-10 md:h-10 shrink-0 object-contain"
        />

        {/* App Title */}
        <div className="flex-1">
          <h1 className="text-lg md:text-xl font-bold tracking-tight">
            Gestion des Pertes
          </h1>
          <p className="text-green-200 text-[10px] md:text-xs font-medium hidden sm:block">
            Suivi des pertes en temps réel
          </p>
        </div>

        {/* Date & Time (Hidden on mini screens) */}
        <div className="text-right hidden sm:block mr-2">
          <p className="text-sm font-semibold">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </p>
          <p className="text-red-100 text-[10px] font-medium">
            {new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Burger Menu Button (Mobile only) */}
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="md:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onReset={onReset || (() => {})} 
      />
    </header>
  );
};

