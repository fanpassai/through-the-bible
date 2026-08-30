# Through the Bible

The production-ready course introduction and Week 01 interactive learning experience.

## Local development

```bash
npm ci
npm run dev
```

## Production verification

```bash
npm ci
npm run build
```

## Vercel deployment

This repository is configured as a Next.js project. When connected to Vercel, every branch update creates a Preview deployment and every update to `main` creates a Production deployment.

- Framework preset: Next.js
- Root directory: repository root (`./`)
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: leave blank (Next.js default)
- Node.js: 22.x

The lesson remains fully usable in guest mode without environment variables. Student accounts and cross-device saving activate when these Vercel environment variables are added:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## Student account foundation

The repository now includes:

- Google and passwordless email sign-in
- an `/auth/callback` route and session-refresh proxy
- local-to-cloud portfolio migration
- debounced cloud synchronization
- My Study for notes, questions, Scripture marks and devotional reflections
- exact-word highlighting and underlining
- private-by-default question submission
- `supabase/migrations/001_study_foundation.sql` with row-level security

To activate accounts, create or connect the Supabase project, run the included migration, enable Google and email authentication, add the production and preview redirect URLs, and set the two Vercel environment variables above.

Before replacing an existing deployment, preserve the current `main` branch as a backup branch. Then upload this package at the repository root and confirm that `package.json`, `app/`, `public/`, and `vercel.json` are at the top level.
