import type { User } from "../context/auth/types.ts";

export type DocumentType = {
    id: number;
    name: string;
    owner: User;
    updated_at: string;
    actor_id?: number;
};
