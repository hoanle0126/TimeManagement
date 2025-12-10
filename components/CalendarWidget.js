import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Card, Text, IconButton, Chip, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const calendarData = {
  2: 'success',
  3: 'success',
  5: 'success',
  6: 'success',
  8: 'success',
  10: 'primary',
  14: 'success',
  16: 'warning',
  20: 'success',
  21: 'success',
  23: 'success',
  24: 'success',
  25: 'primary',
  28: 'success',
  29: 'success',
};

export default function CalendarWidget() {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const [currentMonth] = useState(1);
  const [currentYear] = useState(2024);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'primary':
        return theme.colors.primary;
      default:
        return 'transparent';
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const today = new Date().getDate();

  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const status = calendarData[day];
      const isToday = day === today;
      const statusColor = status ? getStatusColor(status) : null;
      
      days.push(
        <View
          key={day}
          style={[
            styles.dayCell,
            statusColor && {
              backgroundColor: statusColor,
              borderRadius: theme.roundness * 1.33,
            },
            isToday && !statusColor && {
              borderWidth: 2,
              borderColor: theme.colors.primary,
              borderRadius: theme.roundness * 1.33,
            },
          ]}
        >
          <Text
            style={[
              styles.dayText,
              statusColor && { color: theme.colors.onPrimary },
              isToday && !statusColor && { 
                color: theme.colors.primary,
                fontWeight: 'bold',
              },
            ]}
          >
            {day}
          </Text>
        </View>
      );
    }

    return days;
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness * 1.33,
      ...(Platform.OS === 'web' 
        ? { boxShadow: `0 2px 8px ${theme.colors.shadow}1A` }
        : {
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }
      ),
    },
    cardContent: {
      padding: isTablet ? 20 : 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
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
    monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    monthText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    calendar: {
      marginTop: 8,
    },
    daysOfWeek: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 8,
    },
    dayOfWeekText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onSurfaceVariant,
      width: 32,
      textAlign: 'center',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    dayText: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="calendar" size={20} color={theme.colors.onSurface} />
              <Text style={styles.title}>Calendar</Text>
            </View>
            <View style={styles.monthSelector}>
              <Text style={styles.monthText}>{months[currentMonth]}</Text>
              <Ionicons name="chevron-down" size={16} color={theme.colors.onSurfaceVariant} />
            </View>
          </View>

          <View style={styles.calendar}>
            <View style={styles.daysOfWeek}>
              {daysOfWeek.map((day, index) => (
                <Text key={index} style={styles.dayOfWeekText}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {renderCalendarDays()}
            </View>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
}
