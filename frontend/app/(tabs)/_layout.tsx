import { Tabs } from 'expo-router';
import { Chrome as Home, Search, Bell, Calendar, HomeIcon } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          height: Platform.OS === 'ios' ? 85 : 70,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color, size }) => <Home size={size} {...{color} as any} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: '通知',
          tabBarIcon: ({ color, size }) => <Bell size={size} {...{color} as any} />,
        }}
      />
      <Tabs.Screen
        name="scheduled"
        options={{
          title: '予約投稿',
          tabBarIcon: ({ color, size }) => <Calendar size={size} {...{color} as any} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: '検索',
          tabBarIcon: ({ color, size }) => <Search size={size} {...{color} as any} />,
        }}
      />
    </Tabs>
  );
}