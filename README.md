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

No environment variables are required for the current Week 01 experience.

Before replacing an existing deployment, preserve the current `main` branch as a backup branch. Then upload this package at the repository root and confirm that `package.json`, `app/`, `public/`, and `vercel.json` are at the top level.
