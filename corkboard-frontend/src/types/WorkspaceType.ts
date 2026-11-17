import type { User } from "../context/auth/types.ts";

export type WorkspaceType = {
    id: string;
    name: string;
    logo: string;
    owner: User;
    number_of_members: number;
    code_prefix: string;
    code_prefix_enabled: boolean;
    auto_assign?: boolean;
};

export type WorkspaceInvitationType = {
    id: string;
    invited_by: string;
    workspace: {
        id: string;
        name: string;
    };
};
