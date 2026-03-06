import React from "react";

export const Header: React.FC = () => {
  return (
    <header className="bg-[#264F36] text-white shadow-md">
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

        {/* Date */}
        <div className="text-right hidden sm:block">
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
      </div>
    </header>
  );
};

