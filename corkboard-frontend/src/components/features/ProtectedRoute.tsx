import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/auth/useAuth.ts";
import { Navbar } from "./Navbar/Navbar.tsx";
import Loading from "../ui/Loading/Loading.tsx";

type ProtectedRouteProps = {
    role?: string;
    children: React.ReactNode;
};

export const ProtectedRoute = ({ role = "user", children }: ProtectedRouteProps) => {
    const { loading, user } = useAuth();
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (loading) return <Loading overlay={true} />;

    if (user?.role !== role) {
        return <Navigate to="/" replace />;
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
};
