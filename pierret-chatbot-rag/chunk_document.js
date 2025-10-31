const fs = require('fs');

/**
 * Divise le document Pierret en chunks pour l'embedding
 * Stratégie: Découpe par sections logiques pour préserver le contexte
 */

function chunkDocument(filePath, chunkSize = 1000, overlap = 200) {
  const content = fs.readFileSync(filePath, 'utf-8');

  // Diviser par sections principales (indiquées par des lignes vides multiples ou des titres)
  const sections = content.split(/\n\n+/);

  const chunks = [];
  let currentChunk = '';
  let chunkId = 0;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();

    if (!section) continue;

    // Si ajouter cette section dépasse la taille max, sauvegarder le chunk actuel
    if (currentChunk.length + section.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        id: chunkId++,
        content: currentChunk.trim(),
        length: currentChunk.length
      });

      // Commencer un nouveau chunk avec overlap
      const words = currentChunk.split(' ');
      const overlapWords = words.slice(-Math.floor(overlap / 5)); // Approximation
      currentChunk = overlapWords.join(' ') + '\n\n' + section;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + section;
    }
  }

  // Ajouter le dernier chunk
  if (currentChunk.trim()) {
    chunks.push({
      id: chunkId++,
      content: currentChunk.trim(),
      length: currentChunk.length
    });
  }

  return chunks;
}

// Exécution si appelé directement
if (require.main === module) {
  const chunks = chunkDocument('./pierret_guide.txt');

  // Sauvegarder les chunks dans un fichier JSON
  fs.writeFileSync('./chunks.json', JSON.stringify(chunks, null, 2));

  console.log(`✅ Document divisé en ${chunks.length} chunks`);
  console.log(`📊 Taille moyenne des chunks: ${Math.round(chunks.reduce((sum, c) => sum + c.length, 0) / chunks.length)} caractères`);
  console.log(`💾 Chunks sauvegardés dans chunks.json`);
}

module.exports = { chunkDocument };
