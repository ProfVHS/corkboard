import "./UserAvatar.scss";
import { ClassNames } from "../../../global/utils.ts";
import type { User } from "../../../context/auth/types.ts";

type UserAvatarProps = {
    user: User
    onClick?: () => void;
};
export const UserAvatar = ({ user, onClick }: UserAvatarProps) => {
    const usernameFirstLetter = user.username[0].toUpperCase();

    return (
        <div className={ClassNames("user-avatar", { clickable: !!onClick })} style={{ background: user.avatar_url ? "none" : user.color }} onClick={onClick}>
            {user.avatar_url ? <img src={user.avatar_url} alt={usernameFirstLetter} /> : usernameFirstLetter}
        </div>
    );
};
