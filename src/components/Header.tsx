import { useState, useEffect } from "react";

interface HeaderProps {
  onReset?: () => void;
  // Legacy props kept for desktop MobileMenu compatibility — ignored on mobile
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isMenuOpen, setIsMenuOpen }) => {
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 text-white"
      style={{
        background: '#00420b',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        boxShadow: '0 2px 12px rgba(0,66,11,0.25)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center gap-3">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="McDonald's"
          className="w-8 h-8 shrink-0 object-contain"
        />

        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-[17px] font-black tracking-tight leading-tight truncate">
            Gestion des Pertes
          </h1>
          <p className="text-green-300 text-[10px] font-semibold hidden sm:block tracking-wide uppercase">
            Suivi en temps réel
          </p>
        </div>

        {/* Date & Time — desktop/tablet only */}
        <div className="hidden sm:flex flex-col items-end gap-0.5 shrink-0">
          <p className="text-sm font-bold leading-none">
            {time.toLocaleDateString("fr-FR", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </p>
          <p className="text-green-300 text-[11px] font-semibold leading-none">
            {time.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>

        {/* Desktop-only menu button (kept for desktop MobileMenu) */}
        {setIsMenuOpen && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="hidden md:flex p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12"/>
              <line x1="4" x2="20" y1="6" y2="6"/>
              <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};
