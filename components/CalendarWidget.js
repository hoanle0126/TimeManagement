import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Sample data for February
const calendarData = {
  2: 'green',
  3: 'green',
  5: 'green',
  6: 'green',
  8: 'green',
  10: 'black',
  14: 'green',
  16: 'orange',
  20: 'green',
  21: 'green',
  23: 'green',
  24: 'green',
  25: 'black',
  28: 'green',
  29: 'green',
};

export default function CalendarWidget() {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const [currentMonth] = useState(1); // February (0-indexed)
  const [currentYear] = useState(2024);

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const today = new Date().getDate();

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const status = calendarData[day];
      const isToday = day === today;
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            status && styles[`dayCell${status.charAt(0).toUpperCase() + status.slice(1)}`],
            isToday && styles.dayCellToday,
          ]}
        >
          <Text
            style={[
              styles.dayText,
              status && styles[`dayText${status.charAt(0).toUpperCase() + status.slice(1)}`],
              isToday && styles.dayTextToday,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="calendar" size={20} color="#1A1A1A" />
          <Text style={[styles.title, isTablet && styles.titleTablet]}>Calendar</Text>
        </View>
        <View style={styles.monthSelector}>
          <Text style={styles.monthText}>{months[currentMonth]}</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...(Platform.OS === 'web' 
      ? { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }
    ),
  },
  containerTablet: {
    padding: 20,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  titleTablet: {
    fontSize: 18,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
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
    color: '#999',
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
    color: '#999',
    fontWeight: '500',
  },
  dayCellGreen: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
  },
  dayTextGreen: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayCellBlack: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
  },
  dayTextBlack: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayCellOrange: {
    backgroundColor: '#FF9800',
    borderRadius: 16,
  },
  dayTextOrange: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  dayTextToday: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

