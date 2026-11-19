import "./BacklogPage.scss";
import { Page } from "@/layout/Page/Page.tsx";
import { BacklogColumn } from "@/pages/BacklogPage/BacklogColumn/BacklogColumn.tsx";
import { useEffect, useState } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { useReleaseBoardStore } from "@/store/releaseBoardStore.ts";
import { BoardColumn } from "@/features/BoardColumn/BoardColumn.tsx";
import { useShallow } from "zustand/react/shallow";
import Loading from "@/ui/Loading/Loading.tsx";
import workspacesApi from "@/api/workspaces.ts";
import releasesApi from "@/api/releases.ts";
import { useCurrentRelease } from "@/hooks/useReleases.ts";

export const BacklogPage = () => {
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const { data: currentRelease } = useCurrentRelease(workspaceId!);

    const setBacklog = useReleaseBoardStore((state) => state.setBacklog);
    const setBoard = useReleaseBoardStore((state) => state.setBoard);

    const columnIds = useReleaseBoardStore(useShallow((state) => state.columns.map((col) => col.id)));
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!workspaceId) return;

        workspacesApi.getCurrentRelease(workspaceId, (response) => {
            if (response?.id) {
                releasesApi.getBoard(response.id, (board) => {
                    setBoard(response.id, board);
                });
            }

            workspacesApi.getBacklog(workspaceId, (response) => {
                setBacklog(response);
                setLoading(false);
            });
        });
    }, [workspaceId, setBoard, setBacklog]);

    if (loading) return <Loading overlay={true} />;

    return (
        <Page title="Backlog" subTitle={currentRelease?.name} className="backlog-page">
            <BacklogColumn title="Backlog" icon="rows">
                <BoardColumn columnId="backlog" key="backlog" releaseId={null} isCreateTaskOpen={isCreateTaskOpen} setIsCreateTaskOpen={setIsCreateTaskOpen} />
            </BacklogColumn>

            <BacklogColumn title="Tasks" icon="box">
                {currentRelease ? (
                    columnIds
                        .filter((col) => !["backlog"].includes(col as string))
                        .map((col) => (
                            <BoardColumn
                                columnId={col}
                                key={col}
                                releaseId={currentRelease.id}
                                isCreateTaskOpen={isCreateTaskOpen}
                                setIsCreateTaskOpen={setIsCreateTaskOpen}
                            />
                        ))
                ) : (
                    <div className="releases-empty-message">You don't have any active releases yet.</div>
                )}
            </BacklogColumn>
        </Page>
    );
};
