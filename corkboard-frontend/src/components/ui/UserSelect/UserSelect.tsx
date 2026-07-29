import "./UserSelect.scss";
import { Button } from "../Button/Button.tsx";
import { useEffect, useRef, useState } from "react";
import { UserAvatar } from "../UserAvatar/UserAvatar.tsx";
import { api } from "../../../api/api.ts";
import { useWorkspaceStore } from "../../../store/workspaceStore.ts";
import type { User } from "../../../context/auth/types.ts";
import { useReleaseBoardStore } from "../../../store/releaseBoardStore.ts";

interface UserSelectProps {
    taskId: number;
    taskUser: User | null;
    readonly?: boolean;
}

export const UserSelect = ({ taskId, taskUser, readonly = false }: UserSelectProps) => {
    const [showUserSelection, setShowUserSelection] = useState<boolean>(false);
    const userSelectModalRef = useRef<HTMLDivElement>(null);
    const [users, setUsers] = useState<{ id: number; username: string; avatar_url: string }[]>([]);
    const workspace = useWorkspaceStore((state) => state.workspace);
    const updateTaskUser = useReleaseBoardStore((state) => state.updateTaskUser);

    const handleOpenUserSelection = () => {
        if (readonly) return;
        setShowUserSelection(true);
    };

    const handleAssignUserToTask = (userId: number) => {
        updateTaskUser(taskId, userId);
        setShowUserSelection(false);
    };

    useEffect(() => {
        if (!showUserSelection) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (userSelectModalRef.current && !userSelectModalRef.current.contains(e.target as Node)) {
                setShowUserSelection(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showUserSelection, setShowUserSelection]);

    useEffect(() => {
        if (!showUserSelection) return;

        api.get(`/workspaces/${workspace?.id}/collaborators`).then((response) => {
            setUsers(response.data.collaborators);
        });
    }, [showUserSelection, setUsers, workspace?.id]);

    return (
        <div className="user-select">
            {taskUser ? (
                <div onClick={handleOpenUserSelection}>
                    <UserAvatar username={taskUser.username} avatarUrl={taskUser.avatar_url} />
                </div>
            ) : (
                <Button color="outlined" size="small" variant="icon" icon="userCircle" onClick={handleOpenUserSelection} />
            )}

            {showUserSelection && (
                <div className="user-select__modal" ref={userSelectModalRef}>
                    {users.map((user) => (
                        <div key={user.id} className="item" onClick={() => handleAssignUserToTask(user.id)}>
                            <UserAvatar username={user.username} avatarUrl={user.avatar_url} />
                            <span>{user.username}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
