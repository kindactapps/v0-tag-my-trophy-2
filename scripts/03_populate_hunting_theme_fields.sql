-- Populate custom fields for Hunting Adventures theme
DO $$
DECLARE
  hunting_theme_id UUID;
BEGIN
  -- Get the hunting theme ID
  SELECT id INTO hunting_theme_id
  FROM themes
  WHERE name = 'Hunting Adventures'
  LIMIT 1;

  -- Only proceed if theme exists
  IF hunting_theme_id IS NOT NULL THEN
    -- Delete existing custom fields for this theme to avoid duplicates
    DELETE FROM theme_custom_fields WHERE theme_id = hunting_theme_id;

    -- Insert custom fields for hunting
    INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, field_placeholder, is_required, display_order)
    VALUES
      (hunting_theme_id, 'animal_type', 'Animal Type', 'text', 'e.g., White-tailed Deer, Elk, Turkey', true, 1),
      (hunting_theme_id, 'tag_type', 'Tag Type', 'select', NULL, false, 2),
      (hunting_theme_id, 'hunt_location', 'Hunt Location', 'text', 'e.g., Colorado Rockies, Texas Hill Country', true, 3),
      (hunting_theme_id, 'hunt_date', 'Hunt Date', 'date', NULL, true, 4),
      (hunting_theme_id, 'weight', 'Weight', 'text', 'e.g., 180 lbs, 8 kg', false, 5),
      (hunting_theme_id, 'point_score', 'Point Score', 'text', 'e.g., 8-point, 10-point', false, 6),
      (hunting_theme_id, 'distance_hiked', 'Distance Hiked', 'text', 'e.g., 5 miles, 8 km', false, 7),
      (hunting_theme_id, 'weapon_used', 'Weapon Used', 'select', NULL, false, 8),
      (hunting_theme_id, 'hunting_method', 'Hunting Method', 'select', NULL, false, 9),
      (hunting_theme_id, 'weather_conditions', 'Weather Conditions', 'text', 'e.g., Clear, 45°F, Light wind', false, 10),
      (hunting_theme_id, 'hunting_notes', 'Additional Notes', 'textarea', 'Share your hunting story...', false, 11);

    -- Update field options for select fields
    UPDATE theme_custom_fields
    SET field_options = '{"options": ["Archery Tag", "Rifle Tag", "Muzzleloader Tag", "General Season", "Limited Entry", "Over-the-Counter"]}'::jsonb
    WHERE theme_id = hunting_theme_id AND field_name = 'tag_type';

    UPDATE theme_custom_fields
    SET field_options = '{"options": ["Rifle", "Bow", "Crossbow", "Muzzleloader", "Shotgun"]}'::jsonb
    WHERE theme_id = hunting_theme_id AND field_name = 'weapon_used';

    UPDATE theme_custom_fields
    SET field_options = '{"options": ["Spot and Stalk", "Tree Stand", "Ground Blind", "Still Hunting", "Calling", "Tracking"]}'::jsonb
    WHERE theme_id = hunting_theme_id AND field_name = 'hunting_method';

    RAISE NOTICE 'Successfully added custom fields for Hunting Adventures theme';
  ELSE
    RAISE NOTICE 'Hunting Adventures theme not found';
  END IF;
END $$;
