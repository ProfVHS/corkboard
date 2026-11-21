import "./WorkspaceUsers.scss";
import { WorkspaceUser } from "./WorkspaceUser.tsx";
import { useState } from "react";
import { Button } from "@/ui/Button/Button.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Table } from "@/ui/Table/Table.tsx";
import { UserDisplay } from "@/ui/UserDisplay/UserDisplay.tsx";
import Loading from "@/ui/Loading/Loading.tsx";
import type { User } from "@/context/auth/types.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { useAuth } from "@/context/auth/useAuth.ts";
import { useToast } from "@/hooks/useToast.ts";
import CreateModal from "@/ui/Modals/CreateModal.tsx";
import ConfirmationModal from "@/ui/Modals/ConfirmationModal.tsx";
import workspacesApi from "@/api/workspaces.ts";
import { useCollaborators, useCollaboratorsCache, useInvitedUsers } from "@/query/useCollaborators.ts";

const WorkspaceUsers = () => {
    const [showInviteModal, setShowInviteModal] = useState(false);
    const { workspaceId } = useParams();
    const { user } = useAuth();
    const workspace = useWorkspaceStore((state) => state.workspace);
    const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userToLeave, setUserToLeave] = useState<User | null>(null);
    const toast = useToast();
    const { data: users = [], isLoading: isLoadingCollaborators } = useCollaborators(workspace?.id);
    const { data: invitedUsers = [], isLoading: isLoadingInvitedUsers } = useInvitedUsers(workspace?.id);
    const { addInvitedUser, removeCollaborator } = useCollaboratorsCache(workspaceId!);
    const navigate = useNavigate();

    const handleDeleteWorkspaceUser = () => {
        if (!workspaceId || !userToDelete) return;

        workspacesApi.deleteUser(workspaceId, { user_id: userToDelete.id, username: userToDelete.username }, (response) => {
            setUserToDelete(null);
            removeCollaborator(userToDelete.id);
            toast.success(response.message);
        });
    };

    const handleLeaveWorkspace = () => {
        if (!workspaceId || !userToLeave) return;

        workspacesApi.leaveWorkspace(workspaceId, (response) => {
            setWorkspace(response.workspace);
            navigate(`/workspaces//${response.workspace.id}/current_release`);
            toast.success(response.message);
        });
    };

    const handleInviteUser = (data: { name: string }) => {
        if (!workspaceId) return;

        workspacesApi.inviteUser(workspaceId, { username: data.name.toLowerCase() }, (response) => {
            if (response.status === "success") {
                toast.success(response.message);
                addInvitedUser(response.user);
                setShowInviteModal(false);
            } else {
                toast.warning(response.message);
                setShowInviteModal(false);
            }
        });
    };

    if (isLoadingCollaborators || isLoadingInvitedUsers) return <Loading overlay={true} />;

    return (
        <div className="workspace-users">
            <span className="workspace-users__title">Manage people</span>
            <div className="workspace-users__list">
                {invitedUsers && invitedUsers.map((user, index) => <WorkspaceUser key={index} user={user} isInvited />)}

                <Table
                    data={users}
                    columns={[
                        {
                            key: "username",
                            header: "Username",
                            render: (_, row) => <UserDisplay user={row} />,
                        },
                        {
                            key: "id",
                            header: "Options",
                            render: (_, row) => (
                                <>
                                    {workspace?.owner?.id === user?.id && user?.id !== row.id && (
                                        <>
                                            <Button icon="trash" variant="icon" size="small" color="outlined" onClick={() => setUserToDelete(row)} />
                                        </>
                                    )}
                                    {workspace?.owner?.id !== user?.id && user?.id === row.id && (
                                        <>
                                            <Button icon="doorOpen" variant="icon" size="small" color="outlined" onClick={() => setUserToLeave(row)} />
                                        </>
                                    )}
                                </>
                            ),
                        },
                    ]}
                >
                    <Button variant="icon" className="workspace-users__invite-btn" onClick={() => setShowInviteModal(true)}>
                        <div className="workspace-users__invite-icon">+</div>
                        <div className="workspace-users__invite-text">Invite User</div>
                    </Button>
                </Table>
            </div>
            {showInviteModal && workspaceId && (
                <CreateModal
                    title="Invite user"
                    inputLabel="Username"
                    buttonLabel="Invite"
                    onSave={handleInviteUser}
                    onClose={() => setShowInviteModal(false)}
                />
            )}
            {userToDelete && (
                <ConfirmationModal
                    title="Delete workspace user:"
                    subtitle={`${userToDelete.username}`}
                    message={`Are you sure you want to delete ${userToDelete.username} from this workspace?`}
                    onDelete={handleDeleteWorkspaceUser}
                    onClose={() => setUserToDelete(null)}
                />
            )}{" "}
            {userToLeave && (
                <ConfirmationModal
                    title="Leave workspace:"
                    subtitle={workspace?.name}
                    message="Are you sure you want to leave this workspace?"
                    onDelete={handleLeaveWorkspace}
                    onClose={() => setUserToLeave(null)}
                />
            )}
        </div>
    );
};

export default WorkspaceUsers;
