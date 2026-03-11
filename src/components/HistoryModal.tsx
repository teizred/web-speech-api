import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

interface HistoryLoss {
  id: number;
  product: string;
  quantity: number;
  size: string | null;
  unit: string;
  unit_type: string;
  loss_type: string;
  category: string;
  subcategory: string | null;
  created_at: string;
}

interface HistoryModalProps {
  date: string; // YYYY-MM-DD
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ date, onClose }) => {
  const [losses, setLosses] = useState<HistoryLoss[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // On charge les pertes de la date sélectionnée
  useEffect(() => {
    const fetchLosses = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/losses?date=${date}`);
        const data = await res.json();
        
        // On enrichit avec les infos produit (category, unit_type, etc.)
        const productsRes = await fetch(`${API_BASE_URL}/api/products?type=vide`);
        const videCategories = await productsRes.json();
        const productsRes2 = await fetch(`${API_BASE_URL}/api/products?type=complet`);
        const completCategories = await productsRes2.json();
        
        // On construit un dictionnaire de produits pour enrichir les pertes
        const productMap: Record<string, { category: string; subcategory: string | null; unit_type: string; loss_type: string }> = {};
        
        const processCategories = (categories: any[], lossType: string) => {
          categories.forEach((cat: any) => {
            cat.products?.forEach((p: any) => {
              productMap[p.name] = { category: cat.label, subcategory: null, unit_type: p.unit_type, loss_type: lossType };
            });
            cat.subcategories?.forEach((sub: any) => {
              sub.products?.forEach((p: any) => {
                productMap[p.name] = { category: cat.label, subcategory: sub.name, unit_type: p.unit_type, loss_type: lossType };
              });
            });
          });
        };
        
        processCategories(videCategories, "vide");
        processCategories(completCategories, "complet");
        
        // les pertes
        const enriched = data.map((loss: any) => ({
          ...loss,
          ...(productMap[loss.product] || { category: "Autre", subcategory: null, unit_type: "pieces", loss_type: "vide" })
        }));
        
        setLosses(enriched);
      } catch (e) {
        console.error("Erreur chargement historique:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLosses();
  }, [date]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/export/pdf?date=${date}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pertes-mcdo-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erreur téléchargement PDF:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const formatQuantity = (loss: HistoryLoss) => {
    if (loss.unit_type === "weight") {
      if (loss.quantity >= 1000) return `${(loss.quantity / 1000).toFixed(2)} kg`;
      return `${loss.quantity} g`;
    }
    if (loss.unit_type === "liquid") {
      if (loss.quantity >= 1000) return `${(loss.quantity / 1000).toFixed(2)} L`;
      return `${loss.quantity} ml`;
    }
    return `${loss.quantity} pcs`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Grouper les pertes par type, catégorie et sous-catégorie
  const groupedLosses = losses.reduce((acc, loss) => {
    const type = loss.loss_type === "vide" ? "Pertes Vides" : "Pertes Complètes";
    if (!acc[type]) acc[type] = {};
    const cat = loss.category || "Autre";
    if (!acc[type][cat]) acc[type][cat] = {};
    const sub = loss.subcategory || "__direct__";
    if (!acc[type][cat][sub]) acc[type][cat][sub] = [];
    acc[type][cat][sub].push(loss);
    return acc;
  }, {} as Record<string, Record<string, Record<string, HistoryLoss[]>>>);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">📅 Historique</h2>
            <p className="text-sm text-slate-500 capitalize">{formatDate(date)}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
              <p className="text-sm text-slate-400">Chargement...</p>
            </div>
          ) : losses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <span className="text-4xl">📭</span>
              <p className="text-sm text-slate-400 font-medium">Aucune perte enregistrée ce jour</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Ordre : Pertes Vides d'abord, puis Complètes */}
              {["Pertes Vides", "Pertes Complètes"].map((type) => {
                const categories = groupedLosses[type];
                if (!categories) return null;

                return (
                  <div key={type}>
                    {/* Type header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        type === "Pertes Vides" 
                          ? "bg-amber-50 text-amber-600 border border-amber-100" 
                          : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}>
                        <img 
                          src={type === "Pertes Vides" ? "/vide.png" : "/complet.png"} 
                          alt={type} 
                          className="w-4 h-4 object-contain" 
                        />
                        {type}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(categories).map(([catName, subcats]) => (
                        <div key={catName} className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          {/* Category */}
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                            {catName}
                          </p>

                          <div className="space-y-1">
                            {Object.entries(subcats).map(([subName, items]) => (
                              <div key={subName}>
                                {subName !== "__direct__" && (
                                  <p className="text-[11px] text-slate-400 font-medium italic px-1 mt-1 mb-0.5">
                                    {subName}
                                  </p>
                                )}
                                {items.map((loss) => (
                                  <div key={loss.id} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-white transition-colors">
                                    <span className="text-sm text-slate-700 font-medium">
                                      {loss.product}
                                      {loss.size && <span className="text-xs text-slate-400 ml-1">({loss.size})</span>}
                                    </span>
                                    <span className="text-sm font-bold text-slate-800 tabular-nums">
                                      {formatQuantity(loss)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Total */}
              <div className="bg-slate-800 text-white rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium">Total des pertes</span>
                <span className="text-lg font-bold">{losses.length} article{losses.length > 1 ? "s" : ""}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer — Download PDF */}
        {!isLoading && losses.length > 0 && (
          <div className="sticky bottom-0 bg-white border-t border-slate-100 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="w-full bg-[#00420b] hover:bg-[#003609] disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isDownloading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Télécharger le PDF
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
