import { useEffect } from "react";
import { cable } from "@/lib/cable.ts";
import { useCollaboratorsCache } from "@/query/useCollaborators.ts";
import type { User } from "@/context/auth/types.ts";
import type { ReleaseType } from "@/types/ReleaseType.ts";
import { useCurrentRelease, useReleasesCache } from "@/query/useReleases.ts";
import { useBacklogCache, useTasksCache } from "@/query/useTasks.ts";
import type { TaskType } from "@/types/ReleaseBoardTypes.ts";
import type { TagType } from "@/types/TagType.ts";
import { useTagsCache } from "@/query/useTags.ts";

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
      }
    | {
          type: "create_backlog_task" | "update_backlog_task" | "update_backlog_task_tag";
          actor_id: string;
          task: TaskType;
      }
    | {
          type: "delete_backlog_task" | "move_backlog_task";
          actor_id: string;
          tasks: TaskType[];
      }
    | {
          type: "move_between_task";
          actor_id: string;
          board_tasks: TaskType[];
          backlog_tasks: TaskType[];
      }
    | {
          type: "create_tag" | "update_tag" | "delete_tag";
          actor_id: string;
          tag: TagType;
      };

const useWorkspaceSubscription = (workspaceId?: string | null) => {
    const { data: release } = useCurrentRelease(workspaceId!);
    const { addInvitedUser, removeInvitedUser, addCollaborator, removeCollaborator } = useCollaboratorsCache(workspaceId!);
    const { addRelease, updateRelease, setReleases } = useReleasesCache(workspaceId!);
    const { addTask, updateTask, setTasks: setBacklogTasks } = useBacklogCache(workspaceId!);
    const { setTasks: setBoardTasks } = useTasksCache(release?.id);
    const { addTag, updateTag, removeTag } = useTagsCache(workspaceId!);

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
                        case "create_backlog_task":
                            addTask(event.task);
                            break;
                        case "update_backlog_task":
                        case "update_backlog_task_tag":
                            updateTask(event.task.id, event.task);
                            break;
                        case "delete_backlog_task":
                        case "move_backlog_task":
                            setBacklogTasks(event.tasks);
                            break;
                        case "move_between_task":
                            setBoardTasks(event.board_tasks);
                            setBacklogTasks(event.backlog_tasks);
                            break;
                        case "create_tag":
                            addTag(event.tag);
                            break;
                        case "update_tag":
                            updateTag(event.tag.id, event.tag);
                            break;
                        case "delete_tag":
                            removeTag(event.tag.id);
                            break;
                        default:
                            console.error(event);
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
