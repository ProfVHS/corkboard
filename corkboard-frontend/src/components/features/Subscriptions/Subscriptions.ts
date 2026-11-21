import useReleaseSubscription from "@/features/Subscriptions/useReleaseSubscription.ts";
import useUserSubscription from "@/features/Subscriptions/useUserSubscription.ts";
import useWorkspaceSubscription from "@/features/Subscriptions/useWorkspaceSubscription.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { useAuth } from "@/context/auth/useAuth.ts";
import { useCurrentRelease } from "@/query/useReleases.ts";

const Subscriptions = () => {
    const workspaceId = useWorkspaceStore((s) => s.workspace?.id);
    const userId = useAuth().user?.id;
    const { data: currentRelease } = useCurrentRelease(workspaceId);

    useWorkspaceSubscription(workspaceId);
    useReleaseSubscription(currentRelease?.id);
    useUserSubscription(userId);

    return null;
};

export default Subscriptions;
