import "./WorkspaceMenuItem.scss";
import { useWorkspaceStore } from "../../../store/workspaceStore.ts";
import { useNavigate } from "react-router-dom";
import { useWorkspaceMenuStore } from "../../../store/workspaceMenuStore.ts";
import type { User } from "../../../context/auth/types.ts";

type WorkspaceMenuItemProps = {
    id: number;
    name: string;
    owner: User;
    number_of_members: number;
};

export const WorkspaceMenuItem = ({ id, name, owner, number_of_members }: WorkspaceMenuItemProps) => {
    const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
    const setMenuOpen = useWorkspaceMenuStore((state) => state.setOpen);
    const navigate = useNavigate();

    const handleSwitchWorkspace = () => {
        localStorage.setItem("workspace_id", id.toString());
        setWorkspace({ id, name, logo: "", owner, number_of_members });
        setMenuOpen(false);
        navigate(`/workspaces/${id}/current_release`);
    };

    return (
        <button key={id} className="workspace-menu__workspace" onClick={handleSwitchWorkspace}>
            <div className="workspace-menu__workspace-logo">{name[0].toUpperCase()}</div>
            <div className="workspace-menu__workspace-name">{name}</div>
        </button>
    );
};
