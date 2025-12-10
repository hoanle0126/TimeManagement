import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { createShadow } from '../utils/shadow';

const timelineTasks = [
  { name: 'Interview', start: 12, end: 14, color: 'warning' },
  { name: 'Ideate', start: 13, end: 15, color: 'success' },
  { name: 'Wireframe', start: 14, end: 16, color: 'info' },
  { name: 'Evaluate', start: 15, end: 17, color: 'primary' },
];

const currentDay = 16;
const days = [12, 13, 14, 15, 16, 17, 18];

export default function TaskTimelineWidget() {
  const theme = useTheme();
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  const totalDays = days.length;

  const getTaskColor = (colorType) => {
    switch (colorType) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'info':
        return theme.colors.info;
      case 'primary':
        return theme.colors.primary;
      default:
        return theme.colors.primary;
    }
  };

  const getTaskPosition = (start, end) => {
    const startIndex = days.indexOf(start);
    const endIndex = days.indexOf(end);
    const left = (startIndex / totalDays) * 100;
    const width = ((endIndex - startIndex + 1) / totalDays) * 100;
    return { left: `${left}%`, width: `${width}%` };
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.roundness * 1.33,
    },
    cardContent: {
      padding: isTablet ? 20 : 16,
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
      fontSize: isTablet ? 18 : 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
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
      borderRadius: theme.roundness,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 8,
      top: 0,
    },
    taskName: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.onPrimary,
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
      marginBottom: 4,
    },
    currentDayLine: {
      flex: 1,
      width: 2,
    },
    daysContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    dayContainer: {
      flex: 1,
      alignItems: 'center',
    },
    dayText: {
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '500',
    },
  });

  const cardShadow = createShadow({
    color: theme.colors.shadow,
    offsetY: 2,
    opacity: 0.1,
    radius: 8,
    elevation: 3,
  });

  return (
    <View style={styles.container}>
      <Card style={[styles.card, cardShadow]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="clipboard" size={20} color={theme.colors.onSurface} />
              <Text style={styles.title}>Task Timeline</Text>
            </View>
            <IconButton
              icon="dots-horizontal"
              iconColor={theme.colors.onSurfaceVariant}
              size={20}
              onPress={() => {}}
            />
          </View>

          <View style={styles.timelineContainer}>
            <View style={styles.timeline}>
              {timelineTasks.map((task, index) => {
                const position = getTaskPosition(task.start, task.end);
                const taskColor = getTaskColor(task.color);
                return (
                  <View
                    key={index}
                    style={[
                      styles.taskBar,
                      {
                        left: position.left,
                        width: position.width,
                        backgroundColor: taskColor,
                      },
                    ]}
                  >
                    <Text style={styles.taskName}>{task.name}</Text>
                  </View>
                );
              })}
              
              <View
                style={[
                  styles.currentDayIndicator,
                  { left: `${(days.indexOf(currentDay) / totalDays) * 100}%` },
                ]}
              >
                <View style={[
                  styles.currentDayCircle,
                  { backgroundColor: theme.colors.warning },
                ]} />
                <View style={[
                  styles.currentDayLine,
                  { backgroundColor: theme.colors.warning },
                ]} />
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
        </Card.Content>
      </Card>
    </View>
  );
}
