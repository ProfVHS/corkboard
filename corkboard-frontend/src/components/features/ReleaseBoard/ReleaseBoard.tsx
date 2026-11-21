import "./ReleaseBoard.scss";
import { useState } from "react";
import { useBoardColumns } from "@/query/useTasks.ts";
import { BoardColumn } from "../BoardColumn/BoardColumn.tsx";

type ReleaseBoardProps = {
    releaseId: string;
};

export const ReleaseBoard = ({ releaseId }: ReleaseBoardProps) => {
    const { data: columns = [] } = useBoardColumns(releaseId);
    const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

    const renderColumn = (col: (typeof columns)[number]) => (
        <BoardColumn
            key={col.id}
            columnId={col.id}
            tasks={col.tasks}
            releaseId={releaseId}
            isCreateTaskOpen={isCreateTaskOpen}
            setIsCreateTaskOpen={setIsCreateTaskOpen}
        />
    );

    const main = columns.filter((c) => !["review_pending", "testing", "accepted"].includes(c.id));
    const group = columns.filter((c) => ["review_pending", "testing"].includes(c.id));
    const accepted = columns.find((c) => c.id === "accepted");

    return (
        <div className="release-board">
            {main.map(renderColumn)}
            <div className="release-board__column-group">{group.map(renderColumn)}</div>
            {accepted && renderColumn(accepted)}
        </div>
    );
};
