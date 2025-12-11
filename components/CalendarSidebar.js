import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { SolarIcon } from 'react-native-solar-icons';

const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const miniDaysOfWeek = ['Cn', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function CalendarSidebar({ 
  currentDate, 
  onDateChange, 
  selectedDate, 
  onSelectDate 
}) {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = useState({
    myCalendar: false,
    otherCalendars: false,
  });

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + 1);
    onDateChange(newDate);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const daysInPrevMonth = getDaysInMonth(currentMonth - 1, currentYear);

  const isSameDate = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const renderMiniCalendar = () => {
    const days = [];
    
    // Ngày của tháng trước
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const date = new Date(currentYear, currentMonth - 1, day);
      const isSelected = isSameDate(date, selectedDate);
      
      days.push(
        <TouchableOpacity
          key={`prev-${day}`}
          style={{
            width: '14.28%',
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 2,
            ...(isSelected && {
              backgroundColor: '#2196F3',
              borderRadius: 12,
            }),
          }}
          onPress={() => onSelectDate(date)}
        >
          <Text style={{
            fontSize: 12,
            color: theme.colors.onSurfaceVariant,
            opacity: 0.5,
          }}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // Ngày của tháng hiện tại
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isSelected = isSameDate(date, selectedDate);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={{
            width: '14.28%',
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 2,
            ...(isSelected && {
              backgroundColor: '#2196F3',
              borderRadius: 12,
            }),
          }}
          onPress={() => onSelectDate(date)}
        >
          <Text style={{
            fontSize: 12,
            color: isSelected ? '#FFFFFF' : theme.colors.onSurface,
            fontWeight: isSelected ? '600' : 'normal',
          }}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // Ngày của tháng sau
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const date = new Date(currentYear, currentMonth + 1, day);
      const isSelected = isSameDate(date, selectedDate);
      
      days.push(
        <TouchableOpacity
          key={`next-${day}`}
          style={{
            width: '14.28%',
            aspectRatio: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 2,
            ...(isSelected && {
              backgroundColor: '#2196F3',
              borderRadius: 12,
            }),
          }}
          onPress={() => onSelectDate(date)}
        >
          <Text style={{
            fontSize: 12,
            color: theme.colors.onSurfaceVariant,
            opacity: 0.5,
          }}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={{
      width: 280,
      padding: 16,
      backgroundColor: theme.colors.surface,
      borderRightWidth: 1,
      borderRightColor: theme.colors.outline || '#E0E0E0',
    }}>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <TouchableOpacity style={{ padding: 4 }} onPress={handlePrevMonth}>
          <SolarIcon name="ArrowLeft" size={20} color={theme.colors.onSurface} type="outline" />
        </TouchableOpacity>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.onSurface,
        }}>
          {months[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity style={{ padding: 4 }} onPress={handleNextMonth}>
          <SolarIcon name="ArrowRight" size={20} color={theme.colors.onSurface} type="outline" />
        </TouchableOpacity>
      </View>

      <View style={{
        marginBottom: 24,
      }}>
        <View style={{
          flexDirection: 'row',
          marginBottom: 8,
        }}>
          {miniDaysOfWeek.map((day, index) => (
            <Text key={index} style={{
              fontSize: 11,
              fontWeight: '600',
              color: theme.colors.onSurfaceVariant,
              flex: 1,
              textAlign: 'center',
            }}>
              {day}
            </Text>
          ))}
        </View>
        <View style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
        }}>
          {renderMiniCalendar()}
        </View>
      </View>

      <TouchableOpacity style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 8,
        marginBottom: 24,
      }}>
        <SolarIcon name="User" size={20} color={theme.colors.onSurface} type="outline" />
        <Text style={{
          marginLeft: 8,
          fontSize: 14,
          color: theme.colors.onSurface,
          fontWeight: '500',
        }}>Tìm người</Text>
      </TouchableOpacity>

      <View style={{
        marginBottom: 16,
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
          }}
          onPress={() => {}}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}>Trang đặt lịch hẹn</Text>
          <SolarIcon name="AddCircle" size={18} color={theme.colors.onSurfaceVariant} type="outline" />
        </TouchableOpacity>
      </View>

      <View style={{
        marginBottom: 16,
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
          }}
          onPress={() => toggleSection('myCalendar')}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}>Lịch của tôi</Text>
          <SolarIcon 
            name={expandedSections.myCalendar ? "ArrowDown" : "ArrowRight"} 
            size={18} 
            color={theme.colors.onSurfaceVariant} 
            type="outline" 
          />
        </TouchableOpacity>
      </View>

      <View style={{
        marginBottom: 16,
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
          }}
          onPress={() => toggleSection('otherCalendars')}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.onSurface,
          }}>Lịch khác</Text>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
            <SolarIcon name="AddCircle" size={18} color={theme.colors.onSurfaceVariant} type="outline" />
            <SolarIcon 
              name={expandedSections.otherCalendars ? "ArrowDown" : "ArrowRight"} 
              size={18} 
              color={theme.colors.onSurfaceVariant} 
              type="outline" 
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

