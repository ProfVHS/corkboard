import "./CurrentReleasePage.scss";
import { Button } from "@/ui/Button/Button.tsx";
import { useEffect, useState } from "react";
import { ReleaseBoard } from "@/features/ReleaseBoard/ReleaseBoard.tsx";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { Page } from "@/layout/Page/Page.tsx";
import { useReleaseSubscription } from "@/store/useReleaseSubscription.ts";
import { useAuth } from "@/context/auth/useAuth.ts";
import Loading from "@/ui/Loading/Loading.tsx";
import CreateModal from "@/ui/Modals/CreateModal.tsx";
import releasesApi from "@/api/releases.ts";
import workspacesApi from "@/api/workspaces.ts";
import CompleteReleaseModal, { type NotAcceptedTasksAction } from "@/pages/CurrentReleasePage/CompleteReleaseModal.tsx";
import useWorkspaceSubscription from "@/store/useWorkspaceSubscription.ts";

export const CurrentReleasePage = () => {
    const currentRelease = useWorkspaceStore((state) => state.currentRelease);
    const setCurrentRelease = useWorkspaceStore((state) => state.setCurrentRelease);
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const [showCreateReleaseModal, setShowCreateReleaseModal] = useState(false);
    const [showCompleteReleaseModal, setShowCompleteReleaseModal] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useAuth();

    useReleaseSubscription(currentRelease ? currentRelease.id : null, user ? user.id : null);
    useWorkspaceSubscription(workspaceId ?? null, user?.id ?? null);

    useEffect(() => {
        if (!workspaceId) return;

        workspacesApi.getCurrentRelease(workspaceId, (response) => {
            setCurrentRelease(response);
            setLoading(false);
        });
    }, [setCurrentRelease, workspaceId]);

    const handleCreateRelease = (data: { name: string }) => {
        if (!workspaceId) return;

        releasesApi.create({ name: data.name, workspace_id: workspaceId, status: "QUEUED" }, (response) => {
            setCurrentRelease(response);
            setShowCreateReleaseModal(false);
        });
    };

    const handleCompleteRelease = (tasksAction: NotAcceptedTasksAction) => {
        if (!workspaceId || !tasksAction) return;

        workspacesApi.completeRelease(workspaceId, tasksAction, (response) => {
            setCurrentRelease(response || null);
            setShowCompleteReleaseModal(false);
        });
    };

    const renderOptionsButtons = () => {
        return (
            <>
                {currentRelease && (
                    <Button color="primary" size="small" onClick={() => setShowCompleteReleaseModal(true)}>
                        Complete Release
                    </Button>
                )}
            </>
        );
    };

    if (loading) return <Loading overlay={true} />;

    return (
        <Page title="Current Release" subTitle={currentRelease?.name} className="current-release" buttons={renderOptionsButtons()}>
            {currentRelease && <ReleaseBoard releaseId={currentRelease.id} />}
            {!currentRelease && (
                <div className="current-release__no-active">
                    <span>There is no active release</span>
                    <Button onClick={() => setShowCreateReleaseModal(true)}>Create Release</Button>
                </div>
            )}

            {showCreateReleaseModal && <CreateModal title="Create new release" onSave={handleCreateRelease} onClose={() => setShowCreateReleaseModal(false)} />}
            {showCompleteReleaseModal && <CompleteReleaseModal onClose={() => setShowCompleteReleaseModal(false)} onSave={handleCompleteRelease} />}
        </Page>
    );
};
