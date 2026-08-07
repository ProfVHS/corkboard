import { useEffect, useState } from "react";
import { useReleaseBoardStore } from "../../../store/releaseBoardStore.ts";
import { api } from "../../../api/api.ts";

export const useTaskEditor = (taskId: number) => {
    const task = useReleaseBoardStore((state) => state.tasks[taskId]);
    const updateTask = useReleaseBoardStore((state) => state.updateTask);

    const [taskName, setTaskName] = useState<string>(task?.name ?? "");
    const [documentId, setDocumentId] = useState<number | null>(null);
    const [isDocumentReady, setIsDocumentReady] = useState(false);

    useEffect(() => {
        api.get(`/tasks/${taskId}/document`).then((response) => {
            setDocumentId(response.data.id);
        });
    }, [taskId]);

    const handleUpdateTaskName = (value: string) => {
        if (task.name !== value) {
            api.patch(`tasks/${taskId}`, { name: value }).then(() => {
                updateTask(taskId, { name: value });
            });
        }
    };

    const handleNameBlur = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) {
            setTaskName(task.name);
            return;
        }
        handleUpdateTaskName(trimmed);
    };

    return {
        task,
        taskName,
        setTaskName,
        documentId,
        isDocumentReady,
        setIsDocumentReady,
        handleNameBlur,
    };
};
