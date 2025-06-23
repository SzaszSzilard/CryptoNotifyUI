import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import CryptoListScreen from './crypto-list';
import HomeScreen from './index';

const TopTabs = createMaterialTopTabNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <TopTabs.Navigator
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
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <TopTabs.Screen
        name="crypto-list"
        component={CryptoListScreen}
        options={{
          title: 'Crypto List',
          tabBarIcon: ({ color }) => (
            <FontAwesome6 name="coins" size={24} color={color} />
          ),
        }}
      />
    </TopTabs.Navigator>
  );
}
