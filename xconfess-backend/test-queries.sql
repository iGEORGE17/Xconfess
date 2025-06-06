-- Test queries to validate full-text search functionality

-- 1. Basic full-text search
SELECT id, message, ts_rank(search_vector, plainto_tsquery('love')) as rank
FROM anonymous_confession 
WHERE search_vector @@ plainto_tsquery('love')
ORDER BY rank DESC, created_at DESC;

-- 2. Multi-word search
SELECT id, message, ts_rank(search_vector, plainto_tsquery('relationship advice')) as rank
FROM anonymous_confession 
WHERE search_vector @@ plainto_tsquery('relationship advice')
ORDER BY rank DESC, created_at DESC;

-- 3. Phrase search
SELECT id, message, ts_rank(search_vector, phraseto_tsquery('feeling lonely')) as rank
FROM anonymous_confession 
WHERE search_vector @@ phraseto_tsquery('feeling lonely')
ORDER BY rank DESC, created_at DESC;

-- 4. Partial word search (fallback to ILIKE)
SELECT id, message
FROM anonymous_confession 
WHERE message ILIKE '%happi%'
ORDER BY created_at DESC;

-- 5. Check search vector index usage
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id, message 
FROM anonymous_confession 
WHERE search_vector @@ plainto_tsquery('love');

-- 6. Test search vector updates
INSERT INTO anonymous_confession (message) VALUES ('This is a test confession about happiness');
SELECT message, search_vector FROM anonymous_confession WHERE message LIKE '%test confession%';