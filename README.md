# RAG Gemini Netlify

Système RAG (Retrieval-Augmented Generation) utilisant l'API Gemini de Google et Netlify Functions.

## Fonctionnalités

- **Chat AI** : Discutez avec l'IA Gemini
- **Upload de Documents** : Ajoutez des documents à votre base de connaissances
- **Recherche Sémantique** : Recherchez dans vos documents avec des embeddings
- **5 API Endpoints** : Backend complet avec Netlify Functions
- **Interface Web** : 3 pages HTML modernes et responsive

## Architecture

### Backend (Netlify Functions)

- `chat.js` - Chat avec Gemini AI
- `embed.js` - Génération d'embeddings
- `search.js` - Recherche sémantique
- `upload.js` - Upload de documents
- `list.js` - Liste des documents

### Frontend

- `index.html` - Page de chat
- `upload.html` - Upload de documents
- `search.html` - Recherche sémantique

## Installation Rapide

### 1. Cloner et installer

```bash
cd /home/claude/rag-gemini-netlify
npm install
```

### 2. Configurer l'API Key

```bash
cp .env.example .env
```

Éditez `.env` et ajoutez votre clé Gemini :
```
GEMINI_API_KEY=votre_cle_ici
```

Obtenir une clé : https://aistudio.google.com/app/apikey

### 3. Test local

```bash
npm run dev
```

Ouvrez http://localhost:8888

### 4. Déploiement sur Netlify

#### Option A : Via l'interface web
1. Poussez sur GitHub :
   ```bash
   git add .
   git commit -m "Initial commit"
   gh repo create rag-gemini-netlify --public --source=. --remote=origin --push
   ```
2. Allez sur https://app.netlify.com
3. Cliquez sur "Import from Git"
4. Sélectionnez votre repo
5. Ajoutez la variable d'environnement `GEMINI_API_KEY`

#### Option B : Via CLI
```bash
netlify login
netlify init
netlify deploy --prod
```

N'oubliez pas d'ajouter `GEMINI_API_KEY` dans les variables d'environnement Netlify.

## Utilisation

### Chat
1. Ouvrez la page principale
2. Tapez votre question
3. L'IA répond en temps réel

### Upload de documents
1. Allez sur `/upload.html`
2. Entrez un titre et le contenu
3. Cliquez sur "Upload"

### Recherche
1. Allez sur `/search.html`
2. Tapez votre requête
3. Les résultats similaires s'affichent avec un score

## API Endpoints

### POST /.netlify/functions/chat
```json
{
  "message": "Votre question",
  "context": ["doc1", "doc2"]
}
```

### POST /.netlify/functions/upload
```json
{
  "title": "Titre du document",
  "content": "Contenu du document"
}
```

### POST /.netlify/functions/search
```json
{
  "query": "Votre recherche",
  "topK": 5
}
```

### GET /.netlify/functions/list
Liste tous les documents

### POST /.netlify/functions/embed
```json
{
  "text": "Texte à transformer en embedding"
}
```

## Technologies

- **AI** : Google Gemini API
- **Backend** : Netlify Functions (Node.js)
- **Frontend** : HTML, CSS, JavaScript vanilla
- **Déploiement** : Netlify

## Notes Importantes

- Le stockage actuel est en mémoire (pour démo)
- Pour la production, utilisez une vraie base de données (MongoDB, Supabase, etc.)
- Les embeddings sont calculés avec `embedding-001` de Gemini
- La recherche utilise la similarité cosinus

## Support

Pour toute question ou problème, consultez la documentation Gemini :
https://ai.google.dev/docs

## Licence

MIT
