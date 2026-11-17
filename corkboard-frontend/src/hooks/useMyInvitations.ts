import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { WorkspaceInvitationType } from "@/types/WorkspaceType.ts";
import { invitationKeys } from "./queryKeys";

export function useMyInvitations() {
    return useQuery({
        queryKey: invitationKeys.mine(),
        queryFn: async () => {
            const { data } = await api.get<WorkspaceInvitationType[]>("workspaces/invitation");
            return data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useMyInvitationsCache() {
    const queryClient = useQueryClient();

    return useMemo(
        () => ({
            addInvitation: (invitation: WorkspaceInvitationType) =>
                queryClient.setQueryData<WorkspaceInvitationType[]>(invitationKeys.mine(), (old) =>
                    old && !old.some((i) => i.id === invitation.id) ? [invitation, ...old] : old,
                ),
            removeInvitation: (workspaceId: string) =>
                queryClient.setQueryData<WorkspaceInvitationType[]>(invitationKeys.mine(), (old) => old?.filter((i) => i.workspace.id !== workspaceId)),
            refetch: () => queryClient.invalidateQueries({ queryKey: invitationKeys.mine() }),
        }),
        [queryClient],
    );
}
