import "./SettingsNav.scss";
import { NavLink } from "react-router-dom";
import { Icon } from "../../../ui/Icons/Icon.tsx";
import { useWorkspaceStore } from "../../../../store/workspaceStore.ts";
import SubNavbar from "../../../layout/SubNavbar/SubNavbar.tsx";

export const SettingsNav = () => {
    const workspace = useWorkspaceStore((state) => state.workspace);

    return (
        <SubNavbar className="settings-navbar">
            <SubNavbar.Header header="All Settings" />

            <div className="settings-nav__section">
                <SubNavbar.Title title="Workspace" />

                <SubNavbar.Body>
                    <NavLink className="settings-nav__tab" to={`/settings/workspace/${workspace?.id}/general`}>
                        <Icon icon="gear" />
                        General
                    </NavLink>
                    <NavLink className="settings-nav__tab" to={`/settings/workspace/${workspace?.id}/users`}>
                        <Icon icon="users" />
                        Users
                    </NavLink>
                </SubNavbar.Body>
            </div>

            <div className="settings-nav__section">
                <SubNavbar.Title title="My Settings" />

                <SubNavbar.Body>
                    <NavLink className="settings-nav__tab" to="/settings/user/profile">
                        <Icon icon="circleUser" />
                        Preferences
                    </NavLink>
                    <NavLink className="settings-nav__tab" to="/settings/user/workspaces">
                        <Icon icon="workspaces" />
                        Workspaces
                    </NavLink>
                </SubNavbar.Body>
            </div>
        </SubNavbar>
    );
};
