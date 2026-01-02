# Quai M Spotify Matcher - TODO

## Phase 1: Architecture et Configuration
- [ ] Définir le schéma de base de données (users, spotify_profiles, events, artists, match_scores)
- [ ] Configurer les variables d'environnement pour Spotify API
- [ ] Installer les dépendances nécessaires (axios, cheerio, node-cron)

## Phase 2: Authentification Spotify
- [ ] Implémenter le flux OAuth Spotify (Authorization Code Flow)
- [ ] Créer les endpoints pour callback et refresh token
- [ ] Récupérer top artistes de l'utilisateur (GET /v1/me/top/artists)
- [ ] Récupérer top tracks de l'utilisateur (GET /v1/me/top/tracks)
- [ ] Récupérer titres likés (GET /v1/me/tracks)
- [ ] Stocker les données Spotify dans la base de données

## Phase 3: Profil Musical Utilisateur
- [ ] Extraire les genres musicaux des artistes et tracks
- [ ] Récupérer les audio features pour chaque track (énergie, tempo, valence, danceability)
- [ ] Calculer la distribution de genres (pourcentages)
- [ ] Calculer les moyennes d'audio features
- [ ] Créer un profil musical normalisé pour chaque utilisateur

## Phase 4: Scraping Agenda Quai M
- [ ] Développer le scraper pour https://quai-m.fr/agenda
- [ ] Extraire nom d'artiste, date, heure, description, lien événement
- [ ] Stocker les événements dans la base de données
- [ ] Détecter les nouveaux concerts (comparaison avec événements existants)

## Phase 5: Enrichissement des Événements
- [ ] Pour chaque artiste du Quai M, rechercher sur Spotify API (GET /v1/search)
- [ ] Récupérer genres musicaux de l'artiste
- [ ] Récupérer quelques tracks et leurs audio features
- [ ] Calculer le profil musical moyen de l'artiste
- [ ] Gérer les cas où l'artiste n'existe pas sur Spotify (parsing de description)

## Phase 6: Algorithme de Matching
- [ ] Implémenter le calcul de similarité par genres (distance cosinus ou Jaccard)
- [ ] Implémenter le calcul de distance sur audio features (distance euclidienne)
- [ ] Créer un score composite pondéré (genres + features)
- [ ] Classer les concerts par score décroissant
- [ ] Attribuer des tags visuels (Très dans ton style / Proche / Découverte / Hors zone)

## Phase 7: Interface Utilisateur
- [ ] Créer la page d'accueil avec présentation et login Spotify
- [ ] Créer le dashboard utilisateur avec profil musical
- [ ] Visualisation du profil : nuage de genres musicaux
- [ ] Visualisation du profil : radar chart des audio features
- [ ] Page agenda personnalisée avec liste des concerts triés
- [ ] Afficher score, tag visuel, date, artiste, lien pour chaque concert
- [ ] Filtres par date, genre, score minimum
- [ ] Design responsive et moderne

## Phase 8: Système de Cron Jobs
- [ ] Configurer un cron job quotidien pour scraping
- [ ] Détecter les nouveaux concerts ajoutés
- [ ] Recalculer les scores pour tous les utilisateurs
- [ ] Préparer les données pour les emails hebdomadaires

## Phase 9: Alertes Email
- [ ] Intégrer Brevo (ou service email similaire)
- [ ] Créer un template email HTML pour le récapitulatif hebdomadaire
- [ ] Cron job hebdomadaire pour envoi des emails
- [ ] Inclure top 3-5 concerts recommandés avec liens et détails
- [ ] Permettre aux utilisateurs de désactiver les emails

## Phase 10: Tests et Optimisation
- [ ] Écrire des tests unitaires pour l'algorithme de matching
- [ ] Tester le scraping avec différents formats de page
- [ ] Tester le flux OAuth Spotify complet
- [ ] Optimiser les requêtes base de données
- [ ] Gérer les rate limits Spotify API
- [ ] Ajouter des logs et monitoring

## Phase 11: Documentation et Déploiement
- [ ] Documenter l'API et les endpoints
- [ ] Créer un README avec instructions d'installation
- [ ] Préparer pour déploiement sur Fly.io
- [ ] Configurer les variables d'environnement production

## Phase 12: Préparation Déploiement Indépendant
- [x] Créer fichier .env.example avec toutes les variables d'environnement
- [x] Créer configuration Caddy (Caddyfile) pour reverse proxy
- [x] Créer documentation Dev Tunnels pour exposition rapide
- [x] Clarifier ngrok/Dev Tunnels pour le tunnel (pas Grok API)
- [x] Améliorer le scraper pour extraire les artistes similaires du Quai M
- [x] Améliorer algorithme de matching avec bonus artistes similaires (+15 pts par match, max +30)
- [x] Créer documentation complète de déploiement (DEPLOYMENT.md)
- [ ] Créer script de démarrage pour production
- [x] Documenter la configuration de la base de données MySQL/TiDB
