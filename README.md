# 🚀 SmartStand 360° - Tunnel de vente E-commerce

Ce projet est une Landing Page e-commerce mono-produit à fort taux de conversion, optimisée pour le marché ouest-africain avec le modèle de **Paiement à la Livraison (Cash on Delivery)** et confirmation instantanée sur **WhatsApp**.

Le site est conçu avec du HTML5, CSS3 et JavaScript natif. Il est extrêmement léger pour charger instantanément sur les mobiles avec des connexions internet lentes.

---

## 🛠️ Configuration Initiale (Essentiel)

Avant de mettre le site en ligne, vous devez configurer **votre numéro WhatsApp** :

1. Ouvrez le fichier `app.js` dans un éditeur de texte.
2. À la ligne 7, localisez la variable suivante :
   ```javascript
   const WHATSAPP_PHONE = "22670000000"; // <-- Modifiez ici !
   ```
3. Remplacez le numéro par votre numéro WhatsApp de vente (avec l'indicatif de votre pays, sans espaces ni caractères spéciaux. Par exemple `22670XXXXXX` pour le Burkina Faso ou `2246XXXXXX` pour la Guinée).
4. Enregistrez le fichier.

---

## 📂 Structure du Projet (Évolutif)

Le projet est conçu pour pouvoir ajouter facilement d'autres produits à l'avenir :
- `index.html` : La page de vente du **Trépied Intelligent 360° + Trépied 1m70**.
- `style.css` : Le style graphique moderne (thème sombre, effet verre/glassmorphism, boutons animés, responsive mobile). Ce fichier est partagé. Si vous ajoutez un produit plus tard, il aura la même apparence premium.
- `app.js` : La logique interactive (calcul de prix selon la quantité, compte à rebours d'urgence, accordéons FAQ, envoi Netlify Forms + redirection WhatsApp).
- `smart_tripod_360.png` : L'image premium du produit.

### Comment ajouter un autre produit dans le futur ?
1. Créez un nouveau fichier HTML (ex: `produit-tondeuse.html`).
2. Copiez-collez le contenu de `index.html` à l'intérieur.
3. Modifiez les textes et l'image du produit.
4. Liez-le à la feuille de style `style.css` et au script `app.js` existants. C'est tout !

---

## ☁️ Déploiement sur GitHub & Netlify (Gratuit)

Suivez ces étapes simples pour héberger votre site gratuitement et activer la base de données de commandes :

### Étape 1 : Mettre votre code sur GitHub
1. Connectez-vous sur votre compte [GitHub](https://github.com).
2. Créez un nouveau dépôt public ou privé nommé `promomarket-shop`.
3. Dans votre dossier local `META IA BULD`, initialisez Git et envoyez vos fichiers :
   ```bash
   git init
   git add .
   git commit -m "Initial commit - E-commerce Trépied 360"
   git branch -M main
   git remote add origin https://github.com/VOTRE_PSEUDO/promomarket-shop.git
   git push -u origin main
   ```

### Étape 2 : Déployer sur Netlify
1. Connectez-vous sur [Netlify](https://www.netlify.com) (vous pouvez vous connecter avec votre compte GitHub).
2. Cliquez sur **"Add new site"** (Ajouter un nouveau site) -> **"Import from Git"** (Importer depuis Git).
3. Sélectionnez votre dépôt `promomarket-shop`.
4. Laissez les configurations par défaut (le dossier racine est vide, pas de commande de build).
5. Cliquez sur **"Deploy site"** (Déployer le site).
6. Netlify vous attribue une adresse web gratuite (ex: `votre-site.netlify.app`) que vous pouvez personnaliser !

### Étape 3 : Fonctionnement de la Base de Données (Netlify Forms)
*   **Netlify Forms** est déjà activé dans le code de votre formulaire (`data-netlify="true"`).
*   À chaque fois qu'un client remplit et valide le formulaire sur votre site, ses informations (Nom, Téléphone, Ville, Quartier, Quantité) sont enregistrées automatiquement.
*   Pour voir vos commandes, allez sur votre tableau de bord Netlify, cliquez sur votre site, puis sur l'onglet **"Forms"** (Formulaires). Vous y trouverez la liste complète des commandes de vos clients avec la date et les détails, même s'ils n'ont pas finalisé sur WhatsApp !
