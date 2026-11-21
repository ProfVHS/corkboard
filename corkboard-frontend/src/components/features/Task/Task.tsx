import "./Task.scss";
import { Button } from "@/ui/Button/Button.tsx";
import { EditableText } from "@/ui/EditableText/EditableText.tsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ClassNames } from "@/global/utils.ts";
import { type SubmitHandler, useForm } from "react-hook-form";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { ContextMenu, type ContextMenuItem } from "@/ui/ContextMenu/ContextMenu.tsx";
import { useTaskStore } from "@/store/taskStore.ts";
import { Icon } from "@/ui/Icons/Icon.tsx";
import UserPopover from "@/ui/Popovers/UserPopover/UserPopover.tsx";
import { useAuth } from "@/context/auth/useAuth.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import tasksApi from "@/api/tasks.ts";
import { useCurrentRelease, useNextRelease } from "@/query/useReleases.ts";
import type { TaskType } from "@/types/ReleaseBoardTypes.ts";
import { useTasksCache } from "@/query/useTasks.ts";
import { useTaskTags } from "@/query/useTags.ts";
import Tag from "@/ui/Tag/Tag.tsx";

type TaskProps = {
    task: TaskType;
};

type Inputs = {
    name: string;
};

export const Task = memo(({ task }: TaskProps) => {
    const taskId = task.id;
    const [isEditing, setIsEditing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLFormElement>(null);
    const { register, handleSubmit } = useForm<Inputs>();
    const { user } = useAuth();

    const setIsOpen = useTaskStore((state) => state.setIsOpen);
    const setTaskId = useTaskStore((state) => state.setTaskId);

    const workspace = useWorkspaceStore((state) => state.workspace);
    const { data: currentRelease } = useCurrentRelease(workspace?.id);
    const { data: nextRelease } = useNextRelease(workspace?.id);
    const { data: tags = [] } = useTaskTags(task.tags);
    const { updateTask } = useTasksCache();

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        tasksApi.update(taskId, { name: data.name }, (response) => {
            updateTask(taskId, { name: response.task.name });
            setIsEditing(false);
        });
    };

    useEffect(() => {
        if (!ref.current) return;

        return draggable({
            element: ref.current,
            getInitialData: () => ({ type: "task", taskId, status: task.status }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });
    }, [taskId, task.status]);

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
        (): ContextMenuItem[] =>
            [
                { type: "button", label: "Rename", icon: "edit", onClick: () => setIsEditing(true) },
                { type: "hr" },
                task.status === "backlog" &&
                    currentRelease && {
                        type: "button",
                        label: "Move To Current Release",
                        icon: "boxArrowUp",
                        onClick: () => tasksApi.move(taskId, { status: "todo", release_id: currentRelease.id }, () => {}),
                    },
                nextRelease && {
                    type: "button",
                    label: "Move To Next Release",
                    icon: "boxArrowUp",
                    onClick: () => tasksApi.moveToNextRelease(taskId, () => {}),
                },
                task.status !== "backlog" && {
                    type: "button",
                    label: "Move To Backlog",
                    icon: "boxArrowDown",
                    onClick: () => tasksApi.move(taskId, { status: "backlog", release_id: null }, () => {}),
                },
                { type: "hr" },
                {
                    type: "button",
                    label: "Delete",
                    color: "red",
                    icon: "trash",
                    onClick: () => tasksApi.delete(taskId, () => {}),
                },
            ].filter(Boolean) as ContextMenuItem[],
        [currentRelease, nextRelease, task.status, taskId],
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
                <form className="task__header" ref={headerRef} onClick={(e) => isEditing && e.stopPropagation()} onSubmit={handleSubmit(onSubmit)}>
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
                <div className="tags">
                    <UserPopover taskId={taskId} taskUser={task.user} />

                    {user?.preferences.show_board_tags && (
                        <>
                            {tags.slice(0, 3).map((tag) => (
                                <Tag key={tag.id} tag={tag} />
                            ))}
                            {tags.length > 3 && (
                                <div className="tag">
                                    <span>+{tags.length - 3}</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
                {workspace?.code_prefix_enabled && <div className="code-name">{task.code_name}</div>}
                {task.priority && <Icon className={`${task.priority} priority`} icon="priority" />}
            </div>
        </ContextMenu>
    );
});
