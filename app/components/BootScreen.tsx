import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Ellipse } from "react-native-svg";

const { width: SW } = Dimensions.get("window");

const BG_DEEP = "#070B14";
const BG_MID = "#0D1424";
const GOLD = "#D4A94A";
const GOLD_SOFT = "#E8C877";
const CREAM = "#F4EFE4";
const MUTED = "#8A8578";

interface Props {
  ready: boolean;
  onHidden: () => void;
  fontsReady: boolean;
}

export function BootScreen({ ready, onHidden, fontsReady }: Props) {
  const fadeOutOpacity = useRef(new Animated.Value(1)).current;

  const emblemOpacity = useRef(new Animated.Value(0)).current;
  const emblemTranslate = useRef(new Animated.Value(18)).current;
  const emblemScale = useRef(new Animated.Value(0.92)).current;

  const outerRingRot = useRef(new Animated.Value(0)).current;
  const innerRingRot = useRef(new Animated.Value(0)).current;
  const markScale = useRef(new Animated.Value(1)).current;
  const markOpacity = useRef(new Animated.Value(0.85)).current;

  const eyebrowOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const ruleWidth = useRef(new Animated.Value(0)).current;
  const verseOpacity = useRef(new Animated.Value(0)).current;
  const progressOpacity = useRef(new Animated.Value(0)).current;
  const progressSlide = useRef(new Animated.Value(-0.4 * SW)).current;
  const pulseOpacity = useRef(new Animated.Value(0.55)).current;

  const spinOuter = useCallback(() => {
    outerRingRot.setValue(0);
    Animated.loop(
      Animated.timing(outerRingRot, {
        toValue: 1,
        duration: 2400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [outerRingRot]);

  const spinInner = useCallback(() => {
    innerRingRot.setValue(0);
    Animated.loop(
      Animated.timing(innerRingRot, {
        toValue: -1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [innerRingRot]);

  const breathe = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(markScale, { toValue: 1.06, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(markOpacity, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(markScale, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(markOpacity, { toValue: 0.85, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [markScale, markOpacity]);

  const slideProgress = useCallback(() => {
    const barWidth = 0.4 * Math.min(280, SW * 0.6);
    progressSlide.setValue(-barWidth);
    Animated.loop(
      Animated.timing(progressSlide, {
        toValue: Math.min(280, SW * 0.6),
        duration: 1800,
        easing: Easing.bezier(0.5, 0.05, 0.5, 0.95),
        useNativeDriver: true,
      }),
    ).start();
  }, [progressSlide, SW]);

  const pulseLabel = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseOpacity, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0.55, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseOpacity]);

  // Phase 1: emblem + rings + eyebrow (no Cormorant font needed)
  useEffect(() => {
    spinOuter();
    spinInner();
    breathe();
    pulseLabel();

    const delay = (ms: number, anim: Animated.CompositeAnimation) =>
      Animated.sequence([Animated.delay(ms), anim]);

    Animated.parallel([
      Animated.timing(emblemOpacity, {
        toValue: 1,
        duration: 1400,
        easing: Easing.bezier(0.2, 0.7, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(emblemTranslate, {
        toValue: 0,
        duration: 1400,
        easing: Easing.bezier(0.2, 0.7, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(emblemScale, {
        toValue: 1,
        duration: 1400,
        easing: Easing.bezier(0.2, 0.7, 0.2, 1),
        useNativeDriver: true,
      }),
      delay(500, Animated.timing(eyebrowOpacity, { toValue: 1, duration: 800, easing: Easing.out(Easing.ease), useNativeDriver: true })),
    ]).start();

    slideProgress();
  }, []);

  // Phase 2: wordmark + verse + progress (Cormorant font required — wait until loaded)
  const phase2Fired = useRef(false);
  useEffect(() => {
    if (!fontsReady || phase2Fired.current) return;
    phase2Fired.current = true;

    const delay = (ms: number, anim: Animated.CompositeAnimation) =>
      Animated.sequence([Animated.delay(ms), anim]);

    Animated.parallel([
      delay(100, Animated.timing(wordmarkOpacity, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true })),
      delay(500, Animated.timing(ruleWidth, { toValue: 140, duration: 1000, easing: Easing.bezier(0.2, 0.7, 0.2, 1), useNativeDriver: false })),
      delay(700, Animated.timing(verseOpacity, { toValue: 1, duration: 1000, easing: Easing.out(Easing.ease), useNativeDriver: true })),
      delay(1100, Animated.timing(progressOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true })),
    ]).start();
  }, [fontsReady]);

  useEffect(() => {
    if (ready) {
      Animated.timing(fadeOutOpacity, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onHidden();
      });
    }
  }, [ready, fadeOutOpacity, onHidden]);

  const outerSpin = outerRingRot.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const innerSpin = innerRingRot.interpolate({
    inputRange: [-1, 0],
    outputRange: ["-360deg", "0deg"],
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeOutOpacity, zIndex: 9999 }]}>
      <LinearGradient
        colors={[BG_DEEP, BG_MID, BG_DEEP]}
        locations={[0, 0.6, 1]}
        style={styles.stage}
      >
        <View style={styles.atmosphere} pointerEvents="none" />

        <Animated.View
          style={[
            styles.emblem,
            {
              opacity: emblemOpacity,
              transform: [
                { translateY: emblemTranslate },
                { scale: emblemScale },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.ring,
              styles.ringOuter,
              { transform: [{ rotate: outerSpin }] },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ringInner,
              { transform: [{ rotate: innerSpin }] },
            ]}
          />

          <Animated.View
            style={{
              opacity: markOpacity,
              transform: [{ scale: markScale }],
            }}
          >
            <Svg width={52} height={52} viewBox="0 0 64 64" fill="none">
              <Ellipse cx={20} cy={22} rx={7} ry={10} fill={GOLD} fillOpacity={0.95} />
              <Circle cx={14} cy={12} r={2.2} fill={GOLD} fillOpacity={0.85} />
              <Circle cx={19} cy={9} r={2.0} fill={GOLD} fillOpacity={0.85} />
              <Circle cx={24} cy={10} r={1.8} fill={GOLD} fillOpacity={0.85} />
              <Circle cx={27} cy={14} r={1.6} fill={GOLD} fillOpacity={0.85} />
              <Ellipse cx={44} cy={42} rx={7} ry={10} fill={GOLD} fillOpacity={0.95} />
              <Circle cx={38} cy={32} r={2.2} fill={GOLD} fillOpacity={0.85} />
              <Circle cx={43} cy={29} r={2.0} fill={GOLD} fillOpacity={0.85} />
              <Circle cx={48} cy={30} r={1.8} fill={GOLD} fillOpacity={0.85} />
              <Circle cx={51} cy={34} r={1.6} fill={GOLD} fillOpacity={0.85} />
            </Svg>
          </Animated.View>
        </Animated.View>

        <Animated.Text style={[styles.eyebrow, { opacity: eyebrowOpacity }]}>
          The Word
        </Animated.Text>

        <Animated.Text style={[styles.wordmark, { opacity: wordmarkOpacity }]}>
          Walk{" "}
          <Text style={styles.wordmarkItalic}>with</Text>
          {" "}Jesus
        </Animated.Text>

        <Animated.View style={[styles.rule, { width: ruleWidth }]} />

        <Animated.View style={{ opacity: verseOpacity, alignItems: "center" }}>
          <Text style={styles.verse}>
            Thy word is a lamp unto my feet, and a light unto my path.
          </Text>
          <Text style={styles.verseCite}>Psalm 119:105</Text>
        </Animated.View>

        <Animated.View style={[styles.progressWrap, { opacity: progressOpacity }]}>
          <Animated.Text style={[styles.progressLabel, { opacity: pulseOpacity }]}>
            Preparing the way
          </Animated.Text>
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                { transform: [{ translateX: progressSlide }] },
              ]}
            />
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  atmosphere: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "transparent",
  },
  emblem: {
    width: 128,
    height: 128,
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    borderRadius: 9999,
  },
  ringOuter: {
    width: 128,
    height: 128,
    borderWidth: 1,
    borderColor: "rgba(212,169,74,0.35)",
    borderTopColor: GOLD,
  },
  ringInner: {
    width: 104,
    height: 104,
    borderWidth: 1,
    borderColor: "transparent",
    borderBottomColor: GOLD_SOFT,
    opacity: 0.55,
  },
  eyebrow: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    letterSpacing: 6,
    textTransform: "uppercase",
    color: GOLD,
    marginBottom: 14,
  },
  wordmark: {
    fontFamily: "CormorantGaramond_500Medium",
    fontSize: 48,
    lineHeight: 52,
    color: CREAM,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  wordmarkItalic: {
    fontFamily: "CormorantGaramond_400Regular_Italic",
    color: GOLD_SOFT,
  },
  rule: {
    height: 1,
    backgroundColor: GOLD,
    marginTop: 24,
    marginBottom: 18,
    opacity: 0.7,
  },
  verse: {
    fontFamily: "CormorantGaramond_400Regular_Italic",
    fontSize: 16,
    color: MUTED,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  verseCite: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 4,
    textTransform: "uppercase",
    color: GOLD,
    opacity: 0.7,
    marginTop: 10,
  },
  progressWrap: {
    position: "absolute",
    bottom: "12%",
    width: Math.min(280, SW * 0.6),
    alignItems: "center",
  },
  progressLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    letterSpacing: 5,
    textTransform: "uppercase",
    color: MUTED,
    marginBottom: 12,
  },
  progressTrack: {
    width: "100%",
    height: 2,
    backgroundColor: "rgba(212,169,74,0.12)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 2,
    width: Math.min(112, SW * 0.24),
    backgroundColor: GOLD,
    opacity: 0.85,
  },
});
