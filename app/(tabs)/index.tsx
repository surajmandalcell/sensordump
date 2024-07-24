import React, { useEffect, useState } from "react";
import { StyleSheet, View, Switch, TouchableOpacity, Text } from "react-native";

import {
  startLogging,
  stopLogging,
  handlePermissions,
  detectSensors,
} from "@/lib/services/main";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { HelloWave } from "@/components/IconWave";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ThemedSwitch } from "@/components/ThemedSwitch";
import ThemedHorizontalLine from "@/components/ThemedHorizontalLine";

export default function HomeScreen() {
  const sensor_states = {
    gps: undefined,
    accelerometer: undefined,
    gyroscope: undefined,
    magnetometer: undefined,
    light: undefined,
    barometer: undefined,
    pedometer: undefined,
  };

  const [logging, setLogging] = useState(false);
  const [sensorStates, setSensorStates] = useState<typeof sensor_states>(sensor_states);

  const toggleSensor = (sensor: keyof typeof sensor_states) => {
    setSensorStates((prev) => ({ ...prev, [sensor]: !prev[sensor] }));
  };

  useEffect(() => {
    async function callDetectSensors() {
      const sensors = await detectSensors();
      setSensorStates({ ...sensor_states, ...sensors });
    }
    callDetectSensors();
  }, []);

  useEffect(() => {
    async function requestPermissions() {
      await handlePermissions(); // Ensure permissions are requested at start
    }
    requestPermissions();
  }, []);

  const handleLogging = () => {
    setLogging(!logging);
    if (!logging) {
      startLogging(); // Start logging sensor data
    } else {
      stopLogging(); // Stop logging sensor data
    }
  };

  return (
    <ParallaxScrollView container_style={{ paddingHorizontal: 14 }}>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="medium">Step 1: Select the sensors you want to log</ThemedText>
        <ThemedText type="medium">Step 2: Click on the "Start Logging" button</ThemedText>
      </ThemedView>
      <TouchableOpacity
        style={[styles.fullWidthButton, logging ? styles.stopLoggingButton : null]}
        onPress={handleLogging}
      >
        <Text style={styles.fullWidthButtonText}>
          {logging ? "Stop Logging" : "Start Logging"}
        </Text>
      </TouchableOpacity>

      <ThemedHorizontalLine />

      <View style={styles.sensorContainer}>
        <ThemedText type="defaultSemiBold">Available Sensors</ThemedText>
        {Object.keys(sensorStates).map((sensor) => (
          <View key={sensor} style={styles.sensorToggle}>
            <ThemedText>
              {sensor === "gps"
                ? sensor.toUpperCase()
                : sensor.charAt(0).toUpperCase() + sensor.slice(1)}
            </ThemedText>
            <ThemedSwitch
              onValueChange={() => toggleSensor(sensor as keyof typeof sensor_states)}
              value={sensorStates[sensor as keyof typeof sensor_states]}
              disabled={sensorStates[sensor as keyof typeof sensor_states] === undefined}
            />
          </View>
        ))}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#fefefe",
    bottom: 6,
    left: 8,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  fullWidthButton: {
    alignItems: "center",
    backgroundColor: "#007AFF", // iOS blue color for start
    paddingVertical: 10,
    marginTop: 20,
    borderRadius: 5,
  },
  fullWidthButtonText: {
    color: "white",
    fontSize: 18,
  },
  stopLoggingButton: {
    backgroundColor: "#D32F2F", // Elegant red color for stop
  },
  sensorContainer: {
    padding: 10,
    marginTop: 4,
  },
  sensorToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  horizontalLine: {
    borderBottomColor: "#ececec",
    opacity: 0.2,
    borderBottomWidth: 1,
    alignSelf: "center",
    width: "100%", // Adjust width as needed
    marginVertical: 10,
  },
});
