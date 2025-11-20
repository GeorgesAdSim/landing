// In-memory storage reference (shared with upload.js in real deployment)
let documents = [];

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Return documents without embeddings
    const docList = documents.map(({ embedding, ...doc }) => doc);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        documents: docList,
        count: docList.length
      })
    };

  } catch (error) {
    console.error('List error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to list documents',
        details: error.message
      })
    };
  }
};

// Export documents
exports.documents = documents;
