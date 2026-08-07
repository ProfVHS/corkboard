import "./TaskPrioritySelect.scss";
import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { useReleaseBoardStore } from "../../../store/releaseBoardStore.ts";
import { Icon } from "../Icons/Icon.tsx";

const statuses = ["medium", "high", "urgent"];

interface TaskPrioritySelectProps {
    taskId: number;
    taskPriority: string | null;
}

const TaskPrioritySelect = ({ taskId, taskPriority }: TaskPrioritySelectProps) => {
    const [showStatusSelect, setShowStatusSelect] = useState<boolean>(false);
    const taskPriorityModalRef = useRef<HTMLDivElement | null>(null);
    const taskPriorityButtonRef = useRef<HTMLDivElement | null>(null);
    const updateTask = useReleaseBoardStore((state) => state.updateTask);

    const handleUpdateTaskStatus = (priority: string) => {
        if (taskPriority === priority) {
            updateTask(taskId, { priority: null });
        } else {
            updateTask(taskId, { priority: priority });
        }

        setShowStatusSelect(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                taskPriorityModalRef.current &&
                !taskPriorityModalRef.current.contains(target) &&
                taskPriorityButtonRef.current &&
                !taskPriorityButtonRef.current.contains(target)
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
        <div className="task-priority">
            <div ref={taskPriorityButtonRef} className={classNames("priority")} onClick={() => setShowStatusSelect(true)}>
                {taskPriority && <Icon className={taskPriority ?? ""} icon="priority" />}
                <span>{taskPriority ? taskPriority : "Empty"}</span>
            </div>

            {showStatusSelect && (
                <div className="priority-modal" ref={taskPriorityModalRef}>
                    {statuses.map((priority) => (
                        <div className={classNames("priority item")} onClick={() => handleUpdateTaskStatus(priority)}>
                            <Icon className={priority} icon="priority" />
                            <span>{priority}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TaskPrioritySelect;
