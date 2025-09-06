import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { RootTabParamList } from './src/types/navigation';
import './src/style/global.css';
import { MainScaffold } from '~/components/layout/MainScaffold';
import { useLoggedIn } from './src/store/useLoggedIn';
import AuthScreen from './src/screens/AuthScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

// refer to https://reactnavigation.org/docs/bottom-tab-navigator?config=static for styling tabs and tab states

export default function App() {
  const { isLoggedIn, authView } = useLoggedIn();

  return (
    <MainScaffold>
      {isLoggedIn ? (
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
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons 
                    name={focused ? "home" : "home-outline"} 
                    size={size} 
                    color={color} 
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Search"
              component={SearchScreen}
              options={{
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons 
                    name={focused ? "search" : "search-outline"} 
                    size={size} 
                    color={color} 
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons 
                    name={focused ? "person" : "person-outline"} 
                    size={size} 
                    color={color} 
                  />
                ),
              }}
            />
            <Tab.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons 
                    name={focused ? "notifications" : "notifications-outline"} 
                    size={size} 
                    color={color} 
                  />
                ),
                tabBarBadge: 1,
              }}
            />
            <Tab.Screen
              name="Admin"
              component={AdminDashboardScreen}
              options={{
                tabBarIcon: ({ focused, color, size }) => (
                  <Ionicons 
                    name={focused ? "settings" : "settings-outline"} 
                    size={size} 
                    color={color} 
                  />
                ),
              }}
            />
          </Tab.Navigator>
          <StatusBar style="auto" />
        </NavigationContainer>
      ) : (
        <>
          {authView === 'login' ? <AuthScreen /> : <RegisterScreen />}
          <StatusBar style="auto" />
        </>
      )}
    </MainScaffold>
  );
}
