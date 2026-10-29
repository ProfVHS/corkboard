import { Button } from "@/ui/Button/Button.tsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast.ts";
import sessionApi from "@/api/session.ts";
import { useState } from "react";
import ConfirmationModal from "@/ui/Modals/ConfirmationModal.tsx";
import usersApi from "@/api/users.ts";
import { useAuth } from "@/context/auth/useAuth.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { useReleaseBoardStore } from "@/store/releaseBoardStore.ts";

const DangerZoneSection = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const toast = useToast();
    const [showDeleteModal, setSHowDeleteModal] = useState<boolean>(false);
    const resetWorkspaceStore = useWorkspaceStore((state) => state.reset);
    const resetReleaseBoardStore = useReleaseBoardStore((state) => state.reset);

    const handleLogout = () => {
        sessionApi.logout((response) => {
            localStorage.setItem("token", "");
            navigate("/");
            resetWorkspaceStore();
            resetReleaseBoardStore();
            toast.success(response.message);
        });
    };

    const handleDelete = () => {
        if (!user) return;

        usersApi.delete(user.id, (response) => {
            console.log(response);
            localStorage.setItem("token", "");
            navigate("/");
            resetWorkspaceStore();
            resetReleaseBoardStore();
            toast.success(response.message);
        });
    };

    return (
        <>
            <Button color="secondary" onClick={handleLogout}>
                Log out
            </Button>
            <Button color="red" onClick={() => setSHowDeleteModal(true)}>
                Delete account
            </Button>
            {showDeleteModal && (
                <ConfirmationModal
                    title="Delete account?"
                    message={
                        <span>
                            Your account will be <b>permanently deleted</b>, along with your workspaces and all the releases, tasks, and documents in them. This
                            cannot be undone.
                        </span>
                    }
                    onDelete={handleDelete}
                    onClose={() => setSHowDeleteModal(false)}
                />
            )}
        </>
    );
};

export default DangerZoneSection;
