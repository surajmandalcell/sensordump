import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export function ThemedSwitch({
  value,
  onValueChange,
  disabled = false,
  style,
}: ThemedSwitchProps) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  const trackColorOn = "#34C759"; // iOS green color
  const trackColorOff = useThemeColor({ light: "#E9E9EA", dark: "#39393D" })!;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 300,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const moveToggle = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 16],
  });

  const bgColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [trackColorOff, trackColorOn],
  });

  return (
    <TouchableOpacity
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.toggleContainer,
          { backgroundColor: bgColor },
          disabled && styles.disabledTrack,
          style,
        ]}
      >
        <Animated.View
          style={[
            styles.toggleWheel,
            { marginLeft: moveToggle },
            disabled && styles.disabledWheel,
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggleContainer: {
    width: 41,
    height: 25,
    borderRadius: 12.5,
    padding: 1.6,
  },
  toggleWheel: {
    width: 22,
    height: 22,
    backgroundColor: "white",
    borderRadius: 11,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1.6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1.2,
  },
  disabledTrack: {
    opacity: 0.5,
  },
  disabledWheel: {
    backgroundColor: "#f4f3f4",
  },
});
