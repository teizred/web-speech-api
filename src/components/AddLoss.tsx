import { useState } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { API_BASE_URL } from "../config/api";

interface AddLossProps {
  onLossAdded: () => void;
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
    }
  };

  // On envoie le texte transcrit au serveur pour qu'il le comprenne
  const handleSubmit = async () => {
    if (!text) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/losses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      if (data.length === 0) {
        setError("L'IA n'a pas compris le produit ou la taille, réessaie.");
      } else {
        setSuccess(`${data.length} perte(s) enregistrée(s) !`);
        onLossAdded(); // On prévient le parent pour rafraîchir le tableau
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center text-center space-y-8">
      
      {/* Card Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dicter vos pertes</h2>
        <p className="text-slate-400 text-sm mt-1">Appuyez sur le micro et parlez</p>
      </div>

      {/* Mic Button Inline */}
      <MicButton isListening={isListening} onClick={handleMicClick} />

      {/* Transcript Box */}
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

      {/* Actions */}
      <div className="w-full space-y-4">
        {text && !isListening && (
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
                {isLoading ? "Envoi en cours..." : "Valider et Enregistrer"}
            </button>
        )}

        {/* Petites alertes de succès ou d'erreur */}
        {success && (
            <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium border border-green-100 animate-in fade-in slide-in-from-top-2">
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