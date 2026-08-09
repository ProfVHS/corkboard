import "./UserDisplay.scss";
import type { User } from "../../../context/auth/types.ts";
import { UserAvatar } from "../UserAvatar/UserAvatar.tsx";
import { useWorkspaceStore } from "../../../store/workspaceStore.ts";

type UserDisplayProps = {
    user: User;
};

export const UserDisplay = ({ user }: UserDisplayProps) => {
    const workspace = useWorkspaceStore((state) => state.workspace);

    return (
        <div className="user-display">
            <UserAvatar username={user.username} avatarUrl={user.avatar_url}/>
            <span>{user.username}</span>
            {workspace?.owner.id === user.id && <span className="owner-badge">Owner</span>}
        </div>
    );
};
