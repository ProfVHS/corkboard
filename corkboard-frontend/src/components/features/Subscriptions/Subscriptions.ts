import useReleaseSubscription from "@/features/Subscriptions/useReleaseSubscription.ts";
import useUserSubscription from "@/features/Subscriptions/useUserSubscription.ts";
import useWorkspaceSubscription from "@/features/Subscriptions/useWorkspaceSubscription.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { useAuth } from "@/context/auth/useAuth.ts";

const Subscriptions = () => {
    const workspaceId = useWorkspaceStore((s) => s.workspace?.id ?? null);
    const releaseId = useWorkspaceStore((s) => s.currentRelease?.id ?? null);
    const userId = useAuth().user?.id ?? null;

    useWorkspaceSubscription(workspaceId);
    useReleaseSubscription(releaseId);
    useUserSubscription(userId);

    return null;
};

export default Subscriptions;
