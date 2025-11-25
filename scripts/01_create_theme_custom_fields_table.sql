-- Added DROP statements before all CREATE statements to prevent "already exists" errors

-- Drop existing tables if they exist
DROP TABLE IF EXISTS story_custom_field_values CASCADE;
DROP TABLE IF EXISTS theme_custom_fields CASCADE;

-- Create table for theme custom fields
CREATE TABLE theme_custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES themes(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'textarea', 'select')),
  field_placeholder TEXT,
  field_options JSONB,
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for storing user's custom field values
CREATE TABLE story_custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug_id UUID NOT NULL REFERENCES qr_slugs(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES theme_custom_fields(id) ON DELETE CASCADE,
  field_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug_id, field_id)
);

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_theme_custom_fields_theme_id;
DROP INDEX IF EXISTS idx_theme_custom_fields_display_order;
DROP INDEX IF EXISTS idx_story_custom_field_values_slug_id;
DROP INDEX IF EXISTS idx_story_custom_field_values_field_id;

-- Create indexes for better query performance
CREATE INDEX idx_theme_custom_fields_theme_id ON theme_custom_fields(theme_id);
CREATE INDEX idx_theme_custom_fields_display_order ON theme_custom_fields(theme_id, display_order);
CREATE INDEX idx_story_custom_field_values_slug_id ON story_custom_field_values(slug_id);
CREATE INDEX idx_story_custom_field_values_field_id ON story_custom_field_values(field_id);

-- Add RLS policies
ALTER TABLE theme_custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_custom_field_values ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view theme custom fields" ON theme_custom_fields;
DROP POLICY IF EXISTS "Admins can manage theme custom fields" ON theme_custom_fields;
DROP POLICY IF EXISTS "Users can view their own custom field values" ON story_custom_field_values;
DROP POLICY IF EXISTS "Users can manage their own custom field values" ON story_custom_field_values;
DROP POLICY IF EXISTS "Public can view custom field values for active slugs" ON story_custom_field_values;

-- Allow everyone to read theme custom fields
CREATE POLICY "Anyone can view theme custom fields"
  ON theme_custom_fields FOR SELECT
  USING (true);

-- Allow admins to manage theme custom fields
CREATE POLICY "Admins can manage theme custom fields"
  ON theme_custom_fields FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = current_setting('app.admin_email', true)
    )
  );

-- Allow users to view their own custom field values
CREATE POLICY "Users can view their own custom field values"
  ON story_custom_field_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qr_slugs
      WHERE qr_slugs.id = story_custom_field_values.slug_id
      AND qr_slugs.owner_id = auth.uid()
    )
  );

-- Allow users to manage their own custom field values
CREATE POLICY "Users can manage their own custom field values"
  ON story_custom_field_values FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM qr_slugs
      WHERE qr_slugs.id = story_custom_field_values.slug_id
      AND qr_slugs.owner_id = auth.uid()
    )
  );

-- Allow public to view custom field values for active slugs
CREATE POLICY "Public can view custom field values for active slugs"
  ON story_custom_field_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM qr_slugs
      WHERE qr_slugs.id = story_custom_field_values.slug_id
      AND qr_slugs.is_active = true
    )
  );
