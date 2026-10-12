import colors from "@/constants/colors";
import { useTheme } from "@/contexts/ThemeContext";

/** Current app theme, with Premium entitlement checks handled by ThemeProvider. */
export function useColors() {
  const { theme } = useTheme();
  return { ...theme.palette, radius: colors.radius, dark: theme.dark };
}
