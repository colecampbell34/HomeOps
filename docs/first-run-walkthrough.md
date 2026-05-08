# First-Run Walkthrough Requirement

Add this before public launch or TestFlight if testers are not being directly guided.

## Goal

Help a new user understand how HomeOps is organized without making onboarding feel fluffy or marketing-heavy.

The walkthrough should be short, practical, and skippable.

## Recommended Flow

The walkthrough should be a guided tour through the real app, not a static slideshow. Start with a short intro, then navigate the user across the actual screens with a coach card explaining what to look for and how to use each area.

1. **Home Dashboard**
   - Explain that Dashboard shows overdue, upcoming, and recently completed maintenance.
   - Primary action: continue.

2. **Add Maintenance Tasks**
   - Explain recurring tasks and the quick-add flow.
   - Mention examples like furnace filter, smoke alarms, dryer vent, and fridge filter.

3. **Rooms and Assets**
   - Explain that rooms group tasks, appliances, and supplies.
   - Mention saving model numbers, filter sizes, and manual links.

4. **Seasonal Checklists**
   - Explain that starter seasonal tasks can be added into the user’s own schedule.

5. **Local-First Privacy**
   - Explain that the MVP stores data locally on device and does not require an account.

## UX Requirements

- Must be skippable.
- Must not block using the app.
- Must not use salesy language.
- Should include a “Start with sample data” or “Start fresh” decision only if we later support clearing seed data cleanly.
- Should be shown once per install, with a Settings option to replay it.

## Implementation Notes

- Store completion locally in SQLite or a small local preference store.
- Use existing theme, icons, and calm visual style.
- Keep it to 4-5 screens maximum.
- Do not introduce account creation or paywall prompts in the walkthrough for MVP.

## Current Implementation

- Guided tour intro added at `app/walkthrough.tsx`.
- Route-driven coach overlay added at `src/components/WalkthroughCoach.tsx`.
- Tour steps live in `src/data/walkthroughTour.ts`.
- First-run completion is stored locally in SQLite `app_meta`.
- The root layout redirects first-run users to the walkthrough intro after local data is ready.
- The active tour moves users through Dashboard, Tasks, Rooms, Assets, Seasonal, and Settings.
- Settings includes a replay entry for users who want to revisit it later.
