import "./UserNotifications.scss";
import { Button } from "@/ui/Button/Button.tsx";
import { Icon } from "@/ui/Icons/Icon.tsx";
import type { WorkspaceType } from "@/types/WorkspaceType.ts";
import useUserNotification from "./useUserNotification.ts";
import { useMyInvitations } from "@/hooks/useMyInvitations.ts";

interface UserNotificationsProps {
    workspaceId: string;
    updateWorkspaces: (workspace: WorkspaceType) => void;
}

export const UserNotifications = ({ workspaceId, updateWorkspaces }: UserNotificationsProps) => {
    const { data: invitations = [] } = useMyInvitations();
    const { showNotifications, setShowNotifications, triggerRef, menuRef, acceptInvitation, declineInvitation } = useUserNotification({
        workspaceId,
        updateWorkspaces,
    });

    return (
        <div className="user-notifications">
            {showNotifications && (
                <div className="menu" ref={menuRef}>
                    <div className="header">
                        <Icon icon="bell" />
                        <span>Notifications</span>
                    </div>
                    {invitations.map((invitation, index) => (
                        <div key={index} className="notification">
                            <div className="user-notifications__message">
                                {invitation.invited_by} invited you to {invitation.workspace.name}
                            </div>
                            <div className="user-notifications__buttons">
                                <Button color="outlined" size="small" onClick={() => acceptInvitation(invitation.workspace.id)}>
                                    Accept
                                </Button>
                                <Button color="outlined" size="small" onClick={() => declineInvitation(invitation.workspace.id, invitation.workspace.name)}>
                                    Decline
                                </Button>
                            </div>
                        </div>
                    ))}

                    {invitations.length === 0 && <div className="notification">You have no notification</div>}
                </div>
            )}

            <Button
                ref={triggerRef}
                className="trigger"
                variant="icon"
                color="outlined"
                size="small"
                icon="bell"
                onClick={() => setShowNotifications((prev) => !prev)}
            >
                {invitations.length > 0 && <div className="dot" />}
            </Button>
        </div>
    );
};
