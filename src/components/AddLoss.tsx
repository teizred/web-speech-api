import { useState } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { API_BASE_URL } from "../config/api";

interface AddLossProps {
  onLossAdded: () => void;
  /** compact = used in desktop sidebar; full = used in mobile DicterView */
  variant?: 'compact' | 'full';
}

interface ParsedItem {
  product: string;
  quantity: number;
  size: string | null;
}

const MicButton: React.FC<{ isListening: boolean; onClick: () => void; size?: 'sm' | 'lg' }> = ({
  isListening,
  onClick,
  size = 'sm',
}) => {
  const dim = size === 'lg' ? 112 : 80;
  const iconSize = size === 'lg' ? 44 : 30;

  return (
    <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
      {isListening && (
        <>
          <div
            className="absolute rounded-full animate-ping"
            style={{
              inset: -8,
              background: 'rgba(239,68,68,0.2)',
              animationDuration: '1.2s',
            }}
          />
          <div
            className="absolute rounded-full animate-ping"
            style={{
              inset: -16,
              background: 'rgba(239,68,68,0.1)',
              animationDuration: '1.6s',
            }}
          />
        </>
      )}
      <button
        onClick={onClick}
        className="relative z-10 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
        style={{
          width: dim,
          height: dim,
          background: isListening
            ? 'linear-gradient(135deg, #ef4444, #ec4899)'
            : 'linear-gradient(135deg, #00420b, #1a5c22)',
          color: '#ffffff',
          boxShadow: isListening
            ? '0 0 0 0 rgba(239,68,68,0.4), 0 8px 24px rgba(239,68,68,0.4)'
            : '0 8px 24px rgba(0,66,11,0.35)',
          transform: isListening ? 'scale(1.05)' : 'scale(1)',
        }}
        aria-label={isListening ? "Arrêter l'écoute" : "Démarrer la dictée"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isListening ? "animate-pulse" : ""}
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" x2="12" y1="19" y2="22"/>
        </svg>
      </button>
    </div>
  );
};

export const AddLoss: React.FC<AddLossProps> = ({ onLossAdded, variant = 'compact' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<ParsedItem[] | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const { isListening, text, startListening, stopListening } = useSpeechRecognition();

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
        setPendingItems(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

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
      onLossAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemQuantityChange = (index: number, newQuantity: number) => {
    if (!pendingItems) return;
    const updated = [...pendingItems];
    updated[index] = { ...updated[index], quantity: Math.max(1, newQuantity) };
    setPendingItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (!pendingItems) return;
    const updated = pendingItems.filter((_, i) => i !== index);
    setPendingItems(updated.length > 0 ? updated : null);
  };

  const handleCancel = () => {
    setPendingItems(null);
    setError(null);
  };

  const isFull = variant === 'full';

  return (
    <div
      className={`flex flex-col items-center text-center ${isFull ? 'h-full px-4 py-6 overflow-y-auto pb-bottom-nav' : 'bg-white rounded-3xl p-5 card-shadow space-y-4'}`}
    >
      {/* Header */}
      {!pendingItems && (
        <div className={`w-full ${isFull ? 'mb-2' : ''}`}>
          <h2 className={`font-black text-slate-800 ${isFull ? 'text-3xl' : 'text-xl'}`}>
            Dicter vos pertes
          </h2>
          <p className={`text-slate-400 font-medium mt-1 ${isFull ? 'text-base' : 'text-xs'}`}>
            Appuyez sur le micro et parlez
          </p>

          {/* How it works */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="flex items-center gap-1.5 mx-auto mt-3 text-xs font-semibold text-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
            </svg>
            Comment ça marche ?
            <svg
              xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-300 ${showInfo ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <div className={`overflow-hidden transition-all duration-300 ${showInfo ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left text-xs space-y-2">
              <p className="font-bold text-blue-800 uppercase tracking-wider">Étapes :</p>
              <ol className="list-decimal list-inside text-blue-700 space-y-0.5">
                <li>Appuyez sur le micro</li>
                <li>Dictez vos pertes naturellement</li>
                <li>Vérifiez le résultat de l'IA</li>
                <li>Confirmez pour enregistrer</li>
              </ol>
              <p className="font-bold text-blue-800 uppercase tracking-wider mt-2">Exemples :</p>
              <p className="text-blue-700"><span className="italic">"cinq dix un"</span> → 5× 10:1</p>
              <p className="text-blue-700"><span className="italic">"trois pain royal"</span> → 3× Pain Royal</p>
              <p className="text-blue-700"><span className="italic">"deux coca moyen"</span> → 2× Coca-Cola (Moyen)</p>
              <p className="text-blue-500 font-semibold mt-1">💡 Plusieurs produits en une seule phrase !</p>
            </div>
          </div>
        </div>
      )}

      {/* Mic Button */}
      {!pendingItems && (
        <div className={`flex flex-col items-center gap-4 ${isFull ? 'my-4' : 'my-2'}`}>
          <MicButton isListening={isListening} onClick={handleMicClick} size={isFull ? 'lg' : 'sm'} />
          {isListening && (
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse">
              Écoute en cours...
            </p>
          )}
        </div>
      )}

      {/* Transcript */}
      {!pendingItems && (
        <div className="w-full">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-left pl-1">
            Transcription en direct
          </label>
          <div
            className={`w-full rounded-2xl p-4 text-left transition-all duration-300 ${isFull ? 'min-h-[100px]' : 'min-h-[72px]'} ${
              text
                ? 'bg-slate-50 border-2 border-slate-200 text-slate-800'
                : 'bg-slate-50/50 border-2 border-dashed border-slate-200 text-slate-400'
            }`}
          >
            {text ? (
              <p className={`font-semibold leading-relaxed ${isFull ? 'text-xl' : 'text-base'}`}>{text}</p>
            ) : (
              <p className="italic text-sm">Ce que tu dis apparaîtra ici...</p>
            )}
          </div>
        </div>
      )}

      {/* Analyser button */}
      {text && !isListening && !pendingItems && (
        <button
          onClick={handleParse}
          disabled={isLoading}
          className="w-full text-white font-black py-4 rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 text-base"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a, #333)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyse en cours...
            </span>
          ) : (
            "🤖 Analyser"
          )}
        </button>
      )}

      {/* Parsed items preview */}
      {pendingItems && pendingItems.length > 0 && (
        <div className="w-full space-y-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left pl-1">L'IA a compris</p>
            <p className="text-xs text-slate-400 text-left pl-1 mt-0.5">Vérifie et corrige si besoin</p>
          </div>

          <div className="space-y-2">
            {pendingItems.map((item, index) => (
              <div
                key={`${item.product}-${item.size}-${index}`}
                className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 flex items-center gap-3"
              >
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-800 text-sm leading-tight">{item.product}</p>
                  {item.size && <p className="text-xs text-slate-400 mt-0.5">{item.size}</p>}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleItemQuantityChange(index, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemQuantityChange(index, parseInt(e.target.value) || 1)}
                    className="w-12 text-center border border-slate-200 rounded-lg text-sm font-black py-1.5 focus:ring-2 focus:ring-slate-200 outline-none bg-white text-slate-800"
                  />
                  <button
                    onClick={() => handleItemQuantityChange(index, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center active:scale-90 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveItem(index)}
                  className="w-8 h-8 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-400 flex items-center justify-center active:scale-90 transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleCancel}
              className="flex-1 py-3.5 rounded-2xl font-bold bg-slate-100 text-slate-600 active:scale-[0.98] transition-all text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-[2] py-3.5 rounded-2xl font-black text-white active:scale-[0.98] transition-all disabled:opacity-50 text-base"
              style={{
                background: 'linear-gradient(135deg, #00420b, #1a5c22)',
                boxShadow: '0 4px 16px rgba(0,66,11,0.3)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi...
                </span>
              ) : "✅ Confirmer"}
            </button>
          </div>
        </div>
      )}

      {/* Feedback messages */}
      <div className="w-full space-y-2">
        {success && (
          <div className="p-3 bg-green-50 text-green-700 rounded-2xl text-sm font-semibold border border-green-100">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl text-sm font-semibold border border-red-100">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
};