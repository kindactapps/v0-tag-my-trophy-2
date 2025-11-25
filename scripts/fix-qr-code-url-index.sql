-- Drop the problematic index on qr_code_url
-- QR code data URLs are too large for btree indexing (can exceed 2704 byte limit)
-- This index is not needed since we don't search by QR code URL content
DROP INDEX IF EXISTS idx_qr_slugs_qr_code_url;

-- The qr_code_url column will remain in the table, just without the index
-- This allows storing large QR code data URLs without index size limitations
