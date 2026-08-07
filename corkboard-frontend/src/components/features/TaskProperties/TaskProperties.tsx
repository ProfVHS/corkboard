import "./TaskProperties.scss";
import TaskStatusSelect from "../../ui/TaskStatusSelect/TaskStatusSelect.tsx";
import TaskPrioritySelect from "../../ui/TaskPrioritySelect/TaskPrioritySelect.tsx";
import type { TaskType } from "../../../types/ReleaseBoardTypes.ts";
import { UserSelect } from "../../ui/UserSelect/UserSelect.tsx";
import { Icon, type IconNames } from "../../ui/Icons/Icon.tsx";

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
    const columns: ColumnType[] = [
        {
            id: "assign",
            name: "Assign",
            icon: "circleUser",
            component: <UserSelect taskId={task.id} taskUser={task.user} variant="modal" />,
        },
        {
            id: "status",
            name: "Status",
            icon: "circleStatus",
            component: <TaskStatusSelect taskId={task.id} taskStatus={task.status} />,
        },
        {
            id: "priority",
            name: "Priority",
            icon: "priority",
            component: <TaskPrioritySelect taskId={task.id} taskPriority={task.priority} />,
        },
    ];

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
