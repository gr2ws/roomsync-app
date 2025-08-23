import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { RootTabParamList } from './src/types/navigation';
import './src/style/global.css';
import { MainScaffold } from '~/components/layout/MainScaffold';

const Tab = createBottomTabNavigator<RootTabParamList>();

// refer to https://reactnavigation.org/docs/bottom-tab-navigator?config=static for styling tabs and tab states

export default function App() {
  return (
    <MainScaffold>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarStyle: {
              height: 50,
              paddingBottom: 8,
              paddingTop: 8,
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#e5e7eb',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.05,
              shadowRadius: 0.5,
              elevation: 1,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: 400,
              marginTop: 2,
            },
          }}>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarIcon: () => <Text className="text-3xl">🏠</Text>,
            }}
          />
          <Tab.Screen
            name="Search"
            component={SearchScreen}
            options={{
              tabBarIcon: () => <Text className="text-3xl">🔍</Text>,
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarIcon: () => <Text className="text-3xl">👤</Text>,
            }}
          />
          <Tab.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{
              tabBarIcon: () => <Text className="text-3xl">🔔</Text>,
              tabBarBadge: 1,
            }}
          />
        </Tab.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </MainScaffold>
  );
}
