import React from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { SolarIcon } from 'react-native-solar-icons';
import { createShadow } from '../utils/shadow';

export default function TaskProgressWidget({ task }) {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const maxHeight = 120;
  const maxValue = 100;

  // Tính toán progress data từ task
  const generateProgressData = () => {
    if (!task || task.taskType !== 'detailed' || !task.start_date) {
      return [];
    }

    const today = new Date();
    const startDate = new Date(task.start_date);
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const currentProgress = task.progress || 0;
    
    // Tạo dữ liệu cho 7 ngày gần nhất (3 ngày trước, hôm nay, 3 ngày sau)
    const progressData = [];
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const day = date.getDate();
      
      // Tính progress ước tính cho ngày đó
      let estimatedProgress = 0;
      let change = 0;
      let color = 'success';
      
      if (i < 0) {
        // Ngày trong quá khứ - tính dựa trên timeline
        const daysSinceStart = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
        const totalDays = dueDate 
          ? Math.floor((dueDate - startDate) / (1000 * 60 * 60 * 24))
          : 7;
        
        if (daysSinceStart >= 0 && totalDays > 0) {
          estimatedProgress = Math.min(100, Math.max(0, (daysSinceStart / totalDays) * 100));
        }
        change = i === -1 ? 5 : Math.floor(Math.random() * 10) + 1;
      } else if (i === 0) {
        // Hôm nay - dùng progress thực tế
        estimatedProgress = currentProgress;
        change = 8; // Mức tăng ước tính
      } else {
        // Ngày tương lai - ước tính dựa trên tốc độ hiện tại
        const daysSinceStart = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
        const totalDays = dueDate 
          ? Math.floor((dueDate - startDate) / (1000 * 60 * 60 * 24))
          : 7;
        
        if (daysSinceStart >= 0 && totalDays > 0) {
          estimatedProgress = Math.min(100, Math.max(currentProgress, (daysSinceStart / totalDays) * 100));
        } else {
          estimatedProgress = currentProgress;
        }
        change = Math.floor(Math.random() * 8) + 3;
      }
      
      // Xác định màu dựa trên tốc độ
      if (change >= 10) {
        color = 'warning';
      } else {
        color = 'success';
      }
      
      progressData.push({
        day,
        value: i === 0 ? estimatedProgress : null,
        change,
        color,
        isCurrent: i === 0,
      });
    }
    
    return progressData;
  };

  const progressData = generateProgressData();

  const getColor = (colorType) => {
    switch (colorType) {
      case 'success':
        return theme.colors.success || '#4CAF50';
      case 'warning':
        return theme.colors.warning || '#FF9800';
      default:
        return theme.colors.primary;
    }
  };

  // Nếu không có task hoặc không phải task chi tiết, không hiển thị
  if (!task || task.taskType !== 'detailed' || progressData.length === 0) {
    return null;
  }

  const cardShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 2,
    opacity: 0.1,
    radius: 8,
    elevation: 3,
  });

  // Tính toán thông điệp động viên
  const getProgressMessage = () => {
    const progress = task.progress || 0;
    if (progress >= 80) {
      return { icon: 'Like', message: 'Tiến độ rất tốt! Bạn đang làm rất tốt! 🎉', color: theme.colors.success || '#4CAF50' };
    } else if (progress >= 50) {
      return { icon: 'Like', message: 'Tiến độ tốt, tiếp tục phát huy! 👍', color: theme.colors.success || '#4CAF50' };
    } else if (progress >= 25) {
      return { icon: 'Info', message: 'Đang có tiến độ, cố gắng thêm nhé! 💪', color: theme.colors.warning || '#FF9800' };
    } else {
      return { icon: 'Alert', message: 'Hãy bắt đầu làm việc để có tiến độ! 🚀', color: theme.colors.warning || '#FF9800' };
    }
  };

  const progressMessage = getProgressMessage();

  return (
    <View style={{ marginBottom: 16 }}>
      <Card style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.roundness * 1.33,
        },
        cardShadow,
      ]}>
        <Card.Content style={{ padding: isTablet ? 20 : 16 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}>
              <SolarIcon name="Clipboard" size={20} color={theme.colors.onSurface} type="outline" />
              <Text style={{
                fontSize: isTablet ? 18 : 16,
                fontWeight: '600',
                color: theme.colors.onSurface,
              }}>
                Tiến độ Task
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {}}
              style={{ padding: 4 }}
            >
              <SolarIcon name="MenuDots" size={20} color={theme.colors.onSurfaceVariant} type="outline" />
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 16 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: 140,
              paddingBottom: 30,
            }}>
              {progressData.map((item, index) => {
                const height = item.value 
                  ? (item.value / maxValue) * maxHeight 
                  : Math.max(8, (item.change / 20) * maxHeight);
                const color = getColor(item.color);
                
                return (
                  <View key={index} style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}>
                    {item.isCurrent ? (
                      <View style={{
                        alignItems: 'center',
                        width: '100%',
                      }}>
                        <View style={[
                          {
                            width: '80%',
                            borderRadius: theme.roundness,
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            paddingTop: 8,
                            marginBottom: 4,
                            height: height + 20,
                            backgroundColor: theme.colors.inverseSurface,
                          }
                        ]}>
                          <Text style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            marginBottom: 4,
                            color: theme.colors.inverseOnSurface,
                          }}>
                            {Math.round(item.value)}%
                          </Text>
                          <View style={{
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 4,
                            backgroundColor: theme.colors.warning || '#FF9800',
                          }}>
                            <Text style={{
                              fontSize: 10,
                              fontWeight: 'bold',
                              color: theme.colors.onWarning || theme.colors.onSurface,
                            }}>
                              +{item.change}%
                            </Text>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View style={{
                        alignItems: 'center',
                        width: '100%',
                      }}>
                        <View style={{
                          width: '60%',
                          minHeight: 8,
                          borderRadius: 4,
                          marginBottom: 4,
                          height: height,
                          backgroundColor: color,
                        }} />
                        <Text style={{
                          fontSize: 10,
                          fontWeight: '600',
                          marginBottom: 4,
                          color: color,
                        }}>
                          +{item.change}%
                        </Text>
                      </View>
                    )}
                    <Text style={{
                      fontSize: 12,
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 4,
                    }}>
                      {item.day}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: theme.roundness,
            padding: 16,
            gap: 12,
          }}>
            <SolarIcon name={progressMessage.icon} size={20} color={progressMessage.color} type="bold" />
            <Text style={{
              flex: 1,
              fontSize: 14,
              color: theme.colors.onSurfaceVariant,
              fontWeight: '500',
            }}>
              {progressMessage.message}
            </Text>
            <TouchableOpacity
              onPress={() => {}}
              style={{ padding: 4 }}
            >
              <SolarIcon name="CloseCircle" size={20} color={theme.colors.onSurfaceVariant} type="outline" />
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}
