import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Text, Avatar, useTheme, Dialog, Portal, Paragraph, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { fetchTodayTasks } from '../store/slices/tasksSlice';
import TodayTasksWidget from '../components/TodayTasksWidget';
import TaskProgressWidget from '../components/TaskProgressWidget';
import TaskTimelineWidget from '../components/TaskTimelineWidget';
import CalendarWidget from '../components/CalendarWidget';
import Header from '../components/Header';

export default function DashboardScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { todayTasks, tasks } = useAppSelector((state) => state.tasks);
  const { user } = useAppSelector((state) => state.auth);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchTodayTasks());
  }, [dispatch]);

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
        setDialogTitle('Chi tiết người dùng');
        setDialogMessage('Mở màn hình chi tiết người dùng');
        setDialogVisible(true);
        break;
      case 'settings':
        setDialogTitle('Settings');
        setDialogMessage('Mở màn hình cài đặt');
        setDialogVisible(true);
        break;
      case 'logout':
        setLogoutDialogVisible(true);
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
                <Text variant="bodyMedium" style={styles.moreText}>
                  Welcome back! {user?.name || 'User'}
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
                {/* Hiển thị TaskProgressWidget cho task chi tiết đầu tiên có đủ thông tin */}
                {(() => {
                  // Mock data để fallback nếu không có task từ API
                  const MOCK_TASK = {
                    id: 1,
                    title: 'Hoàn thành báo cáo dự án',
                    description: 'Viết báo cáo tổng kết dự án TaskManagement và chuẩn bị presentation cho buổi meeting sáng mai',
                    category: 'Công việc',
                    progress: 65,
                    priority: 'high',
                    status: 'in_progress',
                    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    taskType: 'detailed',
                    task_type: 'detailed',
                    assignedUsers: [
                      { user_id: 2, name: 'Nguyễn Văn B', email: 'user2@example.com' },
                      { user_id: 3, name: 'Trần Thị C', email: 'user3@example.com' },
                    ],
                    subtasks: [
                      { 
                        id: 1, 
                        title: 'Thu thập dữ liệu', 
                        completed: true,
                        assignedUsers: [
                          { user_id: 2, name: 'Nguyễn Văn B', email: 'user2@example.com' },
                        ],
                      },
                      { 
                        id: 2, 
                        title: 'Viết báo cáo', 
                        completed: true,
                        assignedUsers: [
                          { user_id: 3, name: 'Trần Thị C', email: 'user3@example.com' },
                        ],
                      },
                      { 
                        id: 3, 
                        title: 'Chuẩn bị presentation', 
                        completed: false,
                        assignedUsers: [
                          { user_id: 2, name: 'Nguyễn Văn B', email: 'user2@example.com' },
                          { email: 'external@example.com' },
                        ],
                      },
                    ],
                  };
                  
                  // Tìm task detailed đầu tiên có start_date từ todayTasks hoặc tasks
                  const allTasks = [...(todayTasks || []), ...(tasks || [])];
                  const detailedTask = allTasks.find(
                    task => {
                      const isDetailed = (task.taskType === 'detailed' || task.task_type === 'detailed');
                      const hasStartDate = task.start_date;
                      console.log('[DashboardScreen] Checking task:', {
                        id: task.id,
                        title: task.title,
                        isDetailed,
                        hasStartDate,
                        taskType: task.taskType || task.task_type,
                        start_date: task.start_date,
                      });
                      return isDetailed && hasStartDate;
                    }
                  );
                  
                  console.log('[DashboardScreen] Found detailedTask:', detailedTask);
                  console.log('[DashboardScreen] todayTasks length:', todayTasks?.length);
                  console.log('[DashboardScreen] tasks length:', tasks?.length);
                  
                  // Sử dụng task từ API nếu có, nếu không dùng mock data
                  const taskToShow = detailedTask || MOCK_TASK;
                  
                  return <TaskProgressWidget task={taskToShow} />;
                })()}
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
