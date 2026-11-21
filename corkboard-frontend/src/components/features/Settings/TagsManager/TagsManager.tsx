import "./TagsManager.scss";
import { Table } from "@/ui/Table/Table.tsx";
import { useState } from "react";
import type { TagType } from "@/types/TagType.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { Button } from "@/ui/Button/Button.tsx";
import { reverseColor } from "@/global/utils.ts";
import ConfirmationModal from "@/ui/Modals/ConfirmationModal.tsx";
import CreateTagModal from "@/ui/Popovers/TagsPopover/CreateTagModal.tsx";
import Loading from "@/ui/Loading/Loading.tsx";
import tagsApi from "@/api/tags.ts";
import { useTags } from "@/query/useTags.ts";

const TagsManager = () => {
    const [tagToDelete, setTagToDelete] = useState<TagType | null>(null);
    const [tagToEdit, setTagToEdit] = useState<TagType | null>(null);
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const { data: tags = [], isLoading } = useTags(workspaceId);

    const handleDeleteTag = () => {
        if (!tagToDelete) return;

        tagsApi.delete(tagToDelete.id, () => {
            setTagToDelete(null);
        });
    };

    console.log(tags);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="tags-manager">
            <span className="title">Tags manager</span>

            <Table
                data={tags}
                columns={[
                    {
                        key: "name",
                        header: "Name",
                        render: (_, row) => (
                            <div style={{ backgroundColor: row.color, color: reverseColor(row.color) }} className="name">
                                {row.name}
                            </div>
                        ),
                    },
                    {
                        key: "id",
                        header: "Options",
                        render: (_, row) => (
                            <>
                                <Button icon="edit" variant="icon" size="small" color="outlined" onClick={() => setTagToEdit(row)} />
                                <Button icon="trash" variant="icon" size="small" color="outlined" onClick={() => setTagToDelete(row)} />
                            </>
                        ),
                    },
                ]}
            >
                <Button variant="icon" className="workspace-users__invite-btn" onClick={() => setTagToEdit({} as TagType)}>
                    <div>+</div>
                    <div>Add new</div>
                </Button>
            </Table>

            {tagToDelete && (
                <ConfirmationModal
                    title="Delete tag:"
                    subtitle={tagToDelete.name}
                    message="Are you sure you want to delete this tag?"
                    onDelete={handleDeleteTag}
                    onClose={() => setTagToDelete(null)}
                />
            )}

            {tagToEdit && <CreateTagModal tag={tagToEdit} onSave={() => setTagToEdit(null)} onClose={() => setTagToEdit(null)} />}
        </div>
    );
};

export default TagsManager;
