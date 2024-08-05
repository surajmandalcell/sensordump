import React, { useEffect, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

import {
  startLogging,
  stopLogging,
  handlePermissions,
  detectSensors,
  SensorState,
} from "@/lib/main";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedSwitch } from "@/components/ThemedSwitch";
import { initialSensorStates } from "@/constants/Common";

export default function HomeScreen() {
  const [logging, setLogging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sensorStates, setSensorStates] = useState<SensorState>(initialSensorStates);
  const [availableSensors, setAvailableSensors] = useState<SensorState>(initialSensorStates);

  useEffect(() => {
    async function callDetectSensors() {
      const sensors = await detectSensors();
      setAvailableSensors(sensors);
      setSensorStates({
        ...sensors,
        barometer: false,
        pedometer: false,
        light: false,
      });
    }
    callDetectSensors();
  }, []);

  useEffect(() => {
    async function requestPermissions() {
      await handlePermissions();
    }
    requestPermissions();
  }, []);

  const handleLogging = async () => {
    setIsLoading(true);
    try {
      if (!logging) {
        await startLogging({ interval: 200, activeSensors: sensorStates });
      } else {
        await stopLogging();
      }
      setLogging(!logging);
    } catch (error) {
      console.error("Error toggling logging:", error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ParallaxScrollView container_style={styles.container}>
      <ThemedView style={styles.textContainer}>
        <ThemedText type="default">Step 1: Select the sensors you want to log</ThemedText>
        <ThemedText type="default">Step 2: Click on the "Start Logging" button</ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.themedtext_note}>Note: You can change which sensors to log in settings page</ThemedText>
      </ThemedView>

      <TouchableOpacity
        style={[styles.fullWidthButton, logging ? styles.stopLoggingButton : null]}
        onPress={handleLogging}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.fullWidthButtonText}>
            {logging ? "Stop Logging" : "Start Logging"}
          </Text>
        )}
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  textContainer: {
    marginBottom: 10,
    gap: 4,
  },
  themedtext_note: {
    marginTop: 10,
  },
  fullWidthButton: {
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    marginBottom: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  fullWidthButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  stopLoggingButton: {
    backgroundColor: "#FF3B30",
  },
});
