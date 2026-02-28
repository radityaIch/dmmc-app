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
            "w-full rounded-lg border border-[#2f2461]/20 bg-white/80 px-3 py-2 pr-9 text-sm text-[#2f2461] outline-none placeholder:text-[#2f2461]/30 ring-1 ring-transparent focus:ring-[#ff4fd8]/40 " +
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
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-[#2f2461]/15 bg-[#2f2461]/5 px-2 py-1 text-[10px] font-black tracking-widest text-[#2f2461]/60 hover:bg-[#2f2461]/10"
        >
          {open ? "×" : "▾"}
        </button>
      </div>

      {open ? (
        <div className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-[#2f2461]/10 bg-white p-1 shadow-[0_4px_24px_rgba(47,36,97,0.12)]">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-xs font-semibold text-[#2f2461]/50">No results</div>
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
                    ? "bg-[#ff4fd8]/10 text-[#2f2461] ring-1 ring-[#ff4fd8]/20"
                    : "text-[#2f2461]/80 hover:bg-[#2f2461]/5")
                }
              >
                <div className="truncate">{o.label}</div>
                {o.subLabel ? (
                  <div className="mt-0.5 truncate text-xs font-semibold text-[#2f2461]/50">
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
