-- Enhanced Order Management and QR Code Batch System Schema
-- This script creates and modifies tables for comprehensive order and QR code management

-- =====================================================
-- 1. MODIFY EXISTING ORDERS TABLE
-- =====================================================

-- Add new columns to existing orders table for enhanced shipping and status tracking
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS shipping_name TEXT,
ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
ADD COLUMN IF NOT EXISTS shipping_email TEXT,
ADD COLUMN IF NOT EXISTS shipping_city TEXT,
ADD COLUMN IF NOT EXISTS shipping_state TEXT,
ADD COLUMN IF NOT EXISTS shipping_zip TEXT,
ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS priority_level TEXT DEFAULT 'normal' CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS estimated_ship_date DATE,
ADD COLUMN IF NOT EXISTS actual_ship_date DATE,
ADD COLUMN IF NOT EXISTS delivery_date DATE,
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS assigned_qr_codes TEXT[],
ADD COLUMN IF NOT EXISTS batch_id UUID;

-- Update status column to include all new statuses
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'processing', 'manufacturing', 'packaged', 'shipped', 'completed', 'cancelled', 'refunded'));

-- Create index for order number lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_priority ON orders(priority_level);
CREATE INDEX IF NOT EXISTS idx_orders_ship_date ON orders(estimated_ship_date);

-- =====================================================
-- 2. CREATE QR CODE BATCHES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS qr_code_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_number TEXT UNIQUE NOT NULL, -- e.g., "BATCH-001", "BATCH-002"
    batch_size INTEGER NOT NULL CHECK (batch_size IN (30, 50)), -- Only allow 30 or 50
    start_code TEXT NOT NULL, -- e.g., "qr0001", "qrA0001"
    end_code TEXT NOT NULL, -- e.g., "qr0030", "qrA0050"
    status TEXT DEFAULT 'created' CHECK (status IN ('created', 'printed', 'distributed', 'completed')),
    created_by UUID REFERENCES profiles(id),
    assigned_store_id UUID, -- For future store assignment functionality
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for batch management
CREATE INDEX IF NOT EXISTS idx_qr_batches_batch_number ON qr_code_batches(batch_number);
CREATE INDEX IF NOT EXISTS idx_qr_batches_status ON qr_code_batches(status);
CREATE INDEX IF NOT EXISTS idx_qr_batches_store ON qr_code_batches(assigned_store_id);

-- =====================================================
-- 3. CREATE ENHANCED QR CODES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_code_id TEXT UNIQUE NOT NULL, -- e.g., "qr0001", "qr0002", "qrA0001"
    batch_id UUID REFERENCES qr_code_batches(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'claimed', 'used', 'expired', 'damaged')),
    assigned_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    assigned_store_id UUID, -- For future store assignment
    claimed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    claimed_at TIMESTAMP WITH TIME ZONE,
    last_scanned_at TIMESTAMP WITH TIME ZONE,
    scan_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb, -- For additional QR code data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for QR code management
CREATE INDEX IF NOT EXISTS idx_qr_codes_qr_code_id ON qr_codes(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_batch_id ON qr_codes(batch_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_assigned_order ON qr_codes(assigned_order_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_store ON qr_codes(assigned_store_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_claimed_by ON qr_codes(claimed_by);

-- =====================================================
-- 4. CREATE ORDER STATUS HISTORY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    change_reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for status history
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON order_status_history(new_status);
CREATE INDEX IF NOT EXISTS idx_order_status_history_date ON order_status_history(created_at);

-- =====================================================
-- 5. CREATE SHIPPING LABELS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS shipping_labels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number TEXT UNIQUE,
    carrier TEXT NOT NULL, -- 'USPS', 'UPS', 'FedEx', etc.
    service_type TEXT, -- 'Ground', 'Express', 'Priority', etc.
    label_url TEXT, -- URL to the shipping label PDF
    cost DECIMAL(10,2),
    weight DECIMAL(8,2), -- in pounds
    dimensions JSONB, -- {length, width, height}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shipped_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for shipping labels
CREATE INDEX IF NOT EXISTS idx_shipping_labels_order_id ON shipping_labels(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_tracking ON shipping_labels(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_carrier ON shipping_labels(carrier);

-- =====================================================
-- 6. CREATE BULK OPERATIONS LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS bulk_operations_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL, -- 'status_update', 'qr_assignment', 'export', etc.
    performed_by UUID REFERENCES profiles(id),
    affected_records INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    operation_details JSONB DEFAULT '{}'::jsonb,
    error_details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bulk operations log
CREATE INDEX IF NOT EXISTS idx_bulk_ops_log_type ON bulk_operations_log(operation_type);
CREATE INDEX IF NOT EXISTS idx_bulk_ops_log_user ON bulk_operations_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_bulk_ops_log_date ON bulk_operations_log(created_at);

-- =====================================================
-- 7. CREATE FUNCTIONS FOR AUTOMATED WORKFLOWS
-- =====================================================

-- Function to automatically update order status history
CREATE OR REPLACE FUNCTION update_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO order_status_history (order_id, old_status, new_status, created_at)
        VALUES (NEW.id, OLD.status, NEW.status, NOW());
        
        -- Update the status_history JSONB column as well
        NEW.status_history = COALESCE(NEW.status_history, '[]'::jsonb) || 
            jsonb_build_object(
                'from', OLD.status,
                'to', NEW.status,
                'timestamp', NOW()
            );
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status updates
DROP TRIGGER IF EXISTS trigger_order_status_history ON orders;
CREATE TRIGGER trigger_order_status_history
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_status_history();

-- Function to generate sequential QR code IDs
CREATE OR REPLACE FUNCTION generate_qr_code_id()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    next_id TEXT;
BEGIN
    -- Get the highest numeric QR code (qr0001-qr9999)
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(qr_code_id FROM 3) AS INTEGER)), 
        0
    ) INTO next_num
    FROM qr_codes 
    WHERE qr_code_id ~ '^qr[0-9]{4}$';
    
    -- If we haven't reached 9999, use numeric format
    IF next_num < 9999 THEN
        next_id := 'qr' || LPAD((next_num + 1)::TEXT, 4, '0');
    ELSE
        -- Switch to alphanumeric format (qrA0001, qrB0001, etc.)
        -- This is a simplified version - you may want to enhance this logic
        next_id := 'qrA' || LPAD('1', 4, '0');
    END IF;
    
    RETURN next_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE qr_code_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_operations_log ENABLE ROW LEVEL SECURITY;

-- Admin access policies (full access for admin users)
CREATE POLICY "Admins can manage QR code batches" ON qr_code_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage QR codes" ON qr_codes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

CREATE POLICY "Admins can view order status history" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage shipping labels" ON shipping_labels
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

CREATE POLICY "Admins can view bulk operations log" ON bulk_operations_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admins 
            WHERE admins.id = auth.uid()
        )
    );

-- User access policies (limited access for regular users)
CREATE POLICY "Users can view their claimed QR codes" ON qr_codes
    FOR SELECT USING (claimed_by = auth.uid());

CREATE POLICY "Users can view their order status history" ON order_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_status_history.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- =====================================================
-- 9. CREATE VIEWS FOR REPORTING
-- =====================================================

-- View for order management dashboard
CREATE OR REPLACE VIEW order_management_view AS
SELECT 
    o.id,
    o.order_number,
    o.customer_name,
    o.customer_email,
    o.status,
    o.priority_level,
    o.total_amount,
    o.estimated_ship_date,
    o.actual_ship_date,
    o.created_at,
    o.updated_at,
    COALESCE(array_length(o.assigned_qr_codes, 1), 0) as qr_code_count,
    sl.tracking_number,
    sl.carrier,
    COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN shipping_labels sl ON o.id = sl.order_id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, sl.tracking_number, sl.carrier;

-- View for QR code batch management
CREATE OR REPLACE VIEW qr_batch_management_view AS
SELECT 
    b.id,
    b.batch_number,
    b.batch_size,
    b.start_code,
    b.end_code,
    b.status,
    b.assigned_store_id,
    b.created_at,
    COUNT(q.id) as total_codes,
    COUNT(CASE WHEN q.status = 'available' THEN 1 END) as available_codes,
    COUNT(CASE WHEN q.status = 'assigned' THEN 1 END) as assigned_codes,
    COUNT(CASE WHEN q.status = 'claimed' THEN 1 END) as claimed_codes
FROM qr_code_batches b
LEFT JOIN qr_codes q ON b.id = q.batch_id
GROUP BY b.id;

-- =====================================================
-- 10. INSERT SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Fixed window function usage in UPDATE statement using subquery approach
-- Generate order numbers for existing orders that don't have them
UPDATE orders 
SET order_number = subquery.order_number
FROM (
    SELECT 
        id,
        'ORD-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0') as order_number
    FROM orders 
    WHERE order_number IS NULL
) AS subquery
WHERE orders.id = subquery.id;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Add a comment to indicate successful completion
COMMENT ON TABLE qr_code_batches IS 'Enhanced QR code batch management system - Created by v0 schema migration';
COMMENT ON TABLE qr_codes IS 'Individual QR codes with batch tracking and assignment capabilities';
COMMENT ON TABLE order_status_history IS 'Audit trail for order status changes';
COMMENT ON TABLE shipping_labels IS 'Shipping label and tracking information';
COMMENT ON TABLE bulk_operations_log IS 'Log of bulk operations performed by administrators';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Enhanced Order Management and QR Code Batch System schema has been successfully created!';
    RAISE NOTICE 'Tables created/modified: orders, qr_code_batches, qr_codes, order_status_history, shipping_labels, bulk_operations_log';
    RAISE NOTICE 'Views created: order_management_view, qr_batch_management_view';
    RAISE NOTICE 'RLS policies and indexes have been applied';
END $$;
