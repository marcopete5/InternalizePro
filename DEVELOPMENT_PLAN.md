# InternalizePro Development Plan

> **Last Updated**: 2026-01-12
> **Status**: Phase 1 complete. Vercel deployment in progress - requires dashboard configuration.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Build Phases](#build-phases)
7. [Current Progress](#current-progress)
8. [Next Steps](#next-steps)

---

## Project Overview

**InternalizePro** is a science-backed learning app that goes beyond memorization to help users truly internalize knowledge through:

1. **ACQUIRE** - Efficient encoding with spaced repetition (FSRS algorithm)
2. **CONNECT** - Schema building through elaboration and linking
3. **APPLY** - Transfer practice through varied application

### Core Differentiators
- Evidence-based FSRS spacing algorithm (not SM-2)
- Schema-building features (knowledge graph, connections)
- Application/transfer practice (not just factual recall)
- AI-powered card generation with quality scoring
- Intrinsic motivation design (mastery, not badges)

---

## Architecture Decisions

### Why Monorepo?
- Share 70%+ of code (types, business logic, FSRS algorithm)
- Independent deployment of web and mobile
- Single source of truth for data models
- Easier refactoring across platforms

### Why Next.js for Web (not Expo Web)?
- Best-in-class web experience
- Full SEO for marketing pages
- Better canvas/SVG support for knowledge graph visualization
- Native web APIs and performance

### Why Expo for Mobile (separate from web)?
- Best React Native DX
- Native performance and gestures
- Platform-specific UX optimizations
- EAS for builds and deployment

### Why Supabase?
- Postgres handles relational data well (cards → decks → reviews)
- Built-in auth (email, Google, Apple)
- Real-time subscriptions for sync
- Row-level security
- Edge Functions for AI integration
- Can extract to custom backend later if needed

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Web App** | Next.js 14 (App Router) | Web frontend |
| **Mobile App** | Expo + React Native | iOS & Android |
| **Monorepo** | Turborepo + pnpm | Build orchestration |
| **Language** | TypeScript (strict) | Type safety |
| **Database** | Supabase (Postgres) | Data persistence |
| **Auth** | Supabase Auth | User authentication |
| **AI** | OpenAI API | Card generation, quality scoring |
| **Styling (Web)** | Tailwind CSS + shadcn/ui | Web components |
| **Styling (Mobile)** | NativeWind | Mobile styling |
| **State (Client)** | Zustand | Local/UI state |
| **State (Server)** | TanStack Query | Server state, caching |
| **Validation** | Zod | Schema validation |
| **Edge Functions** | Supabase Edge Functions (Deno) | AI orchestration, complex logic |

---

## Project Structure

```
flite-study/
├── apps/
│   ├── web/                      # Next.js 14 application
│   │   ├── app/                  # App Router pages
│   │   │   ├── (auth)/           # Auth routes (login, signup)
│   │   │   ├── (dashboard)/      # Protected app routes
│   │   │   │   ├── decks/        # Deck management
│   │   │   │   ├── review/       # Review sessions
│   │   │   │   ├── graph/        # Knowledge graph
│   │   │   │   └── settings/     # User settings
│   │   │   ├── api/              # API routes (if needed)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx          # Landing page
│   │   ├── components/           # Web-specific components
│   │   ├── lib/                  # Web-specific utilities
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile/                   # Expo React Native application
│       ├── app/                  # Expo Router pages
│       ├── components/           # Mobile-specific components
│       ├── lib/                  # Mobile-specific utilities
│       ├── app.json
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── shared/                   # Shared business logic
│   │   ├── src/
│   │   │   ├── types/            # TypeScript types & Zod schemas
│   │   │   │   ├── card.ts
│   │   │   │   ├── deck.ts
│   │   │   │   ├── review.ts
│   │   │   │   ├── user.ts
│   │   │   │   └── index.ts
│   │   │   ├── fsrs/             # FSRS algorithm implementation
│   │   │   │   ├── algorithm.ts
│   │   │   │   ├── scheduler.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/            # Shared utilities
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api-client/               # Typed Supabase client
│   │   ├── src/
│   │   │   ├── client.ts         # Supabase client setup
│   │   │   ├── queries/          # Query functions
│   │   │   │   ├── cards.ts
│   │   │   │   ├── decks.ts
│   │   │   │   ├── reviews.ts
│   │   │   │   └── index.ts
│   │   │   ├── mutations/        # Mutation functions
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ui/                       # Shared UI (design tokens, some components)
│   │   ├── src/
│   │   │   ├── tokens/           # Colors, spacing, typography
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── tsconfig/                 # Shared TypeScript configs
│       ├── base.json
│       ├── nextjs.json
│       ├── react-native.json
│       └── package.json
│
├── supabase/
│   ├── migrations/               # Database migrations
│   │   └── 00001_initial_schema.sql
│   ├── functions/                # Edge Functions
│   │   ├── generate-cards/       # AI card generation
│   │   └── score-card/           # Card quality scoring
│   ├── seed.sql                  # Seed data for development
│   └── config.toml
│
├── turbo.json                    # Turborepo configuration
├── pnpm-workspace.yaml           # pnpm workspace config
├── package.json                  # Root package.json
├── .env.example                  # Environment variables template
├── .gitignore
├── DEVELOPMENT_PLAN.md           # This file
└── README.md
```

---

## Database Schema

### Core Tables

```sql
-- Users (managed by Supabase Auth, extended with profile)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    daily_review_goal INTEGER DEFAULT 20,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decks (collections of cards)
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1', -- For UI
    is_archived BOOLEAN DEFAULT FALSE,
    card_count INTEGER DEFAULT 0, -- Denormalized for performance
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cards
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Content
    card_type TEXT NOT NULL DEFAULT 'basic', -- basic, cloze, concept, application
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    notes TEXT, -- Additional context

    -- Media
    front_image_url TEXT,
    back_image_url TEXT,

    -- FSRS State
    stability REAL DEFAULT 0,
    difficulty REAL DEFAULT 0,
    elapsed_days INTEGER DEFAULT 0,
    scheduled_days INTEGER DEFAULT 0,
    reps INTEGER DEFAULT 0,
    lapses INTEGER DEFAULT 0,
    state TEXT DEFAULT 'new', -- new, learning, review, relearning
    last_review TIMESTAMPTZ,
    due TIMESTAMPTZ DEFAULT NOW(),

    -- Quality scoring
    quality_score REAL, -- 0-1, AI-generated
    quality_feedback TEXT, -- Suggestions for improvement

    -- Metadata
    is_suspended BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Review Log (history of all reviews)
CREATE TABLE review_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Review data
    rating INTEGER NOT NULL, -- 1=Again, 2=Hard, 3=Good, 4=Easy
    confidence INTEGER, -- 1-5, self-reported
    response_time_ms INTEGER, -- How long to answer

    -- FSRS state snapshot (before this review)
    stability_before REAL,
    difficulty_before REAL,
    state_before TEXT,

    -- Scheduling
    scheduled_days INTEGER, -- Days until next review
    elapsed_days INTEGER, -- Days since last review

    reviewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections (for schema building)
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    source_card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    target_card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,

    connection_type TEXT DEFAULT 'related', -- related, prerequisite, example, contrast
    description TEXT, -- User's explanation of the connection
    strength REAL DEFAULT 0.5, -- 0-1, can be reinforced through review

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(source_card_id, target_card_id)
);

-- Elaborations (user explanations for deeper learning)
CREATE TABLE elaborations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    prompt TEXT NOT NULL, -- "Why does this work?", "Give an example", etc.
    response TEXT NOT NULL, -- User's response

    ai_feedback TEXT, -- Optional AI evaluation

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Study Sessions (for analytics)
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    deck_id UUID REFERENCES decks(id) ON DELETE SET NULL,

    cards_reviewed INTEGER DEFAULT 0,
    cards_new INTEGER DEFAULT 0,
    cards_relearning INTEGER DEFAULT 0,

    duration_seconds INTEGER,

    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_cards_user_due ON cards(user_id, due) WHERE NOT is_suspended;
CREATE INDEX idx_cards_deck ON cards(deck_id);
CREATE INDEX idx_review_logs_card ON review_logs(card_id);
CREATE INDEX idx_review_logs_user_date ON review_logs(user_id, reviewed_at);
CREATE INDEX idx_connections_source ON connections(source_card_id);
CREATE INDEX idx_connections_target ON connections(target_card_id);
```

### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE elaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can CRUD own decks" ON decks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own cards" ON cards
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own review_logs" ON review_logs
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own connections" ON connections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own elaborations" ON elaborations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own study_sessions" ON study_sessions
    FOR ALL USING (auth.uid() = user_id);
```

---

## Build Phases

### Phase 1: Foundation (Current)
**Goal**: Working flashcard app with FSRS and basic features

- [x] Document development plan
- [x] Scaffold monorepo structure
- [x] Set up Turborepo + pnpm
- [x] Create shared packages (types, FSRS)
- [x] Set up Supabase project
- [x] Create database schema + migrations
- [x] Set up Next.js web app
- [x] Implement authentication (signup, login, logout, password reset)
- [x] Build deck management (CRUD)
- [x] Build card creation (basic Q&A)
- [x] Implement FSRS algorithm
- [x] Build review session UI
- [x] Basic progress dashboard
- [ ] Deploy MVP

### Phase 2: Differentiation
**Goal**: Features that distinguish from competitors

- [ ] AI card generation from text/PDF
- [ ] Card quality scoring
- [ ] Elaboration prompts during review
- [ ] Basic knowledge graph visualization
- [ ] Connection cards
- [ ] Interleaved review mode
- [ ] Enhanced analytics dashboard
- [ ] Mobile app (Expo)

### Phase 3: Transfer & Application
**Goal**: True internalization features

- [ ] Application cards & scenarios
- [ ] Teaching mode with AI evaluation
- [ ] Transfer Gym (varied practice)
- [ ] Case studies / multi-concept problems
- [ ] Advanced schema visualization
- [ ] Prerequisite mapping

### Phase 4: Scale & Polish
**Goal**: Growth features and refinement

- [ ] Social/sharing features
- [ ] Deck marketplace
- [ ] Advanced integrations (Notion, Obsidian)
- [ ] Desktop app (Electron or Tauri)
- [ ] Team/classroom features
- [ ] Premium tier

---

## Current Progress

### Completed
- [x] Initial research and pitch document
- [x] Architecture decisions
- [x] Tech stack selection
- [x] Development plan documentation
- [x] Monorepo scaffolding (Turborepo + pnpm)
- [x] Shared TypeScript configs package
- [x] Shared types package with Zod schemas (Card, Deck, Review, User, Connection)
- [x] FSRS-4.5 algorithm implementation
- [x] API client package (Supabase queries and mutations)
- [x] Next.js web app structure (auth, dashboard, decks, review, settings)
- [x] Supabase config and database migration
- [x] Expo mobile app placeholder
- [x] Dependencies installed (pnpm install)
- [x] All packages type-check successfully
- [x] Dev server runs (pnpm dev:web)

### In Progress
- [ ] Deploy MVP to Vercel (see Deployment Status below)

### Blocked
- Vercel CLI doesn't respect vercel.json installCommand for Turborepo + pnpm monorepos
- Need to configure via Vercel Dashboard or use GitHub integration

---

## Deployment Status

### Current State
Vercel project created (`study-app`) with environment variables configured, but build fails because:
- Vercel CLI auto-detects Next.js framework and uses `npm install` instead of pnpm
- The `vercel.json` installCommand is ignored when framework is auto-detected
- Turborepo + pnpm workspaces require custom install command

### Environment Variables Set
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓

### Files Created for Deployment
- `/vercel.json` - Build configuration (currently not being respected)
- Root `package.json` updated with `vercel-build` script

### Option A: Vercel Dashboard Configuration (Recommended - Quick Fix)
1. Go to: https://vercel.com/marcus-projects-5de952ec/study-app/settings
2. Under "Build & Development Settings":
   - **Framework Preset**: `Other` (not Next.js)
   - **Build Command**: `pnpm vercel-build`
   - **Install Command**: `npm i -g pnpm@9 && pnpm install`
   - **Output Directory**: `apps/web/.next`
3. Go to Deployments tab → Click "Redeploy" on latest deployment
4. After successful deploy, update NEXT_PUBLIC_APP_URL env var with the production URL

### Option B: GitHub Integration (Recommended - Long Term)
1. Initialize git repository
2. Create GitHub repo and push
3. Connect Vercel to GitHub repo
4. Configure Root Directory to `apps/web` in Vercel
5. Vercel will auto-detect Next.js and use proper build settings

### After Successful Deployment
- Update `NEXT_PUBLIC_APP_URL` environment variable to production URL
- Configure Supabase Auth redirect URLs to include production domain
- Test authentication flow on production

### Recently Completed
- [x] Authentication flow complete (login, signup, signout, password reset)
- [x] Auth middleware protecting dashboard routes
- [x] Auth callback for email confirmation
- [x] Auth error page for failed auth attempts
- [x] Progress dashboard with stats (reviewed today, streak, retention, due/new cards)
- [x] Dashboard navigation added to sidebar
- [x] Supabase project created and linked (project ref: ikdvwyltrngcszbrwwde)
- [x] Environment variables configured (.env)
- [x] Database migrations applied via `supabase db push`
- [x] Symlinked .env to apps/web/ for monorepo compatibility
- [x] Deck list page with real data from Supabase
- [x] DeckCard component with stats (card count, due count, new count)
- [x] New deck creation form with color picker
- [x] Deck detail page with cards list
- [x] Add card form (front/back/notes)
- [x] Review session UI with FSRS integration
- [x] Rating buttons (Again/Hard/Good/Easy) with interval previews
- [x] Keyboard shortcuts for review (1-4 keys, Space to show answer)
- [x] Session completion screen with stats

---

## Next Steps

1. **Complete Vercel Deployment** (CURRENT - see Deployment Status section)
   - Choose Option A (Dashboard) or Option B (GitHub Integration)
   - Configure build settings
   - Verify production deployment works
   - Update Supabase auth redirect URLs

2. **Polish Phase 1 MVP**
   - Error handling and error boundaries
   - Loading states and skeletons
   - Fix TypeScript type inference issues (React 18/19 version mismatch)

3. **Begin Phase 2: Differentiation**
   - AI card generation from text/PDF
   - Card quality scoring
   - Elaboration prompts during review

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI (for Edge Functions)
OPENAI_API_KEY=your_openai_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Commands Reference

```bash
# Install dependencies
pnpm install

# Development
pnpm dev              # Run all apps in dev mode
pnpm dev --filter web # Run only web app

# Build
pnpm build            # Build all apps
pnpm build --filter web

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Database
pnpm db:migrate       # Run migrations
pnpm db:reset         # Reset database
pnpm db:seed          # Seed data

# Testing
pnpm test
```

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `packages/shared/src/fsrs/algorithm.ts` | Core FSRS implementation |
| `packages/shared/src/fsrs/scheduler.ts` | Scheduler with interval previews |
| `packages/shared/src/types/card.ts` | Card type definitions |
| `packages/api-client/src/queries/cards.ts` | Card query functions |
| `packages/api-client/src/queries/decks.ts` | Deck query functions with stats |
| `packages/api-client/src/mutations/cards.ts` | Card mutations (create, review, delete) |
| `apps/web/app/(dashboard)/decks/page.tsx` | Deck list page |
| `apps/web/app/(dashboard)/decks/deck-card.tsx` | Deck card component |
| `apps/web/app/(dashboard)/decks/new/page.tsx` | New deck form |
| `apps/web/app/(dashboard)/decks/[id]/page.tsx` | Deck detail page |
| `apps/web/app/(dashboard)/decks/[id]/add-card-form.tsx` | Add card form |
| `apps/web/app/(dashboard)/decks/[id]/card-list.tsx` | Card list component |
| `apps/web/app/(dashboard)/review/page.tsx` | Review session page |
| `apps/web/app/(dashboard)/review/review-session.tsx` | Review session UI component |
| `apps/web/app/(dashboard)/review/actions.ts` | Review server actions |
| `apps/web/app/(dashboard)/dashboard/page.tsx` | Progress dashboard page |
| `apps/web/app/(auth)/login/page.tsx` | Login page |
| `apps/web/app/(auth)/signup/page.tsx` | Signup page |
| `apps/web/app/(auth)/forgot-password/page.tsx` | Forgot password page |
| `apps/web/app/(auth)/reset-password/page.tsx` | Reset password page |
| `apps/web/app/auth/callback/route.ts` | OAuth callback handler |
| `apps/web/app/auth/signout/route.ts` | Signout handler |
| `apps/web/app/auth/auth-code-error/page.tsx` | Auth error page |
| `apps/web/lib/supabase/middleware.ts` | Auth middleware logic |
| `supabase/migrations/00001_initial_schema.sql` | Database schema |

---

## Notes & Decisions Log

### 2026-01-12 (Session 5) - Vercel Deployment Attempted
- Attempted deployment via Vercel CLI
- Created Vercel project `study-app` and configured environment variables
- Discovered limitation: Vercel CLI auto-detects Next.js and ignores vercel.json installCommand
- Turborepo + pnpm requires custom install command that CLI doesn't respect
- Documented two deployment options:
  - Option A: Configure via Vercel Dashboard (quick fix)
  - Option B: GitHub integration (long-term solution)
- Created vercel.json with proper configuration
- Updated root package.json with `vercel-build` script
- Next action: Complete deployment via Vercel Dashboard or set up GitHub integration

### 2026-01-12 (Session 4) - Authentication & Dashboard Complete
- Implemented complete authentication flow:
  - Login page with email/password
  - Signup page with password confirmation
  - Forgot password page with email reset
  - Reset password page for updating password
  - Auth error page for failed callbacks
  - Signout route
- Middleware protects /dashboard, /decks, /review, /settings routes
- Authenticated users redirected from auth pages to /dashboard
- Created progress dashboard at /dashboard with:
  - Cards reviewed today count
  - Current streak (consecutive days)
  - Retention rate (last 30 days)
  - Total reviews (last 30 days)
  - Due cards section with quick link to review
  - New cards section with quick link to learn
  - Recent decks grid with card counts
  - Getting started tips for new users
- Added Dashboard link to sidebar navigation
- Updated all redirects to point to /dashboard instead of /decks

### 2026-01-12 (Session 3) - Core Review Loop Implemented
- Connected Supabase project (ikdvwyltrngcszbrwwde) and pushed migrations
- Symlinked .env to apps/web/ for monorepo compatibility
- Implemented full deck management:
  - Deck list page fetching from Supabase with stats (card count, due, new)
  - DeckCard component with color indicator and study button
  - New deck creation form with color picker
  - Deck detail page showing all cards
- Implemented card management:
  - Add card form (front/back/notes)
  - Card list with expandable items showing FSRS stats
  - Server actions for create/delete
- Implemented review session:
  - Fetches due cards using getReviewSessionCards (learning > due > new priority)
  - Question/answer reveal flow
  - Rating buttons (Again/Hard/Good/Easy) with FSRS interval previews
  - Keyboard shortcuts (Space to reveal, 1-4 for ratings)
  - Progress bar and session completion screen
  - Server action to record reviews and update card scheduling
- Fixed TypeScript issues:
  - Added CompatibleSupabaseClient type to handle @supabase/ssr vs @supabase/supabase-js mismatch
  - Added explicit type annotations for query result mapping
- Dev server compiles and runs successfully
- Minor type inference warnings remain (React 19 types) but don't affect runtime

### 2026-01-12 (Session 2) - Scaffolding Complete
- Installed pnpm globally (npm install -g pnpm)
- Switched to Node 20 (nvm use 20) - project requires Node 20+
- Fixed TypeScript errors:
  - Added `Relationships` to database types for Supabase client compatibility
  - Renamed `Rating` type to `RatingLabel` in types/card.ts to avoid conflict with fsrs/Rating enum
  - Added DOM lib to library.json for setTimeout/clearTimeout types
  - Fixed React 19 / @types/react version mismatch in providers.tsx
- All 4 packages now pass typecheck
- Dev server runs successfully

### 2026-01-12 (Session 1) - Architecture & Planning
- Chose monorepo (Next.js + Expo) over Expo-only for better web experience
- Selected FSRS over SM-2 for more accurate scheduling
- Decided on Supabase over custom backend for faster iteration
- Postgres over document DB for relational card/deck/review structure

---

## Quick Start (for resuming development)

```bash
cd /Users/marcuspeterson/Dev/personal/Flite/Study
nvm use 20
pnpm dev:web
```

Then open http://localhost:3000

---

*This document should be updated as development progresses.*
