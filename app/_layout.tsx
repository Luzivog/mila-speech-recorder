import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { AppProvider } from "../contexts/AppContext";

export default function RootLayout() {
  return (
    <AppProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#007AFF',
            tabBarInactiveTintColor: '#8E8E93',
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              href: null, // Hide from tab bar
            }}
          />
          <Tabs.Screen
            name="record"
            options={{
              title: "Record",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="mic" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="text"
            options={{
              title: "Text",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="document-text" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="history"
            options={{
              title: "History",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="time" color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Dashboard",
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bar-chart" color={color} size={size} />
              ),
            }}
          />
        </Tabs>
    </AppProvider>
  );
}
