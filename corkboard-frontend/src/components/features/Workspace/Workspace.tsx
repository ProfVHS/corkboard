import './Workspace.scss';
import { forwardRef } from 'react';
import { useWorkspaceMenuStore } from '../../../store/workspaceMenuStore.ts';
import { WorkspaceAvatar } from "../../ui/WorkspaceAvatar/WorkspaceAvatar.tsx";
import type { WorkspaceType } from "../../../types/WorkspaceType.ts";

type WorkspaceProps = {
    workspace: WorkspaceType;
};

export const Workspace = forwardRef<HTMLDivElement, WorkspaceProps>(({ workspace }, ref) => {
    const isMenuOpen = useWorkspaceMenuStore((state) => state.isOpen);
    const setMenuOpen = useWorkspaceMenuStore((state) => state.setOpen);

    return (
        <div ref={ref} className="workspace-current" onClick={() => setMenuOpen(!isMenuOpen)}>
            <div className="workspace-current__logo">
                <WorkspaceAvatar workspace={workspace} />
            </div>
            <span className="workspace-current__name">{workspace.name}</span>
            <span className="workspace-current__arrow">v</span>
        </div>
    );
});
