// Fix axios FormData issue - must be imported first
import './axios-fix';

import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

import DashboardScreen from './screens/DashboardScreen';
import MessagesScreen from './screens/MessagesScreen';
import CalendarScreen from './screens/CalendarScreen';
import FriendsScreen from './screens/FriendsScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import MyTasksScreen from './screens/MyTasksScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  const { theme } = useTheme();
  
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
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: theme.colors.secondary,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}>
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
  const { authState, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {authState?.token ? (
        // User is logged in
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          <Stack.Screen name="MyTasks" component={MyTasksScreen} />
          <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
        </>
      ) : (
        // User is not logged in
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

function AppWithProviders() {
  const { theme } = useTheme();
  
  return (
    <NavigationContainer theme={{
      dark: theme.dark,
      colors: {
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.onSurface,
        border: theme.colors.outline,
        notification: theme.colors.error,
      },
    }}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PaperProvider>
        <AppWithProviders />
      </PaperProvider>
    </ThemeProvider>
  );
}

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};

