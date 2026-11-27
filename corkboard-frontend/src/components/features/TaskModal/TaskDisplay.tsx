import { useTaskStore } from "@/store/taskStore.ts";
import TaskSidebar from "./TaskSidebar.tsx";
import TaskModal from "./TaskModal.tsx";
import { useAuth } from "@/context/auth/useAuth.ts";
import { useTask } from "@/query/useTasks.ts";
import "./TaskDisplay.scss";

const TaskDisplay = () => {
    const isOpen = useTaskStore((state) => state.isOpen);
    const taskId = useTaskStore((state) => state.taskId);
    const { task } = useTask(taskId!);
    const { user } = useAuth();

    if (!isOpen || !taskId || !user || !task) return null;

    return <div className="task-display">{user.preferences.task_display === "sidebar" ? <TaskSidebar task={task} /> : <TaskModal task={task} />}</div>;
};

export default TaskDisplay;
