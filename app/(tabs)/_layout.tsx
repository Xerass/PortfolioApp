// app/(tabs)/_layout.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import FontAwesome from '@expo/vector-icons/FontAwesome';

const BG = '#0B1220';
const SURFACE = '#111A2C';
const ACCENT = '#6FB3FF';
const MUTED = '#8A99B5';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        // Screen background (prevents white peeking during transitions)
        sceneStyle: { backgroundColor: BG },

        // Tab icon/label colors
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: MUTED,

        // Label style (JetBrains Mono if you loaded it)
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'JetBrainsMono-Regular',
        },

        // Floating, muted, dark bar
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          left: 20,
          right: 20,
          height: 58,
          paddingBottom: 6,
          backgroundColor: 'rgba(17,26,44,0.85)', // semi-transparent SURFACE
          borderTopWidth: 0,
          borderRadius: 18,
          elevation: 8, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
        },

        // Soft frosted effect under the bar
        tabBarBackground: () => (
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <TabBarIcon name="folder" color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          tabBarIcon: ({ color }) => <TabBarIcon name="envelope" color={color} />,
        }}
      />
    </Tabs>
  );
}
