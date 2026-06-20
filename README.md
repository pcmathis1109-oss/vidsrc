# Site protégé VidSRC

Site static avec accès protégé par code, prêt à être publié sur GitHub Pages.

## Fonctionnalités

- écran d'accès avec code : `Mathis1109`
- verrouillage après plusieurs essais invalides
- validation côté client et stockage de l'accès dans `localStorage`
- recherche VidSRC via l'API depuis le navigateur
- aucun serveur Node nécessaire

## Installation / Publication

1. Place les fichiers suivants à la racine de ton dépôt GitHub :
   - `index.html`
   - `styles.css`
   - `app.js`
2. Pousse le dépôt sur GitHub.
3. Active GitHub Pages dans les paramètres du dépôt.
4. Ton site sera accessible en mode statique.

## Utilisation locale

Tu peux ouvrir `index.html` directement dans un navigateur ou utiliser une extension de serveur local comme Live Server.

## API VidSRC Embed

- Ce site utilise l'endpoint `https://vidsrc.to/embed/movie/`.
- Saisis un ID VidSRC ou une URL de type `https://vidsrc.to/embed/movie/12345`.
- Le lecteur s'affiche directement dans une iframe.

## Code d'accès

- Le code d'accès est `Mathis1109`.
- Si le code est faux, l'accès est bloqué temporairement après plusieurs tentatives.

## Remarques de sécurité

- Ce site est statique : la logique de protection est dans le navigateur.
- La clé VidSRC ne peut pas être totalement cachée dans un site statique, mais ce code réduit les accès directs sans le code.
- Pour une vraie sécurité, il faudrait un serveur ou un service backend pour protéger la clé API et gérer l'authentification.
