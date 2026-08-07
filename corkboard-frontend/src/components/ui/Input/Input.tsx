import "./Input.scss";
import { ClassNames } from "../../../global/utils.ts";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

type InputProps = {
    className?: string;
    type?: "text" | "number" | "password";
    id?: string;
    name?: string;
    placeholder?: string;
    register?: UseFormRegisterReturn;
    isInvaild?: boolean;
    variant?: "no-border";
    defaultValue?: string | number;
    value?: string | number;
    error?: string;
    autoComplete?: string;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onChange?: (e: React.FocusEvent<HTMLInputElement>) => void;
    style?: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
};

export const Input = ({
    className,
    type,
    id,
    name,
    placeholder,
    register,
    isInvaild,
    variant,
    defaultValue,
    value,
    error,
    onKeyDown,
    onBlur,
    onChange,
    autoComplete = "off",
    style,
}: InputProps) => {
    return (
        <>
            <input
                className={ClassNames("input", className, { invalid: isInvaild }, [variant])}
                defaultValue={defaultValue}
                value={value}
                type={type}
                id={id}
                name={name}
                autoComplete={autoComplete}
                style={style}
                placeholder={placeholder}
                onKeyDown={(e) => onKeyDown && onKeyDown(e)}
                onBlur={onBlur}
                onChange={onChange}
                {...register}
            />

            {error && <span className="input-error">{error}</span>}
        </>
    );
};
