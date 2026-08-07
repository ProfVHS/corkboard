import "./WorkspaceUsers.scss";
import { WorkspaceUser } from "./WorkspaceUser.tsx";
import { useEffect, useState } from "react";
import { Button } from "../../../ui/Button/Button.tsx";
import { api } from "../../../../api/api.ts";
import { InviteUserModal } from "./InviteUserModal.tsx";
import { useParams } from "react-router-dom";
import { Table } from "../../../ui/Table/Table.tsx";
import { UserDisplay } from "../../../ui/UserDisplay/UserDisplay.tsx";
import type { UserPreferences } from "../../../../context/auth/types.ts";
import Loading from "../../../ui/Loading/Loading.tsx";

type User = {
    id: number;
    username: string;
    preferences: UserPreferences;
    role: string;
};

export const WorkspaceUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [invitedUsers, setInvitedUsers] = useState<User[]>([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const { workspaceId } = useParams();

    useEffect(() => {
        api.get(`workspaces/${workspaceId}/collaborators`).then((res) => {
            setUsers(res.data.collaborators);
            setInvitedUsers(res.data.invited_users);
            setLoading(false);
        });
    }, []);

    if (loading) return <Loading overlay={true} />;

    return (
        <div className="workspace-users">
            <span className="workspace-users__title">Manage people</span>

            <div className="workspace-users__list">
                {invitedUsers && invitedUsers.map((user, index) => <WorkspaceUser key={index} username={user.username} role={user.role} isInvited />)}

                <Table
                    data={users}
                    columns={[
                        {
                            key: "username",
                            header: "Username",
                            render: (_, row) => <UserDisplay user={row} />,
                        },
                        {
                            key: "role",
                            header: "Role",
                        },
                        {
                            key: "id",
                            header: "Options",
                            render: () => (
                                <>
                                    <Button icon="trash" variant="icon" size="small" color="outlined" />
                                    <Button icon="edit" variant="icon" size="small" color="outlined" />
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
            {showInviteModal && workspaceId && <InviteUserModal onClose={() => setShowInviteModal(false)} workspaceId={parseInt(workspaceId)} />}
        </div>
    );
};
