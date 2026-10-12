import type { Column, TaskType } from "@/types/ReleaseBoardTypes.ts";
import { create } from "zustand";
import { api } from "@/api";
import { useWorkspaceStore } from "./workspaceStore.ts";
import { insertTaskIntoColumn } from "./releaseBoardHelpers.ts";
import { v4 as uuid } from "uuid";

const INITIAL_STATE = {
    id: "",
    tasks: {},
    columns: [
        { id: "backlog", taskIds: [] },
        { id: "adjustments", taskIds: [] },
        { id: "todo", taskIds: [] },
        { id: "in_progress", taskIds: [] },
        { id: "review_pending", taskIds: [] },
        { id: "testing", taskIds: [] },
        { id: "accepted", taskIds: [] },
    ],
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

    fetchBoard: (releaseId: string, callback?: () => void) => void;
    fetchBacklog: (workspaceId: string) => void;

    addTask: (columnId: string, name: string) => void;
    updateTask: (taskId: string, task: Partial<TaskType>) => void;
    updateTaskUser: (taskId: string, userId: string) => void;
    moveToBacklog: (taskId: string) => void;
    deleteTask: (taskId: string) => void;
    moveTaskToNextRelease: (taskId: string) => void;

    getColumn: (id: string) => Column | undefined;
    getColumnByTaskId: (taskId: string) => Column | undefined;

    applyTaskCreated: (task: TaskType) => void;
    applyTaskDestroyed: (taskId: string) => void;
    applyTaskUpdated: (task: TaskType) => void;
}

export const useReleaseBoardStore = create<ReleaseBoardStore>((set, get) => ({
    ...INITIAL_STATE,
    activeTask: null,
    overColumnId: null,
    setActiveTask: (task) => set({ activeTask: task }),
    setOverColumnId: (id) => set({ overColumnId: id }),
    fetchBoard: (releaseId, callback) => {
        api.get(`/releases/${releaseId}/board`)
            .then((res) => {
                set({
                    id: releaseId,
                    tasks: res.data.tasks,
                    columns: res.data.columns,
                });
            })
            .then(() => callback && callback());
    },
    fetchBacklog: (workspaceId) => {
        api.get(`/backlog/${workspaceId}`).then((res) => {
            set((state) => {
                const taskIds = res.data.taskIds;
                return {
                    columns: [
                        ...state.columns,
                        {
                            id: "backlog",
                            taskIds: taskIds,
                        },
                    ],
                    tasks: { ...state.tasks, ...res.data.tasks },
                };
            });
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

        api.put(`/tasks/${activeId}`, { status: toColumnId, order: insertAt, release_id: get().id }).then(() => {
            get().updateTask(activeId, { status: toColumnId, order: insertAt, release_id: get().id });
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

        api.put(`/tasks/${activeId}`, { order: insertAt });
    },
    addTask: (columnId, name) => {
        const temporaryId = uuid();
        const column = get().columns.find((col) => col.id === columnId);
        const maxOrder =
            column?.taskIds.reduce((max, taskId) => {
                const taskOrder = get().tasks[taskId]?.order ?? 0;
                return Math.max(max, taskOrder);
            }, -1) ?? -1;
        const order = maxOrder + 1;
        const workspaceId = useWorkspaceStore.getState().workspace?.id;
        const newTask: TaskType = {
            id: temporaryId,
            name,
            order,
            release_id: columnId === "backlog" ? null : get().id,
            workspace_id: workspaceId || null,
            status: columnId,
            user: null,
            priority: null,
            tags: [],
            code_name: "",
        };
        set((state) => {
            return {
                tasks: {
                    ...state.tasks,
                    [temporaryId]: newTask,
                },
                columns: state.columns.map((col) =>
                    col.id === columnId
                        ? {
                              ...col,
                              taskIds: [...col.taskIds, temporaryId],
                          }
                        : col,
                ),
            };
        });
        api.post("/tasks", { ...newTask }).then((res) => {
            set((state) => {
                const tasks = { ...state.tasks };
                const savedTask = res.data;
                delete tasks[temporaryId];
                return {
                    tasks: { ...tasks, [savedTask.id]: savedTask },
                    columns: state.columns.map((col) =>
                        col.id === columnId
                            ? {
                                  ...col,
                                  taskIds: col.taskIds.map((taskId) => (taskId === temporaryId ? savedTask.id : taskId)),
                              }
                            : col,
                    ),
                };
            });
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
        api.put(`tasks/${taskId}`, { ...task });
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
        api.put(`tasks/${taskId}`, { status: "backlog" });
    },
    updateTaskUser: (taskId, userId) => {
        api.put(`tasks/${taskId}`, { user_id: userId }).then((response) => {
            const user = response.data.user ? { id: response.data.user.id, username: response.data.user.username } : null;

            set((state) => {
                return {
                    tasks: {
                        ...state.tasks,
                        [taskId]: { ...state.tasks[taskId], user },
                    },
                };
            });
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

        api.delete(`tasks/${taskId}`);
    },
    moveTaskToNextRelease: (taskId) => {
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

        api.put(`tasks/${taskId}/move_to_next_release`);
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
                columns: exists ? state.columns : insertTaskIntoColumn(state.columns, task.id, task.status, task.order),
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
            return {
                tasks: {
                    ...state.tasks,
                    [task.id]: {
                        ...state.tasks[task.id],
                        ...task,
                    },
                },
                columns: insertTaskIntoColumn(state.columns, task.id, task.status, task.order),
            };
        });
    },
}));
