import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Card, Text, ProgressBar, Avatar, useTheme, Chip, ActivityIndicator } from 'react-native-paper';
import { SolarIcon } from 'react-native-solar-icons';
import { createShadow } from '../utils/shadow';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTodayTasks } from '../store/slices/tasksSlice';

const getIsTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768;
};

// Dữ liệu mẫu để test giao diện
const MOCK_TASKS = [
  {
    id: 1,
    title: 'Hoàn thành báo cáo dự án',
    description: 'Viết báo cáo tổng kết dự án TaskManagement và chuẩn bị presentation cho buổi meeting sáng mai',
    category: 'Công việc',
    progress: 65,
    priority: 'high',
    status: 'in_progress',
    due_date: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Review code và fix bugs',
    description: 'Kiểm tra lại toàn bộ code, fix các lỗi còn tồn đọng và optimize performance',
    category: 'Phát triển',
    progress: 40,
    priority: 'medium',
    status: 'in_progress',
    due_date: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Thiết kế UI/UX cho tính năng mới',
    description: 'Thiết kế giao diện cho tính năng quản lý team và collaboration',
    category: 'Thiết kế',
    progress: 25,
    priority: 'medium',
    status: 'pending',
    due_date: new Date().toISOString(),
  },
  {
    id: 4,
    title: 'Meeting với team',
    description: 'Họp định kỳ với team để bàn về tiến độ dự án và kế hoạch tuần tới',
    category: 'Meeting',
    progress: 0,
    priority: 'high',
    status: 'pending',
    due_date: new Date().toISOString(),
  },
  {
    id: 5,
    title: 'Cập nhật tài liệu API',
    description: 'Viết và cập nhật tài liệu API cho backend, bao gồm các endpoint và examples',
    category: 'Tài liệu',
    progress: 80,
    priority: 'low',
    status: 'in_progress',
    due_date: new Date().toISOString(),
  },
];

// Flag để bật/tắt mock data (đặt true để dùng mock data, false để dùng data từ API)
const USE_MOCK_DATA = true;

export default function TodayTasksWidget({ navigation }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { todayTasks, isLoading } = useAppSelector((state) => state.tasks);
  const [alertVisible, setAlertVisible] = useState(true);
  const isTablet = getIsTablet();

  // Sử dụng mock data nếu bật flag hoặc không có data từ API
  const displayTasks = USE_MOCK_DATA ? MOCK_TASKS : todayTasks;
  const displayLoading = USE_MOCK_DATA ? false : isLoading;

  useEffect(() => {
    dispatch(fetchTodayTasks());
  }, [dispatch]);

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness * 1.33,
    },
    cardContent: {
      padding: 0,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: isTablet ? 20 : 16,
      paddingTop: isTablet ? 20 : 16,
      paddingBottom: 16,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontSize: isTablet ? 18 : 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    seeAll: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    tasksList: {
      gap: 0,
    },
    taskCard: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 0,
      marginBottom: 0,
      borderWidth: 0,
    },
    taskCardContent: {
      paddingHorizontal: isTablet ? 20 : 16,
      paddingVertical: isTablet ? 20 : 16,
    },
    taskTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    taskDescription: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
      lineHeight: 20,
    },
    taskFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    membersContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: -8,
    },
    memberAvatar: {
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    memberAvatarOverlap: {
      marginLeft: -8,
    },
    moreMembers: {
      marginLeft: 4,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
    },
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },
    progressBar: {
      flex: 1,
      height: 6,
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.primary,
      minWidth: 40,
    },
    alert: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.inverseSurface,
      borderRadius: theme.roundness,
      padding: 16,
      marginTop: 12,
      marginHorizontal: isTablet ? 20 : 16,
      marginBottom: isTablet ? 20 : 16,
      gap: 12,
    },
    alertText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.inverseOnSurface,
      fontWeight: '500',
    },
  });

  const cardShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 2,
    opacity: 0.1,
    radius: 8,
    elevation: 3,
  });

  return (
    <View style={styles.container}>
      <Card style={[styles.card, cardShadow]} onPress={() => {}}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <SolarIcon name="Clipboard" size={20} color={theme.colors.onSurface} type="outline" />
              <Text style={styles.title}>Today Tasks</Text>
            </View>
            <Text 
              style={styles.seeAll} 
              onPress={() => navigation?.navigate('MyTasks')}
            >
              Xem tất cả &gt;
            </Text>
          </View>

          <View style={styles.tasksList}>
            {displayLoading && displayTasks.length === 0 ? (
              <View style={{ paddingHorizontal: isTablet ? 20 : 16, paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : displayTasks.length === 0 ? (
              <View style={{ paddingHorizontal: isTablet ? 20 : 16, paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}>
                  Không có task nào hôm nay
                </Text>
              </View>
            ) : (
              displayTasks.slice(0, 2).map((task, index) => (
                <Card
                  key={task.id}
                  style={[
                    styles.taskCard,
                    index === 0 && { borderTopLeftRadius: theme.roundness, borderTopRightRadius: theme.roundness },
                    index === displayTasks.slice(0, 2).length - 1 && { borderBottomLeftRadius: theme.roundness, borderBottomRightRadius: theme.roundness, marginBottom: 0 },
                    index < displayTasks.slice(0, 2).length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.outline },
                  ]}
                  onPress={() => navigation?.navigate('TaskDetail', { taskId: task.id })}
                  mode="flat"
                >
                  <Card.Content style={styles.taskCardContent}>
                    <Text variant="titleMedium" style={styles.taskTitle}>
                      {task.title}
                    </Text>
                    {task.description && (
                      <Text variant="bodyMedium" style={styles.taskDescription} numberOfLines={2}>
                        {task.description}
                      </Text>
                    )}
                    
                    <View style={styles.taskFooter}>
                      {task.category ? (
                        <Chip mode="outlined" compact>
                          {task.category}
                        </Chip>
                      ) : (
                        <View style={{ width: 0 }} />
                      )}
                      
                      <View style={styles.progressContainer}>
                        <ProgressBar
                          progress={task.progress / 100}
                          color={theme.colors.primary}
                          style={styles.progressBar}
                        />
                        <Text style={styles.progressText}>{task.progress}%</Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>

          {alertVisible && (
            <View style={styles.alert}>
              <SolarIcon name="ChatRound" size={20} color={theme.colors.inverseOnSurface} type="bold" />
              <Text style={styles.alertText}>
                Bạn có {displayTasks.length} task hôm nay. Tiếp tục phát huy! 👍
              </Text>
              <TouchableOpacity
                onPress={() => setAlertVisible(false)}
                style={{ padding: 4 }}
              >
                <SolarIcon name="CloseCircle" size={20} color={theme.colors.inverseOnSurface} type="outline" />
              </TouchableOpacity>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}
