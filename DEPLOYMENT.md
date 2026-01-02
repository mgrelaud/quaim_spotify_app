git add .
git commit -m "Votre message descriptif ici"
git push

# Guide de Déploiement - Quai M Spotify Matcher

Ce guide vous explique comment déployer l'application en développement et en production avec une configuration unifiée.

## Architecture

L'application fonctionne sur le **port 3000** en interne, et est exposée publiquement via :
- **Développement** : Dev Tunnels (Microsoft)
- **Production** : Fly.io (ou Railway, Render, etc.)

**Avantage** : Aucune reconfiguration nécessaire entre dev et prod, seule l'URL externe change.

---

## 1. Développement avec Dev Tunnels

### Installation de Dev Tunnels

**Option A : Via Visual Studio Code**
```bash
# Installer l'extension "Dev Tunnels" dans VS Code
# Ou utiliser le CLI directement
```

**Option B : CLI standalone**
```bash
# Windows
winget install Microsoft.devtunnel

# macOS
brew install --cask devtunnel

# Linux
curl -sL https://aka.ms/DevTunnelCliInstall | bash
```

### Configuration et utilisation

1. **Se connecter**
```bash
devtunnel user login
```

2. **Créer un tunnel persistant** (recommandé)
```bash
# Créer un tunnel nommé
devtunnel create quaim-matcher --allow-anonymous

# Vous obtenez une URL comme : https://abc123xyz.devtunnels.ms
```

3. **Démarrer l'application**
```bash
# Terminal 1 : Démarrer l'app Node.js
npm run dev

# Terminal 2 : Exposer via le tunnel
devtunnel port create 3000 --protocol https
devtunnel host
```

4. **Configurer Spotify OAuth**
   - Allez sur https://developer.spotify.com/dashboard
   - Ajoutez l'URL du tunnel dans "Redirect URIs" :
     ```
     https://votre-tunnel-id.devtunnels.ms/api/spotify/callback
     ```
   - Mettez à jour votre `.env` :
     ```bash
     SPOTIFY_REDIRECT_URI=https://votre-tunnel-id.devtunnels.ms/api/spotify/callback
     APP_URL=https://votre-tunnel-id.devtunnels.ms
     ```

### Commandes utiles

```bash
# Lister vos tunnels
devtunnel list

# Supprimer un tunnel
devtunnel delete quaim-matcher

# Voir les logs du tunnel
devtunnel show

# Arrêter le tunnel
# Ctrl+C dans le terminal où tourne `devtunnel host`
```

### Alternative : ngrok

Si vous préférez ngrok :

```bash
# Installation
npm install -g ngrok

# Démarrer le tunnel
ngrok http 3000

# Vous obtenez une URL comme : https://abc123.ngrok.io
```

---

## 2. Déploiement Production sur Fly.io

### Prérequis

```bash
# Installer Fly CLI
curl -L https://fly.io/install.sh | sh

# Se connecter
fly auth login
```

### Configuration initiale

1. **Créer le fichier `fly.toml`**

Créez ce fichier à la racine du projet :

```toml
app = "quaim-matcher"
primary_region = "cdg"  # Paris

[build]
  [build.args]
    NODE_VERSION = "22"

[env]
  NODE_ENV = "production"
  PORT = "3000"

[http_service]
  internal_port = 3000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 1
  processes = ["app"]

  [[http_service.checks]]
    interval = "30s"
    timeout = "5s"
    grace_period = "10s"
    method = "GET"
    path = "/api/health"

[mounts]
  source = "data"
  destination = "/data"
```

2. **Créer le fichier `.dockerignore`**

```
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
*.md
Caddyfile
```

3. **Créer le `Dockerfile`**

```dockerfile
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /app/drizzle ./drizzle

USER nodejs

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Déploiement

1. **Initialiser l'application**

```bash
fly launch
# Répondez aux questions :
# - App name : quaim-matcher (ou votre choix)
# - Region : cdg (Paris) ou autre
# - Database : Non (on utilise TiDB externe)
```

2. **Configurer les secrets**

```bash
# Variables obligatoires
fly secrets set \
  DATABASE_URL="mysql://user:pass@host:port/db" \
  SPOTIFY_CLIENT_ID="votre_client_id" \
  SPOTIFY_CLIENT_SECRET="votre_client_secret" \
  SPOTIFY_REDIRECT_URI="https://quaim-matcher.fly.dev/api/spotify/callback" \
  JWT_SECRET="$(openssl rand -base64 32)" \
  APP_URL="https://quaim-matcher.fly.dev"

# Variables optionnelles
fly secrets set \
  GROQ_API_KEY="votre_groq_key" \
  BREVO_API_KEY="votre_brevo_key" \
  BREVO_SENDER_EMAIL="noreply@votredomaine.com" \
  BREVO_SENDER_NAME="Quai M Matcher"
```

3. **Déployer**

```bash
fly deploy
```

4. **Vérifier le déploiement**

```bash
# Voir les logs
fly logs

# Ouvrir l'app dans le navigateur
fly open

# Vérifier le status
fly status
```

5. **Mettre à jour Spotify OAuth**
   - Allez sur https://developer.spotify.com/dashboard
   - Ajoutez l'URL Fly.io dans "Redirect URIs" :
     ```
     https://quaim-matcher.fly.dev/api/spotify/callback
     ```

### Commandes utiles Fly.io

```bash
# Voir les logs en temps réel
fly logs -a quaim-matcher

# SSH dans la machine
fly ssh console

# Redémarrer l'app
fly apps restart quaim-matcher

# Scaler (changer les ressources)
fly scale vm shared-cpu-1x --memory 512

# Voir les métriques
fly dashboard quaim-matcher

# Supprimer l'app
fly apps destroy quaim-matcher
```

---

## 3. Base de Données : TiDB Cloud (Gratuit)

### Configuration

1. **Créer un compte sur TiDB Cloud**
   - Allez sur https://tidbcloud.com
   - Créez un cluster gratuit (Serverless Tier)

2. **Obtenir la chaîne de connexion**
   - Dans le dashboard TiDB, copiez la connection string
   - Format : `mysql://user:password@gateway.tidbcloud.com:4000/database?ssl=true`

3. **Configurer dans l'application**
   ```bash
   # En développement (.env)
   DATABASE_URL=mysql://user:password@gateway.tidbcloud.com:4000/database?ssl=true

   # En production (Fly.io)
   fly secrets set DATABASE_URL="mysql://user:password@gateway.tidbcloud.com:4000/database?ssl=true"
   ```

4. **Migrer la base de données**
   ```bash
   # Localement
   npm run db:push

   # Ou via Fly.io
   fly ssh console
   npm run db:push
   ```

### Alternative : MySQL classique

Si vous préférez MySQL :

```bash
# Créer une base de données sur PlanetScale, Railway, ou votre propre serveur
# Puis utilisez la même procédure avec la connection string appropriée
```

---

## 4. Configuration Unifiée

### Principe

L'application écoute **toujours sur le port 3000** en interne :
- **Dev** : `localhost:3000` → exposé via Dev Tunnels → `https://abc.devtunnels.ms`
- **Prod** : `localhost:3000` → exposé via Fly.io → `https://quaim-matcher.fly.dev`

### Variables à changer entre dev et prod

**Seulement 2 variables changent** :

```bash
# Développement
SPOTIFY_REDIRECT_URI=https://votre-tunnel.devtunnels.ms/api/spotify/callback
APP_URL=https://votre-tunnel.devtunnels.ms

# Production
SPOTIFY_REDIRECT_URI=https://quaim-matcher.fly.dev/api/spotify/callback
APP_URL=https://quaim-matcher.fly.dev
```

**Tout le reste reste identique** (DATABASE_URL, SPOTIFY_CLIENT_ID, etc.)

---

## 5. Workflow Complet

### Développement

```bash
# 1. Cloner le projet
git clone <votre-repo>
cd quaim_spotify_app

# 2. Installer les dépendances
npm install

# 3. Configurer .env
cp ENV_VARIABLES.md .env
# Éditer .env avec vos valeurs

# 4. Migrer la base de données
npm run db:push

# 5. Démarrer l'app
npm run dev

# 6. Dans un autre terminal, exposer via Dev Tunnels
devtunnel host -p 3000

# 7. Mettre à jour SPOTIFY_REDIRECT_URI dans .env avec l'URL du tunnel

# 8. Tester l'application
# Ouvrir https://votre-tunnel.devtunnels.ms dans le navigateur
```

### Production

```bash
# 1. Configurer Fly.io
fly launch

# 2. Définir les secrets
fly secrets set DATABASE_URL="..." SPOTIFY_CLIENT_ID="..." ...

# 3. Déployer
fly deploy

# 4. Mettre à jour Spotify OAuth avec l'URL Fly.io

# 5. Tester
fly open
```

### Mise à jour

```bash
# Développement : redémarrer simplement
npm run dev

# Production : redéployer
git push origin main
fly deploy
```

---

## 6. Domaine Personnalisé (Optionnel)

### Sur Fly.io

```bash
# Ajouter un certificat SSL pour votre domaine
fly certs add quaim-matcher.votredomaine.com

# Fly.io vous donnera des enregistrements DNS à ajouter
# Ajoutez un CNAME pointant vers quaim-matcher.fly.dev

# Vérifier
fly certs show quaim-matcher.votredomaine.com
```

### Mettre à jour Spotify OAuth

```bash
# Ajouter le nouveau domaine dans Spotify Dashboard
https://quaim-matcher.votredomaine.com/api/spotify/callback

# Mettre à jour les secrets Fly.io
fly secrets set \
  SPOTIFY_REDIRECT_URI="https://quaim-matcher.votredomaine.com/api/spotify/callback" \
  APP_URL="https://quaim-matcher.votredomaine.com"
```

---

## 7. Monitoring et Logs

### Logs en temps réel

```bash
# Fly.io
fly logs -a quaim-matcher

# Filtrer par niveau
fly logs -a quaim-matcher | grep ERROR
```

### Métriques

```bash
# Dashboard Fly.io
fly dashboard quaim-matcher

# Ou via l'interface web
https://fly.io/apps/quaim-matcher
```

### Alertes (optionnel)

Configurez des alertes via :
- Fly.io monitoring
- Sentry pour les erreurs applicatives
- UptimeRobot pour la disponibilité

---

## 8. Sécurité

### Checklist

- [ ] Variables d'environnement sécurisées (secrets Fly.io)
- [ ] HTTPS forcé (automatique sur Fly.io)
- [ ] JWT_SECRET aléatoire et fort
- [ ] SPOTIFY_CLIENT_SECRET jamais exposé côté client
- [ ] Base de données avec SSL (TiDB Cloud)
- [ ] Rate limiting activé (à implémenter dans l'app)
- [ ] CORS configuré correctement
- [ ] Dépendances à jour (`npm audit`)

---

## 9. Coûts

### Gratuit

- **Fly.io** : 3 machines partagées gratuites (largement suffisant)
- **TiDB Cloud** : 5 GB gratuits (Serverless Tier)
- **Dev Tunnels** : Gratuit
- **Brevo** : 300 emails/jour gratuits

### Payant (si besoin)

- **Fly.io** : ~$5-10/mois pour plus de ressources
- **TiDB Cloud** : ~$10/mois pour plus de stockage
- **Domaine** : ~$10-15/an

**Total estimé** : Gratuit pour commencer, ~$5-20/mois en production

---

## 10. Support

### Problèmes courants

**L'OAuth Spotify ne fonctionne pas**
- Vérifiez que SPOTIFY_REDIRECT_URI correspond exactement à l'URL configurée dans Spotify Dashboard
- Vérifiez que l'URL est en HTTPS (obligatoire pour OAuth)

**La base de données ne se connecte pas**
- Vérifiez DATABASE_URL
- Vérifiez que SSL est activé si nécessaire
- Testez la connexion avec `mysql -h host -u user -p`

**L'application ne démarre pas sur Fly.io**
- Vérifiez les logs : `fly logs`
- Vérifiez que tous les secrets sont définis : `fly secrets list`
- Vérifiez le Dockerfile et fly.toml

### Ressources

- Documentation Fly.io : https://fly.io/docs
- Documentation Dev Tunnels : https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/
- Documentation Spotify API : https://developer.spotify.com/documentation/web-api
- TiDB Cloud : https://docs.pingcap.com/tidbcloud/
