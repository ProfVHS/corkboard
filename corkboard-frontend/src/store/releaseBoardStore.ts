import type { Column, TaskStatus, TaskType } from "@/types/ReleaseBoardTypes.ts";
import { create } from "zustand";
import { insertTaskIntoColumn } from "./releaseBoardHelpers.ts";
import type { TagType } from "@/types/TagType.ts";

const initialState = {
    id: "",
    tasks: {} as Record<string, TaskType>,
    columns: [
        { id: "backlog" as TaskStatus, taskIds: [] as string[] },
        { id: "adjustments" as TaskStatus, taskIds: [] as string[] },
        { id: "todo" as TaskStatus, taskIds: [] as string[] },
        { id: "in_progress" as TaskStatus, taskIds: [] as string[] },
        { id: "review_pending" as TaskStatus, taskIds: [] as string[] },
        { id: "testing" as TaskStatus, taskIds: [] as string[] },
        { id: "accepted" as TaskStatus, taskIds: [] as string[] },
    ],
    activeTask: null as TaskType | null,
    overColumnId: null as string | null,
};

export type BoardColumnResponse = {
    id: TaskStatus;
    tasks: TaskType[];
};

interface ReleaseBoardStore {
    id: string;
    tasks: Record<string, TaskType>;
    columns: Column[];

    activeTask: TaskType | null;
    overColumnId: string | null;
    setActiveTask: (task: TaskType | null) => void;
    setOverColumnId: (id: string | null) => void;

    moveTaskBetweenColumns: (activeId: string, fromColumnId: string, toColumnId: string, insertAt?: number) => void;
    reorderTaskInColumn: (columnId: string, activeId: string, insertAt: number) => void;
    setBoard: (releaseId: string, data: { columns: BoardColumnResponse[] }) => void;
    setBacklog: (data: { taskIds?: string[]; tasks?: Record<string, TaskType> }) => void;

    addTask: (columnId: string, task: TaskType) => void;
    updateTask: (taskId: string, task: Partial<TaskType>) => void;
    deleteTask: (taskId: string) => void;

    addTagToTask: (taskId: string, tag: TagType) => void;
    removeTagFromTask: (taskId: string, tagId: string) => void;
    moveToBacklog: (taskId: string) => void;
    moveToNextRelease: (taskId: string) => void;

    getColumn: (id: string) => Column | undefined;
    getColumnByTaskId: (taskId: string) => Column | undefined;

    applyTaskCreated: (task: TaskType) => void;
    applyTaskDestroyed: (taskId: string) => void;
    applyTaskUpdated: (task: TaskType) => void;

    reset: () => void;
}

export const useReleaseBoardStore = create<ReleaseBoardStore>((set, get) => ({
    ...initialState,
    activeTask: null,
    overColumnId: null,
    setActiveTask: (task) => set({ activeTask: task }),
    setOverColumnId: (id) => set({ overColumnId: id }),
    setBoard: (releaseId, { columns }) => {
        set((state) => {
            const backlogColumn = state.columns.find((c) => c.id === "backlog");
            const tasks: Record<string, TaskType> = {};
            backlogColumn?.taskIds.forEach((id) => {
                if (state.tasks[id]) tasks[id] = state.tasks[id];
            });

            const newColumns: Column[] = columns.map((col) => {
                col.tasks.forEach((task) => {
                    tasks[task.id] = task;
                });
                return { id: col.id, taskIds: col.tasks.map((t) => t.id) };
            });

            return {
                id: releaseId,
                tasks,
                columns: backlogColumn ? [backlogColumn, ...newColumns] : newColumns,
            };
        });
    },
    setBacklog: ({ taskIds = [], tasks = {} }) => {
        set((state) => {
            const exists = state.columns.some((col) => col.id === "backlog");

            return {
                tasks: { ...state.tasks, ...tasks },
                columns: exists
                    ? state.columns.map((col) => (col.id === "backlog" ? { ...col, taskIds } : col))
                    : [...state.columns, { id: "backlog", taskIds }],
            };
        });
    },
    moveTaskBetweenColumns: (activeId, fromColumnId, toColumnId, insertAt) => {
        set((state) => {
            const toColumn = state.columns.find((col) => col.id === toColumnId);
            if (toColumn?.taskIds.includes(activeId)) return state;

            return {
                columns: state.columns.map((col) => {
                    if (col.id === fromColumnId) {
                        return { ...col, taskIds: col.taskIds.filter((id) => id !== activeId) };
                    }

                    if (col.id === toColumnId) {
                        const newIds = [...col.taskIds];
                        newIds.splice(typeof insertAt === "number" ? insertAt : newIds.length, 0, activeId);
                        return { ...col, taskIds: newIds };
                    }
                    return col;
                }),
            };
        });
    },
    reorderTaskInColumn: (columnId, activeId, insertAt) => {
        set((state) => ({
            columns: state.columns.map((col) => {
                if (col.id !== columnId) return col;
                const newIds = col.taskIds.filter((id) => id !== activeId);
                newIds.splice(insertAt, 0, activeId);
                return { ...col, taskIds: newIds };
            }),
        }));
    },
    addTask: (columnId, task) => {
        set((state) => {
            const tasks = state.tasks ?? {};
            if (tasks[task.id]) return state;

            return {
                tasks: { ...tasks, [task.id]: task },
                columns: state.columns.map((col) =>
                    col.id === columnId && !col.taskIds.includes(task.id) ? { ...col, taskIds: [...col.taskIds, task.id] } : col,
                ),
            };
        });
    },
    updateTask: (taskId, task) => {
        set((state) => {
            return {
                tasks: {
                    ...state.tasks,
                    [taskId]: { ...state.tasks[taskId], ...task },
                },
            };
        });
    },
    deleteTask: (taskId) => {
        set((state) => {
            const tasks = { ...state.tasks };
            delete tasks[taskId];
            return {
                tasks: tasks,
                columns: state.columns.map((col) => ({
                    ...col,
                    taskIds: col.taskIds.filter((id) => id !== taskId),
                })),
            };
        });
    },
    addTagToTask: (taskId, tag) => {
        set((state) => {
            const task = state.tasks[taskId];
            if (!task) return state;

            return {
                tasks: {
                    ...state.tasks,
                    [taskId]: { ...task, tags: [...task.tags, tag] },
                },
            };
        });
    },
    removeTagFromTask: (taskId, tagId) => {
        set((state) => {
            const task = state.tasks[taskId];
            if (!task) return state;

            return {
                tasks: {
                    ...state.tasks,
                    [taskId]: {
                        ...task,
                        tags: (task.tags ?? []).filter((t) => t.id !== tagId),
                    },
                },
            };
        });
    },
    moveToBacklog: (taskId) => {
        set((state) => {
            const task = state.tasks[taskId];
            return {
                columns: state.columns.map((col) => {
                    if (col.id === task.status) {
                        return {
                            ...col,
                            taskIds: col.taskIds.filter((id) => id !== taskId),
                        };
                    } else if (col.id === "backlog") {
                        return {
                            ...col,
                            taskIds: [...col.taskIds, taskId],
                        };
                    } else {
                        return col;
                    }
                }),
            };
        });
    },
    moveToNextRelease: (taskId) => {
        set((state) => {
            const tasks = { ...state.tasks };
            delete tasks[taskId];
            return {
                tasks: tasks,
                columns: state.columns.map((col) => ({
                    ...col,
                    taskIds: col.taskIds.filter((id) => id !== taskId),
                })),
            };
        });
    },
    getColumn: (id) => {
        return get().columns.find((col) => col.id === id);
    },
    getColumnByTaskId: (taskId) => {
        return get().columns.find((col) => col.taskIds.includes(taskId));
    },
    applyTaskCreated: (task: TaskType) => {
        set((state) => {
            const exists = Boolean(state.tasks[task.id]);

            return {
                tasks: {
                    ...state.tasks,
                    [task.id]: task,
                },
                columns: exists ? state.columns : insertTaskIntoColumn(state.columns, task.id, task.status, task.position),
            };
        });
    },
    applyTaskDestroyed: (taskId) => {
        set((state) => {
            const tasks = { ...state.tasks };
            delete tasks[taskId];

            return {
                tasks,
                columns: state.columns.map((col) => ({
                    ...col,
                    taskIds: col.taskIds.filter((id) => id !== taskId),
                })),
            };
        });
    },
    applyTaskUpdated: (task) => {
        set((state) => {
            const prev = state.tasks[task.id];
            const moved = !prev || prev.status !== task.status || prev.position !== task.position;

            return {
                tasks: {
                    ...state.tasks,
                    [task.id]: { ...prev, ...task },
                },
                columns: moved ? insertTaskIntoColumn(state.columns, task.id, task.status, task.position) : state.columns,
            };
        });
    },
    reset: () => set(initialState),
}));
