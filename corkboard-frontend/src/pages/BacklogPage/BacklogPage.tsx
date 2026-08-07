import { Page } from "../../components/layout/Page/Page.tsx";
import { BacklogColumn } from "./BacklogColumn/BacklogColumn.tsx";

import "./BacklogPage.scss";
import { useEffect, useState } from "react";
import { api } from "../../api/api.ts";
import { useWorkspaceStore } from "../../store/workspaceStore.ts";
import { useReleaseBoardStore } from "../../store/releaseBoardStore.ts";
import { BoardColumn } from "../../components/features/BoardColumn/BoardColumn.tsx";
import { useShallow } from "zustand/react/shallow";
import type { ReleaseType } from "../../types/ReleaseType.ts";
import Loading from "../../components/ui/Loading/Loading.tsx";

export const BacklogPage = () => {
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);

    const fetchBoard = useReleaseBoardStore((state) => state.fetchBoard);
    const fetchBacklog = useReleaseBoardStore((state) => state.fetchBacklog);

    const columnIds = useReleaseBoardStore(useShallow((state) => state.columns.map((col) => col.id)));
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState<boolean>(false);

    const [release, setRelease] = useState<ReleaseType | null>(null);

    useEffect(() => {
        if (workspaceId) {
            api.get(`/workspaces/${workspaceId}/current_release`).then((res) => {
                const release = res.data;
                setRelease(release);
                fetchBoard(release.id, () => fetchBacklog(workspaceId));
            });
        }
    }, [workspaceId, fetchBoard, fetchBacklog]);

    if (!release) return <Loading overlay={true} />;

    return (
        <Page title="Backlog" subTitle={release?.name} className="backlog-page">
            <BacklogColumn title="Backlog" icon="rows">
                <BoardColumn columnId="backlog" key="backlog" isCreateTaskOpen={isCreateTaskOpen} setIsCreateTaskOpen={setIsCreateTaskOpen} />
            </BacklogColumn>

            <BacklogColumn title="Tasks" icon="box">
                {columnIds
                    .filter((col) => !["backlog"].includes(col as string))
                    .map((col) => (
                        <BoardColumn columnId={col} key={col} isCreateTaskOpen={isCreateTaskOpen} setIsCreateTaskOpen={setIsCreateTaskOpen} />
                    ))}
            </BacklogColumn>
        </Page>
    );
};
