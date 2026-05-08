# HomeOps App Store Preparation

This document tracks the release work that should happen after the local MVP is stable. It intentionally avoids implementing payments, analytics, crash reporting, or cloud sync before those product decisions are ready.

## Current Release Posture

HomeOps is currently a local-first Expo app with:

- Expo Router navigation
- Local SQLite persistence
- Dashboard, Tasks, Rooms, Appliances, Supplies, Seasonal, and Settings flows
- Fresh-start local data with empty-state setup tips
- Placeholder app icon and splash assets
- Basic settings placeholders for privacy, premium, export, and backup

## Decisions Needed From Product Owner

These should be decided before App Store submission:

- Final app name: currently `HomeOps`
- Subtitle or short positioning line
- Bundle identifier, for example `com.yourcompany.homeops`
- Apple Developer account/team
- Support email or support URL
- Marketing URL, if any
- Privacy policy URL
- Whether the first public build launches as free-only or includes paywall scaffolding
- Whether analytics and crash reporting are included in the first TestFlight build
- Screenshot device targets and copy direction

## Pre-Publish Requirements

Before submitting to App Review:

- Add first-run walkthrough/onboarding.
- Replace placeholder app icon with final brand artwork.
- Finalize privacy policy.
- Confirm App Store privacy answers based on active data collection.
- Decide whether to include analytics or crash reporting.
- Test fresh install, upgrade install, and local data reset behavior.
- Run through all empty states with no seed data or a reset database.
- Prepare screenshots for key flows:
  - Dashboard with overdue/upcoming tasks
  - Task detail with completion history
  - Room detail with linked assets
  - Appliance detail with model/manual info
  - Supplies list answering “what size/model did I buy last time?”
  - Seasonal checklist add-to-tasks flow

## Deferred Until Later

These are intentionally not part of the current local MVP. See `docs/feature-backlog.md` for the broader backlog.

- In-app purchases
- RevenueCat integration
- Account creation
- Cloud backup/sync
- Household sharing
- AI part/model extraction
- Automatic manual lookup
- PDF exports
- Legal/insurance reporting

## Suggested TestFlight Readiness Checklist

- App launches from a clean install.
- Seed data loads once and user-created data persists.
- Completing a task creates completion history and advances next due date.
- Quick-add task persists after app restart.
- Editing tasks, appliances, and supplies persists after app restart.
- Seasonal recommended task can be added once and then appears in Tasks.
- All Settings placeholder screens open and clearly describe future behavior.
- App works at small iPhone widths without clipped buttons or unreadable labels.
