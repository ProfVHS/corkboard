import "./SignUpPage.scss";
import { Button } from "../../components/ui/./Button/Button.tsx";
import { LabeledInput } from "../../components/ui/LabeledInput/LabeledInput.tsx";
import { useForm } from "react-hook-form";
import { api } from "../../api/api.ts";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Icon } from "../../components/ui/Icons/Icon.tsx";
import { useToast } from "../../hooks/useToast.ts";

const schema = yup
    .object({
        username: yup.string().required("You have to enter a username!"),
        password: yup.string().required("You have to enter a password!"),
        confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match"),
    })
    .required();

type FormData = yup.InferType<typeof schema>;

export const SignUpPage = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });
    const toast = useToast();
    const navigate = useNavigate();

    const onSubmit = (data: FormData) => {
        api.post("/signup", { user: data }).then((response) => {
            localStorage.setItem("token", response.data.token);
            navigate("/");
            toast.success(response.data.message);
        });
    };

    return (
        <div className="signup-page">
            <div className="signup-page__content">
                <div className="signup-page__header">
                    <Icon icon="appLogo" className="login-page__app-logo" />
                    <div className="signup-page__app-name">Corkboard</div>
                    <div className="signup-page__horizontal-line" />
                </div>
                <div className="signup-page__description">Manage your project with easy to use App</div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <LabeledInput label="Username" require={true} isInvaild={!!errors.username} register={register("username")} />
                    <LabeledInput label="Password" type="password" require={true} isInvaild={!!errors.password} register={register("password")} />
                    <LabeledInput
                        label="Confirm Password"
                        type="password"
                        require={true}
                        isInvaild={!!errors.confirmPassword}
                        register={register("confirmPassword")}
                    />
                    <Button color="primary" type="submit">
                        Sign up
                    </Button>
                </form>
                <div className="signup-page__errors">
                    {errors.username && <span className="signup-page__error">{errors.username.message}</span>}
                    {errors.password && <span className="signup-page__error">{errors.password.message}</span>}
                    {errors.confirmPassword && <span className="signup-page__error">{errors.confirmPassword.message}</span>}
                </div>

                <div className="signup-page__sign-up">
                    <span className="small-text">You already have an account?</span>
                    <Button variant="text" onClick={() => navigate("/")}>
                        Log In
                    </Button>
                </div>
            </div>
        </div>
    );
};
