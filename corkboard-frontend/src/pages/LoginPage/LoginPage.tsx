import "./LoginPage.scss";
import { Button } from "../../components/ui/./Button/Button.tsx";
import { LabeledInput } from "../../components/ui/LabeledInput/LabeledInput.tsx";
import { type SubmitHandler, useForm } from "react-hook-form";
import { api } from "../../api/api.ts";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icons/Icon.tsx";
import { useAuth } from "../../context/auth/useAuth.ts";
import { useToast } from "../../hooks/useToast.ts";

type Inputs = {
    username: string;
    password: string;
};

export const LoginPage = () => {
    const { register, handleSubmit } = useForm<Inputs>();
    const { setToken, setUser } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        api.post("/login", { user: data }).then((response) => {
            localStorage.setItem("token", response.data.token);
            setToken(response.data.token);
            setUser(response.data.user);

            if (response.data.user.role === "superadmin") {
                navigate(`/superadmin`);
            } else {
                navigate(`/workspaces/${response.data.workspace_id}/current_release`);
            }

            toast.success(response.data.message);
        });
    };

    return (
        <div className="login-page">
            <div className="login-page__content">
                <div className="login-page__header">
                    <Icon icon="appLogo" className="login-page__app-logo" />
                    <div className="login-page__app-name">Corkboard</div>
                    <div className="login-page__horizontal-line" />
                </div>
                <div className="login-page__description">Manage your project with easy to use App</div>
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

                <div className="login-page__sign-up">
                    <span className="small-text">Don't have an account?</span>
                    <Button variant="text" onClick={() => navigate("/signup")}>
                        Sign Up
                    </Button>
                </div>
            </div>
        </div>
    );
};
