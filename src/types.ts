export type Priority = 'low' | 'medium' | 'high';

export type RecurrenceType = 'weekly' | 'monthly' | 'quarterly' | 'semiannual' | 'yearly' | 'custom';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

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
  notes?: string;
  photoUri?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
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

export type Appliance = {
  id: string;
  homeId: string;
  roomId?: string;
  name: string;
  brand?: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseVendor?: string;
  warrantyExpiresAt?: string;
  receiptUrl?: string;
  manualUri?: string;
  manualUrl?: string;
  photoUri?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};

export type Supply = {
  id: string;
  homeId: string;
  roomId?: string;
  applianceId?: string;
  taskId?: string;
  name: string;
  type: string;
  sizeOrModel?: string;
  brand?: string;
  notes?: string;
  photoUri?: string;
  lastPurchasedAt?: string;
  lastPurchasedVendor?: string;
  reorderUrl?: string;
  quantityOnHand?: number;
  lowStockThreshold?: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
};

export type SeasonalChecklistItem = {
  id: string;
  season: Season;
  title: string;
  category: string;
  suggestedRecurrence: RecurrenceType;
  suggestedInterval: number;
  description?: string;
  roomType?: string;
  priority: Priority;
};

export type TaskStatus = 'overdue' | 'due-soon' | 'upcoming' | 'complete' | 'unscheduled';

export type CreateMaintenanceTaskInput = {
  title: string;
  roomId?: string;
  applianceId?: string;
  category: string;
  notes?: string;
  priority: Priority;
  recurrenceType: RecurrenceType;
  recurrenceInterval: number;
  nextDueAt: string;
};

export type CreateRoomInput = {
  name: string;
  type: string;
  icon: string;
  notes?: string;
};

export type CreateApplianceInput = {
  name: string;
  roomId?: string;
  brand?: string;
  modelNumber?: string;
  serialNumber?: string;
  purchaseDate?: string;
  purchaseVendor?: string;
  warrantyExpiresAt?: string;
  receiptUrl?: string;
  manualUrl?: string;
  notes?: string;
};

export type CreateSupplyInput = {
  name: string;
  type: string;
  sizeOrModel?: string;
  brand?: string;
  notes?: string;
  roomId?: string;
  applianceId?: string;
  taskId?: string;
  lastPurchasedAt?: string;
  lastPurchasedVendor?: string;
  reorderUrl?: string;
  quantityOnHand?: number;
  lowStockThreshold?: number;
};
