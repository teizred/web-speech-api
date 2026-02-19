import { useState } from "react";

export const ExportButtons = () => {
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleDownloadPDF = async () => {
    setIsLoadingPDF(true);
    setMessage(null);
    
    try {
      const response = await fetch("http://localhost:3001/api/export/pdf");
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

  const handleSendEmail = async () => {
    if (!email) {
      setMessage({ type: "error", text: "Veuillez entrer un email" });
      return;
    }

    setIsLoadingEmail(true);
    setMessage(null);

    try {
      const response = await fetch("http://localhost:3001/api/export/email", {
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

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider text-center">
        📤 Exporter les pertes
      </h3>

      {/* Bouton PDF */}
      <button
        onClick={handleDownloadPDF}
        disabled={isLoadingPDF}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
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