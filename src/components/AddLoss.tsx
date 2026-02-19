import { useState } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { MicButton } from "./Speech/MicButton";

interface AddLossProps {
  onLossAdded: () => void;
}

export const AddLoss: React.FC<AddLossProps> = ({ onLossAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { isListening, text, startListening, stopListening } =
    useSpeechRecognition();

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
      setSuccess(null);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!text) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("https://web-speech-api-backend-production.up.railway.app/api/losses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setSuccess(`${data.length} perte(s) enregistrée(s) !`);
      onLossAdded(); // refresh la table
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

      {/* Mic Button */}
      <div className="relative group">
        <div className={`absolute inset-0 rounded-full blur-xl transition-opacity duration-500 ${isListening ? 'bg-red-400/30 opacity-100' : 'bg-transparent opacity-0'}`}></div>
        <MicButton isListening={isListening} onClick={handleMicClick} />
      </div>

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
                <p className="italic text-sm">Ce que vous dites apparaîtra ici...</p>
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
                {isLoading ? "Enregistrement..." : "Valider et Enregistrer"}
            </button>
        )}

        {/* Status Messages */}
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