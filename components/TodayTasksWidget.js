import React, { useState, useEffect } from 'react';
import { View, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Card, Text, ProgressBar, Avatar, useTheme, Chip, ActivityIndicator } from 'react-native-paper';
import { SolarIcon } from 'react-native-solar-icons';
import { createShadow } from '../utils/shadow';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchTodayTasks } from '../store/slices/tasksSlice';
import mockTasksData from '../data/mockTasks.json';

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
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    taskType: 'detailed', // Task chi tiết
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
          { email: 'external@example.com' }, // User chưa có account
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Gọi điện cho khách hàng',
    description: 'Liên hệ với khách hàng để xác nhận đơn hàng',
    priority: 'medium',
    deadline: new Date().toISOString(),
    tags: ['urgent', 'customer'],
    taskType: 'quick', // Task nhanh
    assignedUsers: [
      { user_id: 4, name: 'Lê Văn D', email: 'user4@example.com' },
    ],
  },
];

// Flag để bật/tắt mock data (đặt true để dùng mock data từ JSON, false để dùng data từ API)
const USE_MOCK_DATA = false;

export default function TodayTasksWidget({ navigation }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { todayTasks, isLoading, error } = useAppSelector((state) => state.tasks);
  const [alertVisible, setAlertVisible] = useState(true);
  const [mockTasks, setMockTasks] = useState([]);
  const isTablet = getIsTablet();

  // Load mock data từ JSON nếu USE_MOCK_DATA = true
  useEffect(() => {
    if (USE_MOCK_DATA && mockTasksData && Array.isArray(mockTasksData)) {
      // Lấy tất cả tasks từ JSON (vì dates trong JSON là cố định)
      // Hoặc có thể filter theo logic "today" nếu cần
      const today = new Date().toISOString().split('T')[0];
      const filteredTasks = mockTasksData.filter(task => {
        // Tasks có due_date = hôm nay
        if (task.due_date) {
          const taskDate = new Date(task.due_date).toISOString().split('T')[0];
          if (taskDate === today) return true;
        }
        // Tasks không có due_date và chưa hoàn thành (pending tasks)
        if (!task.due_date && task.status && !['completed', 'cancelled'].includes(task.status)) {
          return true;
        }
        // Tasks được tạo hôm nay
        if (task.created_at) {
          const createdDate = new Date(task.created_at).toISOString().split('T')[0];
          if (createdDate === today) return true;
        }
        return false;
      });
      
      // Nếu không có task nào match với hôm nay, lấy 2 tasks đầu tiên để demo
      const tasksToShow = filteredTasks.length > 0 ? filteredTasks : mockTasksData.slice(0, 2);
      
      console.log('[TodayTasksWidget] Loaded mock tasks from JSON:', tasksToShow);
      setMockTasks(tasksToShow);
    }
  }, []);

  // Sử dụng mock data từ JSON nếu bật flag, nếu không dùng data từ API
  const displayTasks = USE_MOCK_DATA ? mockTasks : todayTasks;
  const displayLoading = USE_MOCK_DATA ? false : isLoading;

  useEffect(() => {
    if (!USE_MOCK_DATA) {
      dispatch(fetchTodayTasks());
    }
  }, [dispatch]);

  // Debug: Log todayTasks to see what we're getting
  useEffect(() => {
    console.log('[TodayTasksWidget] State update:', {
      todayTasks,
      todayTasksLength: todayTasks?.length,
      isLoading,
      displayTasks,
      displayTasksLength: displayTasks?.length,
      USE_MOCK_DATA,
    });
  }, [todayTasks, isLoading, displayTasks]);

  const cardShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 2,
    opacity: 0.1,
    radius: 8,
    elevation: 3,
  });

  return (
    <View style={{ marginBottom: 16 }}>
      <Card style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness * 1.33,
        },
        cardShadow
      ]} onPress={() => {}}>
        <Card.Content style={{ padding: 0 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: isTablet ? 20 : 16,
            paddingTop: isTablet ? 20 : 16,
            paddingBottom: 16,
          }}>
            <TouchableOpacity
              onPress={() => navigation?.getParent()?.navigate('Home')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <SolarIcon name="Clipboard" size={20} color={theme.colors.onSurface} type="outline" />
              <Text style={{
                fontSize: isTablet ? 18 : 16,
                fontWeight: '600',
                color: theme.colors.onSurface,
              }}>Today Tasks</Text>
            </TouchableOpacity>
            <Text 
              style={{
                fontSize: 14,
                color: theme.colors.primary,
                fontWeight: '500',
              }} 
              onPress={() => navigation?.navigate('MyTasks')}
            >
              Xem tất cả &gt;
            </Text>
          </View>

          <View style={{ gap: 0, paddingHorizontal: isTablet ? 20 : 16, paddingVertical: isTablet ? 20 : 16 }}>
            {displayLoading && displayTasks.length === 0 ? (
              <View style={{ paddingHorizontal: isTablet ? 20 : 16, paddingVertical: 20, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={{ marginTop: 8, color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                  Đang tải tasks...
                </Text>
              </View>
            ) : error ? (
              <View style={{ paddingHorizontal: isTablet ? 20 : 16, paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.error, fontSize: 14, marginBottom: 4 }}>
                  Lỗi khi tải tasks
                </Text>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                  {typeof error === 'string' ? error : JSON.stringify(error)}
                </Text>
              </View>
            ) : displayTasks.length === 0 ? (
              <View style={{ paddingHorizontal: isTablet ? 20 : 16, paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}>
                  Không có task nào hôm nay
                </Text>
                <Text style={{ marginTop: 4, color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
                  (Debug: todayTasks.length = {todayTasks?.length || 0})
                </Text>
              </View>
            ) : (
              displayTasks.slice(0, 2).map((task, index) => {
                const isDetailed = (task.taskType === 'detailed' || task.task_type === 'detailed');
                const getPriorityColor = (priority) => {
                  switch (priority) {
                    case 'high': return theme.colors.error;
                    case 'medium': return theme.colors.warning || '#FF9800';
                    case 'low': return theme.colors.primary;
                    default: return theme.colors.onSurfaceVariant;
                  }
                };
                
                return (
                  <Card
                    key={task.id}
                    style={[
                      {
                        backgroundColor: theme.colors.surfaceVariant,
                        borderRadius: 0,
                        marginBottom: 0,
                        borderWidth: 0,
                      },
                      index === 0 && { borderTopLeftRadius: theme.roundness, borderTopRightRadius: theme.roundness },
                      index === displayTasks.slice(0, 2).length - 1 && { borderBottomLeftRadius: theme.roundness, borderBottomRightRadius: theme.roundness, marginBottom: 0 },
                      index < displayTasks.slice(0, 2).length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.colors.outline },
                    ]}
                    onPress={() => navigation?.navigate('TaskDetail', { taskId: task.id })}
                    mode="flat"
                  >
                    <Card.Content style={{
                      paddingHorizontal: isTablet ? 20 : 16,
                      paddingVertical: isTablet ? 20 : 16,
                      width: '100%',
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        marginBottom: 8,
                      }}>
                        <View style={{ flex: 1 }}>
                          <Text variant="titleMedium" style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: theme.colors.onSurface,
                            marginBottom: 4,
                          }}>
                            {task.title}
                          </Text>
                          {task.description && (
                            <Text variant="bodyMedium" style={{
                              fontSize: 14,
                              color: theme.colors.onSurfaceVariant,
                              lineHeight: 20,
                            }} numberOfLines={2}>
                              {task.description}
                            </Text>
                          )}
                        </View>
                        {isDetailed && (
                          <Chip 
                            mode="flat" 
                            compact
                            style={{
                              backgroundColor: theme.colors.primaryContainer,
                            }}
                            textStyle={{
                              color: theme.colors.onPrimaryContainer,
                              fontSize: 10,
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
                            }}
                            textStyle={{
                              color: theme.colors.onSecondaryContainer,
                              fontSize: 10,
                            }}
                          >
                            Nhanh
                          </Chip>
                        )}
                      </View>
                      
                      {isDetailed ? (
                        /* Task chi tiết */
                        <View style={{ gap: 8 }}>
                          <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 6,
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
                                fontSize: 11,
                                fontWeight: '600',
                              }}
                              style={{
                                backgroundColor: getPriorityColor(task.priority) + '20',
                              }}
                            >
                              {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
                            </Chip>
                            <Chip mode="flat" compact>
                              {task.status === 'in_progress' ? 'Đang làm' : task.status === 'completed' ? 'Hoàn thành' : 'Chờ xử lý'}
                            </Chip>
                          </View>
                          {task.subtasks && task.subtasks.length > 0 && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                            }}>
                              <SolarIcon name="List" size={14} color={theme.colors.onSurfaceVariant} type="outline" />
                              <Text style={{
                                fontSize: 12,
                                color: theme.colors.onSurfaceVariant,
                              }}>
                                {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                              </Text>
                            </View>
                          )}
                          <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 8,
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
                          {/* Assigned Users */}
                          {task.assignedUsers && task.assignedUsers.length > 0 && (
                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              marginTop: 4,
                            }}>
                              <SolarIcon name="Users" size={12} color={theme.colors.onSurfaceVariant} type="outline" />
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginLeft: -4,
                              }}>
                                {task.assignedUsers.slice(0, 3).map((user, userIndex) => (
                                  <Avatar.Text
                                    key={userIndex}
                                    size={20}
                                    label={user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                    style={{
                                      backgroundColor: theme.colors.primaryContainer,
                                      marginLeft: userIndex > 0 ? -8 : 0,
                                      borderWidth: 1,
                                      borderColor: theme.colors.surface,
                                    }}
                                    labelStyle={{
                                      color: theme.colors.onPrimaryContainer,
                                      fontSize: 9,
                                    }}
                                  />
                                ))}
                                {task.assignedUsers.length > 3 && (
                                  <View style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderWidth: 1,
                                    borderColor: theme.colors.surface,
                                    marginLeft: -8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                    <Text style={{
                                      fontSize: 8,
                                      color: theme.colors.onSurfaceVariant,
                                      fontWeight: '600',
                                    }}>
                                      +{task.assignedUsers.length - 3}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text style={{
                                fontSize: 10,
                                color: theme.colors.onSurfaceVariant,
                                marginLeft: 4,
                              }}>
                                {task.assignedUsers.length} người
                              </Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        /* Task nhanh */
                        <View style={{ gap: 8 }}>
                          <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 6,
                          }}>
                            <Chip
                              mode="flat"
                              compact
                              textStyle={{
                                color: getPriorityColor(task.priority),
                                fontSize: 11,
                                fontWeight: '600',
                              }}
                              style={{
                                backgroundColor: getPriorityColor(task.priority) + '20',
                              }}
                            >
                              {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'TB' : 'Thấp'}
                            </Chip>
                            {task.deadline && (
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 4,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                backgroundColor: theme.colors.surface,
                                borderRadius: theme.roundness,
                              }}>
                                <SolarIcon name="Calendar" size={12} color={theme.colors.onSurfaceVariant} type="outline" />
                                <Text style={{
                                  fontSize: 11,
                                  color: theme.colors.onSurfaceVariant,
                                }}>
                                  {new Date(task.deadline).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                </Text>
                              </View>
                            )}
                          </View>
                          {task.tags && task.tags.length > 0 && (
                            <View style={{
                              flexDirection: 'row',
                              flexWrap: 'wrap',
                              gap: 4,
                            }}>
                              {task.tags.map((tag, tagIndex) => (
                                <Chip
                                  key={tagIndex}
                                  mode="flat"
                                  compact
                                  style={{
                                    backgroundColor: theme.colors.primaryContainer,
                                    height: 24,
                                  }}
                                  textStyle={{
                                    color: theme.colors.onPrimaryContainer,
                                    fontSize: 10,
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
                              marginTop: 4,
                            }}>
                              <SolarIcon name="Users" size={12} color={theme.colors.onSurfaceVariant} type="outline" />
                              <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginLeft: -4,
                              }}>
                                {task.assignedUsers.slice(0, 3).map((user, userIndex) => (
                                  <Avatar.Text
                                    key={userIndex}
                                    size={20}
                                    label={user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                    style={{
                                      backgroundColor: theme.colors.secondaryContainer,
                                      marginLeft: userIndex > 0 ? -8 : 0,
                                      borderWidth: 1,
                                      borderColor: theme.colors.surface,
                                    }}
                                    labelStyle={{
                                      color: theme.colors.onSecondaryContainer,
                                      fontSize: 9,
                                    }}
                                  />
                                ))}
                                {task.assignedUsers.length > 3 && (
                                  <View style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    backgroundColor: theme.colors.surfaceVariant,
                                    borderWidth: 1,
                                    borderColor: theme.colors.surface,
                                    marginLeft: -8,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                  }}>
                                    <Text style={{
                                      fontSize: 8,
                                      color: theme.colors.onSurfaceVariant,
                                      fontWeight: '600',
                                    }}>
                                      +{task.assignedUsers.length - 3}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text style={{
                                fontSize: 10,
                                color: theme.colors.onSurfaceVariant,
                                marginLeft: 4,
                              }}>
                                {task.assignedUsers.length} người
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </Card.Content>
                  </Card>
                );
              })
            )}
          </View>

          {alertVisible && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.inverseSurface,
              borderRadius: theme.roundness,
              padding: 16,
              marginTop: 12,
              marginHorizontal: isTablet ? 20 : 16,
              marginBottom: isTablet ? 20 : 16,
              gap: 12,
            }}>
              <SolarIcon name="ChatRound" size={20} color={theme.colors.inverseOnSurface} type="bold" />
              <Text style={{
                flex: 1,
                fontSize: 14,
                color: theme.colors.inverseOnSurface,
                fontWeight: '500',
              }}>
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
