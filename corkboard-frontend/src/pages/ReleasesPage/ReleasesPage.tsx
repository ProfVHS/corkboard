import "./ReleasesPage.scss";
import { useState } from "react";
import { Button } from "@/ui/Button/Button.tsx";
import type { ReleaseType } from "@/types/ReleaseType.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { Row } from "@/layout/Row/Row.tsx";
import { Page } from "@/layout/Page/Page.tsx";
import { ReleaseList } from "@/pages/ReleasesPage/ReleaseList/ReleaseList.tsx";
import Loading from "@/ui/Loading/Loading.tsx";
import ConfirmationModal from "@/ui/Modals/ConfirmationModal.tsx";
import CreateModal from "@/ui/Modals/CreateModal.tsx";
import { EditReleaseModal } from "./EditReleaseModal.tsx";
import releasesApi from "@/api/releases.ts";
import { useReleases, useReleasesCache } from "@/hooks/useReleases.ts";

export const ReleasesPage = () => {
    const [showCreateReleaseModal, setShowCreateReleaseModal] = useState<boolean>(false);
    const [releaseToDelete, setReleaseToDelete] = useState<ReleaseType | null>(null);
    const [releaseToEdit, setReleaseToEdit] = useState<ReleaseType | null>(null);
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const { data: releases, isLoading } = useReleases(workspaceId);
    const { setReleases } = useReleasesCache();

    const handleSave = (data: { name: string }) => {
        if (!workspaceId) return;

        releasesApi.create({ name: data.name, workspace_id: workspaceId, status: "NOT_QUEUED" }, () => {
            setShowCreateReleaseModal(false);
        });
    };

    const handleDelete = () => {
        if (!releaseToDelete) return;

        releasesApi.delete(releaseToDelete.id, () => {
            setReleaseToDelete(null);
        });
    };

    const handleEdit = (releaseId: string, name: string) => {
        releasesApi.update(releaseId, { name }, () => {
            setReleaseToEdit(null);
        });
    };

    if (isLoading) return <Loading overlay={true} />;

    return (
        <Page title="Releases" className="releases">
            <div className="releases__content">
                <div className="releases__list">
                    <Row>
                        Releases
                        <Button variant="square" color="outlined" size="large" onClick={() => setShowCreateReleaseModal(true)}>
                            Create a new Release
                        </Button>
                        <div className="releases__tabs">
                            <Button variant="square" color="outlined" size="large">
                                Not Queued
                            </Button>

                            <Button variant="square" color="outlined" size="large">
                                Completed
                            </Button>
                        </div>
                    </Row>
                    <ReleaseList
                        columnId="NOT_QUEUED"
                        releases={releases!.filter((r) => r.status !== "QUEUED")}
                        onMove={setReleases}
                        onEdit={setReleaseToEdit}
                        onDelete={setReleaseToDelete}
                    />
                </div>

                <div className="releases__list">
                    Queue
                    <ReleaseList
                        columnId="QUEUED"
                        releases={releases!.filter((r) => r.status !== "NOT_QUEUED")}
                        onMove={setReleases}
                        onEdit={setReleaseToEdit}
                        onDelete={setReleaseToDelete}
                    />
                </div>
            </div>
            {showCreateReleaseModal && <CreateModal title="Create new release" onSave={handleSave} onClose={() => setShowCreateReleaseModal(false)} />}
            {releaseToDelete && (
                <ConfirmationModal
                    title="Delete Release:"
                    subtitle={releaseToDelete.name}
                    message={
                        <>
                            Are you sure that you want to delete this release?
                            <br />
                            (All tasks assigned to this release will be moved to the backlog)
                        </>
                    }
                    onDelete={handleDelete}
                    onClose={() => setReleaseToDelete(null)}
                />
            )}

            {releaseToEdit && (
                <EditReleaseModal
                    onClose={() => setReleaseToEdit(null)}
                    releaseName={releaseToEdit.name}
                    onSave={(name: string) => handleEdit(releaseToEdit.id, name)}
                />
            )}
        </Page>
    );
};
