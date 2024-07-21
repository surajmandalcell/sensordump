import { Image, StyleSheet, Platform, View, Switch } from "react-native";
import { HelloWave } from "@/components/IconWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";

export default function HomeScreen() {
  const sensor_states = {
    gps: false,
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
    ambientlight: false,
    proximity: false,
    barometer: false,
  };

  const [logging, setLogging] = useState(false);
  const [sensorStates, setSensorStates] =
    useState<typeof sensor_states>(sensor_states);

  const toggleSensor = (sensor: keyof typeof sensor_states) => {
    setSensorStates((prev) => ({ ...prev, [sensor]: !prev[sensor] }));
  };

  return (
    <ParallaxScrollView extra_padding>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">SensorDump</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="medium">
          Step 1: Select the sensors you want to log
        </ThemedText>
        <ThemedText type="medium">
          Step 2: Click on the "Start Logging" button
        </ThemedText>
      </ThemedView>
      <View style={styles.loggingButton}>
        <View style={styles.logingButton_textWithLabel}>
          <ThemedText>Start Logging</ThemedText>
          <Ionicons
            name="cloud-upload-outline"
            size={18}
            color={logging ? "green" : "grey"}
          />
        </View>
        <Switch onValueChange={() => setLogging(!logging)} value={logging} />
      </View>
      <View style={styles.horizontalLine} />
      <View style={styles.sensorContainer}>
        <ThemedText type="defaultSemiBold">Available Sensors</ThemedText>
        {Object.keys(sensorStates).map((sensor) => (
          <View key={sensor} style={styles.sensorToggle}>
            <ThemedText>
              {sensor === "gps"
                ? sensor.toUpperCase()
                : sensor.charAt(0).toUpperCase() + sensor.slice(1)}
            </ThemedText>
            <Switch
              onValueChange={() =>
                toggleSensor(sensor as keyof typeof sensor_states)
              }
              value={sensorStates[sensor as keyof typeof sensor_states]}
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
  loggingButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    marginTop: 20,
  },
  logingButton_textWithLabel: {
    gap: 10,
    flexDirection: "row",
    alignItems: "center",
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
    borderBottomColor: "#ececec", // Choose color that fits your design
    borderBottomWidth: 1,
    alignSelf: "center",
    marginVertical: 0, // Adjust spacing to your liking
    width: "60%", // Adjust width as needed
  },
});
