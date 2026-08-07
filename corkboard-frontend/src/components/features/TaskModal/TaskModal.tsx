import "./TaskModal.scss";
import Modal from "../../ui/Modal/Modal.tsx";
import { useTaskStore } from "../../../store/taskStore.ts";
import { TaskEditorContent } from "./TaskEditorContent.tsx";

interface TaskModalProps {
    taskId: number;
}

const TaskModal = ({ taskId }: TaskModalProps) => {
    const setIsOpen = useTaskStore((state) => state.setIsOpen);

    return (
        <Modal className="task-modal" onClose={() => setIsOpen(false)}>
            <Modal.Body>
                <TaskEditorContent key={taskId} taskId={taskId} />
            </Modal.Body>
        </Modal>
    );
};

export default TaskModal;
