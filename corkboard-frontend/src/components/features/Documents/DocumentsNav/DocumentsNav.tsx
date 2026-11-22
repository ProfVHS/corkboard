import "./DocumentsNav.scss";
import SubNavbar from "@/layout/SubNavbar/SubNavbar.tsx";
import { NavLink, useNavigate } from "react-router-dom";
import { Icon } from "@/ui/Icons/Icon.tsx";
import { Button } from "@/ui/Button/Button.tsx";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import type { DocumentType } from "@/types/DocumentType.ts";
import documentsApi from "@/api/documents.ts";

interface DocumentNavProps {
    documents: DocumentType[];
    onAdd: (response: DocumentType) => void;
}

const DocumentsNav = ({ documents, onAdd }: DocumentNavProps) => {
    const workspace = useWorkspaceStore((state) => state.workspace);
    const navigate = useNavigate();

    const handleCreateDocument = () => {
        if (!workspace?.id) return;

        documentsApi.create(workspace.id, (response) => {
            onAdd(response);
        });
    };

    const handleDeleteDocument = (id: string) => {
        if (!workspace?.id) return;

        documentsApi.delete(id, () => {
            navigate(`/workspaces/${workspace.id}/documents/`);
        });
    };

    return (
        <SubNavbar className="documents-nav">
            <SubNavbar.Body>
                {documents.length > 0 &&
                    documents.map((document) => (
                        <NavLink className="item" to={`/workspaces/${workspace?.id}/documents/${document.id}`}>
                            <Icon icon="document" />

                            <span className="name">{document.name}</span>

                            <Button onClick={() => handleDeleteDocument(document.id)}>
                                <Icon icon="trash" />
                            </Button>
                        </NavLink>
                    ))}

                <Button className="create" onClick={handleCreateDocument}>
                    + Add Document
                </Button>
            </SubNavbar.Body>
        </SubNavbar>
    );
};

export default DocumentsNav;
