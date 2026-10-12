import colors from "@/constants/colors";

export type Palette = typeof colors.light;
export type ThemeId = "midnight" | "daylight" | "forest" | "ocean" | "plum";
export interface AppTheme {
  id: ThemeId;
  name: string;
  description: string;
  premium: boolean;
  dark: boolean;
  palette: Palette;
}

function darkPalette(background: string, card: string, elevated: string, border: string, highlight: string): Palette {
  return { ...colors.light, background, primaryForeground: background, card, muted: card,
    secondary: card, cardElevated: elevated, accent: elevated, border, input: border,
    primary: highlight, tint: highlight, gold: highlight, goldDim: highlight, mutedForeground: "#ADB8BF" };
}

export const THEMES: AppTheme[] = [
  { id: "midnight", name: "Midnight Gold", description: "The original warm gold on deep navy.", premium: false, dark: true, palette: colors.light },
  { id: "daylight", name: "Daylight", description: "A bright, quiet canvas for daytime reading.", premium: false, dark: false,
    palette: { ...colors.light, text: "#242A32", foreground: "#242A32", parchment: "#242A32",
      background: "#F7F5EF", card: "#FFFFFF", cardForeground: "#242A32", cardElevated: "#EEEAE1",
      primary: "#805219", tint: "#805219", gold: "#805219", goldDim: "#805219", primaryForeground: "#FFFFFF",
      secondary: "#EEEAE1", secondaryForeground: "#242A32", muted: "#EEEAE1", mutedForeground: "#626773",
      accent: "#EEEAE1", accentForeground: "#242A32", border: "#D5D1C7", input: "#D5D1C7",
      ot: "#875429", nt: "#355D8C", glow: "#805219", success: "#386B44", waiting: "#626773", destructive: "#AD382D" } },
  { id: "forest", name: "Still Forest", description: "Soft sage and deep woodland greens.", premium: true, dark: true,
    palette: darkPalette("#101D19", "#192D25", "#233C32", "#335246", "#B2CEA1") },
  { id: "ocean", name: "Quiet Waters", description: "Sea glass highlights on an evening blue.", premium: true, dark: true,
    palette: darkPalette("#0E1B29", "#182E42", "#203B50", "#304D64", "#9ED4DD") },
  { id: "plum", name: "Evening Plum", description: "Gentle lavender and warm plum tones.", premium: true, dark: true,
    palette: darkPalette("#211726", "#302236", "#422D49", "#583B60", "#D9B7E5") },
];

export function getTheme(id: unknown): AppTheme {
  return THEMES.find(theme => theme.id === id) ?? THEMES[0];
}

export function availableTheme(id: unknown, premium: boolean): AppTheme {
  const theme = getTheme(id);
  return theme.premium && !premium ? THEMES[0] : theme;
}
