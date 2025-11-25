-- Phase 1: Core Infrastructure - CSV Import & Package Management
-- Database Schema Extensions for Tag My Trophy Inventory System

-- Stores table (basic structure for future phases)
CREATE TABLE IF NOT EXISTS stores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  contact_email text,
  contact_phone text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Packages table (groups of QR codes from manufacturer)
CREATE TABLE IF NOT EXISTS packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name text NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('essential', 'premium')),
  total_codes integer NOT NULL DEFAULT 0,
  status text DEFAULT 'available' CHECK (status IN ('available', 'in_store', 'partially_sold', 'fully_sold')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enhanced QR codes table (extend existing functionality)
CREATE TABLE IF NOT EXISTS qr_inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id text UNIQUE NOT NULL, -- from manufacturer CSV
  slug text UNIQUE NOT NULL, -- links to existing qr_slugs
  package_id uuid REFERENCES packages(id) NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('essential', 'premium')),
  status text DEFAULT 'available' CHECK (status IN ('available', 'in_store', 'claimed', 'sold')),
  claimed_by uuid, -- references profiles(id) when claimed
  claimed_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- CSV Import Log table (track import history)
CREATE TABLE IF NOT EXISTS csv_import_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  filename text NOT NULL,
  total_rows integer NOT NULL,
  successful_imports integer NOT NULL DEFAULT 0,
  failed_imports integer NOT NULL DEFAULT 0,
  error_details jsonb,
  imported_by text, -- admin email
  created_at timestamp DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_inventory_package ON qr_inventory(package_id);
CREATE INDEX IF NOT EXISTS idx_qr_inventory_status ON qr_inventory(status);
CREATE INDEX IF NOT EXISTS idx_qr_inventory_slug ON qr_inventory(slug);
CREATE INDEX IF NOT EXISTS idx_qr_inventory_qr_code_id ON qr_inventory(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_product_type ON packages(product_type);
CREATE INDEX IF NOT EXISTS idx_csv_import_logs_created_at ON csv_import_logs(created_at);

-- Update trigger for packages.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_inventory_updated_at BEFORE UPDATE ON qr_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
INSERT INTO packages (package_name, product_type, total_codes, status) VALUES
('Holiday Bundle 2024', 'premium', 50, 'available'),
('Spring Collection', 'essential', 100, 'available'),
('Corporate Package A', 'premium', 25, 'in_store'),
('Retail Starter Pack', 'essential', 75, 'partially_sold');

-- Sample QR inventory data
INSERT INTO qr_inventory (qr_code_id, slug, package_id, product_type, status) 
SELECT 
  'QR' || LPAD((ROW_NUMBER() OVER())::text, 6, '0'),
  'mountain-sunrise-' || SUBSTRING(MD5(RANDOM()::text), 1, 4),
  (SELECT id FROM packages LIMIT 1),
  'premium',
  'available'
FROM generate_series(1, 10);

COMMENT ON TABLE stores IS 'Retail stores for future phases';
COMMENT ON TABLE packages IS 'Groups of QR codes from manufacturer CSV imports';
COMMENT ON TABLE qr_inventory IS 'Individual QR codes linked to packages and existing slug system';
COMMENT ON TABLE csv_import_logs IS 'Track CSV import history and errors';
