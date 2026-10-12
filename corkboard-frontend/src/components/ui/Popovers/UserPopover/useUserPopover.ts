import { useEffect, useState } from "react";
import type { User } from "@/context/auth/types.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { useReleaseBoardStore } from "@/store/releaseBoardStore.ts";
import { api } from "@/api";

interface useUserPopoverProps {
    taskId: string;
    taskUser: User | null;
}

const useUserPopover = ({ taskId, taskUser }: useUserPopoverProps) => {
    const [users, setUsers] = useState<User[]>([]);

    const workspace = useWorkspaceStore((state) => state.workspace);
    const updateTaskUser = useReleaseBoardStore((state) => state.updateTaskUser);

    const handleAssignUserToTask = (userId: string) => {
        console.log("safdad")

        if (userId === taskUser?.id) {
            updateTaskUser(taskId, "");
        } else {
            updateTaskUser(taskId, userId);
        }
    };

    useEffect(() => {
        if (!workspace?.id) return;

        api.get(`/workspaces/${workspace?.id}/collaborators`).then((response) => {
            setUsers(response.data.collaborators);
        });
    }, [workspace?.id]);

    return { users, handleAssignUserToTask };
};

export default useUserPopover;
