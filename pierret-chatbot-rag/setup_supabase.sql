-- Script SQL pour configurer la base de données Supabase
-- Exécutez ce script dans l'éditeur SQL de Supabase

-- Activer l'extension pgvector pour le stockage de vecteurs
CREATE EXTENSION IF NOT EXISTS vector;

-- Créer la table pour stocker les documents et leurs embeddings
CREATE TABLE IF NOT EXISTS pierret_documents (
  id BIGSERIAL PRIMARY KEY,
  chunk_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1024), -- Voyage AI utilise des vecteurs de dimension 1024
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

-- Commentaires pour la documentation
COMMENT ON TABLE pierret_documents IS 'Table contenant les chunks du guide Pierret avec leurs embeddings Voyage AI';
COMMENT ON COLUMN pierret_documents.embedding IS 'Vecteur embedding généré par Voyage AI (dimension 1024)';
COMMENT ON FUNCTION match_documents IS 'Recherche les documents les plus similaires basés sur l''embedding de la requête';
