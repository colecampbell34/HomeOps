# HomeOps Feature Backlog

This list tracks meaningful features and polish that are not yet implemented. It is intentionally broader than the current web-first MVP.

## Added in v2

- Web JSON export and import for local HomeOps data.
- Reset local data option for testing and fresh starts.
- Task search across title, notes, category, room, and linked appliance.
- Task filters for priority and category.
- Full custom interval support in the task form for day, week, month, and year schedules.
- Link a task to an appliance during task creation/editing.
- Snooze task actions for one week or one month.
- Archive task action that removes tasks from active lists while keeping history.

## Added in v3

- Supply inventory fields for quantity on hand and low-stock threshold.
- Low-stock supply surfacing on the dashboard and Assets tab.
- Direct room links for supplies, including room-scoped supply creation.
- Reorder URL and last purchased vendor/store fields for supplies.
- Supply archive action that removes supplies from active lists while preserving data.
- Supply detail polish for stock status, linked room, reorder, vendor, appliance, and task context.

## Added in v4

- Edit room name, type, icon, and notes from room detail.
- Archive rooms safely while preserving linked tasks, appliances, supplies, and history.
- Room-level notes shown on room detail and room list previews.
- Common room setup templates for starter homes, apartments, and whole-property setups.
- Richer room list counts for tasks, appliances, and direct supplies.

## Added in v5

- Common room setup buttons now preview suggested rooms instead of bulk-creating them.
- Suggested setup rooms are temporary until the user taps Add on an individual room.
- Switching common setups replaces the pending suggestions rather than stacking saved rooms.
- Template suggestions detect rooms that already exist and mark them as added.

## Added in v6

- Appliance records now include purchase vendor, warranty expiration, and receipt URL fields.
- Appliance detail now shows warranty, vendor, receipt, and manual context.
- Receipt links can be opened directly from appliance detail.
- Appliance service history now summarizes completed tasks linked directly to that appliance.
- Appliance archive action removes appliances from active lists while preserving linked tasks, supplies, and history.

## User Accounts, Sync, and Data Ownership

- User authentication for web and future native accounts.
- Cloud backup and sync across browsers/devices.
- Household sharing with roles or invites.
- Multiple homes/properties.
- Hosted/cloud backup beyond local JSON files.
- Account deletion and data deletion flows.
- Data migration strategy from local-only web storage to authenticated cloud storage.

## Web and PWA Readiness

- Hosted production deployment.
- Custom domain.
- Production privacy policy and support/contact pages.
- PWA install metadata review.
- Offline behavior review.
- Browser compatibility testing across Safari, Chrome, Firefox, and mobile browsers.
- Hosted route fallback verification for detail pages.
- Web analytics decision and implementation, if desired.
- Crash/error reporting decision and implementation, if desired.

## Rooms

- Room photo.
- Delete room flow with confirmation, if needed after archive.

## Maintenance Tasks

- Add/edit task photo.
- Add explicit supply/part info directly on a task.
- Completion flow with optional notes/photo before saving.
- Arbitrary reschedule date picker beyond quick snooze actions.
- Delete task flow with confirmation, if needed after archive.
- Calendar-style view.

## Reminders and Notifications

- Local notification scheduling.
- Reminder preferences per task.
- Reminder lead time, for example day-of or week-before.
- Push notifications for cloud/account users later.
- Notification permission education.

## Appliances and Equipment

- Appliance photo.
- Manual/document photo upload.
- Automatic manual lookup from brand/model number.
- Link existing tasks to appliance from appliance detail.
- Delete appliance flow with confirmation, if needed after archive.

## Supplies and Parts

- Supply photo.
- Low-stock notification/reminder scheduling.
- Delete supply flow with confirmation, if needed after archive.

## Seasonal Checklists

- More complete starter checklist library.
- User-customizable seasonal recommendations.
- Add multiple seasonal tasks at once.
- Hide/dismiss recommendations.
- Regional climate options.

## Premium and Monetization

- Free-tier limits.
- Paywall screens.
- RevenueCat integration for native subscriptions.
- Web payment decision.
- Paid entitlement checks.
- Premium restore flow.

## AI and Automation Later

- AI part/model extraction from appliance labels.
- AI seasonal task suggestions.
- AI manual lookup assistance.
- AI-generated home maintenance summary.

## Native App Store Preparation

- Final app icon and splash artwork.
- Final bundle identifier.
- Apple Developer account.
- TestFlight setup.
- App Store screenshots.
- App Store listing copy.
- App Store privacy nutrition labels.
- In-app purchases, if launching paid on iOS.

## Product and UX Polish

- Empty-state QA across all fresh-start screens.
- Small-screen layout QA.
- Tablet and desktop web layout QA.
- Accessibility labels and focus order review.
- Loading/error states for all forms.
- About, support, and privacy content finalized.
