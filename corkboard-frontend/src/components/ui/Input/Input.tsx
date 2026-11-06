import "./Input.scss";
import { ClassNames } from "@/global/utils.ts";
import type { UseFormRegisterReturn } from "react-hook-form";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useAuth } from "@/context/auth/useAuth.ts";

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
    minLength?: number;
    maxLength?: number;
    error?: string;
    autoComplete?: string;
    autoFocus?: boolean;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
    onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
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
    minLength,
    maxLength,
    value,
    error,
    onKeyDown,
    onBlur,
    onChange,
    onFocus,
    onClick,
    autoComplete = "off",
    autoFocus = true,
    style,
}: InputProps) => {
    const { user } = useAuth();

    return (
        <>
            <input
                className={ClassNames("input", className, { invalid: isInvaild }, [variant])}
                defaultValue={defaultValue}
                value={value}
                type={type}
                id={id}
                name={name}
                minLength={minLength}
                maxLength={maxLength}
                autoComplete={autoComplete}
                autoFocus={autoFocus}
                style={style}
                spellCheck={user?.preferences.spellcheck}
                placeholder={placeholder}
                onKeyDown={(e) => onKeyDown && onKeyDown(e)}
                onBlur={onBlur}
                onChange={onChange}
                onFocus={onFocus}
                onClick={onClick}
                {...register}
            />

            {error && <span className="input-error">{error}</span>}
        </>
    );
};
