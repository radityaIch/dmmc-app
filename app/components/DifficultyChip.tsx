"use client";

import Image from "next/image";

type DifficultyKey = "BASIC" | "ADVANCED" | "EXPERT" | "MASTER" | "REMASTER" | "UNKNOWN";

type DifficultyMeta = {
  label: string;
  bg: string;
  fg: string;
  icon: string | null;
};

const DIFFICULTY_META: Record<DifficultyKey, DifficultyMeta> = {
  BASIC: {
    label: "BASIC",
    bg: "#6ee267",
    fg: "#163214",
    icon: "/images/diff_basic.png",
  },
  ADVANCED: {
    label: "ADVANCED",
    bg: "#fadf38",
    fg: "#3a3200",
    icon: "/images/diff_advanced.png",
  },
  EXPERT: {
    label: "EXPERT",
    bg: "#ff7a7b",
    fg: "#4f1212",
    icon: "/images/diff_expert.png",
  },
  MASTER: {
    label: "MASTER",
    bg: "#9f51db",
    fg: "#ffffff",
    icon: "/images/diff_master.png",
  },
  REMASTER: {
    label: "RE:MASTER",
    bg: "#d7abff",
    fg: "#3f2360",
    icon: "/images/diff_remaster.png",
  },
  UNKNOWN: {
    label: "UNKNOWN",
    bg: "#e8e8ef",
    fg: "#4f4f61",
    icon: null,
  },
};

function normalizeDifficulty(value: string | null | undefined): DifficultyKey {
  if (!value) return "UNKNOWN";
  const normalized = value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(":", "");
  if (normalized === "BASIC") return "BASIC";
  if (normalized === "ADVANCED") return "ADVANCED";
  if (normalized === "EXPERT") return "EXPERT";
  if (normalized === "MASTER") return "MASTER";
  if (normalized === "REMASTER") return "REMASTER";
  return "UNKNOWN";
}

type DifficultyChipProps = {
  difficulty: string | null | undefined;
  className?: string;
  showIcon?: boolean;
};

export function DifficultyChip({
  difficulty,
  className,
  showIcon = true,
}: DifficultyChipProps) {
  const key = normalizeDifficulty(difficulty);
  const meta = DIFFICULTY_META[key];
  const classes = [
    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-wider ring-1 ring-black/10",
    className ?? "",
  ]
    .join(" ")
    .trim();

  return (
    <span className={classes} style={{ backgroundColor: meta.bg, color: meta.fg }}>
      {showIcon && meta.icon ? (
        <Image quality={100} src={meta.icon} alt="" width={24} height={12} className="w-auto" />
      ) : null}
      {/* <span>{meta.label}</span> */}
    </span>
  );
}
