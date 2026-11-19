import "./CurrentReleasePage.scss";
import { Button } from "@/ui/Button/Button.tsx";
import { useState } from "react";
import { ReleaseBoard } from "@/features/ReleaseBoard/ReleaseBoard.tsx";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { Page } from "@/layout/Page/Page.tsx";
import Loading from "@/ui/Loading/Loading.tsx";
import CreateModal from "@/ui/Modals/CreateModal.tsx";
import releasesApi from "@/api/releases.ts";
import workspacesApi from "@/api/workspaces.ts";
import CompleteReleaseModal, { type NotAcceptedTasksAction } from "@/pages/CurrentReleasePage/CompleteReleaseModal.tsx";
import { useCurrentRelease } from "@/hooks/useReleases.ts";

export const CurrentReleasePage = () => {
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const { data: currentRelease, isLoading } = useCurrentRelease(workspaceId!);

    const [showCreateReleaseModal, setShowCreateReleaseModal] = useState(false);
    const [showCompleteReleaseModal, setShowCompleteReleaseModal] = useState(false);

    const handleCreateRelease = (data: { name: string }) => {
        if (!workspaceId) return;

        releasesApi.create({ name: data.name, workspace_id: workspaceId, status: "QUEUED" }, () => {
            setShowCreateReleaseModal(false);
        });
    };

    const handleCompleteRelease = (tasksAction: NotAcceptedTasksAction) => {
        if (!workspaceId || !tasksAction) return;

        workspacesApi.completeRelease(workspaceId, tasksAction, () => {
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

    if (isLoading) return <Loading overlay={true} />;

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
