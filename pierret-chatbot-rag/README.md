# 🤖 Chatbot RAG Pierret

Chatbot intelligent utilisant RAG (Retrieval Augmented Generation) pour répondre aux questions sur les produits Pierret.

## 🛠️ Technologies utilisées

- **Voyage AI** : Génération d'embeddings vectoriels de haute qualité
- **Supabase** : Base de données PostgreSQL avec extension pgvector pour la recherche vectorielle
- **Node.js** : Runtime JavaScript

## 📋 Prérequis

1. **Node.js** (v16 ou supérieur)
2. **Compte Voyage AI** : [https://www.voyageai.com/](https://www.voyageai.com/)
3. **Compte Supabase** : [https://supabase.com/](https://supabase.com/)

## 🚀 Installation

### Étape 1 : Installation des dépendances

```bash
npm install
```

### Étape 2 : Configuration des variables d'environnement

Copiez le fichier `.env.example` en `.env` :

```bash
cp .env.example .env
```

Modifiez le fichier `.env` avec vos clés API :

```env
# Voyage AI Configuration
VOYAGE_API_KEY=votre_clé_voyage_ai

# Supabase Configuration
SUPABASE_URL=votre_url_supabase
SUPABASE_KEY=votre_clé_anon_supabase
```

#### Comment obtenir vos clés :

**Voyage AI :**
1. Créez un compte sur [https://www.voyageai.com/](https://www.voyageai.com/)
2. Allez dans la section API Keys
3. Générez une nouvelle clé API

**Supabase :**
1. Créez un nouveau projet sur [https://supabase.com/](https://supabase.com/)
2. Dans les paramètres du projet → API
3. Copiez :
   - `URL` → SUPABASE_URL
   - `anon public` → SUPABASE_KEY

### Étape 3 : Configuration de la base de données Supabase

1. Dans votre projet Supabase, allez dans l'**éditeur SQL**
2. Copiez-collez le contenu du fichier `setup_supabase.sql`
3. Exécutez le script

Cela va :
- Activer l'extension `pgvector`
- Créer la table `pierret_documents`
- Créer les index pour la recherche vectorielle
- Créer la fonction `match_documents` pour la recherche de similarité

## 📊 Préparation des données

### Étape 1 : Découper le document en chunks

```bash
node chunk_document.js
```

Cela va :
- Lire le fichier `pierret_guide.txt`
- Le découper en chunks intelligents (environ 1000 caractères avec overlap)
- Sauvegarder les chunks dans `chunks.json`

### Étape 2 : Générer les embeddings et les stocker

```bash
node generate_embeddings.js
```

Cela va :
- Lire les chunks depuis `chunks.json`
- Générer les embeddings avec Voyage AI
- Stocker les embeddings dans Supabase

⚠️ **Note** : Ce processus peut prendre quelques minutes selon le nombre de chunks.

## 💬 Utilisation du chatbot

### Mode interactif (CLI)

```bash
node chatbot.js
```

Vous pouvez maintenant poser des questions sur Pierret !

**Exemples de questions :**
- "Quels sont les matériaux disponibles chez Pierret ?"
- "Quelle est la performance thermique des fenêtres PVC ?"
- "Comment obtenir un devis ?"
- "Quelles sont les essences de bois disponibles ?"
- "Quelle est la garantie Pierret ?"

### Utilisation programmatique

```javascript
const { PierretChatbot } = require('./chatbot');

const chatbot = new PierretChatbot();

async function main() {
  const result = await chatbot.ask("Quels matériaux propose Pierret ?");
  console.log(result.answer);
}

main();
```

## 🏗️ Architecture

```
┌─────────────┐
│   Question  │
│  utilisateur│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Voyage AI Embedding│
│   (voyage-2 model)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Supabase Vector DB  │
│  Recherche similaire│
│    (pgvector)       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Top K documents    │
│    pertinents       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   Génération        │
│   réponse           │
└─────────────────────┘
```

## 📁 Structure du projet

```
pierret-chatbot-rag/
├── .env.example           # Template des variables d'environnement
├── .env                   # Variables d'environnement (à créer)
├── README.md              # Ce fichier
├── package.json           # Dépendances Node.js
├── pierret_guide.txt      # Document source Pierret
├── setup_supabase.sql     # Script SQL pour configurer Supabase
├── chunk_document.js      # Script pour découper le document
├── chunks.json            # Chunks générés (créé automatiquement)
├── generate_embeddings.js # Script pour générer et stocker les embeddings
└── chatbot.js             # Interface du chatbot
```

## 🔧 Personnalisation

### Modifier la taille des chunks

Dans `chunk_document.js`, modifiez les paramètres :

```javascript
const chunks = chunkDocument('./pierret_guide.txt', 1500, 300);
//                                                    ^     ^
//                                          chunkSize   overlap
```

### Modifier le nombre de résultats retournés

Dans `chatbot.js`, méthode `search()` :

```javascript
async search(query, topK = 5, threshold = 0.7) {
//                        ^              ^
//            nombre résultats    seuil similarité
```

### Intégrer GPT pour des réponses naturelles

Dans `chatbot.js`, méthode `generateAnswer()`, vous pouvez ajouter OpenAI :

```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async generateAnswer(query, documents) {
  const context = documents.map(d => d.content).join('\n\n');

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Tu es un assistant Pierret. Réponds aux questions en te basant uniquement sur le contexte fourni."
      },
      {
        role: "user",
        content: `Contexte:\n${context}\n\nQuestion: ${query}`
      }
    ]
  });

  return completion.choices[0].message.content;
}
```

## 🐛 Dépannage

### Erreur "VOYAGE_API_KEY non défini"
- Vérifiez que le fichier `.env` existe
- Vérifiez que la clé API est correcte

### Erreur "chunks.json non trouvé"
- Exécutez d'abord `node chunk_document.js`

### Erreur Supabase "relation pierret_documents does not exist"
- Vérifiez que vous avez exécuté le script `setup_supabase.sql`

### Pas de résultats pertinents
- Essayez de baisser le `threshold` dans la méthode `search()`
- Reformulez votre question

## 📈 Améliorations futures

- [ ] Ajouter OpenAI GPT pour des réponses plus naturelles
- [ ] Interface web avec React/Next.js
- [ ] Support multilingue
- [ ] Cache des embeddings fréquents
- [ ] Feedback utilisateur pour améliorer les résultats
- [ ] Export des conversations

## 📝 Licence

Ce projet est destiné à un usage interne pour Pierret.

## 🤝 Support

Pour toute question, contactez l'équipe de développement.

---

**Développé avec ❤️ pour Pierret**
