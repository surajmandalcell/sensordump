import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { cleanLogFile, shareLogFile } from "@/lib/services/main";

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={<Ionicons size={220} name="settings-outline" style={styles.headerImage} />}
    >
      <TouchableOpacity
        style={{ ...styles.fullWidthButton, backgroundColor: "#30d158" }}
        onPress={shareLogFile}
      >
        <Text style={styles.fullWidthButtonText}>Export File</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ ...styles.fullWidthButton, backgroundColor: "#ff453a" }}
        onPress={cleanLogFile}
      >
        <Text style={styles.fullWidthButtonText}>Clear File Contents</Text>
      </TouchableOpacity>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -50,
    position: "absolute",
  },
  fullWidthButton: {
    alignItems: "center",
    backgroundColor: "#007AFF", // iOS blue color for start
    paddingVertical: 9,
    marginTop: 8,
    borderRadius: 3,
  },
  fullWidthButtonText: {
    color: "white",
    fontSize: 18,
  },
});
