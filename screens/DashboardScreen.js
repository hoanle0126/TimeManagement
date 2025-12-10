import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Text, Avatar, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import TodayTasksWidget from '../components/TodayTasksWidget';
import TaskProgressWidget from '../components/TaskProgressWidget';
import TaskTimelineWidget from '../components/TaskTimelineWidget';
import CalendarWidget from '../components/CalendarWidget';
import Header from '../components/Header';

export default function DashboardScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width } = dimensions;
  const isTablet = width >= 768;
  const isDesktop = width >= 1024;

  const handleMenuPress = (itemId) => {
    switch (itemId) {
      case 'profile':
        Alert.alert('Chi tiết người dùng', 'Mở màn hình chi tiết người dùng');
        break;
      case 'settings':
        Alert.alert('Settings', 'Mở màn hình cài đặt');
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
                console.log('Logout button pressed');
                try {
                  await dispatch(logout());
                  console.log('Logout function completed');
                  Alert.alert('Đã đăng xuất', 'Bạn đã đăng xuất thành công');
                } catch (error) {
                  console.error('Logout error in DashboardScreen:', error);
                  // Logout vẫn thành công ngay cả khi API có lỗi (token đã hết hạn, etc.)
                  Alert.alert('Đã đăng xuất', 'Bạn đã đăng xuất thành công');
                }
              },
            },
          ]
        );
        break;
      default:
        break;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
      fontSize: isTablet ? 32 : 24,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
      marginBottom: 16,
    },
    teamAvatars: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    avatar: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    avatarDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.primary,
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
    moreText: {
      marginLeft: 8,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
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
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.mainContent}>
          <Header onMenuPress={handleMenuPress} />

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
              <Text variant={isTablet ? 'headlineMedium' : 'headlineSmall'} style={styles.greetingText}>
                Start Your Day & Be Productive ✌️
              </Text>
              <View style={styles.teamAvatars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Avatar.Text
                    key={i}
                    size={40}
                    label={String(i)}
                    style={[
                      styles.avatar,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                    labelStyle={{ 
                      fontSize: 14, 
                      color: theme.colors.onSurfaceVariant,
                    }}
                  >
                    <View style={styles.avatarDot} />
                  </Avatar.Text>
                ))}
                <Text variant="bodyMedium" style={styles.moreText}>
                  10+
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.widgetsContainer,
                isTablet && styles.widgetsContainerTablet,
                isDesktop && styles.widgetsContainerDesktop,
              ]}
            >
              <View style={styles.widgetColumn}>
                <TodayTasksWidget navigation={navigation} />
                <TaskProgressWidget />
              </View>

              {(isTablet || isDesktop) && (
                <View style={styles.widgetColumn}>
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
