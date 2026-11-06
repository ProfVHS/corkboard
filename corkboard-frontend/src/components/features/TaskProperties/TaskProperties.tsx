import "./TaskProperties.scss";
import type { TaskType } from "@/types/ReleaseBoardTypes.ts";
import { Icon, type IconNames } from "@/ui/Icons/Icon.tsx";
import PriorityPopover from "@/ui/Popovers/PriorityPopover/PriorityPopover.tsx";
import TaskStatusPopover from "@/ui/Popovers/TaskStatusPopover/TaskStatusPopover.tsx";
import UserPopover from "@/ui/Popovers/UserPopover/UserPopover.tsx";
import TagsPopover from "@/ui/Popovers/TagsPopover/TagsPopover.tsx";
import DatesPopover from "@/ui/Popovers/DatesPopover/DatesPopover.tsx";
import { useToast } from "@/hooks/useToast.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";

interface TaskPropertiesProps {
    task: TaskType;
}

type ColumnType = {
    id: string;
    name: string;
    icon: IconNames;
    component: React.JSX.Element;
};

const TaskProperties = ({ task }: TaskPropertiesProps) => {
    const toast = useToast();
    const workspace = useWorkspaceStore((state) => state.workspace);

    const handleCopyTaskCodeName = () => {
        navigator.clipboard.writeText(task.code_name).then(() => {
            toast.success("Task code copied!", 2000);
        });
    };

    const columns: ColumnType[] = [
        workspace?.code_prefix_enabled && {
            id: "code_name",
            name: "Code name",
            icon: "hash",
            component: <div onClick={handleCopyTaskCodeName}>{task.code_name}</div>,
        },
        {
            id: "assign",
            name: "Assign",
            icon: "circleUser",
            component: <UserPopover taskId={task.id} taskUser={task.user} variant="modal" />,
        },
        {
            id: "status",
            name: "Status",
            icon: "circleStatus",
            component: <TaskStatusPopover taskId={task.id} taskStatus={task.status} />,
        },
        {
            id: "priority",
            name: "Priority",
            icon: "priority",
            component: <PriorityPopover taskId={task.id} taskPriority={task.priority} />,
        },
        {
            id: "tags",
            name: "Tags",
            icon: "tag",
            component: <TagsPopover taskId={task.id} />,
        },
        {
            id: "date",
            name: "Dates",
            icon: "calendar",
            component: <DatesPopover taskId={task.id} taskStartDate={task.start_date} taskDueDate={task.due_date} />,
        },
    ].filter(Boolean) as ColumnType[];

    return (
        <div className="task-properties">
            {columns.map((property) => (
                <div className="row">
                    <div className="title">
                        <Icon icon={property.icon} />
                        {property.name}
                    </div>
                    <div className="value">{property.component}</div>
                </div>
            ))}
        </div>
    );
};

export default TaskProperties;
