/**
 * Sprout – "Find It!" Camera Game
 * Task 4 · React Native (Expo)
 *
 * To run:
 *   npx create-expo-app SproutCamera --template blank-typescript
 *   cd SproutCamera
 *   npx expo install expo-camera expo-haptics react-native-safe-area-context
 *   Replace App.tsx with this file, and app.json with the provided app.json
 *   npx expo start
 *
 * To build APK:
 *   npm install -g eas-cli
 *   npx expo login
 *   eas init
 *   eas build -p android --profile preview
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Mock Vision API ───────────────────────────────────────────────────────────
// Swap this out with Google Cloud Vision or any REST endpoint when deploying.
const MOCK_LABELS = [
  "a cup", "a book", "a chair", "a lamp", "a plant",
  "a pillow", "a shoe", "a toy", "a table", "a window",
  "a phone", "a bag", "a clock", "a bottle", "a ball",
];

async function mockIdentifyObject(_photoUri: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200));
  return MOCK_LABELS[Math.floor(Math.random() * MOCK_LABELS.length)];
}
// ─────────────────────────────────────────────────────────────────────────────

const GOAL = 5;
const REWARDS = ["⭐", "🌟", "🎉", "🏆", "🎈"];
const PRAISE = [
  "Amazing find!",
  "You're so clever!",
  "Great job!",
  "Wow, you found one!",
  "Super explorer!",
];

interface Find {
  uri: string;
  label: string;
  praise: string;
  reward: string;
}

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<
    "intro" | "camera" | "analysing" | "result" | "complete"
  >("intro");
  const [finds, setFinds] = useState<Find[]>([]);
  const [lastFind, setLastFind] = useState<Find | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === "result" || phase === "complete") {
      fadeAnim.setValue(0);
      bounceAnim.setValue(0);
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [phase]);

  async function takePhoto() {
    if (!cameraRef.current) return;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
      });

      if (!photo) return;

      setCapturedUri(photo.uri);
      setPhase("analysing");

      const label = await mockIdentifyObject(photo.uri);
      const idx = finds.length;
      const find: Find = {
        uri: photo.uri,
        label,
        praise: PRAISE[idx % PRAISE.length],
        reward: REWARDS[idx % REWARDS.length],
      };

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const newFinds = [...finds, find];
      setFinds(newFinds);
      setLastFind(find);
      setPhase(newFinds.length >= GOAL ? "complete" : "result");
    } catch (err) {
      console.error(err);
      setPhase("camera");
    }
  }

  function continueHunt() {
    setLastFind(null);
    setCapturedUri(null);
    setPhase("camera");
  }

  function restart() {
    setFinds([]);
    setLastFind(null);
    setCapturedUri(null);
    setPhase("intro");
  }

  // ── Permission not yet determined ─────────────────────────────────────────
  if (!permission) {
    return <View style={styles.centred} />;
  }

  // ── Permission denied ─────────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.centred, { backgroundColor: "#FFF8E7" }]}>
        <Text style={styles.bigEmoji}>📷</Text>
        <Text style={styles.title}>Camera access needed!</Text>
        <Text style={styles.body}>
          Sprout needs the camera so you can snap things around your home.
        </Text>
        <TouchableOpacity style={styles.bigButton} onPress={requestPermission}>
          <Text style={styles.bigButtonText}>Allow Camera 📷</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Intro ─────────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <SafeAreaView style={[styles.centred, { backgroundColor: "#FFF8E7" }]}>
        <Text style={{ fontSize: 80 }}>🌱</Text>
        <Text style={styles.title}>Find It!</Text>
        <Text style={styles.subtitle}>
          Can you find{" "}
          <Text style={{ color: "#6BCB77", fontWeight: "800" }}>
            {GOAL} things
          </Text>{" "}
          around your home?
        </Text>
        <Text style={styles.body}>
          Take a photo of each one and Sprouty will name it for you! 🎉
        </Text>
        <TouchableOpacity
          style={styles.bigButton}
          onPress={() => setPhase("camera")}
        >
          <Text style={styles.bigButtonText}>Let's Go! 🔍</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  if (phase === "camera") {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* CameraView fills the screen — no children inside it (SDK 50+ requirement) */}
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

        {/* HUD absolutely positioned OVER the camera, outside CameraView */}
        <SafeAreaView style={styles.cameraHud}>
          <View style={styles.progressRow}>
            {Array.from({ length: GOAL }).map((_, i) => (
              <Text key={i} style={{ fontSize: 26 }}>
                {i < finds.length ? "⭐" : "○"}
              </Text>
            ))}
          </View>
          <Text style={styles.cameraPrompt}>
            Find {GOAL - finds.length} more thing
            {GOAL - finds.length !== 1 ? "s" : ""}!
          </Text>
        </SafeAreaView>

        {/* Shutter absolutely positioned OVER the camera, outside CameraView */}
        <View style={styles.shutterRow}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity style={styles.shutter} onPress={takePhoto}>
              <View style={styles.shutterInner} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    );
  }

  // ── Analysing ─────────────────────────────────────────────────────────────
  if (phase === "analysing") {
    return (
      <SafeAreaView style={[styles.centred, { backgroundColor: "#E8F8FF" }]}>
        {capturedUri && (
          <Image
            source={{ uri: capturedUri }}
            style={{ width: 220, height: 220, borderRadius: 20, marginBottom: 24 }}
          />
        )}
        <Text style={{ fontSize: 48 }}>🔍</Text>
        <Text style={styles.title}>Sprouty is looking...</Text>
        <Text style={styles.body}>Give me a moment!</Text>
      </SafeAreaView>
    );
  }

  // ── Result ────────────────────────────────────────────────────────────────
  if (phase === "result" && lastFind) {
    return (
      <SafeAreaView style={[styles.centred, { backgroundColor: "#FFF0FA" }]}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: bounceAnim }],
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: lastFind.uri }}
            style={{ width: 220, height: 220, borderRadius: 20, marginBottom: 16 }}
          />
          <Text style={{ fontSize: 56 }}>{lastFind.reward}</Text>
          <Text style={styles.title}>{lastFind.praise}</Text>
          <Text style={styles.labelBubble}>That's {lastFind.label}!</Text>
          <Text style={styles.countText}>
            {finds.length} of {GOAL} found
          </Text>
        </Animated.View>
        <TouchableOpacity
          style={[styles.bigButton, { marginTop: 28 }]}
          onPress={continueHunt}
        >
          <Text style={styles.bigButtonText}>Find more! 🔍</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Complete ──────────────────────────────────────────────────────────────
  if (phase === "complete") {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#FFF8E7" }}
      >
        <Animated.View
          style={{ opacity: fadeAnim, alignItems: "center", paddingTop: 40 }}
        >
          <Text style={{ fontSize: 72 }}>🏆</Text>
          <Text style={[styles.title, { fontSize: 30 }]}>Amazing Explorer!</Text>
          <Text style={styles.subtitle}>You found all {GOAL} things!</Text>
          <Text style={{ fontSize: 36, letterSpacing: 8, marginVertical: 12 }}>
            {Array(GOAL).fill("⭐").join("")}
          </Text>
        </Animated.View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            gap: 12,
            paddingBottom: 8,
          }}
          style={{ maxHeight: 180, marginTop: 8 }}
        >
          {finds.map((f, i) => (
            <View key={i} style={styles.findCard}>
              <Image
                source={{ uri: f.uri }}
                style={{ width: 110, height: 110, borderRadius: 14 }}
              />
              <Text style={styles.findLabel}>{f.label}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={{ alignItems: "center", marginTop: 24 }}>
          <TouchableOpacity
            style={[styles.bigButton, { backgroundColor: "#FF6B6B" }]}
            onPress={restart}
          >
            <Text style={styles.bigButtonText}>Play Again! 🔄</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  centred: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  bigEmoji: {
    fontSize: 72,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  bigButton: {
    backgroundColor: "#6BCB77",
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 48,
    shadowColor: "#3d9e4a",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  bigButtonText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  cameraHud: {
    alignItems: "center",
    paddingTop: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingBottom: 12,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  cameraPrompt: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  shutterRow: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
  },
  labelBubble: {
    marginTop: 12,
    backgroundColor: "#6BCB77",
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 30,
    overflow: "hidden",
  },
  countText: {
    marginTop: 10,
    fontSize: 16,
    color: "#aaa",
    fontWeight: "600",
  },
  findCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  findLabel: {
    marginTop: 6,
    fontSize: 12,
    color: "#555",
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 110,
  },
});