import "./Page.scss";
import { ClassNames } from "@/global/utils.ts";
import { Row } from "@/layout/Row/Row.tsx";

type PageProps = {
    title: string;
    subTitle?: string;
    children?: React.ReactNode;
    className?: string;
    buttons?: React.ReactNode;
};

export const Page = ({ title, subTitle, children, buttons, className }: PageProps) => {
    return (
        <div className={ClassNames("page", className)}>
            <div className="header">
                <span className="title">
                    {title}
                    {subTitle ? ":" : ""} <span className="sub-title">{subTitle}</span>
                </span>
                <Row className="buttons">{buttons}</Row>
            </div>
            <div className="content">{children}</div>
        </div>
    );
};
