import { MaintenanceTask, RecurrenceType, TaskStatus } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function toDate(value?: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function daysFromToday(value?: string): number | undefined {
  const dueDate = toDate(value);
  if (!dueDate) {
    return undefined;
  }

  return Math.round((dueDate.getTime() - today().getTime()) / MS_PER_DAY);
}

export function formatShortDate(value?: string): string {
  const date = toDate(value);
  if (!date) {
    return 'No date set';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function dueLabel(value?: string): string {
  const days = daysFromToday(value);

  if (days === undefined) {
    return 'No schedule';
  }

  if (days < 0) {
    return `${Math.abs(days)}d overdue`;
  }

  if (days === 0) {
    return 'Due today';
  }

  if (days === 1) {
    return 'Due tomorrow';
  }

  return `Due in ${days}d`;
}

export function getTaskStatus(task: MaintenanceTask): TaskStatus {
  const days = daysFromToday(task.nextDueAt);

  if (days === undefined) {
    return 'unscheduled';
  }

  if (days < 0) {
    return 'overdue';
  }

  if (days <= 14) {
    return 'due-soon';
  }

  return 'upcoming';
}

export function addRecurrence(from: Date, recurrenceType: RecurrenceType, interval: number): Date {
  const next = new Date(from);

  switch (recurrenceType) {
    case 'weekly':
      next.setDate(next.getDate() + 7 * interval);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + interval);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3 * interval);
      break;
    case 'semiannual':
      next.setMonth(next.getMonth() + 6 * interval);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + interval);
      break;
    case 'custom':
      next.setDate(next.getDate() + interval);
      break;
  }

  return next;
}

export function toISODate(date: Date): string {
  return date.toISOString();
}

export function compareDueDate(a: MaintenanceTask, b: MaintenanceTask): number {
  const aDate = toDate(a.nextDueAt)?.getTime() ?? Number.POSITIVE_INFINITY;
  const bDate = toDate(b.nextDueAt)?.getTime() ?? Number.POSITIVE_INFINITY;
  return aDate - bDate;
}
