# Quai M Spotify Matcher

Application de recommandation de concerts du Quai M basée sur votre profil musical Spotify.

## 🎯 Fonctionnalités

- **Authentification Spotify OAuth** - Connexion sécurisée avec votre compte Spotify
- **Analyse de profil musical** - Extraction de vos top artistes, tracks et audio features
- **Scraping automatique** - Récupération quotidienne de l'agenda du Quai M
- **Matching intelligent** - Algorithme de scoring basé sur :
  - Similarité de genres musicaux (55%)
  - Similarité d'audio features (35%)
  - Bonus artistes similaires suggérés par le Quai M (+15 pts par match, max +30)
- **Agenda personnalisé** - Concerts triés par score de compatibilité avec tags visuels
- **Visualisations** - Nuage de genres et radar d'audio features
- **Alertes email** - Récapitulatif hebdomadaire des meilleurs concerts

## 🚀 Installation Rapide

### 1. Prérequis

- Node.js 22+
- MySQL ou TiDB Cloud (gratuit)
- Compte Spotify Developer
- (Optionnel) Compte Brevo pour les emails

### 2. Cloner et installer

```bash
# Cloner le projet
git clone <votre-repo>
cd quaim_spotify_app

# Installer les dépendances
npm install
# ou
pnpm install
```

### 3. Configuration

```bash
# Copier le fichier de configuration
cp ENV_VARIABLES.md .env

# Éditer .env avec vos valeurs
nano .env
```

**Variables obligatoires** :
- `DATABASE_URL` - Connexion MySQL/TiDB
- `SPOTIFY_CLIENT_ID` - ID de votre app Spotify
- `SPOTIFY_CLIENT_SECRET` - Secret de votre app Spotify
- `SPOTIFY_REDIRECT_URI` - URL de callback OAuth
- `JWT_SECRET` - Secret aléatoire pour les sessions
- `APP_URL` - URL publique de votre application

Voir **ENV_VARIABLES.md** pour les détails complets.

### 4. Base de données

```bash
# Créer les tables
npm run db:push
```

### 5. Démarrage

**Développement avec tunnel** :

```bash
# Terminal 1 : Démarrer l'application
npm run dev

# Terminal 2 : Exposer via ngrok ou Dev Tunnels
npx ngrok http 3000
# ou
devtunnel host -p 3000
```

**Production** :

Voir **DEPLOYMENT.md** pour le guide complet de déploiement sur Fly.io.

## 📁 Structure du Projet

```
quaim_spotify_app/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Pages de l'application
│   │   ├── components/    # Composants réutilisables
│   │   └── lib/trpc.ts    # Client tRPC
│   └── public/            # Assets statiques
├── server/                # Backend Node.js
│   ├── spotify.ts         # Service Spotify API
│   ├── scraper.ts         # Scraper Quai M
│   ├── musicalProfile.ts  # Calcul profil musical
│   ├── matching.ts        # Algorithme de matching
│   ├── db.ts              # Fonctions base de données
│   └── routers.ts         # Routes tRPC
├── drizzle/               # Schéma et migrations DB
│   └── schema.ts          # Définition des tables
├── ENV_VARIABLES.md       # Documentation variables d'env
├── DEPLOYMENT.md          # Guide de déploiement
├── Caddyfile              # Configuration Caddy (optionnel)
└── package.json           # Dépendances
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Démarrer en mode dev

# Base de données
npm run db:push          # Créer/mettre à jour les tables

# Production
npm run build            # Compiler l'application
npm start                # Démarrer en production

# Tests
npm test                 # Lancer les tests
```

## 📚 Documentation

- **ENV_VARIABLES.md** - Liste complète des variables d'environnement
- **DEPLOYMENT.md** - Guide de déploiement complet (dev + prod)
- **todo.md** - Liste des fonctionnalités et tâches

## 🎵 Workflow Utilisateur

1. **Connexion** - L'utilisateur se connecte avec son compte Spotify
2. **Synchronisation** - L'app récupère ses top artistes et calcule son profil musical
3. **Scraping** - L'agenda du Quai M est scrapé automatiquement
4. **Enrichissement** - Chaque artiste est recherché sur Spotify pour obtenir ses caractéristiques
5. **Matching** - L'algorithme calcule un score de compatibilité pour chaque concert
6. **Affichage** - L'utilisateur voit l'agenda trié avec des tags visuels
7. **Alertes** - Email hebdomadaire avec les meilleurs concerts

## 🔐 Sécurité

- OAuth 2.0 pour l'authentification Spotify
- JWT pour les sessions utilisateur
- HTTPS obligatoire en production
- Variables d'environnement pour les secrets
- Validation des entrées utilisateur

## 🌐 Déploiement

### Développement

Utilisez **ngrok** ou **Dev Tunnels** pour exposer votre application locale :

```bash
# ngrok
npx ngrok http 3000

# Dev Tunnels
devtunnel host -p 3000
```

### Production

Déployez sur **Fly.io** (gratuit pour commencer) :

```bash
fly launch
fly secrets set DATABASE_URL="..." SPOTIFY_CLIENT_ID="..." ...
fly deploy
```

Voir **DEPLOYMENT.md** pour les instructions détaillées.

## 🆘 Support

### Problèmes courants

**OAuth Spotify ne fonctionne pas**
- Vérifiez que `SPOTIFY_REDIRECT_URI` correspond exactement à l'URL dans Spotify Dashboard
- L'URL doit être en HTTPS (sauf localhost)

**Base de données ne se connecte pas**
- Vérifiez `DATABASE_URL`
- Testez la connexion avec `mysql -h host -u user -p`

**Le scraping ne trouve pas d'événements**
- Vérifiez que https://quai-m.fr/agenda est accessible
- La structure HTML du site peut avoir changé

### Ressources

- [Documentation Spotify API](https://developer.spotify.com/documentation/web-api)
- [Documentation Fly.io](https://fly.io/docs)
- [Documentation TiDB Cloud](https://docs.pingcap.com/tidbcloud/)

## 📝 Licence

MIT

## 👥 Contributeurs

Développé avec ❤️ pour les amateurs de musique live du Quai M.

---

**Note** : Ce projet est indépendant et n'est pas affilié au Quai M.
