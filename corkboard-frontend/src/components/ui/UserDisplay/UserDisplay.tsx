import type {User} from "../../../context/auth/types.ts";
import {UserAvatar} from "../UserAvatar/UserAvatar.tsx";

import "./UserDisplay.scss"

type UserDisplayProps = {
    user: User
}
export const UserDisplay = ({user}: UserDisplayProps) => {
    return (
        <div className="user-display">
            <UserAvatar username={user.username} avatarUrl={user.avatar_url}/>
            <span>{user.username}</span>
        </div>
    )
}