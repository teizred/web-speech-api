import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../config/api";
import { AddProductModal } from "./AddProductModal";

interface InventoryProduct {
  id: number;
  name: string;
  category: string;
  subcategory: string | null;
  sizes: string[] | null;
  unit_type: string;
  loss_type: string;
  monthly_total: number;
  size_breakdown: { size: string | null; quantity: number }[];
}

interface InventoryData {
  month: string;
  products: InventoryProduct[];
}

const formatTotal = (total: number, unitType: string): string => {
  if (total === 0) return "—";
  if (unitType === "weight") {
    return total >= 1000 ? `${(total / 1000).toFixed(1)} kg` : `${total} g`;
  }
  if (unitType === "liquid") {
    return total >= 1000 ? `${(total / 1000).toFixed(1)} L` : `${total} ml`;
  }
  return `${total}`;
};

const getMonthLabel = (month: string): string => {
  const [year, m] = month.split("-");
  const date = new Date(parseInt(year), parseInt(m) - 1);
  return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
};

const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const shiftMonth = (month: string, delta: number): string => {
  const [y, m] = month.split("-").map(Number);
  const date = new Date(y, m - 1 + delta);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const InventoryView: React.FC = () => {
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState<InventoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "vide" | "complet">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterLossOnly, setFilterLossOnly] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/inventory?month=${month}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Erreur inventaire:", e);
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteConfirmId(null);
        fetchInventory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEdit = (product: InventoryProduct) => {
    setEditProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory || "",
      sizes: product.sizes || [],
      unit_type: product.unit_type,
      loss_type: product.loss_type,
    });
    setShowAddModal(true);
  };

  // Compute unique categories for filter
  const allCategories = data
    ? [...new Set(data.products.map((p) => p.category))].sort()
    : [];

  // Filter products
  const filtered = (data?.products || []).filter((p) => {
    if (filterType !== "all" && p.loss_type !== filterType) return false;
    if (filterCategory !== "all" && p.category !== filterCategory) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterLossOnly && p.monthly_total === 0) return false;
    return true;
  });

  // Group by category
  const grouped: Record<string, InventoryProduct[]> = {};
  for (const p of filtered) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  const isCurrentMonth = month === getCurrentMonth();
  const isFutureMonth = month > getCurrentMonth();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-black text-slate-800">Inventaire</h2>
          <button
            onClick={() => { setEditProduct(null); setShowAddModal(true); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-sm font-bold text-white active:scale-95 transition-transform"
            style={{ background: "#00420b", boxShadow: "0 2px 8px rgba(0,66,11,0.3)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Produit
          </button>
        </div>

        {/* Month navigator */}
        <div className="flex items-center justify-center gap-3 mb-3">
          <button
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90"
            style={{ background: "#f1f5f9" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span
            className="text-base font-black uppercase tracking-wide px-4 py-2 rounded-xl min-w-[180px] text-center"
            style={{ background: "#f1f5f9", color: "#1a1a1a" }}
          >
            {getMonthLabel(month)}
          </span>
          <button
            onClick={() => !isFutureMonth && setMonth((m) => shiftMonth(m, 1))}
            className="w-10 h-10 rounded-xl flex items-center justify-center active:scale-90"
            style={{ background: isFutureMonth ? "#f8fafc" : "#f1f5f9", opacity: isFutureMonth ? 0.4 : 1 }}
            disabled={isFutureMonth}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Search */}
        <label className="relative flex items-center mb-2">
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm font-semibold focus:outline-none"
            style={{ background: "#f1f5f9", border: "2px solid transparent" }}
          />
        </label>

        {/* Filters row */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {/* Type filter */}
          {(["all", "vide", "complet"] as const).map((type) => {
            const isActive = filterType === type;
            const label = type === "all" ? "Tous" : type === "vide" ? "Vides" : "Complets";
            return (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
                style={{
                  background: isActive ? "#00420b" : "#fff",
                  color: isActive ? "#fff" : "#64748b",
                  border: isActive ? "2px solid #00420b" : "2px solid #e2e8f0",
                }}
              >
                {label}
              </button>
            );
          })}
          {/* Loss filter toggle */}
          <button
            onClick={() => setFilterLossOnly(!filterLossOnly)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
            style={{
              background: filterLossOnly ? "#dc2626" : "#fff",
              color: filterLossOnly ? "#fff" : "#dc2626",
              border: "2px solid #dc2626",
            }}
          >
            {filterLossOnly ? "⚠️ Pertes uniquement" : "Avec pertes"}
          </button>
          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold appearance-none"
            style={{ background: filterCategory !== "all" ? "#FFC72C" : "#fff", border: "2px solid #e2e8f0", color: "#475569", paddingRight: 24 }}
          >
            <option value="all">Catégorie ▾</option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Product list ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-bottom-nav">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-green-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-semibold">Aucun produit trouvé</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, products]) => (
            <div key={category} className="mb-6">
              {/* Category header */}
              <div className="sticky top-0 z-10 py-1.5 mb-2" style={{ background: "#f5f5f5" }}>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.12em]">
                  {category} <span className="text-slate-300 font-bold">({products.length})</span>
                </h3>
              </div>

              <div className="space-y-2">
                {products.map((product) => {
                  const hasLoss = product.monthly_total > 0;
                  const isDeleting = deleteConfirmId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="rounded-2xl p-3.5 transition-all"
                      style={{
                        background: hasLoss ? "#fff5f5" : "#ffffff",
                        border: hasLoss ? "2px solid #fecaca" : "2px solid #f1f5f9",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-sm leading-tight truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {product.subcategory && (
                              <span className="text-[10px] font-bold text-slate-400">{product.subcategory}</span>
                            )}
                            <span
                              className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded"
                              style={{
                                background: product.loss_type === "vide" ? "#eff6ff" : "#fef3c7",
                                color: product.loss_type === "vide" ? "#2563eb" : "#d97706",
                              }}
                            >
                              {product.loss_type}
                            </span>
                            <span
                              className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                              style={{
                                background: product.unit_type === "weight" ? "#fff7ed" : product.unit_type === "liquid" ? "#eff6ff" : "#f1f5f9",
                                color: product.unit_type === "weight" ? "#ea580c" : product.unit_type === "liquid" ? "#2563eb" : "#64748b",
                              }}
                            >
                              {product.unit_type === "pieces" ? "pcs" : product.unit_type === "weight" ? "g/kg" : product.unit_type === "liquid" ? "ml/L" : product.unit_type}
                            </span>
                          </div>
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {product.sizes.map((s) => (
                                <span key={s} className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{s}</span>
                              ))}
                            </div>
                          )}
                          {hasLoss && product.size_breakdown && product.size_breakdown.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-red-100/50 flex flex-wrap gap-1.5">
                              {Object.entries(
                                product.size_breakdown.reduce((acc, curr) => {
                                  const sizeKey = curr.size || "Standard";
                                  acc[sizeKey] = (acc[sizeKey] || 0) + curr.quantity;
                                  return acc;
                                }, {} as Record<string, number>)
                              ).map(([size, qty]) => (
                                <span
                                  key={size}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100"
                                >
                                  {size}: {formatTotal(qty, product.unit_type)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Monthly total badge */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span
                            className="text-sm font-black px-3 py-1.5 rounded-xl"
                            style={{
                              background: hasLoss ? "#dc2626" : "#f1f5f9",
                              color: hasLoss ? "#fff" : "#94a3b8",
                            }}
                          >
                            {formatTotal(product.monthly_total, product.unit_type)}
                          </span>
                          {!isDeleting && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEdit(product)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 active:scale-90"
                                style={{ background: "#f8fafc" }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(product.id)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 active:scale-90"
                                style={{ background: "#f8fafc" }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delete confirmation inline */}
                      {isDeleting && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-red-100">
                          <p className="text-xs text-red-600 font-bold flex-1">Supprimer définitivement ?</p>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg active:scale-95"
                          >
                            Oui
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg active:scale-95"
                          >
                            Non
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Summary footer */}
        {!isLoading && filtered.length > 0 && (
          <div className="text-center py-4 text-xs text-slate-400 font-medium">
            {filtered.length} produit{filtered.length > 1 ? "s" : ""} • {filtered.filter((p) => p.monthly_total > 0).length} avec pertes ce mois
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setEditProduct(null); }}
        onSaved={fetchInventory}
        editProduct={editProduct}
      />
    </div>
  );
};
