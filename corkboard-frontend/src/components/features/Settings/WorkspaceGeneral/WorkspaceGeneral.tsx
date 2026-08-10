import "./WorkspaceGeneral.scss";
import { Input } from "../../../ui/Input/Input.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../../api/api.ts";
import { Button } from "../../../ui/Button/Button.tsx";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "../../../../context/auth/useAuth.ts";
import { useWorkspaceStore } from "../../../../store/workspaceStore.ts";
import Loading from "../../../ui/Loading/Loading.tsx";
import { useRef, useState } from "react";
import { CropImageModal } from "../../CropModal/CropModal.tsx";
import { WorkspaceAvatar } from "../../../ui/WorkspaceAvatar/WorkspaceAvatar.tsx";

const schema = yup
    .object({
        id: yup.number(),
        name: yup.string().required("You have to enter a workspace name!"),
    })
    .required();

type FormData = yup.InferType<typeof schema>;

export const WorkspaceGeneral = () => {
    const { workspaceId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
    const workspace = useWorkspaceStore((state) => state.workspace);

    const [logo, setLogo] = useState<string | null>(null)

    const imageInput = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        formState: { isDirty, isLoading },
        getValues,
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: async () => {
            const response = await api.get(`/workspaces/${workspaceId}`);
            return await response.data;
        },
    });

    const workspaceOwner = getValues("owner")?.id === user?.id;

    const handleDeleteWorkspace = () => {
        const workspaceId = getValues("id");
        api.delete(`/workspaces/${workspaceId}`);
        navigate(`/workspaces/${workspaceId}/current_release`);
    };

    const onSubmit = (workspace: FormData) => {
        api.put(`/workspaces/${workspace.id}`, { workspace }).then((res) => {
            reset(res.data);
            setWorkspace(res.data);
        });
    };

    const handleImageSave = (value: Blob) => {
        if (!user) return;

        const formData = new FormData();

        formData.append("workspace[logo]", value);

        api.put(`workspaces/${workspaceId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then((response) => {
            setWorkspace(response.data);
            setLogo(null)
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = () => setLogo(reader.result as string);
        reader.readAsDataURL(file);

        e.target.value = "";
    };

    const handleImageClick = () => {
        if (!imageInput.current) return;

        imageInput.current.click();
    };

    if (isLoading && !workspace) return <Loading overlay={true} />;

    return (
        <div className="workspace-general">
            {logo && <CropImageModal imagePath={logo} onConfirm={handleImageSave} onClose={() => setLogo(null)} />}
            <div className="workspace-general__title">
                Workspace settings
                <div className="workspace-general__buttons">
                    <Button color="primary" disabled={!isDirty} onClick={handleSubmit(onSubmit)}>
                        Save
                    </Button>
                </div>
            </div>

            <div className="workspace-general__section-title">General</div>
            <div className="workspace-general__section">
                <div className="workspace-general__setting">
                    <span className="workspace-general__label">Avatar</span>
                    {workspace && <WorkspaceAvatar onClick={handleImageClick} workspace={workspace} />}
                    <input type="file" ref={imageInput} onChange={(e) => handleFileChange(e)} style={{ display: "none" }} />
                </div>

                <div className="workspace-general__setting">
                    <span className="workspace-general__label">Name</span>
                    <Input defaultValue={!isLoading ? getValues("name") : ""} register={register("name")} />
                </div>
            </div>

            {workspaceOwner && (
                <>
                    <div className="workspace-general__section-title">Danger zone</div>
                    <div className="workspace-general__section">
                        <div className="workspace-general__setting">
                            <span className="workspace-general__label">Delete this Workspace forever</span>
                            <Button color="red" onClick={handleDeleteWorkspace}>
                                Delete
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
