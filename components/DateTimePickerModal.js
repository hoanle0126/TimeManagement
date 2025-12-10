import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { 
  Text, 
  Button, 
  IconButton,
  useTheme,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function DateTimePickerModal({
  visible,
  onClose,
  onConfirm,
  value,
  title,
  minimumDate,
}) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value.getFullYear(), value.getMonth(), 1) : new Date()
  );

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
    setSelectedDate(newDate);
  };

  const handleTimeChange = (event, time) => {
    if (time) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.getHours(), time.getMinutes());
      setSelectedDate(newDate);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
    onClose();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const selectedDay = selectedDate.getDate();
  const selectedMonth = selectedDate.getMonth();
  const selectedYear = selectedDate.getFullYear();
  const isCurrentMonth =
    currentMonth.getMonth() === selectedMonth &&
    currentMonth.getFullYear() === selectedYear;

  const renderCalendarDays = () => {
    const days = [];
    const today = new Date();
    const minDate = minimumDate || today;

    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isSelected = isCurrentMonth && day === selectedDay;
      const isDisabled = dayDate < minDate && dayDate.toDateString() !== minDate.toDateString();

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.calendarDay,
            isSelected && styles.calendarDaySelected,
            isDisabled && styles.calendarDayDisabled,
          ]}
          onPress={() => !isDisabled && handleDateSelect(day)}
          disabled={isDisabled}
        >
          <Text
            style={[
              styles.calendarDayText,
              isSelected && styles.calendarDayTextSelected,
              isDisabled && styles.calendarDayTextDisabled,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.roundness * 1.33,
      width: Platform.OS === 'web' ? 600 : '90%',
      maxWidth: 600,
      padding: 20,
      ...(Platform.OS === 'web'
        ? { boxShadow: `0 8px 32px ${theme.colors.shadow}66` }
        : {
            shadowColor: theme.colors.shadow,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 32,
            elevation: 16,
          }),
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.onSurface,
      textAlign: 'center',
    },
    content: {
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
      gap: 20,
      marginBottom: 20,
    },
    calendarSection: {
      flex: 1,
    },
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 8,
    },
    monthYear: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
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
      width: 40,
      textAlign: 'center',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    calendarDay: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
    },
    calendarDaySelected: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.roundness * 1.67,
    },
    calendarDayDisabled: {
      opacity: 0.3,
    },
    calendarDayText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    calendarDayTextSelected: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    calendarDayTextDisabled: {
      color: theme.colors.onSurfaceVariant,
    },
    timeSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
      maxHeight: 300,
    },
    webTimePicker: {
      flexDirection: 'row',
      gap: 8,
      width: '100%',
      maxWidth: 200,
      height: 250,
    },
    timeColumn: {
      flex: 1,
    },
    timeOption: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 4,
      borderRadius: theme.roundness,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 40,
      backgroundColor: theme.colors.surface,
    },
    timeOptionSelected: {
      backgroundColor: theme.colors.primary,
    },
    timeOptionText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    timeOptionTextSelected: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    timePicker: {
      width: '100%',
      height: 200,
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 12,
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.title}>
              {title}
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.calendarSection}>
              <View style={styles.calendarHeader}>
                <IconButton
                  icon="chevron-left"
                  iconColor={theme.colors.onSurface}
                  size={20}
                  onPress={handlePrevMonth}
                />
                <Text variant="titleMedium" style={styles.monthYear}>
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                <IconButton
                  icon="chevron-right"
                  iconColor={theme.colors.onSurface}
                  size={20}
                  onPress={handleNextMonth}
                />
              </View>

              <View style={styles.daysOfWeek}>
                {daysOfWeek.map((day, index) => (
                  <Text key={index} variant="bodySmall" style={styles.dayOfWeekText}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
            </View>

            <View style={styles.timeSection}>
              {Platform.OS === 'web' ? (
                <View style={styles.webTimePicker}>
                  <ScrollView style={styles.timeColumn} showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((hour12) => {
                      const currentHour12 = selectedDate.getHours() % 12 || 12;
                      const isSelected = currentHour12 === hour12;
                      return (
                        <TouchableOpacity
                          key={hour12}
                          style={[
                            styles.timeOption,
                            isSelected && styles.timeOptionSelected,
                          ]}
                          onPress={() => {
                            const newDate = new Date(selectedDate);
                            const isPM = newDate.getHours() >= 12;
                            const hour24 = isPM ? (hour12 === 12 ? 12 : hour12 + 12) : (hour12 === 12 ? 0 : hour12);
                            newDate.setHours(hour24, newDate.getMinutes());
                            setSelectedDate(newDate);
                          }}
                        >
                          <Text
                            style={[
                              styles.timeOptionText,
                              isSelected && styles.timeOptionTextSelected,
                            ]}
                          >
                            {String(hour12).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  <ScrollView style={styles.timeColumn} showsVerticalScrollIndicator={false}>
                    {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((minute) => {
                      const isSelected = selectedDate.getMinutes() === minute;
                      return (
                        <TouchableOpacity
                          key={minute}
                          style={[
                            styles.timeOption,
                            isSelected && styles.timeOptionSelected,
                          ]}
                          onPress={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMinutes(minute);
                            setSelectedDate(newDate);
                          }}
                        >
                          <Text
                            style={[
                              styles.timeOptionText,
                              isSelected && styles.timeOptionTextSelected,
                            ]}
                          >
                            {String(minute).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                  <View style={styles.timeColumn}>
                    <TouchableOpacity
                      style={[
                        styles.timeOption,
                        selectedDate.getHours() < 12 && styles.timeOptionSelected,
                      ]}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        if (newDate.getHours() >= 12) {
                          newDate.setHours(newDate.getHours() - 12);
                        }
                        setSelectedDate(newDate);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          selectedDate.getHours() < 12 && styles.timeOptionTextSelected,
                        ]}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.timeOption,
                        selectedDate.getHours() >= 12 && styles.timeOptionSelected,
                      ]}
                      onPress={() => {
                        const newDate = new Date(selectedDate);
                        if (newDate.getHours() < 12) {
                          newDate.setHours(newDate.getHours() + 12);
                        }
                        setSelectedDate(newDate);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          selectedDate.getHours() >= 12 && styles.timeOptionTextSelected,
                        ]}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <DateTimePicker
                  value={selectedDate}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                  style={styles.timePicker}
                  textColor={theme.colors.onSurface}
                  themeVariant={theme.dark ? 'dark' : 'light'}
                />
              )}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <Button
              mode="text"
              onPress={onClose}
              textColor={theme.colors.primary}
            >
              CANCEL
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              buttonColor={theme.colors.primary}
              textColor={theme.colors.onPrimary}
            >
              OK
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}
