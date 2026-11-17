import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/useToast.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import type { WorkspaceType } from "@/types/WorkspaceType.ts";
import workspacesApi from "@/api/workspaces.ts";
import { useMyInvitationsCache } from "@/hooks/useMyInvitations.ts";

interface UseUserNotificationProps {
    workspaceId: string;
    updateWorkspaces: (workspace: WorkspaceType) => void;
}

const useUserNotification = ({ updateWorkspaces }: UseUserNotificationProps) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const toast = useToast();
    const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
    const { removeInvitation } = useMyInvitationsCache();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (triggerRef.current && !triggerRef.current.contains(target) && menuRef.current && !menuRef.current.contains(target)) {
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

    const acceptInvitation = (workspaceId: string) => {
        workspacesApi.acceptInvitation(workspaceId, (response) => {
            removeInvitation(workspaceId);
            toast.success(response.message);
            updateWorkspaces(response.workspace);
            setWorkspace(response.workspace);
        });
    };

    const declineInvitation = (workspaceId: string, invitationName: string) => {
        workspacesApi.declineInvitation(workspaceId, { name: invitationName }, (response) => {
            removeInvitation(workspaceId);
            toast.success(response.message);
        });
    };

    return { showNotifications, setShowNotifications, triggerRef, menuRef, acceptInvitation, declineInvitation };
};

export default useUserNotification;
