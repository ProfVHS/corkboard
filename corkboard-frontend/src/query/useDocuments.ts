import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api";
import type { DocumentType } from "@/types/DocumentType.ts";
import { documentKeys } from "@/query/queryKeys.ts";

export function useDocuments<T = DocumentType[]>(workspaceId?: string, select?: (d: DocumentType[]) => T) {
    return useQuery({
        queryKey: documentKeys.list(workspaceId),
        queryFn: async () => (await api.get<DocumentType[]>(`/documents`, { params: { workspace_id: workspaceId } })).data,
        enabled: !!workspaceId,
        staleTime: 5 * 60 * 1000,
        select,
    });
}

export function useDocumentsCache(workspaceId?: string) {
    const queryClient = useQueryClient();

    return useMemo(() => {
        const key = documentKeys.list(workspaceId);
        const update = (fn: (old: DocumentType[]) => DocumentType[]) => queryClient.setQueryData<DocumentType[]>(key, (old) => (old ? fn(old) : old));

        return {
            setDocuments: (documents: DocumentType[]) => queryClient.setQueryData<DocumentType[]>(key, documents),
            addDocument: (document: DocumentType) =>
                update((old) => (old.some((d) => d.id === document.id) ? old.map((d) => (d.id === document.id ? document : d)) : [...old, document])),
            updateDocument: (documentId: string, changes: Partial<DocumentType>) =>
                update((old) => old.map((d) => (d.id === documentId ? { ...d, ...changes } : d))),
            removeDocument: (documentId: string) => update((old) => old.filter((d) => d.id !== documentId)),
            refetch: () => queryClient.invalidateQueries({ queryKey: key }),
        };
    }, [queryClient, workspaceId]);
}
