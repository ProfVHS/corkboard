import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastStore {
    toasts: Toast[];
    addToast: (type: ToastType, message: string, duration?: number) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],

    addToast: (type: ToastType, message: string, duration = 3000) => {
        const id = Math.random().toString(36).slice(2, 9);
        const newToast: Toast = { id, message, type, duration };

        set((state) => ({
            toasts: [...state.toasts, newToast],
        }));

        if (duration > 0) {
            setTimeout(() => {
                set((state) => ({
                    toasts: state.toasts.filter((toast) => toast.id !== id),
                }));
            }, duration);
        }
    },

    removeToast: (id: string) => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },
}));
