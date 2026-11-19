import type { TaskType } from "@/types/ReleaseBoardTypes.ts";
import { useEffect } from "react";
import { cable } from "@/lib/cable.ts";
import { useReleaseBoardStore } from "@/store/releaseBoardStore.ts";

type ReleaseEvent = {
    type: "create_task" | "update_task" | "delete_task" | "move_to_next_task";
    actor_id: string;
    task: TaskType;
};

const useReleaseSubscription = (releaseId?: string | null) => {
    const applyTaskCreated = useReleaseBoardStore((state) => state.applyTaskCreated);
    const applyTaskDestroyed = useReleaseBoardStore((state) => state.applyTaskDestroyed);
    const applyTaskUpdated = useReleaseBoardStore((state) => state.applyTaskUpdated);

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
                    switch (event.type) {
                        case "create_task":
                            applyTaskCreated(event.task);
                            break;
                        case "update_task":
                            applyTaskUpdated(event.task);
                            break;
                        case "delete_task":
                        case "move_to_next_task":
                            applyTaskDestroyed(event.task.id);
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
