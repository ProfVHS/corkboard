import "./Release.scss";
import { ClassNames } from "@/global/utils.ts";
import { Progress } from "@/ui/ProgressBar/Progress.tsx";
import type { ReleaseType } from "@/types/ReleaseType.ts";
import { useCallback, useEffect, useRef, useState } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { ContextMenu, type ContextMenuItem } from "@/ui/ContextMenu/ContextMenu.tsx";

type ReleasesListItemProps = {
    release: ReleaseType;
    onDeleteClick: () => void;
    onEditClick: () => void;
    isNotDraggable?: boolean;
};

export const Release = ({ release, onDeleteClick, onEditClick, isNotDraggable }: ReleasesListItemProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const releaseId = release.id;

    useEffect(() => {
        if (!ref.current && isNotDraggable) return;

        return draggable({
            element: ref.current!,
            getInitialData: () => ({ type: "release", releaseId }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });
    }, [releaseId, isNotDraggable]);

    const contextMenuOptions = useCallback(
        (): ContextMenuItem[] => [
            {
                type: "button",
                label: "Rename",
                icon: "edit",
                onClick: () => onEditClick(),
            },
            {
                type: "hr",
            },
            {
                type: "button",
                label: "Delete",
                color: "red",
                icon: "trash",
                onClick: () => onDeleteClick(),
            },
        ],
        [onEditClick, onDeleteClick],
    );

    return (
        <ContextMenu items={contextMenuOptions()}>
            <div className={ClassNames("release", { ghost: isDragging, "not-draggable": isNotDraggable })} ref={isNotDraggable ? null : ref}>
                <div className="release__name">
                    <div className="release__number">{release.position + 1}</div>
                    {release.name}
                    <div
                        className={ClassNames("release__badge", {
                            current: release.current,
                            next: release.next,
                        })}
                    >
                        {release.current && "Current"}
                        {release.next && "Next"}
                    </div>
                </div>

                <Progress className="release__progress" maxValue={release.progress?.tasks} value={release.progress?.accepted_tasks} />
            </div>
        </ContextMenu>
    );
};
