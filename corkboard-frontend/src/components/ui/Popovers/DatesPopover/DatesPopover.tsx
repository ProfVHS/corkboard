import "./DatesPopover.scss";
import Popover from "@/ui/Popover/Popover.tsx";
import { Icon } from "@/ui/Icons/Icon.tsx";
import { Input } from "@/ui/Input/Input.tsx";
import { DayPicker } from "react-day-picker";
import { useState } from "react";
import "react-day-picker/style.css";
import "./Calendar.scss";

interface DatesPopoverProps {
    taskId: string;
    taskStartDate: Date | null;
    taskDueDate: Date | null;
}

const DatesPopover = ({ taskId, taskStartDate, taskDueDate }: DatesPopoverProps) => {
    const [startDate, setStartDate] = useState<Date | null>(taskStartDate);
    const [dueDate, setDueDate] = useState<Date | null>(taskDueDate);

    return (
        <div className="dates-popover">
            <Popover
                trigger={
                    <div>
                        <div className="date">
                            <Icon icon="calendar" />
                            {startDate || "Start"}
                        </div>

                        <span className="arrow">{`->`}</span>

                        <div className="date">
                            <Icon icon="calendar" />
                            {dueDate || "Due"}
                        </div>
                    </div>
                }
            >
                <div>
                    <div className="inputs">
                        <Input placeholder="Start date" />
                        <Input placeholder="Due date" />
                    </div>
                    <DayPicker animate mode="single" selected={startDate} onSelect={setStartDate} />
                </div>
            </Popover>
        </div>
    );
};

export default DatesPopover;
