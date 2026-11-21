import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { User } from "@/context/auth/types.ts";
import { workspaceKeys } from "./queryKeys.ts";

export type CollaboratorsResponse = {
    collaborators: User[];
    invited_users: User[];
};

const selectAll = (d: CollaboratorsResponse) => d;
const selectCollaborators = (d: CollaboratorsResponse) => d.collaborators;
const selectInvitedUsers = (d: CollaboratorsResponse) => d.invited_users;

function useCollaboratorsQuery<T>(workspaceId: string | undefined, select: (data: CollaboratorsResponse) => T) {
    return useQuery({
        queryKey: workspaceKeys.collaborators(workspaceId),
        queryFn: async () => {
            const { data } = await api.get<CollaboratorsResponse>(`/workspaces/${workspaceId}/collaborators`);
            return data;
        },
        enabled: !!workspaceId,
        staleTime: 5 * 60 * 1000,
        select,
    });
}

export const useCollaborators = (workspaceId?: string) => useCollaboratorsQuery(workspaceId, selectCollaborators);
export const useInvitedUsers = (workspaceId?: string) => useCollaboratorsQuery(workspaceId, selectInvitedUsers);
export const useCollaboratorsData = (workspaceId?: string) => useCollaboratorsQuery(workspaceId, selectAll);

export function useCollaboratorsCache(workspaceId?: string) {
    const queryClient = useQueryClient();

    const update = useCallback(
        (fn: (old: CollaboratorsResponse) => CollaboratorsResponse) => {
            queryClient.setQueryData<CollaboratorsResponse>(workspaceKeys.collaborators(workspaceId), (old) => (old ? fn(old) : old));
        },
        [queryClient, workspaceId],
    );

    return useMemo(
        () => ({
            addCollaborator: (user: User) =>
                update((old) => ({
                    ...old,
                    collaborators: old.collaborators.some((u) => u.id === user.id) ? old.collaborators : [...old.collaborators, user],
                })),
            removeCollaborator: (userId: string) =>
                update((old) => ({
                    ...old,
                    collaborators: old.collaborators.filter((u) => u.id !== userId),
                })),
            updateCollaborator: (userId: string, changes: Partial<User>) =>
                update((old) => ({
                    ...old,
                    collaborators: old.collaborators.map((u) => (u.id === userId ? { ...u, ...changes } : u)),
                })),
            addInvitedUser: (user: User) =>
                update((old) => ({
                    ...old,
                    invited_users: old.invited_users.some((u) => u.id === user.id) ? old.invited_users : [...old.invited_users, user],
                })),
            removeInvitedUser: (userId: string) =>
                update((old) => ({
                    ...old,
                    invited_users: old.invited_users.filter((u) => u.id !== userId),
                })),
            refetch: () => queryClient.invalidateQueries({ queryKey: workspaceKeys.collaborators(workspaceId) }),
        }),
        [update, queryClient, workspaceId],
    );
}
