-- Create order_qr_codes junction table to track which QR codes are assigned to which orders
CREATE TABLE IF NOT EXISTS order_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  linked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(order_id, qr_code_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_qr_codes_order_id ON order_qr_codes(order_id);
CREATE INDEX IF NOT EXISTS idx_order_qr_codes_qr_code_id ON order_qr_codes(qr_code_id);

-- Add packed_at and packed_by columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS packed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS packed_by UUID REFERENCES profiles(id);

-- Create function to cascade order status changes to linked QR codes
CREATE OR REPLACE FUNCTION cascade_order_status_to_qr_codes()
RETURNS TRIGGER AS $$
BEGIN
  -- When order status changes, update all linked QR codes
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    
    -- Order marked as Packaged -> QR codes become Packaged
    IF NEW.status = 'packaged' THEN
      UPDATE qr_codes 
      SET status = 'Packaged', updated_at = NOW()
      WHERE id IN (
        SELECT qr_code_id FROM order_qr_codes WHERE order_id = NEW.id
      );
    
    -- Order marked as Shipped -> QR codes become Shipped
    ELSIF NEW.status = 'shipped' THEN
      UPDATE qr_codes 
      SET status = 'Shipped', updated_at = NOW()
      WHERE id IN (
        SELECT qr_code_id FROM order_qr_codes WHERE order_id = NEW.id
      );
    
    -- Order marked as Completed -> QR codes become Completed
    ELSIF NEW.status = 'completed' THEN
      UPDATE qr_codes 
      SET status = 'Completed', updated_at = NOW()
      WHERE id IN (
        SELECT qr_code_id FROM order_qr_codes WHERE order_id = NEW.id
      );
    
    -- Order cancelled -> Unlink QR codes and reset to Available
    ELSIF NEW.status = 'cancelled' THEN
      UPDATE qr_codes 
      SET 
        status = 'Available',
        assigned_order_id = NULL,
        updated_at = NOW()
      WHERE id IN (
        SELECT qr_code_id FROM order_qr_codes WHERE order_id = NEW.id
      );
      
      -- Delete the junction table entries
      DELETE FROM order_qr_codes WHERE order_id = NEW.id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically cascade status changes
DROP TRIGGER IF EXISTS trigger_cascade_order_status ON orders;
CREATE TRIGGER trigger_cascade_order_status
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION cascade_order_status_to_qr_codes();

-- Add audit logging for pack-and-scan operations
CREATE TABLE IF NOT EXISTS pack_scan_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  qr_code_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'scanned', 'removed', 'completed'
  scanned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_pack_scan_audit_order_id ON pack_scan_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_pack_scan_audit_created_at ON pack_scan_audit_log(created_at);
