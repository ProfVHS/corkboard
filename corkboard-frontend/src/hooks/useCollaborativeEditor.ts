import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCaret from "@tiptap/extension-collaboration-caret";
import type { User } from "../context/auth/types.ts";
import { useHocuspocusProvider } from "@hocuspocus/provider-react";
import { useEffect, useState } from "react";
import { flushSync } from "react-dom";

type useCollaborativeEditorProps = {
    documentId: number;
    authToken: string;
    user: User;
};

export const useCollaborativeEditor = ({ user }: useCollaborativeEditorProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const provider = useHocuspocusProvider();

    useEffect(() => {
        const handleSynced = () => {
            if (isLoading) {
                flushSync(() => setIsLoading(false));
            }
        };

        provider.on("synced", handleSynced);

        return () => {
            provider.off("synced", handleSynced);
        };
    }, [isLoading, provider]);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                undoRedo: false,
            }),
            Placeholder.configure({
                placeholder: "Write something",
                showOnlyCurrent: false,
            }),
            Collaboration.configure({
                document: provider.document,
            }),
            CollaborationCaret.configure({
                provider: provider,
                user: {
                    name: user.username,
                    color: "#9D00FF",
                },
            }),
        ],
        editorProps: {
            attributes: {
                spellcheck: "false",
            },
        },
    });

    return { editor, isLoading };
};
