import Modal from "../../ui/Modal/Modal.tsx";
import { Button } from "../../ui/Button/Button.tsx";
import { type SubmitHandler, useForm } from "react-hook-form";
import { api } from "../../../api/api.ts";
import { LabeledInput } from "../../ui/LabeledInput/LabeledInput.tsx";
import type { WorkspaceType } from "../../../types/WorkspaceType.ts";

type CreateWorkspaceModalProps = {
    onSave: (data: WorkspaceType) => void;
    onClose: () => void;
};

type Inputs = {
    name: string;
};

export const CreateWorkspaceModal = ({ onSave, onClose }: CreateWorkspaceModalProps) => {
    const { register, handleSubmit } = useForm<Inputs>();

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        api.post("/workspaces", { name: data.name }).then((response) => {
            onSave(response.data);
        });
    };

    return (
        <Modal onClose={onClose}>
            <Modal.Header title="Create new workspace" />
            <Modal.Body>
                <LabeledInput label="Workspace Name" register={register("name", { required: "You have to enter a workspace name!" })} />
            </Modal.Body>
            <Modal.Footer>
                <Button color="primary" onClick={handleSubmit(onSubmit)}>
                    Create
                </Button>
                <Button color="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
