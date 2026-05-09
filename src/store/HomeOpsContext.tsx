import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { seedHome, seedRooms } from '../data/seed';
import {
  archiveMaintenanceTask,
  exportHomeOpsSnapshot,
  HomeOpsSnapshot,
  initializeDatabase,
  importHomeOpsSnapshot,
  loadHomeOpsSnapshot,
  persistAppliance,
  persistMaintenanceTask,
  persistRoom,
  persistSupply,
  persistTaskCompletion,
  persistWalkthroughCompleted,
  resetHomeOpsData,
  rescheduleMaintenanceTask,
  updateAppliance,
  updateMaintenanceTask,
  updateSupply,
} from '../storage/database';
import { addRecurrence, compareDueDate, getTaskStatus, toISODate, today } from '../utils/dates';
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

type HomeOpsState = {
  home: Home;
  rooms: Room[];
  tasks: MaintenanceTask[];
  completions: TaskCompletion[];
  appliances: Appliance[];
  supplies: Supply[];
  isReady: boolean;
  hasCompletedWalkthrough: boolean;
  error?: string;
  overdueTasks: MaintenanceTask[];
  upcomingTasks: MaintenanceTask[];
  recentCompletions: Array<TaskCompletion & { task?: MaintenanceTask }>;
  completeTask: (taskId: string, notes?: string) => Promise<void>;
  archiveTask: (taskId: string) => Promise<void>;
  rescheduleTask: (taskId: string, nextDueAt: string) => Promise<void>;
  addRoom: (input: CreateRoomInput) => Promise<void>;
  addTask: (input: CreateMaintenanceTaskInput) => Promise<void>;
  updateTask: (taskId: string, input: CreateMaintenanceTaskInput) => Promise<void>;
  addAppliance: (input: CreateApplianceInput) => Promise<void>;
  updateAppliance: (applianceId: string, input: CreateApplianceInput) => Promise<void>;
  addSupply: (input: CreateSupplyInput) => Promise<void>;
  updateSupply: (supplyId: string, input: CreateSupplyInput) => Promise<void>;
  completeWalkthrough: () => Promise<void>;
  exportData: () => Promise<HomeOpsSnapshot>;
  importData: (snapshot: HomeOpsSnapshot) => Promise<void>;
  resetData: () => Promise<void>;
  getRoomName: (roomId?: string) => string;
  getApplianceName: (applianceId?: string) => string;
  getTaskTitle: (taskId?: string) => string;
};

const HomeOpsContext = createContext<HomeOpsState | undefined>(undefined);

export function HomeOpsProvider({ children }: PropsWithChildren) {
  const [home, setHome] = useState<Home>(seedHome);
  const [rooms, setRooms] = useState<Room[]>(seedRooms);
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [hasCompletedWalkthrough, setHasCompletedWalkthrough] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const refreshSnapshot = useCallback(async () => {
    const snapshot = await loadHomeOpsSnapshot();
    setHome(snapshot.home);
    setRooms(snapshot.rooms);
    setTasks(snapshot.tasks);
    setCompletions(snapshot.completions);
    setAppliances(snapshot.appliances);
    setSupplies(snapshot.supplies);
    setHasCompletedWalkthrough(snapshot.hasCompletedWalkthrough);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        await initializeDatabase();
        const snapshot = await loadHomeOpsSnapshot();

        if (!isMounted) {
          return;
        }

        setHome(snapshot.home);
        setRooms(snapshot.rooms);
        setTasks(snapshot.tasks);
        setCompletions(snapshot.completions);
        setAppliances(snapshot.appliances);
        setSupplies(snapshot.supplies);
        setHasCompletedWalkthrough(snapshot.hasCompletedWalkthrough);
        setError(undefined);
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : 'Unable to load HomeOps data.');
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const completeTask = useCallback(
    async (taskId: string, notes?: string) => {
      const task = tasks.find((currentTask) => currentTask.id === taskId);

      if (!task) {
        return;
      }

      const completedAt = toISODate(today());
      const nextDueAt = toISODate(addRecurrence(today(), task.recurrenceType, task.recurrenceInterval));

      await persistTaskCompletion(task, completedAt, nextDueAt, notes);
      await refreshSnapshot();
    },
    [refreshSnapshot, tasks],
  );

  const addTask = useCallback(
    async (input: CreateMaintenanceTaskInput) => {
      await persistMaintenanceTask(home.id, input);
      await refreshSnapshot();
    },
    [home.id, refreshSnapshot],
  );

  const archiveTask = useCallback(
    async (taskId: string) => {
      await archiveMaintenanceTask(taskId);
      await refreshSnapshot();
    },
    [refreshSnapshot],
  );

  const rescheduleTask = useCallback(
    async (taskId: string, nextDueAt: string) => {
      await rescheduleMaintenanceTask(taskId, nextDueAt);
      await refreshSnapshot();
    },
    [refreshSnapshot],
  );

  const addRoom = useCallback(
    async (input: CreateRoomInput) => {
      await persistRoom(home.id, input);
      await refreshSnapshot();
    },
    [home.id, refreshSnapshot],
  );

  const updateTask = useCallback(
    async (taskId: string, input: CreateMaintenanceTaskInput) => {
      await updateMaintenanceTask(taskId, input);
      await refreshSnapshot();
    },
    [refreshSnapshot],
  );

  const addAppliance = useCallback(
    async (input: CreateApplianceInput) => {
      await persistAppliance(home.id, input);
      await refreshSnapshot();
    },
    [home.id, refreshSnapshot],
  );

  const saveAppliance = useCallback(
    async (applianceId: string, input: CreateApplianceInput) => {
      await updateAppliance(applianceId, input);
      await refreshSnapshot();
    },
    [refreshSnapshot],
  );

  const addSupply = useCallback(
    async (input: CreateSupplyInput) => {
      await persistSupply(home.id, input);
      await refreshSnapshot();
    },
    [home.id, refreshSnapshot],
  );

  const saveSupply = useCallback(
    async (supplyId: string, input: CreateSupplyInput) => {
      await updateSupply(supplyId, input);
      await refreshSnapshot();
    },
    [refreshSnapshot],
  );

  const completeWalkthrough = useCallback(async () => {
    await persistWalkthroughCompleted();
    setHasCompletedWalkthrough(true);
  }, []);

  const exportData = useCallback(async () => exportHomeOpsSnapshot(), []);

  const importData = useCallback(
    async (snapshot: HomeOpsSnapshot) => {
      await importHomeOpsSnapshot(snapshot);
      await refreshSnapshot();
    },
    [refreshSnapshot],
  );

  const resetData = useCallback(async () => {
    await resetHomeOpsData();
    await refreshSnapshot();
  }, [refreshSnapshot]);

  const value = useMemo<HomeOpsState>(() => {
    const activeTasks = tasks.filter((task) => !task.archivedAt);
    const overdueTasks = activeTasks.filter((task) => getTaskStatus(task) === 'overdue').sort(compareDueDate);
    const upcomingTasks = activeTasks
      .filter((task) => {
        const status = getTaskStatus(task);
        return status === 'due-soon' || status === 'upcoming';
      })
      .sort(compareDueDate);

    const recentCompletions = [...completions]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 4)
      .map((completion) => ({
        ...completion,
        task: tasks.find((task) => task.id === completion.taskId),
      }));

    return {
      home,
      rooms,
      tasks: activeTasks,
      completions,
      appliances,
      supplies,
      isReady,
      hasCompletedWalkthrough,
      error,
      overdueTasks,
      upcomingTasks,
      recentCompletions,
      completeTask,
      archiveTask,
      rescheduleTask,
      addRoom,
      addTask,
      updateTask,
      addAppliance,
      updateAppliance: saveAppliance,
      addSupply,
      updateSupply: saveSupply,
      completeWalkthrough,
      exportData,
      importData,
      resetData,
      getRoomName: (roomId?: string) => rooms.find((room) => room.id === roomId)?.name ?? 'Whole home',
      getApplianceName: (applianceId?: string) =>
        appliances.find((appliance) => appliance.id === applianceId)?.name ?? 'No appliance linked',
      getTaskTitle: (taskId?: string) => tasks.find((task) => task.id === taskId)?.title ?? 'No task linked',
    };
  }, [
    addAppliance,
    addRoom,
    addSupply,
    addTask,
    archiveTask,
    appliances,
    completeTask,
    completeWalkthrough,
    completions,
    error,
    exportData,
    hasCompletedWalkthrough,
    home,
    importData,
    isReady,
    rescheduleTask,
    resetData,
    rooms,
    saveAppliance,
    saveSupply,
    supplies,
    tasks,
    updateTask,
  ]);

  return <HomeOpsContext.Provider value={value}>{children}</HomeOpsContext.Provider>;
}

export function useHomeOps() {
  const context = useContext(HomeOpsContext);

  if (!context) {
    throw new Error('useHomeOps must be used inside HomeOpsProvider');
  }

  return context;
}
