import { ClassNames } from "@/global/utils.ts";
import "./BoardColumn.scss";
import { Button } from "@/components/ui/Button/Button.tsx";
import * as _ from "lodash";
import { type Dispatch, Fragment, memo, type SetStateAction, useEffect, useRef, useState } from "react";
import { TaskForm } from "../TaskForm/TaskForm.tsx";
import { Task } from "../Task/Task.tsx";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import tasksApi from "@/api/tasks.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import type { TaskStatus, TaskType } from "@/types/ReleaseBoardTypes.ts";
import { useTasksCache } from "@/query/useTasks.ts";

type BoardColumnProps = {
    columnId: TaskStatus;
    releaseId: string | null;
    tasks: TaskType[];
    isCreateTaskOpen: boolean;
    setIsCreateTaskOpen: Dispatch<SetStateAction<boolean>>;
};

export const BoardColumn = memo(({ columnId, releaseId, tasks, isCreateTaskOpen, setIsCreateTaskOpen }: BoardColumnProps) => {
    const [showCreateTask, setShowCreateTask] = useState(false);
    const newTaskRef = useRef<HTMLDivElement>(null);
    const ref = useRef<HTMLDivElement>(null);
    const tasksContainerRef = useRef<HTMLDivElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const { addTask, refetch } = useTasksCache();

    const handleTaskAdd = (name: string) => {
        const trimmedName = name.trim();

        if (trimmedName && workspaceId) {
            tasksApi.create({ name: trimmedName, workspace_id: workspaceId, release_id: releaseId, status: columnId as TaskStatus }, (response) => {
                addTask(response);
            });
        }

        setIsCreateTaskOpen(false);
        setShowCreateTask(false);
    };

    const handleShowCreateTask = () => {
        if (isCreateTaskOpen) return;

        setIsCreateTaskOpen(true);
        setShowCreateTask(true);
    };

    const getDropIndex = (y: number) => {
        let index = tasks.length;
        ref.current?.querySelectorAll(".task:not(.dragging)").forEach((element, i) => {
            const rect = element.getBoundingClientRect();
            if (y < rect.top + rect.height / 2 && index === tasks.length) index = i;
        });
        return index;
    };

    useEffect(() => {
        if (!ref.current) return;

        return dropTargetForElements({
            element: ref.current,
            canDrop: ({ source }) => source.data.type === "task",
            onDragEnter: () => setIsDragOver(true),
            onDragLeave: () => {
                setIsDragOver(false);
                setDragOverIndex(null);
            },
            onDrag: ({ location }) => setDragOverIndex(getDropIndex(location.current.input.clientY)),
            onDrop: ({ source, location }) => {
                setIsDragOver(false);
                setDragOverIndex(null);

                const taskId = source.data.taskId as string;
                const fromStatus = source.data.status as string;
                if (!taskId) return;

                const index = getDropIndex(location.current.input.clientY);
                const diffColumn = fromStatus !== columnId;
                const payload = diffColumn ? { status: columnId, position: index, release_id: releaseId } : { position: index };

                tasksApi.move(taskId, payload, () => {});
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnId, releaseId, tasks, refetch]);

    useEffect(() => {
        if (!isCreateTaskOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (newTaskRef.current && !newTaskRef.current.contains(e.target as Node)) {
                setIsCreateTaskOpen(false);
                setShowCreateTask(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isCreateTaskOpen, setIsCreateTaskOpen]);

    useEffect(() => {
        if (tasksContainerRef.current && showCreateTask) {
            tasksContainerRef.current.scrollTo({
                top: tasksContainerRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [showCreateTask]);

    return (
        <div ref={ref} className={ClassNames("board-column", [columnId.toString()], { over: isDragOver })}>
            <div className="board-column__header">
                <div className="board-column__dot" />
                {_.upperCase(columnId as string)}
            </div>
            <div ref={tasksContainerRef} className="board-column__tasks">
                {tasks.map((task, index) => (
                    <Fragment key={task.id}>
                        {dragOverIndex === index && <div className="board-column__placeholder" />}
                        <Task task={task} />
                    </Fragment>
                ))}
                {dragOverIndex === tasks.length && <div className="board-column__placeholder" />}
                {showCreateTask && <TaskForm onSave={handleTaskAdd} ref={newTaskRef} />}
            </div>
            <div className="board-column__footer">
                <Button className="board-column__add-task" variant="text" onClick={handleShowCreateTask}>
                    + Add Task
                </Button>
            </div>
        </div>
    );
});
