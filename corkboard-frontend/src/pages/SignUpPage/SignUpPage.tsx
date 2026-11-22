import "./SignUpPage.scss";
import { Button } from "@/ui/Button/Button.tsx";
import { LabeledInput } from "@/ui/LabeledInput/LabeledInput.tsx";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { Icon } from "@/ui/Icons/Icon.tsx";
import { useToast } from "@/hooks/useToast.ts";
import sessionApi from "@/api/session.ts";

const schema = yup
    .object({
        username: yup.string().required("You have to enter a username!"),
        password: yup.string().required("You have to enter a password!"),
        confirmPassword: yup
            .string()
            .required("You have to enter a password!")
            .oneOf([yup.ref("password")], "Passwords must match"),
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
        sessionApi.signup(data, (response) => {
            navigate("/");
            toast.success(response.message);
        });
    };

    return (
        <div className="signup-page">
            <div className="content">
                <div className="header">
                    <Icon icon="appLogo" />
                    <div className="name">Corkboard</div>
                    <div className="horizontal-line" />
                </div>
                <div className="description">Manage your project with easy to use App</div>
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
                <div className="errors">
                    {errors.username && <span className="error">{errors.username.message}</span>}
                    {errors.password && <span className="error">{errors.password.message}</span>}
                    {errors.confirmPassword && <span className="error">{errors.confirmPassword.message}</span>}
                </div>

                <div className="login">
                    <span className="small-text">You already have an account?</span>
                    <Button variant="text" onClick={() => navigate("/")}>
                        Log In
                    </Button>
                </div>
            </div>
        </div>
    );
};
