import "react-day-picker/style.css";
import "./DatesPopover.scss";
import "./Calendar.scss";
import Popover from "@/ui/Popover/Popover.tsx";
import { Icon } from "@/ui/Icons/Icon.tsx";
import { Input } from "@/ui/Input/Input.tsx";
import { DayPicker, type DateRange } from "react-day-picker";
import { useState } from "react";
import { format, isSameYear, isSameDay, parse, isValid, startOfDay, differenceInCalendarDays } from "date-fns";
import tasksApi from "@/api/tasks.ts";
import { useReleaseBoardStore } from "@/store/releaseBoardStore.ts";

const formatDate = (date?: Date | null): string => {
    if (!date) return "";
    return isSameYear(date, new Date()) ? format(date, "dd/MM") : format(date, "dd/MM/yyyy");
};

const toDate = (value?: Date | string | null): Date | undefined => {
    if (!value) return undefined;
    if (typeof value === "string") {
        const d = parse(value.slice(0, 10), "yyyy-MM-dd", new Date());
        return isValid(d) ? d : undefined;
    }
    return isValid(value) ? startOfDay(value) : undefined;
};

const toApi = (d?: Date) => (d ? format(d, "yyyy-MM-dd") : null);

const parseDate = (text: string): Date | null => {
    const clean = text.trim().replace(/\./g, "/");
    const now = new Date();

    let parsed = parse(clean, "dd/MM/yyyy", now);
    if (isValid(parsed)) return parsed;

    parsed = parse(clean, "dd/MM", now);
    if (isValid(parsed)) return parsed;

    return null;
};

const normalize = (from?: Date, to?: Date): DateRange => (from && to && from > to ? { from: to, to: from } : { from, to });

type Field = "from" | "to";

interface DatesPopoverProps {
    taskId: string;
    taskStartDate: Date | string | null;
    taskDueDate: Date | string | null;
}

const DatesPopover = ({ taskId, taskStartDate, taskDueDate }: DatesPopoverProps) => {
    const [range, setRange] = useState<DateRange | undefined>({
        from: toDate(taskStartDate),
        to: toDate(taskDueDate),
    });
    const [draft, setDraft] = useState<{ key: Field; text: string } | null>(null);
    const [month, setMonth] = useState<Date>(toDate(taskStartDate) ?? new Date());
    const [activeField, setActiveField] = useState<Field | null>(null);
    const updateTask = useReleaseBoardStore((state) => state.updateTask);

    const applyRange = (next: DateRange | undefined) => {
        tasksApi.update(taskId, { start_date: toApi(next?.from), due_date: toApi(next?.to) }, (response) => {
            setRange(next);
            setDraft(null);
            updateTask(taskId, response.task);
        });
    };

    const handleDayClick = (day: Date) => {
        const { from, to } = range ?? {};

        if (activeField === "from") {
            applyRange({ from: day, to: to && day > to ? undefined : to });
            setActiveField("to");
            return;
        }
        if (activeField === "to") {
            applyRange(normalize(from, day));
            return;
        }

        if (!from) {
            applyRange(normalize(day, to));
            return;
        }
        if (!to) {
            applyRange(normalize(from, day));
            return;
        }

        if (day < from) {
            applyRange({ from: day, to });
        } else if (day > to) {
            applyRange({ from, to: day });
        } else {
            const closerToStart = differenceInCalendarDays(day, from) <= differenceInCalendarDays(to, day);
            applyRange(closerToStart ? { from: day, to } : { from, to: day });
        }
    };

    const commitInput = (key: Field) => {
        if (draft?.key !== key) return;

        const text = draft.text;
        setDraft(null);

        if (!text.trim()) {
            applyRange({ from: range?.from, to: range?.to, [key]: undefined });
            return;
        }

        const parsed = parseDate(text);
        if (!parsed) return;

        const next = normalize(key === "from" ? parsed : range?.from, key === "to" ? parsed : range?.to);

        applyRange(next);
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

    const valueFor = (key: Field) => (draft?.key === key ? draft.text : formatDate(key === "from" ? from : to));

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
                            value={valueFor("from")}
                            onChange={(e) => setDraft({ key: "from", text: e.target.value })}
                            onFocus={() => setActiveField("from")}
                            onClick={() => setActiveField("from")}
                            onBlur={() => commitInput("from")}
                            onKeyDown={onEnter("from")}
                        />
                        <Input
                            autoFocus={false}
                            className={activeField === "to" ? "active" : ""}
                            placeholder="Due date"
                            value={valueFor("to")}
                            onChange={(e) => setDraft({ key: "to", text: e.target.value })}
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
