export type Priority = 'low' | 'medium' | 'high';

export type RecurrenceType = 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly' | 'custom';

export type Home = {
  id: string;
  name: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
};

export type Room = {
  id: string;
  homeId: string;
  name: string;
  type: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceTask = {
  id: string;
  homeId: string;
  roomId?: string;
  applianceId?: string;
  title: string;
  category: string;
  notes?: string;
  priority: Priority;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  lastCompletedAt?: string;
  nextDueAt?: string;
  photoUri?: string;
  supplyInfo?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};

export type TaskCompletion = {
  id: string;
  taskId: string;
  completedAt: string;
  notes?: string;
  photoUri?: string;
};

export type TaskStatus = 'overdue' | 'due-soon' | 'upcoming' | 'complete' | 'unscheduled';
