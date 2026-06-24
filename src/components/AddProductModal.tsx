import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

const KNOWN_CATEGORIES = [
  "Viandes", "Protéines", "Sandwichs", "Accompagnements", "Desserts",
  "Boissons", "McCafé", "Pains Cuisine", "Garnitures", "Sauces Cuisine",
  "Cuisine Autre", "Campagnes", "Ingrédients Boissons",
];

const UNIT_TYPES = [
  { value: "pieces", label: "Pièces", emoji: "🔢" },
  { value: "weight", label: "Poids (g/kg)", emoji: "⚖️" },
  { value: "liquid", label: "Liquide (ml/L)", emoji: "💧" },
];

interface ProductFormData {
  id?: number;
  name: string;
  category: string;
  subcategory: string;
  sizes: string[];
  unit_type: "pieces" | "weight" | "liquid" | "unit";
  loss_type: "vide" | "complet";
}

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editProduct?: ProductFormData | null;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  editProduct,
}) => {
  const isEditing = !!editProduct?.id;

  const emptyForm: ProductFormData = {
    name: "",
    category: "",
    subcategory: "",
    sizes: [],
    unit_type: "pieces",
    loss_type: "vide",
  };

  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [sizeInput, setSizeInput] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editProduct) {
        setForm(editProduct);
        const isKnown = KNOWN_CATEGORIES.includes(editProduct.category);
        setShowCustomCategory(!isKnown);
        setCustomCategory(isKnown ? "" : editProduct.category);
      } else {
        setForm(emptyForm);
        setShowCustomCategory(false);
        setCustomCategory("");
        setSizeInput("");
      }
      setError(null);
    }
  }, [isOpen, editProduct]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const effectiveCategory = showCustomCategory ? customCategory : form.category;

  const addSize = () => {
    const trimmed = sizeInput.trim();
    if (trimmed && !form.sizes.includes(trimmed)) {
      setForm((f) => ({ ...f, sizes: [...f.sizes, trimmed] }));
    }
    setSizeInput("");
  };

  const removeSize = (size: string) => {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((s) => s !== size) }));
  };

  const handleSubmit = async () => {
    setError(null);
    const category = effectiveCategory.trim();
    if (!form.name.trim()) return setError("Le nom est requis");
    if (!category) return setError("La catégorie est requise");

    setIsLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        category,
        subcategory: form.subcategory.trim() || null,
        sizes: form.sizes.length > 0 ? form.sizes : null,
        unit_type: form.unit_type,
        loss_type: form.loss_type,
      };

      const url = isEditing
        ? `${API_BASE_URL}/api/products/${editProduct!.id}`
        : `${API_BASE_URL}/api/products`;
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* Drag handle */}
        <div className="flex-shrink-0 pt-3 pb-2 flex justify-center">
          <div className="w-10 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex-shrink-0 px-5 pb-3 flex items-center justify-between border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-800">
            {isEditing ? "Modifier le produit" : "Nouveau produit"}
          </h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 pb-6">

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Nom */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Nom du produit *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="ex: Big Mac, Sauce Tasty..."
              className="w-full px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none border-2"
              style={{ background: "#f8fafc", borderColor: form.name ? "#00420b" : "#e2e8f0" }}
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Catégorie *
            </label>
            {!showCustomCategory ? (
              <div className="flex gap-2">
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="flex-1 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none border-2 bg-slate-50 border-slate-200 appearance-none"
                  style={{ background: "#f8fafc" }}
                >
                  <option value="">— Choisir —</option>
                  {KNOWN_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  onClick={() => { setShowCustomCategory(true); setForm((f) => ({ ...f, category: "" })); }}
                  className="px-3 py-3 rounded-2xl text-xs font-bold text-slate-500 border-2 border-slate-200 bg-slate-50 whitespace-nowrap"
                >
                  + Autre
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Nouvelle catégorie..."
                  className="flex-1 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none border-2"
                  style={{ background: "#f8fafc", borderColor: customCategory ? "#00420b" : "#e2e8f0" }}
                  autoFocus
                />
                <button
                  onClick={() => { setShowCustomCategory(false); setCustomCategory(""); }}
                  className="px-3 py-3 rounded-2xl text-xs font-bold text-slate-500 border-2 border-slate-200 bg-slate-50"
                >
                  ← Liste
                </button>
              </div>
            )}
          </div>

          {/* Sous-catégorie */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Sous-catégorie <span className="normal-case font-medium">(optionnel)</span>
            </label>
            <input
              type="text"
              value={form.subcategory}
              onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}
              placeholder="ex: Bœuf, Poulet, Sodas..."
              className="w-full px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none border-2 border-slate-200"
              style={{ background: "#f8fafc" }}
            />
          </div>

          {/* Tailles */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Tailles <span className="normal-case font-medium">(optionnel)</span>
            </label>
            {/* Existing size tags */}
            {form.sizes.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {form.sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ background: "#00420b" }}
                  >
                    {size}
                    <button
                      onClick={() => removeSize(size)}
                      className="opacity-70 hover:opacity-100 active:scale-90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }}
                placeholder="ex: Petit, Moyen, Grand, x4..."
                className="flex-1 px-4 py-3 rounded-2xl text-sm font-semibold focus:outline-none border-2 border-slate-200"
                style={{ background: "#f8fafc" }}
              />
              <button
                onClick={addSize}
                disabled={!sizeInput.trim()}
                className="px-4 py-3 rounded-2xl text-sm font-bold text-white disabled:opacity-40 active:scale-95"
                style={{ background: "#00420b" }}
              >
                + Ajouter
              </button>
            </div>
          </div>

          {/* Type d'unité */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Type d'unité *
            </label>
            <div className="flex gap-2">
              {UNIT_TYPES.map((ut) => {
                const isActive = form.unit_type === ut.value;
                return (
                  <button
                    key={ut.value}
                    onClick={() => setForm((f) => ({ ...f, unit_type: ut.value as "pieces" | "weight" | "liquid" | "unit" }))}
                    className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl text-xs font-bold border-2 transition-all active:scale-95"
                    style={{
                      background: isActive ? "#00420b" : "#f8fafc",
                      borderColor: isActive ? "#00420b" : "#e2e8f0",
                      color: isActive ? "#fff" : "#475569",
                    }}
                  >
                    <span className="text-xl">{ut.emoji}</span>
                    <span className="leading-tight text-center">{ut.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type de perte */}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
              Type de perte *
            </label>
            <div className="flex gap-2">
              {(["vide", "complet"] as const).map((type) => {
                const isActive = form.loss_type === type;
                const label = type === "vide" ? "Perte Vide" : "Perte Complète";
                const img = type === "vide" ? "/vide.png" : "/complet.png";
                return (
                  <button
                    key={type}
                    onClick={() => setForm((f) => ({ ...f, loss_type: type }))}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold border-2 transition-all active:scale-95"
                    style={{
                      background: isActive ? "#00420b" : "#f8fafc",
                      borderColor: isActive ? "#00420b" : "#e2e8f0",
                      color: isActive ? "#fff" : "#475569",
                    }}
                  >
                    <img src={img} alt={label} className="w-7 h-7 object-contain" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="flex-shrink-0 px-5 py-4 border-t border-slate-100 flex gap-3"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold text-slate-600 text-sm active:scale-[0.98]"
            style={{ background: "#f1f5f9" }}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-[2] py-4 rounded-2xl font-black text-white text-base active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #00420b, #1a5c22)", boxShadow: "0 4px 16px rgba(0,66,11,0.3)" }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Enregistrement...
              </span>
            ) : isEditing ? "✏️ Modifier" : "✅ Créer le produit"}
          </button>
        </div>
      </div>
    </>
  );
};
