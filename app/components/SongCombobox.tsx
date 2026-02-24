"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ComboboxOption = {
  value: string;
  label: string;
  subLabel?: string;
};

type SongComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function includesLoose(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

export function SongCombobox({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  className,
}: SongComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(() => {
    return options.find((o) => o.value === value) ?? null;
  }, [options, value]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return options;
    return options.filter((o) => {
      if (includesLoose(o.label, q)) return true;
      if (o.subLabel && includesLoose(o.subLabel, q)) return true;
      return false;
    });
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function selectOption(opt: ComboboxOption) {
    onChange(opt.value);
    setOpen(false);
    setQuery("");
    window.setTimeout(() => inputRef.current?.blur(), 0);
  }

  const displayValue = open ? query : selected?.label ?? "";

  return (
    <div ref={rootRef} className={"relative " + (className ?? "")}>
      <div className="relative">
        <input
          ref={inputRef}
          value={displayValue}
          disabled={disabled}
          readOnly={!open}
          placeholder={placeholder}
          onFocus={() => {
            if (disabled) return;
            setOpen(true);
            setQuery("");
            setActiveIndex(0);
          }}
          onChange={(e) => {
            if (!open) return;
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(e) => {
            if (disabled) return;

            if (!open) {
              if (e.key === "ArrowDown" || e.key === "Enter") {
                e.preventDefault();
                setOpen(true);
                setQuery("");
                setActiveIndex(0);
              }
              return;
            }

            if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
              setQuery("");
              return;
            }

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
              return;
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(0, i - 1));
              return;
            }

            if (e.key === "Enter") {
              e.preventDefault();
              const opt = filtered[activeIndex];
              if (opt) selectOption(opt);
            }
          }}
          className={
            "w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 pr-9 text-sm text-white outline-none placeholder:text-white/40 ring-1 ring-transparent focus:ring-sky-400/40 " +
            (disabled ? "opacity-60" : "")
          }
        />

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return;
            setOpen((v) => !v);
            if (!open) {
              setQuery("");
              setActiveIndex(0);
              window.setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-black tracking-widest text-white/80 hover:bg-white/10"
        >
          {open ? "×" : "▾"}
        </button>
      </div>

      {open ? (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-white/10 bg-[rgba(5,5,10,0.96)] p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_40px_rgba(0,0,0,0.55)]">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs font-semibold text-white/60">No results</div>
          ) : (
            filtered.slice(0, 160).map((o, idx) => (
              <button
                key={o.value}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => selectOption(o)}
                className={
                  "w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition " +
                  (idx === activeIndex
                    ? "bg-sky-400/15 text-white ring-1 ring-sky-300/25"
                    : "text-white/85 hover:bg-white/5")
                }
              >
                <div className="truncate">{o.label}</div>
                {o.subLabel ? (
                  <div className="mt-0.5 truncate text-xs font-semibold text-white/55">
                    {o.subLabel}
                  </div>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
