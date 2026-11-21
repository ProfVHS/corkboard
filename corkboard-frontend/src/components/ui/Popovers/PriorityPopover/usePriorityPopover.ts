import tasksApi from "@/api/tasks.ts";
import { useTasksCache } from "@/query/useTasks.ts";

interface usePriorityPopoverProps {
    taskId: string;
    taskPriority: string | null;
}

const usePriorityPopover = ({ taskId, taskPriority }: usePriorityPopoverProps) => {
    const { updateTask } = useTasksCache();

    const handleUpdateTaskStatus = (priority: string) => {
        tasksApi.update(taskId, { priority: taskPriority === priority ? null : priority }, (response) => {
            updateTask(taskId, { priority: response.task.priority });
        });
    };

    return { handleUpdateTaskStatus };
};

export default usePriorityPopover;
