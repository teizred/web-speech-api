import React, { useState } from "react";

interface Loss {
  id: number;
  product: string;
  quantity: number;
  size: string | null;
  created_at: string;
}

interface LossTableProps {
  losses: Loss[];
  onUpdate: () => void;
}

const CATEGORIES = [
  {
    label: "🥩 Viandes",
    products: ["10:1", "4:1", "3:1"],
  },
  {
    label: "🍗 Protéines",
    products: ["Poulet wrap", "Poulet CBO", "Poulet McChicken", "Poulet BM", "Filet", "Nuggets Veggie", "Nuggets", "Palet Veggie", "Apple Pie"],
  },
  {
    label: "🥪 Sandwichs",
    products: ["CBO Smoky Ranch", "McCrispy Smoky Ranch Bacon", "McWrap Smoky Ranch", "Big Mac Bacon", "Big Mac", "McVeggie", "McWrap Veggie", "Filet-O-Fish", "McFish Mayo", "McFish", "Fish New York", "Double Fish New York", "P'tit Chicken", "Croque McDo", "McChicken", "Cheeseburger", "Egg & Cheese McMuffin", "CBO", "Hamburger", "McWrap New York & Poulet Bacon", "Royal Cheese", "P'tit Wrap Ranch", "Egg & Bacon McMuffin", "Double Cheeseburger", "Royal Deluxe", "Royal Bacon", "Big Tasty 1 steak", "Big Tasty 2 steaks", "280 Original", "Double Cheese Bacon", "Big Arch", "McCrispy Bacon", "McCrispy", "Bacon & Beef McMuffin"],
  },
  {
    label: "🍟 Accompagnements",
    products: ["Frites Cheddar", "Frites Bacon", "Frites", "Potatoes Cheddar", "Potatoes Bacon", "Potatoes", "Wavy Fries"],
  },
  {
    label: "🥤 Boissons",
    products: ["Eau Plate", "Eau Pétillante", "Oasis Tropical", "Green Apple Sprite", "Coca-Cola Sans-Sucres", "Coca-Cola Cherry Zéro", "Coca-Cola", "Sprite Sans-Sucres", "Fanta Sans-Sucres", "Minute Maid Orange", "Lipton Ice Tea", "P'tit Nectar Pomme", "Capri-Sun Tropical", "Americano Glacé", "Café Latte Glacé Gourmand", "Café Latte Glacé", "Thé Glacé Pêche", "Délifrapp Cookie", "Délifrapp Vanille", "Smoothie Mangue Papaye", "Smoothie Banane Fraise", "Jus d'Orange"],
  },
  {
    label: "☕ McCafé",
    products: ["Espresso Décaféiné", "Double Espresso", "Espresso", "Ristretto", "Café Allongé Décaféiné", "Café Allongé", "Thé", "Café Latté", "Cappuccino", "Café Latte Gourmand", "Chocolat Chaud Gourmand", "Chocolat Chaud"],
  },
];

export const LossTable: React.FC<LossTableProps> = ({ losses, onUpdate }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Fusionner les pertes existantes
  const lossMap = new Map<string, Loss>();
  for (const loss of losses) {
    const key = `${loss.product}__${loss.size || "null"}`;
    if (lossMap.has(key)) {
      const existing = lossMap.get(key)!;
      existing.quantity += loss.quantity;
    } else {
      lossMap.set(key, { ...loss });
    }
  }

  const handleQuantityChange = async (product: string, size: string | null, currentLoss: Loss | undefined, delta: number) => {
    const key = `${product}__${size || "null"}`;
    setLoadingId(key);

    try {
      if (currentLoss) {
        // UPDATE
        const newQuantity = currentLoss.quantity + delta;

        if (newQuantity <= 0) {
          await fetch(`https://web-speech-api-backend-production.up.railway.app/api/losses/${currentLoss.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: 0 }),
          });
        } else {
          await fetch(`https://web-speech-api-backend-production.up.railway.app/api/losses/${currentLoss.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: newQuantity }),
          });
        }
      } else if (delta > 0) {
        // CREATE MANUAL
        await fetch("https://web-speech-api-backend-production.up.railway.app/api/losses/manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            product, 
            quantity: delta,
            size 
          }),
        });
      }
      
      onUpdate();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {CATEGORIES.map((group) => (
        <div key={group.label}>
          <div className="sticky top-0 bg-slate-50/95 backdrop-blur z-10 py-2 mb-2 border-b border-slate-200/50">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">
              {group.label}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {group.products.flatMap((productName) => {
              const lowerCat = group.label.toLowerCase();

              const tailleUniqueBoissons = [
                "Thé Glacé Pêche", "Délifrapp Cookie", "Délifrapp Vanille",
                "Smoothie Mangue Papaye", "Smoothie Banane Fraise",
                "Capri-Sun Tropical", "P'tit Nectar Pomme",
              ];

              const needsSizes =
                (productName === "Frites" || productName === "Potatoes" || productName === "Wavy Fries" || lowerCat.includes("boissons")) &&
                !productName.includes("Cheddar") &&
                !productName.includes("Bacon") &&
                !["Espresso", "Ristretto", "Double Espresso"].includes(productName) &&
                !tailleUniqueBoissons.includes(productName);

              const needsMcCafeSizes =
                lowerCat.includes("mccafé") && !["Espresso", "Ristretto", "Double Espresso", "Espresso Décaféiné", ].includes(productName);

              const sizes: (string | null)[] =
                needsSizes || needsMcCafeSizes ? ["Moyen", "Grand"] : [null];

              return sizes.map((size) => {
                const key = `${productName}__${size || "null"}`;
                const currentLoss = lossMap.get(key);
                const quantity = currentLoss ? currentLoss.quantity : 0;
                const isLoading = loadingId === key;

                return (
                  <div
                    key={key}
                    className={`
                      relative bg-white rounded-xl border shadow-sm p-3 flex flex-col items-center gap-3 text-center transition-all
                      ${quantity > 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'}
                    `}
                  >
                    <div className="flex-1 flex flex-col justify-center min-h-[40px]">
                      <span className={`text-xs font-bold leading-tight ${quantity > 0 ? 'text-slate-900' : 'text-slate-600'}`}>
                        {productName}
                      </span>
                      {size && (
                        <span className="text-[10px] text-slate-400 font-medium">{size}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 w-full justify-between">
                      <button
                        onClick={() => handleQuantityChange(productName, size, currentLoss, -1)}
                        disabled={isLoading || quantity === 0}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-400 hover:text-red-500 hover:shadow-sm active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>

                      <span className={`text-sm font-bold w-6 ${quantity > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                        {quantity}
                      </span>

                      <button
                        onClick={() => handleQuantityChange(productName, size, currentLoss, 1)}
                        disabled={isLoading}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-600 hover:text-green-600 hover:shadow-sm active:scale-95 transition-all disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </button>
                    </div>

                    {isLoading && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center z-20">
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                );
              });
            })}
          </div>
        </div>
      ))}
    </div>
  );
};