import type { User } from "../context/auth/types.ts";

export type Priority = "low" | "medium" | "high" | "urgent";

export type TaskType = {
    id: number;
    name: string;
    description: string;
    release_id: number | null;
    workspace_id: number | null;
    status: string;
    order: number;
    priority: string | null;
    user: User | null;
    actor_id?: number;
};

export type Column = {
    id: string;
    taskIds: number[];
};
