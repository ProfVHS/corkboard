import "./ReleaseList.scss";
import { Release } from "@/pages/ReleasesPage/Release.tsx";
import type { ReleaseType } from "@/types/ReleaseType.ts";
import { useEffect, useRef, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { ClassNames } from "@/global/utils.ts";
import { motion, LayoutGroup } from "framer-motion";
import releasesApi from "@/api/releases.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";

type ReleaseListProps = {
    releases: ReleaseType[];
    onMove: (releases: ReleaseType[]) => void;
    onEdit: (release: ReleaseType) => void;
    onDelete: (release: ReleaseType) => void;
    columnId: string;
};
export const ReleaseList = ({ columnId, releases, onMove, onEdit, onDelete }: ReleaseListProps) => {
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const ref = useRef<HTMLDivElement>(null);
    const releaseIds = releases.map((release) => release.id);
    const workspace = useWorkspaceStore((state) => state.workspace);

    useEffect(() => {
        if (!ref.current) return;

        return dropTargetForElements({
            element: ref.current,
            canDrop: ({ source }) => source.data.type === "release",
            onDragLeave: () => {
                setDragOverIndex(null);
            },
            onDrag: ({ location }) => {
                const releaseElements = ref.current?.querySelectorAll(".release:not(.dragging)");
                if (!releaseElements) return;

                const y = location.current.input.clientY;
                let index = releaseIds.length;

                releaseElements.forEach((element, i) => {
                    const rect = element.getBoundingClientRect();
                    const middle = rect.top + rect.height / 2;
                    if (y < middle && index === releaseIds.length) {
                        index = i;
                    }
                });

                setDragOverIndex(index);
            },
            onDrop: ({ source, location }) => {
                setDragOverIndex(null);

                const releaseId = source.data.releaseId as string;
                if (!releaseIds) return;

                const fromColumn = releases.map((r) => r.id).includes(releaseId) ? "QUEUED" : "NOT_QUEUED";
                if (!fromColumn) return;

                const releaseElements = ref.current?.querySelectorAll(".release:not(.dragging)");

                const y = location.current.input.clientY;
                let index = releases.length;

                releaseElements?.forEach((element, i) => {
                    const rect = element.getBoundingClientRect();
                    const middle = rect.top + rect.height / 2;
                    if (y < middle && index === releases.length) {
                        index = i;
                    }
                });

                releasesApi.move(releaseId, { workspace_id: workspace?.id, status: columnId, position: index }, (response) => {
                    onMove(response);
                });
            },
        });
    });

    return (
        <motion.div layout key={columnId} className="release-list" ref={ref}>
            <LayoutGroup>
                {columnId === "QUEUED" && releases.length > 0 && (
                    <Release
                        key={releases[0]?.id}
                        release={releases[0]}
                        onEditClick={() => onEdit(releases[0])}
                        onDeleteClick={() => onDelete(releases[0])}
                        isNotDraggable
                    />
                )}
                {releases &&
                    releases.slice(columnId === "QUEUED" ? 1 : 0, releases.length).map((release, index) => (
                        <motion.div
                            layout
                            layoutId={release.id.toString()}
                            key={release.id}
                            transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.8 }}
                        >
                            {dragOverIndex === index && <div className="placeholder" />}
                            <Release key={release.id} release={release} onEditClick={() => onEdit(release)} onDeleteClick={() => onDelete(release)} />
                        </motion.div>
                    ))}
            </LayoutGroup>
            {dragOverIndex === releases.length && releases.find((r) => r.id) && <div className="placeholder" />}
            <div className={ClassNames("dropzone", { active: dragOverIndex === releases.length })}>Drop Release Here to remove it from queue</div>
        </motion.div>
    );
};
