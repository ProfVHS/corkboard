import "./WorkspaceAvatar.scss";
import type { WorkspaceType } from "../../../types/WorkspaceType.ts";
import classNames from "classnames";

type UserAvatarProps = {
    workspace: WorkspaceType;
    onClick?: () => void;
    className?: string
};
export const WorkspaceAvatar = ({ workspace, onClick, className }: UserAvatarProps) => {
    const usernameFirstLetter = workspace.name[0].toUpperCase();

    return (
        <div onClick={onClick} className={classNames("workspace-avatar", className, { clickable: onClick })}>
            {workspace.logo_url ? <img src={workspace.logo_url} alt={workspace.name} /> : usernameFirstLetter}
        </div>
    );
};
