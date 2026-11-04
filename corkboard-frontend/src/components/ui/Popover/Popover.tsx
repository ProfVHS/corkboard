import "./Popover.scss";
import React from "react";
import usePopover from "./usePopover.ts";
import { usePopoverStore } from "@/store/popoverStore.ts";
import { Button } from "@/ui/Button/Button.tsx";
import classNames from "classnames";
import Tooltip from "@/ui/Tooltip/Tooltip.tsx";
import { Icon } from "@/ui/Icons/Icon.tsx";

interface TriggerProps {
    ref?: React.Ref<HTMLElement>;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
    className?: string;
}

interface PopoverProps {
    className?: string;
    tooltip?: string;
    trigger: React.ReactElement<TriggerProps>;
    children: React.ReactNode;
    offset?: number;
}

const Popover = ({ className, tooltip, trigger, children, offset }: PopoverProps) => {
    const { triggerWithProps, panelRef, coords, open, placement } = usePopover({ trigger, offset });

    return (
        <div className="popover">
            {tooltip ? <Tooltip text={tooltip}>{triggerWithProps}</Tooltip> : triggerWithProps}
            {open && (
                <div
                    ref={panelRef}
                    style={{ top: coords.top, left: coords.left }}
                    className={`panel ${placement === "bottom" ? "panel--bottom" : "panel--top"} ${className}`}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

interface PopoverItemProps<T> {
    className?: string;
    style?: React.CSSProperties;
    icon?: React.ReactNode;
    label?: string;
    value: T;
    selected?: boolean;
    onSelect: (value: T) => void;
    closeOnSelect?: boolean;
}

const PopoverItem = <T,>({ className, icon, label, value, selected, onSelect, closeOnSelect = true, style }: PopoverItemProps<T>) => {
    const close = usePopoverStore((state) => state.close);

    return (
        <Button
            className={classNames("item", className, { selected: selected })}
            onClick={() => {
                onSelect(value);
                if (closeOnSelect) close();
            }}
            style={style}
        >
            {icon}
            {label && <span className="label">{label}</span>}
            {selected && <Icon className="close" icon="close" />}
        </Button>
    );
};

Popover.PopoverItem = PopoverItem;

export default Popover;
