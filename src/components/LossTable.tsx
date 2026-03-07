import React, { useState } from "react";
import { API_BASE_URL } from "../config/api";
import type { ProductCategory, ProductItem } from "../App";

interface Loss {
  id: number;
  product: string;
  quantity: number;
  size: string | null;
  unit: string;
  created_at: string;
}

interface LossTableProps {
  losses: Loss[];
  categories: ProductCategory[];
  searchQuery: string;
  onUpdate: () => void;
}
// Le tableau qui affiche toutes les pertes avec les boutons + et -
export const LossTable: React.FC<LossTableProps> = ({ losses, categories, searchQuery, onUpdate }) => {
  
  // État local pour un retour visuel INSTANTANÉ (Optimistic UI)
  const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({});

  // Sync local quantities with props when they change
  React.useEffect(() => {
    const newLocal: Record<string, number> = {};
    losses.forEach(loss => {
      const key = `${loss.product}__${loss.size || "null"}`;
      newLocal[key] = (newLocal[key] || 0) + loss.quantity;
    });
    setLocalQuantities(newLocal);
  }, [losses]);

  // Petit helper pour le debounce de la saisie manuelle
  const [saveTimeout, setSaveTimeout] = useState<any>(null);

  // Changement de quantité avec les boutons + et -
  const handleQuantityChange = async (product: ProductItem, size: string | null, delta: number) => {
    const key = `${product.name}__${size || "null"}`;
    
    // Pour le poids et les liquides, le delta est de 100 (g ou ml) par clic
    const actualDelta = (product.unit_type === 'weight' || product.unit_type === 'liquid') ? delta * 100 : delta;
    const currentQty = localQuantities[key] || 0;
    const newQuantity = Math.max(0, currentQty + actualDelta);

    // 1. MISE À JOUR OPTIMISTE (instantanée)
    setLocalQuantities(prev => ({ ...prev, [key]: newQuantity }));

    try {
      // On cherche si on a déjà une ligne en base pour ce produit/taille
      const existingLoss = losses.find(l => l.product === product.name && (l.size === size || (!l.size && !size)));

      if (existingLoss) {
        await fetch(`${API_BASE_URL}/api/losses/${existingLoss.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            quantity: newQuantity,
            unit: product.unit_type === 'weight' ? 'g' : 'unit'
          }),
        });
      } else if (delta > 0) {
        await fetch(`${API_BASE_URL}/api/losses/manual`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            product: product.name, 
            quantity: actualDelta, 
            size,
            unit: product.unit_type === 'weight' ? 'g' : 'unit'
          }),
        });
      }
      onUpdate(); // Refresh global mais sans bloquer l'UI
    } catch (e) {
      console.error(e);
      // Rollback en cas d'erreur
      onUpdate();
    }
  };

  // Sauvegarde des changements manuels au clavier (DEBOUNCED)
  const handleEditSave = (product: ProductItem, size: string | null, newValue: number) => {
    const key = `${product.name}__${size || "null"}`;
    
    if (newValue < 0) return;

    // 1. Mise à jour immédiate à l'écran
    setLocalQuantities(prev => ({ ...prev, [key]: newValue }));

    // 2. On annule le timer précédent s'il existe
    if (saveTimeout) clearTimeout(saveTimeout);

    // 3. On lance le timer pour sauvegarder dans 500ms
    const timeout = setTimeout(async () => {
      try {
        const existingLoss = losses.find(l => l.product === product.name && (l.size === size || (!l.size && !size)));
        if (existingLoss) {
          await fetch(`${API_BASE_URL}/api/losses/${existingLoss.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              quantity: newValue,
              unit: product.unit_type === 'weight' ? 'g' : 'unit'
            }),
          });
        } else if (newValue > 0) {
          await fetch(`${API_BASE_URL}/api/losses/manual`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              product: product.name, 
              quantity: newValue, 
              size,
              unit: product.unit_type === 'weight' ? 'g' : 'unit'
            }),
          });
        }
        onUpdate();
      } catch (e) {
        console.error(e);
        onUpdate();
      }
    }, 500);

    setSaveTimeout(timeout);
  };

  const getSizes = (product: ProductItem): (string | null)[] => {
    if (product.sizes && product.sizes.length > 0) return product.sizes;
    return [null];
  };

  const filterProducts = (products: ProductItem[]) => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredCategories = categories.map((group: ProductCategory) => {
    const filteredSubcategories = group.subcategories.map((sub: any) => ({
      ...sub,
      products: filterProducts(sub.products)
    })).filter((sub: any) => sub.products.length > 0);
    const filteredDirectProducts = filterProducts(group.products);
    return {
      ...group,
      subcategories: filteredSubcategories,
      products: filteredDirectProducts
    };
  }).filter((group: any) => group.subcategories.length > 0 || (group.directProducts && group.directProducts.length > 0) || (group.products && group.products.length > 0));

  const renderProduct = (product: ProductItem) => {
    const sizes = getSizes(product);
    return sizes.map((size) => {
      const key = `${product.name}__${size || "null"}`;
      const quantity = localQuantities[key] || 0;
      const isLoading = false;

      return (
        <div
          key={key}
          className={`
            relative bg-white rounded-xl border shadow-sm p-3 flex flex-col items-center gap-2 text-center transition-all
            ${quantity > 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'}
          `}
        >
          {/* Header Produit */}
          <div className="flex flex-col justify-center min-h-[44px] w-full">
            <span className={`text-[11px] font-bold leading-tight ${quantity > 0 ? 'text-slate-900' : 'text-slate-600'}`}>
              {product.name}
            </span>
            {size && (
              <span className="text-[10px] text-slate-400 font-medium">{size}</span>
            )}
            
            {/* Affichage intelligent du poids/volume */}
            {product.unit_type === 'weight' && (
              <span className={`text-[10px] mt-1 font-medium ${quantity >= 1000 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                {quantity >= 1000 ? `(${(quantity / 1000).toFixed(2)} kg)` : (quantity > 0 ? "g" : "")}
              </span>
            )}
            {product.unit_type === 'liquid' && (
              <span className={`text-[10px] mt-1 font-medium ${quantity >= 1000 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                {quantity >= 1000 ? `(${(quantity / 1000).toFixed(2)} L)` : (quantity > 0 ? "ml" : "")}
              </span>
            )}
            {product.unit_type === 'pieces' && (
              <span className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">pièces</span>
            )}
          </div>

          {/* Contrôles Quantité */}
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 w-full justify-between mt-auto">
            <button
              onClick={() => handleQuantityChange(product, size, -1)}
              disabled={isLoading || quantity === 0}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-400 hover:text-red-500 active:scale-90 transition-all disabled:opacity-30"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>

            <input
              type="number"
              value={quantity === 0 ? "" : quantity}
              placeholder="0"
              onChange={(e) => {
                const val = parseInt(e.target.value);
                handleEditSave(product, size, isNaN(val) ? 0 : val);
              }}
              className={`w-14 text-center border-0 bg-transparent text-sm p-0 focus:ring-0 outline-none
                ${quantity > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}
              `}
            />

            <button
              onClick={() => handleQuantityChange(product, size, 1)}
              disabled={isLoading}
              className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-green-600 active:scale-90 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-20">
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search Input removed from here - now managed by App.tsx */}

      {filteredCategories.length === 0 && (
        <div className="py-20 text-center text-slate-400">
          <p>Aucun produit trouvé</p>
        </div>
      )}

      {filteredCategories.map((group) => {
        const categoryId = group.label.toLowerCase().replace(/\s+/g, '-');
        return (
          <div key={group.label} id={categoryId} className="space-y-6 scroll-mt-24">
            <div className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-2 border-b border-slate-200/50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                {group.label}
              </h3>
            </div>

            {group.products.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.products.flatMap(renderProduct)}
              </div>
            )}

            {group.subcategories.map((sub) => (
              <div key={sub.name} className="space-y-3">
                <h4 className="text-[10px] font-bold text-slate-300 px-1 italic">
                  — {sub.name}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {sub.products.flatMap(renderProduct)}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};