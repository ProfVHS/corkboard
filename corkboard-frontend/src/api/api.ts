import axios from "axios";
import { useToastStore } from "../store/toastStore.ts";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message;
        const status = error.response?.status;
        const addToast = useToastStore.getState().addToast;

        if (status === 401) {
            addToast("error", message || "Invalid credentials");
        } else if (status === 403) {
            addToast("error", "Access denied");
        } else if (status === 404) {
            addToast("error", "Not found");
        } else if (status === 422) {
            addToast("error", message || "Invalid data");
        } else if (status >= 500) {
            addToast("error", "Server error");
        } else {
            addToast("error", message || "Something went wrong");
        }

        return Promise.reject(error);
    },
);
