"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string | null;
  onSelect: (iso: string) => void;
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function Calendar({ value, onSelect }: Props) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const [cursor, setCursor] = useState(() => {
    if (value) {
      const d = new Date(value + "T12:00:00");
      if (!Number.isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [mode, setMode] = useState<"days" | "months" | "years">("days");

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    // Monday-first grid: Mon=0 ... Sun=6
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();
    const out: Array<{
      iso: string;
      day: number;
      disabled: boolean;
      outside: boolean;
      today: boolean;
    }> = [];

    for (let i = 0; i < firstDow; i++) {
      const day = prevDays - firstDow + 1 + i;
      const dt = new Date(year, month - 1, day);
      out.push({
        iso: toISO(dt.getFullYear(), dt.getMonth(), dt.getDate()),
        day,
        disabled: true,
        outside: true,
        today: false,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      out.push({
        iso: toISO(year, month, d),
        day: d,
        disabled: date < today,
        outside: false,
        today: date.getTime() === today.getTime(),
      });
    }
    while (out.length % 7 !== 0) {
      const idx = out.length - (firstDow + daysInMonth);
      const day = idx + 1;
      const dt = new Date(year, month + 1, day);
      out.push({
        iso: toISO(dt.getFullYear(), dt.getMonth(), dt.getDate()),
        day,
        disabled: true,
        outside: true,
        today: false,
      });
    }
    return out;
  }, [year, month, today]);

  const title = `${MONTHS[month]} ${year}`;
  const canPrev = year > today.getFullYear() || month > today.getMonth();
  const years = useMemo(() => Array.from({ length: 12 }, (_, i) => year - 4 + i), [year]);

  return (
    <div className="w-[320px] p-4 md:w-[280px]">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          disabled={!canPrev}
          aria-label="Previous month"
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full transition-colors",
            canPrev ? "hover:bg-faint" : "cursor-default opacity-30"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setMode("years")}
          className="text-[15px] font-semibold text-hof transition-colors hover:underline"
        >
          {title}
        </button>
        <button
          type="button"
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-faint"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {mode === "days" && (
        <>
          <div className="mt-3 grid grid-cols-7 text-center text-[12px] font-medium text-foggy">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-y-0.5 text-center">
            {cells.map((c, i) => (
              <button
                key={i}
                type="button"
                disabled={c.disabled}
                onClick={() => !c.disabled && onSelect(c.iso)}
                className={cn(
                  "day-btn tnum mx-auto grid h-9 w-9 place-items-center rounded-full text-[14px] transition-colors md:h-8 md:w-8",
                  c.disabled
                    ? "cursor-default text-grey-500"
                    : "text-hof hover:bg-faint",
                  c.today && value !== c.iso && "ring-1 ring-hof",
                  value === c.iso && "bg-hof font-medium text-white hover:bg-hof"
                )}
              >
                {c.day}
              </button>
            ))}
          </div>
        </>
      )}

      {mode === "years" && (
        <div className="mt-3 grid grid-cols-4 gap-1.5">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => {
                setCursor(new Date(y, month, 1));
                setMode("months");
              }}
              className={cn(
                "rounded-lg py-2 text-[14px] transition-colors hover:bg-faint",
                y === year ? "bg-faint font-semibold text-hof" : "text-hof"
              )}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {mode === "months" && (
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {MONTHS.map((m, i) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setCursor(new Date(year, i, 1));
                setMode("days");
              }}
              className={cn(
                "rounded-lg py-2 text-[14px] transition-colors hover:bg-faint",
                i === month ? "bg-faint font-semibold text-hof" : "text-hof"
              )}
            >
              {m.slice(0, 3)}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMode("years")}
            className="col-span-3 mt-1 rounded-lg py-2 text-[14px] font-medium text-foggy transition-colors hover:bg-faint hover:text-hof"
          >
            ← Pick a year
          </button>
        </div>
      )}
    </div>
  );
}
