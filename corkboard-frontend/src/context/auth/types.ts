export type User = {
    id: number;
    username: string;
    avatar_url: string;
    color: string;
};

export type UserSettings = {
    id: number;
    username: string;
    avatar_url: string
    preferences: UserPreferences;
    role: "user" | "superadmin";
    color: string;
};

export type UserPreferences = {
    task_display: "modal" | "sidebar";
};

export type AuthContextType = {
    user: UserSettings | null;
    setUser: (user: UserSettings) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    token: string | null;
    setToken: (token: string) => void;
};
