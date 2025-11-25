-- Populate custom fields for Custom Collection theme
DO $$
DECLARE
    custom_theme_id uuid;
BEGIN
    -- Get the Custom Collection theme ID
    SELECT id INTO custom_theme_id
    FROM themes
    WHERE name = 'Custom Collection'
    LIMIT 1;

    -- Only proceed if theme exists
    IF custom_theme_id IS NOT NULL THEN
        -- Delete existing fields for this theme to avoid duplicates
        DELETE FROM theme_custom_fields WHERE theme_id = custom_theme_id;

        -- Insert generic custom fields that work for any collection type
        INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, field_placeholder, is_required, display_order) VALUES
        (custom_theme_id, 'item_name', 'Item Name', 'text', 'Name or title of this item', false, 1),
        (custom_theme_id, 'category', 'Category', 'text', 'What category does this belong to?', false, 2),
        (custom_theme_id, 'date_acquired', 'Date Acquired', 'date', 'When did you get this?', false, 3),
        (custom_theme_id, 'location', 'Location', 'text', 'Where is this from?', false, 4),
        (custom_theme_id, 'condition', 'Condition', 'select', NULL, false, 5),
        (custom_theme_id, 'value', 'Estimated Value', 'text', 'Optional value or price', false, 6),
        (custom_theme_id, 'rarity', 'Rarity', 'select', NULL, false, 7),
        (custom_theme_id, 'description', 'Description', 'textarea', 'Describe this item...', false, 8),
        (custom_theme_id, 'special_features', 'Special Features', 'text', 'What makes this special?', false, 9),
        (custom_theme_id, 'custom_notes', 'Additional Notes', 'textarea', 'Any other details...', false, 10);

        -- Add options for select fields
        UPDATE theme_custom_fields
        SET field_options = '{"options": ["Mint", "Excellent", "Very Good", "Good", "Fair", "Poor"]}'::jsonb
        WHERE theme_id = custom_theme_id AND field_name = 'condition';

        UPDATE theme_custom_fields
        SET field_options = '{"options": ["Common", "Uncommon", "Rare", "Very Rare", "Extremely Rare", "One of a Kind"]}'::jsonb
        WHERE theme_id = custom_theme_id AND field_name = 'rarity';

        RAISE NOTICE 'Successfully added custom fields for Custom Collection theme';
    ELSE
        RAISE NOTICE 'Custom Collection theme not found';
    END IF;
END $$;
