export const workspaceKeys = {
    collaborators: (workspaceId?: string) => ["workspaces", workspaceId, "collaborators"] as const,
};

export const invitationKeys = {
    mine: () => ["invitations", "mine"] as const,
};
