-- Create manufacturer_orders table to track QR code manufacturing orders
CREATE TABLE IF NOT EXISTS manufacturer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'fulfilled'
  manufacturer_name TEXT NOT NULL,
  manufacturer_email TEXT NOT NULL,
  manufacturer_company TEXT,
  manufacturer_phone TEXT,
  order_csv_content TEXT,
  fulfillment_csv_content TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add manufacturer_order_id to qr_slugs table
ALTER TABLE qr_slugs 
ADD COLUMN IF NOT EXISTS manufacturer_order_id UUID REFERENCES manufacturer_orders(id),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'generated'; -- 'generated', 'manufacturing', 'available', 'claimed'

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_qr_slugs_manufacturer_order_id ON qr_slugs(manufacturer_order_id);
CREATE INDEX IF NOT EXISTS idx_qr_slugs_status ON qr_slugs(status);
CREATE INDEX IF NOT EXISTS idx_manufacturer_orders_status ON manufacturer_orders(status);
CREATE INDEX IF NOT EXISTS idx_manufacturer_orders_order_date ON manufacturer_orders(order_date DESC);

-- Add updated_at trigger for manufacturer_orders
CREATE OR REPLACE FUNCTION update_manufacturer_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists before creating to prevent duplicate errors
DROP TRIGGER IF EXISTS manufacturer_orders_updated_at ON manufacturer_orders;

CREATE TRIGGER manufacturer_orders_updated_at
BEFORE UPDATE ON manufacturer_orders
FOR EACH ROW
EXECUTE FUNCTION update_manufacturer_orders_updated_at();
