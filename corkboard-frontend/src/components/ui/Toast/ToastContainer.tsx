import React from "react";
import { useToastStore } from "./../../../store/toastStore.ts";
import "./ToastContainer.scss";
import { Icon, type IconNames } from "../Icons/Icon.tsx";

const icons = {
    success: "success",
    info: "info",
    warning: "warning",
    error: "circleX",
};

const ToastContainer: React.FC = () => {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast ${toast.type}`} role="alert">
                    <div className="content">
                        <Icon icon={icons[toast.type] as IconNames} />
                        <span>{toast.message}</span>
                        <button className="close" onClick={() => removeToast(toast.id)} aria-label="close toast">
                            <Icon icon="close" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
