-- Migration script to update database schema for enhanced QR inventory management
-- Run this script to add missing columns and tables for the new inventory system

-- Add missing columns to qr_codes table for enhanced inventory tracking
ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'essential' CHECK (product_type IN ('essential', 'premium')),
ADD COLUMN IF NOT EXISTS issue_flag TEXT DEFAULT 'none' CHECK (issue_flag IN ('none', 'damaged', 'lost', 'defective', 'customer_return')),
ADD COLUMN IF NOT EXISTS issue_notes TEXT,
ADD COLUMN IF NOT EXISTS issue_flagged_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS issue_flagged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS location TEXT, -- Store name for in_store status
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_scanned_location TEXT,
ADD COLUMN IF NOT EXISTS customer_notes TEXT;

-- Update status column to include new status values
ALTER TABLE qr_codes 
DROP CONSTRAINT IF EXISTS qr_codes_status_check;

ALTER TABLE qr_codes 
ADD CONSTRAINT qr_codes_status_check 
CHECK (status IN ('available', 'online', 'in_store', 'claimed', 'active', 'inactive', 'damaged', 'lost'));

-- Create stores table for store management
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    location TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address JSONB,
    current_inventory INTEGER DEFAULT 0,
    max_capacity INTEGER,
    store_type TEXT DEFAULT 'retail' CHECK (store_type IN ('retail', 'warehouse', 'distribution')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_movements table for tracking QR code movements
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    from_location TEXT,
    to_location TEXT,
    moved_by UUID REFERENCES profiles(id),
    movement_type TEXT CHECK (movement_type IN ('assignment', 'transfer', 'status_change', 'issue_flag', 'return')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create range_presets table for smart range selection
CREATE TABLE IF NOT EXISTS range_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_code TEXT NOT NULL,
    end_code TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES profiles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_product_type ON qr_codes(product_type);
CREATE INDEX IF NOT EXISTS idx_qr_codes_issue_flag ON qr_codes(issue_flag);
CREATE INDEX IF NOT EXISTS idx_qr_codes_location ON qr_codes(location);
CREATE INDEX IF NOT EXISTS idx_qr_codes_assigned_store_id ON qr_codes(assigned_store_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_assigned_at ON qr_codes(assigned_at);
CREATE INDEX IF NOT EXISTS idx_qr_codes_issue_flagged_at ON qr_codes(issue_flagged_at);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_qr_code_id ON inventory_movements(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_movement_type ON inventory_movements(movement_type);

CREATE INDEX IF NOT EXISTS idx_stores_name ON stores(name);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
CREATE TRIGGER update_stores_updated_at 
    BEFORE UPDATE ON stores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample stores data
INSERT INTO stores (name, location, contact_person, phone, email, current_inventory, max_capacity) 
VALUES 
    ('Downtown Sports', 'Main Street', 'John Smith', '(555) 123-4567', 'john@downtownsports.com', 47, 200),
    ('Athletic Zone', 'Mall Plaza', 'Sarah Johnson', '(555) 234-5678', 'sarah@athleticzone.com', 65, 150),
    ('Trophy Central', 'Sports Complex', 'Mike Wilson', '(555) 345-6789', 'mike@trophycentral.com', 0, 300),
    ('Victory Shop', 'Stadium District', 'Lisa Brown', '(555) 456-7890', 'lisa@victoryshop.com', 200, 250)
ON CONFLICT (name) DO NOTHING;

-- Insert sample range presets
INSERT INTO range_presets (name, start_code, end_code, description) 
VALUES 
    ('Small Batch', 'QR000001', 'QR000100', 'Standard small batch of 100 QR codes'),
    ('Medium Batch', 'QR000001', 'QR000500', 'Medium batch of 500 QR codes'),
    ('Large Batch', 'QR000001', 'QR001000', 'Large batch of 1000 QR codes'),
    ('Store Assignment', 'QR001001', 'QR001200', 'Typical store assignment range')
ON CONFLICT DO NOTHING;

-- Create view for enhanced inventory reporting
CREATE OR REPLACE VIEW qr_inventory_detailed AS
SELECT 
    qc.id,
    qc.qr_code_id,
    qc.status,
    qc.product_type,
    qc.issue_flag,
    qc.issue_notes,
    qc.issue_flagged_at,
    qc.location,
    qc.assigned_at,
    qc.claimed_at,
    qc.last_scanned_at,
    qc.scan_count,
    qc.created_at as date_added,
    s.name as store_name,
    s.location as store_location,
    s.contact_person as store_contact,
    p.full_name as issue_flagged_by_name,
    CASE 
        WHEN qc.status = 'available' THEN 'Available in warehouse'
        WHEN qc.status = 'online' THEN 'Available for online sales'
        WHEN qc.status = 'in_store' THEN CONCAT('At store: ', COALESCE(s.name, qc.location))
        WHEN qc.status = 'claimed' THEN 'Claimed by customer'
        WHEN qc.status = 'active' THEN 'Active with customer'
        ELSE qc.status
    END as status_description
FROM qr_codes qc
LEFT JOIN stores s ON qc.assigned_store_id = s.id
LEFT JOIN profiles p ON qc.issue_flagged_by = p.id;

-- Create function to update store inventory counts
CREATE OR REPLACE FUNCTION update_store_inventory_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update inventory count for the store when QR codes are assigned/unassigned
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update new store count
        IF NEW.assigned_store_id IS NOT NULL THEN
            UPDATE stores 
            SET current_inventory = (
                SELECT COUNT(*) 
                FROM qr_codes 
                WHERE assigned_store_id = NEW.assigned_store_id 
                AND status = 'in_store'
            )
            WHERE id = NEW.assigned_store_id;
        END IF;
        
        -- Update old store count if store changed
        IF TG_OP = 'UPDATE' AND OLD.assigned_store_id IS NOT NULL AND OLD.assigned_store_id != NEW.assigned_store_id THEN
            UPDATE stores 
            SET current_inventory = (
                SELECT COUNT(*) 
                FROM qr_codes 
                WHERE assigned_store_id = OLD.assigned_store_id 
                AND status = 'in_store'
            )
            WHERE id = OLD.assigned_store_id;
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        -- Update old store count
        IF OLD.assigned_store_id IS NOT NULL THEN
            UPDATE stores 
            SET current_inventory = (
                SELECT COUNT(*) 
                FROM qr_codes 
                WHERE assigned_store_id = OLD.assigned_store_id 
                AND status = 'in_store'
            )
            WHERE id = OLD.assigned_store_id;
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update store inventory counts
DROP TRIGGER IF EXISTS update_store_inventory_trigger ON qr_codes;
CREATE TRIGGER update_store_inventory_trigger
    AFTER INSERT OR UPDATE OR DELETE ON qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_store_inventory_count();

-- Create function to log inventory movements
CREATE OR REPLACE FUNCTION log_inventory_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Log status changes
        IF OLD.status != NEW.status THEN
            INSERT INTO inventory_movements (
                qr_code_id, 
                from_status, 
                to_status, 
                from_location, 
                to_location,
                movement_type,
                notes
            ) VALUES (
                NEW.id,
                OLD.status,
                NEW.status,
                OLD.location,
                NEW.location,
                'status_change',
                CASE 
                    WHEN NEW.issue_flag != 'none' AND OLD.issue_flag = 'none' THEN 'Issue flagged: ' || NEW.issue_flag
                    WHEN NEW.issue_flag = 'none' AND OLD.issue_flag != 'none' THEN 'Issue resolved: ' || OLD.issue_flag
                    ELSE 'Status changed from ' || OLD.status || ' to ' || NEW.status
                END
            );
        END IF;
        
        -- Log location changes
        IF COALESCE(OLD.location, '') != COALESCE(NEW.location, '') THEN
            INSERT INTO inventory_movements (
                qr_code_id,
                from_status,
                to_status,
                from_location,
                to_location,
                movement_type,
                notes
            ) VALUES (
                NEW.id,
                OLD.status,
                NEW.status,
                OLD.location,
                NEW.location,
                'transfer',
                'Location changed from ' || COALESCE(OLD.location, 'unassigned') || ' to ' || COALESCE(NEW.location, 'unassigned')
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log movements
DROP TRIGGER IF EXISTS log_inventory_movement_trigger ON qr_codes;
CREATE TRIGGER log_inventory_movement_trigger
    AFTER UPDATE ON qr_codes
    FOR EACH ROW
    EXECUTE FUNCTION log_inventory_movement();

-- Update existing QR codes with default values for new columns
UPDATE qr_codes 
SET 
    product_type = CASE 
        WHEN random() < 0.6 THEN 'essential' 
        ELSE 'premium' 
    END,
    issue_flag = 'none',
    assigned_at = CASE 
        WHEN status != 'available' THEN created_at 
        ELSE NULL 
    END
WHERE product_type IS NULL;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON stores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON range_presets TO authenticated;
GRANT SELECT ON qr_inventory_detailed TO authenticated;

-- Create RLS policies for stores table
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before creating new ones to prevent conflicts
DROP POLICY IF EXISTS "Stores are viewable by authenticated users" ON stores;
CREATE POLICY "Stores are viewable by authenticated users" ON stores
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Stores are manageable by admins" ON stores;
CREATE POLICY "Stores are manageable by admins" ON stores
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create RLS policies for inventory_movements table
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inventory movements are viewable by authenticated users" ON inventory_movements;
CREATE POLICY "Inventory movements are viewable by authenticated users" ON inventory_movements
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Inventory movements are manageable by admins" ON inventory_movements;
CREATE POLICY "Inventory movements are manageable by admins" ON inventory_movements
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create RLS policies for range_presets table
ALTER TABLE range_presets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Range presets are viewable by authenticated users" ON range_presets;
CREATE POLICY "Range presets are viewable by authenticated users" ON range_presets
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Range presets are manageable by admins" ON range_presets;
CREATE POLICY "Range presets are manageable by admins" ON range_presets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Add comments for documentation
COMMENT ON TABLE stores IS 'Store locations where QR codes can be assigned';
COMMENT ON TABLE inventory_movements IS 'Audit trail for QR code status and location changes';
COMMENT ON TABLE range_presets IS 'Predefined QR code ranges for bulk operations';
COMMENT ON VIEW qr_inventory_detailed IS 'Comprehensive view of QR code inventory with store and user details';

-- Final verification query
SELECT 
    'Migration completed successfully. New schema includes:' as status,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'qr_codes' AND column_name IN ('product_type', 'issue_flag', 'location')) as new_qr_columns,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('stores', 'inventory_movements', 'range_presets')) as new_tables,
    (SELECT COUNT(*) FROM stores) as sample_stores_added;
