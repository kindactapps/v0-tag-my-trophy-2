-- Deploy Complete Database Schema for Tag My Trophy
-- This replaces the incomplete current schema with the full system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing incomplete tables (backup data first if needed)
-- Note: This will preserve existing data in profiles, orders, order_items
-- The inventory table will be replaced with proper qr_inventory system

-- Core user profiles table (already exists, but ensure proper structure)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  bio text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- QR slugs table (MISSING - core functionality)
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

-- Stories/Collections table (MISSING)
CREATE TABLE IF NOT EXISTS stories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug_id uuid REFERENCES qr_slugs(id) NOT NULL,
  owner_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text,
  cover_image_url text,
  theme text DEFAULT 'custom' CHECK (theme IN ('hunting', 'fishing', 'sports', 'vacation', 'custom')),
  is_public boolean DEFAULT true,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Memories table (MISSING - photos, videos, text stories)
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

-- Media tracking table (MISSING)
CREATE TABLE IF NOT EXISTS media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_id uuid REFERENCES memories(id) NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  file_type text NOT NULL,
  storage_url text NOT NULL,
  thumbnail_url text,
  metadata jsonb, -- EXIF data, dimensions, etc.
  uploaded_by uuid REFERENCES profiles(id),
  created_at timestamp DEFAULT now()
);

-- QR scan tracking (MISSING)
CREATE TABLE IF NOT EXISTS qr_scans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_slug_id uuid REFERENCES qr_slugs(id) NOT NULL,
  scanned_by uuid REFERENCES profiles(id), -- null for anonymous scans
  ip_address inet,
  user_agent text,
  location_data jsonb, -- GPS coordinates, city, etc.
  referrer text,
  created_at timestamp DEFAULT now()
);

-- Trophy tagging events (MISSING)
CREATE TABLE IF NOT EXISTS trophy_tags (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_slug_id uuid REFERENCES qr_slugs(id) NOT NULL,
  tagged_by uuid REFERENCES profiles(id),
  trophy_type text, -- 'hunting', 'fishing', 'sports', etc.
  trophy_details jsonb, -- species, weight, location, etc.
  location_data jsonb, -- GPS coordinates
  tagged_at timestamp DEFAULT now(),
  created_at timestamp DEFAULT now()
);

-- Update existing orders table to match expected structure
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS plan_type text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customization_details jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_tracking text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes text;

-- Packages table (MISSING - groups of QR codes from manufacturer)
CREATE TABLE IF NOT EXISTS packages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  package_name text NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('essential', 'premium')),
  total_codes integer NOT NULL DEFAULT 0,
  status text DEFAULT 'available' CHECK (status IN ('available', 'in_store', 'partially_sold', 'fully_sold')),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- QR inventory table (MISSING - replaces current inventory table)
CREATE TABLE IF NOT EXISTS qr_inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id text UNIQUE NOT NULL, -- from manufacturer CSV
  slug text UNIQUE NOT NULL, -- links to qr_slugs table
  package_id uuid REFERENCES packages(id) NOT NULL,
  product_type text NOT NULL CHECK (product_type IN ('essential', 'premium')),
  status text DEFAULT 'available' CHECK (status IN ('available', 'in_store', 'claimed', 'sold')),
  claimed_by uuid REFERENCES profiles(id),
  claimed_at timestamp,
  price numeric(10,2),
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- CSV import logs table (MISSING)
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

-- Comments table (MISSING - for guest comments on stories)
CREATE TABLE IF NOT EXISTS comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id uuid REFERENCES stories(id) NOT NULL,
  author_name text NOT NULL,
  author_email text,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamp DEFAULT now()
);

-- Privacy settings table (MISSING)
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

-- Analytics events table (MISSING)
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
CREATE INDEX IF NOT EXISTS idx_media_memory ON media(memory_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_slug ON qr_scans(qr_slug_id);
CREATE INDEX IF NOT EXISTS idx_trophy_tags_slug ON trophy_tags(qr_slug_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_qr_inventory_package ON qr_inventory(package_id);
CREATE INDEX IF NOT EXISTS idx_qr_inventory_status ON qr_inventory(status);
CREATE INDEX IF NOT EXISTS idx_qr_inventory_slug ON qr_inventory(slug);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_comments_story ON comments(story_id);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user ON privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_story ON analytics_events(story_id);

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_slugs_updated_at BEFORE UPDATE ON qr_slugs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_inventory_updated_at BEFORE UPDATE ON qr_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at BEFORE UPDATE ON privacy_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO qr_slugs (slug, title, description, is_claimed) VALUES
('river-adventure-x7k9', 'Jake''s Fishing Adventures', 'Lifelong angler sharing the stories behind the catch', true),
('tigers-soccer-2024', 'Emma''s Soccer Season 2024', 'Midfielder #12 for the Tigers - this season was magical', true),
('mountain-journey-b3m5', 'Emma''s Mountain Adventures', 'Exploring Colorado''s peaks one trail at a time', true),
('meadow-celebration-q8w2', 'Johnson Family Reunion', 'Five generations coming together in Colorado', true),
('graduation-memories-2024', 'Sarah''s Graduation Journey', 'From freshman fears to senior year success', true),
('unclaimed-adventure-abc123', 'Unclaimed Adventure', 'This tag is waiting to be claimed', false)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample packages
INSERT INTO packages (package_name, product_type, total_codes, status) VALUES
('Holiday Bundle 2024', 'premium', 50, 'available'),
('Spring Collection', 'essential', 100, 'available'),
('Corporate Package A', 'premium', 25, 'in_store'),
('Retail Starter Pack', 'essential', 75, 'partially_sold')
ON CONFLICT DO NOTHING;

-- Add role column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin'));

-- Update admin user role
UPDATE profiles SET role = 'admin' WHERE email = 'admin@tagmytrophy.com';

-- Add table comments for documentation
COMMENT ON TABLE qr_slugs IS 'QR code slugs that link to stories/collections';
COMMENT ON TABLE stories IS 'Story collections linked to QR codes';
COMMENT ON TABLE memories IS 'Individual memories (photos, videos, stories) within collections';
COMMENT ON TABLE media IS 'File tracking for uploaded media';
COMMENT ON TABLE qr_scans IS 'Track QR code scan events and analytics';
COMMENT ON TABLE trophy_tags IS 'Track trophy tagging events with location data';
COMMENT ON TABLE packages IS 'Groups of QR codes from manufacturer CSV imports';
COMMENT ON TABLE qr_inventory IS 'Individual QR codes linked to packages';
COMMENT ON TABLE csv_import_logs IS 'Track CSV import history and errors';
COMMENT ON TABLE comments IS 'Guest comments on stories';
COMMENT ON TABLE privacy_settings IS 'User privacy preferences';
COMMENT ON TABLE analytics_events IS 'Analytics and tracking events';
