require('dotenv').config();
const { VoyageAIClient } = require('voyageai');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

/**
 * Chatbot RAG Pierret
 * Utilise Voyage AI pour les embeddings et Supabase pour la recherche vectorielle
 */

class PierretChatbot {
  constructor() {
    // Vérifier les variables d'environnement
    if (!process.env.VOYAGE_API_KEY) {
      throw new Error('❌ VOYAGE_API_KEY non défini dans .env');
    }
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      throw new Error('❌ SUPABASE_URL ou SUPABASE_KEY non défini dans .env');
    }

    this.voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }

  /**
   * Recherche les documents pertinents pour une question
   */
  async search(query, topK = 5, threshold = 0.7) {
    try {
      // 1. Générer l'embedding de la question
      console.log('🔍 Recherche en cours...');
      const response = await this.voyageClient.embed({
        input: [query],
        model: 'voyage-2',
      });

      const queryEmbedding = response.data[0].embedding;

      // 2. Rechercher les documents similaires dans Supabase
      const { data, error } = await this.supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: topK
      });

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }

      return data;

    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error.message);
      throw error;
    }
  }

  /**
   * Génère une réponse basée sur les documents trouvés
   */
  generateAnswer(query, documents) {
    if (!documents || documents.length === 0) {
      return "Désolé, je n'ai pas trouvé d'informations pertinentes pour répondre à votre question. Pourriez-vous reformuler ?";
    }

    // Construire le contexte à partir des documents trouvés
    const context = documents.map((doc, idx) =>
      `[Document ${idx + 1}] (Similarité: ${(doc.similarity * 100).toFixed(1)}%)\n${doc.content}`
    ).join('\n\n---\n\n');

    // Pour l'instant, retourner le contexte brut
    // Vous pouvez intégrer OpenAI GPT ici pour générer une réponse naturelle
    return {
      answer: `Voici les informations pertinentes trouvées dans la documentation Pierret :\n\n${context}`,
      sources: documents.map(doc => ({
        chunk_id: doc.chunk_id,
        similarity: doc.similarity,
        preview: doc.content.substring(0, 150) + '...'
      }))
    };
  }

  /**
   * Pose une question au chatbot
   */
  async ask(question) {
    try {
      const documents = await this.search(question);
      const result = this.generateAnswer(question, documents);
      return result;
    } catch (error) {
      return {
        answer: `Erreur: ${error.message}`,
        sources: []
      };
    }
  }
}

/**
 * Interface interactive en ligne de commande
 */
async function interactiveMode() {
  const chatbot = new PierretChatbot();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   🤖 Chatbot Pierret RAG               ║');
  console.log('║   Posez vos questions sur Pierret      ║');
  console.log('║   Tapez "exit" pour quitter            ║');
  console.log('╚════════════════════════════════════════╝\n');

  const askQuestion = () => {
    rl.question('\n💬 Votre question: ', async (question) => {
      if (question.toLowerCase() === 'exit') {
        console.log('\n👋 Au revoir !\n');
        rl.close();
        process.exit(0);
      }

      if (!question.trim()) {
        askQuestion();
        return;
      }

      const result = await chatbot.ask(question);

      console.log('\n' + '='.repeat(80));
      console.log('📖 RÉPONSE:\n');
      console.log(result.answer);
      console.log('\n' + '='.repeat(80));

      if (result.sources && result.sources.length > 0) {
        console.log('\n📚 Sources utilisées:');
        result.sources.forEach((source, idx) => {
          console.log(`  ${idx + 1}. Chunk ${source.chunk_id} (${(source.similarity * 100).toFixed(1)}% de similarité)`);
        });
      }

      askQuestion();
    });
  };

  askQuestion();
}

// Exécution
if (require.main === module) {
  interactiveMode().catch(console.error);
}

module.exports = { PierretChatbot };
