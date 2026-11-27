import classNames from "classnames";
import "./TaskEditorContent.scss";
import { useAuth } from "@/context/auth/useAuth.ts";
import { CollaborativeEditor } from "../CollaborativeEditor/CollaborativeEditor.tsx";
import Loading from "@/ui/Loading/Loading.tsx";
import TaskProperties from "../TaskProperties/TaskProperties.tsx";
import { useEffect, useState } from "react";
import tasksApi from "@/api/tasks.ts";
import type { TaskType } from "@/types/ReleaseBoardTypes.ts";

interface TaskEditorContentProps {
    task: TaskType;
    className?: string;
}

export const TaskEditorContent = ({ task, className }: TaskEditorContentProps) => {
    const { user, token } = useAuth();

    const [documentId, setDocumentId] = useState<string | null>(null);
    const [isDocumentReady, setIsDocumentReady] = useState(false);

    const [draftName, setDraftName] = useState<string | null>(null);
    const taskName = draftName ?? task?.name ?? "";

    const handleNameBlur = (value: string) => {
        const trimmed = value.trim();

        if (!trimmed || !task || task.name === trimmed) return;

        if (task && task.name !== trimmed) {
            tasksApi.update(task.id, { name: trimmed }, () => {});
        }
    };

    useEffect(() => {
        tasksApi.getDocument(task.id, (response) => setDocumentId(response.id));
    }, [task.id]);

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
