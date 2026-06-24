import { useState, useRef } from "react";
import { API_BASE_URL } from "../config/api";

interface ExportViewProps {
  onReset: () => void;
  onHistorySelect: (date: string) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({ onReset, onHistorySelect }) => {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleDownloadPDF = async () => {
    setIsLoadingPDF(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/export/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pertes-mcdo-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setMessage({ type: "success", text: "PDF téléchargé avec succès !" });
    } catch {
      setMessage({ type: "error", text: "Erreur lors du téléchargement" });
    } finally {
      setIsLoadingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Veuillez entrer un email" });
      return;
    }
    setIsLoadingEmail(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/export/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage({ type: "success", text: "Email envoyé avec succès !" });
      setEmail("");
      setShowEmailInput(false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur lors de l'envoi";
      setMessage({ type: "error", text: msg });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/losses`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erreur lors de la réinitialisation");
      setMessage({ type: "success", text: "Pertes du jour supprimées !" });
      setShowResetConfirm(false);
      onReset();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur";
      setMessage({ type: "error", text: msg });
    }
  };

  const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

  return (
    <div className="flex-1 overflow-y-auto pb-bottom-nav">
      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        
        {/* Header section */}
        <div className="mb-2">
          <h2 className="text-2xl font-black text-slate-800">Exporter</h2>
          <p className="text-sm text-slate-400 font-medium mt-0.5">Rapports & données du jour</p>
        </div>

        {/* Message feedback */}
        {message && (
          <div
            className={`p-4 rounded-2xl text-sm font-semibold border ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-red-50 text-red-600 border-red-100"
            }`}
          >
            {message.type === "success" ? "✅ " : "⚠️ "}{message.text}
          </div>
        )}

        {/* Historique */}
        <div className="bg-white rounded-3xl p-5 card-shadow space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#FFF3CC' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e0a800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">Historique</p>
              <p className="text-xs text-slate-400">Consulter un jour précédent</p>
            </div>
          </div>
          <label className="block w-full relative cursor-pointer active:scale-[0.98] transition-transform">
            <div className="w-full text-white font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-sm" style={{ background: '#FFC72C', color: '#1a1a1a' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
              </svg>
              Choisir une date
            </div>
            <input
              ref={dateInputRef}
              type="date"
              max={new Date().toISOString().split("T")[0]}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onClick={(e) => {
                try { (e.target as HTMLInputElement).showPicker(); } catch { /* fallback */ }
              }}
              onChange={(e) => {
                if (e.target.value) {
                  onHistorySelect(e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </label>
        </div>

        {/* PDF */}
        <div className="bg-white rounded-3xl p-5 card-shadow space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#e8f5e9' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00420b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">Rapport PDF</p>
              <p className="text-xs text-slate-400">Toutes les pertes du jour</p>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={isLoadingPDF}
            className="w-full text-white font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-transform disabled:opacity-50"
            style={{ background: '#00420b' }}
          >
            {isLoadingPDF ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Génération...</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg> Télécharger le PDF</>
            )}
          </button>
        </div>

        {/* Email */}
        <div className="bg-white rounded-3xl p-5 card-shadow space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: '#f0f4ff' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b5bdb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">Envoyer par Email</p>
              <p className="text-xs text-slate-400">Rapport envoyé à votre adresse</p>
            </div>
          </div>

          {!showEmailInput ? (
            <button
              onClick={() => setShowEmailInput(true)}
              className="w-full font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 text-sm active:scale-[0.98] transition-transform border-2 border-slate-100 text-slate-700"
              style={{ background: '#f8fafc' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              Saisir un email
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="w-full px-4 py-3.5 border-2 border-slate-100 rounded-2xl text-sm focus:outline-none focus:border-slate-300 font-medium text-slate-800"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSendEmail}
                  disabled={isLoadingEmail}
                  className="flex-1 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
                  style={{ background: '#1a1a1a' }}
                >
                  {isLoadingEmail ? "Envoi..." : "Envoyer"}
                </button>
                <button
                  onClick={() => { setShowEmailInput(false); setEmail(""); }}
                  className="px-4 py-3 bg-slate-100 text-slate-500 font-bold rounded-xl text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Reset */}
        <div className="bg-white rounded-3xl p-5 card-shadow">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-red-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base">Réinitialiser</p>
              <p className="text-xs text-slate-400">Effacer toutes les pertes du {today}</p>
            </div>
          </div>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full text-red-600 border-2 border-red-100 font-bold py-3.5 rounded-2xl text-sm active:scale-[0.98] transition-transform"
              style={{ background: '#fff5f5' }}
            >
              Effacer toutes les pertes
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-600 font-semibold text-center py-2">
                ⚠️ Cette action est irréversible. Confirmer ?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl text-sm active:scale-95 transition-transform"
                >
                  Oui, effacer
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
