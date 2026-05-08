# HomeOps Web-First Launch Plan

This path lets HomeOps validate the MVP through a web/PWA preview before paying for App Store distribution.

## Goal

Ship the same Expo React Native codebase as a private web preview first, then decide whether the product is ready for native store investment.

## Current Approach

- Keep the mobile-first React Native UI.
- Use Expo web with Metro.
- Export as a single-page web app so dynamic routes like task, room, appliance, and supply detail pages can run behind one hosted entry point.
- Keep local-first storage for MVP validation.
- Use SQLite on native and a browser `localStorage` adapter on web until cloud backup/sync is ready.
- Start new users fresh, with no sample rooms, tasks, appliances, or supplies.
- Do not require authentication for the first web preview.

## Commands

```bash
npm run web
npm run export:web
```

## Deploy With Vercel

The repo includes `vercel.json`, so Vercel should use:

- Build command: `npm run export:web`
- Output directory: `dist`
- Route fallback: all routes rewrite to `index.html`

Steps:

1. Push the repo to GitHub, GitLab, or Bitbucket.
2. In Vercel, create a new project and import the repo.
3. Confirm the project uses the settings from `vercel.json`.
4. Deploy.
5. Open the generated Vercel URL and test a fresh browser session.
6. Add a custom domain later from the Vercel project settings if desired.

## Deploy With Netlify

The repo includes `netlify.toml`, so Netlify should use:

- Build command: `npm run export:web`
- Publish directory: `dist`
- Route fallback: all routes redirect to `index.html`

Steps:

1. Push the repo to GitHub, GitLab, Bitbucket, or Azure DevOps.
2. In Netlify, add a new site from an existing project.
3. Choose the Git provider and select this repo.
4. Confirm the build settings from `netlify.toml`.
5. Deploy.
6. Open the generated Netlify URL and test a fresh browser session.
7. Add a custom domain later from Netlify domain management if desired.

## Deployment Candidates

- Netlify
- Vercel
- Cloudflare Pages
- GitHub Pages
- EAS Hosting

The host should serve the exported app with a fallback to `index.html` because HomeOps uses client-side navigation.

This repo includes `netlify.toml` and `vercel.json` so either Netlify or Vercel can run `npm run export:web` and publish `dist`.

## Authentication Decision

Authentication is not needed for a first web preview because HomeOps stores each visitor's MVP data locally in that browser.

Add authentication and cloud sync before any of these become requirements:

- Users need access across devices or browsers.
- Users expect backup/restore.
- Household sharing is included.
- Paid subscriptions launch on web.
- Support needs to recover or migrate user data.

## Web Compatibility Checks

- Fresh load opens the app with an empty home and helpful setup tips.
- First-run guided walkthrough works.
- Dashboard, Tasks, Rooms, Assets, Seasonal, and Settings render at mobile and desktop widths.
- Task completion persists after refresh.
- Add/edit task persists after refresh.
- Add room persists after refresh.
- Add/edit appliance and supply persists after refresh.
- Search and filters work on web.
- Detail-page refreshes do not 404 on the chosen host.

## Known Caveats

- Browser-local data can be cleared by the browser or user. This is acceptable for early validation but not enough for a paid product without backup/sync.
- The web MVP intentionally avoids relying on SQLite WASM by using a platform-specific browser storage adapter.
- Push notifications, payments, and native App Store discovery remain deferred.

## Related Docs

- `docs/feature-backlog.md`
- `docs/app-store-prep.md`
- `docs/first-run-walkthrough.md`
