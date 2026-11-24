import "./WorkspaceGeneral.scss";
import { Input } from "@/ui/Input/Input.tsx";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/ui/Button/Button.tsx";
import * as yup from "yup";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/context/auth/useAuth.ts";
import { useWorkspaceStore } from "@/store/workspaceStore.ts";
import Loading from "@/ui/Loading/Loading.tsx";
import Switch from "@/ui/Switch/Switch.tsx";
import workspacesApi from "@/api/workspaces.ts";
import { api } from "@/api";
import { useToast } from "@/hooks/useToast.ts";
import SettingsSection from "@/features/Settings/SettingsSection.tsx";
import { useState } from "react";
import ConfirmationModal from "@/ui/Modals/ConfirmationModal.tsx";

const schema = yup
    .object({
        id: yup.string().required(),
        name: yup.string().required("You have to enter a workspace name!"),
        code_prefix_enabled: yup.boolean().nullable().default(true),
        code_prefix: yup
            .string()
            .nullable()
            .max(3, "Max 3 characters")
            .when("code_prefix_enabled", {
                is: true,
                then: (schema) => schema.required("Code prefix is required!"),
                otherwise: (schema) => schema.optional(),
            }),
        auto_assign: yup.boolean().nullable().default(false),
        owner: yup.object().optional(),
    })
    .required();

type FormData = yup.InferType<typeof schema>;

const WorkspaceGeneral = () => {
    const { workspaceId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const setWorkspace = useWorkspaceStore((state) => state.setWorkspace);
    const [showDeleteModal, setSHowDeleteModal] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { isDirty, isLoading },
        getValues,
        reset,
        watch,
        control,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: async () => {
            const response = await api.get(`/workspaces/${workspaceId}`);
            return await response.data;
        },
    });
    const workspaceOwner = getValues("owner")?.id === user?.id;
    const toast = useToast();

    const handleDeleteWorkspace = async () => {
        workspacesApi.delete(getValues("id"), (response) => {
            navigate("/workspaces");
            toast.success(response.message);
        });
    };

    const onSubmit = ({ id, name, code_prefix_enabled, code_prefix, auto_assign }: FormData) => {
        workspacesApi.update(
            id,
            { name, code_prefix_enabled: code_prefix_enabled ?? undefined, code_prefix: code_prefix ?? undefined, auto_assign: auto_assign ?? undefined },
            (response) => {
                reset(response);
                setWorkspace(response);
                toast.success("Successfully updated workspace");
            },
        );
    };

    if (isLoading) return <Loading overlay={true} />;

    return (
        <div className="workspace-general">
            <div className="title">
                Workspace settings
                <div className="buttons">
                    <Button color="primary" disabled={!isDirty} onClick={handleSubmit(onSubmit)}>
                        Save
                    </Button>
                </div>
            </div>

            <SettingsSection>
                <SettingsSection.Info title="General" description="COs tam o workspace" />
                <SettingsSection.Content
                    children={
                        <>
                            <div className="avatar">{getValues("name")?.[0]?.toUpperCase()}</div>
                            <Input register={register("name")} placeholder="Workspace name" />
                        </>
                    }
                />
            </SettingsSection>

            <SettingsSection>
                <SettingsSection.Info title="other options" description="Enable code prefix" />
                <SettingsSection.Content
                    children={
                        <Controller
                            control={control}
                            name="code_prefix_enabled"
                            render={({ field }) => <Switch checked={!!field.value} onChange={(checked) => field.onChange(checked)} />}
                        />
                    }
                />

                {watch("code_prefix_enabled") && (
                    <>
                        <SettingsSection.Info description="Tasks code prefix" />
                        <SettingsSection.Content
                            children={
                                <Input
                                    className="code-prefix"
                                    register={register("code_prefix", {
                                        setValueAs: (value) => value?.toUpperCase() || "",
                                    })}
                                    maxLength={3}
                                />
                            }
                        />
                    </>
                )}

                <SettingsSection.Info description="Auto assign" />
                <SettingsSection.Content
                    children={
                        <Controller
                            control={control}
                            name="auto_assign"
                            render={({ field }) => <Switch checked={!!field.value} onChange={(checked) => field.onChange(checked)} />}
                        />
                    }
                />
            </SettingsSection>

            {workspaceOwner && (
                <SettingsSection>
                    <SettingsSection.Info title="Danger zone" description="Proceed with caution." />
                    <SettingsSection.Content
                        children={
                            <>
                                <Button color="red" onClick={() => setSHowDeleteModal(true)}>
                                    Delete workspace
                                </Button>
                                {showDeleteModal && (
                                    <ConfirmationModal
                                        title="Delete workspace?"
                                        message={<span>???</span>}
                                        onDelete={handleDeleteWorkspace}
                                        onClose={() => setSHowDeleteModal(false)}
                                    />
                                )}
                            </>
                        }
                    />
                </SettingsSection>
            )}
        </div>
    );
};

export default WorkspaceGeneral;
