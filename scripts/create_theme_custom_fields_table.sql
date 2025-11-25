-- Create table for theme custom fields
CREATE TABLE IF NOT EXISTS theme_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'textarea')),
  field_options JSONB, -- For select fields, stores array of options
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  placeholder TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_theme_custom_fields_theme_id ON theme_custom_fields(theme_id);
CREATE INDEX IF NOT EXISTS idx_theme_custom_fields_display_order ON theme_custom_fields(display_order);

-- Create table for storing user's custom field values
CREATE TABLE IF NOT EXISTS story_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES theme_custom_fields(id) ON DELETE CASCADE,
  field_value TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(story_id, field_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_story_custom_field_values_story_id ON story_custom_field_values(story_id);
CREATE INDEX IF NOT EXISTS idx_story_custom_field_values_field_id ON story_custom_field_values(field_id);

-- Insert default custom fields for hunting theme
INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'animal_type',
  'Animal Type',
  'text',
  1,
  'e.g., White-tailed Deer, Elk, Turkey'
FROM themes WHERE name = 'Hunting Adventures'
ON CONFLICT DO NOTHING;

INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'tag_type',
  'Tag Type',
  'text',
  2,
  'e.g., Archery, Rifle, Muzzleloader'
FROM themes WHERE name = 'Hunting Adventures'
ON CONFLICT DO NOTHING;

INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'hunt_location',
  'Hunt Location',
  'text',
  3,
  'e.g., Rocky Mountain National Park'
FROM themes WHERE name = 'Hunting Adventures'
ON CONFLICT DO NOTHING;

INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'point_score',
  'Point Score',
  'number',
  4,
  'e.g., 10'
FROM themes WHERE name = 'Hunting Adventures'
ON CONFLICT DO NOTHING;

INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'weight',
  'Weight (lbs)',
  'number',
  5,
  'e.g., 180'
FROM themes WHERE name = 'Hunting Adventures'
ON CONFLICT DO NOTHING;

INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'distance_hiked',
  'Distance Hiked (miles)',
  'number',
  6,
  'e.g., 5.2'
FROM themes WHERE name = 'Hunting Adventures'
ON CONFLICT DO NOTHING;

-- Insert default custom fields for fishing theme
INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'fish_species',
  'Fish Species',
  'text',
  1,
  'e.g., Largemouth Bass, Rainbow Trout'
FROM themes WHERE name = 'Fishing Memories'
ON CONFLICT DO NOTHING;

INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'fish_weight',
  'Weight (lbs)',
  'number',
  2,
  'e.g., 8.5'
FROM themes WHERE name = 'Fishing Memories'
ON CONFLICT DO NOTHING;

INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'fish_length',
  'Length (inches)',
  'number',
  3,
  'e.g., 24'
FROM themes WHERE name = 'Fishing Memories'
ON CONFLICT DO NOTHING;

INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'water_body',
  'Water Body',
  'text',
  4,
  'e.g., Crystal Lake, Colorado River'
FROM themes WHERE name = 'Fishing Memories'
ON CONFLICT DO NOTHING;

INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, display_order, placeholder)
SELECT 
  id,
  'lure_bait',
  'Lure/Bait Used',
  'text',
  5,
  'e.g., Crankbait, Live Worms'
FROM themes WHERE name = 'Fishing Memories'
ON CONFLICT DO NOTHING;
