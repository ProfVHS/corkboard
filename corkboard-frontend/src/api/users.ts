import { api } from "@/api";
import type { UserPreferences, UserSettings } from "@/context/auth/types.ts";
import type { WorkspaceType } from "@/types/WorkspaceType.ts";
import type { ReleaseType } from "@/types/ReleaseType.ts";

type MeResponse = {
    user: UserSettings;
    workspace: WorkspaceType;
    release: ReleaseType | null;
    next_release: ReleaseType | null;
};

const usersApi = {
    getAll: (onSuccess: (response: UserSettings[]) => void, onError?: (error: unknown) => void) => {
        api.get(`/users`)
            .then((response) => onSuccess(response.data))
            .catch(onError);
    },
    get: (userId: string, onSuccess: (response: UserSettings) => void, onError?: (error: unknown) => void) => {
        api.get(`/users/${userId}`)
            .then((response) => onSuccess(response.data))
            .catch(onError);
    },
    update: (
        userId: string,
        data: { username?: string; password?: string; password_confirmation?: string },
        onSuccess: (response: UserSettings) => void,
        onError?: (error: unknown) => void,
    ) => {
        api.put(`/users/${userId}`, data)
            .then((response) => onSuccess(response.data))
            .catch(onError);
    },
    delete: (userId: string, onSuccess: (response: any) => void, onError?: (error: unknown) => void) => {
        api.delete(`/users/${userId}`)
            .then((response) => onSuccess(response.data))
            .catch(onError);
    },
    me: (onSuccess: (response: MeResponse) => void, onError?: (error: unknown) => void) => {
        api.get(`/users/me`)
            .then((response) => onSuccess(response.data))
            .catch(onError);
    },
    updatePreferences: (data: Partial<UserPreferences>, onSuccess: (response: UserSettings) => void, onError?: (error: unknown) => void) => {
        api.put(`/user_preferences`, data)
            .then((response) => onSuccess(response.data))
            .catch(onError);
    },
};

export default usersApi;
