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
import FeedScreen from './src/screens/renter/FeedScreen';
import ApplicationsScreen from './src/screens/renter/ApplicationsScreen';
import ChatScreen from './src/screens/renter/ChatScreen';
import AddPropertyScreen from './src/screens/owner/AddPropertyScreen';
import ManagePropertiesScreen from './src/screens/owner/ManagePropertiesScreen';
import ViewReviewsScreen from './src/screens/owner/ViewReviewsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// refer to https://reactnavigation.org/docs/bottom-tab-navigator?config=static for styling tabs and tab states

function MainApp() {
  const { userRole } = useLoggedIn();

  const commonScreenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarShowLabel: true,
    tabBarStyle: {
      height: 50, // Fixed height to prevent cut-off
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
        key="Admin"
        name="Admin"
        component={AdminDashboardScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
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
      initialRouteName={userRole === 'owner' ? 'ManageProperties' : 'Feed'}
      safeAreaInsets={{ bottom: Platform.OS === 'android' ? 35 : 0 }}
      screenOptions={commonScreenOptions}>
      {tabScreens}
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
