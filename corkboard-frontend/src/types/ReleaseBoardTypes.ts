import type { User } from "../context/auth/types.ts";
import type { TagType } from "./TagType.ts";

export type Priority = "low" | "medium" | "high" | "urgent";

export type TaskType = {
    id: string;
    name: string;
    release_id: string | null;
    workspace_id: string | null;
    status: TaskStatus;
    position: number;
    priority: string | null;
    code_name: string;
    user: User | null;
    tags: TagType[];
    start_date: Date | null;
    due_date: Date | null;
};

export type Column = {
    id: TaskStatus;
    taskIds: string[];
};

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review_pending" | "testing" | "adjustments" | "accepted";

export type ReleaseTasks = Record<TaskStatus, TaskType[]>;
