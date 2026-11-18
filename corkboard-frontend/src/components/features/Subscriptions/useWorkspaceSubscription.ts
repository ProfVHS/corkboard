import { useEffect } from "react";
import { cable } from "@/lib/cable.ts";
import { useCollaboratorsCache } from "@/hooks/useCollaborators.ts";
import type { User } from "@/context/auth/types.ts";

type WorkspaceEvent =
    | {
          type: "send_workspace_invite" | "cancel_workspace_invite" | "accept_workspace_invite" | "decline_workspace_invite";
          actor_id: string;
          invitedUser: User;
      }
    | {
          type: "leave_workspace" | "delete_user";
          actor_id: string;
          user: User;
      };

const useWorkspaceSubscription = (workspaceId: string | null) => {
    const { addInvitedUser, removeInvitedUser, addCollaborator, removeCollaborator } = useCollaboratorsCache(workspaceId!);

    useEffect(() => {
        if (!workspaceId) return;

        const subscription = cable.subscriptions.create(
            {
                channel: "WorkspaceChannel",
                workspace_id: workspaceId,
            },
            {
                connected() {
                    console.log("Connected to Workspace", workspaceId);
                },
                disconnected: () => {
                    console.log("Disconnected from Workspace", workspaceId);
                },
                received: (event: WorkspaceEvent) => {
                    console.log(event);

                    switch (event.type) {
                        case "send_workspace_invite":
                            addInvitedUser(event.invitedUser);
                            break;
                        case "cancel_workspace_invite":
                            removeInvitedUser(event.invitedUser.id);
                            break;
                        case "accept_workspace_invite":
                            removeInvitedUser(event.invitedUser.id);
                            addCollaborator(event.invitedUser);
                            break;
                        case "decline_workspace_invite":
                            removeInvitedUser(event.invitedUser.id);
                            break;
                        case "leave_workspace":
                            removeCollaborator(event.user.id);
                            break;
                        case "delete_user":
                            removeCollaborator(event.user.id);
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
    }, [workspaceId]);
};

export default useWorkspaceSubscription;
