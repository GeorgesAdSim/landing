const { GoogleGenerativeAI } = require('@google/generative-ai');

// In-memory storage for demo (use a real database in production)
let documents = [];

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
    const { title, content } = JSON.parse(event.body);

    if (!title || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Title and content are required' })
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

    // Generate embedding
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(content);

    // Store document
    const doc = {
      id: Date.now().toString(),
      title,
      content,
      embedding: result.embedding.values,
      createdAt: new Date().toISOString()
    };

    documents.push(doc);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Document uploaded successfully',
        id: doc.id,
        title: doc.title
      })
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to upload document',
        details: error.message
      })
    };
  }
};

// Export documents
exports.documents = documents;
