import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
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
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value.getFullYear(), value.getMonth(), 1) : new Date()
  );

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
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

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isSelected =
        isCurrentMonth && day === selectedDay;
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
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.content}>
            {/* Calendar Section */}
            <View style={styles.calendarSection}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={handlePrevMonth}>
                  <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.monthYear}>
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
                <TouchableOpacity onPress={handleNextMonth}>
                  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.daysOfWeek}>
                {daysOfWeek.map((day, index) => (
                  <Text key={index} style={styles.dayOfWeekText}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>{renderCalendarDays()}</View>
            </View>

            {/* Time Picker Section */}
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
                  textColor="#FFFFFF"
                  themeVariant="dark"
                />
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>NEXT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: 16,
    width: Platform.OS === 'web' ? 600 : '90%',
    maxWidth: 600,
    padding: 20,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }
      : {
          shadowColor: '#000',
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
    backgroundColor: '#4A9EFF',
    borderRadius: 20,
  },
  calendarDayDisabled: {
    opacity: 0.3,
  },
  calendarDayText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarDayTextDisabled: {
    color: '#666',
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
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  timeOptionSelected: {
    backgroundColor: '#4A9EFF',
  },
  timeOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeOptionTextSelected: {
    color: '#FFFFFF',
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
    borderTopColor: '#404040',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A9EFF',
    textTransform: 'uppercase',
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A9EFF',
    textTransform: 'uppercase',
  },
});

