import React from "react";
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

// ─── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = React.memo(({
  product,
  size,
  initialQuantity,
  existingLossId,
  onUpdate,
}: {
  product: ProductItem;
  size: string | null;
  initialQuantity: number;
  existingLossId: number | null;
  onUpdate: () => void;
}) => {
  const [quantity, setQuantity] = React.useState(initialQuantity);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleQuantityChange = async (delta: number) => {
    const actualDelta =
      product.unit_type === 'weight' || product.unit_type === 'liquid' ? delta * 100 : delta;
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
            unit:
              product.unit_type === 'weight' ? 'g' :
              product.unit_type === 'liquid' ? 'ml' : 'pieces',
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
            unit:
              product.unit_type === 'weight' ? 'g' :
              product.unit_type === 'liquid' ? 'ml' : 'pieces',
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
    if (quantity === initialQuantity) return;
    if (quantity < 0) return;
    setIsLoading(true);
    try {
      if (existingLossId) {
        await fetch(`${API_BASE_URL}/api/losses/${existingLossId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quantity,
            unit:
              product.unit_type === 'weight' ? 'g' :
              product.unit_type === 'liquid' ? 'ml' : 'pieces',
          }),
        });
      } else if (quantity > 0) {
        await fetch(`${API_BASE_URL}/api/losses/manual`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: product.name,
            quantity,
            size,
            unit:
              product.unit_type === 'weight' ? 'g' :
              product.unit_type === 'liquid' ? 'ml' : 'pieces',
          }),
        });
      }
      onUpdate();
    } catch (e) {
      console.error(e);
      setQuantity(initialQuantity);
      onUpdate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur();
  };

  const hasLoss = quantity > 0;
  const unitLabel =
    product.unit_type === 'weight' ? (quantity >= 1000 ? `${(quantity / 1000).toFixed(2)} kg` : `${quantity} g`) :
    product.unit_type === 'liquid' ? (quantity >= 1000 ? `${(quantity / 1000).toFixed(2)} L` : `${quantity} ml`) :
    null;
  const badge =
    product.unit_type === 'weight' ? 'g / kg' :
    product.unit_type === 'liquid' ? 'ml / L' :
    product.unit_type === 'pieces' ? 'pièces' : null;

  return (
    <div
      className="relative flex flex-col rounded-2xl transition-all duration-200"
      style={{
        background: hasLoss ? '#fff5f5' : '#ffffff',
        border: hasLoss ? '2px solid #fecaca' : '2px solid #f1f5f9',
        boxShadow: hasLoss
          ? '0 2px 8px rgba(239,68,68,0.1)'
          : '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      {/* Top content */}
      <div className="flex flex-col items-center justify-center text-center px-2 pt-4 pb-2 flex-1 min-h-[64px]">
        <span className={`text-sm font-black leading-tight ${hasLoss ? 'text-slate-900' : 'text-slate-600'}`}>
          {product.name}
        </span>
        {size && <span className="text-[11px] text-slate-400 font-semibold mt-0.5">{size}</span>}

        {/* Unit badge */}
        {badge && (
          <span
            className="text-[9px] font-black uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded-md"
            style={{
              background: product.unit_type === 'weight' ? '#fff7ed' :
                          product.unit_type === 'liquid' ? '#eff6ff' : '#eff6ff',
              color: product.unit_type === 'weight' ? '#ea580c' :
                     product.unit_type === 'liquid' ? '#2563eb' : '#2563eb',
            }}
          >
            {badge}
          </span>
        )}
        {hasLoss && unitLabel && (
          <span className="text-[10px] font-bold text-red-500 mt-0.5">{unitLabel}</span>
        )}
      </div>

      {/* Controls row */}
      <div
        className="flex items-center justify-between px-2 pb-3"
        style={{ gap: 4 }}
      >
        {/* Minus */}
        <button
          onClick={() => handleQuantityChange(-1)}
          disabled={isLoading || quantity === 0}
          className="flex items-center justify-center rounded-xl active:scale-90 transition-all disabled:opacity-25"
          style={{
            width: 44,
            height: 44,
            background: hasLoss ? '#fee2e2' : '#f1f5f9',
            color: hasLoss ? '#dc2626' : '#64748b',
            flexShrink: 0,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>

        {/* Quantity input */}
        <input
          type="number"
          value={quantity === 0 ? "" : quantity}
          placeholder="0"
          onChange={handleEditChange}
          onBlur={saveManualEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 text-center border-0 bg-transparent text-sm p-0 focus:ring-0 outline-none min-w-0"
          style={{
            fontWeight: 900,
            color: hasLoss ? '#dc2626' : '#94a3b8',
            fontSize: hasLoss ? 16 : 14,
          }}
        />

        {/* Plus */}
        <button
          onClick={() => handleQuantityChange(1)}
          disabled={isLoading}
          className="flex items-center justify-center rounded-xl active:scale-90 transition-all"
          style={{
            width: 44,
            height: 44,
            background: '#00420b',
            color: '#ffffff',
            flexShrink: 0,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-20">
          <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

// ─── Main LossTable ───────────────────────────────────────────────────────────

export const LossTable: React.FC<LossTableProps> = ({
  losses,
  categories,
  searchQuery,
  onUpdate,
}) => {
  const initialQuantities = React.useMemo(() => {
    const map: Record<string, { quantity: number; id: number | null }> = {};
    losses.forEach((loss) => {
      const key = `${loss.product}__${loss.size || "null"}`;
      if (!map[key]) map[key] = { quantity: 0, id: loss.id };
      map[key].quantity += loss.quantity;
    });
    return map;
  }, [losses]);

  const getSizes = (product: ProductItem): (string | null)[] => {
    if (product.sizes && product.sizes.length > 0) return product.sizes;
    return [null];
  };

  const filterProducts = (products: ProductItem[]) =>
    products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredCategories = categories
    .map((group) => {
      const filteredSubs = group.subcategories
        .map((sub) => ({ ...sub, products: filterProducts(sub.products) }))
        .filter((sub) => sub.products.length > 0);
      const filteredDirect = filterProducts(group.products);
      return { ...group, subcategories: filteredSubs, products: filteredDirect };
    })
    .filter((g) => g.subcategories.length > 0 || g.products.length > 0);

  const renderProduct = (product: ProductItem) =>
    getSizes(product).map((size) => {
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

  return (
    <div className="space-y-8 pb-4 md:pb-12">
      {filteredCategories.length === 0 && (
        <div className="py-20 text-center text-slate-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold">Aucun produit trouvé</p>
        </div>
      )}

      {filteredCategories.map((group) => {
        const categoryId = group.label.toLowerCase().replace(/\s+/g, '-');
        return (
          <div key={group.label} id={categoryId} className="space-y-4 scroll-mt-[210px] md:scroll-mt-[160px]">
            {/* Category header */}
            <div
              className="sticky z-10 py-2 px-1 bg-slate-50/95 backdrop-blur-sm"
              style={{ top: 'calc(env(safe-area-inset-top, 0px) + 56px + 116px)' }}
            >
              <div className="flex items-center gap-2">
                {group.icon && (
                  group.icon.startsWith('/') || group.icon.startsWith('http') ? (
                    <img src={group.icon} alt="" className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="text-base">{group.icon}</span>
                  )
                )}
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.12em]">
                  {group.label}
                </h3>
              </div>
            </div>

            {group.products.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {group.products.flatMap(renderProduct)}
              </div>
            )}

            {group.subcategories.map((sub) => (
              <div key={sub.name} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 px-1 italic">— {sub.name}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
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