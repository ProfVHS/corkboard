export const workspaceKeys = {
    collaborators: (workspaceId?: string) => ["workspaces", workspaceId, "collaborators"] as const,
};

export const invitationKeys = {
    mine: () => ["invitations", "mine"] as const,
};

export const releaseKeys = {
    list: (workspaceId?: string) => ["workspaces", workspaceId, "releases"] as const,
};

export const taskKeys = {
    board: (releaseId?: string) => ["releases", releaseId, "tasks"] as const,
    backlog: (workspaceId?: string) => ["workspaces", workspaceId, "backlog"] as const,
};

export const tagKeys = {
    list: (workspaceId?: string) => ["workspaces", workspaceId, "tags"] as const,
};

export const documentKeys = {
    list: (workspaceId?: string) => ["workspaces", workspaceId, "documents"] as const,
};
