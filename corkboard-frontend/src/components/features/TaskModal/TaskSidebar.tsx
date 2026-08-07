import "./TaskSidebar.scss";
import classNames from "classnames";
import { useTaskStore } from "../../../store/taskStore.ts";
import { TaskEditorContent } from "./TaskEditorContent.tsx";

interface TaskSidebarProps {
    taskId: number;
}

const TaskSidebar = ({ taskId }: TaskSidebarProps) => {
    const isOpen = useTaskStore((state) => state.isOpen);
    const setIsOpen = useTaskStore((state) => state.setIsOpen);

    return (
        <div
            className="task-sidebar-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) setIsOpen(false);
            }}
        >
            <div key={taskId} className={classNames("task-sidebar", { closing: !isOpen })}>
                <TaskEditorContent key={taskId} taskId={taskId} />
            </div>
        </div>
    );
};

export default TaskSidebar;
