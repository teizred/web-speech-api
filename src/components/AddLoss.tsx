import { useState } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { API_BASE_URL } from "../config/api";

interface AddLossProps {
  onLossAdded: () => void;
}

interface ParsedItem {
  product: string;
  quantity: number;
  size: string | null;
}

// Petit composant pour le bouton du micro qui s'anime
const MicButton: React.FC<{ isListening: boolean; onClick: () => void }> = ({ isListening, onClick }) => {
    return (
        <div className="relative group">
            {/* On affiche une aura rouge qui pulse quand le micro écoute */}
            {isListening && (
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
            )}
            
            <button
                onClick={onClick}
                className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform 
                    ${isListening
                        ? 'bg-linear-to-br from-red-500 to-pink-600 text-white scale-110'
                        : 'bg-white text-blue-600 border-2 border-slate-100 hover:border-blue-200 hover:scale-105 active:scale-95'
                    }
                `}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isListening ? "animate-pulse" : ""}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
            </button>
        </div>
    );
};

// C'est ici qu'on gère l'ajout d'une perte par commande vocale
export const AddLoss: React.FC<AddLossProps> = ({ onLossAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // Nouvel état : les items parsés par l'IA en attente de validation
  const [pendingItems, setPendingItems] = useState<ParsedItem[] | null>(null);

  // Notre hook magique qui s'occupe de la reconnaissance vocale
  const { isListening, text, startListening, stopListening } = useSpeechRecognition();

  // Quand on clique sur le gros bouton micro
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setSuccess(null);
      setError(null);
      setPendingItems(null);
    }
  };

  // ÉTAPE 1 : On envoie le texte à l'IA pour parser (sans enregistrer)
  const handleParse = async () => {
    if (!text) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/losses/parse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (data.length === 0) {
        setError("L'IA n'a pas compris le produit ou la taille, réessaie.");
      } else {
        setPendingItems(data); // On affiche la preview
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ÉTAPE 2 : L'utilisateur confirme → on enregistre le batch
  const handleConfirm = async () => {
    if (!pendingItems || pendingItems.length === 0) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/losses/batch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: pendingItems }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSuccess(`${data.length} perte(s) enregistrée(s) !`);
      setPendingItems(null);
      onLossAdded(); // On prévient le parent pour rafraîchir le tableau
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier la quantité d'un item dans la preview
  const handleItemQuantityChange = (index: number, newQuantity: number) => {
    if (!pendingItems) return;
    const updated = [...pendingItems];
    updated[index] = { ...updated[index], quantity: Math.max(1, newQuantity) };
    setPendingItems(updated);
  };

  // Retirer un item de la preview
  const handleRemoveItem = (index: number) => {
    if (!pendingItems) return;
    const updated = pendingItems.filter((_, i) => i !== index);
    setPendingItems(updated.length > 0 ? updated : null);
  };

  // Annuler la preview et recommencer
  const handleCancel = () => {
    setPendingItems(null);
    setError(null);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center space-y-8">
      
      {/* Card Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dicter vos pertes</h2>
        <p className="text-slate-400 text-sm mt-1">Appuyez sur le micro et parlez</p>
      </div>

      {/* Mic Button — caché quand on a une preview en cours */}
      {!pendingItems && (
        <MicButton isListening={isListening} onClick={handleMicClick} />
      )}

      {/* Transcript Box — caché quand on a une preview */}
      {!pendingItems && (
        <div className="w-full">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 text-left pl-1">
              Transcription en direct
          </label>
          <div className={`
              w-full rounded-2xl p-4 text-left min-h-[80px] transition-all duration-300
              ${text 
                  ? 'bg-slate-50 border-2 border-slate-200 text-slate-800' 
                  : 'bg-slate-50/50 border-2 border-dashed border-slate-200 text-slate-400'
              }
          `}>
              {text ? (
                  <p className="font-medium text-lg leading-relaxed">{text}</p>
              ) : (
                  <p className="italic text-sm">Ce que tu dis apparaîtra ici...</p>
              )}
          </div>
        </div>
      )}

      {/* Bouton Analyser (remplace l'ancien "Valider et Enregistrer") */}
      {text && !isListening && !pendingItems && (
        <div className="w-full">
          <button
            onClick={handleParse}
            disabled={isLoading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyse en cours...
              </span>
            ) : (
              " Analyser"
            )}
          </button>
        </div>
      )}

      {/* ===== PREVIEW DES ITEMS PARSÉS ===== */}
      {pendingItems && pendingItems.length > 0 && (
        <div className="w-full space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 text-left pl-1">
              L'IA a compris
            </label>
            <p className="text-xs text-slate-400 text-left pl-1">
              Vérifie et corrige si besoin avant de confirmer
            </p>
          </div>

          {/* Liste des items */}
          <div className="space-y-3">
            {pendingItems.map((item, index) => (
              <div
                key={`${item.product}-${item.size}-${index}`}
                className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-slate-300"
              >
                {/* Infos produit */}
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-800 text-sm leading-tight">{item.product}</p>
                  {item.size && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.size}</p>
                  )}
                </div>

                {/* Input quantité */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleItemQuantityChange(index, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemQuantityChange(index, parseInt(e.target.value) || 1)}
                    className="w-14 text-center border border-slate-200 rounded-lg text-sm font-bold py-1.5 focus:ring-2 focus:ring-blue-200 focus:outline-none bg-white text-slate-800"
                  />
                  <button
                    onClick={() => handleItemQuantityChange(index, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 active:scale-95 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>

                {/* Bouton supprimer */}
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-95 transition-all"
                  title="Retirer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Boutons Confirmer / Annuler */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 py-3.5 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 active:scale-[0.98] transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-2 py-3.5 rounded-xl font-bold bg-green-600 text-white shadow-lg hover:bg-green-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi...
                </span>
              ) : (
                " Confirmer"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Petites alertes de succès ou d'erreur */}
      <div className="w-full space-y-4">
        {success && (
            <div className="p-3 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100 animate-in fade-in slide-in-from-top-2">
                ✅ {success}
            </div>
        )}
        {error && (
             <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
                ⚠️ {error}
            </div>
        )}
      </div>
    </div>
  );
};