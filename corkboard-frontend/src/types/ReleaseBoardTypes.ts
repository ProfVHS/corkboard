import type { User } from "../context/auth/types.ts";

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
    tags: string[];
    start_date: string | null;
    due_date: string | null;
    blocked_by: TaskType[];
};

export type Column = {
    id: TaskStatus;
    taskIds: string[];
};

export type TaskStatus = "backlog" | "todo" | "in_progress" | "review_pending" | "testing" | "adjustments" | "accepted";
