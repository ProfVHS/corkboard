import "./DocumentPage.scss";
import { UserAvatar } from "@/ui/UserAvatar/UserAvatar.tsx";
import type { DocumentType } from "@/types/DocumentType.ts";
import { Input } from "@/ui/Input/Input.tsx";
import { CollaborativeEditor } from "../CollaborativeEditor/CollaborativeEditor.tsx";
import { useAuth } from "@/context/auth/useAuth.ts";
import { useEffect, useState } from "react";
import Loading from "@/ui/Loading/Loading.tsx";
import classNames from "classnames";
import documentsApi from "@/api/documents.ts";

interface DocumentPageProps {
    document: DocumentType;
    onUpdate: (response: DocumentType) => void;
}

const DocumentPage = ({ document, onUpdate }: DocumentPageProps) => {
    const [documentName, setDocumentName] = useState("");
    const [isDocumentReady, setIsDocumentReady] = useState<boolean>(false);
    const { user, token } = useAuth();

    const handleUpdateDocumentName = (value: string) => {
        const trimmed = value.trim();

        if (trimmed && trimmed !== document.name) {
            documentsApi.update(document.id, { name: value }, (response) => {
                onUpdate(response);
            });
        } else {
            setDocumentName(document.name);
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
                    className="name"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    onBlur={(e) => handleUpdateDocumentName(e.target.value)}
                />

                <div className="owner">
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
