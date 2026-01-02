# Notes sur le scraping de l'agenda Quai M

## URL cible
https://quai-m.fr/agenda

## Structure observée

### Liste des événements (page agenda)
Chaque événement contient :
- **Type** : CONCERT, ATELIER, MASTERCLASS, PROJECTION, etc.
- **Genres musicaux** : RAP, JAZZ, POP, ELECTRO, ROCK, etc. (séparés par •)
- **Date** : Format "DD Mois. YYYY HH:MM" (ex: "24 Janv. 2026 20:30")
- **Titre/Artiste** : Nom de l'artiste principal
- **Sous-titre** : "+ 1RE PARTIE" ou autres informations
- **Lien** : URL vers la page détaillée de l'événement (ex: /agenda/georgio)
- **Statut** : COMPLET, BIENTÔT COMPLET, etc.

### Page détaillée d'un événement
Informations supplémentaires :
- **Description complète** : Biographie de l'artiste, contexte du concert
- **Lieu** : "QUAI M, Delta - Debout / Assis • Placement libre – Assis-Debout"
- **Production** : "Production : Quai M"
- **Si vous aimez** : Artistes similaires recommandés (ex: "DISIZ / S.PRI NOIR / TSR CREW")
- **Image** : Photo de l'artiste/événement

## Stratégie de scraping

1. **Scraper la page principale** (/agenda) pour obtenir la liste complète des événements
2. **Extraire pour chaque événement** :
   - URL de l'événement (utilisée comme externalId unique)
   - Type d'événement
   - Genres musicaux
   - Date et heure
   - Nom de l'artiste principal
3. **Optionnel** : Visiter chaque page détaillée pour enrichir avec description et artistes similaires

## Sélecteurs CSS potentiels
- Conteneurs d'événements : probablement des éléments avec liens vers `/agenda/[slug]`
- Genres : texte avec séparateurs "•"
- Dates : format standardisé à parser

## Considérations
- Le site utilise un système de cookies (acceptés automatiquement)
- Les événements sont filtrables par type et par mois
- Certains événements sont marqués comme COMPLET ou HORS LES MURS
- Les genres musicaux sont des tags importants pour le matching
