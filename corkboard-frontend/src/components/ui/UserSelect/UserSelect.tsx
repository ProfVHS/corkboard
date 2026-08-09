import "./UserSelect.scss";
import { Button } from "../Button/Button.tsx";
import { UserAvatar } from "../UserAvatar/UserAvatar.tsx";
import type { User } from "../../../context/auth/types.ts";
import { useUserSelect } from "../../../hooks/useUserSelect.ts";
import { Icon } from "../Icons/Icon.tsx";

interface UserSelectProps {
    taskId: number;
    taskUser: User | null;
    variant?: string;
}

export const UserSelect = ({ taskId, taskUser, variant = "task" }: UserSelectProps) => {
    const { showUserSelection, position, users, userSelectModalRef, buttonRef, handleOpenUserSelection, handleAssignUserToTask } = useUserSelect({ taskId });

    return (
        <div className="user-select" onClick={(e) => e.stopPropagation()}>
            <div ref={buttonRef}>
                {taskUser ? (
                    <div className="user" onClick={handleOpenUserSelection}>
                        <UserAvatar username={taskUser.username} avatarUrl={taskUser.avatar_url} />
                        {variant === "modal" && taskUser.username}
                    </div>
                ) : (
                    <>
                        {variant === "modal" ? (
                            <div onClick={handleOpenUserSelection}>Empty</div>
                        ) : (
                            <Button color="outlined" size="small" variant="icon" icon="circleUser" onClick={handleOpenUserSelection} />
                        )}
                    </>
                )}
            </div>

            {showUserSelection && (
                <div
                    className="user-select__modal"
                    ref={userSelectModalRef}
                    style={{ position: position.position, top: `${position.top}px`, left: `${position.left}px` }}
                >
                    {users.map((user) => (
                        <div key={user.id} className="item" onClick={() => handleAssignUserToTask(user.id)}>
                            <UserAvatar username={user.username} avatarUrl={user.avatar_url} />
                            <span>{user.username}</span>
                            {taskUser?.id === user.id && <Icon icon="close" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
