import type { TaskType } from "@/types/ReleaseBoardTypes.ts";
import { useEffect } from "react";
import { cable } from "@/lib/cable.ts";
import { useBacklogCache, useTasksCache } from "@/query/useTasks.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";

type ReleaseEvent =
    | {
          type: "create_task" | "update_task" | "update_task_tag";
          actor_id: string;
          task: TaskType;
      }
    | {
          type: "delete_task" | "move_to_next_task" | "move_board_task";
          actor_id: string;
          tasks: TaskType[];
      }
    | {
          type: "move_between_task";
          actor_id: string;
          board_tasks: TaskType[];
          backlog_tasks: TaskType[];
      };

const useReleaseSubscription = (releaseId?: string | null) => {
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const { addTask, updateTask, setTasks: setBoardTasks } = useTasksCache(releaseId!);
    const { setTasks: setBacklogTasks } = useBacklogCache(workspaceId!);

    useEffect(() => {
        if (!releaseId) return;

        const subscription = cable.subscriptions.create(
            {
                channel: "ReleaseChannel",
                release_id: releaseId,
            },
            {
                connected() {
                    console.log("Connected to Release", releaseId);
                },
                disconnected: () => {
                    console.log("Disconnected from Release", releaseId);
                },
                received: (event: ReleaseEvent) => {
                    console.log(event);
                    switch (event.type) {
                        case "create_task":
                            addTask(event.task);
                            break;
                        case "update_task":
                        case "update_task_tag":
                            updateTask(event.task.id, event.task);
                            break;
                        case "delete_task":
                        case "move_to_next_task":
                        case "move_board_task":
                            setBoardTasks(event.tasks);
                            break;
                        case "move_between_task":
                            setBoardTasks(event.board_tasks);
                            setBacklogTasks(event.backlog_tasks);
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
    }, [releaseId]);
};

export default useReleaseSubscription;
