-- Add qr_code_id column to qr_slugs table and create sequential ID generation function

-- Add qr_code_id column to qr_slugs table
ALTER TABLE qr_slugs 
ADD COLUMN IF NOT EXISTS qr_code_id TEXT UNIQUE;

-- Create index for qr_code_id lookups
CREATE INDEX IF NOT EXISTS idx_qr_slugs_qr_code_id ON qr_slugs(qr_code_id);

-- Function to generate sequential QR code IDs
-- Format: qr00001, qr00002, ..., qr99999, then qrA00001, qrA00002, etc.
CREATE OR REPLACE FUNCTION generate_qr_code_id()
RETURNS TEXT AS $$
DECLARE
    last_id TEXT;
    last_num INTEGER;
    last_letter TEXT;
    next_num INTEGER;
    next_id TEXT;
BEGIN
    -- Get the most recent qr_code_id
    SELECT qr_code_id INTO last_id
    FROM qr_slugs 
    WHERE qr_code_id IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no IDs exist yet, start with qr00001
    IF last_id IS NULL THEN
        RETURN 'qr00001';
    END IF;
    
    -- Check if we're in numeric format (qr00001-qr99999)
    IF last_id ~ '^qr[0-9]{5}$' THEN
        -- Extract the number
        last_num := CAST(SUBSTRING(last_id FROM 3) AS INTEGER);
        
        -- If we haven't reached 99999, increment
        IF last_num < 99999 THEN
            next_num := last_num + 1;
            next_id := 'qr' || LPAD(next_num::TEXT, 5, '0');
            RETURN next_id;
        ELSE
            -- Switch to alphanumeric format
            RETURN 'qrA00001';
        END IF;
    END IF;
    
    -- Check if we're in alphanumeric format (qrA00001, qrB00001, etc.)
    IF last_id ~ '^qr[A-Z][0-9]{5}$' THEN
        -- Extract the letter and number
        last_letter := SUBSTRING(last_id FROM 3 FOR 1);
        last_num := CAST(SUBSTRING(last_id FROM 4) AS INTEGER);
        
        -- If we haven't reached 99999 for this letter, increment
        IF last_num < 99999 THEN
            next_num := last_num + 1;
            next_id := 'qr' || last_letter || LPAD(next_num::TEXT, 5, '0');
            RETURN next_id;
        ELSE
            -- Move to next letter
            next_id := 'qr' || CHR(ASCII(last_letter) + 1) || '00001';
            RETURN next_id;
        END IF;
    END IF;
    
    -- Fallback: if format is unexpected, start fresh
    RETURN 'qr00001';
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'QR Code ID column and generation function have been successfully created!';
    RAISE NOTICE 'Function: generate_qr_code_id() - generates sequential IDs in format qr00001, qr00002, etc.';
END $$;
