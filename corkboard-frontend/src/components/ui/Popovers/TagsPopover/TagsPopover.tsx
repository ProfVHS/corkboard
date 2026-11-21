import "./TagsPopover.scss";
import Popover from "@/ui/Popover/Popover.tsx";
import CreateTagModal from "./CreateTagModal.tsx";
import { Icon } from "@/ui/Icons/Icon.tsx";
import { reverseColor } from "@/global/utils.ts";
import { useState } from "react";
import type { TagType } from "@/types/TagType.ts";
import tagsApi from "@/api/tags.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { useTags, useTagsCache } from "@/query/useTags.ts";
import { useTask, useTasksCache } from "@/query/useTasks.ts";

interface TagsPopoverProps {
    taskId: string;
}

const MAX_VISIBLE_TAGS = 3;

const TagsPopover = ({ taskId }: TagsPopoverProps) => {
    const workspaceId = useWorkspaceStore((s) => s.workspace?.id);
    const [showCreateTagModal, setShowCreateTagModal] = useState(false);

    const { task } = useTask(taskId);
    const { data: allTags = [] } = useTags(workspaceId);
    const { updateTask } = useTasksCache();
    const { addTag } = useTagsCache(workspaceId);

    console.log(task);

    const tagIds = task?.tags ?? [];
    const taskTags = allTags.filter((t) => tagIds.includes(t.id));
    const availableTags = allTags.filter((t) => !tagIds.includes(t.id));

    const handleAddTagToTask = (tagId: string) => {
        tagsApi.assign(taskId, tagId, () => {
            updateTask(taskId, { tags: [...tagIds, tagId] });
        });
    };

    const handleRemoveTagFromTask = (tagId: string) => {
        tagsApi.unassign(taskId, tagId, () => {
            updateTask(taskId, { tags: tagIds.filter((id) => id !== tagId) });
        });
    };

    const renderTaskTag = (tag: TagType) => (
        <div key={tag.id} className="tag" style={{ backgroundColor: tag.color, color: reverseColor(tag.color) }}>
            <span className="label">{tag.name}</span>
            <div
                className="icon-container"
                onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTagFromTask(tag.id);
                }}
            >
                <Icon icon="close" color={reverseColor(tag.color)} />
            </div>
        </div>
    );

    return (
        <div className="tags-popover">
            <Popover
                trigger={
                    <div>
                        {taskTags.length > 0 ? (
                            <div className="task-tags">
                                {taskTags.slice(0, MAX_VISIBLE_TAGS).map(renderTaskTag)}
                                {taskTags.length > MAX_VISIBLE_TAGS && (
                                    <div className="tag tag--more">
                                        <span className="label">+{taskTags.length - MAX_VISIBLE_TAGS}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span>Empty</span>
                        )}
                    </div>
                }
            >
                <div className="section">
                    <span className="header">Task tags</span>
                    <div className="list">{taskTags.length > 0 ? taskTags.map(renderTaskTag) : <span className="empty">No tags</span>}</div>
                </div>

                <span className="header">Tags</span>
                <div className="list">
                    {availableTags.length > 0 ? (
                        availableTags.map((tag) => (
                            <Popover.PopoverItem
                                key={tag.id}
                                className="tag"
                                style={{ backgroundColor: tag.color, color: reverseColor(tag.color) }}
                                label={tag.name}
                                value={tag.id}
                                selected={false}
                                closeOnSelect={false}
                                onSelect={handleAddTagToTask}
                            />
                        ))
                    ) : (
                        <span className="empty">No more tags</span>
                    )}
                </div>
                <Popover.PopoverItem className="add" label="+ Add new" value={true} selected={false} onSelect={setShowCreateTagModal} />
            </Popover>

            {showCreateTagModal && (
                <CreateTagModal
                    onSave={(tag) => {
                        addTag(tag);
                        setShowCreateTagModal(false);
                    }}
                    onClose={() => setShowCreateTagModal(false)}
                />
            )}
        </div>
    );
};

export default TagsPopover;
