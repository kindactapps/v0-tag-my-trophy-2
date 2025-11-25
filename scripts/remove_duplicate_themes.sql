-- Remove duplicate themes, keeping only the oldest one of each name
WITH duplicates AS (
  SELECT 
    id,
    name,
    ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
  FROM themes
)
DELETE FROM themes
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Update any references to deleted themes (if needed)
-- This ensures data integrity
