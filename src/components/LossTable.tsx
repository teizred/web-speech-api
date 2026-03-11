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
const ProductCard = React.memo(({ 
  product, 
  size, 
  initialQuantity, 
  existingLossId, 
  onUpdate 
}: {
  product: ProductItem;
  size: string | null;
  initialQuantity: number;
  existingLossId: number | null;
  onUpdate: () => void;
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleQuantityChange = async (delta: number) => {
    const actualDelta = (product.unit_type === 'weight' || product.unit_type === 'liquid') ? delta * 100 : delta;
    const newQuantity = Math.max(0, quantity + actualDelta);
    setQuantity(newQuantity);

    setIsLoading(true);
    try {
      if (existingLossId) {
        await fetch(`${API_BASE_URL}/api/losses/${existingLossId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            quantity: newQuantity,
            unit: product.unit_type === 'weight' ? 'g' : (product.unit_type === 'liquid' ? 'ml' : 'pieces')
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
            unit: product.unit_type === 'weight' ? 'g' : (product.unit_type === 'liquid' ? 'ml' : 'pieces')
          }),
        });
      }
      onUpdate();
    } catch (e) {
      console.error(e);
      onUpdate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setQuantity(isNaN(val) ? 0 : val);
  };

  const saveManualEdit = async () => {
    if (quantity === initialQuantity) return; // Pas de changement
    if (quantity < 0) return;

    setIsLoading(true);
    try {
      if (existingLossId) {
        await fetch(`${API_BASE_URL}/api/losses/${existingLossId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            quantity: quantity,
            unit: product.unit_type === 'weight' ? 'g' : (product.unit_type === 'liquid' ? 'ml' : 'pieces')
          }),
        });
      } else if (quantity > 0) {
        await fetch(`${API_BASE_URL}/api/losses/manual`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            product: product.name, 
            quantity: quantity, 
            size,
            unit: product.unit_type === 'weight' ? 'g' : (product.unit_type === 'liquid' ? 'ml' : 'pieces')
          }),
        });
      }
      onUpdate();
    } catch (e) {
      console.error(e);
      setQuantity(initialQuantity); // Rollback
      onUpdate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div
      className={`
        relative bg-white rounded-xl border shadow-sm p-3 flex flex-col items-center gap-2 text-center transition-all
        ${quantity > 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'}
      `}
    >
      <div className="flex flex-col justify-center min-h-[44px] w-full">
        <span className={`text-sm md:text-base font-bold leading-tight ${quantity > 0 ? 'text-slate-900' : 'text-slate-600'}`}>
          {product.name}
        </span>
        {size && (
          <span className="text-xs text-slate-500 font-medium">{size}</span>
        )}
        
        {product.unit_type === 'weight' && (
          <div className="flex flex-col items-center">
            {quantity > 0 && (
              <span className={`text-[10px] mt-1 font-medium ${quantity >= 1000 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                {quantity >= 1000 ? `(${(quantity / 1000).toFixed(2)} kg)` : "g"}
              </span>
            )}
            <span className="text-[9px] text-orange-500 font-bold uppercase tracking-tighter mt-0.5">g / kg</span>
          </div>
        )}
        {product.unit_type === 'liquid' && (
          <div className="flex flex-col items-center">
            {quantity > 0 && (
              <span className={`text-[10px] mt-1 font-medium ${quantity >= 1000 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                {quantity >= 1000 ? `(${(quantity / 1000).toFixed(2)} L)` : "ml"}
              </span>
            )}
            <span className="text-[9px] text-cyan-600 font-bold uppercase tracking-tighter mt-0.5">ml / L</span>
          </div>
        )}
        {product.unit_type === 'pieces' && (
          <span className="text-[9px] text-blue-500 font-bold uppercase tracking-tighter">pièces</span>
        )}
      </div>

      <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 w-full justify-between mt-auto">
        <button
          onClick={() => handleQuantityChange(-1)}
          disabled={isLoading || quantity === 0}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-400 hover:text-red-500 active:scale-90 transition-all disabled:opacity-30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>

        <input
          type="number"
          value={quantity === 0 ? "" : quantity}
          placeholder="0"
          onChange={handleEditChange}
          onBlur={saveManualEdit}
          onKeyDown={handleKeyDown}
          className={`w-14 text-center border-0 bg-transparent text-sm p-0 focus:ring-0 outline-none
            ${quantity > 0 ? 'text-red-600 font-bold' : 'text-slate-400'}
          `}
        />

        <button
          onClick={() => handleQuantityChange(1)}
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

// Le tableau qui affiche toutes les pertes avec les boutons + et -
export const LossTable: React.FC<LossTableProps> = ({ losses, categories, searchQuery, onUpdate }) => {
  
  // Create a memoized map of losses for quick lookup
  const initialQuantities = React.useMemo(() => {
    const map: Record<string, { quantity: number; id: number | null }> = {};
    losses.forEach(loss => {
      const key = `${loss.product}__${loss.size || "null"}`;
      if (!map[key]) {
        map[key] = { quantity: 0, id: loss.id };
      }
      map[key].quantity += loss.quantity;
    });
    return map;
  }, [losses]);

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
  }).filter((group: any) => group.subcategories.length > 0 || (group.products && group.products.length > 0));

  const renderProduct = (product: ProductItem) => {
    const sizes = getSizes(product);
    return sizes.map((size) => {
      const key = `${product.name}__${size || "null"}`;
      const lossData = initialQuantities[key] || { quantity: 0, id: null };

      return (
        <ProductCard
          key={key}
          product={product}
          size={size}
          initialQuantity={lossData.quantity}
          existingLossId={lossData.id}
          onUpdate={onUpdate}
        />
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
          <div key={group.label} id={categoryId} className="space-y-6 scroll-mt-[180px] md:scroll-mt-[130px]">
            <div className="sticky top-[calc(env(safe-area-inset-top,0px)+168px)] md:top-[calc(env(safe-area-inset-top,0px)+112px)] bg-slate-50/95 backdrop-blur z-10 py-2 border-b border-slate-200/50">
              <h3 className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-[0.1em] px-1">
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
                <h4 className="text-xs md:text-sm font-bold text-slate-400 px-1 italic">
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