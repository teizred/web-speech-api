/**
 * our menu data!
 * we keep this separate from our React components so the UI stays clean.
 * this makes it very easy to add a new burger or change a category icon.
 */
export const CATEGORIES = [
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
    products: ["CBO Smoky Ranch", "McCrispy Smoky Ranch Bacon", "McWrap Smoky Ranch", "Big Mac Bacon", "Big Mac", "McVeggie", "McWrap Veggie", "Filet-O-Fish", "McFish Mayo", "McFish", "Fish New York", "Double Fish New York", "P'tit Chicken", "Croque McDo", "McChicken", "Cheeseburger", "Egg & Cheese McMuffin", "CBO", "Hamburger", "McWrap New York", "Royal Cheese", "P'tit Wrap Ranch","Egg & Cheese", "Egg & Bacon", "Double Cheeseburger", "Royal Deluxe", "Royal Bacon", "Big Tasty 1 steak", "Big Tasty 2 steaks", "280 Original", "Double Cheese Bacon", "Big Arch", "McCrispy Bacon", "McCrispy", "Bacon & Beef McMuffin"],
  },
  {
    label: "🍟 Accompagnements",
    products: ["Frites", "Potatoes", "Wavy Fries", "Frites Cheddar", "Frites Bacon", "Potatoes Cheddar", "Potatoes Bacon"],
  },
  {
    label: "🥤 Boissons",
    products: ["Coca-Cola", "Coca-Cola Sans-Sucres", "Coca-Cola Cherry Zéro", "Fanta Sans-Sucres", "Lipton Ice Tea", "Sprite Sans-Sucres", "Oasis Tropical", "Green Apple Sprite", "Eau Plate", "Eau Pétillante", "Minute Maid Orange", "P'tit Nectar Pomme", "Capri-Sun Tropical"],
  },
  {
    label: "☕ McCafé",
    products: ["Ristretto", "Espresso", "Double Espresso", "Café Allongé", "Café Latté", "Cappuccino", "Café Latte Glacé", "Café Latte Glacé Gourmand", "Americano Glacé", "Thé Earl Grey", "Thé Vert Menthe", "Thé Citron Gingembre", "Chocolat Chaud", "Chocolat Chaud Gourmand", "Espresso Décaféiné", "Café Allongé Décaféiné", "Thé Glacé Pêche", "Délifrapp Cookie", "Délifrapp Vanille", "Smoothie Mangue Papaye", "Smoothie Banane Fraise"],
  },
];

const TAILLE_UNIQUE_BOISSONS = ["Capri-Sun Tropical", "P'tit Nectar Pomme"];
const MOYEN_GRAND_BOISSONS = ["Eau Plate", "Eau Pétillante"];
const TAILLE_UNIQUE_MCCAFE = [
  "Espresso", "Ristretto", "Double Espresso", "Espresso Décaféiné",
  "Thé Glacé Pêche", "Délifrapp Cookie", "Délifrapp Vanille",
  "Smoothie Mangue Papaye", "Smoothie Banane Fraise",
];

export const getSizes = (productName: string, categoryLabel: string): (string | null)[] => {
    const lowerCat = categoryLabel.toLowerCase();
    
    if (TAILLE_UNIQUE_BOISSONS.includes(productName)) return [null];
    if (productName === "Frites") return ["Petit", "Moyen", "Grand"];
    if (productName === "Potatoes" || productName === "Wavy Fries") return ["Moyen", "Grand"];
    if (lowerCat.includes("boissons") && MOYEN_GRAND_BOISSONS.includes(productName)) return ["Moyen", "Grand"];
    if (lowerCat.includes("boissons")) return ["Petit", "Moyen", "Grand"];
    if (lowerCat.includes("mccafé") && TAILLE_UNIQUE_MCCAFE.includes(productName)) return [null];
    if (lowerCat.includes("mccafé")) return ["Moyen", "Grand"];
    
    return [null];
};
