import { useLayoutEffect, useRef, useState } from "react";
import Tag from "@/ui/Tag/Tag.tsx";
import type { TagType } from "@/types/TagType.ts";

const GAP = 6;

const TagList = ({ tags }: { tags: TagType[] }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const [visibleCount, setVisibleCount] = useState(tags.length);

    useLayoutEffect(() => {
        const container = containerRef.current;
        const measure = measureRef.current;
        if (!container || !measure) return;

        const calculate = () => {
            const available = container.clientWidth;
            const widths = Array.from(measure.querySelectorAll<HTMLElement>("[data-tag]")).map((el) => el.offsetWidth);
            const moreWidth = measure.querySelector<HTMLElement>("[data-more]")?.offsetWidth ?? 0;

            const total = widths.reduce((sum, w) => sum + w, 0) + GAP * Math.max(widths.length - 1, 0);
            if (total <= available) {
                setVisibleCount(widths.length);
                return;
            }

            let used = 0;
            let count = 0;
            for (const w of widths) {
                const next = used + (count > 0 ? GAP : 0) + w;
                if (next + GAP + moreWidth > available) break;
                used = next;
                count++;
            }
            setVisibleCount(count);
        };

        calculate();
        const observer = new ResizeObserver(calculate);
        observer.observe(container);
        return () => observer.disconnect();
    }, [tags]);

    if (tags.length === 0) return null;

    const hidden = tags.length - visibleCount;

    return (
        <div className="tags" ref={containerRef}>
            {tags.slice(0, visibleCount).map((tag) => (
                <Tag key={tag.id} tag={tag} />
            ))}
            {hidden > 0 && (
                <div className="tag-more">
                    <span>+{hidden}</span>
                </div>
            )}

            <div className="tags-measure" ref={measureRef} aria-hidden>
                {tags.map((tag) => (
                    <div data-tag key={tag.id}>
                        <Tag tag={tag} />
                    </div>
                ))}
                <div className="tag-more" data-more>
                    <span>+{tags.length}</span>
                </div>
            </div>
        </div>
    );
};

export default TagList;
