const { GoogleGenerativeAI } = require('@google/generative-ai');

// In-memory storage for demo (use a real database in production)
let documents = [];

// Calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { query, topK = 3 } = JSON.parse(event.body);

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query is required' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Generate embedding for query
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // Search in documents
    const results = documents
      .map(doc => ({
        ...doc,
        similarity: cosineSimilarity(queryEmbedding, doc.embedding)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(({ embedding, ...doc }) => doc); // Remove embedding from results

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        results,
        count: results.length
      })
    };

  } catch (error) {
    console.error('Search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to search documents',
        details: error.message
      })
    };
  }
};

// Export documents for other functions
exports.documents = documents;
