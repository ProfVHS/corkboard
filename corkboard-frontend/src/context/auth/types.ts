export type User = {
    id: number;
    username: string;
    avatar_url: string
};

export type UserSettings = {
    id: number;
    username: string;
    avatar_url: string
    preferences: UserPreferences;
};

export type UserPreferences = {
    task_display: "MODAL" | "SIDEBAR";
};

export type AuthContextType = {
    user: UserSettings | null;
    setUser: (user: UserSettings) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    token: string | null;
    setToken: (token: string) => void;
};
