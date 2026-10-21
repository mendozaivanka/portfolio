/**
 * Tala Rosa design tokens: the single source of truth for colour.
 *
 * `scripts/gen-tokens.ts` turns this file into `src/styles/tokens.css` before every
 * build, and the Tala design-system page computes its contrast table from it, so the
 * CSS, the docs and the numbers can never disagree.
 *
 * Names follow shadcn/ui (background, foreground, card, muted, accent = hover tint…),
 * plus the brand colours: rosas (pink ramp), ube, pandan, langit, mangga/gold.
 */

export type Theme = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  /** Deep rose: links, the star mark, strong text accents. */
  primaryStrong: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  border: string;
  input: string;
  ring: string;
  rosas1: string;
  rosas2: string;
  rosas3: string;
  rosas4: string;
  rosas5: string;
  ube: string;
  pandan: string;
  langit: string;
  /** Soft gold surface (badges, tints). */
  mangga: string;
  /** Saturated gold: the star, the stripe, chart highlights. */
  gold: string;
  /** Gold that passes as text. */
  goldInk: string;
  /** Circle behind the gold star: deep rose in every theme so the star stays visible. */
  mark: string;
};

export const light: Theme = {
  background: "#fbf6f7",
  foreground: "#2e1d24",
  card: "#ffffff",
  cardForeground: "#2e1d24",
  popover: "#ffffff",
  popoverForeground: "#2e1d24",
  primary: "#f4b3c6",
  primaryForeground: "#3b1626",
  primaryStrong: "#b04a6f",
  secondary: "#f9e9ee",
  secondaryForeground: "#3b1626",
  muted: "#f6ecef",
  mutedForeground: "#7a6169",
  accent: "#f6ecef",
  accentForeground: "#2e1d24",
  destructive: "#b3261e",
  border: "#eedde2",
  input: "#a97f8e",
  ring: "#b04a6f",
  rosas1: "#fbe8ee",
  rosas2: "#f6c8d6",
  rosas3: "#eea6bd",
  rosas4: "#df84a2",
  rosas5: "#b04a6f",
  ube: "#ddcdf2",
  pandan: "#cfe9db",
  langit: "#d3e3f5",
  mangga: "#f9e3bd",
  gold: "#f6d49e",
  goldInk: "#7a5208",
  mark: "#b04a6f",
};

export const dark: Theme = {
  background: "#171014",
  foreground: "#f6e9ee",
  card: "#20171c",
  cardForeground: "#f6e9ee",
  popover: "#20171c",
  popoverForeground: "#f6e9ee",
  primary: "#f2a3bc",
  primaryForeground: "#2a0f1a",
  primaryStrong: "#f6b5c9",
  secondary: "#2f2229",
  secondaryForeground: "#f6e9ee",
  muted: "#2a1f25",
  mutedForeground: "#b49ba4",
  accent: "#2f2229",
  accentForeground: "#f6e9ee",
  destructive: "#f28b82",
  border: "#372830",
  input: "#7e6272",
  ring: "#f2a3bc",
  rosas1: "#2c1d24",
  rosas2: "#4e2a3a",
  rosas3: "#7a3d56",
  rosas4: "#b55f80",
  rosas5: "#f2a3bc",
  ube: "#3d3352",
  pandan: "#23443a",
  langit: "#263a52",
  mangga: "#4a3a1e",
  gold: "#f1c77f",
  goldInk: "#f3cf8f",
  mark: "#7a3d56",
};

/** Overrides applied on top of each theme for `prefers-contrast: more` / data-contrast="high". */
export const highContrast: { light: Partial<Theme>; dark: Partial<Theme> } = {
  light: {
    foreground: "#1a0d12",
    mutedForeground: "#4f3c44",
    primaryStrong: "#8f2f55",
    border: "#b89aa5",
    input: "#6e5460",
    ring: "#8f2f55",
    goldInk: "#5c3d04",
    mark: "#8f2f55",
  },
  dark: {
    foreground: "#ffffff",
    mutedForeground: "#d8c6cd",
    primaryStrong: "#ffc2d6",
    border: "#8a6f7b",
    input: "#b095a0",
    ring: "#ffc2d6",
    goldInk: "#f8dca6",
    mark: "#5e2b42",
  },
};

export const themes = {
  light,
  dark,
  "light-hc": { ...light, ...highContrast.light },
  "dark-hc": { ...dark, ...highContrast.dark },
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof themes;
