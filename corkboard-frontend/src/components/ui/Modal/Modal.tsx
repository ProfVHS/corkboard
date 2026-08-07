import { ClassNames } from "../../../global/utils.ts";
import "./Modal.scss";
import { Button } from "../Button/Button.tsx";
import { Icon } from "../Icons/Icon.tsx";

type ModalProps = {
    children: React.ReactNode;
    onClose: () => void;
    className?: string;
};

const Modal = ({ children, onClose, className }: ModalProps) => {
    return (
        <div className="modal">
            <div className="modal__backdrop" onClick={onClose} />
            <div className={ClassNames("modal__content", className)}>
                <Button variant="icon" className="modal__close-btn" onClick={onClose}>
                    <Icon icon="circleX" />
                </Button>
                {children}
            </div>
        </div>
    );
};

type ModalHeaderProps = {
    title?: string;
    children?: React.ReactNode;
};

type ModalComponentsProps = {
    children: React.ReactNode;
};

Modal.Header = ({ title, children }: ModalHeaderProps) => {
    return (
        <div className="modal-header">
            <span className="modal-header__title">{title}</span>
            {children}
        </div>
    );
};

Modal.Body = ({ children }: ModalComponentsProps) => {
    return <div className="modal-body">{children}</div>;
};

Modal.Footer = ({ children }: ModalComponentsProps) => {
    return <div className="modal-footer">{children}</div>;
};

export default Modal;
