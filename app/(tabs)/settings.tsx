import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cleanLogFile, shareLogFile } from "@/lib/main";
import ParallaxScrollView from "@/components/ParallaxScrollView";

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
        <View style={[styles.separator, { backgroundColor: themeColors.separator }]} />
      )}
    </TouchableOpacity>
  );
};

const TabTwoScreen: React.FC = () => {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? "light"];

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
      <View style={{ ...styles.listContainer, backgroundColor: themeColors.listBackground }}>
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
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create<Styles>({
  headerImage: {
    bottom: -90,
    left: -50,
    position: "absolute",
  },
  listContainer: {
    borderRadius: 10,
    marginHorizontal: 16,
    overflow: "hidden",
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
  separator: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.6,
    height: StyleSheet.hairlineWidth,
  },
});

interface Styles {
  headerImage: ViewStyle;
  listContainer: ViewStyle;
  settingButton: ViewStyle;
  iconContainer: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  description: TextStyle;
  separator: ViewStyle;
}

export default TabTwoScreen;
