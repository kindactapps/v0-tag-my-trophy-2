-- Populate custom fields for Sports Achievements theme
DO $$
DECLARE
    sports_theme_id uuid;
BEGIN
    -- Get the Sports Achievements theme ID
    SELECT id INTO sports_theme_id
    FROM themes
    WHERE name = 'Sports Achievements'
    LIMIT 1;

    -- Only proceed if theme exists
    IF sports_theme_id IS NOT NULL THEN
        -- Delete existing fields for this theme to avoid duplicates
        DELETE FROM theme_custom_fields WHERE theme_id = sports_theme_id;

        -- Insert custom fields for sports theme
        INSERT INTO theme_custom_fields (theme_id, field_name, field_label, field_type, field_placeholder, is_required, display_order) VALUES
        (sports_theme_id, 'sport_type', 'Sport Type', 'text', 'e.g., Basketball, Soccer, Baseball', false, 1),
        (sports_theme_id, 'achievement_type', 'Achievement Type', 'select', NULL, false, 2),
        (sports_theme_id, 'event_name', 'Event/Game Name', 'text', 'Championship, Tournament, etc.', false, 3),
        (sports_theme_id, 'date', 'Date', 'date', 'When did this happen?', false, 4),
        (sports_theme_id, 'location', 'Location/Venue', 'text', 'Where did this take place?', false, 5),
        (sports_theme_id, 'team_name', 'Team Name', 'text', 'Your team name', false, 6),
        (sports_theme_id, 'opponent', 'Opponent', 'text', 'Who did you compete against?', false, 7),
        (sports_theme_id, 'final_score', 'Final Score', 'text', 'e.g., 3-2, 98-95', false, 8),
        (sports_theme_id, 'personal_stats', 'Personal Stats', 'text', 'Points, goals, assists, etc.', false, 9),
        (sports_theme_id, 'position', 'Position Played', 'text', 'Your position', false, 10),
        (sports_theme_id, 'sports_notes', 'Additional Notes', 'textarea', 'Share your sports story...', false, 11);

        -- Add options for achievement type select field
        UPDATE theme_custom_fields
        SET field_options = '{"options": ["Championship Win", "Tournament Victory", "Personal Record", "Team Award", "Individual Award", "Milestone Achievement", "Perfect Game/Match"]}'::jsonb
        WHERE theme_id = sports_theme_id AND field_name = 'achievement_type';

        RAISE NOTICE 'Successfully added custom fields for Sports Achievements theme';
    ELSE
        RAISE NOTICE 'Sports Achievements theme not found';
    END IF;
END $$;
