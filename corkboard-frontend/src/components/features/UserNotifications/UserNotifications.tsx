import "./UserNotifications.scss";
import { Button } from "../../ui/Button/Button.tsx";
import { Icon } from "../../ui/Icons/Icon.tsx";
import type { WorkspaceType } from "../../../types/WorkspaceType.ts";
import useUserNotification from "./useUserNotification.ts";

interface UserNotificationsProps {
    updateWorkspaces: (workspace: WorkspaceType) => void;
}

export const UserNotifications = ({ updateWorkspaces }: UserNotificationsProps) => {
    const { showNotifications, setShowNotifications, invitations, triggerRef, menuRef, acceptInvitation, declineInvitation } = useUserNotification({
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
                    {invitations.map((invitation) => (
                        <div className="notification">
                            <div className="message">
                                {invitation.invited_by} invited you to {invitation.workspace.name}
                            </div>
                            <div className="buttons">
                                <Button className="accept" color="outlined" size="small" onClick={() => acceptInvitation(invitation.workspace.id)}>
                                    Accept
                                </Button>
                                <Button className="decline" color="outlined" size="small" onClick={() => declineInvitation(invitation.workspace.id, invitation.workspace.name)}>
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
