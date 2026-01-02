# Variables d'Environnement - Quai M Spotify Matcher

Ce document liste toutes les variables d'environnement nécessaires pour faire fonctionner l'application en déploiement indépendant.

## Configuration de Base de Données

### `DATABASE_URL`
**Obligatoire** - Chaîne de connexion MySQL/TiDB

**Format** : `mysql://user:password@host:port/database`

**Exemple** :
```
DATABASE_URL=mysql://quaim_user:secure_password@localhost:3306/quaim_spotify
```

**Comment l'obtenir** :
1. Installez MySQL ou utilisez TiDB Cloud (gratuit)
2. Créez une base de données : `CREATE DATABASE quaim_spotify;`
3. Créez un utilisateur avec les permissions appropriées
4. Construisez la chaîne de connexion avec vos identifiants

---

## Configuration Spotify API

### `SPOTIFY_CLIENT_ID`
**Obligatoire** - Identifiant client de votre application Spotify

**Comment l'obtenir** :
1. Allez sur https://developer.spotify.com/dashboard
2. Connectez-vous avec votre compte Spotify
3. Cliquez sur "Create app"
4. Remplissez le formulaire (nom, description)
5. Copiez le **Client ID** affiché

### `SPOTIFY_CLIENT_SECRET`
**Obligatoire** - Secret client de votre application Spotify

**Comment l'obtenir** :
1. Dans le dashboard de votre app Spotify
2. Cliquez sur "Settings"
3. Copiez le **Client Secret**
4. ⚠️ **Ne partagez jamais ce secret publiquement**

### `SPOTIFY_REDIRECT_URI`
**Obligatoire** - URL de callback OAuth

**Format** : `https://votredomaine.com/api/spotify/callback`

**Exemples** :
- Développement local : `http://localhost:3000/api/spotify/callback`
- Production : `https://quaim-matcher.votredomaine.com/api/spotify/callback`

**Configuration** :
1. Dans le dashboard Spotify de votre app
2. Allez dans "Settings"
3. Ajoutez votre URL dans "Redirect URIs"
4. Cliquez sur "Add" puis "Save"

---

## Configuration Grok API (Optionnel)

### `GROQ_API_KEY`
**Optionnel** - Clé API Grok pour l'enrichissement IA des données artistes

**Comment l'obtenir** :
1. Allez sur https://console.groq.com
2. Créez un compte gratuit
3. Générez une clé API
4. Copiez la clé

**Utilisation** : Permet d'enrichir automatiquement les profils d'artistes inconnus sur Spotify en analysant leurs descriptions avec l'IA.

---

## Configuration Email (Optionnel)

### `BREVO_API_KEY`
**Optionnel** - Clé API Brevo (ex-Sendinblue) pour l'envoi d'emails

**Comment l'obtenir** :
1. Créez un compte sur https://www.brevo.com (offre gratuite : 300 emails/jour)
2. Allez dans "Settings" → "API Keys"
3. Créez une nouvelle clé API
4. Copiez la clé

### `BREVO_SENDER_EMAIL`
**Optionnel** - Email expéditeur pour les notifications

**Exemple** : `noreply@votredomaine.com`

**Configuration** :
1. Vérifiez votre domaine dans Brevo
2. Ou utilisez un email Brevo par défaut

### `BREVO_SENDER_NAME`
**Optionnel** - Nom affiché comme expéditeur

**Exemple** : `Quai M Matcher`

---

## Configuration Application

### `NODE_ENV`
**Obligatoire** - Environnement d'exécution

**Valeurs possibles** :
- `development` - Mode développement (logs verbeux, hot reload)
- `production` - Mode production (optimisé, logs minimaux)

### `PORT`
**Optionnel** - Port d'écoute du serveur

**Défaut** : `3000`

**Exemple** : `PORT=8080`

### `APP_URL`
**Obligatoire** - URL publique de l'application

**Exemple** : `https://quaim-matcher.votredomaine.com`

**Utilisation** : Génération de liens dans les emails, redirections OAuth

### `JWT_SECRET`
**Obligatoire** - Secret pour signer les tokens de session

**Format** : Chaîne aléatoire d'au moins 32 caractères

**Génération** :
```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Configuration Cron Jobs

### `ENABLE_AUTO_SCRAPING`
**Optionnel** - Active le scraping automatique de l'agenda

**Valeurs** : `true` ou `false`

**Défaut** : `true`

### `SCRAPING_SCHEDULE`
**Optionnel** - Planning du scraping (format cron)

**Défaut** : `0 2 * * *` (tous les jours à 2h du matin)

**Exemples** :
- `0 */6 * * *` - Toutes les 6 heures
- `0 0 * * *` - Tous les jours à minuit
- `0 2 * * 1` - Tous les lundis à 2h

### `ENABLE_WEEKLY_DIGEST`
**Optionnel** - Active l'envoi automatique du récapitulatif hebdomadaire

**Valeurs** : `true` ou `false`

**Défaut** : `true`

### `WEEKLY_DIGEST_SCHEDULE`
**Optionnel** - Planning du digest (format cron)

**Défaut** : `0 10 * * 1` (tous les lundis à 10h)

---

## Configuration Logging

### `LOG_LEVEL`
**Optionnel** - Niveau de verbosité des logs

**Valeurs possibles** : `error`, `warn`, `info`, `debug`

**Défaut** : `info`

---

## Fichier .env Exemple

Créez un fichier `.env` à la racine du projet avec ce contenu :

```bash
# Base de données
DATABASE_URL=mysql://user:password@localhost:3306/quaim_spotify

# Spotify API
SPOTIFY_CLIENT_ID=votre_client_id
SPOTIFY_CLIENT_SECRET=votre_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback

# Grok API (optionnel)
GROQ_API_KEY=votre_groq_api_key

# Email (optionnel)
BREVO_API_KEY=votre_brevo_api_key
BREVO_SENDER_EMAIL=noreply@votredomaine.com
BREVO_SENDER_NAME=Quai M Matcher

# Application
NODE_ENV=production
PORT=3000
APP_URL=https://votredomaine.com
JWT_SECRET=votre_jwt_secret_aleatoire_32_caracteres_minimum

# Cron jobs
ENABLE_AUTO_SCRAPING=true
SCRAPING_SCHEDULE=0 2 * * *
ENABLE_WEEKLY_DIGEST=true
WEEKLY_DIGEST_SCHEDULE=0 10 * * 1

# Logging
LOG_LEVEL=info
```

---

## Sécurité

⚠️ **Important** :

1. **Ne commitez JAMAIS le fichier `.env`** dans Git
2. Ajoutez `.env` dans votre `.gitignore`
3. Utilisez des secrets forts et aléatoires
4. Changez tous les secrets en production
5. Limitez l'accès aux variables d'environnement
6. Utilisez HTTPS en production
7. Activez les restrictions d'origine dans Spotify Dashboard

---

## Vérification

Pour vérifier que toutes les variables sont correctement configurées, lancez :

```bash
npm run check-env
```

Ou créez un script de vérification qui teste la présence de toutes les variables obligatoires.
