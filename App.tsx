import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Platform, Alert, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';

import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import { RootStackParamList, RootTabParamList } from './src/utils/navigation';
import './src/style/global.css';
import { MainScaffold } from '~/components/layout/MainScaffold';
import { useLoggedIn } from './src/store/useLoggedIn';
import { usePropertyUpload } from './src/store/usePropertyUpload';
import { usePropertyEdit } from './src/store/usePropertyEdit';
import AuthScreen from './src/screens/auth/AuthScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AdminReportsScreen from './src/screens/AdminReportsScreen';
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
import PropertyDetailsScreen from './src/screens/renter/PropertyDetailsScreen';
import AddPropertyScreen from './src/screens/owner/AddPropertyScreen';
import ManagePropertiesScreen from './src/screens/owner/ManagePropertiesScreen';
import ViewReviewsScreen from './src/screens/owner/ViewReviewsScreen';
import ApplicationsListScreen from './src/screens/owner/ApplicationsListScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import ErrorBoundary from './src/components/ErrorBoundary';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// refer to https://reactnavigation.org/docs/bottom-tab-navigator?config=static for styling tabs and tab states

function MainApp() {
  const { userRole } = useLoggedIn();
  const { isUploading } = usePropertyUpload();
  const { isEditing, cancelEdit } = usePropertyEdit();

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
          tabBarLabel: isEditing ? 'Edit' : 'Add',
          tabBarIcon: ({ focused, color, size }) =>
            isUploading ? (
              <ActivityIndicator size={size} color={color} />
            ) : isEditing ? (
              <Ionicons name={focused ? 'create' : 'create-outline'} size={size} color={color} />
            ) : (
              <Ionicons
                name={focused ? 'add-circle' : 'add-circle-outline'}
                size={size}
                color={color}
              />
            ),
        }}
        listeners={{
          tabPress: (e) => {
            if (isUploading) {
              e.preventDefault();
              Alert.alert(
                'Upload in Progress',
                'Please wait for the current property to finish uploading.'
              );
            }
          },
          blur: () => {
            // Reset edit state when navigating away from AddProperty tab
            if (isEditing) {
              cancelEdit();
            }
          },
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
        key="AdminReports"
        name="AdminReports"
        component={AdminReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'shield-checkmark-outline' : 'shield-checkmark-outline'}
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
  const [initialRoute, setInitialRoute] = useState<'Introduction' | 'Auth' | 'Home'>(
    'Introduction'
  );
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [navigationError, setNavigationError] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Check device-specific flag first
        const deviceOnboarded = await AsyncStorage.getItem('DeviceOnboarded');
        if (deviceOnboarded === 'true') {
          // Device has seen onboarding before, go to Auth
          console.log('[App] Device onboarded, setting initialRoute to Auth');
          setInitialRoute('Auth');
        } else {
          // First time on this device, show Introduction
          console.log('[App] First time device, setting initialRoute to Introduction');
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
      console.log('[App] User not logged in, checking onboarding');
      checkOnboarding();
    } else {
      console.log('[App] User logged in, setting initialRoute to Home');
      setInitialRoute('Home');
      setIsCheckingOnboarding(false);
    }
  }, [isLoggedIn]);

  if (isCheckingOnboarding) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="rgb(100, 74, 64)" />
        <Text className="mt-4 text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  // Handle navigation errors gracefully
  if (navigationError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="mb-4 text-xl font-bold text-destructive">Navigation Error</Text>
        <Text className="mb-6 text-center text-muted-foreground">{navigationError}</Text>
        <TouchableOpacity
          onPress={() => setNavigationError(null)}
          className="rounded-lg bg-primary px-6 py-3">
          <Text className="font-semibold text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Determine the correct initial route based on login state
  const getInitialRouteName = (): keyof RootStackParamList => {
    console.log('[App] getInitialRouteName called:', { isLoggedIn, initialRoute });
    if (isLoggedIn) {
      return 'Home';
    }
    // When logged out, ensure we return a valid route from the logged-out screens
    // The initialRoute should be 'Introduction' or 'Auth' based on onboarding status
    if (initialRoute === 'Home') {
      // If somehow initialRoute is 'Home' but we're logged out, go to Auth
      return 'Auth';
    }
    return initialRoute as keyof RootStackParamList;
  };

  console.log('[App] Current state:', {
    isLoggedIn,
    initialRoute,
    routeName: getInitialRouteName(),
    isCheckingOnboarding,
  });

  return (
    <ErrorBoundary>
      <MainScaffold>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer
            key={isLoggedIn ? 'logged-in' : 'logged-out'}
            onStateChange={() => {
              // Clear navigation errors when state changes successfully
              if (navigationError) {
                setNavigationError(null);
              }
            }}
            onUnhandledAction={(action) => {
              console.warn('[Navigation] Unhandled action:', action);
              setNavigationError(
                `Navigation error: Could not perform action "${action.type}". Please try again.`
              );
            }}>
            <Stack.Navigator
              initialRouteName={getInitialRouteName()}
              screenOptions={{ headerShown: false }}>
              {isLoggedIn ? (
                <>
                  <Stack.Screen name="Home" component={MainApp} />
                  <Stack.Screen name="Preferences" component={PreferencesScreen} />
                  <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
                  <Stack.Screen name="ApplicationsList" component={ApplicationsListScreen} />
                </>
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
        </GestureHandlerRootView>
      </MainScaffold>
    </ErrorBoundary>
  );
}
