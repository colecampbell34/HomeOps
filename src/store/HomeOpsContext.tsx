import { PropsWithChildren, createContext, useContext, useMemo, useState } from 'react';

import { seedCompletions, seedHome, seedRooms, seedTasks } from '../data/seed';
import { addRecurrence, compareDueDate, getTaskStatus, toISODate, today } from '../utils/dates';
import { Home, MaintenanceTask, Room, TaskCompletion } from '../types';

type HomeOpsState = {
  home: Home;
  rooms: Room[];
  tasks: MaintenanceTask[];
  completions: TaskCompletion[];
  overdueTasks: MaintenanceTask[];
  upcomingTasks: MaintenanceTask[];
  recentCompletions: Array<TaskCompletion & { task?: MaintenanceTask }>;
  completeTask: (taskId: string, notes?: string) => void;
  getRoomName: (roomId?: string) => string;
};

const HomeOpsContext = createContext<HomeOpsState | undefined>(undefined);

export function HomeOpsProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(seedTasks);
  const [completions, setCompletions] = useState<TaskCompletion[]>(seedCompletions);

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
      home: seedHome,
      rooms: seedRooms,
      tasks: activeTasks,
      completions,
      overdueTasks,
      upcomingTasks,
      recentCompletions,
      completeTask: (taskId: string, notes?: string) => {
        const completedAt = toISODate(today());

        setTasks((currentTasks) =>
          currentTasks.map((task) => {
            if (task.id !== taskId) {
              return task;
            }

            return {
              ...task,
              lastCompletedAt: completedAt,
              nextDueAt: toISODate(addRecurrence(today(), task.recurrenceType, task.recurrenceInterval)),
              updatedAt: completedAt,
            };
          }),
        );

        setCompletions((currentCompletions) => [
          {
            id: `completion-${taskId}-${Date.now()}`,
            taskId,
            completedAt,
            notes,
          },
          ...currentCompletions,
        ]);
      },
      getRoomName: (roomId?: string) => seedRooms.find((room) => room.id === roomId)?.name ?? 'Whole home',
    };
  }, [completions, tasks]);

  return <HomeOpsContext.Provider value={value}>{children}</HomeOpsContext.Provider>;
}

export function useHomeOps() {
  const context = useContext(HomeOpsContext);

  if (!context) {
    throw new Error('useHomeOps must be used inside HomeOpsProvider');
  }

  return context;
}
