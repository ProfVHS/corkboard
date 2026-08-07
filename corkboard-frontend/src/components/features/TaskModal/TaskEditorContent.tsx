import classNames from "classnames";
import "./TaskEditorContent.scss";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useTaskEditor } from "./useTaskEditor.ts";
import { CollaborativeEditor } from "../CollaborativeEditor/CollaborativeEditor.tsx";
import Loading from "../../ui/Loading/Loading.tsx";
import TaskProperties from "../TaskProperties/TaskProperties.tsx";

interface TaskEditorContentProps {
    taskId: number;
    className?: string;
}

export const TaskEditorContent = ({ taskId, className }: TaskEditorContentProps) => {
    const { user, token } = useAuth();
    const { task, taskName, setTaskName, documentId, isDocumentReady, setIsDocumentReady, handleNameBlur } = useTaskEditor(taskId);

    if (!task) return null;

    if (!(user && token && documentId)) {
        return <Loading />;
    }

    return (
        <>
            {!isDocumentReady && <Loading />}

            <div className={classNames("task-editor", className, { hidden: !isDocumentReady })}>
                <textarea
                    className="name"
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    onBlur={(e) => handleNameBlur(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleNameBlur(taskName);
                            e.currentTarget.blur();
                        }
                    }}
                />

                <TaskProperties task={task} />

                <CollaborativeEditor documentId={documentId} user={user} authToken={token} onReadyChange={setIsDocumentReady} />
            </div>
        </>
    );
};
