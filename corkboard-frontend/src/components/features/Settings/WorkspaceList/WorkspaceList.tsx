import "./WorkspaceList.scss";
import { useEffect, useState } from "react";
import type { WorkspaceType } from "../../../../types/WorkspaceType.ts";
import { api } from "../../../../api/api.ts";
import { Table } from "../../../ui/Table/Table.tsx";
import { Button } from "../../../ui/Button/Button.tsx";
import { useAuth } from "../../../../context/auth/useAuth.ts";
import { WorkspaceDisplay } from "../../../ui/WorkspaceDisplay/WorkspaceDisplay.tsx";
import { useNavigate } from "react-router-dom";
import Loading from "../../../ui/Loading/Loading.tsx";

export const WorkspaceList = () => {
    const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const handleOpenWorkspaceSettings = (id: number) => {
        navigate(`/settings/workspace/${id}/general`);
    };

    useEffect(() => {
        api.get("/workspaces").then((res) => {
            setWorkspaces(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) return <Loading overlay={true} />;

    return (
        <div className="workspace-list">
            <div className="workspace-list__title">My workspaces</div>
            <Table
                data={workspaces}
                columns={[
                    {
                        key: "name",
                        header: "Name",
                        render: (_, row) => <WorkspaceDisplay workspace={row} />,
                    },
                    {
                        key: "owner",
                        header: "Owner",
                        render: (_, row) => row.owner.username,
                    },
                    {
                        key: "id",
                        header: "Options",
                        render: (_, row) => (
                            <>
                                <Button icon="gear" variant="icon" color="outlined" size="small" onClick={() => handleOpenWorkspaceSettings(row.id)} />
                                {row.owner.id !== user?.id && (
                                    <Button icon="doorOpen" variant="icon" color="outlined" size="small" disabled={row.owner.id !== user?.id} />
                                )}
                            </>
                        ),
                    },
                ]}
            />
        </div>
    );
};
