import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

dotenv.config();

const app = express();
const sql = neon(process.env.DATABASE_URL);
const openaiClient = createOpenAI({
  compatibility: "strict",
});

app.use(cors());
app.use(express.json());

// Création de la table avec la colonne size
await sql`
  CREATE TABLE IF NOT EXISTS losses (
    id SERIAL PRIMARY KEY,
    product TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    size TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`;

// GET - pertes du jour uniquement
app.get("/api/losses", async (req, res) => {
  try {
    const losses = await sql`
      SELECT * FROM losses 
      WHERE created_at::date = CURRENT_DATE
      ORDER BY created_at DESC
    `;
    res.json(losses);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST - parser le transcript vocal avec AI puis sauvegarder
app.post("/api/losses", async (req, res) => {
  try {
    const { transcript } = req.body;

    const { text } = await generateText({
      model: openaiClient("gpt-4o-mini"),
      prompt: `Tu es un assistant pour McDonald's qui enregistre des pertes de produits.
      L'utilisateur va dicter une ou plusieurs pertes oralement en français.
      Tu dois extraire les produits, quantités et tailles.

      LISTE OFFICIELLE DES PRODUITS:

      VIANDES (pas de taille): 10:1, 4:1, 3:1

      PROTEINES (pas de taille): Poulet wrap, Poulet CBO, Poulet McChicken, Poulet BM, Filet, Nuggets, Nuggets Veggie, Palet Veggie, Apple Pie

      SANDWICHS (pas de taille): CBO Smoky Ranch, McCrispy Smoky Ranch Bacon, McWrap Smoky Ranch, Big Mac Bacon, Big Mac, McVeggie, McWrap Veggie, Filet-O-Fish, McFish, McFish Mayo, Fish New York, Double Fish New York, P'tit Chicken, Croque McDo, McChicken, Cheeseburger, Egg & Cheese McMuffin, CBO, Hamburger, McWrap New York & Poulet Bacon, Royal Cheese, P'tit Wrap Ranch, Egg & Bacon McMuffin, Double Cheeseburger, Royal Deluxe, Royal Bacon, Big Tasty 1 steak, Big Tasty 2 steaks, 280 Original, Double Cheese Bacon, Big Arch, McCrispy, McCrispy Bacon, Bacon & Beef McMuffin

      BOISSONS FROIDES (taille: Petit, Moyen, Grand — défaut: Grand si non précisé):
      Eau Plate, Eau Pétillante, Oasis Tropical, Green Apple Sprite, Coca-Cola Sans-Sucres, Coca-Cola, Coca-Cola Cherry Zéro, Sprite Sans-Sucres, Fanta Sans-Sucres, Minute Maid Orange, Lipton Ice Tea, P'tit Nectar Pomme, Capri-Sun Tropical, Americano Glacé, Café Latte Glacé, Café Latte Glacé Gourmand, Thé Glacé Pêche, Délifrappe Cookie, Délifrappe Vanille, Smoothie Mangue Papaye, Smoothie Banane Fraise, Jus d'orange

      MCCAFE:
      - Espresso, Ristretto, Double Espresso → toujours size: null
      - Reste des McCafé (taille: Moyen, Grand — défaut: Grand si non précisé): Espresso Décaféiné, Café Allongé, Café Allongé Décaféiné, Thé, Café Latté, Cappuccino, Café Latte Gourmand, Chocolat Chaud, Chocolat Chaud Gourmand

      RÈGLES:
      - "dix pour un" ou "10 pour 1" → "10:1"
      - "quatre pour un" → "4:1"
      - "trois pour un" → "3:1"
      - "cbo" seul → "Poulet CBO"
      - "big mac" → "Big Mac"
      - "nuggets" → "Nuggets"
      - "grand coca", "coca grand" → product: "Coca-Cola", size: "Grand"
      - "petit coca" → product: "Coca-Cola", size: "Petit"
      - "moyen coca" → product: "Coca-Cola", size: "Moyen"
      - Si taille non précisée pour une boisson → size: "Grand"
      - Si taille non précisée pour viande/protéine/sandwich → size: null
      - Tu peux recevoir PLUSIEURS produits dans une seule phrase
      - Ignore les mots comme "pertes", "en perte", "et", "aussi"
      - Si un produit n'est pas dans la liste, ignore-le

      Réponds UNIQUEMENT avec un tableau JSON, sans markdown, sans explication.
      Format: [{ "product": "nom exact", "quantity": nombre, "size": "Grand"|"Moyen"|"Petit"|null }]
      Exemple: [{ "product": "10:1", "quantity": 3, "size": null }, { "product": "Coca-Cola", "quantity": 2, "size": "Grand" }]

      Transcript: "${transcript}"`,
    });

    const cleaned = text.replace(/```json|```/g, "").trim();
    const items = JSON.parse(cleaned);

    const savedLosses = [];
    for (const item of items) {
      const [loss] = await sql`
        INSERT INTO losses (product, quantity, size)
        VALUES (${item.product}, ${item.quantity}, ${item.size})
        RETURNING *
      `;
      savedLosses.push(loss);
    }

    res.json(savedLosses);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE - reset toutes les pertes du jour
app.delete("/api/losses", async (req, res) => {
  try {
    await sql`
      DELETE FROM losses 
      WHERE created_at::date = CURRENT_DATE
    `;
    res.json({ message: "Pertes du jour supprimées" });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});