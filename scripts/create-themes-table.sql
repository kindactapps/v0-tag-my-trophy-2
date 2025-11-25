-- Drop existing objects to allow re-running this script
DROP TRIGGER IF EXISTS update_themes_updated_at ON themes;
DROP INDEX IF EXISTS idx_themes_active;
DROP INDEX IF EXISTS idx_themes_display_order;

-- Create themes table for dynamic theme management
CREATE TABLE IF NOT EXISTS themes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  preview_image_url text,
  hero_background_url text,
  primary_color text NOT NULL,
  secondary_color text NOT NULL,
  text_color text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  usage_count integer DEFAULT 0,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create index for active themes
CREATE INDEX IF NOT EXISTS idx_themes_active ON themes(is_active);
CREATE INDEX IF NOT EXISTS idx_themes_display_order ON themes(display_order);

-- Create trigger for updated_at
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default themes based on existing hardcoded themes
INSERT INTO themes (name, description, primary_color, secondary_color, text_color, is_active, display_order) VALUES
('Hunting Adventures', 'Track your hunting trips and trophy collections', '#4b5563', '#f97316', '#ffffff', true, 1),
('Fishing Memories', 'Document your fishing adventures and catches', '#059669', '#14b8a6', '#ffffff', true, 2),
('Sports Achievements', 'Celebrate your athletic accomplishments', '#ea580c', '#fbbf24', '#ffffff', true, 3),
('Travel Stories', 'Share your vacation and travel experiences', '#2563eb', '#3b82f6', '#ffffff', true, 4),
('Custom Collection', 'Create your own personalized theme', '#9333ea', '#a855f7', '#ffffff', true, 5)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE themes IS 'Dynamic theme management for user profile customization';
