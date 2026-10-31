import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { TopTabs } from 'expo-router/js-top-tabs';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <TopTabs
      screenOptions={{
        swipeEnabled: true,
        tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#0a7ea4',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#181a20' : '#fff',
        },
        tabBarShowIcon: true,
      }}
    >
      <TopTabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color as string} />,
        }}
      />
      <TopTabs.Screen
        name="crypto-list"
        options={{
          title: 'Crypto List',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="coins" size={24} color={color} />
          ),
        }}
      />
    </TopTabs>
  );
}
