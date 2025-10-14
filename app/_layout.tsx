import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { FileText, History, Mic, UserCircle } from 'lucide-react-native';
import { useEffect } from "react";
import { AppProvider } from "../contexts/AppContext";

SplashScreen.preventAutoHideAsync().catch(() => null);

export default function RootLayout() {

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => null);
  }, []);

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
              <Mic color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="text"
          options={{
            title: "Text",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FileText color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <History color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <UserCircle color={color} size={size} />
            ),
          }}
        />
      </Tabs>
    </AppProvider>
  );
}
