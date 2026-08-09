import "./UserProfile.scss";
import { Button } from "../../../ui/Button/Button.tsx";
import { LabeledInput } from "../../../ui/LabeledInput/LabeledInput.tsx";
import { api } from "../../../../api/api.ts";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/auth/useAuth.ts";
import { useRef, useState } from "react";
import type { TaskDisplayType } from "../../../../types/TaskDisplayType.ts";
import { UserAvatar } from "../../../ui/UserAvatar/UserAvatar.tsx";
import { CropAvatarModal } from "../../CropModal/CropModal.tsx";

export const UserProfile = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [username, setUsername] = useState<string>(user ? user.username : "");
    const [avatar, setAvatar] = useState<string | null>(null);

    const avatarInput = useRef<HTMLInputElement>(null)

    const handleLogout = () => {
        api.delete("/logout");
        localStorage.setItem("token", "");
        navigate("/");
    };

    const handleChangeTaskDisplay = (value: TaskDisplayType) => {
        api.put("user_preferences", { user_preference: { task_display: value } }).then((response) => {
            setUser(response.data);
        });
    };

    const handleChangeUsername = (value: string) => {
        if (!user || user.username === value) return;

        api.put(`/users/${user.id}`, { user: { username: value } }).then((response) => {
            setUser(response.data);
        });
    };

    const handleAvatarSave = (value: Blob) => {
        if (!user) return;

        const formData = new FormData();

        formData.append("user[avatar]", value);

        api.put(`users/${user.id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then((response) => {
            setUser(response.data);
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = () => setAvatar(reader.result as string);
        reader.readAsDataURL(file);

        e.target.value = "";
    };

    const handleAvatarClick = () => {
        if (!avatarInput.current) return

        avatarInput.current.click()
    }

    return (
        <div className="user-profile">
            {avatar && <CropAvatarModal avatarUrl={avatar} onConfirm={handleAvatarSave} onClose={() => setAvatar(null)} />}
            <span className="user-profile__title">My settings</span>

            <div className="user-profile__section">
                <div className="user-profile__section-info">
                    <div className="title">Profile</div>
                    <div className="description">Your personal information and account security settings.</div>
                </div>
                <div className="user-profile__section-content">
                    <div className="avatar-text">Avatar</div>
                    {user && <UserAvatar onClick={handleAvatarClick} user={user} />}
                    <input type="file" ref={avatarInput} onChange={(e) => handleFileChange(e)} style={{ display: "none" }} />
                    <LabeledInput
                        label="Full Name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={(e) => handleChangeUsername(e.target.value)}
                    />
                </div>
            </div>

            <div className="user-profile__section">
                <div className="user-profile__section-info">
                    <div className="title">Task display</div>
                    <div className="description">Choose how task details should open — as a modal window or a side panel.</div>
                </div>
                <div className="user-profile__section-content task-display">
                    <label className="radio-option">
                        <input
                            type="radio"
                            name="taskDisplay"
                            value="modal"
                            checked={user?.preferences.task_display === "modal"}
                            onChange={() => handleChangeTaskDisplay("modal")}
                        />
                        <span className="radio-option__icon radio-option__icon--modal">
                            <span className="radio-option__icon-shape" />
                        </span>
                        <span className="radio-option__label">Modal</span>
                    </label>

                    <label className="radio-option">
                        <input
                            type="radio"
                            name="taskDisplay"
                            value="sidebar"
                            checked={user?.preferences.task_display === "sidebar"}
                            onChange={() => handleChangeTaskDisplay("sidebar")}
                        />
                        <span className="radio-option__icon radio-option__icon--sidebar">
                            <span className="radio-option__icon-shape" />
                        </span>
                        <span className="radio-option__label">Panel</span>
                    </label>
                </div>
            </div>

            <div className="user-profile__section">
                <div className="user-profile__section-info">
                    <div className="title">Danger zone</div>
                    <div className="description">Proceed with caution.</div>
                </div>
                <div className="user-profile__section-content">
                    <Button color="secondary" onClick={handleLogout}>
                        Log out
                    </Button>
                    <Button color="red">Delete account</Button>
                </div>
            </div>
        </div>
    );
};
