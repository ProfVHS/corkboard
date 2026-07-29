import "./UserAvatar.scss";

type UserAvatarProps = {
    username: string;
    avatarUrl?: string;
};
export const UserAvatar = ({ username, avatarUrl }: UserAvatarProps) => {
    const usernameFirstLetter = username[0].toUpperCase();

    return <div className="user-avatar">{avatarUrl ? <img src={avatarUrl} alt={usernameFirstLetter} /> : usernameFirstLetter}</div>;
};
