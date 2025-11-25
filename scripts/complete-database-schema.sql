-- Complete Database Schema for Tag My Trophy
-- This includes all core tables needed for the system to function

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core user profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  bio text,
  avatar_url text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- QR slugs table (core functionality)
CREATE TABLE IF NOT EXISTS qr_slugs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  owner_id uuid REFERENCES profiles(id),
  title text,
  description text,
  is_claimed boolean DEFAULT false,
  is_active boolean DEFAULT true,
  views_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Stories/Collections table
CREATE TABLE IF NOT EXISTS stories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug_id uuid REFERENCES qr_slugs(id) NOT NULL,
  owner_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text,
  cover_image_url text,
  is_public boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Memories table (photos, videos, text stories)
CREATE TABLE IF NOT EXISTS memories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id uuid REFERENCES stories(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('photo', 'video', 'story')),
  title text,
  content text, -- for text stories
  url text, -- for photos/videos
  caption text,
  location text,
  date_taken timestamp,
  tags text[], -- array of tags
  is_featured boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Orders table (for business functionality)
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_address jsonb, -- store address as JSON
  plan_type text NOT NULL CHECK (plan_type IN ('essential', 'premium')),
  quantity integer NOT NULL DEFAULT 1,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'generated', 'manufacturing', 'shipped', 'delivered', 'cancelled')),
  stripe_payment_intent_id text,
  customization_details jsonb, -- store customization as JSON
  shipping_tracking text,
  notes text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Order items table (for detailed order tracking)
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) NOT NULL,
  type text NOT NULL, -- 'Standard QR Tag', 'Premium QR Tag', etc.
  quantity integer NOT NULL DEFAULT 1,
  customization text,
  unit_price decimal(10,2) NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Stores table (for retail partnerships)
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

-- QR inventory table (individual QR codes linked to packages)
CREATE TABLE IF NOT EXISTS qr_inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id text UNIQUE NOT NULL, -- from manufacturer CSV
  slug text UNIQUE NOT NULL, -- links to qr_slugs table
  package_id uuid REFERENCES packages(id) NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('essential', 'premium')),
  status text DEFAULT 'available' CHECK (status IN ('available', 'in_store', 'claimed', 'sold')),
  claimed_by uuid REFERENCES profiles(id),
  claimed_at timestamp,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- CSV import logs table (track import history)
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

-- Comments table (for guest comments on stories)
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id uuid REFERENCES stories(id) NOT NULL,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Privacy settings table
CREATE TABLE IF NOT EXISTS privacy_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  allow_comments boolean DEFAULT true,
  allow_sharing boolean DEFAULT true,
  show_location boolean DEFAULT true,
  show_timestamps boolean DEFAULT true,
  allow_analytics boolean DEFAULT true,
  allow_cookies boolean DEFAULT true,
  data_retention text DEFAULT '2_years' CHECK (data_retention IN ('1_year', '2_years', '5_years', 'indefinite')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Analytics events table (for tracking)
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL, -- 'view', 'share', 'comment', etc.
  story_id uuid REFERENCES stories(id),
  user_id uuid REFERENCES profiles(id),
  metadata jsonb, -- additional event data
  ip_address inet,
  user_agent text,
  created_at timestamp DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_slugs_slug ON qr_slugs(slug);
CREATE INDEX IF NOT EXISTS idx_qr_slugs_owner ON qr_slugs(owner_id);
CREATE INDEX IF NOT EXISTS idx_stories_slug_id ON stories(slug_id);
CREATE INDEX IF NOT EXISTS idx_stories_owner ON stories(owner_id);
CREATE INDEX IF NOT EXISTS idx_memories_story ON memories(story_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_qr_inventory_package ON qr_inventory(package_id);
CREATE INDEX IF NOT EXISTS idx_qr_inventory_status ON qr_inventory(status);
CREATE INDEX IF NOT EXISTS idx_qr_inventory_slug ON qr_inventory(slug);
CREATE INDEX IF NOT EXISTS idx_qr_inventory_qr_code_id ON qr_inventory(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_product_type ON packages(product_type);
CREATE INDEX IF NOT EXISTS idx_csv_import_logs_created_at ON csv_import_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_story ON comments(story_id);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user ON privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_story ON analytics_events(story_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_slugs_updated_at BEFORE UPDATE ON qr_slugs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_inventory_updated_at BEFORE UPDATE ON qr_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at BEFORE UPDATE ON privacy_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO profiles (email, full_name, bio) VALUES
('admin@tagmytrophy.com', 'Admin User', 'System Administrator'),
('demo@tagmytrophy.com', 'Demo User', 'Lifelong angler sharing the stories behind the catch')
ON CONFLICT (email) DO NOTHING;

-- Insert sample QR slugs
INSERT INTO qr_slugs (slug, title, description, is_claimed) VALUES
('mountain-sunrise-demo', 'Mountain Sunrise Adventure', 'A beautiful morning hike capturing the perfect sunrise', true),
('family-fishing-trip', 'Family Fishing Memories', 'Three generations sharing fishing stories', true),
('graduation-memories-2024', 'Graduation Day 2024', 'Celebrating this milestone achievement', true),
('wedding-celebration', 'Wedding Day Memories', 'The most beautiful day of our lives', true),
('available-tag-001', 'Available Tag', 'This tag is available for claiming', false)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample packages for inventory management
INSERT INTO packages (package_name, product_type, total_codes, status) VALUES
('Holiday Bundle 2024', 'premium', 50, 'available'),
('Spring Collection', 'essential', 100, 'available'),
('Corporate Package A', 'premium', 25, 'in_store'),
('Retail Starter Pack', 'essential', 75, 'partially_sold')
ON CONFLICT DO NOTHING;

-- Insert sample orders
INSERT INTO orders (customer_email, customer_name, plan_type, quantity, total_amount, status) VALUES
('customer1@example.com', 'John Smith', 'premium', 2, 59.98, 'confirmed'),
('customer2@example.com', 'Sarah Johnson', 'essential', 1, 19.99, 'manufacturing'),
('customer3@example.com', 'Mike Wilson', 'premium', 3, 89.97, 'shipped')
ON CONFLICT DO NOTHING;

-- Add table comments for documentation
COMMENT ON TABLE profiles IS 'User profiles and account information';
COMMENT ON TABLE qr_slugs IS 'QR code slugs that link to stories/collections';
COMMENT ON TABLE stories IS 'Story collections linked to QR codes';
COMMENT ON TABLE memories IS 'Individual memories (photos, videos, stories) within collections';
COMMENT ON TABLE orders IS 'Customer orders for QR tags';
COMMENT ON TABLE order_items IS 'Individual items within orders';
COMMENT ON TABLE stores IS 'Retail stores for future phases';
COMMENT ON TABLE packages IS 'Groups of QR codes from manufacturer CSV imports';
COMMENT ON TABLE qr_inventory IS 'Individual QR codes linked to packages and existing slug system';
COMMENT ON TABLE csv_import_logs IS 'Track CSV import history and errors';
COMMENT ON TABLE comments IS 'Guest comments on stories';
COMMENT ON TABLE privacy_settings IS 'User privacy preferences';
COMMENT ON TABLE analytics_events IS 'Analytics and tracking events';
