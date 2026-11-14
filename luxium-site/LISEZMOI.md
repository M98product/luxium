# Luxium — mise en ligne gratuite

## 1. Clé IA gratuite (Groq)
1. Va sur https://console.groq.com et crée un compte (gratuit, pas de carte).
2. Menu **API Keys** → **Create API Key** → copie la clé (`gsk_...`). Ne la mets jamais dans index.html.

## 2. Mettre en ligne (Vercel, gratuit)
1. Crée un compte sur https://vercel.com (avec GitHub, c'est le plus simple).
2. Mets ce dossier dans un dépôt GitHub (index.html, api/luxium.js, package.json).
3. Sur Vercel : **Add New → Project** → choisis le dépôt → **Deploy**.
4. Dans le projet Vercel : **Settings → Environment Variables** → ajoute
   `GROQ_API_KEY` = ta clé → **Save**.
5. **Deployments** → les trois points du dernier déploiement → **Redeploy**.

Ton site est en ligne sur `https://<nom>.vercel.app`. Tout le monde peut parler à Luxium sans compte.

## Bon à savoir
- L'offre gratuite de Groq a des limites par minute et par jour. Si elles sont atteintes,
  Luxium répond « trop de signaux… » puis remarche ensuite.
- Le site limite aussi chaque visiteur à 12 messages par minute.
- Changer de modèle : variable `LUXIUM_MODEL` sur Vercel (par défaut `llama-3.3-70b-versatile`).
- Changer la personnalité : texte `SYSTEM` en haut de `api/luxium.js`.
- Ouvrir index.html directement sur ton ordi marche aussi, mais sans IA (phrases toutes faites).
