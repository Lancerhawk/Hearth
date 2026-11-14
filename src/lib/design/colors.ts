/** Locked Hearth brand trio — keep in sync with docs/DESIGN.md and globals.css */
export const hearthColors = {
  ink: "#1C1917",
  moss: "#3F5E4A",
  paper: "#F3EFE6",
} as const;

export type HearthColorName = keyof typeof hearthColors;
