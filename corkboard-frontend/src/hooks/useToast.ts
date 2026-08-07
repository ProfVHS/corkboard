import { useToastStore } from "./../store/toastStore.ts";

export const useToast = () => {
    const addToast = useToastStore((state) => state.addToast);

    return {
        success: (message: string, duration?: number) => addToast("success", message, duration),
        error: (message: string, duration?: number) => addToast("error", message, duration),
        info: (message: string, duration?: number) => addToast("info", message, duration),
        warning: (message: string, duration?: number) => addToast("warning", message, duration),
    };
};
