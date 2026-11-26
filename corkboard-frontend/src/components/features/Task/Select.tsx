import { useMemo } from "react";
import type { TaskType } from "@/types/ReleaseBoardTypes.ts";
import { useAllTasks } from "@/query/useTasks.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import "./Select.scss";

type Props = {
    taskId: string;
    value: string[];
    onChange: (taskIds: string[]) => void;
};

export function DependencySelect({ taskId, value, onChange }: Props) {
    const workspace = useWorkspaceStore((s) => s.workspace);
    const { tasks, isLoading } = useAllTasks();
    const useCodePrefix = !!workspace?.code_prefix_enabled;

    const sorted = useMemo(
        () =>
            tasks
                .filter((t) => t.id !== taskId)
                .sort((a, b) =>
                    useCodePrefix
                        ? String(a.code_name).localeCompare(String(b.code_name), undefined, { numeric: true })
                        : a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
                ),
        [tasks, taskId, useCodePrefix],
    );

    const selected = useMemo(() => sorted.filter((t) => value.includes(t.id)), [sorted, value]);
    const available = useMemo(() => sorted.filter((t) => !value.includes(t.id)), [sorted, value]);

    const label = (t: TaskType) => (useCodePrefix ? `${t.code_name} ${t.name}` : t.name);

    return (
        <div className="dependency-select">
            <select
                value=""
                disabled={isLoading || available.length === 0}
                onChange={(e) => {
                    if (e.target.value) onChange([...value, e.target.value]);
                }}
            >
                <option value="">{isLoading ? "Loading..." : available.length === 0 ? "No more tasks" : "Add a task"}</option>
                {available.map((t) => (
                    <option key={t.id} value={t.id}>
                        {label(t)}
                    </option>
                ))}
            </select>

            {selected.length > 0 && (
                <div className="chips">
                    {selected.map((t) => (
                        <div key={t.id} className="chip">
                            <span>{label(t)}</span>
                            <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((id) => id !== t.id))}>
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
