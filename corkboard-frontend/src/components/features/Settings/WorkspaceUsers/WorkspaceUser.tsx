import "./WorkspaceUser.scss";
import { Button } from "../../../ui/Button/Button.tsx";
import { UserAvatar } from "../../../ui/UserAvatar/UserAvatar.tsx";
import { ClassNames } from "../../../../global/utils.ts";
import { api } from "../../../../api/api.ts";
import { useToast } from "../../../../hooks/useToast.ts";
import { useParams } from "react-router-dom";
import type { User } from "../../../../context/auth/types.ts";

type WorkspaceUserProps = {
    user: User;
    onCancel: (user: User) => void;
    isInvited?: boolean;
};

export const WorkspaceUser = ({ user, onCancel, isInvited }: WorkspaceUserProps) => {
    const toast = useToast();
    const { workspaceId } = useParams();

    const handleCancelUserInvite = () => {
        api.delete(`/workspaces/${workspaceId}/cancel_invitation`, { data: { invited_user_id: user.id } }).then((response) => {
            toast.success(response.data.message);
            onCancel(response.data.user);
        });
    };

    return (
        <div className={ClassNames("workspace-user", { invited: isInvited })}>
            <UserAvatar username={user.username} />
            <div className="name">{user.username}</div>
            {isInvited && <div className="invited-badge">Invited</div>}
            <div className="options">
                {!isInvited && (
                    <>
                        <Button icon="trash" variant="icon" size="small" color="outlined" />
                        <Button icon="edit" variant="icon" size="small" color="outlined" />
                    </>
                )}
                {isInvited && (
                    <Button color="outlined" size="small" onClick={handleCancelUserInvite}>
                        Cancel
                    </Button>
                )}
            </div>
        </div>
    );
};
