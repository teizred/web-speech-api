import { useState, useEffect } from "react";
import { AddLoss } from "./components/AddLoss";
import { LossTable } from "./components/LossTable";
import { ExportButtons } from "./components/ExportButtons";
import { API_BASE_URL } from "./config/api";

interface Loss {
  id: number;
  product: string;
  quantity: number;
  size: string | null;
  created_at: string;
}

// C'est le composant principal de l'app
export default function App() {
  const [losses, setLosses] = useState<Loss[]>([]);

  // Fonction pour charger la liste des pertes depuis le serveur
  const fetchLosses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/losses`);
      const data = await response.json();
      setLosses(data); // On met à jour l'état avec les données reçues
    } catch (e) {
      console.error("Erreur lors du chargement des pertes", e);
    }
  };

  // On charge les données dès que l'app s'affiche
  useEffect(() => {
    fetchLosses();
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-lg mx-auto flex flex-col gap-8">

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-center text-slate-900 tracking-tight">
        Perte McDonald's
      </h1>

      {/* Main Action Card */}
      <main className="flex flex-col gap-8">
        <AddLoss onLossAdded={fetchLosses} />

        {/* Data List */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider text-center">
            Historique du jour
          </h2>
          <LossTable losses={losses} onUpdate={fetchLosses} />
        </div>

        {/* Export Buttons */}
        <ExportButtons />
      </main>

    </div>
  );
}