# 🚀 Guide Complet - Installation du Chatbot Pierret RAG

Guide détaillé pas à pas pour installer et utiliser le chatbot Pierret avec Voyage AI et Supabase.

---

## 📋 ÉTAPE 1 : Prérequis

Avant de commencer, assurez-vous d'avoir :

- ✅ **Node.js** version 16 ou supérieure installée
  - Vérifiez : `node --version`
  - Téléchargez depuis : https://nodejs.org/

- ✅ **Git** installé
  - Vérifiez : `git --version`
  - Téléchargez depuis : https://git-scm.com/

- ✅ **Compte Voyage AI** avec clé API
  - Créez un compte : https://www.voyageai.com/
  - Votre clé : `pa-nE_qR8_Mu8v-xvAGGEcYZ3iZdxQlmuhP1uPqRo-2ep7`

- ✅ **Compte Supabase** avec projet configuré
  - Créez un compte : https://supabase.com/
  - Votre URL : `https://euqrcundhbcyhdxoucfx.supabase.co`
  - Votre clé : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 📥 ÉTAPE 2 : Cloner le Repository

### Sur Windows (PowerShell ou CMD)

```powershell
# 1. Ouvrez PowerShell ou l'Invite de commandes

# 2. Allez dans le dossier où vous voulez installer le projet
cd C:\Users\VotreNom\Documents

# 3. Clonez le repository
git clone https://github.com/GeorgesAdSim/chatbot.git

# 4. Entrez dans le dossier
cd chatbot
```

### Sur Mac/Linux (Terminal)

```bash
# 1. Ouvrez le Terminal

# 2. Allez dans le dossier où vous voulez installer le projet
cd ~/Documents

# 3. Clonez le repository
git clone https://github.com/GeorgesAdSim/chatbot.git

# 4. Entrez dans le dossier
cd chatbot
```

---

## 📦 ÉTAPE 3 : Installer les Dépendances

Dans le terminal, exécutez :

```bash
npm install
```

Vous devriez voir quelque chose comme :
```
added 61 packages, and audited 61 packages in 3s
```

✅ Si vous voyez cela, c'est bon !

---

## 🔧 ÉTAPE 4 : Configurer les Variables d'Environnement

### Option A : Copier-coller (Recommandé)

**Sur Windows (PowerShell) :**

```powershell
@"
# Voyage AI Configuration
VOYAGE_API_KEY=pa-nE_qR8_Mu8v-xvAGGEcYZ3iZdxQlmuhP1uPqRo-2ep7

# Supabase Configuration
SUPABASE_URL=https://euqrcundhbcyhdxoucfx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXJjdW5kaGJjeWhkeG91Y2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzU4NDEsImV4cCI6MjA3NjcxMTg0MX0.23tnic-33_GOAKlw-iKHmPEPdcmZD-cmT9_FgOnZUO8
"@ | Out-File -FilePath .env -Encoding utf8
```

**Sur Mac/Linux (Terminal) :**

```bash
cat > .env << 'EOF'
# Voyage AI Configuration
VOYAGE_API_KEY=pa-nE_qR8_Mu8v-xvAGGEcYZ3iZdxQlmuhP1uPqRo-2ep7

# Supabase Configuration
SUPABASE_URL=https://euqrcundhbcyhdxoucfx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXJjdW5kaGJjeWhkeG91Y2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzU4NDEsImV4cCI6MjA3NjcxMTg0MX0.23tnic-33_GOAKlw-iKHmPEPdcmZD-cmT9_FgOnZUO8
EOF
```

### Option B : Manuellement

1. Créez un fichier nommé `.env` dans le dossier `chatbot`
2. Ouvrez-le avec un éditeur de texte (Notepad, VS Code, etc.)
3. Copiez-collez le contenu suivant :

```env
# Voyage AI Configuration
VOYAGE_API_KEY=pa-nE_qR8_Mu8v-xvAGGEcYZ3iZdxQlmuhP1uPqRo-2ep7

# Supabase Configuration
SUPABASE_URL=https://euqrcundhbcyhdxoucfx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1cXJjdW5kaGJjeWhkeG91Y2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzU4NDEsImV4cCI6MjA3NjcxMTg0MX0.23tnic-33_GOAKlw-iKHmPEPdcmZD-cmT9_FgOnZUO8
```

4. Sauvegardez le fichier

---

## 🗄️ ÉTAPE 5 : Configurer Supabase

### 5.1 Accéder à Supabase

1. Allez sur https://supabase.com/dashboard
2. Connectez-vous à votre compte
3. Sélectionnez votre projet

### 5.2 Exécuter le Script SQL

1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New query**
3. Copiez-collez le script suivant :

```sql
-- Activer l'extension pgvector pour le stockage de vecteurs
CREATE EXTENSION IF NOT EXISTS vector;

-- Créer la table pour stocker les documents et leurs embeddings
CREATE TABLE IF NOT EXISTS pierret_documents (
  id BIGSERIAL PRIMARY KEY,
  chunk_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1024),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour la recherche de similarité vectorielle
CREATE INDEX IF NOT EXISTS pierret_documents_embedding_idx
ON pierret_documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Créer un index sur chunk_id pour les recherches rapides
CREATE INDEX IF NOT EXISTS pierret_documents_chunk_id_idx
ON pierret_documents (chunk_id);

-- Fonction pour rechercher les documents similaires
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(1024),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id BIGINT,
  chunk_id INTEGER,
  content TEXT,
  similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
  SELECT
    id,
    chunk_id,
    content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM pierret_documents
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

4. Cliquez sur **Run** (ou appuyez sur Ctrl+Entrée)
5. Vous devriez voir "Success. No rows returned"

✅ Si c'est le cas, la base de données est prête !

---

## 📄 ÉTAPE 6 : Préparer les Données

### 6.1 Découper le Document en Chunks

Dans votre terminal, exécutez :

```bash
node chunk_document.js
```

Vous devriez voir :
```
✅ Document divisé en 78 chunks
📊 Taille moyenne des chunks: 934 caractères
💾 Chunks sauvegardés dans chunks.json
```

✅ Parfait ! Un fichier `chunks.json` a été créé.

### 6.2 Générer les Embeddings et les Stocker

**⚠️ Cette étape peut prendre 2-3 minutes**

```bash
node generate_embeddings_http.js
```

Vous devriez voir :
```
📚 78 chunks à traiter

🔄 Traitement du batch 1/1...
✅ 78/78 chunks traités

✅ Terminé ! 78 embeddings générés et stockés dans Supabase
🎉 Processus terminé avec succès !
```

✅ Si vous voyez cela, vos données sont dans Supabase !

---

## 💬 ÉTAPE 7 : Tester le Chatbot

### Lancer le Chatbot

```bash
node chatbot.js
```

Vous verrez :
```
╔════════════════════════════════════════╗
║   🤖 Chatbot Pierret RAG               ║
║   Posez vos questions sur Pierret      ║
║   Tapez "exit" pour quitter            ║
╚════════════════════════════════════════╝

💬 Votre question:
```

### Exemples de Questions

Essayez ces questions :

1. **Qui est Pierret ?**
2. **Quels matériaux propose Pierret ?**
3. **Quelle est la performance thermique des fenêtres PVC ?**
4. **Comment obtenir un devis ?**
5. **Quelle est la garantie Pierret ?**
6. **Quelles sont les essences de bois disponibles ?**
7. **Quelle est la différence entre bois et bois-aluminium ?**

### Exemple d'Utilisation

```
💬 Votre question: Quels matériaux propose Pierret ?

🔍 Recherche en cours...

================================================================================
📖 RÉPONSE:

Voici les informations pertinentes trouvées dans la documentation Pierret :

[Document 1] (Similarité: 94.2%)
Pierret propose 4 matériaux pour toutes ses menuiseries :
- PVC : Économique, excellent isolant, facile d'entretien
- Aluminium : Moderne, robuste, design épuré
- Bois : Chaleureux, naturel, 6 essences nobles certifiées FSC
- Bois-Aluminium : Le meilleur des deux mondes
...

================================================================================

📚 Sources utilisées:
  1. Chunk 12 (94.2% de similarité)
  2. Chunk 45 (89.7% de similarité)
  3. Chunk 3 (87.1% de similarité)

💬 Votre question:
```

### Quitter le Chatbot

Tapez `exit` et appuyez sur Entrée.

---

## ✅ RÉCAPITULATIF - Checklist

Vérifiez que vous avez bien fait toutes ces étapes :

- [ ] Node.js et Git installés
- [ ] Repository cloné (`git clone ...`)
- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env` créé avec les bonnes clés
- [ ] Script SQL exécuté dans Supabase
- [ ] Document découpé (`node chunk_document.js`)
- [ ] Embeddings générés (`node generate_embeddings_http.js`)
- [ ] Chatbot testé (`node chatbot.js`)

---

## 🐛 Dépannage

### Problème : "node: command not found"

➡️ Node.js n'est pas installé. Téléchargez-le depuis https://nodejs.org/

### Problème : "VOYAGE_API_KEY non défini"

➡️ Le fichier `.env` n'existe pas ou est mal configuré. Recommencez l'ÉTAPE 4.

### Problème : "chunks.json non trouvé"

➡️ Vous devez d'abord exécuter `node chunk_document.js`

### Problème : "relation pierret_documents does not exist"

➡️ Vous n'avez pas exécuté le script SQL dans Supabase. Recommencez l'ÉTAPE 5.

### Problème : Pas de résultats pertinents

➡️ Essayez de reformuler votre question ou vérifiez que les embeddings ont bien été générés.

### Problème : "fetch failed" lors de la génération des embeddings

➡️ Vérifiez votre connexion Internet et que votre clé Voyage AI est correcte.

---

## 🎯 Prochaines Étapes (Optionnel)

Une fois que tout fonctionne, vous pouvez :

1. **Ajouter OpenAI GPT** pour des réponses plus naturelles
2. **Créer une interface web** avec React/Next.js
3. **Déployer le chatbot** sur un serveur
4. **Ajouter plus de documents** à la base de connaissances

---

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Que toutes les étapes ont été suivies dans l'ordre
2. Les messages d'erreur dans le terminal
3. La section Dépannage ci-dessus

---

**Créé avec ❤️ pour Pierret**

Dernière mise à jour : 31 octobre 2025
