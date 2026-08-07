import "./Task.scss";
import { UserSelect } from "../../ui/UserSelect/UserSelect.tsx";
import { Button } from "../../ui/Button/Button.tsx";
import { EditableText } from "../../ui/EditableText/EditableText.tsx";
import { useReleaseBoardStore } from "../../../store/releaseBoardStore.ts";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ClassNames } from "../../../global/utils.ts";
import { type SubmitHandler, useForm } from "react-hook-form";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { ContextMenu, type ContextMenuItem } from "../../ui/ContextMenu/ContextMenu.tsx";
import { useTaskStore } from "../../../store/taskStore.ts";
import { Icon } from "../../ui/Icons/Icon.tsx";

type TaskProps = {
    taskId: number;
};

type Inputs = {
    name: string;
};

export const Task = memo(({ taskId }: TaskProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLFormElement>(null);
    const { register, handleSubmit } = useForm<Inputs>();

    const setIsOpen = useTaskStore((state) => state.setIsOpen);
    const setTaskId = useTaskStore((state) => state.setTaskId);

    const task = useReleaseBoardStore((state) => state.tasks[taskId]);
    const updateTask = useReleaseBoardStore((state) => state.updateTask);
    const deleteTask = useReleaseBoardStore((state) => state.deleteTask);
    const moveToNextRelease = useReleaseBoardStore((state) => state.moveTaskToNextRelease);
    const moveToBacklog = useReleaseBoardStore((state) => state.moveToBacklog);

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        updateTask(taskId, { name: data.name });
        setIsEditing(false);
    };

    useEffect(() => {
        if (!ref.current) return;

        return draggable({
            element: ref.current,
            getInitialData: () => ({ type: "task", taskId }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });
    }, [taskId]);

    useEffect(() => {
        if (isDragging) {
            setIsEditing(false);
        }
    }, [isDragging]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setIsEditing(false);
            }
        };
        if (isEditing) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isEditing]);

    const contextMenuOptions = useCallback(
        (): ContextMenuItem[] => [
            {
                type: "button",
                label: "Rename",
                icon: "edit",
                onClick: () => setIsEditing(true),
            },
            {
                type: "button",
                label: "Change Priority",
                icon: "exclamationMark",
                onClick: () => setIsEditing(true),
            },
            {
                type: "hr",
            },
            {
                type: "button",
                label: "Move To Next Release",
                icon: "boxArrowUp",
                onClick: () => moveToNextRelease(taskId),
            },
            {
                type: "button",
                label: "Move To Backlog",
                icon: "boxArrowDown",
                onClick: () => moveToBacklog(taskId),
            },
            {
                type: "hr",
            },
            {
                type: "button",
                label: "Delete",
                color: "red",
                icon: "trash",
                onClick: () => deleteTask(taskId),
            },
        ],
        [deleteTask, moveToBacklog, moveToNextRelease, taskId],
    );

    return (
        <ContextMenu items={contextMenuOptions()}>
            <div
                className={ClassNames("task", { ghost: isDragging })}
                ref={ref}
                onClick={() => {
                    setIsOpen(true);
                    setTaskId(taskId);
                }}
            >
                <form className="task__header" ref={headerRef} onSubmit={handleSubmit(onSubmit)}>
                    <EditableText
                        isEditable={isEditing}
                        value={task.name}
                        register={register("name", {
                            required: "You have to enter a name!",
                        })}
                    />
                    {isEditing && (
                        <Button type="submit" size="small" color="primary">
                            Save
                        </Button>
                    )}
                </form>
                <UserSelect taskId={taskId} taskUser={task.user} />
                {task.priority && <Icon className={`${task.priority} priority`} icon="priority" />}
            </div>
        </ContextMenu>
    );
});
