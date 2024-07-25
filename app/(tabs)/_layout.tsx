import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { BlurView } from "expo-blur";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          position: "absolute",
        },
        tabBarBackground: () => (
          <BlurView
            style={{
              ...StyleSheet.absoluteFillObject,
              backgroundColor:
                colorScheme === "light" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 1)",
              overflow: "hidden",
              zIndex: 1,
            }}
            intensity={80}
            experimentalBlurMethod="dimezisBlurView"
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerTitle: "  Sensor Dump",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? "home-sharp" : "home-outline"} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: " Settings",
          headerStyle: {
            backgroundColor: colorScheme === "light" ? "#D0D0D0" : "#353636",
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "settings-sharp" : "settings-outline"}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
