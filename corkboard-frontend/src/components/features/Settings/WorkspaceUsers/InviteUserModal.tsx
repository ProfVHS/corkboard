import Modal from "../../../ui/Modal/Modal.tsx";
import { LabeledInput } from "../../../ui/LabeledInput/LabeledInput.tsx";
import { Button } from "../../../ui/Button/Button.tsx";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ErrorsDisplay } from "../../../ui/ErrorsDisplay/ErrorsDisplay.tsx";
import { api } from "../../../../api/api.ts";
import { useToast } from "../../../../hooks/useToast.ts";
import type { User } from "../../../../context/auth/types.ts";

type InviteUserModalProps = {
    onSave: (user: User) => void;
    onClose: () => void;
    workspaceId: number;
};

const schema = yup
    .object({
        username: yup.string().required("You have to enter a username!"),
    })
    .required();

type FormData = yup.InferType<typeof schema>;

export const InviteUserModal = ({ onSave, onClose, workspaceId }: InviteUserModalProps) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });
    const toast = useToast();

    const onSubmit = (data: FormData) => {
        api.post(`workspaces/${workspaceId}/invite_user`, { username: data.username.toLowerCase() }).then((response) => {
            if (response.data.status === "success") {
                toast.success(response.data.message);
                onSave(response.data.user);
            } else {
                toast.warning(response.data.message);
                onClose();
            }
        });
    };

    return (
        <Modal onClose={onClose}>
            <Modal.Header title="Invite User" />
            <Modal.Body>
                <form>
                    <LabeledInput label="Username" register={register("username")} />
                    <ErrorsDisplay errors={errors} />
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleSubmit(onSubmit)}>Invite</Button>
                <Button color="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
