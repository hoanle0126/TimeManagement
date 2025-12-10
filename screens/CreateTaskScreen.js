import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { 
  Text, 
  TextInput, 
  Button, 
  IconButton,
  Chip,
  useTheme,
  SegmentedButtons,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SolarIcon } from 'react-native-solar-icons';
import DateTimePickerModal from '../components/DateTimePickerModal';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function CreateTaskScreen({ navigation, route }) {
  const theme = useTheme();
  const [mode, setMode] = useState('quick'); // 'quick' or 'detailed'
  
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
  
  // Date pickers
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showDuePicker, setShowDuePicker] = useState(false);
  
  // Subtask pickers (index-based)
  const [subtaskPickerIndex, setSubtaskPickerIndex] = useState(null);

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

  const handleSave = () => {
    if (!taskTitle.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề task');
      return;
    }

    if (mode === 'quick') {
      if (!deadline) {
        Alert.alert('Lỗi', 'Vui lòng chọn deadline');
        return;
      }
    } else {
      if (dueDate < startDate) {
        Alert.alert('Lỗi', 'Ngày hết hạn không thể trước ngày bắt đầu');
        return;
      }
    }

    const taskData = {
      title: taskTitle,
      description: taskDescription,
      priority,
      ...(mode === 'quick' 
        ? { 
            due_date: deadline.toISOString(),
            tags: tags,
          }
        : {
            start_date: startDate.toISOString(),
            due_date: dueDate.toISOString(),
            category,
            status,
            progress,
            subtasks: subtasks.filter(st => st.title.trim()).map(st => ({
              title: st.title,
              description: st.description,
              deadline: st.deadline ? st.deadline.toISOString() : null,
              priority: st.priority,
              tags: st.tags,
            })),
          }
      ),
    };

    // TODO: Dispatch createTask action
    console.log('Task data:', taskData);
    
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
          Tạo Task Mới
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
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: isTablet ? 20 : 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.onSurface,
            marginBottom: 8,
          }}>
            Tiêu đề Task *
          </Text>
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
              <Text style={{
                fontSize: 14,
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
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.onSurface,
                marginBottom: 8,
              }}>
                Danh mục
              </Text>
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
            Lưu Task
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
    </SafeAreaView>
  );
}
