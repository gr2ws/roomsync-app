import { NavigationContainer } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { RootStackParamList, RootTabParamList } from './src/utils/navigation';
import './src/style/global.css';
import { MainScaffold } from '~/components/layout/MainScaffold';
import { useLoggedIn } from './src/store/useLoggedIn';
import AuthScreen from './src/screens/auth/AuthScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminAnalyticsScreen from './src/screens/AdminAnalyticsScreen';
import AdminUserManagementScreen from './src/screens/AdminUserManagementScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IntroductionScreen from './src/screens/auth/IntroductionScreen';
import RoleSelectionScreen from './src/screens/auth/RoleSelectionScreen';
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import DetailsScreen from './src/screens/auth/DetailsScreen';
import PreferencesScreen from './src/screens/auth/PreferencesScreen';
import FeedScreen from './src/screens/renter/FeedScreen';
import ApplicationsScreen from './src/screens/renter/ApplicationsScreen';
import ChatScreen from './src/screens/renter/ChatScreen';
import AddPropertyScreen from './src/screens/owner/AddPropertyScreen';
import ManagePropertiesScreen from './src/screens/owner/ManagePropertiesScreen';
import ViewReviewsScreen from './src/screens/owner/ViewReviewsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// refer to https://reactnavigation.org/docs/bottom-tab-navigator?config=static for styling tabs and tab states

function MainApp() {
  const { userRole } = useLoggedIn();

  const commonScreenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarShowLabel: true,
    tabBarStyle: {
      height: '7.7%', // Increased from 50 for better spacing
      backgroundColor: 'rgb(250, 244, 235)', // secondary
      borderTopWidth: 1,
      paddingTop: 2, // Increased from 2
      paddingBottom: 10, // Added bottom padding
      borderTopColor: 'rgb(100, 74, 64)', // primary
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: 0.05,
      shadowRadius: 0.5,
      elevation: 1,
    },
    tabBarAllowFontScaling: false,
    tabBarActiveTintColor: 'rgb(100, 74, 64)', // primary - active icon/text
    tabBarInactiveTintColor: 'rgba(100, 74, 64, 0.5)', // primary with 50% opacity - inactive
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: '400',
      marginTop: 2,
      marginBottom: 2, // Added for better spacing
    },
  };

  const notificationsScreen = (
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
  );

  const profileScreen = (
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
        ),
      }}
    />
  );

  // Tab logic: explicit for each role, always include admin tab for admin
  let tabScreens = [];
  if (userRole === 'renter') {
    tabScreens = [
      <Tab.Screen
        key="Feed"
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }}
      />,
      <Tab.Screen
        key="Applications"
        name="Applications"
        component={ApplicationsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />,
      <Tab.Screen
        key="Chat"
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />,
      notificationsScreen,
      profileScreen,
    ];
  } else if (userRole === 'owner') {
    tabScreens = [
      <Tab.Screen
        key="AddProperty"
        name="AddProperty"
        component={AddPropertyScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />,
      <Tab.Screen
        key="ManageProperties"
        name="ManageProperties"
        component={ManagePropertiesScreen}
        options={{
          tabBarLabel: 'Manage',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'file-tray-full' : 'file-tray-full-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />,
      <Tab.Screen
        key="ViewReviews"
        name="ViewReviews"
        component={ViewReviewsScreen}
        options={{
          tabBarLabel: 'Reviews',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'star' : 'star-outline'} size={size} color={color} />
          ),
        }}
      />,
      notificationsScreen,
      profileScreen,
    ];
  } else if (userRole === 'admin') {
    tabScreens = [
      <Tab.Screen
        key="AdminDashboard"
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />
          ),
        }}
      />,
      <Tab.Screen
        key="AdminAnalytics"
        name="AdminAnalytics"
        component={AdminAnalyticsScreen}
        options={{
          tabBarLabel: 'Analytics',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />,
      <Tab.Screen
        key="AdminUsers"
        name="AdminUsers"
        component={AdminUserManagementScreen}
        options={{
          tabBarLabel: 'User Management',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
          ),
        }}
      />,
      <Tab.Screen
        key="AdminProfile"
        name="AdminProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Admin Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />,
    ];
  } else {
    // fallback for unknown role
    tabScreens = [
      <Tab.Screen
        key="Feed"
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'list' : 'list-outline'} size={size} color={color} />
          ),
        }}
      />,
      notificationsScreen,
      profileScreen,
    ];
  }

  return (
    <Tab.Navigator
      initialRouteName={
        userRole === 'owner' ? 'ManageProperties' : userRole === 'admin' ? 'AdminDashboard' : 'Feed'
      }
      safeAreaInsets={{ bottom: Platform.OS === 'android' ? 35 : 0 }}
      screenOptions={commonScreenOptions}>
      {tabScreens}
    </Tab.Navigator>
  );
}

export default function App() {
  const { isLoggedIn } = useLoggedIn();
  const [initialRoute, setInitialRoute] = useState<'Introduction' | 'Auth'>('Introduction');
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Check if ANY user has completed onboarding on this device
        // This is used to determine if we should show Introduction or go straight to Auth
        const hasSeenIntro = await AsyncStorage.getItem('hasSeenIntroduction');
        if (hasSeenIntro === 'true') {
          setInitialRoute('Auth');
        } else {
          setInitialRoute('Introduction');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setInitialRoute('Introduction');
      } finally {
        setIsCheckingOnboarding(false);
      }
    };

    if (!isLoggedIn) {
      checkOnboarding();
    } else {
      setIsCheckingOnboarding(false);
    }
  }, [isLoggedIn]);

  if (isCheckingOnboarding && !isLoggedIn) {
    return null; // Or a loading screen
  }

  return (
    <MainScaffold>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="Home" component={MainApp} />
          ) : (
            <>
              <Stack.Screen
                name="Introduction"
                component={IntroductionScreen}
                options={{
                  animationTypeForReplace: 'pop',
                }}
              />
              <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
              <Stack.Screen
                name="Auth"
                component={AuthScreen}
                options={{
                  animation: 'slide_from_left',
                }}
              />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Details" component={DetailsScreen} />
              <Stack.Screen name="Preferences" component={PreferencesScreen} />
            </>
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </MainScaffold>
  );
}
