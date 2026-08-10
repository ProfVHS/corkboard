import "./WorkspaceDisplay.scss"
import type {WorkspaceType} from "../../../types/WorkspaceType.ts";
import {WorkspaceAvatar} from "../WorkspaceAvatar/WorkspaceAvatar.tsx";

type UserDisplayProps = {
    workspace: WorkspaceType
}
export const WorkspaceDisplay = ({workspace}: UserDisplayProps) => {
    return (
        <div className="workspace-display">
            <WorkspaceAvatar workspace={workspace}/>
            <span>{workspace.name}</span>
        </div>
    )
}