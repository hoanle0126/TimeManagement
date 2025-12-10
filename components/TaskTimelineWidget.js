import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const timelineTasks = [
  { name: 'Interview', start: 12, end: 14, color: '#FF9800' },
  { name: 'Ideate', start: 13, end: 15, color: '#4CAF50' },
  { name: 'Wireframe', start: 14, end: 16, color: '#2196F3' },
  { name: 'Evaluate', start: 15, end: 17, color: '#1A1A1A' },
];

const currentDay = 16;
const days = [12, 13, 14, 15, 16, 17, 18];

export default function TaskTimelineWidget() {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const totalDays = days.length;

  const getTaskPosition = (start, end) => {
    const startIndex = days.indexOf(start);
    const endIndex = days.indexOf(end);
    const left = (startIndex / totalDays) * 100;
    const width = ((endIndex - startIndex + 1) / totalDays) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  return (
    <View style={[styles.container, isTablet && styles.containerTablet]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="clipboard" size={20} color="#1A1A1A" />
          <Text style={[styles.title, isTablet && styles.titleTablet]}>Task Timeline</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
      </View>

      <View style={styles.timelineContainer}>
        <View style={styles.timeline}>
          {timelineTasks.map((task, index) => {
            const position = getTaskPosition(task.start, task.end);
            return (
              <View
                key={index}
                style={[
                  styles.taskBar,
                  {
                    left: position.left,
                    width: position.width,
                    backgroundColor: task.color,
                  },
                ]}
              >
                <Text style={styles.taskName}>{task.name}</Text>
              </View>
            );
          })}
          
          {/* Current day indicator */}
          <View
            style={[
              styles.currentDayIndicator,
              { left: `${(days.indexOf(currentDay) / totalDays) * 100}%` },
            ]}
          >
            <View style={styles.currentDayCircle} />
            <View style={styles.currentDayLine} />
          </View>
        </View>

        <View style={styles.daysContainer}>
          {days.map((day, index) => (
            <View key={index} style={styles.dayContainer}>
              <Text style={styles.dayText}>{day}</Text>
            </View>
          ))}
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
    marginBottom: 20,
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
  timelineContainer: {
    marginTop: 8,
  },
  timeline: {
    height: 120,
    position: 'relative',
    marginBottom: 20,
  },
  taskBar: {
    position: 'absolute',
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    top: 0,
  },
  taskName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentDayIndicator: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: '100%',
    alignItems: 'center',
  },
  currentDayCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9800',
    marginBottom: 4,
  },
  currentDayLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#FF9800',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

