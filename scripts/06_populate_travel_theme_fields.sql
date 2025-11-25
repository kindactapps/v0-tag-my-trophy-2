-- Populate custom fields for Travel Stories theme
DO $$
DECLARE
    travel_theme_id uuid;
BEGIN
    -- Get the Travel Stories theme ID
    SELECT id INTO travel_theme_id
    FROM themes
    WHERE name = 'Travel Stories'
    LIMIT 1;

    -- Only proceed if theme exists
    IF travel_theme_id IS NOT NULL THEN
        -- Delete existing fields for this theme to avoid duplicates
        DELETE FROM theme_custom_fields WHERE theme_id = travel_theme_id;

        -- Insert custom fields for travel theme
        INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, field_placeholder, is_required, display_order) VALUES
        (travel_theme_id, 'destination', 'Destination', 'text', 'City, Country, or Region', false, 1),
        (travel_theme_id, 'trip_type', 'Trip Type', 'select', NULL, false, 2),
        (travel_theme_id, 'travel_dates', 'Travel Dates', 'text', 'e.g., June 15-22, 2024', false, 3),
        (travel_theme_id, 'duration', 'Duration (days)', 'number', 'How many days?', false, 4),
        (travel_theme_id, 'travel_companions', 'Travel Companions', 'text', 'Who did you travel with?', false, 5),
        (travel_theme_id, 'accommodation', 'Accommodation', 'text', 'Hotel, Resort, Airbnb, etc.', false, 6),
        (travel_theme_id, 'highlights', 'Trip Highlights', 'textarea', 'Best moments and experiences', false, 7),
        (travel_theme_id, 'favorite_activity', 'Favorite Activity', 'text', 'What did you enjoy most?', false, 8),
        (travel_theme_id, 'local_cuisine', 'Local Cuisine Tried', 'text', 'Memorable foods or restaurants', false, 9),
        (travel_theme_id, 'budget', 'Approximate Budget', 'text', 'Optional budget range', false, 10),
        (travel_theme_id, 'travel_notes', 'Additional Notes', 'textarea', 'Share your travel story...', false, 11);

        -- Add options for trip type select field
        UPDATE theme_custom_fields
        SET field_options = '{"options": ["Beach Vacation", "City Break", "Adventure Travel", "Cultural Tour", "Road Trip", "Cruise", "Backpacking", "Luxury Getaway", "Family Vacation"]}'::jsonb
        WHERE theme_id = travel_theme_id AND field_name = 'trip_type';

        RAISE NOTICE 'Successfully added custom fields for Travel Stories theme';
    ELSE
        RAISE NOTICE 'Travel Stories theme not found';
    END IF;
END $$;
