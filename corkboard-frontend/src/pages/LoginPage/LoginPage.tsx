import "./LoginPage.scss";
import { Button } from "@/ui/Button/Button.tsx";
import { LabeledInput } from "@/ui/LabeledInput/LabeledInput.tsx";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/ui/Icons/Icon.tsx";
import { useAuth } from "@/context/auth/useAuth.ts";
import { useToast } from "@/hooks/useToast.ts";
import sessionApi from "@/api/session.ts";

type Inputs = {
    username: string;
    password: string;
};

export const LoginPage = () => {
    const { register, handleSubmit } = useForm<Inputs>();
    const { setToken } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        sessionApi.login(data, (response) => {
            localStorage.setItem("token", response.token);
            setToken(response.token);

            if (response.user.role === "superadmin") {
                navigate(`/superadmin`);
            } else {
                navigate(`/workspaces/${response.workspace_id}/current_release`);
            }

            toast.success(response.message);
        });
    };

    return (
        <div className="login-page">
            <div className="content">
                <div className="header">
                    <Icon icon="appLogo" />
                    <div className="name">Corkboard</div>
                    <div className="horizontal-line" />
                </div>
                <div className="description">Manage your project with easy to use App</div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <LabeledInput
                        label="Username"
                        register={register("username", {
                            required: "You have to enter a username!",
                        })}
                    />
                    <LabeledInput
                        label="Password"
                        type="password"
                        register={register("password", {
                            required: "You have to enter a password!",
                        })}
                    />
                    <Button color="primary" type="submit">
                        Login
                    </Button>
                </form>

                <div className="sign-up">
                    <span className="small-text">Don't have an account?</span>
                    <Button variant="text" onClick={() => navigate("/signup")}>
                        Sign Up
                    </Button>
                </div>
            </div>
        </div>
    );
};
