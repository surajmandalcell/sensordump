import { Switch, type SwitchProps, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedSwitchProps = SwitchProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedSwitch({ style, ...rest }: ThemedSwitchProps) {
  const thumbColor = useThemeColor({ light: "#FFFFFF", dark: "#FFFFFF" });
  const trackColorOn = useThemeColor({ light: "#4CD964", dark: "#4CD964" });
  const trackColorOff = useThemeColor({ light: "#E5E5EA", dark: "#999999" });

  return (
    <Switch
      thumbColor={thumbColor}
      trackColor={{ false: trackColorOff, true: trackColorOn }}
      style={[styles.switch, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
});
