import "./WorkspaceUser.scss";
import { Button } from "@/ui/Button/Button.tsx";
import { UserAvatar } from "@/ui/UserAvatar/UserAvatar.tsx";
import { ClassNames } from "@/global/utils.ts";
import { useToast } from "@/hooks/useToast.ts";
import { useParams } from "react-router-dom";
import type { User } from "@/context/auth/types.ts";
import workspacesApi from "@/api/workspaces.ts";
import { useCollaboratorsCache } from "@/query/useCollaborators.ts";

type WorkspaceUserProps = {
    user: User;
    isInvited?: boolean;
};

export const WorkspaceUser = ({ user, isInvited }: WorkspaceUserProps) => {
    const toast = useToast();
    const { workspaceId } = useParams();
    const { removeInvitedUser } = useCollaboratorsCache(workspaceId!);

    const handleCancelUserInvite = () => {
        if (!workspaceId) return;

        workspacesApi.cancelInvitation(workspaceId, { invited_user_id: user.id }, (response) => {
            removeInvitedUser(user.id);
            toast.success(response.message);
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
