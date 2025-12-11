import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  IconButton,
  Chip,
  Avatar,
  useTheme,
  SegmentedButtons,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SolarIcon } from 'react-native-solar-icons';
import DateTimePickerModal from '../components/DateTimePickerModal';
import UserSelector from '../components/UserSelector';
import AIAssistant from '../components/AIAssistant';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getFriends } from '../store/slices/friendsSlice';
import { createTask, updateTask, fetchTask } from '../store/slices/tasksSlice';
import { 
  parseTask, 
  suggestPriority, 
  categorizeAndTag, 
  breakDownTask,
  clearAll as clearAI,
} from '../store/slices/aiSlice';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function CreateTaskScreen({ navigation, route }) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { friends } = useAppSelector((state) => state.friends);
  const { currentTask } = useAppSelector((state) => state.tasks);
  const [mode, setMode] = useState('quick'); // 'quick' or 'detailed'
  
  // Edit mode state
  const taskId = route?.params?.taskId;
  const isEditMode = !!taskId;
  const taskData = route?.params?.task || currentTask;
  
  // Quick Add fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [deadline, setDeadline] = useState(null);
  const [priority, setPriority] = useState('medium');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  // Detailed Add fields
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskTagInputs, setSubtaskTagInputs] = useState({});
  
  // Task assignments
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [subtaskUserSelectorIndex, setSubtaskUserSelectorIndex] = useState(null);
  
  // Date pickers
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  
  // Subtask pickers (index-based)
  const [subtaskPickerIndex, setSubtaskPickerIndex] = useState(null);
  
  // AI features
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showPrioritySuggestion, setShowPrioritySuggestion] = useState(false);
  const { 
    parsedTask, 
    prioritySuggestion, 
    categorySuggestion, 
    breakdownResult,
    isLoading: aiLoading 
  } = useAppSelector((state) => state.ai);

  // Dialog states
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogOnConfirm, setDialogOnConfirm] = useState(null);
  const [dialogType, setDialogType] = useState('info'); // 'info', 'success', 'error'

  // Load friends when component mounts
  React.useEffect(() => {
    dispatch(getFriends());
    return () => {
      dispatch(clearAI());
    };
  }, [dispatch]);

  // Load task data if in edit mode
  React.useEffect(() => {
    if (isEditMode && taskId) {
      if (taskData) {
        // Pre-fill form with task data
        setTaskTitle(taskData.title || '');
        setTaskDescription(taskData.description || '');
        setPriority(taskData.priority || 'medium');
        setTags(taskData.tags || []);
        setCategory(taskData.category || '');
        setStatus(taskData.status || 'pending');
        setProgress(taskData.progress || 0);
        setAssignedUsers(taskData.assignedUsers || []);
        
        // Set dates
        if (taskData.deadline) {
          setDeadline(new Date(taskData.deadline));
        } else if (taskData.due_date) {
          setDeadline(new Date(taskData.due_date));
        }
        if (taskData.start_date) {
          setStartDate(new Date(taskData.start_date));
        }
        if (taskData.due_date) {
          setDueDate(new Date(taskData.due_date));
        }
        
        // Set mode based on task type
        if (taskData.taskType === 'detailed' || taskData.task_type === 'detailed') {
          setMode('detailed');
        } else {
          setMode('quick');
        }
        
        // Set subtasks
        if (taskData.subtasks && taskData.subtasks.length > 0) {
          setSubtasks(taskData.subtasks.map((st, index) => ({
            id: st.id || Date.now() + index,
            title: st.title || '',
            description: st.description || '',
            deadline: st.deadline ? new Date(st.deadline) : null,
            priority: st.priority || 'medium',
            tags: st.tags || [],
            assignedUsers: st.assignedUsers || [],
            completed: st.completed || false,
          })));
        }
      } else {
        // Fetch task from API
        dispatch(fetchTask(taskId));
      }
    }
  }, [isEditMode, taskId, taskData, dispatch]);

  // Update form when currentTask is loaded from API
  React.useEffect(() => {
    if (isEditMode && currentTask && currentTask.id === taskId) {
      setTaskTitle(currentTask.title || '');
      setTaskDescription(currentTask.description || '');
      setPriority(currentTask.priority || 'medium');
      setTags(currentTask.tags || []);
      setCategory(currentTask.category || '');
      setStatus(currentTask.status || 'pending');
      setProgress(currentTask.progress || 0);
      setAssignedUsers(currentTask.assignedUsers || []);
      
      if (currentTask.deadline) {
        setDeadline(new Date(currentTask.deadline));
      } else if (currentTask.due_date) {
        setDeadline(new Date(currentTask.due_date));
      }
      if (currentTask.start_date) {
        setStartDate(new Date(currentTask.start_date));
      }
      if (currentTask.due_date) {
        setDueDate(new Date(currentTask.due_date));
      }
      
      if (currentTask.taskType === 'detailed' || currentTask.task_type === 'detailed') {
        setMode('detailed');
      } else {
        setMode('quick');
      }
      
      if (currentTask.subtasks && currentTask.subtasks.length > 0) {
        setSubtasks(currentTask.subtasks.map((st, index) => ({
          id: st.id || Date.now() + index,
          title: st.title || '',
          description: st.description || '',
          deadline: st.deadline ? new Date(st.deadline) : null,
          priority: st.priority || 'medium',
          tags: st.tags || [],
          assignedUsers: st.assignedUsers || [],
          completed: st.completed || false,
        })));
      }
    }
  }, [isEditMode, currentTask, taskId]);

  // Auto-fill form when AI parses task
  React.useEffect(() => {
    if (parsedTask) {
      // Show warning if using rule-based fallback
      if (parsedTask.method === 'rule-based' || parsedTask.warning) {
        setDialogTitle('Thông báo');
        setDialogMessage(parsedTask.warning || 'AI không khả dụng, đang sử dụng phân tích dựa trên từ khóa. Kết quả có thể không chính xác bằng AI.');
        setDialogType('info');
        setDialogOnConfirm(() => () => setDialogVisible(false));
        setDialogVisible(true);
      }
      
      if (parsedTask.title) setTaskTitle(parsedTask.title);
      if (parsedTask.description) setTaskDescription(parsedTask.description);
      if (parsedTask.priority) setPriority(parsedTask.priority);
      if (parsedTask.deadline) {
        const deadlineDate = new Date(parsedTask.deadline);
        setDeadline(deadlineDate);
      }
      if (parsedTask.category) setCategory(parsedTask.category);
      if (parsedTask.tags && parsedTask.tags.length > 0) {
        setTags(parsedTask.tags);
      }
      setShowAIAssistant(false);
    }
  }, [parsedTask]);

  // Auto-suggest priority when title changes
  React.useEffect(() => {
    if (taskTitle.trim().length > 10 && !prioritySuggestion) {
      const timeoutId = setTimeout(() => {
        dispatch(suggestPriority({
          title: taskTitle,
          description: taskDescription,
          deadline: deadline?.toISOString(),
        }));
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [taskTitle, taskDescription, deadline]);

  // Auto-categorize when title changes
  React.useEffect(() => {
    if (taskTitle.trim().length > 10 && !categorySuggestion) {
      const timeoutId = setTimeout(() => {
        dispatch(categorizeAndTag({
          title: taskTitle,
          description: taskDescription,
        }));
      }, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [taskTitle, taskDescription]);

  // Apply priority suggestion
  React.useEffect(() => {
    if (prioritySuggestion && showPrioritySuggestion) {
      setPriority(prioritySuggestion.priority);
      setShowPrioritySuggestion(false);
    }
  }, [prioritySuggestion, showPrioritySuggestion]);

  // Apply category suggestion
  React.useEffect(() => {
    if (categorySuggestion) {
      if (categorySuggestion.category && !category) {
        setCategory(categorySuggestion.category);
      }
      if (categorySuggestion.tags && categorySuggestion.tags.length > 0 && tags.length === 0) {
        setTags(categorySuggestion.tags);
      }
    }
  }, [categorySuggestion]);

  // Handle AI parse
  const handleAIParse = async (text) => {
    console.log('[CreateTaskScreen] handleAIParse called', { text });
    try {
      const result = await dispatch(parseTask(text));
      console.log('[CreateTaskScreen] parseTask result', {
        type: result.type,
        payload: result.payload,
        error: result.error
      });
    } catch (error) {
      console.error('[CreateTaskScreen] handleAIParse error', error);
    }
  };

  // Handle AI breakdown
  const handleAIBreakdown = async () => {
    if (taskTitle.trim() && taskDescription.trim()) {
      await dispatch(breakDownTask({
        title: taskTitle,
        description: taskDescription,
      }));
    }
  };

  // Apply breakdown result
  React.useEffect(() => {
    if (breakdownResult && breakdownResult.subtasks) {
      const newSubtasks = breakdownResult.subtasks.map((st, index) => ({
        id: Date.now() + index,
        title: st.title || '',
        description: st.description || '',
        deadline: null,
        priority: 'medium',
        tags: [],
        assignedUsers: [],
      }));
      setSubtasks(newSubtasks);
      setDialogTitle('Thành công');
      setDialogMessage(`Đã tạo ${newSubtasks.length} subtasks tự động. Bạn có thể chỉnh sửa chúng.`);
      setDialogType('success');
      setDialogOnConfirm(() => () => setDialogVisible(false));
      setDialogVisible(true);
    }
  }, [breakdownResult]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, {
      id: Date.now(),
      title: '',
      description: '',
      deadline: null,
      priority: 'medium',
      tags: [],
    }]);
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== id));
  };

  const handleUpdateSubtask = (id, field, value) => {
    setSubtasks(subtasks.map(subtask => 
      subtask.id === id ? { ...subtask, [field]: value } : subtask
    ));
  };

  const handleAddSubtaskTag = (subtaskId, tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag) {
      setSubtasks(subtasks.map(subtask => {
        if (subtask.id === subtaskId && !subtask.tags.includes(trimmedTag)) {
          return { ...subtask, tags: [...subtask.tags, trimmedTag] };
        }
        return subtask;
      }));
      // Clear input
      setSubtaskTagInputs({ ...subtaskTagInputs, [subtaskId]: '' });
    }
  };

  const handleRemoveSubtaskTag = (subtaskId, tagToRemove) => {
    setSubtasks(subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        return { ...subtask, tags: subtask.tags.filter(tag => tag !== tagToRemove) };
      }
      return subtask;
    }));
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

  const formatDate = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
    if (!taskTitle.trim()) {
      setDialogTitle('Lỗi');
      setDialogMessage('Vui lòng nhập tiêu đề task');
      setDialogType('error');
      setDialogOnConfirm(() => () => setDialogVisible(false));
      setDialogVisible(true);
      return;
    }

    if (mode === 'quick') {
      if (!deadline) {
        setDialogTitle('Lỗi');
        setDialogMessage('Vui lòng chọn deadline');
        setDialogType('error');
        setDialogOnConfirm(() => () => setDialogVisible(false));
        setDialogVisible(true);
        return;
      }
    } else {
      if (dueDate < startDate) {
        setDialogTitle('Lỗi');
        setDialogMessage('Ngày hết hạn không thể trước ngày bắt đầu');
        setDialogType('error');
        setDialogOnConfirm(() => () => setDialogVisible(false));
        setDialogVisible(true);
        return;
      }
    }

    const taskData = {
      title: taskTitle.trim(),
      description: taskDescription.trim() || null,
      priority,
      task_type: mode,
      ...(mode === 'quick' 
        ? { 
            due_date: deadline.toISOString(),
            tags: tags.length > 0 ? tags : null,
            assigned_users: assignedUsers.length > 0 ? assignedUsers : null,
          }
        : {
            start_date: startDate.toISOString(),
            due_date: dueDate.toISOString(),
            category: category.trim() || null,
            status,
            progress,
            subtasks: subtasks.filter(st => st.title.trim()).map((st) => ({
              title: st.title.trim(),
              description: st.description.trim() || null,
              deadline: st.deadline ? st.deadline.toISOString() : null,
              priority: st.priority,
              tags: st.tags && st.tags.length > 0 ? st.tags : null,
              assigned_users: st.assignedUsers && st.assignedUsers.length > 0 ? st.assignedUsers : null,
            })),
            assigned_users: assignedUsers.length > 0 ? assignedUsers : null,
          }
      ),
    };

    try {
      let result;
      if (isEditMode && taskId) {
        // Update existing task
        result = await dispatch(updateTask({ taskId, taskData }));
      } else {
        // Create new task
        result = await dispatch(createTask(taskData));
      }
      
      const actionType = isEditMode ? updateTask : createTask;
      
      if (actionType.fulfilled.match(result)) {
        // Success - navigate to Home
        setDialogTitle('Thành công');
        setDialogMessage(isEditMode ? 'Task đã được cập nhật thành công!' : 'Task đã được tạo thành công!');
        setDialogType('success');
        setDialogOnConfirm(() => () => {
          setDialogVisible(false);
          // Navigate to Home (MainTabs)
          navigation.navigate('MainTabs', { screen: 'Home' });
        });
        setDialogVisible(true);
      } else {
        // Error
        const errorMessage = result.payload?.message || result.payload?.error || 
          (isEditMode ? 'Không thể cập nhật task. Vui lòng thử lại.' : 'Không thể tạo task. Vui lòng thử lại.');
        setDialogTitle('Lỗi');
        setDialogMessage(errorMessage);
        setDialogType('error');
        setDialogOnConfirm(() => () => setDialogVisible(false));
        setDialogVisible(true);
      }
    } catch (error) {
      console.error('[CreateTaskScreen] handleSave error:', error);
      setDialogTitle('Lỗi');
      setDialogMessage(isEditMode ? 'Đã xảy ra lỗi khi cập nhật task. Vui lòng thử lại.' : 'Đã xảy ra lỗi khi tạo task. Vui lòng thử lại.');
      setDialogType('error');
      setDialogOnConfirm(() => () => setDialogVisible(false));
      setDialogVisible(true);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getPriorityColor = (priorityLevel) => {
    switch (priorityLevel) {
      case 'low':
        return theme.colors.primary;
      case 'medium':
        return theme.colors.warning || '#FF9800';
      case 'high':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
      }}>
        <IconButton
          icon="arrow-left"
          iconColor={theme.colors.onSurface}
          size={24}
          onPress={handleCancel}
        />
        <Text style={{
          fontSize: 18,
          fontWeight: '600',
          color: theme.colors.onSurface,
        }}>
          {isEditMode ? 'Sửa Task' : 'Tạo Task Mới'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Mode Selector */}
      <View style={{
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
      }}>
        <SegmentedButtons
          value={mode}
          onValueChange={setMode}
          buttons={[
            {
              value: 'quick',
              label: 'Nhanh',
              icon: 'lightning-bolt',
            },
            {
              value: 'detailed',
              label: 'Chi tiết',
              icon: 'format-list-bulleted',
            },
          ]}
          style={{
            backgroundColor: theme.colors.surfaceVariant,
          }}
        />
        {/* AI Assistant Button */}
        <Button
          mode="contained-tonal"
          onPress={() => setShowAIAssistant(true)}
          icon="auto-fix"
          style={{
            marginTop: 12,
            backgroundColor: theme.colors.primaryContainer,
          }}
          textColor={theme.colors.onPrimaryContainer}
        >
          🤖 Tạo bằng AI (Nói hoặc nhập tự nhiên)
        </Button>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: isTablet ? 20 : 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={{ marginBottom: 24 }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: theme.colors.onSurface,
            }}>
              Tiêu đề Task *
            </Text>
            {prioritySuggestion && (
              <TouchableOpacity
                onPress={() => {
                  setDialogTitle('Đề xuất ưu tiên từ AI');
                  setDialogMessage(`AI đề xuất: ${prioritySuggestion.priority === 'high' ? 'Cao' : prioritySuggestion.priority === 'medium' ? 'Trung bình' : 'Thấp'}\n\n${prioritySuggestion.reason || ''}\n\nBạn có muốn áp dụng không?`);
                  setDialogType('info');
                  setDialogOnConfirm(() => () => {
                    setPriority(prioritySuggestion.priority);
                    setDialogVisible(false);
                  });
                  setDialogVisible(true);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  backgroundColor: theme.colors.primaryContainer,
                  borderRadius: theme.roundness,
                }}
              >
                <SolarIcon name="MagicStick" size={14} color={theme.colors.onPrimaryContainer} type="outline" />
                <Text style={{
                  fontSize: 11,
                  color: theme.colors.onPrimaryContainer,
                  fontWeight: '600',
                }}>
                  AI: {prioritySuggestion.priority === 'high' ? 'Cao' : prioritySuggestion.priority === 'medium' ? 'TB' : 'Thấp'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            label="Nhập tiêu đề task..."
            value={taskTitle}
            onChangeText={setTaskTitle}
            mode="outlined"
            style={{
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: theme.roundness,
            }}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />
        </View>

        {/* Description */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.onSurface,
            marginBottom: 8,
          }}>
            Mô tả
          </Text>
          <TextInput
            label="Nhập mô tả..."
            value={taskDescription}
            onChangeText={setTaskDescription}
            mode="outlined"
            multiline
            numberOfLines={mode === 'quick' ? 4 : 6}
            style={{
              backgroundColor: theme.colors.surfaceVariant,
              borderRadius: theme.roundness,
              minHeight: mode === 'quick' ? 80 : 120,
            }}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
          />
        </View>

        {mode === 'quick' ? (
          /* Quick Add Mode */
          <>
            {/* Deadline */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Deadline *
              </Text>
              <TouchableOpacity
                onPress={() => setShowDeadlinePicker(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: theme.roundness,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{
                  flex: 1,
                  fontSize: 16,
                  color: deadline ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                }}>
                  {deadline ? formatDateTime(deadline) : 'Chọn deadline...'}
                </Text>
                <SolarIcon 
                  name="Calendar" 
                  size={20} 
                  color={theme.colors.primary} 
                  type="outline" 
                />
              </TouchableOpacity>
            </View>

            {/* Priority */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Độ ưu tiên
              </Text>
              <View style={{
                flexDirection: 'row',
                gap: 12,
              }}>
                {['low', 'medium', 'high'].map((level) => (
                  <Chip
                    key={level}
                    selected={priority === level}
                    onPress={() => setPriority(level)}
                    style={{
                      flex: 1,
                      backgroundColor: priority === level 
                        ? getPriorityColor(level) + '20' 
                        : 'transparent',
                    }}
                    textStyle={{
                      color: priority === level 
                        ? getPriorityColor(level) 
                        : theme.colors.onSurfaceVariant,
                      fontWeight: priority === level ? '600' : '400',
                    }}
                    mode={priority === level ? 'flat' : 'outlined'}
                  >
                    {level === 'high' ? 'Cao' : level === 'medium' ? 'Trung bình' : 'Thấp'}
                  </Chip>
                ))}
              </View>
            </View>

            {/* Tags */}
            <View style={{ marginBottom: 24 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                }}>
                  Tags
                </Text>
                {categorySuggestion && categorySuggestion.tags && categorySuggestion.tags.length > 0 && tags.length === 0 && (
                  <TouchableOpacity
                    onPress={() => setTags(categorySuggestion.tags)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: theme.colors.secondaryContainer,
                      borderRadius: theme.roundness,
                    }}
                  >
                    <SolarIcon name="MagicStick" size={14} color={theme.colors.onSecondaryContainer} type="outline" />
                    <Text style={{
                      fontSize: 11,
                      color: theme.colors.onSecondaryContainer,
                      fontWeight: '600',
                    }}>
                      AI: {categorySuggestion.tags.length} tags
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={{
                flexDirection: 'row',
                gap: 8,
                marginBottom: 8,
              }}>
                <TextInput
                  label="Nhập tag và nhấn Enter..."
                  value={tagInput}
                  onChangeText={setTagInput}
                  mode="outlined"
                  onSubmitEditing={handleAddTag}
                  style={{
                    flex: 1,
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: theme.roundness,
                  }}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  right={
                    <TextInput.Icon 
                      icon="plus" 
                      onPress={handleAddTag}
                    />
                  }
                />
              </View>
              {tags.length > 0 && (
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                }}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      onClose={() => handleRemoveTag(tag)}
                      style={{
                        backgroundColor: theme.colors.primaryContainer,
                      }}
                      textStyle={{
                        color: theme.colors.onPrimaryContainer,
                      }}
                    >
                      {tag}
                    </Chip>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          /* Detailed Add Mode */
          <>
            {/* Start Date */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Ngày bắt đầu
              </Text>
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: theme.roundness,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{
                  flex: 1,
                  fontSize: 16,
                  color: theme.colors.onSurface,
                }}>
                  {formatDateTime(startDate)}
                </Text>
                <SolarIcon 
                  name="Calendar" 
                  size={20} 
                  color={theme.colors.primary} 
                  type="outline" 
                />
              </TouchableOpacity>
            </View>

            {/* Due Date */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Ngày hết hạn
              </Text>
              <TouchableOpacity
                onPress={() => setShowDuePicker(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: theme.roundness,
                  borderWidth: 1,
                  borderColor: theme.colors.outline,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{
                  flex: 1,
                  fontSize: 16,
                  color: theme.colors.onSurface,
                }}>
                  {formatDateTime(dueDate)}
                </Text>
                <SolarIcon 
                  name="Calendar" 
                  size={20} 
                  color={theme.colors.primary} 
                  type="outline" 
                />
              </TouchableOpacity>
            </View>

            {/* Category */}
            <View style={{ marginBottom: 24 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                }}>
                  Danh mục
                </Text>
                {categorySuggestion && categorySuggestion.category && !category && (
                  <TouchableOpacity
                    onPress={() => setCategory(categorySuggestion.category)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      backgroundColor: theme.colors.secondaryContainer,
                      borderRadius: theme.roundness,
                    }}
                  >
                    <SolarIcon name="MagicStick" size={14} color={theme.colors.onSecondaryContainer} type="outline" />
                    <Text style={{
                      fontSize: 11,
                      color: theme.colors.onSecondaryContainer,
                      fontWeight: '600',
                    }}>
                      AI: {categorySuggestion.category}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <TextInput
                label="Nhập danh mục..."
                value={category}
                onChangeText={setCategory}
                mode="outlined"
                style={{
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: theme.roundness,
                }}
                outlineColor={theme.colors.outline}
                activeOutlineColor={theme.colors.primary}
              />
            </View>

            {/* Priority */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Độ ưu tiên
              </Text>
              <View style={{
                flexDirection: 'row',
                gap: 12,
              }}>
                {['low', 'medium', 'high'].map((level) => (
                  <Chip
                    key={level}
                    selected={priority === level}
                    onPress={() => setPriority(level)}
                    style={{
                      flex: 1,
                      backgroundColor: priority === level 
                        ? getPriorityColor(level) + '20' 
                        : 'transparent',
                    }}
                    textStyle={{
                      color: priority === level 
                        ? getPriorityColor(level) 
                        : theme.colors.onSurfaceVariant,
                      fontWeight: priority === level ? '600' : '400',
                    }}
                    mode={priority === level ? 'flat' : 'outlined'}
                  >
                    {level === 'high' ? 'Cao' : level === 'medium' ? 'Trung bình' : 'Thấp'}
                  </Chip>
                ))}
              </View>
            </View>

            {/* Status */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Trạng thái
              </Text>
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
              }}>
                {[
                  { value: 'pending', label: 'Chờ xử lý' },
                  { value: 'in_progress', label: 'Đang làm' },
                  { value: 'completed', label: 'Hoàn thành' },
                ].map((statusOption) => (
                  <Chip
                    key={statusOption.value}
                    selected={status === statusOption.value}
                    onPress={() => setStatus(statusOption.value)}
                    style={{
                      backgroundColor: status === statusOption.value 
                        ? theme.colors.primaryContainer 
                        : 'transparent',
                    }}
                    textStyle={{
                      color: status === statusOption.value 
                        ? theme.colors.onPrimaryContainer 
                        : theme.colors.onSurfaceVariant,
                      fontWeight: status === statusOption.value ? '600' : '400',
                    }}
                    mode={status === statusOption.value ? 'flat' : 'outlined'}
                  >
                    {statusOption.label}
                  </Chip>
                ))}
              </View>
            </View>

            {/* Progress */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Tiến độ: {progress}%
              </Text>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
                {[0, 25, 50, 75, 100].map((value) => (
                  <Chip
                    key={value}
                    selected={progress === value}
                    onPress={() => setProgress(value)}
                    style={{
                      flex: 1,
                      backgroundColor: progress === value 
                        ? theme.colors.primaryContainer 
                        : 'transparent',
                    }}
                    textStyle={{
                      color: progress === value 
                        ? theme.colors.onPrimaryContainer 
                        : theme.colors.onSurfaceVariant,
                      fontWeight: progress === value ? '600' : '400',
                    }}
                    mode={progress === value ? 'flat' : 'outlined'}
                  >
                    {value}%
                  </Chip>
                ))}
              </View>
            </View>

            {/* Assign Users to Task */}
            <View style={{ marginBottom: 24 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                }}>
                  Người tham gia
                </Text>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => setShowUserSelector(true)}
                  icon="account-plus"
                  textColor={theme.colors.primary}
                  style={{
                    borderColor: theme.colors.primary,
                  }}
                >
                  Thêm người
                </Button>
              </View>
              {assignedUsers.length > 0 ? (
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 8,
                }}>
                  {assignedUsers.map((user, index) => (
                    <Chip
                      key={index}
                      mode="flat"
                      onClose={() => {
                        setAssignedUsers(assignedUsers.filter((_, i) => i !== index));
                      }}
                      avatar={
                        user.user_id ? (
                          <Avatar.Text
                            size={24}
                            label={user.name?.charAt(0).toUpperCase() || 'U'}
                            style={{
                              backgroundColor: theme.colors.primary,
                            }}
                            labelStyle={{
                              color: theme.colors.onPrimary,
                              fontSize: 12,
                            }}
                          />
                        ) : null
                      }
                      style={{
                        backgroundColor: theme.colors.primaryContainer,
                      }}
                      textStyle={{
                        color: theme.colors.onPrimaryContainer,
                        fontSize: 12,
                      }}
                    >
                      {user.name || user.email}
                    </Chip>
                  ))}
                </View>
              ) : (
                <Text style={{
                  fontSize: 12,
                  color: theme.colors.onSurfaceVariant,
                  fontStyle: 'italic',
                }}>
                  Chưa có người tham gia. Nhấn "Thêm người" để thêm.
                </Text>
              )}
            </View>

            {/* Subtasks */}
            <View style={{ marginBottom: 24 }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: theme.colors.onSurface,
                }}>
                  Tasks phụ ({subtasks.length})
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {taskTitle.trim() && taskDescription.trim() && (
                    <Button
                      mode="contained-tonal"
                      onPress={handleAIBreakdown}
                      icon="auto-fix"
                      compact
                      style={{
                        borderRadius: theme.roundness,
                        backgroundColor: theme.colors.secondaryContainer,
                      }}
                      textColor={theme.colors.onSecondaryContainer}
                      loading={aiLoading}
                      disabled={aiLoading}
                    >
                      AI Chia nhỏ
                    </Button>
                  )}
                  <Button
                    mode="outlined"
                    onPress={handleAddSubtask}
                    icon="plus"
                    compact
                    style={{
                      borderRadius: theme.roundness,
                    }}
                    textColor={theme.colors.primary}
                    borderColor={theme.colors.primary}
                  >
                    Thêm task phụ
                  </Button>
                </View>
              </View>

              {subtasks.length === 0 ? (
                <View style={{
                  padding: 20,
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: theme.roundness,
                }}>
                  <Text style={{
                    fontSize: 14,
                    color: theme.colors.onSurfaceVariant,
                    textAlign: 'center',
                  }}>
                    Chưa có task phụ nào. Nhấn "Thêm task phụ" để thêm.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 16 }}>
                  {subtasks.map((subtask, index) => (
                    <View
                      key={subtask.id}
                      style={{
                        padding: 16,
                        backgroundColor: theme.colors.surfaceVariant,
                        borderRadius: theme.roundness,
                        borderWidth: 1,
                        borderColor: theme.colors.outline,
                      }}
                    >
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: theme.colors.onSurface,
                        }}>
                          Task phụ #{index + 1}
                        </Text>
                        <IconButton
                          icon="close"
                          iconColor={theme.colors.error}
                          size={20}
                          onPress={() => {
                            handleRemoveSubtask(subtask.id);
                            // Remove tag input for this subtask
                            const newInputs = { ...subtaskTagInputs };
                            delete newInputs[subtask.id];
                            setSubtaskTagInputs(newInputs);
                          }}
                        />
                      </View>

                      {/* Subtask Title */}
                      <View style={{ marginBottom: 12 }}>
                        <TextInput
                          label="Tiêu đề task phụ *"
                          value={subtask.title}
                          onChangeText={(text) => handleUpdateSubtask(subtask.id, 'title', text)}
                          mode="outlined"
                          style={{
                            backgroundColor: theme.colors.surface,
                            borderRadius: theme.roundness,
                          }}
                          outlineColor={theme.colors.outline}
                          activeOutlineColor={theme.colors.primary}
                        />
                      </View>

                      {/* Subtask Description */}
                      <View style={{ marginBottom: 12 }}>
                        <TextInput
                          label="Mô tả"
                          value={subtask.description}
                          onChangeText={(text) => handleUpdateSubtask(subtask.id, 'description', text)}
                          mode="outlined"
                          multiline
                          numberOfLines={3}
                          style={{
                            backgroundColor: theme.colors.surface,
                            borderRadius: theme.roundness,
                            minHeight: 60,
                          }}
                          outlineColor={theme.colors.outline}
                          activeOutlineColor={theme.colors.primary}
                        />
                      </View>

                      {/* Subtask Deadline */}
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: theme.colors.onSurface,
                          marginBottom: 8,
                        }}>
                          Deadline
                        </Text>
                        <TouchableOpacity
                          onPress={() => {
                            setSubtaskPickerIndex(index);
                            setShowDeadlinePicker(true);
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: theme.colors.surface,
                            borderRadius: theme.roundness,
                            borderWidth: 1,
                            borderColor: theme.colors.outline,
                            paddingHorizontal: 12,
                            paddingVertical: 10,
                          }}
                        >
                          <Text style={{
                            flex: 1,
                            fontSize: 14,
                            color: subtask.deadline ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
                          }}>
                            {subtask.deadline ? formatDateTime(subtask.deadline) : 'Chọn deadline...'}
                          </Text>
                          <SolarIcon 
                            name="Calendar" 
                            size={18} 
                            color={theme.colors.primary} 
                            type="outline" 
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Subtask Priority */}
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: theme.colors.onSurface,
                          marginBottom: 8,
                        }}>
                          Độ ưu tiên
                        </Text>
                        <View style={{
                          flexDirection: 'row',
                          gap: 8,
                        }}>
                          {['low', 'medium', 'high'].map((level) => (
                            <Chip
                              key={level}
                              selected={subtask.priority === level}
                              onPress={() => handleUpdateSubtask(subtask.id, 'priority', level)}
                              style={{
                                flex: 1,
                                backgroundColor: subtask.priority === level 
                                  ? getPriorityColor(level) + '20' 
                                  : 'transparent',
                              }}
                              textStyle={{
                                color: subtask.priority === level 
                                  ? getPriorityColor(level) 
                                  : theme.colors.onSurfaceVariant,
                                fontWeight: subtask.priority === level ? '600' : '400',
                                fontSize: 11,
                              }}
                              mode={subtask.priority === level ? 'flat' : 'outlined'}
                            >
                              {level === 'high' ? 'Cao' : level === 'medium' ? 'TB' : 'Thấp'}
                            </Chip>
                          ))}
                        </View>
                      </View>

                      {/* Subtask Tags */}
                      <View>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: theme.colors.onSurface,
                          marginBottom: 8,
                        }}>
                          Tags
                        </Text>
                        <View style={{
                          flexDirection: 'row',
                          gap: 8,
                          marginBottom: 8,
                        }}>
                          <TextInput
                            label="Nhập tag..."
                            value={subtaskTagInputs[subtask.id] || ''}
                            onChangeText={(text) => {
                              setSubtaskTagInputs({ ...subtaskTagInputs, [subtask.id]: text });
                            }}
                            mode="outlined"
                            onSubmitEditing={() => {
                              handleAddSubtaskTag(subtask.id, subtaskTagInputs[subtask.id] || '');
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: theme.colors.surface,
                              borderRadius: theme.roundness,
                            }}
                            outlineColor={theme.colors.outline}
                            activeOutlineColor={theme.colors.primary}
                            right={
                              <TextInput.Icon 
                                icon="plus" 
                                onPress={() => {
                                  handleAddSubtaskTag(subtask.id, subtaskTagInputs[subtask.id] || '');
                                }}
                              />
                            }
                          />
                        </View>
                        {subtask.tags && subtask.tags.length > 0 && (
                          <View style={{
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                            gap: 6,
                          }}>
                            {subtask.tags.map((tag, tagIndex) => (
                              <Chip
                                key={tagIndex}
                                onClose={() => handleRemoveSubtaskTag(subtask.id, tag)}
                                style={{
                                  backgroundColor: theme.colors.primaryContainer,
                                  height: 28,
                                }}
                                textStyle={{
                                  color: theme.colors.onPrimaryContainer,
                                  fontSize: 11,
                                }}
                                compact
                              >
                                {tag}
                              </Chip>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Buttons */}
        <View style={{
          flexDirection: 'row',
          gap: 12,
          marginTop: 8,
        }}>
          <Button
            mode="outlined"
            onPress={handleCancel}
            style={{
              flex: 1,
              borderRadius: theme.roundness,
            }}
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
            style={{
              flex: 1,
              borderRadius: theme.roundness,
            }}
          >
            {isEditMode ? 'Cập nhật Task' : 'Lưu Task'}
          </Button>
        </View>
      </ScrollView>

      {/* Date Pickers */}
      <DateTimePickerModal
        visible={showDeadlinePicker}
        onClose={() => {
          setShowDeadlinePicker(false);
          setSubtaskPickerIndex(null);
        }}
        onConfirm={(date) => {
          if (subtaskPickerIndex !== null) {
            // Update subtask deadline
            const subtask = subtasks[subtaskPickerIndex];
            if (subtask) {
              handleUpdateSubtask(subtask.id, 'deadline', date);
            }
            setSubtaskPickerIndex(null);
          } else {
            // Update main task deadline
            setDeadline(date);
          }
          setShowDeadlinePicker(false);
        }}
        value={
          subtaskPickerIndex !== null && subtasks[subtaskPickerIndex]?.deadline
            ? subtasks[subtaskPickerIndex].deadline
            : deadline || new Date()
        }
        title={subtaskPickerIndex !== null ? "Chọn deadline cho task phụ" : "Chọn deadline"}
        minimumDate={new Date()}
      />

      <DateTimePickerModal
        visible={showStartPicker}
        onClose={() => setShowStartPicker(false)}
        onConfirm={(date) => {
          setStartDate(date);
          setShowStartPicker(false);
        }}
        value={startDate}
        title="Chọn ngày/giờ bắt đầu"
        minimumDate={new Date()}
      />

      <DateTimePickerModal
        visible={showDuePicker}
        onClose={() => setShowDuePicker(false)}
        onConfirm={(date) => {
          setDueDate(date);
          setShowDuePicker(false);
        }}
        value={dueDate}
        title="Chọn ngày/giờ hết hạn"
        minimumDate={startDate}
      />

      {/* User Selector for Main Task */}
      <UserSelector
        visible={showUserSelector}
        onClose={() => setShowUserSelector(false)}
        selectedUsers={assignedUsers}
        friends={friends}
        onSelectUsers={setAssignedUsers}
        title="Chọn người tham gia task"
        allowEmail={true}
      />

      {/* User Selector for Subtask */}
      {subtaskUserSelectorIndex !== null && (
        <UserSelector
          visible={subtaskUserSelectorIndex !== null}
          onClose={() => setSubtaskUserSelectorIndex(null)}
          selectedUsers={subtasks[subtaskUserSelectorIndex]?.assignedUsers || []}
          friends={friends}
          onSelectUsers={(users) => {
            const updatedSubtasks = [...subtasks];
            updatedSubtasks[subtaskUserSelectorIndex] = {
              ...updatedSubtasks[subtaskUserSelectorIndex],
              assignedUsers: users,
            };
            setSubtasks(updatedSubtasks);
            setSubtaskUserSelectorIndex(null);
          }}
          title={`Chọn người tham gia task phụ #${subtaskUserSelectorIndex + 1}`}
          allowEmail={true}
        />
      )}

      {/* AI Assistant Modal */}
      <AIAssistant
        visible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        onParseComplete={handleAIParse}
        isLoading={aiLoading}
      />

      {/* Dialog */}
      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: theme.roundness * 2,
          }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>
            {dialogTitle}
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={{ color: theme.colors.onSurfaceVariant }}>
              {dialogMessage}
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            {dialogType === 'info' && (
              <>
                <Button
                  onPress={() => setDialogVisible(false)}
                  textColor={theme.colors.onSurfaceVariant}
                >
                  Không
                </Button>
                <Button
                  onPress={() => {
                    if (dialogOnConfirm) dialogOnConfirm();
                  }}
                  textColor={theme.colors.primary}
                >
                  Có
                </Button>
              </>
            )}
            {dialogType !== 'info' && (
              <Button
                onPress={() => {
                  if (dialogOnConfirm) dialogOnConfirm();
                  else setDialogVisible(false);
                }}
                textColor={dialogType === 'success' ? theme.colors.primary : theme.colors.error}
              >
                OK
              </Button>
            )}
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}
