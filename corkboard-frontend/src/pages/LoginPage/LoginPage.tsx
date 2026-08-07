import "./LoginPage.scss";
import { Button } from "../../components/ui/./Button/Button.tsx";
import { LabeledInput } from "../../components/ui/LabeledInput/LabeledInput.tsx";
import { type SubmitHandler, useForm } from "react-hook-form";
import { api } from "../../api/api.ts";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui/Icons/Icon.tsx";
import { useAuth } from "../../context/auth/useAuth.ts";

type Inputs = {
    username: string;
    password: string;
};

export const LoginPage = () => {
    const { register, handleSubmit } = useForm<Inputs>();
    const { setToken, setUser } = useAuth();
    const navigate = useNavigate();

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        api.post("/login", { user: data }).then((res) => {
            localStorage.setItem("token", res.data.token);
            setToken(res.data.token);
            setUser(res.data.data);

            if (res.data.data.role === "superadmin") {
                navigate(`/superadmin`);
            } else {
                navigate(`/workspaces/${res.data.workspace_id}/current_release`);
            }
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
