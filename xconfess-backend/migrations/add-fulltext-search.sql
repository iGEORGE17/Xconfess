-- Migration: Add full-text search capabilities to confessions
-- Add tsvector column for full-text search
ALTER TABLE anonymous_confession 
ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_confession_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.message, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
CREATE TRIGGER confession_search_vector_update
  BEFORE INSERT OR UPDATE ON anonymous_confession
  FOR EACH ROW EXECUTE FUNCTION update_confession_search_vector();

-- Update existing records
UPDATE anonymous_confession 
SET search_vector = to_tsvector('english', COALESCE(message, ''));

-- Create GIN index for better performance
CREATE INDEX idx_confession_search_vector 
ON anonymous_confession USING GIN(search_vector);

-- Create additional index for ts_rank optimization
CREATE INDEX idx_confession_created_at 
ON anonymous_confession(created_at DESC);