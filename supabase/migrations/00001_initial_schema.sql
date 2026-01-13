-- InternalizePro Initial Schema
-- Version: 1.0.0
-- Description: Creates all tables for the flashcard and spaced repetition system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
-- ============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    daily_review_goal INTEGER DEFAULT 20 CHECK (daily_review_goal >= 1 AND daily_review_goal <= 500),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- DECKS TABLE
-- Collections of cards
-- ============================================
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
    color TEXT DEFAULT '#6366f1' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    is_archived BOOLEAN DEFAULT FALSE,
    card_count INTEGER DEFAULT 0 CHECK (card_count >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching user's decks
CREATE INDEX idx_decks_user ON decks(user_id);

-- ============================================
-- CARDS TABLE
-- Individual flashcards with FSRS scheduling state
-- ============================================
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Content
    card_type TEXT NOT NULL DEFAULT 'basic' CHECK (card_type IN ('basic', 'cloze', 'concept', 'application')),
    front TEXT NOT NULL CHECK (char_length(front) >= 1),
    back TEXT NOT NULL CHECK (char_length(back) >= 1),
    notes TEXT,

    -- Media
    front_image_url TEXT,
    back_image_url TEXT,

    -- FSRS State
    stability REAL DEFAULT 0 CHECK (stability >= 0),
    difficulty REAL DEFAULT 0 CHECK (difficulty >= 0 AND difficulty <= 10),
    elapsed_days INTEGER DEFAULT 0 CHECK (elapsed_days >= 0),
    scheduled_days INTEGER DEFAULT 0 CHECK (scheduled_days >= 0),
    reps INTEGER DEFAULT 0 CHECK (reps >= 0),
    lapses INTEGER DEFAULT 0 CHECK (lapses >= 0),
    state TEXT DEFAULT 'new' CHECK (state IN ('new', 'learning', 'review', 'relearning')),
    last_review TIMESTAMPTZ,
    due TIMESTAMPTZ DEFAULT NOW(),

    -- Quality scoring (AI-generated)
    quality_score REAL CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 1)),
    quality_feedback TEXT,

    -- Metadata
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_cards_deck ON cards(deck_id);
CREATE INDEX idx_cards_user_due ON cards(user_id, due) WHERE NOT is_suspended;
CREATE INDEX idx_cards_state ON cards(user_id, state) WHERE NOT is_suspended;

-- ============================================
-- REVIEW LOGS TABLE
-- History of all reviews for analytics
-- ============================================
CREATE TABLE review_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Review data
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4),
    confidence INTEGER CHECK (confidence IS NULL OR (confidence >= 1 AND confidence <= 5)),
    response_time_ms INTEGER CHECK (response_time_ms IS NULL OR response_time_ms >= 0),

    -- FSRS state snapshot (before this review)
    stability_before REAL,
    difficulty_before REAL,
    state_before TEXT CHECK (state_before IS NULL OR state_before IN ('new', 'learning', 'review', 'relearning')),

    -- Scheduling
    scheduled_days INTEGER NOT NULL CHECK (scheduled_days >= 0),
    elapsed_days INTEGER NOT NULL CHECK (elapsed_days >= 0),

    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for review history queries
CREATE INDEX idx_review_logs_card ON review_logs(card_id);
CREATE INDEX idx_review_logs_user_date ON review_logs(user_id, reviewed_at);

-- ============================================
-- CONNECTIONS TABLE
-- Links between cards for schema building
-- ============================================
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source_card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    target_card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,

    connection_type TEXT DEFAULT 'related' CHECK (connection_type IN ('related', 'prerequisite', 'example', 'contrast')),
    description TEXT CHECK (description IS NULL OR char_length(description) <= 500),
    strength REAL DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_connection UNIQUE(source_card_id, target_card_id),
    CONSTRAINT no_self_connection CHECK (source_card_id != target_card_id)
);

-- Indexes for graph queries
CREATE INDEX idx_connections_source ON connections(source_card_id);
CREATE INDEX idx_connections_target ON connections(target_card_id);
CREATE INDEX idx_connections_user ON connections(user_id);

-- ============================================
-- ELABORATIONS TABLE
-- User explanations for deeper learning
-- ============================================
CREATE TABLE elaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    prompt TEXT NOT NULL CHECK (char_length(prompt) >= 1),
    response TEXT NOT NULL CHECK (char_length(response) >= 1),

    ai_feedback TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_elaborations_card ON elaborations(card_id);
CREATE INDEX idx_elaborations_user ON elaborations(user_id);

-- ============================================
-- STUDY SESSIONS TABLE
-- Tracking study sessions for analytics
-- ============================================
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    deck_id UUID REFERENCES decks(id) ON DELETE SET NULL,

    cards_reviewed INTEGER DEFAULT 0 CHECK (cards_reviewed >= 0),
    cards_new INTEGER DEFAULT 0 CHECK (cards_new >= 0),
    cards_relearning INTEGER DEFAULT 0 CHECK (cards_relearning >= 0),

    duration_seconds INTEGER CHECK (duration_seconds IS NULL OR duration_seconds >= 0),

    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE INDEX idx_study_sessions_user ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_date ON study_sessions(user_id, started_at);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to increment deck card count
CREATE OR REPLACE FUNCTION increment_deck_card_count(deck_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE decks SET card_count = card_count + 1, updated_at = NOW() WHERE id = deck_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement deck card count
CREATE OR REPLACE FUNCTION decrement_deck_card_count(deck_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE decks SET card_count = GREATEST(card_count - 1, 0), updated_at = NOW() WHERE id = deck_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update deck card count on card insert
CREATE OR REPLACE FUNCTION update_deck_card_count_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE decks SET card_count = card_count + 1, updated_at = NOW() WHERE id = NEW.deck_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_card_created
    AFTER INSERT ON cards
    FOR EACH ROW EXECUTE FUNCTION update_deck_card_count_on_insert();

-- Trigger to update deck card count on card delete
CREATE OR REPLACE FUNCTION update_deck_card_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE decks SET card_count = GREATEST(card_count - 1, 0), updated_at = NOW() WHERE id = OLD.deck_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_card_deleted
    AFTER DELETE ON cards
    FOR EACH ROW EXECUTE FUNCTION update_deck_card_count_on_delete();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON decks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON cards FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE elaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Decks policies
CREATE POLICY "Users can view own decks"
    ON decks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own decks"
    ON decks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own decks"
    ON decks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own decks"
    ON decks FOR DELETE
    USING (auth.uid() = user_id);

-- Cards policies
CREATE POLICY "Users can view own cards"
    ON cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cards"
    ON cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
    ON cards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
    ON cards FOR DELETE
    USING (auth.uid() = user_id);

-- Review logs policies
CREATE POLICY "Users can view own review logs"
    ON review_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own review logs"
    ON review_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Connections policies
CREATE POLICY "Users can view own connections"
    ON connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own connections"
    ON connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
    ON connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
    ON connections FOR DELETE
    USING (auth.uid() = user_id);

-- Elaborations policies
CREATE POLICY "Users can view own elaborations"
    ON elaborations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own elaborations"
    ON elaborations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own elaborations"
    ON elaborations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own elaborations"
    ON elaborations FOR DELETE
    USING (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can view own study sessions"
    ON study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own study sessions"
    ON study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions"
    ON study_sessions FOR UPDATE
    USING (auth.uid() = user_id);
