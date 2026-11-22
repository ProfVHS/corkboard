import "./SettingsPage.scss";
import { SettingsNav } from "@/features/Settings/SettingsNav/SettingsNav.tsx";
import { Outlet } from "react-router-dom";

export const SettingsPage = () => {
    return (
        <div className="settings">
            <SettingsNav />

            <div className="content">
                <Outlet />
            </div>
        </div>
    );
};
