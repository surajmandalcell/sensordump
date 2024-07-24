// ThemedHorizontalLine.tsx
import React from "react";
import { useColorScheme, View, ViewStyle } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor"; // Adjust the path as necessary

const ThemedHorizontalLine = ({ style }: { style?: ViewStyle }) => {
  const theme = useColorScheme() ?? "light";
  const lineColor = useThemeColor({ light: "#ECECEC", dark: "#505050" });

  return (
    <View
      style={{
        borderBottomColor: lineColor,
        opacity: theme === "dark" ? 0.5 : 1,
        borderBottomWidth: 1,
        alignSelf: "center",
        width: "100%",
        marginVertical: 10,
        ...style,
      }}
    />
  );
};

export default ThemedHorizontalLine;
