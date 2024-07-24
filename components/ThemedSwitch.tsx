import { Switch, type SwitchProps, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedSwitchProps = SwitchProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedSwitch({ style, disabled, ...rest }: ThemedSwitchProps) {
  const thumbColor = useThemeColor({
    light: disabled ? "#B3B3B3" : "#FFFFFF",
    dark: disabled ? "#B3B3B3" : "#FFFFFF",
  });
  const trackColorOn = useThemeColor({
    light: disabled ? "#E5E5EA" : "#4CD964",
    dark: disabled ? "#999999" : "#4CD964",
  });
  const trackColorOff = useThemeColor({ light: "#E5E5EA", dark: "#999999" });

  return (
    <Switch
      thumbColor={thumbColor}
      trackColor={{ false: trackColorOff, true: trackColorOn }}
      disabled={disabled}
      style={[styles.switch, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  switch: {},
});
