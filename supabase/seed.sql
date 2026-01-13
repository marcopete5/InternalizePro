-- Seed data for development
-- Note: This requires a test user to be created first via auth

-- This seed file is a template. To use:
-- 1. Create a user via the Supabase Auth UI or API
-- 2. Replace 'YOUR_USER_ID' with the actual user UUID
-- 3. Run: supabase db seed

-- Example seed (uncomment and update USER_ID after creating a test user):

/*
-- Test user ID (replace with actual UUID after signup)
DO $$
DECLARE
    test_user_id UUID := 'YOUR_USER_ID_HERE';
    deck1_id UUID;
    deck2_id UUID;
BEGIN
    -- Create test decks
    INSERT INTO decks (id, user_id, name, description, color)
    VALUES
        (gen_random_uuid(), test_user_id, 'Spanish Vocabulary', 'Common Spanish words and phrases', '#ef4444')
    RETURNING id INTO deck1_id;

    INSERT INTO decks (id, user_id, name, description, color)
    VALUES
        (gen_random_uuid(), test_user_id, 'Biology 101', 'Fundamental biology concepts', '#22c55e')
    RETURNING id INTO deck2_id;

    -- Create test cards for Spanish deck
    INSERT INTO cards (deck_id, user_id, card_type, front, back)
    VALUES
        (deck1_id, test_user_id, 'basic', 'Hello', 'Hola'),
        (deck1_id, test_user_id, 'basic', 'Goodbye', 'Adiós'),
        (deck1_id, test_user_id, 'basic', 'Thank you', 'Gracias'),
        (deck1_id, test_user_id, 'basic', 'Please', 'Por favor'),
        (deck1_id, test_user_id, 'basic', 'Yes', 'Sí'),
        (deck1_id, test_user_id, 'basic', 'No', 'No'),
        (deck1_id, test_user_id, 'basic', 'Good morning', 'Buenos días'),
        (deck1_id, test_user_id, 'basic', 'Good night', 'Buenas noches'),
        (deck1_id, test_user_id, 'basic', 'How are you?', '¿Cómo estás?'),
        (deck1_id, test_user_id, 'basic', 'I am fine', 'Estoy bien');

    -- Create test cards for Biology deck
    INSERT INTO cards (deck_id, user_id, card_type, front, back)
    VALUES
        (deck2_id, test_user_id, 'basic', 'What is the powerhouse of the cell?', 'Mitochondria'),
        (deck2_id, test_user_id, 'basic', 'What is DNA?', 'Deoxyribonucleic acid - carries genetic information'),
        (deck2_id, test_user_id, 'concept', 'Explain photosynthesis in your own words', 'The process by which plants convert sunlight, water, and CO2 into glucose and oxygen'),
        (deck2_id, test_user_id, 'basic', 'What is the cell membrane made of?', 'Phospholipid bilayer with embedded proteins'),
        (deck2_id, test_user_id, 'application', 'If a cell has no mitochondria, what would happen?', 'The cell would not be able to produce ATP efficiently and would likely die or rely on anaerobic respiration');

    RAISE NOTICE 'Seed data created successfully!';
END $$;
*/

-- Simple test to verify seed file loads
SELECT 'Seed file loaded successfully. Uncomment the data section and add a user ID to seed test data.' AS message;
