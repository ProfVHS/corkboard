import "./Documents.scss";
import DocumentsNav from "./DocumentsNav/DocumentsNav.tsx";
import DocumentPage from "./DocumentPage.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import Loading from "@/ui/Loading/Loading.tsx";
import { useDocuments, useDocumentsCache } from "@/query/useDocuments.ts";
import { useEffect } from "react";

export const Documents = () => {
    const { documentId, workspaceId: workspaceIdParam } = useParams();
    const workspaceId = useWorkspaceStore((state) => state.workspace?.id);
    const { data: documents, isLoading } = useDocuments(workspaceId);
    const { addDocument, updateDocument } = useDocumentsCache(workspaceId);
    const navigate = useNavigate();

    const currentDocument = documents?.find((d) => d.id === documentId);

    useEffect(() => {
        if (!documents || documents.length === 0) return;

        if (!currentDocument) {
            navigate(`/workspaces/${workspaceIdParam ?? workspaceId}/documents/${documents[0].id}`, { replace: true });
        }
    }, [documents, currentDocument, navigate, workspaceIdParam, workspaceId]);

    if (!documents || isLoading) return <Loading overlay={true} />;

    return (
        <div className="documents">
            <DocumentsNav documents={documents} onAdd={(response) => addDocument(response)} />

            {documents.length === 0 ? (
                <div className="page-status">Create new document</div>
            ) : currentDocument ? (
                <DocumentPage key={currentDocument.id} document={currentDocument} onUpdate={(response) => updateDocument(response.id, response)} />
            ) : null}
        </div>
    );
};
