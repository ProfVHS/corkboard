import tasksApi from "@/api/tasks.ts";
import type { TaskStatus } from "@/types/ReleaseBoardTypes.ts";
import { useCurrentRelease } from "@/query/useReleases.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";

interface useTaskStatusPopoverProps {
    taskId: string;
    taskStatus: string;
}

const useTaskStatusPopover = ({ taskId, taskStatus }: useTaskStatusPopoverProps) => {
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const { data: release } = useCurrentRelease(workspaceId);

    const handleUpdateTaskStatus = (value: string) => {
        if (taskStatus === value) {
            return;
        }

        tasksApi.move(taskId, { status: value as TaskStatus, release_id: value === "backlog" ? null : release!.id }, () => {});
    };

    return { handleUpdateTaskStatus };
};

export default useTaskStatusPopover;
