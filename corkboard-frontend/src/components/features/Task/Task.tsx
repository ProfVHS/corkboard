import "./Task.scss";
import { EditableText } from "@/ui/EditableText/EditableText.tsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ClassNames } from "@/global/utils.ts";
import { useForm } from "react-hook-form";
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
import { useTaskTags } from "@/query/useTags.ts";
import dayjs from "dayjs";
import classNames from "classnames";
import TagList from "@/features/Task/TagList.tsx";
import Modal from "@/ui/Modal/Modal.tsx";
import { Button } from "@/ui/Button/Button.tsx";
import { DependencySelect } from "@/features/Task/Select.tsx";

type TaskProps = {
    task: TaskType;
};

type Inputs = {
    name: string;
};

export const Task = memo(({ task }: TaskProps) => {
    const taskId = task.id;
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [showBlockModal, setShowBlockModal] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const commitRef = useRef<() => void>(() => {});
    const { register, getValues, reset } = useForm<Inputs>({
        defaultValues: { name: task.name },
    });
    const { user } = useAuth();

    const setIsOpen = useTaskStore((state) => state.setIsOpen);
    const setTaskId = useTaskStore((state) => state.setTaskId);

    const workspace = useWorkspaceStore((state) => state.workspace);
    const { data: currentRelease } = useCurrentRelease(workspace?.id);
    const { data: nextRelease } = useNextRelease(workspace?.id);
    const { data: tags = [] } = useTaskTags(task.tags);
    const [dependencyIds, setDependencyIds] = useState<string[]>([]);

    commitRef.current = () => {
        const name = (getValues("name") ?? "").trim();

        if (!name || name === task.name) {
            reset({ name: task.name });
            setIsEditing(false);
            return;
        }

        tasksApi.update(taskId, { name }, () => {
            setIsEditing(false);
        });
    };

    const handleBlockTask = () => {
        tasksApi.updateBlocked(taskId, dependencyIds, () => {
            setShowBlockModal(false);
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
        if (!isEditing) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                commitRef.current();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isEditing]);

    useEffect(() => {
        if (!isEditing) reset({ name: task.name });
    }, [task.name, isEditing, reset]);

    const contextMenuOptions = useCallback(
        (): ContextMenuItem[] =>
            [
                { type: "button", label: "Rename", icon: "edit", onClick: () => setIsEditing(true) },
                { type: "hr" },
                { type: "button", label: "Block", icon: "lock", onClick: () => setShowBlockModal(true) },
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
                <div className="header">
                    <div className="name" ref={headerRef} onClick={(e) => isEditing && e.stopPropagation()}>
                        <EditableText
                            isEditable={isEditing}
                            value={task.name}
                            register={register("name", {
                                required: "You have to enter a name!",
                            })}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") commitRef.current();
                                if (e.key === "Escape") {
                                    reset({ name: task.name });
                                    setIsEditing(false);
                                }
                            }}
                        />
                    </div>
                    {task.blocked_by?.length > 0 && <Icon icon="lock" className="lock" />}
                    <UserPopover taskId={taskId} taskUser={task.user} />
                </div>

                <div className="details">
                    {task.due_date && <div className="date">Due: {dayjs(task.due_date).format("MMM D")}</div>}
                    {task.priority && (
                        <div className={classNames("priority", task.priority)}>
                            <Icon icon="priority" />
                            <span>{task.priority}</span>
                        </div>
                    )}
                </div>

                {workspace?.code_prefix_enabled && <div className="code-prefix">{task.code_name}</div>}

                {user?.preferences.show_board_tags && <TagList tags={tags} />}
            </div>
            {showBlockModal && (
                <Modal className="block-modal" onClose={() => setShowBlockModal(false)}>
                    <Modal.Header title="Block task" />
                    <Modal.Body>
                        <span>Select a task that must be completed before this one can start</span>
                        <DependencySelect taskId={taskId} value={dependencyIds} onChange={setDependencyIds} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={handleBlockTask}>Block task</Button>
                        <Button color="secondary" onClick={() => setShowBlockModal(false)}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </ContextMenu>
    );
});
