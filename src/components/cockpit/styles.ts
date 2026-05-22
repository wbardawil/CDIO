// Shared class strings for the cockpit UI. Tokens are defined in
// globals.css from DESIGN.md — warm paper, one evergreen voice,
// one amber action per screen, no blue.

export const btnPrimary =
  "inline-flex items-center justify-center rounded-md bg-evergreen px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-evergreen-deep disabled:cursor-not-allowed disabled:opacity-50";

// The single recommended action on a screen. Use once.
export const btnAmber =
  "inline-flex items-center justify-center rounded-md bg-amber px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-amber-deep disabled:cursor-not-allowed disabled:opacity-50";

export const btnGhost =
  "inline-flex items-center justify-center rounded-md border border-hair bg-raised px-4 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink hover:border-hair-strong";

export const card = "rounded-lg border border-hair bg-raised";

export const eyebrow =
  "text-xs font-semibold uppercase tracking-[0.14em] text-faint";

export const input =
  "w-full rounded-md border border-hair bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-evergreen";

export const label = "block text-sm font-medium text-ink";
