import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { ReleaseType } from "@/types/ReleaseType.ts";
import { releaseKeys } from "./queryKeys";

const selectAll = (d: ReleaseType[]) => d;
const selectCurrent = (d: ReleaseType[]) => d.find((r) => r.current) ?? null;
const selectNext = (d: ReleaseType[]) => d.find((r) => r.next) ?? null;
const selectQueued = (d: ReleaseType[]) => d.filter((r) => r.status === "QUEUED");
const selectNotQueued = (d: ReleaseType[]) => d.filter((r) => r.status === "NOT_QUEUED");

function useReleasesQuery<T>(workspaceId: string | undefined, select: (d: ReleaseType[]) => T) {
    return useQuery({
        queryKey: releaseKeys.list(workspaceId),
        queryFn: async () => {
            const { data } = await api.get<ReleaseType[]>(`/releases`, { params: { workspace_id: workspaceId } });
            return data;
        },
        enabled: !!workspaceId,
        staleTime: 5 * 60 * 1000,
        select,
    });
}

export const useReleases = (workspaceId?: string) => useReleasesQuery(workspaceId, selectAll);
export const useCurrentRelease = (workspaceId?: string) => useReleasesQuery(workspaceId, selectCurrent);
export const useNextRelease = (workspaceId?: string) => useReleasesQuery(workspaceId, selectNext);
export const useQueuedReleases = (workspaceId?: string) => useReleasesQuery(workspaceId, selectQueued);
export const useNotQueuedReleases = (workspaceId?: string) => useReleasesQuery(workspaceId, selectNotQueued);

export function useReleasesCache(workspaceId?: string) {
    const queryClient = useQueryClient();

    return useMemo(() => {
        const key = releaseKeys.list(workspaceId);
        const update = (fn: (old: ReleaseType[]) => ReleaseType[]) => queryClient.setQueryData<ReleaseType[]>(key, (old) => (old ? fn(old) : old));

        return {
            setReleases: (releases: ReleaseType[]) => queryClient.setQueryData<ReleaseType[]>(key, releases),

            addRelease: (release: ReleaseType) =>
                update((old) => (old.some((r) => r.id === release.id) ? old.map((r) => (r.id === release.id ? release : r)) : [...old, release])),

            updateRelease: (release: ReleaseType) => update((old) => old.map((r) => (r.id === release.id ? release : r))),

            refetch: () => queryClient.invalidateQueries({ queryKey: key }),
        };
    }, [queryClient, workspaceId]);
}
