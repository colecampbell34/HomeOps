import { Ionicons } from '@expo/vector-icons';

export type WalkthroughTourStep = {
  id: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  title: string;
  body: string;
  focus: string;
};

export const walkthroughTourSteps: WalkthroughTourStep[] = [
  {
    id: 'dashboard',
    route: '/(tabs)',
    icon: 'home-outline',
    label: 'Dashboard',
    title: 'Start here when you open HomeOps.',
    body: 'This is the daily operating view for the home: overdue tasks, upcoming work, recent completions, and the quick add button.',
    focus: 'Use the + button to add a recurring maintenance task without leaving the dashboard.',
  },
  {
    id: 'tasks',
    route: '/(tabs)/tasks',
    icon: 'checkbox-outline',
    label: 'Tasks',
    title: 'This is the full maintenance schedule.',
    body: 'Tasks are grouped by what needs attention and what is scheduled next. Opening a task shows the room, notes, recurrence, and completion history.',
    focus: 'Complete tasks from the list, or tap a task card to review the details before marking it done.',
  },
  {
    id: 'rooms',
    route: '/(tabs)/rooms',
    icon: 'grid-outline',
    label: 'Rooms',
    title: 'Rooms keep home work organized by area.',
    body: 'Each room gathers the tasks, appliances, and supplies that belong there, so upkeep is easier to scan by location.',
    focus: 'Tap a room to see the maintenance work and assets connected to that area.',
  },
  {
    id: 'assets',
    route: '/(tabs)/assets',
    icon: 'cube-outline',
    label: 'Assets',
    title: 'Assets store the details you usually have to look up again.',
    body: 'Appliances and supplies are saved here: model numbers, serial numbers, filter sizes, part models, manual links, and notes.',
    focus: 'Use Appliances for equipment records and Supplies for repeat purchases like filters, bulbs, and batteries.',
  },
  {
    id: 'seasonal',
    route: '/seasonal',
    icon: 'calendar-outline',
    label: 'Seasonal',
    title: 'Seasonal checklists help build the schedule.',
    body: 'Spring, summer, fall, and winter starter checklists suggest common tasks you can add into your own maintenance plan.',
    focus: 'Choose a season, then add only the recommendations you actually want HomeOps to track.',
  },
  {
    id: 'settings',
    route: '/(tabs)/settings',
    icon: 'settings-outline',
    label: 'Settings',
    title: 'Settings holds the account-free MVP controls.',
    body: 'This is where HomeOps keeps placeholders for home profile, reminders, premium, launch readiness, privacy, and this walkthrough.',
    focus: 'You can replay this guided tour from Settings whenever you want.',
  },
];
