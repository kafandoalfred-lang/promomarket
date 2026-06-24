# Profil de l'utilisateur : Alfred Kafando

Ce fichier sert de mémoire et de contexte pour l'assistant IA (Antigravity). Toute réponse ou code généré pour ce projet doit être aligné avec ce profil.

## 👤 Informations Générales
- **Nom** : Alfred Kafando
- **Localisation** : Ouagadougou, Burkina Faso
- **Âge** : 30 ans
- **Études** : BAC +2 en Lettres et Philosophie, actuellement en Licence de Philosophie.
- **Emploi Actuel** : Agent de sécurité (gardien) chez MSF (plus de 4 ans d'expérience). Objectif professionnel interne : évoluer vers Chef Gardien.

## 🎯 Objectifs Financiers 2026 (Prioritaires)
- Générer au moins **1 000 000 FCFA / mois** et stabiliser ce revenu sur 6 mois minimum.
- Acheter un terrain de **5 000 000 FCFA**.
- Louer une maison plus confortable.
- Acheter une moto pour son épouse.
- Ouvrir un bureau/local commercial physique.
- Développer une activité d'importation Chine-Burkina générant au moins 300 000 FCFA/mois via Alibaba.

## 💼 Business Principal : Importation & Formation (PromoMarket Academy)
- **Activités** : 
  - Formation de clients à l'importation depuis la Chine (Alibaba, 1688, Pinduoduo, AliExpress).
  - Accompagnement (recherche fournisseurs, négociation, paiement, livraison).
  - Intermédiaire d'achat pour commerçants locaux.
  - Développement de services de **groupage** de commandes pour réduire les coûts.
- **Produits Clés** :
  - **Tondeuses rechargeables/piles** (argument : économie de frais de coiffure, usage à domicile).
  - **Trépied intelligent 360°** (suivi de mouvement, LED, télécommande, idéal pour lives TikTok/Facebook).
  - **Sacs de voyage**, **Bijoux**, **Sérums visage** (anti-acné, vitamine C, niacinamide).

## 📣 Stratégie Marketing & Création de Contenu
- **Plateformes** : TikTok (plusieurs vidéos/jour, lives de vente), Facebook Ads (campagnes de trafic/conversion pour formations/produits), WhatsApp Business.
- **Style Préféré** : Marketing direct, accroches (hooks) émotionnelles fortes pour stopper le scroll, démonstrations concrètes de produits en face caméra.

## 🤖 Projets Tech & IA
- **SaaS de Publication Multi-Plateforme** : Publier automatiquement une même vidéo sur TikTok, Facebook et Instagram.
- **Agent IA WhatsApp Business** : Chatbot intelligent pour répondre aux clients, prendre les commandes et collecter leurs informations. Règles : réponses courtes (< 50 mots), ton humain, naturel et non agressif commercialement.

## 📈 Trading
- Apprentissage du **Smart Money Concept (SMC)** (Order Blocks, FVG, OTE, TradingView, paire Gold/USD).

---

## 🛠️ Directives pour l'Agent IA (Antigravity)
1. **Ton** : Collaboratif, encourageant, axé sur des solutions pratiques et peu coûteuses adaptées à l'Afrique de l'Ouest (Burkina Faso).
2. **Devise** : Toujours afficher les prix et calculs financiers en **FCFA** (ou Yuan CNY / Dollars USD avec conversion en FCFA).
3. **Approche technique** : Proposer du code robuste, propre, et facilement hébergevole gratuitement (ex: GitHub Pages) ou gérable par un non-développeur.
4. **Marketing** : Adapter tous les exemples de scripts publicitaires ou accroches au format de marketing direct et émotionnel qu'Alfred préfère.

## 🧠 Mémoire Technique & Résolutions de Problèmes (Déploiement promomarket)

### 1. Initialisation Git et Authentification
- **Blocage d'authentification 127.0.0.1** : Si la popup de connexion GitHub bloque avec une erreur `ERR_CONNECTION_REFUSED` sur `127.0.0.1` (blocage réseau ou antivirus local), choisir l'option de secours **"Sign in with a code"**, copier le code à 8 caractères et le valider sur [github.com/login/device](https://github.com/login/device).
- **Réinitialisation propre** : Si Git est corrompu ou dans un état instable, supprimer complètement le dossier masqué `.git` (`Remove-Item -Recurse -Force .git`), réinitialiser (`git init`), recréer les configurations utilisateur localement, recréer le commit initial, lier le dépôt distant (`git remote add origin ...`), et pousser (`git push -f -u origin main`).

### 2. Détection de Formulaire Netlify (Netlify Forms)
- **Attributs obligatoires** : La balise `<form>` doit obligatoirement inclure l'attribut `method="POST"` (ou `method="post"`) et l'attribut `netlify` (ou `data-netlify="true"`). Sinon, le robot de compilation Netlify l'ignora.
- **Piège de l'attribut "hidden"** : Netlify Forms ignore parfois les balises `<form>` portant l'attribut natif HTML5 `hidden`. Pour masquer un formulaire de détection sans casser le parseur, utiliser du style CSS inline : `style="display: none;"`.
- **Garantie de détection (Astuce de l'index)** : Placer une copie exacte mais masquée du formulaire (avec les mêmes noms d'inputs) dans la page principale `index.html` garantit que Netlify détectera le formulaire au premier scan.
- **Bypass du cache Netlify** : Si un formulaire existant refuse d'être détecté après modification, renommer le formulaire (ex: de `commande-express` à `commande-rapide`) force Netlify à rafraîchir son cache et à le détecter immédiatement.
- **Activation UI & Déploiement** : Vérifier que l'option **"Form detection"** est bien active sur le tableau de bord Netlify (*Site configuration > Forms*). L'activation de cette option nécessite un nouveau déploiement manuel (**"Trigger deploy" -> "Deploy site"**) pour scanner le site.
