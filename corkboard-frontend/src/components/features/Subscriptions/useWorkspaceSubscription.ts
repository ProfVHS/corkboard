import { useEffect } from "react";
import { cable } from "@/lib/cable.ts";
import type { User } from "@/context/auth/types.ts";
import type { ReleaseType } from "@/types/ReleaseType.ts";
import type { TaskType } from "@/types/ReleaseBoardTypes.ts";
import type { TagType } from "@/types/TagType.ts";
import type { DocumentType } from "@/types/DocumentType.ts";
import type { WorkspaceType } from "@/types/WorkspaceType.ts";
import { useReleasesCache } from "@/query/useReleases.ts";
import { useBacklogCache } from "@/query/useTasks.ts";
import { useCollaboratorsCache } from "@/query/useCollaborators.ts";
import { useTagsCache } from "@/query/useTags.ts";
import { useDocumentsCache } from "@/query/useDocuments.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import workspacesApi from "@/api/workspaces.ts";

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
          type: "delete_backlog_task" | "move_backlog_task" | "update_backlog_code_prefix";
          actor_id: string;
          tasks: TaskType[];
      }
    | {
          type: "create_tag" | "update_tag" | "delete_tag";
          actor_id: string;
          tag: TagType;
      }
    | {
          type: "update_workspace";
          actor_id: string;
          workspace: WorkspaceType;
      }
    | {
          type: "delete_workspace";
          actor_id: string;
      }
    | {
          type: "create_document" | "update_document" | "delete_document";
          actor_id: string;
          document: DocumentType;
      };

const useWorkspaceSubscription = (workspaceId?: string | null) => {
    const { addInvitedUser, removeInvitedUser, addCollaborator, removeCollaborator } = useCollaboratorsCache(workspaceId!);
    const { addRelease, updateRelease, setReleases } = useReleasesCache(workspaceId!);
    const { addTask, updateTask, setTasks: setBacklogTasks } = useBacklogCache(workspaceId!);
    const { addTag, updateTag, removeTag } = useTagsCache(workspaceId!);
    const { addDocument, updateDocument, removeDocument } = useDocumentsCache(workspaceId!);
    const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);

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
                        case "update_backlog_code_prefix":
                            setBacklogTasks(event.tasks);
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
                        case "update_workspace":
                            setWorkspace(event.workspace);
                            break;
                        case "delete_workspace":
                            workspacesApi.getAll((response) => {
                                setWorkspace(response[0]);
                            });
                            break;
                        case "create_document":
                            addDocument(event.document);
                            break;
                        case "update_document":
                            updateDocument(event.document.id, event.document);
                            break;
                        case "delete_document":
                            removeDocument(event.document.id);
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
