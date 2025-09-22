import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SearchScreen from './src/screens/SearchScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { RootStackParamList, RootTabParamList } from './src/types/navigation';
import './src/style/global.css';
import { MainScaffold } from '~/components/layout/MainScaffold';
import { useLoggedIn } from './src/store/useLoggedIn';
import AuthScreen from './src/screens/auth/AuthScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IntroductionScreen from './src/screens/auth/IntroductionScreen';
import RoleSelectionScreen from './src/screens/auth/RoleSelectionScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// refer to https://reactnavigation.org/docs/bottom-tab-navigator?config=static for styling tabs and tab states

function MainApp() {
  const { userRole } = useLoggedIn();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      safeAreaInsets={{ bottom: Platform.OS === 'android' ? 35 : 0 }}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: '5.5%',
          backgroundColor: '#fff',
          borderTopWidth: 1,
          paddingTop: 2,
          borderTopColor: '#e5e7eb',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.05,
          shadowRadius: 0.5,
          elevation: 1,
        },
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '400',
          marginTop: 2,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarBadge: 1,
        }}
      />
      {userRole === 'admin' && (
        <Tab.Screen
          name="Admin"
          component={AdminDashboardScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'settings' : 'settings-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function App() {
  const { isLoggedIn } = useLoggedIn();

  return (
    <MainScaffold>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Introduction" screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="Home" component={MainApp} />
          ) : (
            <>
              <Stack.Screen name="Introduction" component={IntroductionScreen} />
              <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
              <Stack.Screen name="Auth" component={AuthScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </MainScaffold>
  );
}
