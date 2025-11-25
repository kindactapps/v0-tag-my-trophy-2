-- Add qr_code_url column to qr_slugs table to store QR code images
ALTER TABLE qr_slugs 
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_qr_slugs_qr_code_url ON qr_slugs(qr_code_url);

-- Update existing records to have null qr_code_url (they will be regenerated)
UPDATE qr_slugs 
SET qr_code_url = NULL 
WHERE qr_code_url IS NULL;
