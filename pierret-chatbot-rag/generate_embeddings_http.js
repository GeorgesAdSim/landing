require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

/**
 * Script pour générer les embeddings avec Voyage AI (via HTTP direct)
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

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

  // Charger les chunks
  if (!fs.existsSync('./chunks.json')) {
    throw new Error('❌ fichier chunks.json non trouvé. Exécutez d\'abord chunk_document.js');
  }

  const chunks = JSON.parse(fs.readFileSync('./chunks.json', 'utf-8'));
  console.log(`📚 ${chunks.length} chunks à traiter`);

  // Générer les embeddings par batch
  const batchSize = 128;
  let totalProcessed = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const texts = batch.map(chunk => chunk.content);

    console.log(`\n🔄 Traitement du batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}...`);

    try {
      // Appel API HTTP direct à Voyage AI
      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`
        },
        body: JSON.stringify({
          input: texts,
          model: 'voyage-2'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const embeddings = data.data;

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

      const { error } = await supabase
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
