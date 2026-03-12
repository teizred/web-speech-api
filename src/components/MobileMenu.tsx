import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onReset }) => {
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Bloquer le scroll du corps quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
      setMessage({ type: "success", text: "PDF téléchargé !" });
    } catch (error) {
      setMessage({ type: "error", text: "Erreur PDF" });
    } finally {
      setIsLoadingPDF(false);
    }
  };

  const handleSendEmail = async () => {
    if (!email) return;
    setIsLoadingEmail(true);
    setMessage(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/export/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error();
      setMessage({ type: "success", text: "Email envoyé !" });
      setEmail("");
      setShowEmailInput(false);
    } catch (error) {
      setMessage({ type: "error", text: "Erreur envoi" });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handleReset = async () => {
    const today = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    if (window.confirm(`⚠️ ACTION CRITIQUE : Cette opération va effacer DÉFINITIVEMENT toutes les pertes du ${today}. Confirmez-vous la suppression totale ?`)) {
      try {
        await fetch(`${API_BASE_URL}/api/losses`, { method: "DELETE" });
        onReset();
        onClose();
      } catch (e) {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Menu Content */}
      <div className="relative w-72 h-full bg-white shadow-2xl flex flex-col p-6 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-[calc(env(safe-area-inset-bottom,0px)+1.5rem)] animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-slate-800">Menu</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="flex-1 space-y-4">
          {message && (
            <div className={`p-4 rounded-xl text-center text-sm font-bold animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message.text}
            </div>
          )}
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Options</p>
          
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              onClose();
            }}
            className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 active:scale-95 transition-all border border-slate-100"
          >
            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            Accueil
          </button>

          <label
            htmlFor="global-date-input"
            onClick={() => {
              // Fallback JS pour forcer l'ouverture si le label ne suffit pas
              const input = document.getElementById("global-date-input") as HTMLInputElement;
              if (input) {
                try {
                  input.showPicker();
                } catch (err) {
                  // Fallback automatique via htmlFor
                }
              }
            }}
            className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 active:scale-95 transition-all border border-slate-100 cursor-pointer"
          >
            <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </div>
            Historique
          </label>

          <button
            onClick={handleDownloadPDF}
            disabled={isLoadingPDF}
            className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 active:scale-95 transition-all border border-slate-100"
          >
            <div className="w-10 h-10 bg-[#00420b] text-white rounded-xl flex items-center justify-center shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            </div>
            {isLoadingPDF ? "Génération..." : "Télécharger PDF"}
          </button>

          {!showEmailInput ? (
            <button
              onClick={() => setShowEmailInput(true)}
              className="w-full flex items-center gap-3 p-4 bg-slate-50 rounded-2xl font-bold text-slate-700 active:scale-95 transition-all border border-slate-100"
            >
              <div className="w-10 h-10 bg-slate-700 text-white rounded-xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              Envoyer par email
            </button>
          ) : (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email..."
                className="w-full mb-2 p-3 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-slate-300 outline-none"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleSendEmail} 
                  disabled={isLoadingEmail} 
                  className="flex-1 bg-slate-800 disabled:bg-slate-400 text-white py-2 rounded-lg text-sm font-bold"
                >
                  {isLoadingEmail ? "Envoi..." : "OK"}
                </button>
                <button 
                  onClick={() => setShowEmailInput(false)} 
                  className="px-3 bg-white border border-slate-200 py-2 rounded-lg text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-colors"
                  title="Annuler"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
          )}

          <div className="pt-6">
             <button
              onClick={handleReset}
              className="w-full flex items-center gap-3 p-4 bg-red-50 rounded-2xl font-bold text-red-600 active:scale-95 transition-all border border-red-100"
            >
              <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </div>
              Réinitialiser
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
