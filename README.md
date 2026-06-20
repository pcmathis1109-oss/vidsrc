# Site protégé VidSRC

Site static avec accès protégé par code, intégrant l'API complète VidSRC.

## Endpoints VidSRC intégrés

- `https://vidsrc.to/embed/movie/{id}` - Lecteur embed pour films
- `https://vidsrc.to/embed/tv/{id}` - Lecteur embed pour séries
- `https://vidsrc.to/api/v1/movie/new?page={n}` - Liste des nouveaux films
- `https://vidsrc.to/api/v1/tv/new?page={n}` - Liste des nouvelles séries
- `https://vidsrc.to/api/v1/episode/new?page={n}` - Liste des nouveaux épisodes

## Fonctionnalités

- Trois modes d'accès :
  1. **Recherche** : Entrer un ID ou URL VidSRC (films ou séries)
  2. **Films** : Parcourir les derniers films avec pagination
  3. **Séries** : Parcourir les dernières séries avec pagination
  4. **Épisodes** : Parcourir les derniers épisodes avec pagination
- Protection anti-brute force après 5 essais
- Blocage temporaire de 90 secondes après trop d'essais
- Lecteur iframe intégré
- Pagination pour les listes

## Installation / Publication

1. Place les fichiers suivants à la racine de ton dépôt GitHub :
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
2. Pousse le dépôt sur GitHub.
3. Active GitHub Pages dans les paramètres du dépôt.
4. Ton site sera accessible en mode statique.

## Utilisation locale

Tu peux ouvrir `index.html` directement dans un navigateur ou utiliser une extension de serveur local comme Live Server.
