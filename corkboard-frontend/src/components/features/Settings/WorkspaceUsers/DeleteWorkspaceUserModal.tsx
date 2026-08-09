import Modal from "../../../ui/Modal/Modal.tsx";
import { Button } from "../../../ui/Button/Button.tsx";
import type { User } from "../../../../context/auth/types.ts";
import { api } from "../../../../api/api.ts";
import { useToast } from "../../../../hooks/useToast.ts";
import { useParams } from "react-router-dom";

interface DeleteWorkspaceUserModalProps {
    user: User;
    onSave: (user: User) => void;
    onClose: () => void;
}

const DeleteWorkspaceUserModal = ({ user, onSave, onClose }: DeleteWorkspaceUserModalProps) => {
    const toast = useToast();
    const { workspaceId } = useParams();

    const handleDeleteWorkspaceUser = () => {
        api.delete(`/workspaces/${workspaceId}/delete_user`, { data: { user_id: user.id } }).then((response) => {
            toast.success(response.data.message);
            onSave(user);
        });
    };

    return (
        <Modal onClose={onClose}>
            <Modal.Header title="Delete workspace user" />
            <Modal.Body>Are you sure you want to delete {user.username} from this workspace?</Modal.Body>
            <Modal.Footer>
                <Button color="red" onClick={handleDeleteWorkspaceUser}>
                    Delete
                </Button>
                <Button color="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteWorkspaceUserModal;
