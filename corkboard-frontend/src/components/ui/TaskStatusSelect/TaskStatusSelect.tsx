import "./TaskStatusSelect.scss";
import { upperCase } from "lodash";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { useReleaseBoardStore } from "../../../store/releaseBoardStore.ts";

interface TaskStatusSelectProps {
    taskId: number;
    taskStatus: string;
}

const statuses = ["adjustments", "todo", "in_progress", "review_pending", "testing", "accepted"];

const TaskStatusSelect = ({ taskId, taskStatus }: TaskStatusSelectProps) => {
    const [showStatusSelect, setShowStatusSelect] = useState<boolean>(false);
    const moveTaskBetweenColumns = useReleaseBoardStore((state) => state.moveTaskBetweenColumns);
    const taskStatusModalRef = useRef<HTMLDivElement | null>(null);
    const taskStatusButtonRef = useRef<HTMLDivElement | null>(null);

    const handleUpdateTaskStatus = (status: string) => {
        if (taskStatus === status) {
            setShowStatusSelect(false);
            return;
        }

        moveTaskBetweenColumns(taskId, taskStatus, status);
        setShowStatusSelect(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                taskStatusModalRef.current &&
                !taskStatusModalRef.current.contains(target) &&
                taskStatusButtonRef.current &&
                !taskStatusButtonRef.current.contains(target)
            ) {
                setShowStatusSelect(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="task-status" onClick={() => setShowStatusSelect(true)}>
            <div ref={taskStatusButtonRef} className={classNames("status", taskStatus)}>
                <div className="dot"></div>
                <span>{upperCase(taskStatus)}</span>
            </div>

            {showStatusSelect && (
                <div className="status-modal" ref={taskStatusModalRef}>
                    {statuses.map((status) => (
                        <div className={classNames("status item")} onClick={() => handleUpdateTaskStatus(status)}>
                            <div className={classNames("dot", status)}></div>
                            <span>{upperCase(status)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskStatusSelect;
