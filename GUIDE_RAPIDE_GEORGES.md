# Guide Rapide pour Georges

Salut Georges ! Voici comment utiliser ton projet RAG Gemini en 3 étapes simples.

## Étape 1 : Obtenir une Clé API Gemini (2 minutes)

1. Va sur : https://aistudio.google.com/app/apikey
2. Connecte-toi avec ton compte Google
3. Clique sur "Create API Key"
4. Copie la clé

## Étape 2 : Configurer le Projet (1 minute)

```bash
cd /home/claude/rag-gemini-netlify

# Créer le fichier .env
cp .env.example .env

# Éditer le fichier
nano .env
```

Colle ta clé :
```
GEMINI_API_KEY=ta_cle_ici
```

Sauvegarde : `Ctrl+O` puis `Ctrl+X`

## Étape 3 : Tester Localement (Optionnel)

```bash
npm run dev
```

Ouvre ton navigateur : http://localhost:8888

Tu verras 3 pages :
- **Chat** : Parle avec l'IA
- **Upload** : Ajoute des documents
- **Search** : Recherche dans tes documents

## Étape 4 : Déployer sur Netlify (5 minutes)

### Méthode Simple (Recommandée)

1. **Push sur GitHub** :
   ```bash
   git add .
   git commit -m "Mon projet RAG"
   gh repo create rag-gemini-netlify --public --source=. --remote=origin --push
   ```

2. **Déployer sur Netlify** :
   - Va sur https://app.netlify.com
   - Clique "Import from Git"
   - Choisis ton repo `rag-gemini-netlify`
   - Clique "Deploy"

3. **Ajouter la clé API** :
   - Dans Netlify, va dans "Site settings" > "Environment variables"
   - Clique "Add a variable"
   - Nom : `GEMINI_API_KEY`
   - Valeur : ta clé Gemini
   - Sauvegarde

4. **Redéployer** :
   - Va dans "Deploys"
   - Clique "Trigger deploy"

C'est tout ! Ton site est en ligne !

## Utilisation

### Chat avec l'IA
1. Ouvre ton site Netlify
2. Tape ta question
3. L'IA répond !

### Ajouter des Documents
1. Clique sur "Upload"
2. Entre le titre et le contenu
3. Clique "Upload"

### Rechercher
1. Clique sur "Recherche"
2. Tape ta requête
3. Les documents similaires s'affichent

## Problèmes Courants

### "API key not configured"
- Vérifie que tu as ajouté `GEMINI_API_KEY` dans Netlify
- Redéploie le site après avoir ajouté la variable

### "Failed to generate content"
- Vérifie que ta clé API est valide
- Va sur https://aistudio.google.com/app/apikey pour vérifier

### Le site ne s'ouvre pas
- Attends 1-2 minutes après le déploiement
- Vérifie que le build a réussi dans l'onglet "Deploys"

## Aide

- Documentation Gemini : https://ai.google.dev/docs
- Support Netlify : https://docs.netlify.com

Amuse-toi bien avec ton RAG ! 🚀
