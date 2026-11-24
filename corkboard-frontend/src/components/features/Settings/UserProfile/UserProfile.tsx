import "./UserProfile.scss";
import SettingsSection from "@/features/Settings/SettingsSection.tsx";
import { useAuth } from "@/context/auth/useAuth.ts";
import Loading from "@/ui/Loading/Loading.tsx";
import Switch from "@/ui/Switch/Switch.tsx";
import usersApi from "@/api/users.ts";
import sessionApi from "@/api/session.ts";
import { Button } from "@/ui/Button/Button.tsx";
import ConfirmationModal from "@/ui/Modals/ConfirmationModal.tsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/useToast.ts";
import { useState } from "react";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import { LabeledInput } from "@/ui/LabeledInput/LabeledInput.tsx";
import type { TaskDisplayType } from "@/types/TaskDisplayType.ts";

const UserProfile = () => {
    const { user, loading, setUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();
    const [showDeleteModal, setSHowDeleteModal] = useState<boolean>(false);
    const [showLogoutModal, setSHowLogoutModal] = useState<boolean>(false);
    const resetWorkspaceStore = useWorkspaceStore((state) => state.reset);
    const [username, setUsername] = useState<string>(user ? user.username : "");

    const handleChangeUsername = (value: string) => {
        if (!user || user.username === value) return;

        usersApi.update(user.id, { username: value }, (response) => {
            setUser(response);
        });
    };

    const handleChangeTaskDisplay = (value: TaskDisplayType) => {
        usersApi.updatePreferences({ task_display: value }, (response) => {
            setUser(response);
        });
    };

    const handleChangeShowBoardTags = (value: boolean) => {
        usersApi.updatePreferences({ show_board_tags: value }, (response) => {
            setUser(response);
        });
    };

    const handleChangeSpellcheck = (value: boolean) => {
        usersApi.updatePreferences({ spellcheck: value }, (response) => {
            setUser(response);
        });
    };

    const handleLogout = () => {
        sessionApi.logout((response) => {
            localStorage.setItem("token", "");
            navigate("/");
            resetWorkspaceStore();
            toast.success(response.message);
        });
    };

    const handleDelete = () => {
        if (!user) return;

        usersApi.delete(user.id, (response) => {
            console.log(response);
            localStorage.setItem("token", "");
            navigate("/");
            resetWorkspaceStore();
            toast.success(response.message);
        });
    };

    if (loading) return <Loading />;

    return (
        <div className="user-profile">
            <span className="title">My settings</span>
            <SettingsSection>
                <SettingsSection.Info title="Profile" description="Your personal information and account security settings." />
                <SettingsSection.Content
                    className="profile"
                    children={
                        <>
                            <div className="avatar">A</div>
                            <LabeledInput
                                label="Full Name"
                                value={username}
                                autoFocus={false}
                                onChange={(e) => setUsername(e.target.value)}
                                onBlur={(e) => handleChangeUsername(e.target.value)}
                            />
                        </>
                    }
                />
            </SettingsSection>

            <SettingsSection>
                <SettingsSection.Info title="Preferences" description="Choose how task details should open — as a modal window or a side panel." />
                <SettingsSection.Content
                    className="task-display"
                    children={
                        <>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="taskDisplay"
                                    value="modal"
                                    checked={user?.preferences.task_display === "modal"}
                                    onChange={() => handleChangeTaskDisplay("modal")}
                                />
                                <span className="icon icon-modal">
                                    <span className="shape" />
                                </span>
                                <span className="label">Modal</span>
                            </label>
                            <label className="radio-option">
                                <input
                                    type="radio"
                                    name="taskDisplay"
                                    value="sidebar"
                                    checked={user?.preferences.task_display === "sidebar"}
                                    onChange={() => handleChangeTaskDisplay("sidebar")}
                                />
                                <span className="icon icon-sidebar">
                                    <span className="shape" />
                                </span>
                                <span className="label">Panel</span>
                            </label>
                        </>
                    }
                />

                <SettingsSection.Info description="Show tags on board?" />
                <SettingsSection.Content children={<Switch defaultChecked={user?.preferences.show_board_tags} onChange={handleChangeShowBoardTags} />} />

                <SettingsSection.Info description="Enable documents and inputs spellcheck" />
                <SettingsSection.Content children={<Switch defaultChecked={user?.preferences.spellcheck} onChange={handleChangeSpellcheck} />} />
            </SettingsSection>

            <SettingsSection>
                <SettingsSection.Info title="Danger zone" description="Proceed with caution." />
                <SettingsSection.Content
                    children={
                        <>
                            <Button color="secondary" onClick={() => setSHowLogoutModal(true)}>
                                Log out
                            </Button>
                            <Button color="red" onClick={() => setSHowDeleteModal(true)}>
                                Delete account
                            </Button>
                            {showDeleteModal && (
                                <ConfirmationModal
                                    title="Delete account?"
                                    message={
                                        <span>
                                            Your account will be <b>permanently deleted</b>, along with your workspaces and all the releases, tasks, and
                                            documents in them. This cannot be undone.
                                        </span>
                                    }
                                    onDelete={handleDelete}
                                    onClose={() => setSHowDeleteModal(false)}
                                />
                            )}
                            {showLogoutModal && (
                                <ConfirmationModal
                                    title="Log out?"
                                    message={
                                        <span>Are you sure you want to log out of your account? You will need to sign in again to access your workspace.</span>
                                    }
                                    onDelete={handleLogout}
                                    onClose={() => setSHowLogoutModal(false)}
                                />
                            )}
                        </>
                    }
                />
            </SettingsSection>
        </div>
    );
};

export default UserProfile;
