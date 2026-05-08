import { Appliance, Home, MaintenanceTask, Room, Supply, TaskCompletion } from '../types';

const now = new Date().toISOString();

export const seedHome: Home = {
  id: 'home-primary',
  name: 'My Home',
  createdAt: now,
  updatedAt: now,
};

export const seedRooms: Room[] = [];

export const seedTasks: MaintenanceTask[] = [];

export const seedCompletions: TaskCompletion[] = [];

export const seedAppliances: Appliance[] = [];

export const seedSupplies: Supply[] = [];
