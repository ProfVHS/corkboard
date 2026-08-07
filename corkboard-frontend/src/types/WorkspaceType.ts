import type { User } from "../context/auth/types.ts";

export type WorkspaceType = {
    id: number;
    name: string;
    logo: string;
    owner: User;
    number_of_members: number;
};
