import "./DocumentPage.scss";
import { UserAvatar } from "../../ui/UserAvatar/UserAvatar.tsx";
import type { DocumentType } from "../../../types/DocumentType.ts";
import { Input } from "../../ui/Input/Input.tsx";
import { api } from "../../../api/api.ts";
import { CollaborativeEditor } from "../CollaborativeEditor/CollaborativeEditor.tsx";
import { useAuth } from "../../../context/auth/useAuth.ts";
import { useDocumentsStore } from "../../../store/documentsStore.ts";
import { useEffect, useState } from "react";
import Loading from "../../ui/Loading/Loading.tsx";
import classNames from "classnames";

interface DocumentPageProps {
    document: DocumentType;
}

const DocumentPage = ({ document }: DocumentPageProps) => {
    const [documentName, setDocumentName] = useState("");
    const [isDocumentReady, setIsDocumentReady] = useState<boolean>(false);
    const { user, token } = useAuth();
    const updateDocument = useDocumentsStore((state) => state.updateDocument);

    const handleUpdateDocumentName = (value: string) => {
        if (document.name !== value) {
            api.patch(`documents/${document.id}`, { name: value }).then(() => {
                updateDocument({ ...document, name: value });
            });
        }
    };

    useEffect(() => {
        setDocumentName(document.name);
    }, [document]);

    return (
        <>
            {!isDocumentReady && <Loading overlay={true} />}

            <div className={classNames("document-page", { hidden: !isDocumentReady })}>
                <Input
                    className="document-page__title"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    onBlur={(e) => handleUpdateDocumentName(e.target.value)}
                />

                <div className="document-page__owner">
                    <UserAvatar username={document.owner.username} />
                    <span>{document.owner.username}</span>
                    <div className="dot"></div>
                    <span>
                        Last Updated{" "}
                        {new Date(document.updated_at).toLocaleString("pl-PL", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                        })}
                    </span>
                </div>

                {user && token && <CollaborativeEditor documentId={document.id} user={user} authToken={token} onReadyChange={setIsDocumentReady} />}
            </div>
        </>
    );
};

export default DocumentPage;
