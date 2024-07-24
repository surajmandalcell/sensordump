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

const initialSensorStates: SensorState = {
  gps: false,
  accelerometer: false,
  gyroscope: false,
  magnetometer: false,
  light: false,
  barometer: false,
  pedometer: false,
};

export default function HomeScreen() {
  const [logging, setLogging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sensorStates, setSensorStates] = useState<SensorState>(initialSensorStates);
  const [availableSensors, setAvailableSensors] = useState<SensorState>(initialSensorStates);

  const cardColor = useThemeColor({ light: "#FFFFFF", dark: "#2C2C2E" });
  const separatorColor = useThemeColor({ light: "#C6C6C8", dark: "#38383A" });
  const textColor = useThemeColor({ light: "#000000", dark: "#FFFFFF" });

  const toggleSensor = (sensor: keyof SensorState) => {
    setSensorStates((prev) => ({ ...prev, [sensor]: !prev[sensor] }));
  };

  useEffect(() => {
    async function callDetectSensors() {
      const sensors = await detectSensors();
      setAvailableSensors(sensors);
      setSensorStates(sensors);
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
      </ThemedView>

      <View style={[styles.sensorContainer, { backgroundColor: cardColor }]}>
        <ThemedText type="defaultSemiBold" style={styles.sensorHeaderText}>
          Available Sensors
        </ThemedText>
        {Object.keys(sensorStates).map((sensor, index) => (
          <View key={sensor}>
            <View style={styles.sensorToggle}>
              <ThemedText style={{ color: textColor }}>
                {sensor === "gps"
                  ? sensor.toUpperCase()
                  : sensor.charAt(0).toUpperCase() + sensor.slice(1)}
              </ThemedText>
              <ThemedSwitch
                onValueChange={() => toggleSensor(sensor as keyof SensorState)}
                value={sensorStates[sensor as keyof SensorState]}
                disabled={!availableSensors[sensor as keyof SensorState]}
              />
            </View>
            {index < Object.keys(sensorStates).length - 1 && (
              <View style={[styles.separator, { backgroundColor: separatorColor }]} />
            )}
          </View>
        ))}
      </View>

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
  sensorContainer: {
    borderRadius: 10,
    overflow: "hidden",
  },
  sensorHeaderText: {
    fontSize: 20,
    fontWeight: "600",
    padding: 16,
    paddingBottom: 8,
  },
  sensorToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
