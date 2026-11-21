import classNames from "classnames";
import "./TaskEditorContent.scss";
import { useAuth } from "@/context/auth/useAuth.ts";
import { CollaborativeEditor } from "../CollaborativeEditor/CollaborativeEditor.tsx";
import Loading from "@/ui/Loading/Loading.tsx";
import TaskProperties from "../TaskProperties/TaskProperties.tsx";
import { useTask } from "@/query/useTasks.ts";
import { useEffect, useState } from "react";
import tasksApi from "@/api/tasks.ts";

interface TaskEditorContentProps {
    taskId: string;
    className?: string;
}

export const TaskEditorContent = ({ taskId, className }: TaskEditorContentProps) => {
    const { user, token } = useAuth();
    const { task } = useTask(taskId);

    const [documentId, setDocumentId] = useState<string | null>(null);
    const [isDocumentReady, setIsDocumentReady] = useState(false);

    const [draftName, setDraftName] = useState<string | null>(null);
    const taskName = draftName ?? task?.name ?? "";

    const handleNameBlur = (value: string) => {
        const trimmed = value.trim();

        if (!trimmed || !task || task.name === trimmed) return;

        if (task && task.name !== trimmed) {
            tasksApi.update(taskId, { name: trimmed }, () => {});
        }
    };

    useEffect(() => {
        tasksApi.getDocument(taskId, (response) => setDocumentId(response.id));
    }, [taskId]);

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
                    spellCheck={user.preferences.spellcheck}
                    onFocus={() => setDraftName(task.name)}
                    onChange={(e) => setDraftName(e.target.value)}
                    onBlur={(e) => {
                        handleNameBlur(e.target.value);
                        setDraftName(null);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
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
