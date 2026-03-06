import { useState, useEffect } from "react";
import { Header } from "./components/Header";
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

// Structure d'un produit venant de l'API
export interface ProductItem {
  name: string;
  sizes: string[] | null;
}

export interface ProductCategory {
  label: string;
  products: ProductItem[];
}

// C'est le composant principal de l'app
export default function App() {
  const [losses, setLosses] = useState<Loss[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

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

  // Fonction pour charger les produits depuis la base de données
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      const data = await response.json();
      setCategories(data);
    } catch (e) {
      console.error("Erreur lors du chargement des produits", e);
    }
  };

  // On charge les données dès que l'app s'affiche
  useEffect(() => {
    fetchLosses();
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header McDonald's */}
      <Header />

      {/* Contenu principal — layout adaptatif selon le wireframe */}
      <div className="p-4 md:p-6 max-w-lg mx-auto md:max-w-none md:mx-6 lg:mx-8">
        <div className="md:flex md:gap-6 lg:gap-8 md:items-start">
          
          {/* Colonne gauche : micro + catégories + export */}
          <aside className="md:w-[300px] lg:w-[340px] md:shrink-0 md:sticky md:top-4 flex flex-col gap-4 mb-6 md:mb-0">
            <AddLoss onLossAdded={fetchLosses} />
            <ExportButtons />
          </aside>

          {/* Colonne droite : recherche + grille de produits */}
          <main className="md:flex-1 md:min-w-0">
            <LossTable losses={losses} categories={categories} onUpdate={fetchLosses} />
          </main>
        </div>
      </div>
    </div>
  );
}