import { useEffect, useRef, useState } from "react";
import { useWorkspaceStore } from "../store/workspaceStore.ts";
import { useReleaseBoardStore } from "../store/releaseBoardStore.ts";
import { api } from "../api/api.ts";

interface UseUserSelectProps {
    taskId: number;
}

export const useUserSelect = ({ taskId }: UseUserSelectProps) => {
    const [showUserSelection, setShowUserSelection] = useState<boolean>(false);
    const [position, setPosition] = useState<{ top: number; left: number; position: "absolute" | "fixed" }>({ top: 0, left: 0, position: "fixed" });
    const [users, setUsers] = useState<{ id: number; username: string }[]>([]);

    const userSelectModalRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const workspace = useWorkspaceStore((state) => state.workspace);
    const updateTaskUser = useReleaseBoardStore((state) => state.updateTaskUser);

    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const inSidebar = buttonRef.current.closest(".task-sidebar-overlay") !== null;

            setPosition({
                top: inSidebar ? 30 : rect.bottom + 10,
                left: inSidebar ? 0 : rect.left,
                position: inSidebar ? "absolute" : "fixed",
            });
        }
    };

    const handleOpenUserSelection = () => {
        updatePosition();
        setShowUserSelection(true);
    };

    const handleAssignUserToTask = (userId: number) => {
        updateTaskUser(taskId, userId);
        setShowUserSelection(false);
    };

    useEffect(() => {
        if (!showUserSelection) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (
                userSelectModalRef.current &&
                !userSelectModalRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                setShowUserSelection(false);
            }
        };

        const handleScroll = () => {
            updatePosition();
        };

        const handleWheel = (e: WheelEvent) => {
            if (userSelectModalRef.current && !userSelectModalRef.current.contains(e.target as Node)) {
                e.preventDefault();
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (userSelectModalRef.current && !userSelectModalRef.current.contains(e.target as Node)) {
                e.preventDefault();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);
        document.addEventListener("wheel", handleWheel, { passive: false });
        document.addEventListener("touchmove", handleTouchMove, { passive: false });

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
            document.removeEventListener("wheel", handleWheel);
            document.removeEventListener("touchmove", handleTouchMove);
        };
    }, [showUserSelection]);

    useEffect(() => {
        if (!showUserSelection) return;

        api.get(`/workspaces/${workspace?.id}/collaborators`).then((response) => {
            setUsers(response.data.collaborators);
        });
    }, [showUserSelection, workspace?.id]);

    return {
        showUserSelection,
        position,
        users,
        userSelectModalRef,
        buttonRef,
        handleOpenUserSelection,
        handleAssignUserToTask,
    };
};
