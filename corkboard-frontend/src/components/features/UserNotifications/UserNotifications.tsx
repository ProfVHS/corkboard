import { Button } from "../../ui/Button/Button.tsx";
import "./UserNotifications.scss";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../../ui/Icons/Icon.tsx";
import { api } from "../../../api/api.ts";
import { useToast } from "../../../hooks/useToast.ts";
import type { WorkspaceType } from "../../../types/WorkspaceType.ts";
import { useWorkspaceStore } from "../../../store/workspaceStore.ts";

type invitationType = {
    invited_by: string;
    workspace: {
        id: number;
        name: string;
    };
};

interface UserNotificationsProps {
    updateWorkspaces: (workspace: WorkspaceType) => void;
}

export const UserNotifications = ({ updateWorkspaces }: UserNotificationsProps) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [invitations, setInvitations] = useState<invitationType[]>([]);
    const notificationMenuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const toast = useToast();
    const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);

    useEffect(() => {
        api.get("workspaces/invitation").then((res) => setInvitations(res.data));
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (buttonRef.current && !buttonRef.current.contains(target) && notificationMenuRef.current && !notificationMenuRef.current.contains(target)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showNotifications, setShowNotifications]);

    const acceptInvitation = (invitationId: number) => {
        api.post(`workspaces/${invitationId}/accept_invitation`).then((response) => {
            setInvitations((prev) => prev.filter((invitation) => invitation.workspace.id !== invitationId));
            toast.success(response.data.message);
            updateWorkspaces(response.data.workspace);
            setWorkspace(response.data.workspace);
        });
    };

    const declineInvitation = (invitationId: number) => {
        api.delete(`workspaces/${invitationId}/decline_invitation`).then((response) => {
            setInvitations((prev) => prev.filter((invitation) => invitation.workspace.id !== invitationId));
            toast.success(response.data.message);
        });
    };

    return (
        <>
            {showNotifications && (
                <div className="user-notifications__menu" ref={notificationMenuRef}>
                    <div className="user-notifications__header">
                        <Icon icon="bell" />
                        Notifications
                    </div>
                    {invitations.map((invitation) => (
                        <div className="user-notifications__notification">
                            <div className="user-notifications__message">
                                {invitation.invited_by} invited you to {invitation.workspace.name}
                            </div>
                            <div className="user-notifications__buttons">
                                <Button color="outlined" size="small" onClick={() => acceptInvitation(invitation.workspace.id)}>
                                    Accept
                                </Button>
                                <Button color="outlined" size="small" onClick={() => declineInvitation(invitation.workspace.id)}>
                                    Decline
                                </Button>
                            </div>
                        </div>
                    ))}

                    {invitations.length === 0 && <div className="user-notifications__notification">You have no notification</div>}
                </div>
            )}
            <Button
                ref={buttonRef}
                className="user-notifications"
                variant="icon"
                color="outlined"
                size="small"
                icon="bell"
                onClick={() => setShowNotifications((prev) => !prev)}
            >
                {invitations.length > 0 && <div className="user-notifications__dot" />}
            </Button>
        </>
    );
};
