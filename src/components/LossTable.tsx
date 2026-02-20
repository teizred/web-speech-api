import React, { useState } from "react";
import { API_BASE_URL } from "../config/api";
import { CATEGORIES, getSizes } from "../data/menu";

interface Loss {
  id: number;
  product: string;
  quantity: number;
  size: string | null;
  created_at: string;
}

interface LossTableProps {
  losses: Loss[];
  onUpdate: () => void;
}

// Le tableau qui affiche toutes les pertes avec les boutons + et -
export const LossTable: React.FC<LossTableProps> = ({ losses, onUpdate }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // On regroupe les pertes par produit et taille pour l'affichage
  const lossMap = new Map<string, Loss>();
  for (const loss of losses) {
    const key = `${loss.product}__${loss.size || "null"}`;
    if (lossMap.has(key)) {
      const existing = lossMap.get(key)!;
      existing.quantity += loss.quantity;
    } else {
      lossMap.set(key, { ...loss });
    }
  }

  // Changement de quantité avec les boutons + et -
  const handleQuantityChange = async (product: string, size: string | null, currentLoss: Loss | undefined, delta: number) => {
    const key = `${product}__${size || "null"}`;
    setLoadingId(key);

    try {
      if (currentLoss) {
        const newQuantity = currentLoss.quantity + delta;
        await fetch(`${API_BASE_URL}/api/losses/${currentLoss.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: Math.max(0, newQuantity) }),
        });
      } else if (delta > 0) {
        await fetch(`${API_BASE_URL}/api/losses/manual`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product, quantity: delta, size }),
        });
      }
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  // Cette fonction s'exécute quand tu tapes directement une quantité au clavier
  const handleEditSave = async (product: string, size: string | null, currentLoss: Loss | undefined, newQuantity: number) => {
    if (newQuantity < 0) return;

    const key = `${product}__${size || "null"}`;
    setLoadingId(key);

    try {
      if (currentLoss) {
        // On met à jour la ligne existante
        await fetch(`${API_BASE_URL}/api/losses/${currentLoss.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: Math.max(0, newQuantity) }),
        });
      } else if (newQuantity > 0) {
        // Ou on en crée une nouvelle si c'était à 0
        await fetch(`${API_BASE_URL}/api/losses/manual`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product, quantity: newQuantity, size }),
        });
      }
      onUpdate();
    } catch (e) {
      console.error("Souci lors de la sauvegarde", e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {CATEGORIES.map((group) => (
        <div key={group.label}>
          <div className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-2 mb-2 border-b border-slate-200/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">
              {group.label}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {group.products.flatMap((productName) => {
              const sizes = getSizes(productName, group.label);

              return sizes.map((size) => {
                const key = `${productName}__${size || "null"}`;
                const currentLoss = lossMap.get(key);
                const quantity = currentLoss ? currentLoss.quantity : 0;
                const isLoading = loadingId === key;

                return (
                  <div
                    key={key}
                    className={`
                      relative bg-white rounded-xl border shadow-sm p-3 flex flex-col items-center gap-3 text-center transition-all
                      ${quantity > 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'}
                    `}
                  >
                    <div className="flex-1 flex flex-col justify-center min-h-[40px]">
                      <span className={`text-xs font-bold leading-tight ${quantity > 0 ? 'text-slate-900' : 'text-slate-600'}`}>
                        {productName}
                      </span>
                      {size && (
                        <span className="text-[10px] text-slate-400 font-medium">{size}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 w-full justify-between">
                      <button
                        onClick={() => handleQuantityChange(productName, size, currentLoss, -1)}
                        disabled={isLoading || quantity === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-400 hover:text-red-500 hover:shadow-sm active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>

                      <input
                        key={quantity}
                        type="number"
                        min="0"
                        defaultValue={quantity}
                        onBlur={(e) => handleEditSave(productName, size, currentLoss, parseInt(e.target.value) || 0)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEditSave(productName, size, currentLoss, parseInt(e.currentTarget.value) || 0);
                            e.currentTarget.blur();
                          }
                        }}
                        className={`w-12 text-center border rounded text-sm p-0 focus:ring-2 focus:ring-red-200 focus:outline-none transition-colors
                          ${quantity > 0 
                            ? 'bg-white border-red-200 text-red-600 font-bold' 
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                          }
                        `}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <button
                        onClick={() => handleQuantityChange(productName, size, currentLoss, 1)}
                        disabled={isLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-green-600 hover:shadow-sm active:scale-95 transition-all disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>

                    {isLoading && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-20">
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                );
              });
            })}
          </div>
        </div>
      ))}
    </div>
  );
};