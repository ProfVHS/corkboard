import "./BacklogPage.scss";
import { Page } from "@/layout/Page/Page.tsx";
import { BacklogColumn } from "@/pages/BacklogPage/BacklogColumn/BacklogColumn.tsx";
import { useState } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { BoardColumn } from "@/features/BoardColumn/BoardColumn.tsx";
import Loading from "@/ui/Loading/Loading.tsx";
import { useCurrentRelease } from "@/query/useReleases.ts";
import { useBacklogTasks, useBoardColumns } from "@/query/useTasks.ts";

export const BacklogPage = () => {
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const { data: currentRelease, isLoading: isLoadingRelease } = useCurrentRelease(workspaceId);
    const { data: columns = [], isLoading: isLoadingTasks } = useBoardColumns(currentRelease?.id);
    const { data: backlogTasks = [], isLoading: isLoadingBacklog } = useBacklogTasks(workspaceId);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

    if (isLoadingRelease || isLoadingTasks || isLoadingBacklog) return <Loading overlay={true} />;

    console.log(columns);

    return (
        <Page title="Backlog" subTitle={currentRelease?.name} className="backlog-page">
            <BacklogColumn title="Backlog" icon="rows">
                <BoardColumn
                    columnId="backlog"
                    releaseId={null}
                    tasks={backlogTasks}
                    isCreateTaskOpen={isCreateTaskOpen}
                    setIsCreateTaskOpen={setIsCreateTaskOpen}
                />
            </BacklogColumn>

            <BacklogColumn title="Tasks" icon="box">
                {currentRelease ? (
                    columns.map((col) => (
                        <BoardColumn
                            key={col.id}
                            columnId={col.id}
                            tasks={col.tasks}
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
