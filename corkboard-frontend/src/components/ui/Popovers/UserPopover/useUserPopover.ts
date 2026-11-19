import type { User } from "@/context/auth/types.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { useReleaseBoardStore } from "@/store/releaseBoardStore.ts";
import { useCollaborators } from "@/query/useCollaborators.ts";
import tasksApi from "@/api/tasks.ts";

interface useUserPopoverProps {
    taskId: string;
    taskUser: User | null;
}

const useUserPopover = ({ taskId, taskUser }: useUserPopoverProps) => {
    const workspace = useWorkspaceStore((state) => state.workspace);
    const updateTask = useReleaseBoardStore((state) => state.updateTask);
    const { data: users = [] } = useCollaborators(workspace?.id);

    const handleAssignUserToTask = (user: User) => {
        tasksApi.update(taskId, { user_id: user.id === taskUser?.id ? null : user.id }, (response) => {
            updateTask(taskId, { user: response.user });
        });
    };

    return { users, handleAssignUserToTask };
};

export default useUserPopover;
