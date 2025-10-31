require('dotenv').config();
const { VoyageAIClient } = require('voyageai');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

/**
 * Script pour générer les embeddings avec Voyage AI
 * et les stocker dans Supabase
 */

async function generateEmbeddings() {
  // Vérifier les variables d'environnement
  if (!process.env.VOYAGE_API_KEY) {
    throw new Error('❌ VOYAGE_API_KEY non défini dans .env');
  }
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    throw new Error('❌ SUPABASE_URL ou SUPABASE_KEY non défini dans .env');
  }

  // Initialiser les clients
  const voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  // Charger les chunks
  if (!fs.existsSync('./chunks.json')) {
    throw new Error('❌ fichier chunks.json non trouvé. Exécutez d\'abord chunk_document.js');
  }

  const chunks = JSON.parse(fs.readFileSync('./chunks.json', 'utf-8'));
  console.log(`📚 ${chunks.length} chunks à traiter`);

  // Générer les embeddings par batch (max 128 textes par requête Voyage AI)
  const batchSize = 128;
  let totalProcessed = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map(chunk => chunk.content);

    console.log(`\n🔄 Traitement du batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}...`);

    try {
      // Générer les embeddings avec Voyage AI
      const response = await voyageClient.embed({
        input: texts,
        model: 'voyage-2', // Modèle recommandé pour le RAG
      });

      const embeddings = response.data;

      // Insérer dans Supabase
      const records = batch.map((chunk, idx) => ({
        chunk_id: chunk.id,
        content: chunk.content,
        embedding: embeddings[idx].embedding,
        metadata: {
          length: chunk.length,
          batch: Math.floor(i / batchSize),
        }
      }));

      const { data, error } = await supabase
        .from('pierret_documents')
        .insert(records);

      if (error) {
        console.error('❌ Erreur Supabase:', error);
        throw error;
      }

      totalProcessed += batch.length;
      console.log(`✅ ${totalProcessed}/${chunks.length} chunks traités`);

      // Pause pour éviter rate limiting
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      console.error(`❌ Erreur lors du traitement du batch:`, error.message);
      throw error;
    }
  }

  console.log(`\n✅ Terminé ! ${totalProcessed} embeddings générés et stockés dans Supabase`);
}

// Exécution
if (require.main === module) {
  generateEmbeddings()
    .then(() => {
      console.log('\n🎉 Processus terminé avec succès !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { generateEmbeddings };
