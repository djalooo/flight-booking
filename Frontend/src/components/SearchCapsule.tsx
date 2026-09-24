"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Search,
} from "lucide-react";
import { CABINS, type AirportInfo, type Cabin } from "@/lib/airports";
import { cn, formatDMY, parseDMY } from "@/lib/utils";
import Calendar from "./Calendar";

export type Panel = "from" | "to" | "when" | "who" | "class" | null;

interface Props {
  from: AirportInfo | null;
  to: AirportInfo | null;
  date: string | null;
  adults: number;
  children: number;
  infants: number;
  cabin: Cabin;
  loading: boolean;
  onFrom: (a: AirportInfo | null) => void;
  onTo: (a: AirportInfo | null) => void;
  onSwap: () => void;
  onDate: (iso: string) => void;
  onPax: (k: "adults" | "children" | "infants", v: number) => void;
  onCabin: (c: Cabin) => void;
  onSearch: () => void;
}

function useAirportSearch(query: string, exclude: string | null) {
  const [results, setResults] = useState<AirportInfo[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const res = await fetch(`/api/airports?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!alive) return;

        let list: AirportInfo[] = Array.isArray(data)
          ? data
          : (data.airports ?? []);

        if (exclude) list = list.filter((a) => a.code !== exclude);

        setResults(list);
      } catch {
        if (alive) setResults([]);
      } finally {
        if (alive) setBusy(false);
      }
    }, 140);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [query, exclude]);

  return { results, busy };
}

const PAX_ROWS: Array<{
  key: "adults" | "children" | "infants";
  label: string;
  desc: string;
  min: number;
  max: number;
}> = [
  { key: "adults", label: "Adults", desc: "Ages 13 and above", min: 1, max: 9 },
  { key: "children", label: "Children", desc: "Ages 2 – 12", min: 0, max: 8 },
  { key: "infants", label: "Infants", desc: "Under 2 years", min: 0, max: 5 },
];

const airportLabel = (a: AirportInfo | null) =>
  a ? `${a.city} · ${a.code}` : "";

export default function SearchCapsule(props: Props) {
  const { from, to, date, adults, children, infants, cabin, loading } = props;
  const [panel, setPanel] = useState<Panel>(null);

  const [fromDraft, setFromDraft] = useState<string | null>(null);
  const [toDraft, setToDraft] = useState<string | null>(null);

  const [fromActive, setFromActive] = useState(-1);
  const [toActive, setToActive] = useState(-1);

  const [whenDraft, setWhenDraft] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const whenInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const optionRefs = useRef<Record<string, HTMLLIElement | null>>({});

  const editingSegRef = useRef<"dd" | "mm" | "yyyy" | null>(null);
  const datePartsRef = useRef<{ dd: string; mm: string; yyyy: string }>({
    dd: "",
    mm: "",
    yyyy: "",
  });

  const clearDateDraft = () => {
    setWhenDraft(null);
    editingSegRef.current = null;
    datePartsRef.current = { dd: "", mm: "", yyyy: "" };
  };

  const focusCombo = (kind: "from" | "to") => {
    const desktop = inputRefs.current[`${kind}-desktop`];
    const mobile = inputRefs.current[`${kind}-mobile`];
    const visible = [desktop, mobile].find(
      (el) => el && el.offsetParent !== null,
    );
    (visible ?? desktop ?? mobile)?.focus();
  };

  const focusWhen = () => {
    const desktop = whenInputRefs.current["desktop"];
    const mobile = whenInputRefs.current["mobile"];
    const visible = [desktop, mobile].find(
      (el) => el && el.offsetParent !== null,
    );
    (visible ?? desktop ?? mobile)?.focus();
  };

  const fromText = fromDraft ?? airportLabel(from);
  const toText = toDraft ?? airportLabel(to);

  const fromSearch = useAirportSearch(fromDraft ?? "", to?.code ?? null);
  const toSearch = useAirportSearch(toDraft ?? "", from?.code ?? null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setPanel(null);
        setFromDraft(null);
        setToDraft(null);
        clearDateDraft();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel(null);
        setFromDraft(null);
        setToDraft(null);
        clearDateDraft();
      }
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    const kind = panel === "from" ? "from" : panel === "to" ? "to" : null;
    if (!kind) return;
    const index = kind === "from" ? fromActive : toActive;
    if (index < 0) return;
    const el = optionRefs.current[`${kind}-listbox-option-${index}`];
    el?.scrollIntoView({ block: "nearest" });
  }, [panel, fromActive, toActive]);

  // Sync date parts from the selected date when there is no draft
  useEffect(() => {
    if (whenDraft !== null) return;

    if (date) {
      const parts = formatDMY(date).split("/");
      datePartsRef.current = {
        dd: parts[0] ?? "",
        mm: parts[1] ?? "",
        yyyy: parts[2] ?? "",
      };
    } else {
      datePartsRef.current = { dd: "", mm: "", yyyy: "" };
    }
  }, [date, whenDraft, panel]);

  const paxLabel = useMemo(() => {
    const total = adults + children + infants;
    if (total === 1) return "1 traveler";
    return `${total} travelers`;
  }, [adults, children, infants]);

  const canSearch = from && to && date && from.code !== to.code;

  const toggle = (p: Exclude<Panel, null>) =>
    setPanel((cur) => (cur === p ? null : p));

  const segmentCls = (active: boolean) =>
    cn(
      "relative px-3 py-2.5 text-left transition-colors sm:px-6 cursor-pointer",
      active ? "z-10 bg-faint/80" : "hover:bg-faint/70",
    );

  const labelCls =
    "text-[12px] font-semibold uppercase tracking-[0.04em] text-hof block";

  const comboMeta = (kind: "from" | "to") => {
    const isFrom = kind === "from";
    return {
      listboxId: isFrom ? "from-listbox" : "to-listbox",
      inputId: isFrom ? "from-combobox" : "to-combobox",
      labelId: isFrom ? "from-combobox-label" : "to-combobox-label",
      search: isFrom ? fromSearch : toSearch,
      query: isFrom ? fromText : toText,
      active: panel === kind ? (isFrom ? fromActive : toActive) : -1,
      setDraft: isFrom ? setFromDraft : setToDraft,
      setActive: isFrom ? setFromActive : setToActive,
      selected: isFrom ? from : to,
      onPick: isFrom ? props.onFrom : props.onTo,
      label: isFrom ? "Where from" : "Where to",
      placeholder: isFrom ? "Search origin" : "Search destination",
    };
  };

  const optionDomId = (kind: "from" | "to", index: number) =>
    `${comboMeta(kind).listboxId}-option-${index}`;

  const selectOption = (kind: "from" | "to", airport: AirportInfo) => {
    const meta = comboMeta(kind);
    meta.onPick(airport);
    meta.setDraft(null);
    meta.setActive(-1);

    if (kind === "from") {
      setPanel("to");
      setTimeout(() => focusCombo("to"), 0);
    } else {
      setPanel("when");
      setTimeout(() => focusWhen(), 0);
    }
  };

  const handleComboKeyDown =
    (kind: "from" | "to") => (e: React.KeyboardEvent<HTMLInputElement>) => {
      const meta = comboMeta(kind);
      const results = meta.search.results;
      const isOpen = panel === kind;
      const count = results.length;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          if (!isOpen) {
            setPanel(kind);
            meta.setActive(count > 0 ? 0 : -1);
            return;
          }
          if (count === 0) return;
          meta.setActive(meta.active < count - 1 ? meta.active + 1 : 0);
          return;
        }
        case "ArrowUp": {
          e.preventDefault();
          if (!isOpen) {
            setPanel(kind);
            meta.setActive(count > 0 ? count - 1 : -1);
            return;
          }
          if (count === 0) return;
          meta.setActive(meta.active > 0 ? meta.active - 1 : count - 1);
          return;
        }
        case "Home": {
          if (!isOpen || count === 0) return;
          e.preventDefault();
          meta.setActive(0);
          return;
        }
        case "End": {
          if (!isOpen || count === 0) return;
          e.preventDefault();
          meta.setActive(count - 1);
          return;
        }
        case "Enter": {
          if (isOpen && count > 0) {
            e.preventDefault();
            const targetIndex =
              meta.active >= 0 && meta.active < count ? meta.active : 0;
            selectOption(kind, results[targetIndex]);
            if (kind === "to") setTimeout(() => focusWhen(), 0);
            return;
          }
          if (kind === "to") {
            e.preventDefault();
            setPanel("when");
            setTimeout(() => focusWhen(), 0);
            return;
          }
          return;
        }
        case "Escape": {
          e.preventDefault();
          e.stopPropagation();
          meta.setDraft(null);
          meta.setActive(-1);
          setPanel(null);
          return;
        }
        case "Tab": {
          setPanel(null);
          return;
        }
        default:
          return;
      }
    };

  const renderComboboxInput = (kind: "from" | "to", idSuffix: string) => {
    const meta = comboMeta(kind);
    const isOpen = panel === kind;
    const activeId =
      isOpen && meta.active >= 0 && meta.active < meta.search.results.length
        ? optionDomId(kind, meta.active)
        : undefined;

    return (
      <>
        <label
          id={`${meta.labelId}-${idSuffix}`}
          htmlFor={`${meta.inputId}-${idSuffix}`}
          className={labelCls}
        >
          {meta.label}
        </label>
        <input
          ref={(el) => {
            inputRefs.current[`${kind}-${idSuffix}`] = el;
          }}
          id={`${meta.inputId}-${idSuffix}`}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={meta.listboxId}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-labelledby={`${meta.labelId}-${idSuffix}`}
          aria-activedescendant={activeId}
          autoComplete="off"
          spellCheck={false}
          value={meta.query}
          placeholder={meta.placeholder}
          onChange={(e) => {
            meta.setDraft(e.target.value);
            meta.setActive(-1);
            if (panel !== kind) setPanel(kind);
          }}
          onFocus={() => setPanel(kind)}
          onKeyDown={handleComboKeyDown(kind)}
          className={cn(
            "mt-0.5 w-full truncate bg-transparent text-[14px] leading-snug outline-none placeholder:text-foggy",
            meta.selected ? "font-medium text-hof" : "text-foggy",
          )}
        />
      </>
    );
  };

  const renderAirportListbox = (kind: "from" | "to") => {
    const meta = comboMeta(kind);
    const { results, busy } = meta.search;

    return (
      <div className="w-[calc(100vw-48px)] max-w-[360px] p-2.5">
        {busy && results.length === 0 ? (
          <div className="flex items-center gap-2 px-4 py-6 text-[14px] text-foggy">
            <Loader2 className="h-4 w-4 animate-spin" /> Searching airports…
          </div>
        ) : results.length === 0 ? (
          <p className="px-4 py-6 text-[14px] text-foggy">
            No airports found. Try a city or code.
          </p>
        ) : (
          <ul
            id={meta.listboxId}
            role="listbox"
            aria-label={`${meta.label} airport suggestions`}
            className="nice-scroll max-h-[300px] overflow-y-auto"
          >
            {results.map((a, i) => {
              const isActive = i === meta.active;
              const isSelected = meta.selected?.code === a.code;

              return (
                <li
                  key={`${a.code}-${i}`}
                  id={optionDomId(kind, i)}
                  role="option"
                  aria-selected={isSelected}
                  ref={(el) => {
                    optionRefs.current[optionDomId(kind, i)] = el;
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => meta.setActive(i)}
                  onClick={() => selectOption(kind, a)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-left transition-colors",
                    isActive ? "bg-faint" : "hover:bg-faint",
                  )}
                >
                  <span className="grid h-10 w-12 shrink-0 place-items-center rounded-full bg-faint text-[13px] font-semibold text-hof">
                    {a.code}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-medium text-hof">
                      {a.city}{" "}
                      <span className="font-normal text-foggy">· {a.code}</span>
                    </span>
                    <span className="block truncate text-[12px] text-foggy">
                      {a.name}, {a.country}
                    </span>
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-hof" />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  };

  const renderWhenControl = (id: string) => {
    const isOpen = panel === "when";
    const layout = id === "date" ? "desktop" : "mobile";
    const displayVal =
      whenDraft !== null
        ? whenDraft
        : date
          ? formatDMY(date)
          : "DD/MM/YYYY";

    const getSegment = (pos: number): "dd" | "mm" | "yyyy" => {
      if (pos <= 2) return "dd";
      if (pos <= 5) return "mm";
      return "yyyy";
    };

    const getRange = (seg: "dd" | "mm" | "yyyy"): [number, number] => {
      if (seg === "dd") return [0, 2];
      if (seg === "mm") return [3, 5];
      return [6, 10];
    };

    const selectSegment = (
      input: HTMLInputElement,
      seg: "dd" | "mm" | "yyyy",
    ) => {
      const [s, e] = getRange(seg);
      input.setSelectionRange(s, e);
    };

    const buildDate = (p: { dd: string; mm: string; yyyy: string }) => {
      let v = "";

      if (p.dd.length > 0) v += p.dd;
      if (p.dd.length === 2 || p.mm.length > 0) v += "/";
      if (p.mm.length > 0) v += p.mm;
      if (p.mm.length === 2 || p.yyyy.length > 0) v += "/";
      if (p.yyyy.length > 0) v += p.yyyy;

      return v;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const pos = input.selectionStart ?? 0;
      const seg = getSegment(pos);

      if (e.key === "Enter") {
        e.preventDefault();
        const iso = parseDMY(displayVal);
        if (iso) {
          props.onDate(iso);
          clearDateDraft();
          setPanel(null);
        }
        return;
      }

      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        editingSegRef.current = null;

        if (e.key === "ArrowLeft") {
          if (seg === "mm") setTimeout(() => selectSegment(input, "dd"), 0);
          if (seg === "yyyy") setTimeout(() => selectSegment(input, "mm"), 0);
        } else {
          if (seg === "dd") setTimeout(() => selectSegment(input, "mm"), 0);
          if (seg === "mm") setTimeout(() => selectSegment(input, "yyyy"), 0);
        }
        return;
      }

      if (e.key === "Backspace") {
  e.preventDefault();

  const parts = datePartsRef.current;

  if (seg === "yyyy") {
    if (parts.yyyy.length > 0) {
      parts.yyyy = parts.yyyy.slice(0, -1);
    }

    const newVal = buildDate(parts);
    setWhenDraft(newVal || null);

    const iso = parseDMY(newVal);
    if (iso) props.onDate(iso);

    if (parts.yyyy.length === 0) {
      editingSegRef.current = null;
      setTimeout(() => selectSegment(input, "mm"), 0);
    } else {
      editingSegRef.current = "yyyy";
      setTimeout(() => selectSegment(input, "yyyy"), 0);
    }

    return;
  }

  if (seg === "mm") {
    if (parts.mm.length > 0) {
      parts.mm = parts.mm.slice(0, -1);
    }

    const newVal = buildDate(parts);
    setWhenDraft(newVal);

    const iso = parseDMY(newVal);
    if (iso) props.onDate(iso);

    if (parts.mm.length === 0) {
      editingSegRef.current = null;
      setTimeout(() => selectSegment(input, "dd"), 0);
    } else {
      editingSegRef.current = "mm";
      setTimeout(() => selectSegment(input, "mm"), 0);
    }

    return;
  }

  // dd
  if (parts.dd.length > 0) {
    parts.dd = parts.dd.slice(0, -1);
  }

  const newVal = buildDate(parts);
  setWhenDraft(newVal);

  const iso = parseDMY(newVal);
  if (iso) props.onDate(iso);

  editingSegRef.current = "dd";
  setTimeout(() => selectSegment(input, "dd"), 0);
  return;
}

      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        const digit = e.key;
        const parts = datePartsRef.current;

        // إذا انتقل المستخدم إلى جزء جديد، نبدأ منه ونمسح ما بعده
        if (editingSegRef.current !== seg) {
          if (seg === "dd") {
            parts.dd = "";
            parts.mm = "";
            parts.yyyy = "";
          } else if (seg === "mm") {
            parts.mm = "";
            parts.yyyy = "";
          } else {
            parts.yyyy = "";
          }
          editingSegRef.current = seg;
        }

        let nextSeg: "dd" | "mm" | "yyyy" = seg;

        if (seg === "dd") {
          if (parts.dd.length < 2) parts.dd += digit;

          const newVal = buildDate(parts);
          setWhenDraft(newVal);

          if (parts.dd.length === 2) {
            editingSegRef.current = null;
            nextSeg = "mm";
          }

          const iso = parseDMY(newVal);
          if (iso) props.onDate(iso);

          setTimeout(() => selectSegment(input, nextSeg), 0);
          return;
        }

        if (seg === "mm") {
          if (parts.mm.length < 2) parts.mm += digit;

          const newVal = buildDate(parts);
          setWhenDraft(newVal);

          if (parts.mm.length === 2) {
            editingSegRef.current = null;
            nextSeg = "yyyy";
          }

          const iso = parseDMY(newVal);
          if (iso) props.onDate(iso);

          setTimeout(() => selectSegment(input, nextSeg), 0);
          return;
        }

        // yyyy
        if (parts.yyyy.length < 4) parts.yyyy += digit;

        const newVal = buildDate(parts);
        setWhenDraft(newVal);

        const iso = parseDMY(newVal);
        if (iso) props.onDate(iso);

        if (parts.yyyy.length === 4) {
          editingSegRef.current = null;
        }

        setTimeout(() => selectSegment(input, "yyyy"), 0);
        return;
      }

      e.preventDefault();
    };

    const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
      editingSegRef.current = null;
      const input = e.currentTarget;

      setTimeout(() => {
        const pos = input.selectionStart ?? 0;
        selectSegment(input, getSegment(pos));
      }, 0);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      editingSegRef.current = null;
      setPanel("when");
      setTimeout(() => selectSegment(e.target, "dd"), 0);
    };

    const handleBlur = () => {
      editingSegRef.current = null;
    };

    return (
      <div className="capsule__control flex min-w-0 items-center gap-1">
        <input
          ref={(el) => {
            whenInputRefs.current[layout] = el;
          }}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={displayVal}
          placeholder=""
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls="date-calendar-popover"
          onChange={() => {}}
          onKeyDown={handleKeyDown}
          onClick={handleClick}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            "capsule__input tnum min-w-0 flex-1 bg-transparent text-[14px] leading-snug outline-none placeholder:text-foggy",
            date ? "font-medium text-hof" : "text-foggy",
          )}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={isOpen ? "Close calendar" : "Open calendar"}
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            e.stopPropagation();
            setPanel(isOpen ? null : "when");
          }}
          className={cn(
            "u-reset-btn capsule__caret capsule__caret--btn grid h-6 w-6 shrink-0 place-items-center rounded-full text-foggy transition-all hover:bg-white",
            isOpen && "is-open rotate-180",
          )}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              d="M6 9l6 6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-[880px]">
      {/* Desktop capsule */}
      <div className="hidden items-stretch rounded-full bg-white shadow-capsule md:flex">
        <div
          onClick={() => focusCombo("from")}
          className={cn(
            segmentCls(panel === "from"),
            "min-w-0 flex-1 pl-8 rounded-l-full",
          )}
        >
          {renderComboboxInput("from", "desktop")}
        </div>

        <div className="relative flex w-0 items-center justify-center">
          <span
            role="button"
            tabIndex={0}
            aria-label="Swap origin and destination"
            onClick={(e) => {
              e.stopPropagation();
              props.onSwap();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                props.onSwap();
              }
            }}
            className="absolute z-20 grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-bebe bg-white text-hof shadow-sm transition-transform hover:rotate-180 hover:bg-faint"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </span>
        </div>

        <div
          onClick={() => focusCombo("to")}
          className={cn(segmentCls(panel === "to"), "min-w-0 flex-1")}
        >
          {renderComboboxInput("to", "desktop")}
        </div>

        <span className="my-3 w-px bg-bebe" />

        <div
          onClick={() => setPanel("when")}
          className={cn(
            segmentCls(panel === "when"),
            "capsule__segment capsule__segment--compact min-w-0 flex-1",
          )}
        >
          <label htmlFor="date" className={cn(labelCls, "capsule__label")}>
            When
          </label>
          {renderWhenControl("date")}
        </div>

        <span className="my-3 w-px bg-bebe" />

        <button
          onClick={() => toggle("who")}
          className={cn(
            segmentCls(panel === "who"),
            "flex-1 min-w-0 flex items-center justify-between gap-1",
          )}
        >
          <span className="min-w-0 flex-1">
            <span className={labelCls}>Who</span>
            <span className="block truncate text-[14px] font-medium text-hof">
              {paxLabel}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-foggy transition-transform",
              panel === "who" && "rotate-180",
            )}
          />
        </button>

        <span className="my-3 w-px bg-bebe" />

        <button
          onClick={() => toggle("class")}
          className={cn(
            segmentCls(panel === "class"),
            "flex-1 min-w-0 flex items-center justify-between gap-1",
          )}
        >
          <span className="min-w-0 flex-1">
            <span className={labelCls}>Class</span>
            <span className="block truncate text-[14px] font-medium text-hof">
              {cabin}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-foggy transition-transform",
              panel === "class" && "rotate-180",
            )}
          />
        </button>

        <div className="flex items-center py-2 pl-1 pr-2">
          <button
            onClick={props.onSearch}
            disabled={loading || !canSearch}
            aria-label="Search flights"
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full bg-rausch text-white transition-colors",
              loading || !canSearch
                ? "cursor-not-allowed opacity-60"
                : "hover:bg-rausch-600 active:bg-rausch-600",
            )}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.4} />
            ) : (
              <Search className="h-5 w-5" strokeWidth={2.4} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile stacked */}
      <div className="relative overflow-visible rounded-2xl bg-white shadow-capsule md:hidden">
        <div
          onClick={() => focusCombo("from")}
          className="flex w-full cursor-pointer items-center gap-3 border-b border-bebe px-5 py-4 text-left"
        >
          <MapPin className="h-4 w-4 shrink-0 text-foggy" />
          <span className="min-w-0 flex-1">
            {renderComboboxInput("from", "mobile")}
          </span>
        </div>

        <div className="relative flex h-0 w-full items-center justify-center">
          <span
            role="button"
            tabIndex={0}
            aria-label="Swap origin and destination"
            onClick={(e) => {
              e.stopPropagation();
              props.onSwap();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                props.onSwap();
              }
            }}
            className="absolute z-20 grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-bebe bg-white text-hof shadow-sm transition-transform hover:rotate-180 hover:bg-faint"
          >
            <ArrowLeftRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </span>
        </div>

        <div
          onClick={() => focusCombo("to")}
          className="flex w-full cursor-pointer items-center gap-3 border-b border-bebe px-5 py-4 text-left"
        >
          <MapPin className="h-4 w-4 shrink-0 text-foggy" />
          <span className="min-w-0 flex-1">
            {renderComboboxInput("to", "mobile")}
          </span>
        </div>

        <div
          onClick={() => setPanel("when")}
          className="capsule__segment capsule__segment--compact w-full cursor-pointer border-b border-bebe px-5 py-4 text-left"
        >
          <label
            htmlFor="date-mobile"
            className={cn(labelCls, "capsule__label")}
          >
            When
          </label>
          {renderWhenControl("date-mobile")}
        </div>

        <button
          onClick={() => toggle("who")}
          className="w-full border-b border-bebe px-5 py-4 text-left"
        >
          <span className={labelCls}>Who</span>
          <span className="block truncate text-[14px] font-medium text-hof">
            {paxLabel}
          </span>
        </button>

        <button
          onClick={() => toggle("class")}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span>
            <span className={labelCls}>Class</span>
            <span className="block text-[14px] font-medium text-hof">
              {cabin}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-foggy transition-transform",
              panel === "class" && "rotate-180",
            )}
          />
        </button>

        <div className="px-4 pb-4">
          <button
            onClick={props.onSearch}
            disabled={loading || !canSearch}
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-rausch text-[16px] font-medium text-white transition-colors",
              loading || !canSearch
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-rausch-600 active:bg-rausch-600",
            )}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" strokeWidth={2.4} />
            )}
            Search flights
          </button>
        </div>
      </div>

      {/* Popovers */}
      {panel && (
        <div
          className={cn(
            "absolute left-1/2 top-[calc(100%+12px)] z-50 -translate-x-1/2",
            panel === "from" && "md:left-0 md:translate-x-0",
            panel === "to" && "md:left-[18%] md:translate-x-0",
            panel === "when" && "md:left-[38%] md:translate-x-0",
            panel === "who" && "md:right-[16%] md:left-auto md:translate-x-0",
            panel === "class" && "md:right-0 md:left-auto md:translate-x-0",
          )}
        >
          <div
            id={panel === "when" ? "date-calendar-popover" : undefined}
            role={panel === "when" ? "dialog" : undefined}
            aria-label={panel === "when" ? "Choose date" : undefined}
            className={cn(
              "overflow-hidden rounded-2xl bg-white shadow-popover",
              panel === "when" && "popover popover--calendar",
            )}
          >
            {panel === "from" && renderAirportListbox("from")}
            {panel === "to" && renderAirportListbox("to")}
            {panel === "when" && (
              <div data-calendar="true">
                <Calendar
                  value={date}
                  onSelect={(iso) => {
                    props.onDate(iso);
                    clearDateDraft();
                    setPanel(null);
                  }}
                />
              </div>
            )}
            {panel === "who" && (
              <div className="w-[calc(100vw-48px)] max-w-[320px] p-4 md:w-[280px]">
                {PAX_ROWS.map((row, idx) => {
                  const val =
                    row.key === "adults"
                      ? adults
                      : row.key === "children"
                        ? children
                        : infants;

                  const effMax =
                    row.key === "infants" ? Math.min(row.max, adults) : row.max;

                  const decDisabled = val <= row.min;
                  const incDisabled = val >= effMax;

                  return (
                    <div
                      key={row.key}
                      className={cn(
                        "flex items-center justify-between py-3",
                        idx !== 0 && "border-t border-bebe",
                      )}
                    >
                      <span>
                        <span className="block text-[15px] font-medium text-hof">
                          {row.label}
                        </span>
                        <span className="block text-[13px] text-foggy">
                          {row.desc}
                        </span>
                      </span>
                      <span className="flex items-center gap-2.5">
                        <button
                          type="button"
                          disabled={decDisabled}
                          onClick={() =>
                            !decDisabled && props.onPax(row.key, val - 1)
                          }
                          aria-label={`Decrease ${row.label}`}
                          className={cn(
                            "grid h-7 w-7 place-items-center rounded-full border transition-colors",
                            decDisabled
                              ? "cursor-not-allowed border-bebe text-grey-500"
                              : "border-hof/30 text-hof hover:border-hof",
                          )}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="tnum w-4 text-center text-[15px] text-hof">
                          {val}
                        </span>
                        <button
                          type="button"
                          disabled={incDisabled}
                          onClick={() =>
                            !incDisabled && props.onPax(row.key, val + 1)
                          }
                          aria-label={`Increase ${row.label}`}
                          className={cn(
                            "grid h-7 w-7 place-items-center rounded-full border transition-colors",
                            incDisabled
                              ? "cursor-not-allowed border-bebe text-grey-500"
                              : "border-hof/30 text-hof hover:border-hof",
                          )}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {panel === "class" && (
              <div className="w-[calc(100vw-48px)] max-w-[300px] p-2 md:w-[280px]">
                {CABINS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => {
                      props.onCabin(c);
                      setPanel(null);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-[14px] transition-colors hover:bg-faint"
                  >
                    <span
                      className={cn(
                        cabin === c ? "font-semibold text-hof" : "text-hof",
                      )}
                    >
                      {c}
                    </span>
                    {cabin === c && <Check className="h-4 w-4 text-hof" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}