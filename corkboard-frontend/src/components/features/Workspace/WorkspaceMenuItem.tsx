import "./WorkspaceMenuItem.scss";
import { useWorkspaceStore } from "../../../store/workspaceStore.ts";
import { useNavigate } from "react-router-dom";
import { useWorkspaceMenuStore } from "../../../store/workspaceMenuStore.ts";
import { WorkspaceAvatar } from "../../ui/WorkspaceAvatar/WorkspaceAvatar.tsx";
import type { WorkspaceType } from "../../../types/WorkspaceType.ts";

type WorkspaceMenuItemProps = {
    workspace: WorkspaceType;
};

export const WorkspaceMenuItem = ({ workspace }: WorkspaceMenuItemProps) => {
    const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
    const setMenuOpen = useWorkspaceMenuStore((state) => state.setOpen);
    const navigate = useNavigate();

    const id = workspace.id;

    const handleSwitchWorkspace = () => {
        localStorage.setItem("workspace_id", id.toString());
        setWorkspace(workspace);
        setMenuOpen(false);
        navigate(`/workspaces/${id}/current_release`);
    };

    return (
        <button key={id} className="workspace-menu__workspace" onClick={handleSwitchWorkspace}>
            <WorkspaceAvatar workspace={workspace} />
            <div className="workspace-menu__workspace-name">{workspace.name}</div>
        </button>
    );
};
