-- Remove duplicate themes, keeping only the first occurrence of each theme name
WITH duplicates AS (
  SELECT id, name,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
  FROM themes
)
DELETE FROM themes
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verify no duplicates remain
SELECT name, COUNT(*) as count
FROM themes
GROUP BY name
HAVING COUNT(*) > 1;
