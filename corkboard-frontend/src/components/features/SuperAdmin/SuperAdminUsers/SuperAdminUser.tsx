import "./SuperAdminUser.scss";
import { LabeledInput } from "../../../ui/LabeledInput/LabeledInput.tsx";
import { useEffect, useState } from "react";
import type { UserSettings } from "../../../../context/auth/types.ts";
import { api } from "../../../../api/api.ts";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../../ui/Loading/Loading.tsx";
import { Button } from "../../../ui/Button/Button.tsx";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useToast } from "../../../../hooks/useToast.ts";

const validationSchema = Yup.object({
    username: Yup.string().trim().required("Username is required"),
    changePassword: Yup.boolean(),
    password: Yup.string().when("changePassword", {
        is: true,
        then: (schema) => schema.min(6, "Password is too short, use at least 6 letters").required("Password is required"),
        otherwise: (schema) => schema.notRequired(),
    }),
    confirmPassword: Yup.string().when("changePassword", {
        is: true,
        then: (schema) => schema.required("Password confirmation is required").oneOf([Yup.ref("password")], "Passwords doesn't match"),
        otherwise: (schema) => schema.notRequired(),
    }),
});

const SuperAdminUser = () => {
    const { id } = useParams();
    const [user, setUser] = useState<UserSettings | null>(null);
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    useEffect(() => {
        api.get(`/users/${id}`).then((response) => {
            setUser(response.data);
            formik.setValues({
                username: response.data.username,
                changePassword: false,
                password: "",
                confirmPassword: "",
            });
        });
    }, [id]);

    const formik = useFormik({
        initialValues: {
            username: "",
            changePassword: false,
            password: "",
            confirmPassword: "",
        },
        validationSchema,
        enableReinitialize: false,
        onSubmit: async (values) => {
            const payload: Record<string, string> = {};

            if (values.username.trim() !== user?.username) {
                payload.username = values.username.trim();
            }

            if (values.changePassword) {
                payload.password = values.password;
                payload.password_confirmation = values.confirmPassword;
            }

            if (Object.keys(payload).length === 0) {
                navigate("/superadmin/users");
                return;
            }

            setSaving(true);

            try {
                api.put(`/users/${id}`, { user: payload }).then(() => {
                    navigate("/superadmin/users");
                });
            } catch {
                toast.error("Server Error");
            } finally {
                setSaving(false);
            }
        },
    });

    if (!user) {
        return <Loading overlay={true} />;
    }

    return (
        <form className="superadmin-user" onSubmit={formik.handleSubmit}>
            <div className="header">
                <Button className="cancel" color="secondary" onClick={() => navigate("/superadmin/users")}>
                    Cancel
                </Button>
                <Button type="submit" className="save" color="primary" disabled={saving}>
                    Save
                </Button>
            </div>
            <div className="content">
                <LabeledInput
                    label="Username"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.username ? formik.errors.username : undefined}
                    require
                />

                <label>
                    <input
                        type="checkbox"
                        name="changePassword"
                        checked={formik.values.changePassword}
                        onChange={(e) => {
                            formik.setFieldValue("changePassword", e.target.checked);
                            if (!e.target.checked) {
                                formik.setFieldValue("password", "");
                                formik.setFieldValue("confirmPassword", "");
                            }
                        }}
                    />
                    Change password
                </label>

                {formik.values.changePassword && (
                    <>
                        <LabeledInput
                            label="Password"
                            name="password"
                            type="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.password ? formik.errors.password : undefined}
                            autoComplete="new-password"
                            require
                        />
                        <LabeledInput
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
                            autoComplete="new-password"
                            require
                        />
                    </>
                )}
            </div>
        </form>
    );
};

export default SuperAdminUser;
