# Décisions prises en autonomie

| # | Sujet | Choix | Alternatives | Raison |
|---|-------|-------|--------------|--------|
| 1 | Dossiers | On garde `theme/` et `components/ui/` à la racine (pas de `src/`) | Déplacer vers `src/` | Le projet n'a pas de `src/` et l'alias `@/` pointe sur la racine ; déplacer = risque sans gain. |
| 2 | Polices | Titres : Bricolage Grotesque ExtraBold ; texte : Nunito 600/700/800 | Fredoka, Baloo 2, DM Sans | Bricolage disponible dans `@expo-google-fonts`, caractère fort ; Nunito neutre et lisible (conseil NN/g : texte courant neutre). Fredoka/Baloo non comparées visuellement (pas de rendu). |
| 3 | Contraste | Texte **encre** sur jaune, cyan, vert, niveaux 1–7 ; blanc sur violet, rouge, niveaux 8–10 | Texte blanc partout | Le blanc sur #22C55E/#FFC233/#00B3FF échoue AA ; NN/g cite jaune/cyan comme échec. |
| 4 | Couleurs de texte « sens » | `success` = #15803D, `danger` = #C81E33 pour le **texte** ; les teintes vives (#22C55E, #FF4D5E) servent de **fond** | Utiliser les teintes vives en texte | Les teintes vives sur crème ne passent pas AA en texte. |
| 5 | Lottie / Skia | Non utilisés ; confettis et effets en Reanimated + SVG | Télécharger des JSON LottieFiles | Pas d'accès aux fichiers Lottie ici ; les effets maison évitent aussi une dépendance. |
| 6 | Sons | Courts WAV synthétisés par script (`scripts/make-sounds.py`), lus avec `expo-audio`, désactivables | Samples externes | Hors ligne, sans licence à gérer. |
| 7 | Stockage profils | AsyncStorage, clé `players:v1` | SQLite | C'est le mécanisme déjà utilisé pour la sauvegarde. |
| 8 | Photos | `expo-image-picker` → `manipulateAsync` 512×512 JPEG 0,8 → copie dans `Paths.document/avatars/` avec un nom unique par photo | Écraser `<id>.jpg` | Un nom unique évite le cache d'image périmé après remplacement. |
| 9 | Ids de jeu vs profils | Les joueurs d'une partie gardent un id interne ; `profileId` (persistant) relie au profil | Remplacer l'id interne | Ne casse pas les sauvegardes ni l'annulation. L'id de profil n'est jamais affiché. |
| 10 | Statistique « braquages » | Comptée avec les vols (tentés/réussis) | Compteur séparé | Le braquage est un vol de question ; le modèle ne les distingue pas. |
| 11 | Meilleur/pire thème | Au moins 2 questions jouées | 1 | Sous 2 questions le taux n'est pas significatif. |
| 12 | Rival | Adversaire le plus souvent affronté ; bilan = parties où ton score est supérieur / inférieur | Bilan par vainqueur de partie | Plus parlant en parties à plus de 2 joueurs. |
