-- Drop existing table if it exists
DROP TABLE IF EXISTS pricing_config CASCADE;

-- Create pricing configuration table
CREATE TABLE pricing_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('one_time', 'recurring')),
  price numeric(10, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  stripe_price_id text,
  is_active boolean DEFAULT true,
  description text,
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for active prices
CREATE INDEX idx_pricing_config_active ON pricing_config(is_active);
CREATE INDEX idx_pricing_config_type ON pricing_config(product_type);

-- Enable RLS
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active pricing" ON pricing_config;
DROP POLICY IF EXISTS "Admins can manage pricing" ON pricing_config;

-- Allow anyone to view active pricing
CREATE POLICY "Anyone can view active pricing"
  ON pricing_config
  FOR SELECT
  USING (is_active = true);

-- Allow admins to manage pricing (you'll need to adjust this based on your admin auth)
CREATE POLICY "Admins can manage pricing"
  ON pricing_config
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default pricing
INSERT INTO pricing_config (product_name, product_type, price, stripe_price_id, description, features)
VALUES 
  (
    'Complete Memory Package',
    'one_time',
    29.99,
    'price_standard',
    'Durable metal QR tag with first year hosting included',
    '["Durable metal QR tag", "Strong adhesive backing", "200 photos per experience", "1 hour of video per experience", "Easy sharing with anyone", "Weather-resistant design", "Priority customer support", "Advanced customization options"]'::jsonb
  ),
  (
    'Annual Hosting Fee',
    'recurring',
    9.99,
    'price_annual_hosting',
    'Yearly hosting and maintenance fee',
    '["Unlimited access to your memories", "Cloud storage", "Regular backups", "Technical support"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_pricing_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_pricing_config_timestamp ON pricing_config;

-- Create trigger for updated_at
CREATE TRIGGER update_pricing_config_timestamp
  BEFORE UPDATE ON pricing_config
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_config_updated_at();
