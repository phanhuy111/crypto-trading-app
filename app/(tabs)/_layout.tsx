import { Tabs } from "expo-router";
import { BarChart3, Clock, Settings } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/colors";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.button.primary,
                tabBarInactiveTintColor: Colors.text.secondary,
                tabBarStyle: {
                    backgroundColor: Colors.background.primary,
                    borderTopColor: Colors.border,
                },
                headerStyle: {
                    backgroundColor: Colors.background.primary,
                },
                headerTintColor: Colors.text.primary,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Trading",
                    tabBarIcon: ({ color }) => <BarChart3 size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "History",
                    tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
