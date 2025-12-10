import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import TodayTasksWidget from '../components/TodayTasksWidget';
import TaskProgressWidget from '../components/TaskProgressWidget';
import TaskTimelineWidget from '../components/TaskTimelineWidget';
import CalendarWidget from '../components/CalendarWidget';
import Header from '../components/Header';

export default function DashboardScreen({ navigation }) {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const handleMenuPress = (itemId) => {
    switch (itemId) {
      case 'profile':
        Alert.alert('Chi tiết người dùng', 'Mở màn hình chi tiết người dùng');
        // navigation.navigate('UserProfile');
        break;
      case 'settings':
        Alert.alert('Settings', 'Mở màn hình cài đặt');
        // navigation.navigate('Settings');
        break;
      case 'logout':
        Alert.alert(
          'Đăng xuất',
          'Bạn có chắc chắn muốn đăng xuất?',
          [
            { text: 'Hủy', style: 'cancel' },
            {
              text: 'Đăng xuất',
              style: 'destructive',
              onPress: async () => {
                await logout();
              },
            },
          ]
        );
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Header
            onMenuPress={handleMenuPress}
          />
          
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              isTablet && styles.scrollContentTablet,
              isDesktop && styles.scrollContentDesktop,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.greetingSection}>
                <Text
                  style={[
                    styles.greetingText,
                    isTablet && styles.greetingTextTablet,
                  ]}
                >
                  Start Your Day & Be Productive ✌️
                </Text>
                <View style={styles.teamAvatars}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View key={i} style={styles.avatar}>
                      <View style={styles.avatarDot} />
                    </View>
                  ))}
                  <Text style={styles.moreText}>10+</Text>
                </View>
              </View>

            <View
              style={[
                styles.widgetsContainer,
                isTablet && styles.widgetsContainerTablet,
                isDesktop && styles.widgetsContainerDesktop,
              ]}
            >
              <View
                style={[
                  styles.widgetColumn,
                  isTablet && styles.widgetColumnTablet,
                  isDesktop && styles.widgetColumnDesktop,
                ]}
              >
                <TodayTasksWidget navigation={navigation} />
                <TaskProgressWidget />
              </View>

              {isTablet && (
                <View
                  style={[
                    styles.widgetColumn,
                    isTablet && styles.widgetColumnTablet,
                    isDesktop && styles.widgetColumnDesktop,
                  ]}
                >
                  <CalendarWidget />
                  <TaskTimelineWidget />
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  scrollContentTablet: {
    padding: 20,
  },
  scrollContentDesktop: {
    padding: 24,
  },
  greetingSection: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  greetingTextTablet: {
    fontSize: 32,
  },
  teamAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  avatarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  moreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  widgetsContainer: {
    gap: 16,
  },
  widgetsContainerTablet: {
    flexDirection: 'row',
    gap: 20,
  },
  widgetsContainerDesktop: {
    flexDirection: 'row',
    gap: 24,
  },
  widgetColumn: {
    gap: 16,
    flex: 1,
  },
  widgetColumnTablet: {
    flex: 1,
  },
  widgetColumnDesktop: {
    flex: 1,
  },
});

