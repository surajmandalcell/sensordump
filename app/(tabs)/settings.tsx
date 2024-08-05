import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cleanLogFile, detectSensors, SensorState, shareLogFile } from "@/lib/main";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedSwitch } from "@/components/ThemedSwitch";
import { ThemedText } from "@/components/ThemedText";
import Styles from "@/constants/Styles";
import { initialSensorStates } from "@/constants/Common";
import { useThemeColor } from "@/hooks/useThemeColor";

// Define color schemes
const Colors = {
  light: {
    background: "#F2F2F7",
    text: "#000000",
    subText: "#8E8E93",
    listBackground: "#f1f1f1",
    separator: "#C6C6C8",
  },
  dark: {
    background: "#1C1C1E",
    text: "#FFFFFF",
    subText: "#8E8E93",
    listBackground: "#2C2C2E",
    separator: "#38383A",
  },
};

const TabTwoScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];
  const [sensorStates, setSensorStates] = useState<SensorState>(initialSensorStates);
  const [availableSensors, setAvailableSensors] = useState<SensorState>(initialSensorStates);

  const cardColor = useThemeColor({ light: "#f3f3f3", dark: "#2C2C2E" });
  const separatorColor = useThemeColor({ light: "#C6C6C8", dark: "#38383A" });
  const textColor = useThemeColor({ light: "#000000", dark: "#FFFFFF" });

  const toggleSensor = (sensor: keyof SensorState) => {
    setSensorStates((prev) => ({ ...prev, [sensor]: !prev[sensor] }));
  };

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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Ionicons
          size={220}
          name="settings-outline"
          style={[styles.headerImage, { color: themeColors.subText }]}
        />
      }
    >
      <View style={{ ...styles.container, backgroundColor: themeColors.listBackground }}>
        <SettingItem
          icon="cloud-upload-outline"
          title="Export File"
          description="Share your log file"
          onPress={shareLogFile}
          color="#30d158"
        />
        <SettingItem
          icon="trash-outline"
          title="Clear File Contents"
          description="Delete all log data"
          onPress={cleanLogFile}
          color="#ff453a"
          isLast
        />
      </View>
      
      <View style={[styles.container, { backgroundColor: cardColor }]}>
        <ThemedText type="default" style={styles.sensorHeaderText}>
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
              <View style={[Styles.separator, { backgroundColor: separatorColor }]} />
            )}
          </View>
        ))}
      </View>
    </ParallaxScrollView>
  );
};

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  color: string;
  isLast?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  onPress,
  color,
  isLast = false,
}) => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

  return (
    <TouchableOpacity onPress={onPress} style={styles.settingButton}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
        <Text style={[styles.description, { color: themeColors.subText }]}>
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
      {!isLast && (
        <View style={[Styles.separator, { backgroundColor: themeColors.separator }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -50,
    position: "absolute",
  },
  container: {
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 12,
    marginHorizontal: 16,
  },
  settingButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    marginRight: 16,
    padding: 8,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "400",
  },
  description: {
    fontSize: 14,
    marginTop: 2,
  },
  sensorHeaderText: {
    fontSize: 18,
    fontWeight: "500",
    padding: 14,
    paddingBottom: 8,
  },
  sensorToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});

export default TabTwoScreen;
