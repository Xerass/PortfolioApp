// app/(tabs)/_layout.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { supabase } from '@/lib/supabase';

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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const uid = session?.user?.id;
        if (!uid) return setIsAdmin(false);

        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', uid)
          .limit(1)
          .single();
        if (error) throw error;
        if (!mounted) return;
        setIsAdmin(data?.role === 'admin');
      } catch (e) {
        console.log('role check failed', e);
        if (mounted) setIsAdmin(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
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

      {/* Keep existing dev/playground screen (two.tsx) but label it Tools */}
      <Tabs.Screen
        name="two"
        options={{
          title: 'Tools',
          tabBarIcon: ({ color }) => <TabBarIcon name="wrench" color={color} />,
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
        name="contacts"
        options={{
          title: 'Contacts',
          tabBarIcon: ({ color }) => <TabBarIcon name="envelope" color={color} />,
        }}
      />

      {/* Admin-only: Post page for creating projects */}
      {isAdmin && (
        <Tabs.Screen
          name="post"
          options={{
            title: 'Post',
            tabBarIcon: ({ color }) => <TabBarIcon name="plus-circle" color={color} />,
          }}
        />
      )}
      {/* edit route is now top-level (app/edit/[id].tsx) so it is not part of the tab bar */}
    </Tabs>
  );
}
