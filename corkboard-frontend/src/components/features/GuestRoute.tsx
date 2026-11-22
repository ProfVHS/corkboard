import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth.ts";
import Loading from "@/ui/Loading/Loading.tsx";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
    const { loading, user } = useAuth();
    const token = localStorage.getItem("token");
    const workspace = useWorkspaceStore((state) => state.workspace);

    if (!token) return <>{children}</>;

    if (loading) return <Loading overlay={true} />;

    if (user && user.role === "user" && workspace) {
        return <Navigate to={`/workspaces/${workspace.id}/current_release`} replace />;
    }

    if (user && user.role === "superadmin") {
        return <Navigate to={`/superadmin`} replace />;
    }

    return <>{children}</>;
};

export default GuestRoute;
