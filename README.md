# InternalizePro

A science-backed learning app that goes beyond memorization to help users truly internalize knowledge.

## Current Status

- [x] Project scaffolding complete
- [x] Supabase project linked and configured
- [x] Database migrations applied
- [x] Environment variables configured
- [x] Web app running locally

## Quick Start

### Prerequisites

- Node.js 20+ (use `nvm use 20` if using nvm)
- pnpm 9+
- Supabase CLI

### Setup (Remote Supabase - No Docker Required)

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Symlink .env to web app (required for monorepo)
ln -s ../../.env apps/web/.env

# Fill in your .env with values from Supabase Dashboard:
# - NEXT_PUBLIC_SUPABASE_URL (Settings → API → Project URL)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (Settings → API → anon public)
# - SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role)
# - OPENAI_API_KEY (from platform.openai.com)

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push database migrations
supabase db push

# Start development server
pnpm dev:web
```

### Setup (Local Supabase - Requires Docker)

```bash
pnpm install
cp .env.example .env
ln -s ../../.env apps/web/.env
supabase start
supabase db push
pnpm dev:web
```

### Environment Variables

Create a `.env` file in the root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
├── apps/
│   ├── web/          # Next.js 14 web app
│   └── mobile/       # Expo React Native app
├── packages/
│   ├── shared/       # Shared types, FSRS algorithm, utilities
│   ├── api-client/   # Typed Supabase client and queries
│   ├── ui/           # Shared UI tokens
│   └── tsconfig/     # Shared TypeScript configs
└── supabase/         # Database migrations and config
```

## Commands

```bash
pnpm dev              # Run all apps in dev mode
pnpm dev:web          # Run only web app
pnpm dev:mobile       # Run only mobile app
pnpm build            # Build all apps
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
```

## Tech Stack

- **Web**: Next.js 14, Tailwind CSS, React Query
- **Mobile**: Expo, React Native, NativeWind
- **Backend**: Supabase (Postgres, Auth, Edge Functions)
- **Algorithm**: FSRS-4.5 (Free Spaced Repetition Scheduler)

## Documentation

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for detailed architecture and roadmap.
