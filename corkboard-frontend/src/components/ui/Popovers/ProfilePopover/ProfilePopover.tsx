import "./ProfilePopover.scss";
import { UserAvatar } from "@/ui/UserAvatar/UserAvatar.tsx";
import { Icon } from "@/ui/Icons/Icon.tsx";
import Popover from "@/ui/Popover/Popover.tsx";
import useProfilePopover from "./useProfilePopover.ts";
import type { ReactNode } from "react";

type ProfilePopoverItem = {
    icon: ReactNode;
    label: string;
    onClick: () => void;
};

const ProfilePopover = () => {
    const { user, handleProfile, handleLogout } = useProfilePopover();
    const items = [
        user?.role === "user" && {
            icon: <Icon icon="circleUser" />,
            label: "Profile",
            onClick: handleProfile,
        },
        {
            icon: <Icon icon="doorOpen" />,
            label: "Logout",
            onClick: handleLogout,
        },
    ].filter(Boolean) as ProfilePopoverItem[];

    if (!user) return null;

    return (
        <div className="task-status-popover">
            <Popover
                trigger={
                    <div>
                        <UserAvatar username={user.username} />
                        <span>{user.username}</span>
                    </div>
                }
                offset={15}
            >
                {items.map((item) => (
                    <Popover.PopoverItem icon={item.icon} label={item.label} value="" onSelect={item.onClick} />
                ))}
            </Popover>
        </div>
    );
};

export default ProfilePopover;
