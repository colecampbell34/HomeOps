import { seedAppliances, seedCompletions, seedHome, seedRooms, seedSupplies, seedTasks } from '../data/seed';
import {
  Appliance,
  CreateApplianceInput,
  CreateMaintenanceTaskInput,
  CreateRoomInput,
  CreateSupplyInput,
  Home,
  MaintenanceTask,
  Room,
  Supply,
  TaskCompletion,
} from '../types';

const storageKey = 'homeops.web.localState.v2';

export type HomeOpsSnapshot = {
  home: Home;
  rooms: Room[];
  tasks: MaintenanceTask[];
  completions: TaskCompletion[];
  appliances: Appliance[];
  supplies: Supply[];
  hasCompletedWalkthrough: boolean;
};

function createInitialState(): HomeOpsSnapshot {
  return {
    home: { ...seedHome },
    rooms: seedRooms.map((room) => ({ ...room })),
    tasks: seedTasks.map((task) => ({ ...task })),
    completions: seedCompletions.map((completion) => ({ ...completion })),
    appliances: seedAppliances.map((appliance) => ({ ...appliance })),
    supplies: seedSupplies.map((supply) => ({ ...supply })),
    hasCompletedWalkthrough: false,
  };
}

function getStorage() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.localStorage;
}

function loadState(): HomeOpsSnapshot {
  const storage = getStorage();

  if (!storage) {
    return createInitialState();
  }

  const storedValue = storage.getItem(storageKey);

  if (!storedValue) {
    const initialState = createInitialState();
    saveState(initialState);
    return initialState;
  }

  try {
    return JSON.parse(storedValue) as HomeOpsSnapshot;
  } catch {
    const initialState = createInitialState();
    saveState(initialState);
    return initialState;
  }
}

function saveState(snapshot: HomeOpsSnapshot) {
  const storage = getStorage();

  if (!storage) {
    return;
  }

  storage.setItem(storageKey, JSON.stringify(snapshot));
}

function updateState(updater: (snapshot: HomeOpsSnapshot) => HomeOpsSnapshot) {
  const nextState = updater(loadState());
  saveState(nextState);
  return nextState;
}

export async function initializeDatabase() {
  loadState();
}

export async function loadHomeOpsSnapshot(): Promise<HomeOpsSnapshot> {
  return loadState();
}

export async function persistWalkthroughCompleted() {
  updateState((snapshot) => ({
    ...snapshot,
    hasCompletedWalkthrough: true,
  }));
}

export async function persistTaskCompletion(task: MaintenanceTask, completedAt: string, nextDueAt: string, notes?: string) {
  const completion: TaskCompletion = {
    id: `completion-${task.id}-${Date.now()}`,
    taskId: task.id,
    completedAt,
    notes,
  };

  updateState((snapshot) => ({
    ...snapshot,
    tasks: snapshot.tasks.map((currentTask) =>
      currentTask.id === task.id
        ? {
            ...currentTask,
            lastCompletedAt: completedAt,
            nextDueAt,
            updatedAt: completedAt,
          }
        : currentTask,
    ),
    completions: [completion, ...snapshot.completions],
  }));
}

export async function persistMaintenanceTask(homeId: string, input: CreateMaintenanceTaskInput): Promise<MaintenanceTask> {
  const now = new Date().toISOString();
  const task: MaintenanceTask = {
    id: `task-${Date.now()}`,
    homeId,
    roomId: input.roomId,
    title: input.title.trim(),
    category: input.category.trim() || 'General',
    notes: input.notes?.trim() || undefined,
    priority: input.priority,
    recurrenceType: input.recurrenceType,
    recurrenceInterval: input.recurrenceInterval,
    nextDueAt: input.nextDueAt,
    createdAt: now,
    updatedAt: now,
  };

  updateState((snapshot) => ({
    ...snapshot,
    tasks: [...snapshot.tasks, task],
  }));

  return task;
}

export async function persistRoom(homeId: string, input: CreateRoomInput): Promise<Room> {
  const now = new Date().toISOString();
  const room: Room = {
    id: `room-${Date.now()}`,
    homeId,
    name: input.name.trim(),
    type: input.type,
    icon: input.icon,
    createdAt: now,
    updatedAt: now,
  };

  updateState((snapshot) => ({
    ...snapshot,
    rooms: [...snapshot.rooms, room].sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return room;
}

export async function updateMaintenanceTask(taskId: string, input: CreateMaintenanceTaskInput) {
  const now = new Date().toISOString();

  updateState((snapshot) => ({
    ...snapshot,
    tasks: snapshot.tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            roomId: input.roomId,
            title: input.title.trim(),
            category: input.category.trim() || 'General',
            notes: input.notes?.trim() || undefined,
            priority: input.priority,
            recurrenceType: input.recurrenceType,
            recurrenceInterval: input.recurrenceInterval,
            nextDueAt: input.nextDueAt,
            updatedAt: now,
          }
        : task,
    ),
  }));
}

export async function persistAppliance(homeId: string, input: CreateApplianceInput): Promise<Appliance> {
  const now = new Date().toISOString();
  const appliance: Appliance = {
    id: `appliance-${Date.now()}`,
    homeId,
    roomId: input.roomId,
    name: input.name.trim(),
    brand: input.brand?.trim() || undefined,
    modelNumber: input.modelNumber?.trim() || undefined,
    serialNumber: input.serialNumber?.trim() || undefined,
    purchaseDate: input.purchaseDate?.trim() || undefined,
    manualUrl: input.manualUrl?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  updateState((snapshot) => ({
    ...snapshot,
    appliances: [...snapshot.appliances, appliance].sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return appliance;
}

export async function updateAppliance(applianceId: string, input: CreateApplianceInput) {
  const now = new Date().toISOString();

  updateState((snapshot) => ({
    ...snapshot,
    appliances: snapshot.appliances
      .map((appliance) =>
        appliance.id === applianceId
          ? {
              ...appliance,
              roomId: input.roomId,
              name: input.name.trim(),
              brand: input.brand?.trim() || undefined,
              modelNumber: input.modelNumber?.trim() || undefined,
              serialNumber: input.serialNumber?.trim() || undefined,
              purchaseDate: input.purchaseDate?.trim() || undefined,
              manualUrl: input.manualUrl?.trim() || undefined,
              notes: input.notes?.trim() || undefined,
              updatedAt: now,
            }
          : appliance,
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export async function persistSupply(homeId: string, input: CreateSupplyInput): Promise<Supply> {
  const now = new Date().toISOString();
  const supply: Supply = {
    id: `supply-${Date.now()}`,
    homeId,
    applianceId: input.applianceId,
    taskId: input.taskId,
    name: input.name.trim(),
    type: input.type.trim() || 'General',
    sizeOrModel: input.sizeOrModel?.trim() || undefined,
    brand: input.brand?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    lastPurchasedAt: input.lastPurchasedAt?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  updateState((snapshot) => ({
    ...snapshot,
    supplies: [...snapshot.supplies, supply].sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return supply;
}

export async function updateSupply(supplyId: string, input: CreateSupplyInput) {
  const now = new Date().toISOString();

  updateState((snapshot) => ({
    ...snapshot,
    supplies: snapshot.supplies
      .map((supply) =>
        supply.id === supplyId
          ? {
              ...supply,
              applianceId: input.applianceId,
              taskId: input.taskId,
              name: input.name.trim(),
              type: input.type.trim() || 'General',
              sizeOrModel: input.sizeOrModel?.trim() || undefined,
              brand: input.brand?.trim() || undefined,
              notes: input.notes?.trim() || undefined,
              lastPurchasedAt: input.lastPurchasedAt?.trim() || undefined,
              updatedAt: now,
            }
          : supply,
      )
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}
