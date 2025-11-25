-- Populate custom fields for Fishing Memories theme
DO $$
DECLARE
  fishing_theme_id UUID;
BEGIN
  -- Fixed theme name from 'Fishing Expeditions' to 'Fishing Memories'
  SELECT id INTO fishing_theme_id
  FROM themes
  WHERE name = 'Fishing Memories'
  LIMIT 1;

  -- Only proceed if theme exists
  IF fishing_theme_id IS NOT NULL THEN
    -- Delete existing custom fields for this theme to avoid duplicates
    DELETE FROM theme_custom_fields WHERE theme_id = fishing_theme_id;

    -- Insert custom fields for fishing
    INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, field_placeholder, is_required, display_order)
    VALUES
      (fishing_theme_id, 'fish_species', 'Fish Species', 'text', 'e.g., Largemouth Bass, Rainbow Trout, Marlin', true, 1),
      (fishing_theme_id, 'catch_location', 'Catch Location', 'text', 'e.g., Lake Tahoe, Gulf of Mexico', true, 2),
      (fishing_theme_id, 'catch_date', 'Catch Date', 'date', NULL, true, 3),
      (fishing_theme_id, 'fish_weight', 'Weight', 'text', 'e.g., 5 lbs 8 oz, 2.5 kg', false, 4),
      (fishing_theme_id, 'fish_length', 'Length', 'text', 'e.g., 24 inches, 61 cm', false, 5),
      (fishing_theme_id, 'water_type', 'Water Type', 'select', NULL, false, 6),
      (fishing_theme_id, 'fishing_method', 'Fishing Method', 'select', NULL, false, 7),
      (fishing_theme_id, 'bait_lure_used', 'Bait/Lure Used', 'text', 'e.g., Crankbait, Live Minnow, Spinnerbait', false, 8),
      (fishing_theme_id, 'water_temperature', 'Water Temperature', 'text', 'e.g., 68°F, 20°C', false, 9),
      (fishing_theme_id, 'weather_conditions', 'Weather Conditions', 'text', 'e.g., Sunny, 75°F, Calm waters', false, 10),
      (fishing_theme_id, 'fishing_notes', 'Additional Notes', 'textarea', 'Share your fishing story...', false, 11);

    -- Updated field_options format to use proper JSON object structure
    UPDATE theme_custom_fields
    SET field_options = '{"options": ["Freshwater Lake", "River/Stream", "Saltwater Ocean", "Saltwater Bay", "Pond", "Reservoir"]}'::jsonb
    WHERE theme_id = fishing_theme_id AND field_name = 'water_type';

    UPDATE theme_custom_fields
    SET field_options = '{"options": ["Fly Fishing", "Spin Casting", "Bait Casting", "Trolling", "Ice Fishing", "Shore Fishing", "Boat Fishing"]}'::jsonb
    WHERE theme_id = fishing_theme_id AND field_name = 'fishing_method';

    RAISE NOTICE 'Successfully added custom fields for Fishing Memories theme';
  ELSE
    RAISE NOTICE 'Fishing Memories theme not found';
  END IF;
END $$;
