import "./TaskModal.scss";
import Modal from "@/ui/Modal/Modal.tsx";
import { useTaskStore } from "@/store/taskStore.ts";
import { TaskEditorContent } from "./TaskEditorContent.tsx";
import { Button } from "@/ui/Button/Button.tsx";
import { Icon } from "@/ui/Icons/Icon.tsx";
import { useState } from "react";
import type { TaskType } from "@/types/ReleaseBoardTypes.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import tasksApi from "@/api/tasks.ts";

interface TaskModalProps {
    task: TaskType;
}

const TaskModal = ({ task }: TaskModalProps) => {
    const setIsOpen = useTaskStore((state) => state.setIsOpen);
    const setTaskId = useTaskStore((state) => state.setTaskId);
    const workspace = useWorkspaceStore((state) => state.workspace);

    const [dismissedFor, setDismissedFor] = useState<string | null>(null);

    const blockedBy = task.blocked_by ?? [];
    const showBlocked = blockedBy.length > 0 && dismissedFor !== task.id;

    const handleUnblock = (blocker: TaskType) => {
        tasksApi.unblock(task.id, [blocker.id], () => {});
    };

    const handleUnblockAll = () => {
        tasksApi.unblock(
            task.id,
            task.blocked_by.flatMap((b) => b.id),
            () => {},
        );
    };

    return (
        <Modal className="task-modal" onClose={() => setIsOpen(false)}>
            <Modal.Body>
                <TaskEditorContent key={task.id} task={task} />

                {showBlocked && (
                    <div className="blocked-overlay">
                        <div className="blocked-container">
                            <div className="content">
                                <div className="icon-box">
                                    <Icon icon="lock" />
                                </div>
                                <div className="title">Blocked by {task.blocked_by?.length == 1 ? "1 task" : `${task.blocked_by?.length} tasks`}</div>
                                <div className="description">
                                    This task is waiting on the dependencies below. You can still edit details freely, or remove blockers if they’re no longer
                                    needed.
                                </div>
                                <div className="blockers">
                                    {task.blocked_by.map((blocker) => (
                                        <div className="blocker">
                                            {workspace?.code_prefix_enabled && <div className="code-name">{blocker.code_name}</div>}
                                            <div className="name">{blocker.name}</div>
                                            <div className="icons">
                                                <Button variant="icon" icon="show" onClick={() => setTaskId(blocker.id)} />
                                                <Button variant="icon" icon="unlock" onClick={() => handleUnblock(blocker)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="footer">
                                <Button className="cancel" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button color="secondary" onClick={() => setDismissedFor(task.id)}>
                                    Show
                                </Button>

                                <Button color="primary" onClick={handleUnblockAll}>
                                    {task.blocked_by?.length == 1 ? "Unblock" : `Unblock all (${task.blocked_by?.length})`}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default TaskModal;
