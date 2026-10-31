import "react-day-picker/style.css";
import "./DatesPopover.scss";
import "./Calendar.scss";
import Popover from "@/ui/Popover/Popover.tsx";
import { Icon } from "@/ui/Icons/Icon.tsx";
import { Input } from "@/ui/Input/Input.tsx";
import { DayPicker, type DateRange } from "react-day-picker";
import { useState } from "react";
import { format, isSameYear, isSameDay, parse, isValid } from "date-fns";
import tasksApi from "@/api/tasks.ts";
import { useReleaseBoardStore } from "@/store/releaseBoardStore.ts";

const formatDate = (date?: Date | null): string => {
    if (!date) return "";
    return isSameYear(date, new Date()) ? format(date, "dd/MM") : format(date, "dd/MM/yyyy");
};

const parseDate = (text: string): Date | null => {
    const clean = text.trim().replace(/\./g, "/");
    const now = new Date();

    let parsed = parse(clean, "dd/MM/yyyy", now);
    if (isValid(parsed)) return parsed;

    parsed = parse(clean, "dd/MM", now);
    if (isValid(parsed)) return parsed;

    return null;
};

type Field = "from" | "to";

interface DatesPopoverProps {
    taskId: string;
    taskStartDate: Date | null;
    taskDueDate: Date | null;
}

const DatesPopover = ({ taskId, taskStartDate, taskDueDate }: DatesPopoverProps) => {
    const [range, setRange] = useState<DateRange | undefined>({
        from: taskStartDate ?? undefined,
        to: taskDueDate ?? undefined,
    });
    const [startText, setStartText] = useState(formatDate(taskStartDate));
    const [dueText, setDueText] = useState(formatDate(taskDueDate));
    const [month, setMonth] = useState<Date>(taskStartDate ?? new Date());
    const [activeField, setActiveField] = useState<Field>("from");
    const updateTask = useReleaseBoardStore((state) => state.updateTask);

    const applyRange = (next: DateRange | undefined) => {
        tasksApi.update(taskId, { start_date: next?.from, due_date: next?.to }, (response) => {
            setRange(next);
            updateTask(taskId, response.task);
            setStartText(formatDate(response.task.start_date));
            setDueText(formatDate(response.task.due_date));
        });
    };

    const handleDayClick = (day: Date) => {
        if (activeField === "from") {
            const to = range?.to && day > range.to ? undefined : range?.to;
            applyRange({ from: day, to });
            setActiveField("to");
        } else if (range?.from && day < range.from) {
            applyRange({ from: day, to: range.from });
        } else {
            applyRange({ from: range?.from, to: day });
        }
    };

    const commitInput = (key: Field) => {
        const text = key === "from" ? startText : dueText;
        const current = formatDate(key === "from" ? range?.from : range?.to);

        if (text === current) return;

        if (!text.trim()) {
            applyRange({ from: range?.from, to: range?.to, [key]: undefined });
            return;
        }

        const parsed = parseDate(text);

        if (!parsed) {
            setStartText(formatDate(range?.from));
            setDueText(formatDate(range?.to));
            return;
        }

        let from = key === "from" ? parsed : range?.from;
        let to = key === "to" ? parsed : range?.to;

        if (from && to && from > to) [from, to] = [to, from];

        applyRange({ from, to });
        setMonth(parsed);
    };

    const onEnter = (key: Field) => (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") commitInput(key);
    };

    const from = range?.from;
    const to = range?.to;
    const both = from && to && !isSameDay(from, to) ? { from, to } : null;

    const modifiers = {
        rangeStart: from ?? [],
        rangeEnd: to ?? [],
        rangeMiddle: both ? { after: both.from, before: both.to } : [],
        capStart: both ? both.from : [],
        capEnd: both ? both.to : [],
    };

    const modifiersClassNames = {
        rangeStart: "day-start",
        rangeEnd: "day-end",
        rangeMiddle: "day-middle",
        capStart: "cap-start",
        capEnd: "cap-end",
    };

    return (
        <div className="dates-popover">
            <Popover
                trigger={
                    <div>
                        <div className="date">
                            <Icon icon="calendarDots" />
                            {formatDate(from) || "Start"}
                        </div>

                        <span className="arrow">{`->`}</span>

                        <div className="date">
                            <Icon icon="calendarDots" />
                            {formatDate(to) || "Due"}
                        </div>
                    </div>
                }
            >
                <div>
                    <div className="inputs">
                        <Input
                            autoFocus={false}
                            className={activeField === "from" ? "active" : ""}
                            placeholder="Start date"
                            value={startText}
                            onChange={(e) => setStartText(e.target.value)}
                            onFocus={() => setActiveField("from")}
                            onClick={() => setActiveField("from")}
                            onBlur={() => commitInput("from")}
                            onKeyDown={onEnter("from")}
                        />
                        <Input
                            autoFocus={false}
                            className={activeField === "to" ? "active" : ""}
                            placeholder="Due date"
                            value={dueText}
                            onChange={(e) => setDueText(e.target.value)}
                            onFocus={() => setActiveField("to")}
                            onClick={() => setActiveField("to")}
                            onBlur={() => commitInput("to")}
                            onKeyDown={onEnter("to")}
                        />
                    </div>

                    <DayPicker
                        animate
                        weekStartsOn={1}
                        modifiers={modifiers}
                        modifiersClassNames={modifiersClassNames}
                        onDayClick={handleDayClick}
                        month={month}
                        onMonthChange={setMonth}
                    />
                </div>
            </Popover>
        </div>
    );
};

export default DatesPopover;
