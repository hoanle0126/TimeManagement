// Fix axios FormData issue - must be imported first
import './axios-fix';

import React from 'react';
import { View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, ActivityIndicator, useTheme as usePaperTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { loadUser } from './store/slices/authSlice';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { createShadow } from './utils/shadow';
import socketService from './services/socket';

import DashboardScreen from './screens/DashboardScreen';
import MessagesScreen from './screens/MessagesScreen';
import CalendarScreen from './screens/CalendarScreen';
import FriendsScreen from './screens/FriendsScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import MyTasksScreen from './screens/MyTasksScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import SearchUsersScreen from './screens/SearchUsersScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const theme = usePaperTheme();
  
  const addButtonShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 4,
    opacity: 0.3,
    radius: 8,
    elevation: 8,
  });
  
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Message') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Add') {
            return (
              <View style={[
                {
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: theme.colors.secondary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 20,
                },
                addButtonShadow,
              ]}>
                <Ionicons name="add" size={32} color={theme.colors.onSecondary} />
              </View>
            );
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outline,
          backgroundColor: theme.colors.surface,
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Message" component={MessagesScreen} />
      <Tab.Screen 
        name="Add" 
        component={DashboardScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate('CreateTask');
          },
        })}
        options={{
          tabBarLabel: '',
        }}
      />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const dispatch = useAppDispatch();
  const { token, user, isLoading } = useAppSelector((state) => state.auth);
  const theme = usePaperTheme();

  React.useEffect(() => {
    // Load user khi app khởi động
    dispatch(loadUser());
  }, [dispatch]);

  // Kết nối socket khi user đăng nhập
  React.useEffect(() => {
    if (user && token) {
      // Kết nối socket với user info
      socketService.connect(user.id, {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }).catch((error) => {
        console.error('Failed to connect socket:', error);
      });
    } else {
      // Ngắt kết nối socket khi logout
      socketService.disconnect();
    }

    return () => {
      // Cleanup khi component unmount
      if (!user || !token) {
        socketService.disconnect();
      }
    };
  }, [user, token]);

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        // User is logged in
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="MyTasks" component={MyTasksScreen} />
          <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
          <Stack.Screen name="SearchUsers" component={SearchUsersScreen} />
        </>
      ) : (
        // User is not logged in
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

function AppWithProviders() {
  const { theme, isDark } = useTheme();
  
  return (
    <NavigationContainer theme={{
      dark: isDark,
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.onSurface,
        border: theme.colors.outline,
        notification: theme.colors.error,
      },
    }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppContent />
    </NavigationContainer>
  );
}

function AppWithPaperProvider() {
  const { theme } = useTheme();
  
  return (
    <PaperProvider theme={theme}>
      <AppWithProviders />
    </PaperProvider>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppWithPaperProvider />
      </ThemeProvider>
    </Provider>
  );
}


