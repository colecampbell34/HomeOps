import * as SQLite from 'expo-sqlite';

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

type PersistedTaskRow = Omit<
  MaintenanceTask,
  'roomId' | 'applianceId' | 'notes' | 'lastCompletedAt' | 'nextDueAt' | 'photoUri' | 'supplyInfo' | 'archivedAt'
> & {
  roomId: string | null;
  applianceId: string | null;
  notes: string | null;
  lastCompletedAt: string | null;
  nextDueAt: string | null;
  photoUri: string | null;
  supplyInfo: string | null;
  archivedAt: string | null;
};

type PersistedCompletionRow = Omit<TaskCompletion, 'notes' | 'photoUri'> & {
  notes: string | null;
  photoUri: string | null;
};

type PersistedApplianceRow = Omit<
  Appliance,
  | 'roomId'
  | 'brand'
  | 'modelNumber'
  | 'serialNumber'
  | 'purchaseDate'
  | 'purchaseVendor'
  | 'warrantyExpiresAt'
  | 'receiptUrl'
  | 'manualUri'
  | 'manualUrl'
  | 'photoUri'
  | 'notes'
  | 'archivedAt'
> & {
  roomId: string | null;
  brand: string | null;
  modelNumber: string | null;
  serialNumber: string | null;
  purchaseDate: string | null;
  purchaseVendor: string | null;
  warrantyExpiresAt: string | null;
  receiptUrl: string | null;
  manualUri: string | null;
  manualUrl: string | null;
  photoUri: string | null;
  notes: string | null;
  archivedAt: string | null;
};

type PersistedRoomRow = Omit<Room, 'notes' | 'photoUri' | 'archivedAt'> & {
  notes: string | null;
  photoUri: string | null;
  archivedAt: string | null;
};

type PersistedSupplyRow = Omit<
  Supply,
  | 'roomId'
  | 'applianceId'
  | 'taskId'
  | 'sizeOrModel'
  | 'brand'
  | 'notes'
  | 'photoUri'
  | 'lastPurchasedAt'
  | 'lastPurchasedVendor'
  | 'reorderUrl'
  | 'quantityOnHand'
  | 'lowStockThreshold'
  | 'archivedAt'
> & {
  roomId: string | null;
  applianceId: string | null;
  taskId: string | null;
  sizeOrModel: string | null;
  brand: string | null;
  notes: string | null;
  photoUri: string | null;
  lastPurchasedAt: string | null;
  lastPurchasedVendor: string | null;
  reorderUrl: string | null;
  quantityOnHand: number | null;
  lowStockThreshold: number | null;
  archivedAt: string | null;
};

const databasePromise = SQLite.openDatabaseAsync('homeops.db');

function nullable(value?: string) {
  return value ?? null;
}

function fromTaskRow(row: PersistedTaskRow): MaintenanceTask {
  return {
    ...row,
    roomId: row.roomId ?? undefined,
    applianceId: row.applianceId ?? undefined,
    notes: row.notes ?? undefined,
    lastCompletedAt: row.lastCompletedAt ?? undefined,
    nextDueAt: row.nextDueAt ?? undefined,
    photoUri: row.photoUri ?? undefined,
    supplyInfo: row.supplyInfo ?? undefined,
    archivedAt: row.archivedAt ?? undefined,
  };
}

function fromCompletionRow(row: PersistedCompletionRow): TaskCompletion {
  return {
    ...row,
    notes: row.notes ?? undefined,
    photoUri: row.photoUri ?? undefined,
  };
}

function fromRoomRow(row: PersistedRoomRow): Room {
  return {
    ...row,
    notes: row.notes ?? undefined,
    photoUri: row.photoUri ?? undefined,
    archivedAt: row.archivedAt ?? undefined,
  };
}

function fromApplianceRow(row: PersistedApplianceRow): Appliance {
  return {
    ...row,
    roomId: row.roomId ?? undefined,
    brand: row.brand ?? undefined,
    modelNumber: row.modelNumber ?? undefined,
    serialNumber: row.serialNumber ?? undefined,
    purchaseDate: row.purchaseDate ?? undefined,
    purchaseVendor: row.purchaseVendor ?? undefined,
    warrantyExpiresAt: row.warrantyExpiresAt ?? undefined,
    receiptUrl: row.receiptUrl ?? undefined,
    manualUri: row.manualUri ?? undefined,
    manualUrl: row.manualUrl ?? undefined,
    photoUri: row.photoUri ?? undefined,
    notes: row.notes ?? undefined,
    archivedAt: row.archivedAt ?? undefined,
  };
}

function fromSupplyRow(row: PersistedSupplyRow): Supply {
  return {
    ...row,
    roomId: row.roomId ?? undefined,
    applianceId: row.applianceId ?? undefined,
    taskId: row.taskId ?? undefined,
    sizeOrModel: row.sizeOrModel ?? undefined,
    brand: row.brand ?? undefined,
    notes: row.notes ?? undefined,
    photoUri: row.photoUri ?? undefined,
    lastPurchasedAt: row.lastPurchasedAt ?? undefined,
    lastPurchasedVendor: row.lastPurchasedVendor ?? undefined,
    reorderUrl: row.reorderUrl ?? undefined,
    quantityOnHand: row.quantityOnHand ?? undefined,
    lowStockThreshold: row.lowStockThreshold ?? undefined,
    archivedAt: row.archivedAt ?? undefined,
  };
}

export type HomeOpsSnapshot = {
  home: Home;
  rooms: Room[];
  tasks: MaintenanceTask[];
  completions: TaskCompletion[];
  appliances: Appliance[];
  supplies: Supply[];
  hasCompletedWalkthrough: boolean;
};

export async function initializeDatabase() {
  const db = await databasePromise;

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS homes (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      address TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY NOT NULL,
      homeId TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      icon TEXT NOT NULL,
      notes TEXT,
      photoUri TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      archivedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS maintenance_tasks (
      id TEXT PRIMARY KEY NOT NULL,
      homeId TEXT NOT NULL,
      roomId TEXT,
      applianceId TEXT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      notes TEXT,
      priority TEXT NOT NULL,
      recurrenceType TEXT NOT NULL,
      recurrenceInterval INTEGER NOT NULL,
      lastCompletedAt TEXT,
      nextDueAt TEXT,
      photoUri TEXT,
      supplyInfo TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      archivedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS task_completions (
      id TEXT PRIMARY KEY NOT NULL,
      taskId TEXT NOT NULL,
      completedAt TEXT NOT NULL,
      notes TEXT,
      photoUri TEXT
    );

    CREATE TABLE IF NOT EXISTS appliances (
      id TEXT PRIMARY KEY NOT NULL,
      homeId TEXT NOT NULL,
      roomId TEXT,
      name TEXT NOT NULL,
      brand TEXT,
      modelNumber TEXT,
      serialNumber TEXT,
      purchaseDate TEXT,
      purchaseVendor TEXT,
      warrantyExpiresAt TEXT,
      receiptUrl TEXT,
      manualUri TEXT,
      manualUrl TEXT,
      photoUri TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      archivedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS supplies (
      id TEXT PRIMARY KEY NOT NULL,
      homeId TEXT NOT NULL,
      roomId TEXT,
      applianceId TEXT,
      taskId TEXT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      sizeOrModel TEXT,
      brand TEXT,
      notes TEXT,
      photoUri TEXT,
      lastPurchasedAt TEXT,
      lastPurchasedVendor TEXT,
      reorderUrl TEXT,
      quantityOnHand REAL,
      lowStockThreshold REAL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      archivedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  await ensureRoomColumns(db);
  await ensureApplianceColumns(db);
  await ensureSupplyColumns(db);
  await seedDatabase(db);
}

async function ensureApplianceColumns(db: SQLite.SQLiteDatabase) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(appliances)`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const requiredColumns: Array<{ name: string; sql: string }> = [
    { name: 'purchaseVendor', sql: 'ALTER TABLE appliances ADD COLUMN purchaseVendor TEXT' },
    { name: 'warrantyExpiresAt', sql: 'ALTER TABLE appliances ADD COLUMN warrantyExpiresAt TEXT' },
    { name: 'receiptUrl', sql: 'ALTER TABLE appliances ADD COLUMN receiptUrl TEXT' },
    { name: 'archivedAt', sql: 'ALTER TABLE appliances ADD COLUMN archivedAt TEXT' },
  ];

  for (const column of requiredColumns) {
    if (!existingColumns.has(column.name)) {
      await db.execAsync(column.sql);
    }
  }
}

async function ensureRoomColumns(db: SQLite.SQLiteDatabase) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(rooms)`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const requiredColumns: Array<{ name: string; sql: string }> = [
    { name: 'notes', sql: 'ALTER TABLE rooms ADD COLUMN notes TEXT' },
    { name: 'photoUri', sql: 'ALTER TABLE rooms ADD COLUMN photoUri TEXT' },
    { name: 'archivedAt', sql: 'ALTER TABLE rooms ADD COLUMN archivedAt TEXT' },
  ];

  for (const column of requiredColumns) {
    if (!existingColumns.has(column.name)) {
      await db.execAsync(column.sql);
    }
  }
}

async function ensureSupplyColumns(db: SQLite.SQLiteDatabase) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(supplies)`);
  const existingColumns = new Set(columns.map((column) => column.name));
  const requiredColumns: Array<{ name: string; sql: string }> = [
    { name: 'roomId', sql: 'ALTER TABLE supplies ADD COLUMN roomId TEXT' },
    { name: 'lastPurchasedVendor', sql: 'ALTER TABLE supplies ADD COLUMN lastPurchasedVendor TEXT' },
    { name: 'reorderUrl', sql: 'ALTER TABLE supplies ADD COLUMN reorderUrl TEXT' },
    { name: 'quantityOnHand', sql: 'ALTER TABLE supplies ADD COLUMN quantityOnHand REAL' },
    { name: 'lowStockThreshold', sql: 'ALTER TABLE supplies ADD COLUMN lowStockThreshold REAL' },
    { name: 'archivedAt', sql: 'ALTER TABLE supplies ADD COLUMN archivedAt TEXT' },
  ];

  for (const column of requiredColumns) {
    if (!existingColumns.has(column.name)) {
      await db.execAsync(column.sql);
    }
  }
}

async function seedDatabase(db: SQLite.SQLiteDatabase) {
  await db.runAsync(
    `INSERT OR IGNORE INTO homes (id, name, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
    seedHome.id,
    seedHome.name,
    nullable(seedHome.address),
    seedHome.createdAt,
    seedHome.updatedAt,
  );

  for (const room of seedRooms) {
    await db.runAsync(
      `INSERT OR IGNORE INTO rooms (id, homeId, name, type, icon, notes, photoUri, createdAt, updatedAt, archivedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      room.id,
      room.homeId,
      room.name,
      room.type,
      room.icon,
      nullable(room.notes),
      nullable(room.photoUri),
      room.createdAt,
      room.updatedAt,
      nullable(room.archivedAt),
    );
  }

  for (const task of seedTasks) {
    await db.runAsync(
      `INSERT OR IGNORE INTO maintenance_tasks (
        id, homeId, roomId, applianceId, title, category, notes, priority, recurrenceType,
        recurrenceInterval, lastCompletedAt, nextDueAt, photoUri, supplyInfo, createdAt, updatedAt, archivedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      task.id,
      task.homeId,
      nullable(task.roomId),
      nullable(task.applianceId),
      task.title,
      task.category,
      nullable(task.notes),
      task.priority,
      task.recurrenceType,
      task.recurrenceInterval,
      nullable(task.lastCompletedAt),
      nullable(task.nextDueAt),
      nullable(task.photoUri),
      nullable(task.supplyInfo),
      task.createdAt,
      task.updatedAt,
      nullable(task.archivedAt),
    );
  }

  for (const completion of seedCompletions) {
    await db.runAsync(
      `INSERT OR IGNORE INTO task_completions (id, taskId, completedAt, notes, photoUri) VALUES (?, ?, ?, ?, ?)`,
      completion.id,
      completion.taskId,
      completion.completedAt,
      nullable(completion.notes),
      nullable(completion.photoUri),
    );
  }

  for (const appliance of seedAppliances) {
    await db.runAsync(
      `INSERT OR IGNORE INTO appliances (
        id, homeId, roomId, name, brand, modelNumber, serialNumber, purchaseDate,
        purchaseVendor, warrantyExpiresAt, receiptUrl, manualUri, manualUrl, photoUri,
        notes, createdAt, updatedAt, archivedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      appliance.id,
      appliance.homeId,
      nullable(appliance.roomId),
      appliance.name,
      nullable(appliance.brand),
      nullable(appliance.modelNumber),
      nullable(appliance.serialNumber),
      nullable(appliance.purchaseDate),
      nullable(appliance.purchaseVendor),
      nullable(appliance.warrantyExpiresAt),
      nullable(appliance.receiptUrl),
      nullable(appliance.manualUri),
      nullable(appliance.manualUrl),
      nullable(appliance.photoUri),
      nullable(appliance.notes),
      appliance.createdAt,
      appliance.updatedAt,
      nullable(appliance.archivedAt),
    );
  }

  for (const supply of seedSupplies) {
    await db.runAsync(
      `INSERT OR IGNORE INTO supplies (
        id, homeId, roomId, applianceId, taskId, name, type, sizeOrModel, brand,
        notes, photoUri, lastPurchasedAt, lastPurchasedVendor, reorderUrl, quantityOnHand,
        lowStockThreshold, createdAt, updatedAt, archivedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      supply.id,
      supply.homeId,
      nullable(supply.roomId),
      nullable(supply.applianceId),
      nullable(supply.taskId),
      supply.name,
      supply.type,
      nullable(supply.sizeOrModel),
      nullable(supply.brand),
      nullable(supply.notes),
      nullable(supply.photoUri),
      nullable(supply.lastPurchasedAt),
      nullable(supply.lastPurchasedVendor),
      nullable(supply.reorderUrl),
      supply.quantityOnHand ?? null,
      supply.lowStockThreshold ?? null,
      supply.createdAt,
      supply.updatedAt,
      nullable(supply.archivedAt),
    );
  }

  await db.runAsync(
    `UPDATE maintenance_tasks SET applianceId = ? WHERE id = ? AND applianceId IS NULL`,
    'appliance-furnace',
    'task-furnace-filter',
  );
  await db.runAsync(
    `UPDATE maintenance_tasks SET applianceId = ? WHERE id = ? AND applianceId IS NULL`,
    'appliance-fridge',
    'task-fridge-filter',
  );
  await db.runAsync(
    `UPDATE maintenance_tasks SET applianceId = ? WHERE id = ? AND applianceId IS NULL`,
    'appliance-dryer',
    'task-dryer-vent',
  );
}

export async function loadHomeOpsSnapshot(): Promise<HomeOpsSnapshot> {
  const db = await databasePromise;
  const home = await db.getFirstAsync<Home>(`SELECT * FROM homes LIMIT 1`);
  const roomRows = await db.getAllAsync<PersistedRoomRow>(`SELECT * FROM rooms ORDER BY name ASC`);
  const taskRows = await db.getAllAsync<PersistedTaskRow>(`SELECT * FROM maintenance_tasks ORDER BY nextDueAt ASC`);
  const completionRows = await db.getAllAsync<PersistedCompletionRow>(
    `SELECT * FROM task_completions ORDER BY completedAt DESC`,
  );
  const applianceRows = await db.getAllAsync<PersistedApplianceRow>(`SELECT * FROM appliances ORDER BY name ASC`);
  const supplyRows = await db.getAllAsync<PersistedSupplyRow>(`SELECT * FROM supplies ORDER BY name ASC`);
  const walkthroughRow = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_meta WHERE key = ?`,
    'hasCompletedWalkthrough',
  );

  return {
    home: home ?? seedHome,
    rooms: roomRows.map(fromRoomRow),
    tasks: taskRows.map(fromTaskRow),
    completions: completionRows.map(fromCompletionRow),
    appliances: applianceRows.map(fromApplianceRow),
    supplies: supplyRows.map(fromSupplyRow),
    hasCompletedWalkthrough: walkthroughRow?.value === 'true',
  };
}

export async function exportHomeOpsSnapshot(): Promise<HomeOpsSnapshot> {
  return loadHomeOpsSnapshot();
}

export async function importHomeOpsSnapshot(snapshot: HomeOpsSnapshot) {
  const db = await databasePromise;
  const home = snapshot.home ?? seedHome;
  const rooms = Array.isArray(snapshot.rooms) ? snapshot.rooms : seedRooms;
  const tasks = Array.isArray(snapshot.tasks) ? snapshot.tasks : seedTasks;
  const completions = Array.isArray(snapshot.completions) ? snapshot.completions : seedCompletions;
  const appliances = Array.isArray(snapshot.appliances) ? snapshot.appliances : seedAppliances;
  const supplies = Array.isArray(snapshot.supplies) ? snapshot.supplies : seedSupplies;

  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM task_completions;
      DELETE FROM maintenance_tasks;
      DELETE FROM supplies;
      DELETE FROM appliances;
      DELETE FROM rooms;
      DELETE FROM homes;
      DELETE FROM app_meta;
    `);

    await db.runAsync(
      `INSERT INTO homes (id, name, address, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      home.id,
      home.name,
      nullable(home.address),
      home.createdAt,
      home.updatedAt,
    );

    for (const room of rooms) {
      await db.runAsync(
        `INSERT INTO rooms (id, homeId, name, type, icon, notes, photoUri, createdAt, updatedAt, archivedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        room.id,
        room.homeId,
        room.name,
        room.type,
        room.icon,
        nullable(room.notes),
        nullable(room.photoUri),
        room.createdAt,
        room.updatedAt,
        nullable(room.archivedAt),
      );
    }

    for (const appliance of appliances) {
      await db.runAsync(
        `INSERT INTO appliances (
          id, homeId, roomId, name, brand, modelNumber, serialNumber, purchaseDate,
          purchaseVendor, warrantyExpiresAt, receiptUrl, manualUri, manualUrl, photoUri,
          notes, createdAt, updatedAt, archivedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        appliance.id,
        appliance.homeId,
        nullable(appliance.roomId),
        appliance.name,
        nullable(appliance.brand),
        nullable(appliance.modelNumber),
        nullable(appliance.serialNumber),
        nullable(appliance.purchaseDate),
        nullable(appliance.purchaseVendor),
        nullable(appliance.warrantyExpiresAt),
        nullable(appliance.receiptUrl),
        nullable(appliance.manualUri),
        nullable(appliance.manualUrl),
        nullable(appliance.photoUri),
        nullable(appliance.notes),
        appliance.createdAt,
        appliance.updatedAt,
        nullable(appliance.archivedAt),
      );
    }

    for (const supply of supplies) {
      await db.runAsync(
        `INSERT INTO supplies (
          id, homeId, roomId, applianceId, taskId, name, type, sizeOrModel, brand,
          notes, photoUri, lastPurchasedAt, lastPurchasedVendor, reorderUrl, quantityOnHand,
          lowStockThreshold, createdAt, updatedAt, archivedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        supply.id,
        supply.homeId,
        nullable(supply.roomId),
        nullable(supply.applianceId),
        nullable(supply.taskId),
        supply.name,
        supply.type,
        nullable(supply.sizeOrModel),
        nullable(supply.brand),
        nullable(supply.notes),
        nullable(supply.photoUri),
        nullable(supply.lastPurchasedAt),
        nullable(supply.lastPurchasedVendor),
        nullable(supply.reorderUrl),
        supply.quantityOnHand ?? null,
        supply.lowStockThreshold ?? null,
        supply.createdAt,
        supply.updatedAt,
        nullable(supply.archivedAt),
      );
    }

    for (const task of tasks) {
      await db.runAsync(
        `INSERT INTO maintenance_tasks (
          id, homeId, roomId, applianceId, title, category, notes, priority, recurrenceType,
          recurrenceInterval, lastCompletedAt, nextDueAt, photoUri, supplyInfo, createdAt, updatedAt, archivedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        task.id,
        task.homeId,
        nullable(task.roomId),
        nullable(task.applianceId),
        task.title,
        task.category,
        nullable(task.notes),
        task.priority,
        task.recurrenceType,
        task.recurrenceInterval,
        nullable(task.lastCompletedAt),
        nullable(task.nextDueAt),
        nullable(task.photoUri),
        nullable(task.supplyInfo),
        task.createdAt,
        task.updatedAt,
        nullable(task.archivedAt),
      );
    }

    for (const completion of completions) {
      await db.runAsync(
        `INSERT INTO task_completions (id, taskId, completedAt, notes, photoUri) VALUES (?, ?, ?, ?, ?)`,
        completion.id,
        completion.taskId,
        completion.completedAt,
        nullable(completion.notes),
        nullable(completion.photoUri),
      );
    }

    await db.runAsync(
      `INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)`,
      'hasCompletedWalkthrough',
      snapshot.hasCompletedWalkthrough ? 'true' : 'false',
    );
  });
}

export async function resetHomeOpsData() {
  await importHomeOpsSnapshot({
    home: seedHome,
    rooms: seedRooms,
    tasks: seedTasks,
    completions: seedCompletions,
    appliances: seedAppliances,
    supplies: seedSupplies,
    hasCompletedWalkthrough: false,
  });
}

export async function persistWalkthroughCompleted() {
  const db = await databasePromise;

  await db.runAsync(
    `INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)`,
    'hasCompletedWalkthrough',
    'true',
  );
}

export async function persistTaskCompletion(task: MaintenanceTask, completedAt: string, nextDueAt: string, notes?: string) {
  const db = await databasePromise;
  const completionId = `completion-${task.id}-${Date.now()}`;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE maintenance_tasks SET lastCompletedAt = ?, nextDueAt = ?, updatedAt = ? WHERE id = ?`,
      completedAt,
      nextDueAt,
      completedAt,
      task.id,
    );

    await db.runAsync(
      `INSERT INTO task_completions (id, taskId, completedAt, notes, photoUri) VALUES (?, ?, ?, ?, ?)`,
      completionId,
      task.id,
      completedAt,
      nullable(notes),
      null,
    );
  });
}

export async function persistMaintenanceTask(homeId: string, input: CreateMaintenanceTaskInput): Promise<MaintenanceTask> {
  const db = await databasePromise;
  const now = new Date().toISOString();
  const task: MaintenanceTask = {
    id: `task-${Date.now()}`,
    homeId,
    roomId: input.roomId,
    applianceId: input.applianceId,
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

  await db.runAsync(
    `INSERT INTO maintenance_tasks (
      id, homeId, roomId, applianceId, title, category, notes, priority, recurrenceType,
      recurrenceInterval, lastCompletedAt, nextDueAt, photoUri, supplyInfo, createdAt, updatedAt, archivedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    task.id,
    task.homeId,
    nullable(task.roomId),
    nullable(task.applianceId),
    task.title,
    task.category,
    nullable(task.notes),
    task.priority,
    task.recurrenceType,
    task.recurrenceInterval,
    null,
    nullable(task.nextDueAt),
    null,
    null,
    task.createdAt,
    task.updatedAt,
    null,
  );

  return task;
}

export async function persistRoom(homeId: string, input: CreateRoomInput): Promise<Room> {
  const db = await databasePromise;
  const now = new Date().toISOString();
  const room: Room = {
    id: `room-${Date.now()}`,
    homeId,
    name: input.name.trim(),
    type: input.type,
    icon: input.icon,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO rooms (id, homeId, name, type, icon, notes, photoUri, createdAt, updatedAt, archivedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    room.id,
    room.homeId,
    room.name,
    room.type,
    room.icon,
    nullable(room.notes),
    null,
    room.createdAt,
    room.updatedAt,
    null,
  );

  return room;
}

export async function updateRoom(roomId: string, input: CreateRoomInput) {
  const db = await databasePromise;
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE rooms
      SET name = ?,
        type = ?,
        icon = ?,
        notes = ?,
        updatedAt = ?
      WHERE id = ?`,
    input.name.trim(),
    input.type,
    input.icon,
    input.notes?.trim() || null,
    now,
    roomId,
  );
}

export async function archiveRoom(roomId: string) {
  const db = await databasePromise;
  const now = new Date().toISOString();

  await db.runAsync(`UPDATE rooms SET archivedAt = ?, updatedAt = ? WHERE id = ?`, now, now, roomId);
}

export async function updateMaintenanceTask(taskId: string, input: CreateMaintenanceTaskInput) {
  const db = await databasePromise;
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE maintenance_tasks
      SET roomId = ?,
        applianceId = ?,
        title = ?,
        category = ?,
        notes = ?,
        priority = ?,
        recurrenceType = ?,
        recurrenceInterval = ?,
        nextDueAt = ?,
        updatedAt = ?
      WHERE id = ?`,
    nullable(input.roomId),
    nullable(input.applianceId),
    input.title.trim(),
    input.category.trim() || 'General',
    input.notes?.trim() || null,
    input.priority,
    input.recurrenceType,
    input.recurrenceInterval,
    input.nextDueAt,
    now,
    taskId,
  );
}

export async function archiveMaintenanceTask(taskId: string) {
  const db = await databasePromise;
  const now = new Date().toISOString();

  await db.runAsync(`UPDATE maintenance_tasks SET archivedAt = ?, updatedAt = ? WHERE id = ?`, now, now, taskId);
}

export async function rescheduleMaintenanceTask(taskId: string, nextDueAt: string) {
  const db = await databasePromise;
  const now = new Date().toISOString();

  await db.runAsync(`UPDATE maintenance_tasks SET nextDueAt = ?, updatedAt = ? WHERE id = ?`, nextDueAt, now, taskId);
}

export async function persistAppliance(homeId: string, input: CreateApplianceInput): Promise<Appliance> {
  const db = await databasePromise;
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
    purchaseVendor: input.purchaseVendor?.trim() || undefined,
    warrantyExpiresAt: input.warrantyExpiresAt?.trim() || undefined,
    receiptUrl: input.receiptUrl?.trim() || undefined,
    manualUrl: input.manualUrl?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO appliances (
      id, homeId, roomId, name, brand, modelNumber, serialNumber, purchaseDate,
      purchaseVendor, warrantyExpiresAt, receiptUrl, manualUri, manualUrl, photoUri,
      notes, createdAt, updatedAt, archivedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    appliance.id,
    appliance.homeId,
    nullable(appliance.roomId),
    appliance.name,
    nullable(appliance.brand),
    nullable(appliance.modelNumber),
    nullable(appliance.serialNumber),
    nullable(appliance.purchaseDate),
    nullable(appliance.purchaseVendor),
    nullable(appliance.warrantyExpiresAt),
    nullable(appliance.receiptUrl),
    null,
    nullable(appliance.manualUrl),
    null,
    nullable(appliance.notes),
    appliance.createdAt,
    appliance.updatedAt,
    null,
  );

  return appliance;
}

export async function updateAppliance(applianceId: string, input: CreateApplianceInput) {
  const db = await databasePromise;
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE appliances
      SET roomId = ?,
        name = ?,
        brand = ?,
        modelNumber = ?,
        serialNumber = ?,
        purchaseDate = ?,
        purchaseVendor = ?,
        warrantyExpiresAt = ?,
        receiptUrl = ?,
        manualUrl = ?,
        notes = ?,
        updatedAt = ?
      WHERE id = ?`,
    nullable(input.roomId),
    input.name.trim(),
    input.brand?.trim() || null,
    input.modelNumber?.trim() || null,
    input.serialNumber?.trim() || null,
    input.purchaseDate?.trim() || null,
    input.purchaseVendor?.trim() || null,
    input.warrantyExpiresAt?.trim() || null,
    input.receiptUrl?.trim() || null,
    input.manualUrl?.trim() || null,
    input.notes?.trim() || null,
    now,
    applianceId,
  );
}

export async function archiveAppliance(applianceId: string) {
  const db = await databasePromise;
  const now = new Date().toISOString();

  await db.runAsync(`UPDATE appliances SET archivedAt = ?, updatedAt = ? WHERE id = ?`, now, now, applianceId);
}

export async function persistSupply(homeId: string, input: CreateSupplyInput): Promise<Supply> {
  const db = await databasePromise;
  const now = new Date().toISOString();
  const supply: Supply = {
    id: `supply-${Date.now()}`,
    homeId,
    roomId: input.roomId,
    applianceId: input.applianceId,
    taskId: input.taskId,
    name: input.name.trim(),
    type: input.type.trim() || 'General',
    sizeOrModel: input.sizeOrModel?.trim() || undefined,
    brand: input.brand?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    lastPurchasedAt: input.lastPurchasedAt?.trim() || undefined,
    lastPurchasedVendor: input.lastPurchasedVendor?.trim() || undefined,
    reorderUrl: input.reorderUrl?.trim() || undefined,
    quantityOnHand: input.quantityOnHand,
    lowStockThreshold: input.lowStockThreshold,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO supplies (
      id, homeId, roomId, applianceId, taskId, name, type, sizeOrModel, brand,
      notes, photoUri, lastPurchasedAt, lastPurchasedVendor, reorderUrl, quantityOnHand,
      lowStockThreshold, createdAt, updatedAt, archivedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    supply.id,
    supply.homeId,
    nullable(supply.roomId),
    nullable(supply.applianceId),
    nullable(supply.taskId),
    supply.name,
    supply.type,
    nullable(supply.sizeOrModel),
    nullable(supply.brand),
    nullable(supply.notes),
    null,
    nullable(supply.lastPurchasedAt),
    nullable(supply.lastPurchasedVendor),
    nullable(supply.reorderUrl),
    supply.quantityOnHand ?? null,
    supply.lowStockThreshold ?? null,
    supply.createdAt,
    supply.updatedAt,
    null,
  );

  return supply;
}

export async function updateSupply(supplyId: string, input: CreateSupplyInput) {
  const db = await databasePromise;
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE supplies
      SET roomId = ?,
        applianceId = ?,
        taskId = ?,
        name = ?,
        type = ?,
        sizeOrModel = ?,
        brand = ?,
        notes = ?,
        lastPurchasedAt = ?,
        lastPurchasedVendor = ?,
        reorderUrl = ?,
        quantityOnHand = ?,
        lowStockThreshold = ?,
        updatedAt = ?
      WHERE id = ?`,
    nullable(input.roomId),
    nullable(input.applianceId),
    nullable(input.taskId),
    input.name.trim(),
    input.type.trim() || 'General',
    input.sizeOrModel?.trim() || null,
    input.brand?.trim() || null,
    input.notes?.trim() || null,
    input.lastPurchasedAt?.trim() || null,
    input.lastPurchasedVendor?.trim() || null,
    input.reorderUrl?.trim() || null,
    input.quantityOnHand ?? null,
    input.lowStockThreshold ?? null,
    now,
    supplyId,
  );
}

export async function archiveSupply(supplyId: string) {
  const db = await databasePromise;
  const now = new Date().toISOString();

  await db.runAsync(`UPDATE supplies SET archivedAt = ?, updatedAt = ? WHERE id = ?`, now, now, supplyId);
}
