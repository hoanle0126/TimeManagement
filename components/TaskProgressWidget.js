import React, { useState } from 'react';
import { View, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { SolarIcon } from 'react-native-solar-icons';
import { createShadow } from '../utils/shadow';
import { useAppSelector } from '../store/hooks';
import DateTimePickerModal from './DateTimePickerModal';

// Flag để bật/tắt mock data từ JSON (true = dùng JSON, false = dùng data từ backend)
const USE_MOCK_DATA = false;

export default function TaskProgressWidget({ task: propTask }) {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const maxHeight = 120;

  // State cho date picker
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Lấy tasks từ Redux state (backend)
  const { todayTasks, tasks } = useAppSelector((state) => state.tasks);

  // Tạo mock data động dựa trên tuần của selectedDate
  const generateMockTasks = React.useMemo(() => {
    if (!USE_MOCK_DATA) return [];
    
    const selected = new Date(selectedDate);
    const dayOfWeek = selected.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(selected);
    monday.setDate(selected.getDate() + mondayOffset);
    
    // Tính các ngày trong tuần
    const tuesday = new Date(monday); // Thứ 2 (i=0)
    tuesday.setDate(monday.getDate() + 0);
    const friday = new Date(monday); // Thứ 5 (i=3)
    friday.setDate(monday.getDate() + 3);
    const saturday = new Date(monday); // Thứ 6 (i=4)
    saturday.setDate(monday.getDate() + 4);
    
    // Format dates
    const formatDate = (date) => {
      return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
    };
    
    const mockTasks = [];
    
    // Thứ 2: 3 tasks
    for (let i = 1; i <= 3; i++) {
      mockTasks.push({
        id: `monday-${i}`,
        title: `Task hoàn thành thứ 2 - ${i}`,
        description: `Task mẫu hoàn thành vào thứ 2`,
        category: 'Công việc',
        progress: 100,
        priority: i === 1 ? 'high' : i === 2 ? 'medium' : 'low',
        status: 'completed',
        start_date: formatDate(new Date(tuesday.getTime() - 7 * 24 * 60 * 60 * 1000)),
        due_date: formatDate(new Date(tuesday.getTime() + 7 * 24 * 60 * 60 * 1000)),
        created_at: formatDate(new Date(tuesday.getTime() - 14 * 24 * 60 * 60 * 1000)),
        updated_at: formatDate(tuesday),
        taskType: i % 2 === 0 ? 'quick' : 'detailed',
        task_type: i % 2 === 0 ? 'quick' : 'detailed',
        assignedUsers: [],
      });
    }
    
    // Thứ 5: 7 tasks
    for (let i = 1; i <= 7; i++) {
      mockTasks.push({
        id: `friday-${i}`,
        title: `Task hoàn thành thứ 5 - ${i}`,
        description: `Task mẫu hoàn thành vào thứ 5`,
        category: 'Công việc',
        progress: 100,
        priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
        status: 'completed',
        start_date: formatDate(new Date(friday.getTime() - 7 * 24 * 60 * 60 * 1000)),
        due_date: formatDate(new Date(friday.getTime() + 7 * 24 * 60 * 60 * 1000)),
        created_at: formatDate(new Date(friday.getTime() - 14 * 24 * 60 * 60 * 1000)),
        updated_at: formatDate(friday),
        taskType: i % 2 === 0 ? 'quick' : 'detailed',
        task_type: i % 2 === 0 ? 'quick' : 'detailed',
        assignedUsers: [],
      });
    }
    
    // Thứ 6: 1 task
    mockTasks.push({
      id: 'saturday-1',
      title: 'Task hoàn thành thứ 6 - 1',
      description: 'Task mẫu hoàn thành vào thứ 6',
      category: 'Công việc',
      progress: 100,
      priority: 'high',
      status: 'completed',
      start_date: formatDate(new Date(saturday.getTime() - 7 * 24 * 60 * 60 * 1000)),
      due_date: formatDate(new Date(saturday.getTime() + 7 * 24 * 60 * 60 * 1000)),
      created_at: formatDate(new Date(saturday.getTime() - 14 * 24 * 60 * 60 * 1000)),
      updated_at: formatDate(saturday),
      taskType: 'detailed',
      task_type: 'detailed',
      assignedUsers: [],
    });
    
    return mockTasks;
  }, [selectedDate]);

  // Lấy tất cả tasks để đếm completed tasks
  const allTasks = React.useMemo(() => {
    if (USE_MOCK_DATA) {
      return generateMockTasks;
    }
    return [...(todayTasks || []), ...(tasks || [])];
  }, [todayTasks, tasks, USE_MOCK_DATA, generateMockTasks]);

  // Tính toán 7 ngày trong tuần (thứ 2 đến chủ nhật) dựa trên selectedDate
  const generateWeekData = () => {
    const weekData = [];
    const selected = new Date(selectedDate);
    
    // Tìm thứ 2 của tuần chứa selectedDate
    const dayOfWeek = selected.getDay(); // 0 = Chủ nhật, 1 = Thứ 2, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Điều chỉnh để thứ 2 = 0
    const monday = new Date(selected);
    monday.setDate(selected.getDate() + mondayOffset);
    
    // Tạo 7 ngày từ thứ 2 đến chủ nhật
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      // Đếm số task completed trong ngày này
      const dateStr = date.toISOString().split('T')[0];
      const completedCount = allTasks.filter(task => {
        if (task.status !== 'completed') return false;
        
        // Kiểm tra updated_at hoặc completed_at
        if (task.updated_at) {
          const taskDate = new Date(task.updated_at).toISOString().split('T')[0];
          return taskDate === dateStr;
        }
        return false;
      }).length;
      
      // Kiểm tra xem có phải ngày được chọn không
      const isSelected = date.toDateString() === selected.toDateString();
      
      weekData.push({
        date: new Date(date),
        day: date.getDate(),
        dayOfWeek: i, // 0 = Thứ 2, 6 = Chủ nhật
        completedCount,
        isSelected,
      });
    }
    
    return weekData;
  };

  const weekData = generateWeekData();
  
  // Tên thứ trong tuần
  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Format ngày tháng năm
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Tính chiều cao cột dựa trên số task hoàn thành (chỉ tính từ những ngày có task)
  const getMaxCompletedCount = () => {
    const tasksDays = weekData.filter(d => d.completedCount > 0);
    if (tasksDays.length === 0) return 1;
    return Math.max(1, ...tasksDays.map(d => d.completedCount));
  };

  const maxCompletedCount = getMaxCompletedCount();

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
              onPress={() => setShowDatePicker(true)}
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
              {weekData.map((item, index) => {
                // Tính chiều cao cột dựa trên số task hoàn thành
                const height = item.completedCount > 0 && maxCompletedCount > 0
                  ? Math.max(8, (item.completedCount / maxCompletedCount) * maxHeight)
                  : 0;
                
                // Màu: ngày được chọn = đen, còn lại = xanh lá
                const backgroundColor = item.isSelected 
                  ? '#000000' 
                  : (theme.colors.success || '#4CAF50');
                
                const textColor = item.isSelected 
                  ? '#FFFFFF' 
                  : theme.colors.onSurface;
                
                return (
                  <View key={index} style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}>
                    {/* Chỉ hiển thị cột nếu có task hoàn thành */}
                    {item.completedCount > 0 ? (
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
                          backgroundColor: backgroundColor,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: textColor,
                          }}>
                            {item.completedCount}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View style={{
                        width: '100%',
                        height: 8,
                        marginBottom: 4,
                      }} />
                    )}
                    <Text style={{
                      fontSize: 10,
                      fontWeight: '600',
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 4,
                      textAlign: 'center',
                    }}>
                      {dayNames[item.dayOfWeek]}
                    </Text>
                    <Text style={{
                      fontSize: 8,
                      color: theme.colors.onSurfaceVariant,
                      marginTop: 2,
                      textAlign: 'center',
                    }}>
                      {formatDate(item.date)}
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
            <SolarIcon name="CheckCircle" size={20} color={theme.colors.success || '#4CAF50'} type="bold" />
            <Text style={{
              flex: 1,
              fontSize: 14,
              color: theme.colors.onSurfaceVariant,
              fontWeight: '500',
            }}>
              Tổng cộng {weekData.reduce((sum, d) => sum + d.completedCount, 0)} task đã hoàn thành trong tuần này
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

      {/* Date Picker Modal */}
      <DateTimePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(date) => {
          setSelectedDate(date);
          setShowDatePicker(false);
        }}
        value={selectedDate}
        title="Chọn ngày"
      />
    </View>
  );
}
