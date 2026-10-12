import React from "react";
import { StyleSheet, Text } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  text: string;
  glowingPhrase?: string;
  collected?: boolean;
  onPressGlow?: () => void;
}

export function GlowingText({ text, glowingPhrase, collected, onPressGlow }: Props) {
  const c = useColors();

  if (!glowingPhrase || !text.includes(glowingPhrase)) {
    return <Text style={[styles.body, { color: c.foreground }]}>{text}</Text>;
  }

  const idx = text.indexOf(glowingPhrase);
  const before = text.slice(0, idx);
  const after = text.slice(idx + glowingPhrase.length);

  return (
    <Text style={[styles.body, { color: c.foreground }]}>
      {before}
      <Text
        onPress={collected ? undefined : onPressGlow}
        suppressHighlighting={collected}
        style={[
          styles.glow,
          {
            backgroundColor: collected ? c.gold + "30" : c.glow + "40",
            color: collected ? c.gold : c.glow,
          },
        ]}
      >
        {glowingPhrase}
      </Text>
      {after}
    </Text>
  );
}

const styles = StyleSheet.create({
  body: { fontFamily: "Inter_400Regular", fontSize: 16, lineHeight: 26 },
  glow: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
