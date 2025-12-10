import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  IconButton,
  Chip,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from '../components/DateTimePickerModal';

export default function CreateTaskScreen({ navigation }) {
  const theme = useTheme();
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

    if (dueDate < startDate) {
      Alert.alert('Lỗi', 'Ngày hết hạn không thể trước ngày bắt đầu');
      return;
    }

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
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleStartDateConfirm = (date) => {
    setStartDate(date);
    setShowStartPicker(false);
  };

  const handleDueDateConfirm = (date) => {
    setDueDate(date);
    setShowDuePicker(false);
  };

  const getPriorityColor = (priorityLevel) => {
    switch (priorityLevel) {
      case 'low':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'high':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
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
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    inputContainer: {
      marginBottom: 16,
    },
    textArea: {
      minHeight: 120,
    },
    priorityContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    priorityChip: {
      flex: 1,
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
      borderRadius: theme.roundness,
      backgroundColor: theme.colors.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outline,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.onSurface}
          size={24}
          onPress={handleCancel}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Tạo Task Mới
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formSection}>
          <Text variant="labelLarge" style={styles.label}>
            Tiêu đề Task *
          </Text>
          <TextInput
            label="Nhập tiêu đề task..."
            value={taskTitle}
            onChangeText={setTaskTitle}
            mode="outlined"
            style={styles.inputContainer}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />
        </View>

        <View style={styles.formSection}>
          <Text variant="labelLarge" style={styles.label}>
            Mô tả
          </Text>
          <TextInput
            label="Nhập mô tả chi tiết..."
            value={taskDescription}
            onChangeText={setTaskDescription}
            mode="outlined"
            multiline
            numberOfLines={6}
            style={[styles.inputContainer, styles.textArea]}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />
        </View>

        <View style={styles.formSection}>
          <Text variant="labelLarge" style={styles.label}>
            Ngày/giờ bắt đầu
          </Text>
          <View style={styles.dateTimeContainer}>
            <TextInput
              label="Chọn ngày/giờ bắt đầu"
              value={formatDateTime(startDate)}
              mode="outlined"
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              style={styles.dateTimeInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
            <IconButton
              icon="calendar"
              iconColor={theme.colors.primary}
              size={24}
              onPress={() => setShowStartPicker(true)}
              style={styles.dateTimeButton}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text variant="labelLarge" style={styles.label}>
            Ngày/giờ hết hạn
          </Text>
          <View style={styles.dateTimeContainer}>
            <TextInput
              label="Chọn ngày/giờ hết hạn"
              value={formatDateTime(dueDate)}
              mode="outlined"
              editable={false}
              right={<TextInput.Icon icon="calendar" />}
              style={styles.dateTimeInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />
            <IconButton
              icon="calendar"
              iconColor={theme.colors.secondary}
              size={24}
              onPress={() => setShowDuePicker(true)}
              style={styles.dateTimeButton}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text variant="labelLarge" style={styles.label}>
            Độ ưu tiên
          </Text>
          <View style={styles.priorityContainer}>
            <Chip
              selected={priority === 'low'}
              onPress={() => setPriority('low')}
              selectedColor={theme.colors.success}
              style={styles.priorityChip}
              mode={priority === 'low' ? 'flat' : 'outlined'}
            >
              Thấp
            </Chip>
            <Chip
              selected={priority === 'medium'}
              onPress={() => setPriority('medium')}
              selectedColor={theme.colors.warning}
              style={styles.priorityChip}
              mode={priority === 'medium' ? 'flat' : 'outlined'}
            >
              Trung bình
            </Chip>
            <Chip
              selected={priority === 'high'}
              onPress={() => setPriority('high')}
              selectedColor={theme.colors.error}
              style={styles.priorityChip}
              mode={priority === 'high' ? 'flat' : 'outlined'}
            >
              Cao
            </Chip>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={{ flex: 1, borderRadius: theme.roundness }}
            textColor={theme.colors.onSurfaceVariant}
            borderColor={theme.colors.outline}
          >
            Hủy
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            style={{ flex: 1, borderRadius: theme.roundness }}
          >
            Lưu Task
          </Button>
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
