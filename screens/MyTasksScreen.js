import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Text,
  TextInput,
  Card,
  Chip,
  ProgressBar,
  useTheme,
  ActivityIndicator,
  FAB,
  IconButton,
  Avatar,
  Menu,
  Dialog,
  Portal,
  Paragraph,
  Button,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SolarIcon } from 'react-native-solar-icons';
import Header from '../components/Header';
import { createShadow } from '../utils/shadow';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTasks, deleteTask, updateTask } from '../store/slices/tasksSlice';

// Mock data để test giao diện
const MOCK_TASKS = [
  {
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
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Gọi điện cho khách hàng',
    description: 'Liên hệ với khách hàng để xác nhận đơn hàng và thảo luận về yêu cầu mới',
    priority: 'medium',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['urgent', 'customer'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    taskType: 'quick',
    assignedUsers: [
      { user_id: 4, name: 'Lê Văn D', email: 'user4@example.com' },
    ],
  },
  {
    id: 3,
    title: 'Thiết kế UI/UX cho tính năng mới',
    description: 'Thiết kế giao diện cho tính năng quản lý team và collaboration với focus vào user experience',
    category: 'Thiết kế',
    progress: 25,
    priority: 'medium',
    status: 'pending',
    start_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    taskType: 'detailed',
    assignedUsers: [
      { user_id: 5, name: 'Phạm Thị E', email: 'user5@example.com' },
    ],
    subtasks: [
      { 
        id: 1, 
        title: 'Research', 
        completed: false,
        assignedUsers: [
          { user_id: 5, name: 'Phạm Thị E', email: 'user5@example.com' },
        ],
      },
      { 
        id: 2, 
        title: 'Wireframe', 
        completed: false,
      },
    ],
  },
  {
    id: 4,
    title: 'Gửi email báo cáo',
    description: 'Gửi email báo cáo tuần cho sếp về tiến độ dự án và các vấn đề cần giải quyết',
    priority: 'high',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['email', 'report', 'important'],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    taskType: 'quick',
    assignedUsers: [
      { user_id: 2, name: 'Nguyễn Văn B', email: 'user2@example.com' },
      { email: 'manager@example.com' },
    ],
  },
];

// Flag để bật/tắt mock data
const USE_MOCK_DATA = false;

const filterTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'pending', label: 'Chờ xử lý' },
  { id: 'in_progress', label: 'Đang làm' },
  { id: 'completed', label: 'Hoàn thành' },
];

export default function MyTasksScreen({ navigation }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { tasks, isLoading, error } = useAppSelector((state) => state.tasks);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState({});
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    console.log('[MyTasksScreen] Mounted, USE_MOCK_DATA:', USE_MOCK_DATA);
    if (!USE_MOCK_DATA) {
      console.log('[MyTasksScreen] Dispatching fetchTasks');
      dispatch(fetchTasks());
    }
  }, [dispatch]);

  // Debug: Log tasks to see what we're getting
  useEffect(() => {
    console.log('[MyTasksScreen] State update:', {
      tasks,
      tasksLength: tasks?.length,
      isLoading,
      displayTasks,
      displayTasksLength: displayTasks?.length,
      filteredTasksLength: filteredTasks?.length,
    });
  }, [tasks, isLoading, displayTasks, filteredTasks]);

  const { width } = dimensions;
  const isTablet = width >= 768;

  // Sử dụng mock data nếu bật flag
  const displayTasks = USE_MOCK_DATA ? MOCK_TASKS : tasks;
  const displayLoading = USE_MOCK_DATA ? false : isLoading;

  // Filter tasks
  const filteredTasks = displayTasks.filter((task) => {
    // Filter by status
    if (activeFilter !== 'all' && task.status !== activeFilter) {
      return false;
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.category && task.category.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (!USE_MOCK_DATA) {
      dispatch(fetchTasks()).finally(() => {
        setRefreshing(false);
      });
    } else {
      setTimeout(() => {
        setRefreshing(false);
      }, 1000);
    }
  }, [dispatch]);

  const handleEditTask = (task) => {
    setMenuVisible({});
    navigation?.navigate('CreateTask', { 
      taskId: task.id,
      task: task,
      mode: 'edit'
    });
  };

  const handleDeleteTask = (task) => {
    setMenuVisible({});
    setTaskToDelete(task);
    setDeleteDialogVisible(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDelete) {
      if (!USE_MOCK_DATA) {
        dispatch(deleteTask(taskToDelete.id))
          .then(() => {
            // Refresh tasks after delete
            dispatch(fetchTasks());
          })
          .catch((error) => {
            console.error('Error deleting task:', error);
          });
      } else {
        // For mock data, just remove from local state
        // In real app, this would be handled by Redux
      }
      setDeleteDialogVisible(false);
      setTaskToDelete(null);
    }
  };

  const handleMenuPress = (taskId) => {
    setMenuVisible(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning || '#FF9800';
      case 'low':
        return theme.colors.primary;
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'in_progress':
        return 'Đang làm';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const cardShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 2,
    opacity: 0.1,
    radius: 8,
    elevation: 2,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Header />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View style={{
          padding: isTablet ? 20 : 16,
          paddingBottom: 12,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        }}>
          <Text style={{
            fontSize: isTablet ? 32 : 28,
            fontWeight: 'bold',
            color: theme.colors.onSurface,
            marginBottom: 16,
          }}>My Tasks</Text>
          
          <View style={{ marginBottom: 16 }}>
            <TextInput
              mode="outlined"
              placeholder="Tìm kiếm tasks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              left={<TextInput.Icon icon="magnify" />}
              style={{
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: theme.roundness,
              }}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
          </View>
        </View>

        {/* Filter Section */}
        <View style={{
          paddingHorizontal: isTablet ? 20 : 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              gap: 8,
            }}
          >
            {filterTabs.map((tab) => (
              <Chip
                key={tab.id}
                selected={activeFilter === tab.id}
                onPress={() => setActiveFilter(tab.id)}
                style={{ marginRight: 8 }}
                selectedColor={theme.colors.primary}
                textStyle={{
                  color:
                    activeFilter === tab.id
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant,
                  fontWeight: activeFilter === tab.id ? '600' : '400',
                }}
              >
                {tab.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {/* Tasks List */}
        <View style={{
          padding: isTablet ? 20 : 16,
        }}>
          {displayLoading && filteredTasks.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{
                marginTop: 16,
                color: theme.colors.onSurfaceVariant,
                fontSize: 14,
              }}>
                Đang tải tasks...
              </Text>
            </View>
          ) : error ? (
            <View style={{
              paddingVertical: 60,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SolarIcon 
                name="DangerCircle" 
                size={64} 
                color={theme.colors.error} 
                type="outline" 
              />
              <Text style={{
                marginTop: 16,
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.error,
                marginBottom: 8,
              }}>
                Lỗi khi tải tasks
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
                paddingHorizontal: 20,
              }}>
                {typeof error === 'string' ? error : JSON.stringify(error)}
              </Text>
            </View>
          ) : filteredTasks.length === 0 ? (
            <View style={{
              paddingVertical: 60,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SolarIcon 
                name="Clipboard" 
                size={64} 
                color={theme.colors.onSurfaceVariant} 
                type="outline" 
              />
              <Text style={{
                marginTop: 16,
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                {searchQuery ? 'Không tìm thấy task nào' : 'Chưa có task nào'}
              </Text>
              <Text style={{
                fontSize: 14,
                color: theme.colors.onSurfaceVariant,
                textAlign: 'center',
              }}>
                {searchQuery 
                  ? 'Thử tìm kiếm với từ khóa khác' 
                  : 'Tạo task mới để bắt đầu quản lý công việc của bạn'}
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredTasks.map((task) => {
                const isDetailed = (task.taskType === 'detailed' || task.task_type === 'detailed');
                
                return (
                  <Card
                    key={task.id}
                    style={[
                      {
                        backgroundColor: theme.colors.surface,
                        borderRadius: theme.roundness,
                        padding: 0,
                        width: '100%',
                        borderLeftWidth: 4,
                        borderLeftColor: isDetailed ? theme.colors.primary : theme.colors.secondary,
                      },
                      cardShadow,
                    ]}
                    onPress={() => navigation?.navigate('TaskDetail', { taskId: task.id })}
                  >
                    <Card.Content style={{
                      padding: isTablet ? 20 : 16,
                      width: '100%',
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 12,
                      }}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 4,
                          }}>
                            <Text style={{
                              fontSize: 16,
                              fontWeight: '600',
                              color: theme.colors.onSurface,
                            }} numberOfLines={2}>
                              {task.title}
                            </Text>
                            {isDetailed && (
                              <Chip 
                                mode="flat" 
                                compact
                                style={{
                                  backgroundColor: theme.colors.primaryContainer,
                                  height: 20,
                                }}
                                textStyle={{
                                  color: theme.colors.onPrimaryContainer,
                                  fontSize: 9,
                                }}
                              >
                                Chi tiết
                              </Chip>
                            )}
                            {!isDetailed && (
                              <Chip 
                                mode="flat" 
                                compact
                                style={{
                                  backgroundColor: theme.colors.secondaryContainer,
                                  height: 20,
                                }}
                                textStyle={{
                                  color: theme.colors.onSecondaryContainer,
                                  fontSize: 9,
                                }}
                              >
                                Nhanh
                              </Chip>
                            )}
                          </View>
                          {task.description && (
                            <Text style={{
                              fontSize: 14,
                              color: theme.colors.onSurfaceVariant,
                              lineHeight: 20,
                            }} numberOfLines={2}>
                              {task.description}
                            </Text>
                          )}
                        </View>
                        <Menu
                          visible={menuVisible[task.id] || false}
                          onDismiss={() => setMenuVisible(prev => ({ ...prev, [task.id]: false }))}
                          anchor={
                            <IconButton
                              icon="dots-vertical"
                              iconColor={theme.colors.onSurfaceVariant}
                              size={20}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleMenuPress(task.id);
                              }}
                            />
                          }
                        >
                          <Menu.Item
                            onPress={() => handleEditTask(task)}
                            title="Sửa"
                            leadingIcon="pencil"
                          />
                          <Menu.Item
                            onPress={() => handleDeleteTask(task)}
                            title="Xóa"
                            leadingIcon="delete"
                            titleStyle={{ color: theme.colors.error }}
                          />
                        </Menu>
                      </View>

                      {isDetailed ? (
                        /* Task chi tiết */
                        <>
                          {/* Category, Priority, Status */}
                          <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 8,
                            marginBottom: 12,
                          }}>
                            {task.category && (
                              <Chip mode="outlined" compact>
                                {task.category}
                              </Chip>
                            )}
                            <Chip
                              mode="flat"
                              compact
                              textStyle={{
                                color: getPriorityColor(task.priority),
                                fontSize: 12,
                                fontWeight: '600',
                              }}
                              style={{
                                backgroundColor: getPriorityColor(task.priority) + '20',
                              }}
                            >
                              {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </Chip>
                            <Chip mode="flat" compact>
                              {getStatusLabel(task.status)}
                            </Chip>
                          </View>

                          {/* Dates Info */}
                          <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 12,
                            marginBottom: 12,
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            backgroundColor: theme.colors.surfaceVariant,
                            borderRadius: theme.roundness,
                          }}>
                            {task.start_date && (
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                              }}>
                                <SolarIcon name="PlayCircle" size={14} color={theme.colors.onSurfaceVariant} type="outline" />
                                <Text style={{
                                  fontSize: 12,
                                  color: theme.colors.onSurfaceVariant,
                                }}>
                                  Bắt đầu: {formatDate(task.start_date)}
                                </Text>
                              </View>
                            )}
                            {task.due_date && (
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                              }}>
                                <SolarIcon name="Calendar" size={14} color={theme.colors.onSurfaceVariant} type="outline" />
                                <Text style={{
                                  fontSize: 12,
                                  color: theme.colors.onSurfaceVariant,
                                }}>
                                  Hết hạn: {formatDate(task.due_date)}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Subtasks */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              marginBottom: 12,
                            }}>
                              <SolarIcon name="List" size={16} color={theme.colors.onSurfaceVariant} type="outline" />
                              <Text style={{
                                fontSize: 12,
                                color: theme.colors.onSurfaceVariant,
                              }}>
                                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks hoàn thành
                              </Text>
                            </View>
                          )}

                          {/* Progress Bar */}
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
                            marginBottom: 8,
                          }}>
                            <View style={{ flex: 1, minWidth: 0 }}>
                              <ProgressBar
                                progress={task.progress / 100}
                                color={theme.colors.primary}
                                style={{
                                  height: 6,
                                  borderRadius: 3,
                                }}
                              />
                            </View>
                            <Text style={{
                              fontSize: 12,
                              fontWeight: '600',
                              color: theme.colors.primary,
                              minWidth: 40,
                              flexShrink: 0,
                              textAlign: 'right',
                            }}>
                              {task.progress}%
                            </Text>
                          </View>

                          {/* Updated at */}
                          {task.updated_at && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                            }}>
                              <SolarIcon name="ClockCircle" size={12} color={theme.colors.onSurfaceVariant} type="outline" />
                              <Text style={{
                                fontSize: 11,
                                color: theme.colors.onSurfaceVariant,
                              }}>
                                Cập nhật: {formatDate(task.updated_at)}
                              </Text>
                            </View>
                          )}
                        </>
                      ) : (
                        /* Task nhanh */
                        <>
                          {/* Priority and Deadline */}
                          <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 8,
                            marginBottom: 12,
                          }}>
                            <Chip
                              mode="flat"
                              compact
                              textStyle={{
                                color: getPriorityColor(task.priority),
                                fontSize: 12,
                                fontWeight: '600',
                              }}
                              style={{
                                backgroundColor: getPriorityColor(task.priority) + '20',
                              }}
                            >
                              {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </Chip>
                            {task.deadline && (() => {
                              const daysLeft = getDaysUntilDeadline(task.deadline);
                              const isUrgent = daysLeft !== null && daysLeft <= 1;
                              const isWarning = daysLeft !== null && daysLeft <= 3 && daysLeft > 1;
                              const deadlineColor = isUrgent 
                                ? theme.colors.error 
                                : isWarning 
                                ? theme.colors.warning || '#FF9800'
                                : theme.colors.onSurfaceVariant;
                              const deadlineBg = isUrgent 
                                ? theme.colors.errorContainer 
                                : isWarning 
                                ? theme.colors.warningContainer || '#FFF3E0'
                                : theme.colors.surfaceVariant;
                              
                              return (
                                <View style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  gap: 4,
                                  paddingHorizontal: 8,
                                  paddingVertical: 4,
                                  backgroundColor: deadlineBg,
                                  borderRadius: theme.roundness,
                                }}>
                                  <SolarIcon 
                                    name="Calendar" 
                                    size={14} 
                                    color={deadlineColor} 
                                    type="outline" 
                                  />
                                  <Text style={{
                                    fontSize: 12,
                                    color: deadlineColor,
                                    fontWeight: isUrgent || isWarning ? '600' : '400',
                                  }}>
                                    {formatDate(task.deadline)}
                                    {daysLeft !== null && (
                                      <Text> ({daysLeft > 0 ? `Còn ${daysLeft} ngày` : daysLeft === 0 ? 'Hôm nay' : `Quá hạn ${Math.abs(daysLeft)} ngày`})</Text>
                                    )}
                                  </Text>
                                </View>
                              );
                            })()}
                          </View>

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <View style={{
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              gap: 6,
                              marginBottom: 12,
                            }}>
                              {task.tags.map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  mode="flat"
                                  compact
                                  style={{
                                    backgroundColor: theme.colors.primaryContainer,
                                  }}
                                  textStyle={{
                                    color: theme.colors.onPrimaryContainer,
                                    fontSize: 11,
                                  }}
                                >
                                  {tag}
                                </Chip>
                              ))}
                            </View>
                          )}

                          {/* Assigned Users */}
                          {task.assignedUsers && task.assignedUsers.length > 0 && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              marginBottom: 8,
                            }}>
                              <SolarIcon name="Users" size={14} color={theme.colors.onSurfaceVariant} type="outline" />
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginLeft: -4,
                              }}>
                                {task.assignedUsers.slice(0, 4).map((user, userIndex) => (
                                  <Avatar.Text
                                    key={userIndex}
                                    size={24}
                                    label={user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                    style={{
                                      backgroundColor: theme.colors.secondaryContainer,
                                      marginLeft: userIndex > 0 ? -8 : 0,
                                      borderWidth: 1.5,
                                      borderColor: theme.colors.surface,
                                    }}
                                    labelStyle={{
                                      color: theme.colors.onSecondaryContainer,
                                      fontSize: 10,
                                    }}
                                  />
                                ))}
                                {task.assignedUsers.length > 4 && (
                                  <View style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 12,
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderWidth: 1.5,
                                    borderColor: theme.colors.surface,
                                    marginLeft: -8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                    <Text style={{
                                      fontSize: 9,
                                      color: theme.colors.onSurfaceVariant,
                                      fontWeight: '600',
                                    }}>
                                      +{task.assignedUsers.length - 4}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text style={{
                                fontSize: 11,
                                color: theme.colors.onSurfaceVariant,
                                marginLeft: 4,
                              }}>
                                {task.assignedUsers.length} người tham gia
                              </Text>
                            </View>
                          )}

                          {/* Updated at */}
                          {task.updated_at && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 4,
                            }}>
                              <SolarIcon name="ClockCircle" size={12} color={theme.colors.onSurfaceVariant} type="outline" />
                              <Text style={{
                                fontSize: 11,
                                color: theme.colors.onSurfaceVariant,
                              }}>
                                Cập nhật: {formatDate(task.updated_at)}
                              </Text>
                            </View>
                          )}
                        </>
                      )}
                    </Card.Content>
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB Button */}
      <FAB
        icon="plus"
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0,
          backgroundColor: theme.colors.primary,
        }}
        onPress={() => navigation?.navigate('CreateTask')}
        color={theme.colors.onPrimary}
      />

      {/* Delete Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => {
            setDeleteDialogVisible(false);
            setTaskToDelete(null);
          }}
        >
          <Dialog.Title>Xác nhận xóa</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Bạn có chắc chắn muốn xóa task "{taskToDelete?.title}"? Hành động này không thể hoàn tác.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => {
              setDeleteDialogVisible(false);
              setTaskToDelete(null);
            }}>
              Hủy
            </Button>
            <Button 
              onPress={confirmDeleteTask}
              textColor={theme.colors.error}
            >
              Xóa
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}
