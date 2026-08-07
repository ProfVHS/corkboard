import "./CurrentReleasePage.scss";
import { Button } from "../../components/ui/Button/Button.tsx";
import { useEffect, useState } from "react";
import { api } from "../../api/api.ts";
import { ReleaseBoard } from "../../components/features/ReleaseBoard/ReleaseBoard.tsx";
import type { ReleaseType } from "../../types/ReleaseType.ts";
import { useWorkspaceStore } from "../../store/workspaceStore.ts";
import { CreateReleaseModal } from "../ReleasesPage/CreateReleaseModal.tsx";
import { useReleasesStore } from "../../store/releasesStore.ts";
import { CompleteReleaseModal } from "./CompleteReleaseModal.tsx";
import { Page } from "../../components/layout/Page/Page.tsx";
import { useReleaseSubscription } from "../../store/useReleaseSubscription.ts";
import { useAuth } from "../../context/auth/useAuth.ts";
import Loading from "../../components/ui/Loading/Loading.tsx";

export const CurrentReleasePage = () => {
    const [release, setRelease] = useState<ReleaseType | null>(null);
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const [showCreateReleaseModal, setShowCreateReleaseModal] = useState(false);
    const [showCompleteReleaseModal, setShowCompleteReleaseModal] = useState(false);
    const addRelease = useReleasesStore((state) => state.addRelease);
    const [loading, setLoading] = useState<boolean>(true);
    const { user } = useAuth();

    useReleaseSubscription(release ? release.id : null, user ? user.id : null);

    useEffect(() => {
        if (workspaceId) {
            api.get(`/workspaces/${workspaceId}/current_release`).then((res) => {
                setRelease(res.data);
                setLoading(false);
            });
        }
    }, [workspaceId]);

    const handleCreateRelease = (name: string) => {
        addRelease(name, workspaceId!, "QUEUED", (release: ReleaseType) => setRelease(release));
        setShowCreateReleaseModal(false);
    };

    const handleCompleteRelease = () => {
        api.post(`/workspaces/${workspaceId}/complete_release`).then((res) => {
            setRelease(res.data || null);
            setShowCompleteReleaseModal(false);
        });
    };

    const renderOptionsButtons = () => {
        return (
            <>
                {release && (
                    <Button color="primary" size="small" onClick={() => setShowCompleteReleaseModal(true)}>
                        Complete Release
                    </Button>
                )}
            </>
        );
    };

    if (loading) return <Loading overlay={true} />;

    return (
        <Page title="Current Release" subTitle={release?.name} className="current-release" buttons={renderOptionsButtons()}>
            {release && <ReleaseBoard releaseId={release.id} />}
            {!release && (
                <div className="current-release__no-active">
                    <span>There is no active release</span>
                    <Button onClick={() => setShowCreateReleaseModal(true)}>Create Release</Button>
                </div>
            )}

            {showCreateReleaseModal && <CreateReleaseModal onSave={handleCreateRelease} onClose={() => setShowCreateReleaseModal(false)} />}
            {showCompleteReleaseModal && <CompleteReleaseModal onComplete={handleCompleteRelease} onClose={() => setShowCompleteReleaseModal(false)} />}
        </Page>
    );
};
