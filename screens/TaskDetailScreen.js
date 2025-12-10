import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  IconButton,
  Chip,
  ProgressBar,
  Button,
  useTheme,
  ActivityIndicator,
  Card,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SolarIcon } from 'react-native-solar-icons';
import { createShadow } from '../utils/shadow';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTask, updateTask, deleteTask } from '../store/slices/tasksSlice';

// Mock data - sẽ thay bằng API call sau
const MOCK_TASKS = [
  {
    id: 1,
    title: 'Hoàn thành báo cáo dự án',
    description: 'Viết báo cáo tổng kết dự án TaskManagement và chuẩn bị presentation cho buổi meeting sáng mai. Cần tổng hợp tất cả các thông tin về tiến độ, các vấn đề gặp phải và kế hoạch tiếp theo.',
    category: 'Công việc',
    progress: 65,
    priority: 'high',
    status: 'in_progress',
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    taskType: 'detailed',
    subtasks: [
      { id: 1, title: 'Thu thập dữ liệu từ các nguồn', completed: true },
      { id: 2, title: 'Viết báo cáo tổng hợp', completed: true },
      { id: 3, title: 'Chuẩn bị presentation slides', completed: false },
      { id: 4, title: 'Review và chỉnh sửa', completed: false },
    ],
  },
  {
    id: 2,
    title: 'Gọi điện cho khách hàng',
    description: 'Liên hệ với khách hàng để xác nhận đơn hàng và thảo luận về yêu cầu mới. Cần chuẩn bị trước các câu hỏi và thông tin cần thiết.',
    priority: 'medium',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['urgent', 'customer', 'call'],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    taskType: 'quick',
  },
];

const USE_MOCK_DATA = true;

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function TaskDetailScreen({ navigation, route }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { currentTask, isLoading } = useAppSelector((state) => state.tasks);
  const taskId = route?.params?.taskId;
  
  const [task, setTask] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK_DATA) {
      // Tìm task từ mock data
      const foundTask = MOCK_TASKS.find(t => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
      }
      setLocalLoading(false);
    } else {
      // Fetch từ API
      if (taskId) {
        dispatch(fetchTask(taskId)).then((action) => {
          if (fetchTask.fulfilled.match(action)) {
            setTask(action.payload);
          }
          setLocalLoading(false);
        });
      }
    }
  }, [taskId, dispatch]);

  const displayTask = USE_MOCK_DATA ? task : currentTask;
  const displayLoading = USE_MOCK_DATA ? localLoading : isLoading;

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

  const handleUpdateProgress = (newProgress) => {
    if (!displayTask) return;
    const updatedTask = { ...displayTask, progress: newProgress };
    setTask(updatedTask);
    if (!USE_MOCK_DATA) {
      dispatch(updateTask({ taskId: displayTask.id, taskData: { progress: newProgress } }));
    }
  };

  const handleUpdateStatus = (newStatus) => {
    if (!displayTask) return;
    const updatedTask = { ...displayTask, status: newStatus };
    setTask(updatedTask);
    if (!USE_MOCK_DATA) {
      dispatch(updateTask({ taskId: displayTask.id, taskData: { status: newStatus } }));
    }
  };

  const handleEdit = () => {
    navigation.navigate('CreateTask', { taskId: displayTask.id, taskData: displayTask });
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa Task',
      'Bạn có chắc chắn muốn xóa task này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            if (!USE_MOCK_DATA) {
              await dispatch(deleteTask(displayTask.id));
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const cardShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 2,
    opacity: 0.1,
    radius: 8,
    elevation: 2,
  });

  if (displayLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outline,
        }}>
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}>
            Chi tiết Task
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!displayTask) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
        <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
        }}>
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.onSurface}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}>
            Chi tiết Task
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <SolarIcon name="Clipboard" size={64} color={theme.colors.onSurfaceVariant} type="outline" />
          <Text style={{
            marginTop: 16,
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
            marginBottom: 8,
          }}>
            Không tìm thấy task
          </Text>
          <Text style={{
            fontSize: 14,
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
          }}>
            Task không tồn tại hoặc đã bị xóa
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isDetailed = displayTask.taskType === 'detailed';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
      }}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.onSurface}
          size={24}
          onPress={() => navigation.goBack()}
        />
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }} numberOfLines={1}>
            {displayTask.title}
        </Text>
        </View>
        <IconButton
          icon="pencil"
          iconColor={theme.colors.primary}
          size={24}
          onPress={handleEdit}
        />
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: isTablet ? 20 : 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Type Badge */}
        <View style={{ marginBottom: 16 }}>
          <Chip
            mode="flat"
            style={{
              backgroundColor: isDetailed 
                ? theme.colors.primaryContainer 
                : theme.colors.secondaryContainer,
              alignSelf: 'flex-start',
            }}
            textStyle={{
              color: isDetailed 
                ? theme.colors.onPrimaryContainer 
                : theme.colors.onSecondaryContainer,
            }}
          >
            {isDetailed ? 'Task Chi tiết' : 'Task Nhanh'}
          </Chip>
        </View>

        {/* Description Card */}
        <Card style={[
          {
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness,
            marginBottom: 16,
          },
          cardShadow,
        ]}>
          <Card.Content style={{ padding: isTablet ? 20 : 16 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}>
              <SolarIcon name="Document" size={20} color={theme.colors.primary} type="outline" />
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.onSurface,
              }}>
                Mô tả
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              color: theme.colors.onSurfaceVariant,
              lineHeight: 22,
            }}>
              {displayTask.description || 'Chưa có mô tả'}
            </Text>
          </Card.Content>
        </Card>

        {isDetailed ? (
          /* Task Chi tiết */
          <>
            {/* Info Card */}
            <Card style={[
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.roundness,
                marginBottom: 16,
              },
              cardShadow,
            ]}>
              <Card.Content style={{ padding: isTablet ? 20 : 16 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                  marginBottom: 16,
                }}>
                  Thông tin Task
                </Text>

                {/* Category, Priority, Status */}
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginBottom: 16,
                }}>
                  {displayTask.category && (
                    <Chip mode="outlined">
                      {displayTask.category}
                    </Chip>
                  )}
                  <Chip
                    mode="flat"
                    textStyle={{
                      color: getPriorityColor(displayTask.priority),
                      fontWeight: '600',
                    }}
                    style={{
                      backgroundColor: getPriorityColor(displayTask.priority) + '20',
                    }}
                  >
                    {displayTask.priority === 'high' ? 'Cao' : displayTask.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  </Chip>
                  <Chip mode="flat">
                    {getStatusLabel(displayTask.status)}
                  </Chip>
                </View>

                {/* Dates */}
                <View style={{ gap: 12, marginBottom: 16 }}>
                  {displayTask.start_date && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <SolarIcon name="PlayCircle" size={18} color={theme.colors.onSurfaceVariant} type="outline" />
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.onSurfaceVariant,
                          marginBottom: 2,
                        }}>
                          Ngày bắt đầu
                        </Text>
                        <Text style={{
                          fontSize: 14,
                          color: theme.colors.onSurface,
                          fontWeight: '500',
                        }}>
                          {formatDateTime(displayTask.start_date)}
                        </Text>
                      </View>
                    </View>
                  )}
                  {displayTask.due_date && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <SolarIcon name="Calendar" size={18} color={theme.colors.onSurfaceVariant} type="outline" />
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.onSurfaceVariant,
                          marginBottom: 2,
                        }}>
                          Ngày hết hạn
                        </Text>
                        <Text style={{
                          fontSize: 14,
                          color: theme.colors.onSurface,
                          fontWeight: '500',
                        }}>
                          {formatDateTime(displayTask.due_date)}
                        </Text>
                      </View>
                    </View>
                  )}
                  {displayTask.created_at && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <SolarIcon name="PlusCircle" size={18} color={theme.colors.onSurfaceVariant} type="outline" />
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.onSurfaceVariant,
                          marginBottom: 2,
                        }}>
                          Ngày tạo
                        </Text>
                        <Text style={{
                          fontSize: 14,
                          color: theme.colors.onSurface,
                          fontWeight: '500',
                        }}>
                          {formatDate(displayTask.created_at)}
                        </Text>
                      </View>
                    </View>
                  )}
                  {displayTask.updated_at && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <SolarIcon name="ClockCircle" size={18} color={theme.colors.onSurfaceVariant} type="outline" />
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.onSurfaceVariant,
                          marginBottom: 2,
                        }}>
                          Cập nhật lần cuối
                        </Text>
                        <Text style={{
                          fontSize: 14,
                          color: theme.colors.onSurface,
                          fontWeight: '500',
                        }}>
                          {formatDate(displayTask.updated_at)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Progress */}
                <View style={{ marginBottom: 16 }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.colors.onSurface,
                    }}>
                      Tiến độ
                    </Text>
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.colors.primary,
                    }}>
                      {displayTask.progress}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={displayTask.progress / 100}
                    color={theme.colors.primary}
                    style={{
                      height: 8,
                      borderRadius: 4,
                    }}
                  />
                  <View style={{
                    flexDirection: 'row',
                    gap: 8,
                    marginTop: 12,
                  }}>
                    {[0, 25, 50, 75, 100].map((value) => (
                      <TouchableOpacity
                        key={value}
                        onPress={() => handleUpdateProgress(value)}
                        style={{
                          flex: 1,
                          paddingVertical: 8,
                          paddingHorizontal: 4,
                          backgroundColor: displayTask.progress === value 
                            ? theme.colors.primaryContainer 
                            : theme.colors.surfaceVariant,
                          borderRadius: theme.roundness,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{
                          fontSize: 12,
                          fontWeight: displayTask.progress === value ? '600' : '400',
                          color: displayTask.progress === value 
                            ? theme.colors.onPrimaryContainer 
                            : theme.colors.onSurfaceVariant,
                        }}>
                          {value}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Status Buttons */}
                <View>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: theme.colors.onSurface,
                    marginBottom: 8,
                  }}>
                    Trạng thái
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    gap: 8,
                  }}>
                    {[
                      { value: 'pending', label: 'Chờ xử lý' },
                      { value: 'in_progress', label: 'Đang làm' },
                      { value: 'completed', label: 'Hoàn thành' },
                    ].map((statusOption) => (
                      <TouchableOpacity
                        key={statusOption.value}
                        onPress={() => handleUpdateStatus(statusOption.value)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          backgroundColor: displayTask.status === statusOption.value 
                            ? theme.colors.primaryContainer 
                            : theme.colors.surfaceVariant,
                          borderRadius: theme.roundness,
                          alignItems: 'center',
                        }}
                      >
                        <Text style={{
                          fontSize: 12,
                          fontWeight: displayTask.status === statusOption.value ? '600' : '400',
                          color: displayTask.status === statusOption.value 
                            ? theme.colors.onPrimaryContainer 
                            : theme.colors.onSurfaceVariant,
                        }}>
                          {statusOption.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Subtasks Card */}
            {displayTask.subtasks && displayTask.subtasks.length > 0 && (
              <Card style={[
                {
                  backgroundColor: theme.colors.surface,
                  borderRadius: theme.roundness,
                  marginBottom: 16,
                },
                cardShadow,
              ]}>
                <Card.Content style={{ padding: isTablet ? 20 : 16 }}>
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <SolarIcon name="List" size={20} color={theme.colors.primary} type="outline" />
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: theme.colors.onSurface,
                      }}>
                        Tasks phụ
                      </Text>
                    </View>
                    <Text style={{
                      fontSize: 14,
                      color: theme.colors.onSurfaceVariant,
                    }}>
                      {displayTask.subtasks.filter(st => st.completed).length}/{displayTask.subtasks.length} hoàn thành
                    </Text>
                  </View>
                  <View style={{ gap: 12 }}>
                    {displayTask.subtasks.map((subtask, index) => (
                      <TouchableOpacity
                        key={subtask.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          backgroundColor: theme.colors.surfaceVariant,
                          borderRadius: theme.roundness,
                        }}
                      >
                        <View style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          borderWidth: 2,
                          borderColor: subtask.completed 
                            ? theme.colors.primary 
                            : theme.colors.outline,
                          backgroundColor: subtask.completed 
                            ? theme.colors.primary 
                            : 'transparent',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {subtask.completed && (
                            <SolarIcon name="Check" size={14} color={theme.colors.onPrimary} type="bold" />
                          )}
                        </View>
                        <Text style={{
                          flex: 1,
                          fontSize: 14,
                          color: subtask.completed 
                            ? theme.colors.onSurfaceVariant 
                            : theme.colors.onSurface,
                          textDecorationLine: subtask.completed ? 'line-through' : 'none',
                        }}>
                          {subtask.title}
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.onSurfaceVariant,
                        }}>
                          #{index + 1}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Card.Content>
              </Card>
            )}
          </>
        ) : (
          /* Task Nhanh */
          <>
            {/* Info Card */}
            <Card style={[
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.roundness,
                marginBottom: 16,
              },
              cardShadow,
            ]}>
              <Card.Content style={{ padding: isTablet ? 20 : 16 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                  marginBottom: 16,
                }}>
                  Thông tin Task
                </Text>

                {/* Priority */}
                <View style={{ marginBottom: 16 }}>
                  <Text style={{
                    fontSize: 12,
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                  }}>
                    Độ ưu tiên
                  </Text>
                  <Chip
                    mode="flat"
                    textStyle={{
                      color: getPriorityColor(displayTask.priority),
                      fontWeight: '600',
                    }}
                    style={{
                      backgroundColor: getPriorityColor(displayTask.priority) + '20',
                      alignSelf: 'flex-start',
                    }}
                  >
                    {displayTask.priority === 'high' ? 'Cao' : displayTask.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                  </Chip>
                </View>

                {/* Deadline */}
                {displayTask.deadline && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{
                      fontSize: 12,
                      color: theme.colors.onSurfaceVariant,
                      marginBottom: 8,
                    }}>
                      Deadline
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <SolarIcon name="Calendar" size={18} color={theme.colors.primary} type="outline" />
                      <Text style={{
                        fontSize: 14,
                        color: theme.colors.onSurface,
                        fontWeight: '500',
                      }}>
                        {formatDateTime(displayTask.deadline)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Tags */}
                {displayTask.tags && displayTask.tags.length > 0 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{
                      fontSize: 12,
                      color: theme.colors.onSurfaceVariant,
                      marginBottom: 8,
                    }}>
                      Tags
                    </Text>
                    <View style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}>
                      {displayTask.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          mode="flat"
                          style={{
                            backgroundColor: theme.colors.primaryContainer,
                          }}
                          textStyle={{
                            color: theme.colors.onPrimaryContainer,
                          }}
                        >
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {/* Dates */}
                <View style={{ gap: 12 }}>
                  {displayTask.created_at && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <SolarIcon name="PlusCircle" size={18} color={theme.colors.onSurfaceVariant} type="outline" />
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.onSurfaceVariant,
                          marginBottom: 2,
                        }}>
                          Ngày tạo
                        </Text>
                        <Text style={{
                          fontSize: 14,
                          color: theme.colors.onSurface,
                          fontWeight: '500',
                        }}>
                          {formatDate(displayTask.created_at)}
                        </Text>
                      </View>
                    </View>
                  )}
                  {displayTask.updated_at && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <SolarIcon name="ClockCircle" size={18} color={theme.colors.onSurfaceVariant} type="outline" />
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: 12,
                          color: theme.colors.onSurfaceVariant,
                          marginBottom: 2,
                        }}>
                          Cập nhật lần cuối
                        </Text>
                        <Text style={{
                          fontSize: 14,
                          color: theme.colors.onSurface,
                          fontWeight: '500',
                        }}>
                          {formatDate(displayTask.updated_at)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          </>
        )}

        {/* Action Buttons */}
        <View style={{
          flexDirection: 'row',
          gap: 12,
          marginTop: 8,
        }}>
          <Button
            mode="outlined"
            onPress={handleEdit}
            icon="pencil"
            style={{
              flex: 1,
              borderRadius: theme.roundness,
            }}
            textColor={theme.colors.primary}
            borderColor={theme.colors.primary}
          >
            Chỉnh sửa
          </Button>
          <Button
            mode="contained"
            onPress={handleDelete}
            icon="delete"
            buttonColor={theme.colors.error}
            textColor={theme.colors.onError}
            style={{
              flex: 1,
              borderRadius: theme.roundness,
            }}
          >
            Xóa
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
