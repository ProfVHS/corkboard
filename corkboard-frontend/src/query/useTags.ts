import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { TagType } from "@/types/TagType.ts";
import { tagKeys } from "@/query/queryKeys.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";

export function useTags<T = TagType[]>(workspaceId?: string, select?: (d: TagType[]) => T) {
    return useQuery({
        queryKey: tagKeys.list(workspaceId),
        queryFn: async () => (await api.get<TagType[]>(`/tags`, { params: { workspace_id: workspaceId } })).data,
        enabled: !!workspaceId,
        staleTime: 5 * 60 * 1000,
        select,
    });
}

export function useTagsCache(workspaceId?: string) {
    const queryClient = useQueryClient();

    return useMemo(() => {
        const key = tagKeys.list(workspaceId);
        const update = (fn: (old: TagType[]) => TagType[]) => queryClient.setQueryData<TagType[]>(key, (old) => (old ? fn(old) : old));

        return {
            setTags: (tags: TagType[]) => queryClient.setQueryData<TagType[]>(key, tags),
            addTag: (tag: TagType) => update((old) => (old.some((t) => t.id === tag.id) ? old.map((t) => (t.id === tag.id ? tag : t)) : [...old, tag])),
            updateTag: (tagId: string, changes: Partial<TagType>) => update((old) => old.map((t) => (t.id === tagId ? { ...t, ...changes } : t))),
            removeTag: (tagId: string) => update((old) => old.filter((t) => t.id !== tagId)),
            refetch: () => queryClient.invalidateQueries({ queryKey: key }),
        };
    }, [queryClient, workspaceId]);
}

export function useTaskTags(tagIds: string[]) {
    const workspaceId = useWorkspaceStore((s) => s.workspace?.id);

    return useTags(
        workspaceId,
        useCallback(
            (all: TagType[]) => {
                const byId = new Map(all.map((t) => [t.id, t]));
                return tagIds.map((id) => byId.get(id)).filter((t): t is TagType => !!t);
            },
            [tagIds],
        ),
    );
}
