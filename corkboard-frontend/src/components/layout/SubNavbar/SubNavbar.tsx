import "./SubNavbar.scss";
import classNames from "classnames";

interface SubNavbarProps {
    children: React.ReactNode;
    className?: string;
}

const SubNavbar = ({ children, className }: SubNavbarProps) => {
    return <div className={classNames("sub-navbar", className)}>{children}</div>;
};

interface SubNavbarHeaderProps {
    header: string;
    className?: string;
}

SubNavbar.Header = ({ header, className }: SubNavbarHeaderProps) => {
    return <div className={classNames("header", className)}>{header}</div>;
};

interface SubNavbarTitleProps {
    title: string;
    className?: string;
}

SubNavbar.Title = ({ title, className }: SubNavbarTitleProps) => {
    return <div className={classNames("title", className)}>{title}</div>;
};

SubNavbar.Body = ({ children, className }: SubNavbarProps) => {
    return <div className={classNames("body", className)}>{children}</div>;
};

export default SubNavbar;
