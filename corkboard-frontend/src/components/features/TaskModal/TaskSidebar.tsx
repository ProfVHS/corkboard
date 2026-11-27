import "./TaskSidebar.scss";
import classNames from "classnames";
import { useTaskStore } from "@/store/taskStore.ts";
import { TaskEditorContent } from "./TaskEditorContent.tsx";
import type { TaskType } from "@/types/ReleaseBoardTypes.ts";

interface TaskSidebarProps {
    task: TaskType;
}

const TaskSidebar = ({ task }: TaskSidebarProps) => {
    const isOpen = useTaskStore((state) => state.isOpen);
    const setIsOpen = useTaskStore((state) => state.setIsOpen);

    return (
        <div
            className="task-sidebar-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) setIsOpen(false);
            }}
        >
            <div key={task.id} className={classNames("task-sidebar", { closing: !isOpen })}>
                <TaskEditorContent key={task.id} task={task} />
            </div>
        </div>
    );
};

export default TaskSidebar;
