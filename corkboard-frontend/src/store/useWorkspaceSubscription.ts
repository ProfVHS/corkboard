import { useEffect } from "react";
import { cable } from "@/lib/cable.ts";
import type { ReleaseType } from "@/types/ReleaseType.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";

type WorkspaceEvent = {
    type: string;
    actor_id: string;
    releases: ReleaseType[];
    current_release: ReleaseType;
    next_release: ReleaseType;
};

const useWorkspaceSubscription = (workspaceId: string | null, userId: string | null, callback?: (releases: ReleaseType[]) => void) => {
    const setCurrentRelease = useWorkspaceStore((state) => state.setCurrentRelease);
    const setNextRelease = useWorkspaceStore((state) => state.setNextRelease);

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
                    if (event.actor_id !== userId) {
                        console.log(event);
                        setCurrentRelease(event.current_release);
                        setNextRelease(event.next_release);
                        callback?.(event.releases);
                    }
                },
            },
        );

        return () => {
            subscription.unsubscribe();
        };
    }, [workspaceId, userId, callback, setCurrentRelease, setNextRelease]);
};

export default useWorkspaceSubscription;
