import { useEffect, useState } from "react";
import type { UserSettings } from "./types.ts";
import { AuthContext } from "./AuthContext.ts";
import usersApi from "@/api/users.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";

type AuthProviderProps = {
    children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [token, setToken] = useState<string | null>(null);
    const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);

    useEffect(() => {
        const localStorageToken = localStorage.getItem("token");
        if (localStorageToken) {
            usersApi.me(
                (response) => {
                    setWorkspace(response.workspace);
                    setToken(localStorageToken);
                    setUser(response.user);
                    setLoading(false);
                },
                () => {
                    localStorage.removeItem("token");
                    setLoading(false);
                },
            );
        }
    }, [setWorkspace, token]);

    return <AuthContext.Provider value={{ user, setUser, loading, setLoading, token, setToken }}>{children}</AuthContext.Provider>;
};
