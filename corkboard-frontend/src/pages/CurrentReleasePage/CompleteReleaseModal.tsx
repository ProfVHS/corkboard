import "./CompleteReleaseModal.scss";
import Modal from "@/ui/Modal/Modal.tsx";
import { Button } from "@/ui/Button/Button.tsx";
import { useState } from "react";
import { useNextRelease } from "@/hooks/useReleases.ts";

export type NotAcceptedTasksAction = "accepted" | "next_release" | "backlog";

interface CompleteReleaseModalProps {
    onSave: (tasksAction: NotAcceptedTasksAction) => void;
    onClose: () => void;
}

const CompleteReleaseModal = ({ onSave, onClose }: CompleteReleaseModalProps) => {
    const [tasksAction, setTasksAction] = useState<NotAcceptedTasksAction>("accepted");
    const { data: nextRelease } = useNextRelease();

    const options: { value: NotAcceptedTasksAction; label: string }[] = [
        { value: "accepted", label: "Accepted" },
        { value: "backlog", label: "Backlog" },
        ...(nextRelease ? [{ value: "next_release" as const, label: "Next release" }] : []),
    ];

    return (
        <Modal className="complete-release-modal" onClose={onClose}>
            <Modal.Header title="Commplete release" />
            <Modal.Body>
                <div>
                    <div>Where do you want to move not accepted tasks?:</div>
                    <div className="options">
                        {options.map(({ value, label }) => (
                            <div key={value} className="option">
                                <input
                                    type="radio"
                                    id={`action-${value}`}
                                    name="not-accepted-action"
                                    value={value}
                                    checked={tasksAction === value}
                                    onChange={() => setTasksAction(value)}
                                />
                                <label className="label" htmlFor={`action-${value}`}>
                                    {label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
                <div>Are you sure you want to complete current release?</div>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={() => onSave(tasksAction)}>Complete</Button>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CompleteReleaseModal;
