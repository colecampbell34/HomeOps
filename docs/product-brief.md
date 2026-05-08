I want to build a mobile app called **HomeOps**.

I will be the decision maker and high-level designer. You will be the developer. I want you to help me turn this into a real mobile app that can eventually be published to the iOS App Store and potentially monetized.

## Product Summary

**HomeOps** is a home maintenance and household operations app for homeowners, renters, and small-property owners.

The core promise:

> Know what needs attention, when to do it, and exactly what parts/details you need.

This is not a legal-proof app, insurance app, or dispute app. It is a practical organization and reminder app for home upkeep.

## Why People Would Pay

Home maintenance mistakes are expensive and annoying. People forget filter sizes, appliance model numbers, replacement schedules, seasonal tasks, and small recurring chores until something breaks.

HomeOps creates value by:
- Preventing forgotten maintenance.
- Saving users from searching for the same part/model/filter information repeatedly.
- Keeping household upkeep organized across rooms, appliances, and recurring tasks.
- Helping families or roommates coordinate who did what.
- Making seasonal home care less overwhelming.

The paid value should feel practical, not vague.

## Target Users

Primary:
- Homeowners who want to avoid expensive repairs.
- Busy households that forget recurring maintenance.
- First-time homeowners who do not know what to maintain.
- Renters who still manage filters, cleaning tasks, smoke detectors, and appliances.

Secondary:
- People managing a second property.
- Landlords with a small number of units.
- Families sharing household responsibilities.

## MVP Scope

Build the first version around these core features:

1. **Home Dashboard**
   - Shows upcoming tasks.
   - Shows overdue tasks.
   - Shows recently completed tasks.
   - Shows home health/status in a simple way.
   - Should feel practical and calm, not gamified.

2. **Rooms**
   - Users can create rooms/areas:
     - Kitchen
     - Bathroom
     - Bedroom
     - Laundry
     - Garage
     - Basement
     - Exterior
     - HVAC/utility
     - Custom room
   - Each room can contain maintenance items and appliances.

3. **Maintenance Items**
   Each maintenance item should support:
   - Name
   - Room/area
   - Category
   - Notes
   - Photo
   - Recurring schedule
   - Last completed date
   - Next due date
   - Priority
   - Optional supplies/part info

   Example tasks:
   - Replace furnace filter.
   - Clean dryer vent.
   - Test smoke alarms.
   - Replace water filter.
   - Clean dishwasher filter.
   - Flush water heater.
   - Check exterior caulking.
   - Clean gutters.
   - Change fridge water filter.

4. **Appliances & Equipment**
   Users can save:
   - Appliance name
   - Brand
   - Model number
   - Serial number
   - Purchase date
   - Room
   - Manual link or photo
   - Filter/part size
   - Notes
   - Photo

   Example:
   - Furnace
   - Fridge
   - Dishwasher
   - Washer
   - Dryer
   - Water heater
   - Air purifier
   - Range hood
   - Sump pump

5. **Reminders**
   - Recurring reminders for maintenance tasks.
   - Basic options:
     - Weekly
     - Monthly
     - Every 3 months
     - Every 6 months
     - Yearly
     - Custom interval
   - Push notifications eventually, but local app state first is okay.

6. **Seasonal Checklists**
   Include starter checklists:
   - Spring
   - Summer
   - Fall
   - Winter

   Example winter checklist:
   - Check weather stripping.
   - Test smoke/CO detectors.
   - Replace furnace filter.
   - Disconnect outdoor hoses.
   - Inspect gutters.
   - Check emergency supplies.

7. **Supplies / Parts**
   Users can store recurring supply info:
   - Furnace filter size
   - Fridge water filter model
   - Air purifier filter model
   - Light bulb type
   - Battery type
   - Cleaning supplies

   This should answer: “What size/model did I buy last time?”

8. **Completion History**
   - When a user completes a task, store the date.
   - Show simple history per task.
   - Let users add optional notes after completion.

## Features To Avoid In MVP

Do not start with:
- Insurance reports.
- Legal proof.
- Contractor disputes.
- Marketplace.
- AI-heavy workflows.
- Complex social features.
- Full smart-home integration.
- Local permit/compliance advice.
- Home value estimates.
- Anything requiring legal, medical, or financial claims.

AI can be added later, but the MVP must be useful without it.

## Possible Premium Features Later

Potential paid features:
- Unlimited homes.
- Unlimited maintenance items.
- Cloud backup.
- Household sharing.
- Multiple property support.
- Photo storage.
- AI part/model extraction from appliance labels.
- AI seasonal task suggestions.
- PDF home maintenance summary.
- Export maintenance history.
- Manual/document storage.
- Advanced reminders.
- Supply reorder links.

## Monetization Model

Start with a freemium model.

Free tier:
- 1 home
- Limited number of maintenance items, maybe 15-25
- Basic reminders
- Starter seasonal checklist

Paid tier:
- $29.99/year target price
- Unlimited maintenance items
- Unlimited appliances
- Photos/documents
- Full seasonal checklists
- Completion history
- Multiple rooms
- Future cloud backup

Potential higher tier later:
- $49.99/year
- Household sharing
- Multiple homes/properties
- AI part lookup
- Advanced exports

Do not implement payments immediately unless the project is ready. Design the app so a paywall can be added later.

## Technical Preference

Use **React Native with Expo** unless there is a strong reason not to.

Priorities:
- iOS first.
- App Store publishable architecture.
- Clean local data model.
- Good mobile UX.
- Easy path to adding authentication/cloud sync later.
- TypeScript preferred.

Potential stack:
- Expo
- React Native
- TypeScript
- Expo Router
- Local SQLite or another reliable local persistence layer
- Zustand or similar lightweight state management if needed
- Local notifications later
- RevenueCat later for subscriptions
- Supabase/Firebase later for cloud sync, not required for MVP

## Design Direction

The app should feel:
- Calm
- Reliable
- Practical
- Organized
- Slightly premium
- Not playful/gamified
- Not corporate/sterile

Visual style:
- Clean home-operations dashboard.
- Dense enough to be useful.
- Avoid huge marketing-style hero screens.
- Avoid fluffy onboarding.
- Use clear icons for rooms, tasks, reminders, appliances, and supplies.
- Cards are okay for repeated items, but avoid nesting cards inside cards.
- Mobile-first layout.
- Text must fit well on small screens.
- No purple-gradient startup look.

Suggested colors:
- Warm off-white or very light gray background.
- Deep green, slate, or charcoal for primary actions.
- Amber/orange only for due-soon warnings.
- Red only for overdue/urgent.
- Use neutral borders and good spacing.

## Core App Screens

1. **Dashboard**
   - Today / upcoming tasks.
   - Overdue tasks.
   - Quick add button.
   - Home status summary.
   - Seasonal checklist entry point.

2. **Tasks**
   - List of all maintenance tasks.
   - Filters:
     - Upcoming
     - Overdue
     - Completed
     - By room
   - Task detail page.
   - Complete task action.

3. **Rooms**
   - Room list.
   - Room detail with related tasks/appliances/supplies.

4. **Appliances**
   - Appliance list.
   - Appliance detail.
   - Add/edit appliance.

5. **Supplies**
   - Saved parts and recurring supplies.
   - Searchable list.
   - Link supply to appliance/task.

6. **Seasonal**
   - Seasonal checklist screen.
   - Let users add recommended tasks to their own maintenance schedule.

7. **Settings**
   - Home profile.
   - Reminder preferences.
   - Export/backup placeholder.
   - Premium placeholder.
   - About/privacy placeholder.

## Suggested Data Models

Home:
- id
- name
- address optional
- createdAt
- updatedAt

Room:
- id
- homeId
- name
- type
- icon
- createdAt
- updatedAt

MaintenanceTask:
- id
- homeId
- roomId optional
- applianceId optional
- title
- category
- notes
- priority
- recurrenceType
- recurrenceInterval
- lastCompletedAt optional
- nextDueAt optional
- photoUri optional
- createdAt
- updatedAt
- archivedAt optional

TaskCompletion:
- id
- taskId
- completedAt
- notes optional
- photoUri optional

Appliance:
- id
- homeId
- roomId optional
- name
- brand optional
- modelNumber optional
- serialNumber optional
- purchaseDate optional
- manualUri optional
- manualUrl optional
- photoUri optional
- notes optional
- createdAt
- updatedAt

Supply:
- id
- homeId
- applianceId optional
- taskId optional
- name
- type
- sizeOrModel optional
- brand optional
- notes optional
- photoUri optional
- lastPurchasedAt optional
- createdAt
- updatedAt

SeasonalChecklistItem:
- id
- season
- title
- category
- suggestedRecurrence
- description optional

## MVP Build Milestones

Milestone 1: Project setup
- Create Expo React Native project.
- Configure TypeScript.
- Set up navigation.
- Create app theme.
- Set up local persistence.
- Create seed data.

Milestone 2: Core dashboard
- Dashboard screen.
- Upcoming/overdue task logic.
- Complete task flow.
- Quick add task.

Milestone 3: Rooms and tasks
- Room list/detail.
- Add/edit task.
- Task recurrence.
- Task completion history.

Milestone 4: Appliances and supplies
- Appliance list/detail.
- Add/edit appliance.
- Supply list.
- Link supplies to tasks/appliances.

Milestone 5: Seasonal checklists
- Build seasonal checklist screen.
- Add recommended item to user tasks.

Milestone 6: Polish
- Empty states.
- Better icons.
- Error handling.
- Mobile layout QA.
- App icon placeholder.
- Basic privacy/about screens.

Milestone 7: App Store preparation later
- App name/branding.
- First-run walkthrough/onboarding so new users understand Dashboard, Tasks, Rooms, Appliances, Supplies, and Seasonal checklists.
- Screenshots.
- Privacy policy.
- TestFlight.
- In-app purchases.
- Analytics.
- Crash reporting.
- App Store listing.

## Development Approach

Start with a working local-only MVP. Do not overbuild cloud infrastructure at the start.

When implementing:
- Read the project structure first.
- Follow existing patterns.
- Keep the app shippable.
- Use pragmatic architecture.
- Prefer reliable simple code over clever abstractions.
- Verify with actual local runs/screenshots where possible.
- Keep me informed and ask for product decisions when visual or UX choices matter.

## First Task

Start by creating the Expo project structure for HomeOps and implementing the first usable slice:

- Dashboard screen
- Seeded sample home
- Seeded maintenance tasks
- Upcoming/overdue task display
- Complete task button
- Basic navigation shell
