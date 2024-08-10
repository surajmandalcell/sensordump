import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet, useColorScheme, ViewStyle } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

import { ThemedView } from "@/components/ThemedView";

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  extra_padding?: boolean;
  headerImage?: ReactElement;
  headerBackgroundColor?: { dark: string; light: string };
  container_style?: ViewStyle;
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  extra_padding = false,
  headerBackgroundColor,
  container_style,
}: Props) {
  const colorScheme = useColorScheme() ?? "light";
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={{ ...styles.container, ...container_style }}>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        {headerImage && headerBackgroundColor && (
          <Animated.View
            style={[
              styles.header,
              { backgroundColor: headerBackgroundColor[colorScheme] },
              headerAnimatedStyle,
            ]}
          >
            {headerImage}
          </Animated.View>
        )}
        <ThemedView style={[styles.content, extra_padding && styles.content_60]}>
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 140,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    gap: 16,
    overflow: "hidden",
    padding: 32,
    paddingTop: 10,
    paddingBottom: 100,
    paddingHorizontal: 10,
  },
  content_60: {
    paddingTop: 70,
  },
});
