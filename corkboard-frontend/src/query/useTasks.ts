import { useMemo } from "react";
import { useQuery, useQueryClient, type QueryClient, useQueries } from "@tanstack/react-query";
import type { TaskStatus, TaskType } from "@/types/ReleaseBoardTypes.ts";
import { taskKeys } from "@/query/queryKeys.ts";
import { api } from "@/api";

const COLUMN_ORDER: TaskStatus[] = ["adjustments", "todo", "in_progress", "review_pending", "testing", "accepted"];
const bySort = (a: TaskType, b: TaskType) => a.position - b.position;

const selectColumns = (tasks: TaskType[]) => COLUMN_ORDER.map((id) => ({ id, tasks: tasks.filter((t) => t.status === id).sort(bySort) }));
const selectSorted = (tasks: TaskType[]) => [...tasks].sort(bySort);

function useBoardQuery<T>(releaseId: string | undefined, select: (d: TaskType[]) => T) {
    return useQuery({
        queryKey: taskKeys.board(releaseId),
        queryFn: async () => (await api.get<TaskType[]>(`/tasks`, { params: { release_id: releaseId } })).data,
        enabled: !!releaseId,
        staleTime: 5 * 60 * 1000,
        select,
    });
}
export const useBoardColumns = (releaseId?: string) => useBoardQuery(releaseId, selectColumns);
export const useBoardTask = (releaseId: string | undefined, taskId: string) => useBoardQuery(releaseId, (d) => d.find((t) => t.id === taskId));

function useBacklogQuery<T>(workspaceId: string | undefined, select: (d: TaskType[]) => T) {
    return useQuery({
        queryKey: taskKeys.backlog(workspaceId),
        queryFn: async () => (await api.get<TaskType[]>(`/workspaces/${workspaceId}/backlog`)).data,
        enabled: !!workspaceId,
        staleTime: 5 * 60 * 1000,
        select,
    });
}
export const useBacklogTasks = (workspaceId?: string) => useBacklogQuery(workspaceId, selectSorted);
export const useBacklogTask = (workspaceId: string | undefined, taskId: string) => useBacklogQuery(workspaceId, (d) => d.find((t) => t.id === taskId));

const createCache = (queryClient: QueryClient, key: readonly unknown[]) => {
    const update = (fn: (old: TaskType[]) => TaskType[]) => queryClient.setQueryData<TaskType[]>(key, (old) => (old ? fn(old) : old));
    return {
        setTasks: (tasks: TaskType[]) => queryClient.setQueryData<TaskType[]>(key, tasks),
        addTask: (task: TaskType) => update((old) => (old.some((t) => t.id === task.id) ? old.map((t) => (t.id === task.id ? task : t)) : [...old, task])),
        updateTask: (taskId: string, changes: Partial<TaskType>) => update((old) => old.map((t) => (t.id === taskId ? { ...t, ...changes } : t))),
        refetch: () => queryClient.invalidateQueries({ queryKey: key }),
    };
};

export function useTasksCache(releaseId?: string) {
    const queryClient = useQueryClient();
    return useMemo(() => createCache(queryClient, taskKeys.board(releaseId)), [queryClient, releaseId]);
}

export function useBacklogCache(workspaceId?: string) {
    const queryClient = useQueryClient();
    return useMemo(() => createCache(queryClient, taskKeys.backlog(workspaceId)), [queryClient, workspaceId]);
}

export function useRefreshTasks(workspaceId?: string) {
    const queryClient = useQueryClient();
    return useMemo(
        () => () => {
            queryClient.invalidateQueries({ queryKey: ["releases"] });
            queryClient.invalidateQueries({ queryKey: taskKeys.backlog(workspaceId) });
        },
        [queryClient, workspaceId],
    );
}

export function useTask(taskId: string, releaseId?: string, workspaceId?: string) {
    const results = useQueries({
        queries: [
            {
                queryKey: taskKeys.board(releaseId),
                queryFn: async () => (await api.get<TaskType[]>(`/releases/${releaseId}/tasks`)).data,
                enabled: !!releaseId,
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: taskKeys.backlog(workspaceId),
                queryFn: async () => (await api.get<TaskType[]>(`/workspaces/${workspaceId}/backlog`)).data,
                enabled: !!workspaceId,
                staleTime: 5 * 60 * 1000,
            },
        ],
        combine: (results) => ({
            task: results[0].data?.find((t) => t.id === taskId) ?? results[1].data?.find((t) => t.id === taskId),
            isLoading: results.some((r) => r.isLoading),
        }),
    });

    return results;
}
