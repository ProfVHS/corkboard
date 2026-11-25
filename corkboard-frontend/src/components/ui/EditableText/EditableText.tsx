import "./EditableText.scss";
import { Input } from "@/ui/Input/Input.tsx";
import { type ComponentProps } from "react";

type EditableTextProps = {
    isEditable: boolean;
    value: string | number;
} & ComponentProps<typeof Input>;
export const EditableText = ({ isEditable, value, ...inputProps }: EditableTextProps) => {
    return <div className="editable-text">{isEditable ? <Input {...inputProps} defaultValue={value} /> : <div className="label">{value}</div>}</div>;
};
