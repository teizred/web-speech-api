import { useState } from "react";
import { API_BASE_URL } from "../config/api";

export const ExportButtons = ({ onReset }: { onReset: () => void }) => {
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fonction pour télécharger le PDF généré par le serveur
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
    } catch (error) {
      setMessage({ type: "error", text: "Erreur lors du téléchargement" });
    } finally {
      setIsLoadingPDF(false);
    }
  };

  // Fonction pour envoyer le rapport par email
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
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erreur lors de l'envoi" });
    } finally {
      setIsLoadingEmail(false);
    }
  };

  // Fonction pour tout remettre à zéro avec confirmation
  const handleReset = async () => {
    const today = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    
    if (window.confirm(`⚠️ ATTENTION : Vous allez supprimer DÉFINITIVEMENT toutes les pertes enregistrées le ${today}. Cette opération est irréversible. Êtes-vous certain de vouloir continuer ?`)) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/losses`, {
          method: "DELETE"
        });
        
        if (!response.ok) throw new Error("Erreur lors de la réinitialisation");
        
        setMessage({ type: "success", text: "Pertes du jour supprimées !" });
        onReset(); // Rafraîchir la liste
      } catch (error: any) {
        setMessage({ type: "error", text: error.message });
      }
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-100 space-y-3 md:space-y-4">
      <h3 className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">
        📤 Exporter les pertes
      </h3>

      {/* Bouton PDF */}
      <button
        onClick={handleDownloadPDF}
        disabled={isLoadingPDF}
        className="w-full bg-[#264F36] hover:bg-[#1e3f2b] disabled:bg-[#264F36]/50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isLoadingPDF ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Télécharger PDF
          </>
        )}
      </button>

      {/* Bouton Email */}
      {!showEmailInput ? (
        <button
          onClick={() => setShowEmailInput(true)}
          className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          Envoyer par Email
        </button>
      ) : (
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemple.com"
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSendEmail}
              disabled={isLoadingEmail}
              className="flex-1 bg-slate-700 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 rounded-xl transition-all"
            >
              {isLoadingEmail ? "Envoi..." : "Envoyer"}
            </button>
            <button
              onClick={() => {
                setShowEmailInput(false);
                setEmail("");
              }}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Bouton Reset */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-all border border-transparent hover:border-red-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          Tout réinitialiser
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};