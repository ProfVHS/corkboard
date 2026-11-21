import { useAuth } from "@/context/auth/useAuth.ts";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast.ts";
import sessionApi from "@/api/session.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";

const useProfilePopover = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const resetWorkspaceStore = useWorkspaceStore((state) => state.reset);

    const handleProfile = () => {
        navigate("/settings/user/profile");
    };

    const handleLogout = () => {
        sessionApi.logout((response) => {
            localStorage.setItem("token", "");
            navigate("/");
            resetWorkspaceStore();
            toast.success(response.message);
        });
    };

    return { user, handleProfile, handleLogout };
};

export default useProfilePopover;
