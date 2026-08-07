import "./Documents.scss";
import DocumentsNav from "./DocumentsNav/DocumentsNav.tsx";
import DocumentPage from "./DocumentPage.tsx";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWorkspaceStore } from "../../../store/workspaceStore.ts";
import { useDocumentsStore } from "../../../store/documentsStore.ts";
import { useDocumentsSubscription } from "../../../store/documentsSubscription.ts";
import { useAuth } from "../../../context/auth/useAuth.ts";
import Loading from "../../ui/Loading/Loading.tsx";

export const Documents = () => {
    const { documentId } = useParams();
    const workspace = useWorkspaceStore((state) => state.workspace);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    const fetchDocuments = useDocumentsStore((state) => state.fetchDocuments);
    const documents = useDocumentsStore((state) => state.documents);

    useDocumentsSubscription(workspace?.id, user?.id);

    useEffect(() => {
        if (!workspace) return;
        fetchDocuments(workspace?.id, (res) => {
            if (!documentId && res.length > 0) navigate(`${res[0].id}`);
            setLoading(false);
        });
    }, [documentId, fetchDocuments, navigate, workspace]);

    if (loading) return <Loading overlay={true} />;

    return (
        <div className="documents">
            <DocumentsNav documents={documents} />

            {documents.length > 0 ? (
                <DocumentPage key={documentId} document={documents.find((d) => d.id === Number(documentId)) ?? documents[0]} />
            ) : documents.length > 0 ? (
                <div className="page-status">Choose document</div>
            ) : (
                <div className="page-status">Create new document</div>
            )}
        </div>
    );
};
