import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from '../components/DateTimePickerModal';

export default function CreateTaskScreen({ navigation }) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState('medium');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);

  const handleSave = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề task');
      return;
    }

    // TODO: Lưu task vào database/state management
    Alert.alert('Thành công', 'Task đã được tạo thành công!', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const formatDateTime = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleStartDateConfirm = (date) => {
    setStartDate(date);
  };

  const handleDueDateConfirm = (date) => {
    setDueDate(date);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Task Mới</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <Text style={styles.label}>Tiêu đề Task *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tiêu đề task..."
            placeholderTextColor="#999"
            value={taskTitle}
            onChangeText={setTaskTitle}
            multiline={false}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Mô tả</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Nhập mô tả chi tiết..."
            placeholderTextColor="#999"
            value={taskDescription}
            onChangeText={setTaskDescription}
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Ngày/giờ bắt đầu</Text>
          <View style={styles.dateTimeContainer}>
            <TextInput
              style={[styles.input, styles.dateTimeInput]}
              placeholder="Chọn ngày/giờ bắt đầu"
              placeholderTextColor="#999"
              value={formatDateTime(startDate)}
              editable={false}
            />
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color="#4CAF50" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Ngày/giờ hết hạn</Text>
          <View style={styles.dateTimeContainer}>
            <TextInput
              style={[styles.input, styles.dateTimeInput]}
              placeholder="Chọn ngày/giờ hết hạn"
              placeholderTextColor="#999"
              value={formatDateTime(dueDate)}
              editable={false}
            />
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDuePicker(true)}
            >
              <Ionicons name="calendar-outline" size={24} color="#FF9800" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Độ ưu tiên</Text>
          <View style={styles.priorityContainer}>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'low' && styles.priorityButtonActive,
                priority === 'low' && styles.priorityButtonLow,
              ]}
              onPress={() => setPriority('low')}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === 'low' && styles.priorityTextActive,
                ]}
              >
                Thấp
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'medium' && styles.priorityButtonActive,
                priority === 'medium' && styles.priorityButtonMedium,
              ]}
              onPress={() => setPriority('medium')}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === 'medium' && styles.priorityTextActive,
                ]}
              >
                Trung bình
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.priorityButton,
                priority === 'high' && styles.priorityButtonActive,
                priority === 'high' && styles.priorityButtonHigh,
              ]}
              onPress={() => setPriority('high')}
            >
              <Text
                style={[
                  styles.priorityText,
                  priority === 'high' && styles.priorityTextActive,
                ]}
              >
                Cao
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Lưu Task</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <DateTimePickerModal
        visible={showStartPicker}
        onClose={() => setShowStartPicker(false)}
        onConfirm={handleStartDateConfirm}
        value={startDate}
        title="Chọn ngày/giờ bắt đầu"
        minimumDate={new Date()}
      />

      <DateTimePickerModal
        visible={showDuePicker}
        onClose={() => setShowDuePicker(false)}
        onConfirm={handleDueDateConfirm}
        value={dueDate}
        title="Chọn ngày/giờ hết hạn"
        minimumDate={startDate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
        }),
  },
  textArea: {
    height: 120,
    paddingTop: 16,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityButtonActive: {
    borderWidth: 2,
  },
  priorityButtonLow: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  priorityButtonMedium: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF8F0',
  },
  priorityButtonHigh: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF0F0',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  priorityTextActive: {
    fontWeight: '600',
    color: '#1A1A1A',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTimeInput: {
    flex: 1,
  },
  dateTimeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

