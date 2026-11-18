import { useEffect } from "react";
import { cable } from "@/lib/cable.ts";
import type { WorkspaceInvitationType, WorkspaceType } from "@/types/WorkspaceType.ts";
import { useMyInvitationsCache } from "@/hooks/useMyInvitations.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";

type UserEvent =
    | {
          type: "send_workspace_invite" | "cancel_workspace_invite";
          actor_id: string;
          invitation: WorkspaceInvitationType;
      }
    | { type: "delete_user"; actor_id: string; workspace: WorkspaceType };

const useUserSubscription = (userId: string | null) => {
    const { addInvitation, removeInvitation } = useMyInvitationsCache();
    const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);

    useEffect(() => {
        if (!userId) return;

        const subscription = cable.subscriptions.create(
            {
                channel: "UserChannel",
                user_id: userId,
            },
            {
                connected() {
                    console.log("Connected to User", userId);
                },
                disconnected: () => {
                    console.log("Disconnected from User", userId);
                },
                received: (event: UserEvent) => {
                    switch (event.type) {
                        case "send_workspace_invite":
                            addInvitation(event.invitation);
                            break;
                        case "cancel_workspace_invite":
                            removeInvitation(event.invitation.workspace.id);
                            break;
                        case "delete_user":
                            setWorkspace(event.workspace);
                            break;
                        default:
                            break;
                    }
                },
            },
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [userId]);
};

export default useUserSubscription;
