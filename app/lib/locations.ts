export type MaimaiLocation = {
    id: string;
    name: string;
    address: string;
    googleMapURL: string;
    /** Gradient border/bg color tokens for visual differentiation. */
    theme: {
        border: string;
        bg: string;
        ring: string;
    };
};

/**
 * Known maimai DX arcade locations in Bali.
 * Used on the homepage, event creation form, and anywhere a preset location
 * is needed.
 */
export const MAIMAI_LOCATIONS: MaimaiLocation[] = [
    {
        id: "timezone-galeria",
        name: "Timezone Galeria Bali",
        address: "Mall Bali Galeria, Kuta",
        googleMapURL:
            "https://www.google.com/maps/search/?api=1&query=TIMEZONE+GALERIA+BALI",
        theme: {
            border: "border-sky-300/30",
            bg: "bg-[linear-gradient(180deg,rgba(57,183,255,0.18),rgba(8,19,39,0.88))]",
            ring: "ring-sky-200/20",
        },
    },
    {
        id: "timezone-trans-studio",
        name: "Timezone Trans Studio Mal Bali",
        address: "Trans Studio Mall Bali, Denpasar",
        googleMapURL:
            "https://www.google.com/maps/search/?api=1&query=TIMEZONE+TRANS+STUDIO+MAL+BALI",
        theme: {
            border: "border-fuchsia-300/35",
            bg: "bg-[linear-gradient(180deg,rgba(255,79,216,0.2),rgba(40,9,42,0.9))]",
            ring: "ring-fuchsia-200/20",
        },
    },
    {
        id: "timezone-level21",
        name: "Timezone Level 21",
        address: "Level 21 Mall, Denpasar",
        googleMapURL:
            "https://www.google.com/maps/search/?api=1&query=TIMEZONE+LEVEL+21",
        theme: {
            border: "border-lime-200/35",
            bg: "bg-[linear-gradient(180deg,rgba(213,255,99,0.2),rgba(30,36,8,0.9))]",
            ring: "ring-lime-100/20",
        },
    },
];

/** Find a maimai location by ID. */
export function findLocationById(id: string): MaimaiLocation | undefined {
    return MAIMAI_LOCATIONS.find((l) => l.id === id);
}
