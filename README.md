# 🎙️ Perte McDo — Suivi vocal des pertes produits

> Une application web fullstack qui permet de suivre les pertes produits chez McDonald's par **commande vocale**, grâce à la Web Speech API et à l'intelligence artificielle.

🔗 **[Démo live](https://web-speech-api-ai.vercel.app/)** · 💻 **[Code source](https://github.com/teizred/web-speech-api)**


## Le problème

En restauration rapide, le suivi des pertes produits (aliments jetés en fin de service) se fait souvent **sur papier** : c'est lent, source d'erreurs, et les données sont rarement exploitées. Il fallait une solution plus rapide et fiable.

## La solution

**Parler, valider, c'est enregistré.**

L'utilisateur appuie sur un bouton micro, dicte ses pertes à voix haute — par exemple _"3 Big Mac, 2 grandes frites, 1 CBO"_ — et l'application fait le reste :

1.  **Reconnaissance vocale** — Le navigateur capte la voix via la Web Speech API
2.  **Parsing par IA** — Le texte est envoyé à GPT-4o mini qui identifie les produits, quantités et tailles
3.  **Validation** — L'utilisateur vérifie et ajuste avant de confirmer
4.  **Enregistrement** — Les données sont stockées en base de données
5.  **Export** — Génération de rapport PDF ou envoi par email

---

##  Stack technique

| Couche                    | Technologies                            |
| ------------------------- | --------------------------------------- |
| **Frontend**              | React, TypeScript, Tailwind CSS, Vite   |
| **Backend**               | Node.js, Express                        |
| **Base de données**       | Neon (PostgreSQL serverless)            |
| **IA**                    | OpenAI API (GPT-4o mini), Vercel AI SDK |
| **Export**                | PDFKit (PDF), Nodemailer (email)        |
| **Reconnaissance vocale** | Web Speech API                          |

---

##  Fonctionnalités

- ✅ Reconnaissance vocale en français (Web Speech API)
- ✅ Parsing intelligent par IA (reconnaissance des produits, tailles, quantités)
- ✅ Ajout, modification et suppression des pertes
- ✅ Tableau récapitulatif en temps réel
- ✅ Export PDF du rapport de pertes
- ✅ Envoi du rapport par email
- ✅ Interface responsive

---

## Licence

Ce projet est open source, à des fins d'apprentissage et de démonstration.
