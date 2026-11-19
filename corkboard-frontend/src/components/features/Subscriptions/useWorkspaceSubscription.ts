import { useEffect } from "react";
import { cable } from "@/lib/cable.ts";
import { useCollaboratorsCache } from "@/hooks/useCollaborators.ts";
import type { User } from "@/context/auth/types.ts";
import type { ReleaseType } from "@/types/ReleaseType.ts";
import { useReleasesCache } from "@/hooks/useReleases.ts";

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
      }
    | {
          type: "create_release" | "update_release";
          actor_id: string;
          release: ReleaseType;
      }
    | {
          type: "delete_release" | "move_release" | "complete_release" | "create_current_release";
          actor_id: string;
          releases: ReleaseType[];
      };

const useWorkspaceSubscription = (workspaceId?: string | null) => {
    const { addInvitedUser, removeInvitedUser, addCollaborator, removeCollaborator } = useCollaboratorsCache(workspaceId!);
    const { addRelease, updateRelease, setReleases } = useReleasesCache(workspaceId!);

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
                        case "accept_workspace_invite":
                            removeInvitedUser(event.invitedUser.id);
                            addCollaborator(event.invitedUser);
                            break;
                        case "cancel_workspace_invite":
                        case "decline_workspace_invite":
                            removeInvitedUser(event.invitedUser.id);
                            break;
                        case "leave_workspace":
                        case "delete_user":
                            removeCollaborator(event.user.id);
                            break;
                        case "create_release":
                            addRelease(event.release);
                            break;
                        case "update_release":
                            updateRelease(event.release);
                            break;
                        case "create_current_release":
                        case "delete_release":
                        case "move_release":
                        case "complete_release":
                            setReleases(event.releases);
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
