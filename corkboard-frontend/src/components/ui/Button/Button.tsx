import "./Button.scss";
import { ClassNames } from "../../../global/utils.ts";
import { Icon, type IconNames } from "../Icons/Icon.tsx";

type ButtonProps = {
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
    color?: "primary" | "secondary" | "orange" | "green" | "red" | "outlined" | "none";
    variant?: "rounded" | "square" | "text" | "icon" | "tab";
    type?: "button" | "submit" | "reset";
    size?: "medium" | "small" | "large";
    icon?: IconNames;
    ref?: React.Ref<HTMLButtonElement>;
    disabled?: boolean;
};

export const Button = ({ onClick, children, className, color = "primary", variant = "square", type, size = "medium", icon, ref, disabled }: ButtonProps) => {
    return (
        <button ref={ref} className={ClassNames("button", className, [color, variant, size])} onClick={onClick && onClick} disabled={disabled} type={type}>
            <span className="button__content">
                {icon && <Icon icon={icon} className="button__icon" />}
                {children}
            </span>
        </button>
    );
};
