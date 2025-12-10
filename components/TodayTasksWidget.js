import React, { useState, useEffect } from 'react';
import { View, Dimensions, Platform, TouchableOpacity } from 'react-native';
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
    start_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    taskType: 'detailed', // Task chi tiết
    subtasks: [
      { id: 1, title: 'Thu thập dữ liệu', completed: true },
      { id: 2, title: 'Viết báo cáo', completed: true },
      { id: 3, title: 'Chuẩn bị presentation', completed: false },
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
              </View>
            ) : displayTasks.length === 0 ? (
              <View style={{ paddingHorizontal: isTablet ? 20 : 16, paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}>
                  Không có task nào hôm nay
                </Text>
              </View>
            ) : (
              displayTasks.slice(0, 2).map((task, index) => {
                const isDetailed = task.taskType === 'detailed';
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
